const mongoose = require("mongoose");

const AddLike = (Likes,Posts) => async (req,res) =>{
    const {userId,postId} = req.body;
    const userID = new mongoose.mongo.ObjectId(userId);
    const postID = new mongoose.mongo.ObjectId(postId);

    const existingLike = await Likes.findOne({ user_id: userID, post_id: postID });
    
    if (existingLike) {
        const removeLike = await Likes.deleteOne({ user_id: userID, post_id: postID });

        if (removeLike.deletedCount === 0) {
            res.status(404).json('error');
        }


        const updatedPost = await Posts.findByIdAndUpdate(
            postID,
            { $pull: { likes: userID }, $inc: { likesCount: -1 } },
            { new: true }
        );
        res.json({removeLike: updatedPost});
    } else {
        try {

            // Create a new Like document
            const newLike = new Likes({
                user_id: userID,
                post_id: postID
            });

            // Save the new Like document
            newLike.save()
                .then(savedLike => {
                    // Add the new like to the post's likes array
                    return Posts.findByIdAndUpdate(postID, { $push: { likes: userID}, $inc: { likesCount: 1 } }, { new: true });
                })
                .then(updatedPost =>{
                    // Return the updated post with the added like
                    res.json({addLike: updatedPost});
                })
                .catch(err => {
                    // Handle errors
                    console.error(err);
                    res.status(500).json({ error: 'An error occurred while adding the like.' });
                });
        } catch (e) {
            res.status(404).json('error');
        }
    }

    


        

    

}

module.exports = AddLike