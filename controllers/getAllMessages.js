const mongoose = require("mongoose");

const GetAllMessages = (Messages) => async (req, res) => {
    const { userId } = req.body;
    const userID = new mongoose.Types.ObjectId(userId);
    try {
        const userChats = await Messages.find({participants: userID}).populate('participants').populate('messages.sender').sort({updatedAt: -1}).exec();
        const userMessages = userChats.map(chat => ({
            chatId: chat._id,
            participants: chat.participants,
            messages: chat.messages
          }));
          res.json(userMessages)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = GetAllMessages;
