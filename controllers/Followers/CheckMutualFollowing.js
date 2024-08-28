const mongoose = require('mongoose');
const FriendsSchema = require('../../Schema/Friends');

const CheckMutualFollowing = () => async (req, res) => {
    try {
        const { playerAId, playerBId } = req.body;

        // Convert to ObjectId
        const playerAID = new mongoose.mongo.ObjectId(playerAId);
        const playerBID = new mongoose.mongo.ObjectId(playerBId);

        // Check if Player A follows Player B
        const doesAFollowB = await FriendsSchema.findOne({ follower: playerAID, following: playerBID });
        
        // Check if Player B follows Player A
        const doesBFollowA = await FriendsSchema.findOne({ follower: playerBID, following: playerAID });

        const isMutual = !!(doesAFollowB && doesBFollowA);

        res.json({
            playerA_follows_playerB: !!doesAFollowB,
            playerB_follows_playerA: !!doesBFollowA,
            isMutualFollowing: isMutual,
        });
    } catch (error) {
        console.error('Error checking mutual following:', error);
        res.status(500).json({ error: 'An error occurred while checking mutual following.' });
    }
};

module.exports = CheckMutualFollowing;
