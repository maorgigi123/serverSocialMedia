const mongoose = require("mongoose");

const GetUserPosts = (Posts) => async (req, res) => {
    const { userId, seenPosts } = req.body;

    if (!userId || !Array.isArray(seenPosts)) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const userID =new mongoose.mongo.ObjectId(userId);
        const seenPostIDs = seenPosts.map(postId => new mongoose.mongo.ObjectId(postId));

        const userUploadedPosts = await Posts.find({
            $and: [
                { '_id': { $nin: seenPostIDs } },
                { 'author': userID }
            ]
        }).limit(5).populate('author').populate('likes').populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
            populate: [
                { path: 'user_id', model: 'Users' }, // Populate user details for each comment
                { path: 'likes', model: 'Users' } // Populate likes for each comment
            ]
        }).sort({createdAt: -1})
        res.json(userUploadedPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = GetUserPosts;
