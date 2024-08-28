const mongoose = require("mongoose");

const LoadMoreMessages = (Messages) => async (req, res) => {
    const { chatId, limit = 15, AllId = [] } = req.body;
    const _chatId = new mongoose.Types.ObjectId(chatId);
    console.log('Loading more messages with limit:', limit);

    try {
        const chatAggregation = await Messages.aggregate([
            { $match: { _id: _chatId } },
            { 
                $project: { 
                    messages: { $reverseArray: "$messages" }, // Reverse the messages array to start with the newest
                    participants: 1 
                } 
            },
            { $unwind: '$messages' },
            { 
                $match: { 
                    "messages._id": { $nin: AllId.map(id => new mongoose.Types.ObjectId(id)) } // Exclude messages with IDs in AllId
                } 
            },
            { $limit: parseInt(limit) }, // Limit the number of messages returned
            { $lookup: {
                    from: 'users',
                    localField: 'messages.sender',
                    foreignField: '_id',
                    as: 'senderDetails'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    participants: { $first: '$participants' },
                    messages: { 
                        $push: { 
                            message: '$messages', 
                            senderDetails: { $arrayElemAt: ['$senderDetails', 0] } 
                        } 
                    }
                }
            }
        ]);

        if (!chatAggregation.length) {
            return res.status(404).json({ error: 'Chat not found or no messages' });
        }

        const chat = chatAggregation[0];
        const messages = chat.messages.map(item => ({
            ...item.message,
            sender: item.senderDetails
        }));

        res.json({
            chatId: chat._id,
            participants: chat.participants,
            messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = LoadMoreMessages;
