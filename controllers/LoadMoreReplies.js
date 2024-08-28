const mongoose = require("mongoose");

const LoadMoreReplies = (Comments) => async (req, res) => {
  const { commentsId, excludeReplies = [], limit = 8 } = req.body;

  const commentID = new mongoose.Types.ObjectId(commentsId);
  
  try {
    const comment = await Comments.findById(commentID)
      .populate({
        path: 'replies.user_id', // Populate user_id in replies
        select: 'username profile_img' // Adjust fields based on your schema
      })
      .populate({
        path: 'replies.replayTo_id', // Populate replayTo_id in replies
        select: 'username profile_img' // Adjust fields based on your schema
      });
      
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Filter out the replies that are in the excludeReplies array
    const filteredReplies = comment.replies.filter(reply => !excludeReplies.includes(reply._id.toString()));

    // Sort the filtered replies by likes and timestamp (date)
    const sortedReplies = filteredReplies.sort((a, b) => {
      const likesDiff = b.likes.length - a.likes.length;
      if (likesDiff !== 0) {
        return likesDiff;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Slice replies based on limit
    const replies = sortedReplies.slice(0, Number(limit));

    res.status(200).json({ replies });
  } catch (e) {
    console.error(e);
    return res.status(404).json({ error: e.message });
  }
};

module.exports = LoadMoreReplies;
