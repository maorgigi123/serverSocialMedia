const mongoose = require("mongoose");

const AddLikeToComment = (Comments,Post) => async (req,res) =>{
    const {commentId,userId,postId} = req.body;
    const commentID = new mongoose.mongo.ObjectId(commentId);
    const userID = new mongoose.mongo.ObjectId(userId);
    const postID = new mongoose.mongo.ObjectId(postId);
   try {
        // Check if the comment exists
        const comment = await Comments.findById(commentID);
        if (!comment) {
            return res.status(404).json('Comment not found');
        }
        // Check if the user has already liked the comment
        if (comment.likes.includes(userID)) {
            const updatedComment = await Comments.findByIdAndUpdate(
                commentID, 
                { 
                    $pull: { likes: userID }, 
                    $inc: { likesCount: -1 } 
                }, 
                { new: true }  // Return the updated document
            )
            const post = await Post.findById(updatedComment.post_id).populate('author').populate({
              path: 'comments',
              options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
              populate: [
                  { path: 'user_id', model: 'Users' }, // Populate user details for each comment
                  { path: 'likes', model: 'Users' } // Populate likes for each comment
              ]
          });
            if (!post) {
                return res.status(404).json('error');
            }

            return res.json({ remove: post });


            
        }

        // Add the new like to the comment's likes array and increment the likesCount
        const updatedComment = await Comments.findByIdAndUpdate(
            commentID, 
            { 
                $push: { likes: userID }, 
                $inc: { likesCount: 1 } 
            }, 
            { new: true }  // Return the updated document
        )
        const post = await Post.findById(updatedComment.post_id).populate('author').populate({
          path: 'comments',
          options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
          populate: [
              { path: 'user_id', model: 'Users' }, // Populate user details for each comment
              { path: 'likes', model: 'Users' } // Populate likes for each comment
          ]
      })

        if (!post) {
            return res.status(404).json('error');
        }

        return res.json({ add: post });
        // Return the updated comment with the added like
    } catch (e) {
        console.error(e);
        return res.status(500).json('error');
    }

}

module.exports = AddLikeToComment