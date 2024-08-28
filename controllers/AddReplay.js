const mongoose = require("mongoose");

const AddReplay = (Comments,Posts) => async (req, res) => {
  const { commentsId, userId, comment,replayTo_id,postId } = req.body;

  const userID = new mongoose.Types.ObjectId(userId);
  const commentID = new mongoose.Types.ObjectId(commentsId);
  const ReplayToId = new mongoose.Types.ObjectId(replayTo_id);
  const PostId = new mongoose.Types.ObjectId(postId);

  try{
    const foundComment = await Comments.findById(commentID).populate('user_id');
    if (!foundComment || !ReplayToId) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Create the reply object
    const newReply = {
        user_id: userID,
        content: comment,
        createdAt: new Date(),
        replayTo_id: ReplayToId
      };
  
      // Push the reply into the replies array
      foundComment.replies.push(newReply);
  
      // Save the updated comment
      await foundComment.save();

      await Posts.findByIdAndUpdate(PostId, 
        { 
          $inc: { commentsCount: 1 } 
        }, 
        { new: true }
      );
  
      // Respond with the updated comment
      res.status(200).json(foundComment);

  } catch (e) {
    return res.status(404).json({ error: e });
}
};

module.exports = AddReplay;
