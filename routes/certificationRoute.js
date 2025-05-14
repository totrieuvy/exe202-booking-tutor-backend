const express = require("express");
const router = express.Router();
const certificationService = require("../services/certificationService");
const verifyToken = require("../middlewares/verifyToken");
const restrictToRole = require("../middlewares/restrictToRole");

/**
 * @swagger
 * /api/certifications/tutor/register:
 *   post:
 *     summary: Register a new tutor account
 *     description: Creates a new tutor account and sends an OTP for verification
 *     tags: [Certifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the tutor
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: Email address of the tutor
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: Phone number (10-12 digits, optional + prefix)
 *                 example: +12345678901
 *               password:
 *                 type: string
 *                 description: Password (min 8 chars, with uppercase, lowercase, number, special char)
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: Tutor account created successfully, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Tutor account created successfully! Please check your email for OTP.
 *       400:
 *         description: Invalid input or duplicate data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Email is already registered
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/tutor/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const result = await certificationService.registerTutor({
      fullName,
      email,
      phone,
      password,
    });
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in tutor register route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/certifications/tutor/verify-otp:
 *   post:
 *     summary: Verify OTP for tutor account activation
 *     description: Verifies the OTP sent to the tutor's email to activate the account
 *     tags: [Certifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address of the tutor account
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP received via email
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Tutor account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Tutor account verified successfully!
 *       400:
 *         description: Invalid OTP or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Account not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/tutor/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await certificationService.verifyTutorOtp(email, otp);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in tutor verify-otp route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/certifications/register:
 *   post:
 *     summary: Register a new certification for a tutor
 *     description: Creates a new certification for an authenticated tutor
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *               - experience
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the certification
 *                 example: AWS Certified Solutions Architect
 *               description:
 *                 type: string
 *                 description: Description of the certification
 *                 example: Professional certification for cloud architecture
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs for the certification
 *                 example: ["https://example.com/cert1.jpg", "https://example.com/cert2.jpg"]
 *               experience:
 *                 type: number
 *                 description: Years of experience related to the certification
 *                 example: 5
 *     responses:
 *       201:
 *         description: Certification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Certification created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     certification:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: array
 *                           items:
 *                             type: string
 *                         experience:
 *                           type: number
 *                         isChecked:
 *                           type: boolean
 *                         isCanTeach:
 *                           type: boolean
 *                         createBy:
 *                           type: string
 *       400:
 *         description: Invalid input or duplicate data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Certification name must be unique
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       403:
 *         description: Forbidden (inactive account or non-tutor)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Account must be active to create a certification
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/register", verifyToken, async (req, res) => {
  try {
    const { name, description, image, experience } = req.body;
    const userId = req.userId;
    const result = await certificationService.registerCertification({
      name,
      description,
      image,
      experience,
      userId,
    });
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in certification route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/certifications/all-tutors:
 *   get:
 *     summary: Get all tutor accounts with their certifications
 *     description: Retrieves all accounts with role Tutor, sorted by createdAt in descending order, along with their certifications, accessible only to Admin role
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutors and certifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Tutors and certifications retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tutors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           account:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                           certifications:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 image:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                 experience:
 *                                   type: number
 *                                 isChecked:
 *                                   type: boolean
 *                                 isCanTeach:
 *                                   type: boolean
 *                                 createBy:
 *                                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       403:
 *         description: Forbidden (non-Admin role)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/all-tutors", verifyToken, restrictToRole("Admin"), async (req, res) => {
  try {
    const result = await certificationService.getTutorsWithCertifications();
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in get tutors with certifications route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/certifications/{certificationId}/is-checked:
 *   patch:
 *     summary: Update certification isChecked to true
 *     description: Sets the isChecked field of a certification to true, accessible only to Admin role
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the certification to update
 *     responses:
 *       200:
 *         description: Certification isChecked updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Certification isChecked updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     certification:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: array
 *                           items:
 *                             type: string
 *                         experience:
 *                           type: number
 *                         isChecked:
 *                           type: boolean
 *                         isCanTeach:
 *                           type: boolean
 *                         createBy:
 *                           type: string
 *       400:
 *         description: Invalid certification ID or already checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Certification is already checked
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       403:
 *         description: Forbidden (non-Admin role)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required.
 *       404:
 *         description: Certification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Certification not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.patch("/:certificationId/is-checked", verifyToken, restrictToRole("Admin"), async (req, res) => {
  try {
    const { certificationId } = req.params;
    const result = await certificationService.updateCertificationIsChecked(certificationId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in update isChecked route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/certifications/{certificationId}/is-can-teach:
 *   patch:
 *     summary: Update certification isCanTeach to true
 *     description: Sets the isCanTeach field of a certification to true, accessible only to Admin role
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the certification to update
 *     responses:
 *       200:
 *         description: Certification isCanTeach updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Certification isCanTeach updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     certification:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: array
 *                           items:
 *                             type: string
 *                         experience:
 *                           type: number
 *                         isChecked:
 *                           type: boolean
 *                         isCanTeach:
 *                           type: boolean
 *                         createBy:
 *                           type: string
 *       400:
 *         description: Invalid certification ID or already marked as can teach
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Certification is already marked as can teach
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized! Invalid token
 *       403:
 *         description: Forbidden (non-Admin role)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin role required.
 *       404:
 *         description: Certification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Certification not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.patch("/:certificationId/is-can-teach", verifyToken, restrictToRole("Admin"), async (req, res) => {
  try {
    const { certificationId } = req.params;
    const result = await certificationService.updateCertificationIsCanTeach(certificationId);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in update isCanTeach route:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

module.exports = router;
