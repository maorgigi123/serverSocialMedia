const mongoose = require("mongoose");

const sendMessage = async(MessagesScheme,sender,recipient,content) => {
  const Sender = new mongoose.Types.ObjectId(sender);
  const Recipient = new mongoose.Types.ObjectId(recipient);
  try {
    let chat = await MessagesScheme.findOne({
        participants: { $all: [Sender, Recipient] }
      });

      if (chat) {
        const newMessage = {
            sender: Sender,
            content: content,
            readBy: [] 
          };

        const updatedChat = await MessagesScheme.findOneAndUpdate(
            {participants: { $all: [Sender, Recipient]}}, // Find the chat by its ID
            {
              $push: { messages: newMessage }, // Push the new message into the messages array
              $set: { updatedAt: new Date() }  // Update the updatedAt timestamp
            },
            { new: true } // Return the updated document
          );
        return updatedChat
      }

   const newMessage = await new MessagesScheme({
    participants: [Sender,Recipient],
    messages: {
        sender: Sender,
        content: content,
        readBy: [] 
    }
    }).save();
    
   return newMessage
  } catch (e) {
    console.error(e);
    return false
  }
};

module.exports = sendMessage;
