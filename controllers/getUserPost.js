const mongoose = require("mongoose");

const GetUserPosts = (Posts) => async (req, res) => {
    const { userId, seenPosts } = req.body;
    console.log(userId)

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
        }).limit(8).populate('author').populate('likes').populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
            populate: [
                { path: 'user_id', model: 'Users' }, // Populate user details for each comment
                { path: 'likes', model: 'Users' } // Populate likes for each comment
            ],
            perDocumentLimit:2 // Limit comments to 5 per document
        }).sort({createdAt: -1})

         // Enhance posts with the selectedIndex
         const enhancedPosts = userUploadedPosts.map(post => {
            // Check if the current user has selected any image in the post
            let selectedIndex = -1;
            post.selectedImages.forEach(selectedImage => {
                if (selectedImage.users.includes(userId)) {
                    selectedIndex = selectedImage.imageIndex;
                }
            });

            // Clone the post object and add the selectedIndex to it
            const postWithSelectedIndex = post.toObject(); // Convert to plain JS object
            postWithSelectedIndex.selectedIndex = selectedIndex;

            return postWithSelectedIndex;
        });

        res.json(enhancedPosts);
        // res.json(userUploadedPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = GetUserPosts;
