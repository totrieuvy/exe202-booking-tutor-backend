const httpErrors = require("http-errors");
const db = require("../models/index"); // Import the db object from index.js

const getAccountProfile = async (userId) => {
  const accounts = await db.Account.find({ _id: userId }).select("fullName email phone avatar balance");
  if (!accounts || accounts.length === 0) {
    throw httpErrors.NotFound("Account not found");
  }
  // Return the first match (assuming unique _id)
  return accounts[0];
};

const updateAccountProfile = async (userId, updates) => {
  const allowedUpdates = ["fullName", "email", "phone", "avatar"];
  const updateKeys = Object.keys(updates);
  const isValidOperation = updateKeys.every((key) => allowedUpdates.includes(key));

  if (!isValidOperation) {
    throw httpErrors.BadRequest("Invalid update fields");
  }

  const accounts = await db.Account.find({ _id: userId });
  if (!accounts || accounts.length === 0) {
    throw httpErrors.NotFound("Account not found");
  }
  const account = accounts[0]; // Use the first match

  // Check for unique constraints
  if (updates.email && updates.email !== account.email) {
    const existingEmail = await db.Account.findOne({ email: updates.email });
    if (existingEmail) {
      throw httpErrors.Conflict("Email already exists");
    }
  }

  if (updates.phone && updates.phone !== account.phone) {
    const existingPhone = await db.Account.findOne({ phone: updates.phone });
    if (existingPhone) {
      throw httpErrors.Conflict("Phone number already exists");
    }
  }

  if (updates.fullName && updates.fullName !== account.fullName) {
    const existingFullName = await db.Account.findOne({
      fullName: updates.fullName,
    });
    if (existingFullName) {
      throw httpErrors.Conflict("Full name already exists");
    }
  }

  // Update fields
  updateKeys.forEach((key) => {
    account[key] = updates[key];
  });

  await account.save();
  return account;
};

module.exports = {
  getAccountProfile,
  updateAccountProfile,
};
