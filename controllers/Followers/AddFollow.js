const mongoose = require('mongoose');

const AddFollow = (FollowScheme, Users) => async (req, res) => {
    const { follower, following } = req.body;

    if (!follower || !following) {
        return res.status(400).json({ error: 'Follower and following are required' });
    }

    const followerId = new mongoose.Types.ObjectId(follower);
    const followingId = new mongoose.Types.ObjectId(following);

    try {
        const followerUser = await Users.findById(followerId);
        const followingUser = await Users.findById(followingId);
        if (followerUser && followingUser) {
            // Check if the follow relationship already exists
            const existingFollow = await FollowScheme.findOne({
                follower: followerId,
                following: followingId
            });

            if (existingFollow) {
                // If it exists, remove the follow
                await FollowScheme.deleteOne({
                    follower: followerId,
                    following: followingId
                });

                followerUser.following_count--;
                followingUser.followers_count--;

                // Remove the follower from the following list
                followerUser.following.pull(existingFollow._id);
                followingUser.followers.pull(existingFollow._id);

                await followerUser.save();
                await followingUser.save();

                // Populate followers and following lists
                // const updatedFollowerUser = await Users.findById(followerId)
                // .populate('following')
                // .populate('followers')

                return res.json({
                    message: 'Removed follow',
                    // followerUser: updatedFollowerUser
                });
            } else {
                // If it does not exist, add the follow
                const newFollow = new FollowScheme({
                    follower: followerId,
                    following: followingId,
                    createdAt: new Date() // Add creation date
                });

                await newFollow.save();

                followerUser.following_count++;
                followingUser.followers_count++;

                // Add the new follow document ID to the follower's following list
                followerUser.following.push(newFollow._id);
                // Add the new follow document ID to the following user's followers list
                followingUser.followers.push(newFollow._id);

                await followerUser.save();
                await followingUser.save();

                // Populate followers and following lists
                // const updatedFollowerUser = await Users.findById(followerId)
                // .populate({
                //     path: 'following',
                //     populate: { path: 'following' } // Populate following within following
                // })
                // .populate({
                //     path: 'followers',
                //     populate: { path: 'follower' } // Populate followers within followers
                // });

                return res.json({
                    message: 'Added follow',
                    // followerUser: updatedFollowerUser
                });
            }
        } else {
            return res.status(404).json({ error: 'User not found' });
        }

    } catch (e) {
        console.error('Error:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = AddFollow;
