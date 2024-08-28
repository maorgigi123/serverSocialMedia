const mongoose = require("mongoose");
const FriendsSchema = require('../../Schema/Friends');

const getMoreFollowers = () => async (req, res) => {
    try {
        const { userId, skip = 0 ,CurrentUser} = req.body;
        const FriendsLimit = 15;
        const userID = new mongoose.mongo.ObjectId(userId);
        const CurrentUserID = new mongoose.mongo.ObjectId(CurrentUser)
        console.log('Loading more friends, skip:', skip);

        // Find friends, populate the "follower" field, and paginate the results
        const friends = await FriendsSchema.find({ following: userID })
            .populate({
                path: 'follower',
                options: {
                    skip: parseInt(skip), // Skip records for pagination
                    limit: FriendsLimit // Limit the number of records returned
                },
            })
            .exec(); // Ensure the query executes and returns a Promise
        
        // Check if each friend is also followed back by the user
        const friendsWithMutualStatus = await Promise.all(friends.map(async (_user) => {
            if (_user.follower && _user.follower._id) {  // Check if follower exists and has an _id
                const friendRecord = await FriendsSchema.findOne({ follower: CurrentUserID, following: _user.follower._id });
                const isFriend = !!friendRecord; // True if the user follows this follower back

                return {
                    ..._user.toObject(), // Convert Mongoose document to plain object
                    isFriend, // Add the mutual friend status
                };
            } else {
                return {
                    ..._user.toObject(), // Convert Mongoose document to plain object
                    isFriend: false, // Set isFriend to false if follower is null or missing _id
                };
            }
        }));

        res.json(friendsWithMutualStatus);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'An error occurred while fetching friends.' });
    }
};

module.exports = getMoreFollowers;
