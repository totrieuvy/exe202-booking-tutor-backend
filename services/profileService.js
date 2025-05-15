const httpErrors = require("http-errors");
const db = require("../models/account");

const getAccountProfile = async (userId) => {
  const account = await db.Account.findById(userId).select("fullName email phone avatar balance");
  if (!account) {
    throw httpErrors.NotFound("Account not found");
  }
  return account;
};

const updateAccountProfile = async (userId, updates) => {
  const allowedUpdates = ["fullName", "email", "phone", "avatar"];
  const updateKeys = Object.keys(updates);
  const isValidOperation = updateKeys.every((key) => allowedUpdates.includes(key));

  if (!isValidOperation) {
    throw httpErrors.BadRequest("Invalid update fields");
  }

  const account = await db.Account.findById(userId);
  if (!account) {
    throw httpErrors.NotFound("Account not found");
  }

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
