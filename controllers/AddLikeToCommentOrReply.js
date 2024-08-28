const mongoose = require('mongoose');

const AddLikeToCommentOrReply = (Comments) => async (req, res) => {
    const { commentId, replyId, userId } = req.body;
    const commentID = new mongoose.Types.ObjectId(commentId);
    const userID = new mongoose.Types.ObjectId(userId);

    try {
        // Find the comment
        const comment = await Comments.findById(commentID);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found'});

        }

        let likeStatus = '';
        if (replyId) {
            // If replyId is provided, handle liking a reply
            const reply = comment.replies.id(replyId);

            if (!reply) {
                return res.status(404).json({ error: 'Reply not found'});
            }

            // Check if the user has already liked the reply
            if (reply.likes.includes(userID)) {
                // Remove like
                reply.likes.pull(userID);
                reply.likesCount -= 1;
                likeStatus = 'removed';
            } else {
                // Add like
                reply.likes.push(userID);
                reply.likesCount += 1;
                likeStatus = 'added';
            }

            // Save the updated comment
            await comment.save();
        } else {
            // Handle liking the comment itself
            // Check if the user has already liked the comment
            if (comment.likes.includes(userID)) {
                // Remove like
                comment.likes.pull(userID);
                comment.likesCount -= 1;
                likeStatus = 'removed';
            } else {
                // Add like
                comment.likes.push(userID);
                comment.likesCount += 1;
                likeStatus = 'added';
            }

            // Save the updated comment
            await comment.save();
        }

        res.status(200).json({ 
            message: 'Like status updated successfully', 
            likeStatus, 
            comment 
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e });
    }
};

module.exports = AddLikeToCommentOrReply;
