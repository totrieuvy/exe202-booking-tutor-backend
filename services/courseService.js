const db = require("../models/index");

const courseService = {
  async createCourse({ name, description, image, price, userId }) {
    try {
      // Validate inputs
      if (!name || typeof name !== "string") {
        return { status: 400, message: "Course name is required and must be a string" };
      }
      if (!description || typeof description !== "string") {
        return { status: 400, message: "Description is required and must be a string" };
      }
      if (!image || typeof image !== "string" || !image.startsWith("http")) {
        return { status: 400, message: "Image URL is required and must be a valid URL starting with 'http'" };
      }
      if (typeof price !== "number" || price < 0) {
        return { status: 400, message: "Price is required and must be a non-negative number" };
      }
      if (!userId || typeof userId !== "string") {
        return { status: 400, message: "Valid user ID is required" };
      }

      // Verify account exists and is active
      const account = await db.Account.findById(userId);
      if (!account) {
        return { status: 404, message: "Account not found" };
      }
      if (account.status !== "Active") {
        return { status: 403, message: "Account must be active to create a course" };
      }

      // Check for valid certification (isChecked: true, isCanTeach: true)
      const validCertification = await db.Certification.findOne({
        createBy: userId,
        isChecked: true,
        isCanTeach: true,
      });
      if (!validCertification) {
        return {
          status: 403,
          message: "You need a verified certification (isChecked and isCanTeach) to create a course",
        };
      }

      // Create new course
      const course = new db.Course({
        name,
        description,
        image,
        price,
        createdBy: userId,
      });
      await course.save();

      return {
        status: 201,
        message: "Course created successfully",
        data: {
          course: {
            _id: course._id,
            name: course.name,
            description: course.description,
            image: course.image,
            price: course.price,
            createdBy: course.createdBy,
            createdAt: course.createdAt,
          },
        },
      };
    } catch (error) {
      console.error("Course creation error:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async getCoursesWithDetails() {
    try {
      // Fetch all courses
      const courses = await db.Course.find().select("_id name description image price createdBy isActive createdAt");

      if (!courses || courses.length === 0) {
        return {
          status: 200,
          message: "No courses found",
          data: { courses: [] },
        };
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(courses.map((course) => course.createdBy))];

      // Fetch accounts for creators
      const accounts = await db.Account.find({ _id: { $in: creatorIds } }).select(
        "_id fullName email phone status role"
      );

      // Fetch certifications for creators
      const certifications = await db.Certification.find({
        createBy: { $in: creatorIds },
      }).select("_id name description image experience isChecked isCanTeach createBy");

      // Map courses with max experience for sorting
      const coursesWithMaxExperience = courses.map((course) => {
        const courseCerts = certifications.filter((cert) => cert.createBy.equals(course.createdBy));
        const maxExperience = courseCerts.length ? Math.max(...courseCerts.map((cert) => cert.experience)) : 0; // Default to 0 if no certifications

        return {
          course,
          maxExperience,
          account: accounts.find((acc) => acc._id.equals(course.createdBy)),
          certifications: courseCerts,
        };
      });

      // Sort by maxExperience in descending order
      coursesWithMaxExperience.sort((a, b) => b.maxExperience - a.maxExperience);

      // Format response
      const result = coursesWithMaxExperience.map(({ course, account, certifications }) => ({
        course: {
          _id: course._id,
          name: course.name,
          description: course.description,
          image: course.image,
          price: course.price,
          createdBy: course.createdBy,
          isActive: course.isActive,
          createdAt: course.createdAt,
        },
        account: account
          ? {
              _id: account._id,
              fullName: account.fullName,
              email: account.email,
              phone: account.phone,
              status: account.status,
              role: account.role,
            }
          : null,
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
      }));

      return {
        status: 200,
        message: "Courses retrieved successfully",
        data: { courses: result },
      };
    } catch (error) {
      console.error("Error fetching courses with details:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async getAccountDetailsWithCourses(accountId) {
    try {
      // Validate accountId
      if (!accountId || typeof accountId !== "string") {
        return { status: 400, message: "Valid account ID is required" };
      }

      // Fetch account
      const account = await db.Account.findById(accountId).select("_id fullName email phone status role");
      if (!account) {
        return { status: 404, message: "Account not found" };
      }

      // Fetch certifications
      const certifications = await db.Certification.find({ createBy: accountId }).select(
        "_id name description image experience isChecked isCanTeach createBy"
      );

      // Fetch courses
      const courses = await db.Course.find({ createdBy: accountId }).select(
        "_id name description image price createdBy isActive createdAt"
      );

      // Format response
      const result = {
        account: {
          _id: account._id,
          fullName: account.fullName,
          email: account.email,
          phone: account.phone,
          status: account.status,
          role: account.role,
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
        courses: courses.map((course) => ({
          _id: course._id,
          name: course.name,
          description: course.description,
          image: course.image,
          price: course.price,
          createdBy: course.createdBy,
          isActive: course.isActive,
          createdAt: course.createdAt,
        })),
      };

      return {
        status: 200,
        message: "Account details retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error fetching account details with courses:", error);
      return { status: 500, message: "Internal server error" };
    }
  },
};

module.exports = courseService;
