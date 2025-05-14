const db = require("../models/index");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

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

const authenticationService = {
  async register({ fullName, email, phone, password }) {
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

      // Create new account
      const newAccount = new db.Account({
        fullName,
        email,
        phone,
        password: hashedPassword,
        status: "Inactive",
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

      return { status: 201, message: "Account created successfully! Please check your email for OTP." };
    } catch (error) {
      console.error("Registration error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async verifyOtp(email, otp) {
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

      return { status: 200, message: "Account verified successfully!" };
    } catch (error) {
      console.error("OTP verification error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async login(email, password) {
    try {
      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        return { status: 400, data: { message: emailError } };
      }

      if (!password || typeof password !== "string") {
        return { status: 400, data: { message: "Password is required and must be a string" } };
      }

      // Find account
      const account = await db.Account.findOne({ email });
      if (!account) {
        return { status: 404, data: { message: "Account not found" } };
      }

      // Check account status
      if (account.status === "Inactive") {
        return {
          status: 403,
          data: { message: "Account is inactive!" },
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return { status: 401, data: { message: "Invalid password" } };
      }

      // Generate JWT token with id and role
      const token = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      });

      // Return user data and token
      return {
        status: 200,
        data: {
          message: "Login successful",
          token,
          user: {
            fullName: account.fullName,
            email: account.email,
            phone: account.phone,
            role: account.role,
          },
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return { status: 500, data: { message: "Internal server error" } };
    }
  },
};

module.exports = authenticationService;
