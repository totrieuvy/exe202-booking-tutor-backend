const Forum = require("../models/forum");
const Account = require("../models/account");

const ForumService = {
  async createForumPost({ accountId, title, content }) {
    const forumPost = new Forum({
      accountId,
      title,
      content,
    });
    await forumPost.save();
    return forumPost;
  },

  async getAllForumPosts() {
    const forumPosts = await Forum.find()
      .populate("accountId", "fullName")
      .select("accountId title content createdAt")
      .lean();

    // Transform the response to include fullName instead of accountId object
    return forumPosts.map((post) => ({
      _id: post._id,
      fullName: post.accountId.fullName,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
    }));
  },
};

module.exports = ForumService;
