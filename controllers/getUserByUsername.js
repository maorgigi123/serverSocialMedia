const mongoose = require("mongoose");


const GetUserByUsername = (Users, Posts,Friends) => async(req,res) =>{
    const { username, seen = 0 ,CurrentUsername,CurrentId} = req.body;
    const CurrentID = new mongoose.Types.ObjectId(CurrentId);

    try {
        const user = await Users.findOne({ username: username })
        // .populate({
        //     path: 'following',
        //     populate: { path: 'following' }, // Populate following within following
        //     perDocumentLimit:5 // Limit to 5 per document
        // })
        // .populate({
        //     path: 'followers',
        //     populate: { path: 'follower' }, // Populate followers within followers
        //     perDocumentLimit:5 // Limit to 5 per document
        // })
        if (!user) {
            return res.json('User not found');
        }
        let isFriend = false;

        if(CurrentUsername !== username){
            //cheack if the user freind with the username
      // נבדוק אם יש רשומת חבר שבהן CurrentUser עוקב אחרי המשתמש או שהוא עוקב אחרי CurrentUser
            const friendRecord = await Friends.findOne({ follower: CurrentID, following: user._id 
            });

            isFriend = !!friendRecord;
        }
        const userPosts = await Posts.find({ author: user._id })
            .limit(seen > 0 ? seen : 12)
            .populate('author')
            .populate('likes')
            // .populate({
            //     path: 'author',
            //     populate: { path: 'following' } // Populate following within following
            // })
            // .populate({
            //     path: 'author',
            //     populate: { path: 'followers' } // Populate followers within followers
            // })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
                populate: [
                    { path: 'user_id', model: 'Users' }, // Populate user details for each comment
                    { path: 'likes', model: 'Users' } // Populate likes for each comment
                ],
                perDocumentLimit:2 // Limit comments to 5 per document
            }).sort({createdAt: -1})
            const enhancedPosts = userPosts.map(post => {
                // Check if the current user has selected any image in the post
                let selectedIndex = -1;
                post.selectedImages.forEach(selectedImage => {
                    if (selectedImage.users.includes(CurrentId)) {
                        selectedIndex = selectedImage.imageIndex;
                    }
                });
    
                // Clone the post object and add the selectedIndex to it
                const postWithSelectedIndex = post.toObject(); // Convert to plain JS object
                postWithSelectedIndex.selectedIndex = selectedIndex;
    
                return postWithSelectedIndex;
            });
        return res.json([user, enhancedPosts,isFriend]);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json('Internal Server Error');
    }
};
module.exports = GetUserByUsername;