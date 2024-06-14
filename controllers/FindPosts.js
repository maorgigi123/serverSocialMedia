const mongoose = require("mongoose");

const FindPost = (Posts,Comments) => async(req,res) => {
    const {userId,seenPosts} = req.body;
    const userID = new mongoose.mongo.ObjectId(userId);

    const CommentsPost = await Comments.find({user_id:userID})
    // קבל את כל הפוסטים שהמשתמש עדיין לא ראה ולא היה בהם אינטרקציה
    const unseenPosts = await Posts.find({ 
        $and: [
        { '_id': { $nin: seenPosts.map(postId => new mongoose.mongo.ObjectId(postId)) } },
        { 'likes': { $nin: [userID] } },
        { 'comments': { $nin: CommentsPost } },
        { 'saved': { $nin: [userID] } }
        ]
    }).limit(2).populate('author') .sort({ createdAt: -1 }).populate('likes') .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
        populate: [
          
            { path: 'user_id', model: 'Users' }, // Populate user details for each comment
            { path: 'likes', model: 'Users' } // Populate likes for each comment
        ]
    })
    // הצג את הפוסטים שהמשתמש טרם ראה
    res.json(unseenPosts)
}

module.exports = FindPost;