const mongoose = require("mongoose");

const addComment = (Comments, Posts) => async (req, res) => {
  const { userId, postId, content } = req.body;
  const userID = new mongoose.Types.ObjectId(userId);
  const postID = new mongoose.Types.ObjectId(postId);

  try {
    // Step 1: Create and save the new comment
    const comment = new Comments({
      user_id: userID,
      post_id: postID,
      content: content
    });
    const savedComment = await comment.save();
    
    // Step 2: Update the post with the new comment's ID and increment the comments count
    await Posts.findByIdAndUpdate(postID, 
      { 
        $push: { comments: savedComment._id }, 
        $inc: { commentsCount: 1 } 
      }, 
      { new: true }
    );

    // Step 3: Find the post with populated comments and user details
    const updatedPost = await Posts.findById(postID).populate('author')
    .populate({
      path: 'comments',
      options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
      populate: [
          { path: 'user_id', model: 'Users' }, // Populate user details for each comment
          { path: 'likes', model: 'Users' } // Populate likes for each comment
      ]
  });

    // Step 4: Return the updated post
    res.json(updatedPost);
  } catch (e) {
    console.error(e);
    res.status(404).json('error');
  }
};

module.exports = addComment;
