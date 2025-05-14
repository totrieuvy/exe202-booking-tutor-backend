const db = require("../models/index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error:", error);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

// Validation functions
const validateFullName = (fullName) => {
  if (!fullName || typeof fullName !== "string") {
    return "Full name is required and must be a string";
  }
  if (fullName.length < 2) {
    return "Full name must be at least 2 characters long";
  }
  if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    return "Full name can only contain letters and spaces";
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return "Email is required and must be a string";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email format";
  }
  return null;
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return "Phone number is required and must be a string";
  }
  if (!/^\+?\d{10,12}$/.test(phone)) {
    return "Phone number must be 10-12 digits, optionally starting with +";
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required and must be a string";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
  return null;
};

const validateOtp = (otp) => {
  if (!otp || typeof otp !== "string") {
    return "OTP is required and must be a string";
  }
  if (!/^\d{6}$/.test(otp)) {
    return "OTP must be a 6-digit number";
  }
  return null;
};

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const certificationService = {
  async registerTutor({ fullName, email, phone, password }) {
    try {
      // Validate inputs
      const fullNameError = validateFullName(fullName);
      if (fullNameError) {
        return { status: 400, message: fullNameError };
      }

      const emailError = validateEmail(email);
      if (emailError) {
        return { status: 400, message: emailError };
      }

      const phoneError = validatePhone(phone);
      if (phoneError) {
        return { status: 400, message: phoneError };
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        return { status: 400, message: passwordError };
      }

      // Check for existing account
      const existingAccount = await db.Account.findOne({
        $or: [{ email }, { phone }, { fullName }],
      });
      if (existingAccount) {
        if (existingAccount.email === email) {
          return { status: 400, message: "Email is already registered" };
        }
        if (existingAccount.phone === phone) {
          return { status: 400, message: "Phone number is already registered" };
        }
        if (existingAccount.fullName === fullName) {
          return { status: 400, message: "Full name is already taken" };
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate OTP and expiration
      const otp = generateOtp();
      const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new account with Tutor role
      const newAccount = new db.Account({
        fullName,
        email,
        phone,
        password: hashedPassword,
        status: "Inactive",
        role: "Tutor",
        otp,
        otpExpiration,
      });

      await newAccount.save();

      // Send OTP email
      const templatePath = path.join(__dirname, "../templates/otpEmail.html");
      if (!fs.existsSync(templatePath)) {
        console.error("OTP email template not found at:", templatePath);
        return { status: 500, message: "Email template not found" };
      }

      let htmlContent = fs.readFileSync(templatePath, "utf8");
      htmlContent = htmlContent
        .replace("{{fullName}}", fullName)
        .replace("{{otp}}", otp)
        .replace("{{verifyLink}}", `${process.env.FRONTEND_URL}/verify-otp?email=${email}`);

      try {
        await transporter.sendMail({
          from: '"Booking Tutor" <no-reply@bookingtutor.com>',
          to: email,
          subject: "Verify Your Booking Tutor Account",
          html: htmlContent,
        });
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        return { status: 500, message: "Failed to send OTP email. Please try again later." };
      }

      return { status: 201, message: "Tutor account created successfully! Please check your email for OTP." };
    } catch (error) {
      console.error("Tutor registration error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async verifyTutorOtp(email, otp) {
    try {
      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        return { status: 400, message: emailError };
      }

      const otpError = validateOtp(otp);
      if (otpError) {
        return { status: 400, message: otpError };
      }

      // Find account
      const account = await db.Account.findOne({ email });
      if (!account) {
        return { status: 404, message: "Account not found" };
      }

      // Check if account is already active
      if (account.status === "Active") {
        return { status: 400, message: "Account is already verified" };
      }

      // Verify role
      if (account.role !== "Tutor") {
        return { status: 403, message: "This endpoint is for tutor accounts only" };
      }

      // Check OTP validity
      if (account.otp !== otp) {
        return { status: 400, message: "Invalid OTP" };
      }

      if (account.otpExpiration < new Date()) {
        return { status: 400, message: "OTP has expired. Please request a new one." };
      }

      // Update account status
      account.status = "Active";
      account.otp = null;
      account.otpExpiration = null;
      await account.save();

      // Send welcome email
      const templatePath = path.join(__dirname, "../templates/welcomeEmail.html");
      if (!fs.existsSync(templatePath)) {
        console.error("Welcome email template not found at:", templatePath);
        // Proceed without failing, as account is already verified
      } else {
        let htmlContent = fs.readFileSync(templatePath, "utf8").replace("{{fullName}}", account.fullName);
        try {
          await transporter.sendMail({
            from: '"Booking Tutor" <no-reply@bookingtutor.com>',
            to: email,
            subject: "Welcome to Booking Tutor!",
            html: htmlContent,
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the request, as account is already verified
        }
      }

      return { status: 200, message: "Tutor account verified successfully!" };
    } catch (error) {
      console.error("Tutor OTP verification error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async registerCertification({ name, description, image, experience, userId }) {
    try {
      // Validate certification inputs
      if (!name || typeof name !== "string") {
        return { status: 400, message: "Certification name is required and must be a string" };
      }
      if (!description || typeof description !== "string") {
        return { status: 400, message: "Description is required and must be a string" };
      }
      if (!Array.isArray(image) || image.length === 0) {
        return { status: 400, message: "At least one image URL is required" };
      }
      if (!image.every((url) => typeof url === "string" && url.startsWith("http"))) {
        return { status: 400, message: "All image URLs must be valid strings starting with 'http'" };
      }
      if (typeof experience !== "number" || experience < 0) {
        return { status: 400, message: "Experience must be a non-negative number" };
      }

      // Verify account exists
      const account = await db.Account.findById(userId);
      if (!account) {
        return { status: 404, message: "Account not found" };
      }
      if (account.status !== "Active") {
        return { status: 403, message: "Account must be active to create a certification" };
      }
      if (account.role !== "Tutor") {
        return { status: 403, message: "Only tutors can create certifications" };
      }

      // Create new certification
      const certification = new db.Certification({
        name,
        description,
        image,
        experience,
        isChecked: false,
        isCanTeach: false,
        createBy: userId, // Use userId from token
      });
      await certification.save();

      return {
        status: 201,
        message: "Certification created successfully",
        data: {
          certification: {
            _id: certification._id,
            name: certification.name,
            description: certification.description,
            image: certification.image,
            experience: certification.experience,
            isChecked: certification.isChecked,
            isCanTeach: certification.isCanTeach,
            createBy: certification.createBy,
          },
        },
      };
    } catch (error) {
      console.error("Certification creation error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async getTutorsWithCertifications() {
    try {
      // Find all Tutor accounts, sorted by createdAt in descending order
      const tutors = await db.Account.find({ role: "Tutor" })
        .select("_id fullName email phone role status createdAt")
        .sort({ createdAt: -1 });

      if (!tutors || tutors.length === 0) {
        return {
          status: 200,
          message: "No tutors found",
          data: { tutors: [] },
        };
      }

      // Fetch certifications for each tutor
      const tutorIds = tutors.map((tutor) => tutor._id);
      const certifications = await db.Certification.find({ createBy: { $in: tutorIds } }).select(
        "_id name description image experience isChecked isCanTeach createBy"
      );

      // Map tutors to include their certifications
      const result = tutors.map((tutor) => {
        const tutorCerts = certifications.filter((cert) => cert.createBy.equals(tutor._id));
        return {
          account: {
            _id: tutor._id,
            fullName: tutor.fullName,
            email: tutor.email,
            phone: tutor.phone,
            role: tutor.role,
            status: tutor.status,
            createdAt: tutor.createdAt,
          },
          certifications: tutorCerts.map((cert) => ({
            _id: cert._id,
            name: cert.name,
            description: cert.description,
            image: cert.image,
            experience: cert.experience,
            isChecked: cert.isChecked,
            isCanTeach: cert.isCanTeach,
            createBy: cert.createBy,
          })),
        };
      });

      return {
        status: 200,
        message: "Tutors and certifications retrieved successfully",
        data: { tutors: result },
      };
    } catch (error) {
      console.error("Error fetching tutors with certifications:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async updateCertificationIsChecked(certificationId) {
    try {
      // Validate certificationId
      if (!certificationId || typeof certificationId !== "string") {
        return { status: 400, message: "Valid certification ID is required" };
      }

      // Find and update certification
      const certification = await db.Certification.findById(certificationId).select(
        "_id name description image experience isChecked isCanTeach createBy"
      );
      if (!certification) {
        return { status: 404, message: "Certification not found" };
      }

      // Check if already updated
      if (certification.isChecked) {
        return { status: 400, message: "Certification is already checked" };
      }

      // Update isChecked
      certification.isChecked = true;
      await certification.save();

      return {
        status: 200,
        message: "Certification isChecked updated successfully",
      };
    } catch (error) {
      console.error("Error updating certification isChecked:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async updateCertificationIsCanTeach(certificationId) {
    try {
      // Validate certificationId
      if (!certificationId || typeof certificationId !== "string") {
        return { status: 400, message: "Valid certification ID is required" };
      }

      // Find and update certification
      const certification = await db.Certification.findById(certificationId).select(
        "_id name description image experience isChecked isCanTeach createBy"
      );
      if (!certification) {
        return { status: 404, message: "Certification not found" };
      }

      // Check if already updated
      if (certification.isCanTeach) {
        return { status: 400, message: "Certification is already marked as can teach" };
      }

      // Update isCanTeach
      certification.isCanTeach = true;
      await certification.save();

      return {
        status: 200,
        message: "Certification isCanTeach updated successfully",
      };
    } catch (error) {
      console.error("Error updating certification isCanTeach:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  // Thêm vào certificationService trong certificationService.js
  async getAccountById(accountId) {
    try {
      // Validate accountId
      if (!accountId || typeof accountId !== "string") {
        return { status: 400, message: "Valid account ID is required" };
      }

      // Tìm account theo ID
      const account = await db.Account.findById(accountId).select("_id fullName email phone role status createdAt");
      if (!account) {
        return { status: 404, message: "Account not found" };
      }

      // Tìm các chứng chỉ của account (nếu là Tutor)
      let certifications = [];
      if (account.role === "Tutor") {
        certifications = await db.Certification.find({ createBy: accountId }).select(
          "_id name description image experience isChecked isCanTeach createBy"
        );
      }

      return {
        status: 200,
        message: "Account retrieved successfully",
        data: {
          account: {
            _id: account._id,
            fullName: account.fullName,
            email: account.email,
            phone: account.phone,
            role: account.role,
            status: account.status,
            createdAt: account.createdAt,
          },
          certifications: certifications.map((cert) => ({
            _id: cert._id,
            name: cert.name,
            description: cert.description,
            image: cert.image,
            experience: cert.experience,
            isChecked: cert.isChecked,
            isCanTeach: cert.isCanTeach,
            createBy: cert.createBy,
          })),
        },
      };
    } catch (error) {
      console.error("Error fetching account by ID:", error);
      return { status: 500, message: "Internal server error" };
    }
  },
};

module.exports = certificationService;
