const Forum = require("../models/forum");
const Account = require("../models/account");
const FeedbackForum = require("../models/feedbackForum");

const ForumService = {
  async createForumPost({ accountId, title, content }) {
    const forumPost = new Forum({
      accountId,
      title,
      content,
      numberOfLikes: 0,
    });
    await forumPost.save();
    return forumPost;
  },

  async getAllForumPosts() {
    const forumPosts = await Forum.find()
      .populate("accountId", "fullName")
      .select("accountId title content createdAt numberOfLikes")
      .lean();

    return forumPosts.map((post) => ({
      _id: post._id,
      fullName: post.accountId.fullName,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      numberOfLikes: post.numberOfLikes,
    }));
  },

  async getForumPostById(postId) {
    const forumPost = await Forum.findById(postId)
      .populate("accountId", "fullName")
      .select("accountId title content createdAt numberOfLikes")
      .lean();

    if (!forumPost) {
      throw new Error("Forum post not found");
    }

    const feedback = await FeedbackForum.find({ forumId: postId })
      .populate("accountId", "fullName")
      .select("accountId reply createdAt")
      .lean();

    return {
      _id: forumPost._id,
      fullName: forumPost.accountId.fullName,
      title: forumPost.title,
      content: forumPost.content,
      createdAt: forumPost.createdAt,
      numberOfLikes: forumPost.numberOfLikes,
      feedback: feedback.map((fb) => ({
        _id: fb._id,
        fullName: fb.accountId.fullName,
        reply: fb.reply,
        createdAt: fb.createdAt,
      })),
    };
  },

  async updateForumPost({ postId, accountId, title, content }) {
    const forumPost = await Forum.findById(postId);

    if (!forumPost) {
      throw new Error("Forum post not found");
    }

    if (forumPost.accountId.toString() !== accountId) {
      throw new Error("You can only update your own posts");
    }

    forumPost.title = title || forumPost.title;
    forumPost.content = content || forumPost.content;
    await forumPost.save();

    return forumPost;
  },

  async deleteForumPost({ postId, accountId }) {
    const forumPost = await Forum.findById(postId);

    if (!forumPost) {
      throw new Error("Forum post not found");
    }

    if (forumPost.accountId.toString() !== accountId) {
      throw new Error("You can only delete your own posts");
    }

    await Forum.deleteOne({ _id: postId });
    await FeedbackForum.deleteMany({ forumId: postId });
    return { message: "Forum post deleted successfully" };
  },

  async likeForumPost(postId) {
    const forumPost = await Forum.findById(postId);

    if (!forumPost) {
      throw new Error("Forum post not found");
    }

    forumPost.numberOfLikes += 1;
    await forumPost.save();

    return await Forum.findById(postId)
      .populate("accountId", "fullName")
      .select("accountId title content createdAt numberOfLikes")
      .lean();
  },

  async addFeedback({ accountId, forumId, reply }) {
    const feedback = new FeedbackForum({
      accountId,
      forumId,
      reply,
    });
    await feedback.save();

    const populatedFeedback = await FeedbackForum.findById(feedback._id)
      .populate("accountId", "fullName")
      .select("accountId reply createdAt")
      .lean();

    return {
      _id: populatedFeedback._id,
      fullName: populatedFeedback.accountId.fullName,
      reply: populatedFeedback.reply,
      createdAt: populatedFeedback.createdAt,
    };
  },
};

module.exports = ForumService;
