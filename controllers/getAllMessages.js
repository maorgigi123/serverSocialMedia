const mongoose = require('mongoose');
const Users = require('../Schema/User'); // Adjust path as needed
const Friends = require('../Schema/Friends'); // Ensure 'Friends' is imported correctly

const GetAllMessages = (Messages) => async (req, res) => {
    const { userId } = req.body;
    const userID = new mongoose.Types.ObjectId(userId);
    console.log('get all messages')
    try {
        const userChats = await Messages.find({ participants: userID })
            .populate('participants')
            .populate('messages.sender')
            .sort({ updatedAt: -1 })
            .exec();

        const userMessages = await Promise.all(userChats.map(async (chat) => {
            const chatParticipants = await Promise.all(chat.participants.map(async (participant) => {
                const userDetails = await Users.findById(participant._id);
                return {
                    ...participant.toObject(),
                    followers: userDetails.followers,
                    following: userDetails.following
                };
            }));

            // Check if there are unread messages for the user in this chat
            const unreadMessagesCount = chat.messages.reduce((count, message) => {
                if (!message.read && message.recipient.equals(userID)) {
                    return count + 1;
                }
                return count;
            }, 0);

            return {
                chatId: chat._id,
                participants: chatParticipants,
                messages: chat.messages.slice(-15), // Last 15 messages
                unreadMessagesCount // Flag indicating if there are unread messages for the user
            };
        }));

        res.json(userMessages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = GetAllMessages;
