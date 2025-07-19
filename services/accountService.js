const db = require("../models/index");

const accountService = {
  async getAllAccountsExceptCurrent(userId) {
    try {
      // Validate userId
      if (!userId || typeof userId !== "string") {
        return { status: 400, message: "Valid user ID is required" };
      }

      // Fetch all accounts except the current user
      const accounts = await db.Account.find({ _id: { $ne: userId } }).select(
        "_id fullName email phone avatar role status"
      );

      // If no accounts found
      if (!accounts || accounts.length === 0) {
        return {
          status: 200,
          message: "No accounts found",
          data: { accounts: [] },
        };
      }

      // Format response
      const formattedAccounts = accounts.map((account) => ({
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        avatar: account.avatar,
        role: account.role,
        status: account.status,
      }));

      return {
        status: 200,
        message: "Accounts retrieved successfully",
        data: { accounts: formattedAccounts },
      };
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return { status: 500, message: "Internal server error" };
    }
  },

  async getAccountById(accountId) {
    try {
      // Validate accountId
      if (!accountId || typeof accountId !== "string") {
        return { status: 400, message: "Valid account ID is required" };
      }

      // Fetch account
      const account = await db.Account.findById(accountId).select("_id fullName email phone avatar role status");

      // If account not found
      if (!account) {
        return { status: 404, message: "Account not found" };
      }

      // Format response
      const formattedAccount = {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        avatar: account.avatar,
        role: account.role,
        status: account.status,
      };

      return {
        status: 200,
        message: "Account retrieved successfully",
        data: { account: formattedAccount },
      };
    } catch (error) {
      console.error("Error fetching account by ID:", error);
      return { status: 500, message: "Internal server error" };
    }
  },
};

module.exports = accountService;
