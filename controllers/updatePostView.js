// updateViews.js
const mongoose = require("mongoose");

const updatePostView = async (Posts, postId, userId) => {
    const userID = new mongoose.mongo.ObjectId(userId);
    const post = await Posts.findById(postId);
    if (post) {
        // Find if the user has viewed the post before
        const userViewData = post.views.find(view => view.user.equals(userID));

        // Increment the view count if the user hasn't exceeded 3 views
        if (userViewData && userViewData.count < 3) {
            console.log('Adding another view for post', postId);
            userViewData.count += 1;
            post.totalViews += 1;
        } else if (!userViewData) {
            // If the user hasn't viewed the post before, add a new entry
            post.views.push({ user: userID, count: 1 });
            console.log('Adding first view for post', postId);
            post.totalViews += 1;
        }
        else{
            console.log('view more them 3 dont count')
        }
        await post.save();
    } else {
        console.log(`Post with ID ${postId} not found`);
    }
};

module.exports = updatePostView;
