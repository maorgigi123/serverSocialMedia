const mongoose = require("mongoose");

const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String, folderPath, filename) => {
    // Define the path where the image will be save
    const _folderPath = path.join(__dirname,'../uploads',folderPath); // Adjust __dirname as needed
    const filePath = path.join(_folderPath, filename);

    // Ensure the directory exists
    if (!fs.existsSync(_folderPath)) {
      fs.mkdirSync(_folderPath, { recursive: true });
    }

    // Extract the base64 data part
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    // Write the binary data to a file
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error saving image:', err);
      } else {
        console.log('Image saved successfully:', filePath);
      }
    });
  };


const sendMessage = async(MessagesScheme,sender,recipient,content,image,recipientName,senderName) => {
  const Sender = new mongoose.Types.ObjectId(sender);
  const Recipient = new mongoose.Types.ObjectId(recipient);
  const filename = `image_${Date.now()}.${image.typeFile.split('/')[1]}`;
  const folderPath = path.join('Messages',senderName,recipientName); // Adjust __dirname as needed
  if(image === undefined){
    image = {typeFile:'',data:''}
  }
  try {
    let chat = await MessagesScheme.findOne({
        participants: { $all: [Sender, Recipient] }
      });

      if (chat) {
        const newMessage = {
            sender: Sender,
            recipient:Recipient,
            content: content,
            image:{
              typeFile:image.typeFile,
              data: image.data.length >0 ? path.join(folderPath,filename) : image.data
            },
            readBy: [] 
          };
           // Save image if it exists
            if (image.data.length > 0) {              
              saveBase64Image(image.data, folderPath,filename);
            }

        const updatedChat = await MessagesScheme.findOneAndUpdate(
            {participants: { $all: [Sender, Recipient]}}, // Find the chat by its ID
            {
              $push: { messages: newMessage }, // Push the new message into the messages array
              $set: { updatedAt: new Date() }  // Update the updatedAt timestamp
            },
            { new: true } // Return the updated document
          ).populate('participants') // Populate participants
          .populate('messages.sender') // Populate sender in messages
          .populate('messages.recipient') // Populate recipient in messages
          .exec();;

        return {message: updatedChat.messages[updatedChat.messages.length - 1] , chatId : updatedChat._id}
      }

      if (image.data.length >0) {              
        saveBase64Image(image.data, folderPath,filename);
      }

   const newMessage = await new MessagesScheme({
    participants: [Sender,Recipient],
    messages: {
        sender: Sender,
        recipient:Recipient,
        content: content,
        image:{
          typeFile:image.typeFile,
          data: image.data.length >0 ? path.join(folderPath,filename) : image.data
        },
        readBy: [] 
    }
    })
    const savedChat = await newMessage.save()

    const populatedChat = await MessagesScheme.findById(savedChat._id)
    .populate('participants') // Populate participants
    .populate('messages.sender') // Populate sender in messages
    .populate('messages.recipient') // Populate recipient in messages
    .exec();
    console.log(populatedChat._id)
    return {message:populatedChat.messages[0] , chatId : populatedChat._id}

  } catch (e) {
    console.error(e);
    return false
  }
};

module.exports = sendMessage;
