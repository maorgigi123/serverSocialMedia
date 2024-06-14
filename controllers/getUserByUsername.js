const GetUserByUsername = (Users, Posts) => async(req,res) =>{
    const { username, seen = 0 } = req.body;
    try {
        const user = await Users.findOne({ username: username });
        if (!user) {
            return res.json('User not found');
        }

        const posts = await Posts.find({ author: user._id })
            .limit(seen > 0 ? seen : 6)
            .populate('author')
            .populate('likes')
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
                populate: [
                    { path: 'user_id', model: 'Users' }, // Populate user details for each comment
                    { path: 'likes', model: 'Users' } // Populate likes for each comment
                ]
            }).sort({createdAt: -1})

        return res.json([user, posts]);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json('Internal Server Error');
    }
};
module.exports = GetUserByUsername;