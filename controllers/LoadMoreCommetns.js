const mongoose = require("mongoose");

const LoadMoreComments = (Posts) => async (req, res) => {
    const { postID , commentsSkip = 0 } = req.body;
    const commentsLimit = 15;
    const postId = new mongoose.mongo.ObjectId(postID);
    console.log('load more comments skip on: ',commentsSkip)
    const comments = await Posts.findById(postId)
    .populate('author')
    .populate({
        path: 'comments',
        options: {
            sort: { createdAt: -1 },
            skip: commentsSkip, // Skip comments for pagination
            limit: commentsLimit // Limit comments for pagination
        },
        populate: [
            { path: 'user_id', model: 'Users' },
            { path: 'likes', model: 'Users' }
        ],
    });

    res.json(comments);
};

module.exports = LoadMoreComments;
