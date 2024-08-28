const mongoose = require('mongoose');

const MessagesSchema = new mongoose.Schema({

  participants: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
  }],     // Array of participant IDs or usernames
  messages: [
    {
      sender: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
        },         // ID or username of the message sender
        recipient: {
          type:mongoose.Schema.Types.ObjectId,
          ref:'Users',
          required:true
          },
      content: String,        // Content of the message
      image: {
        typeFile:{
          type:String,
          default: () => ''
        },
        data:{
          type:String,
          default: () => ''
        },
      },
      timestamp: {
        type:Date,
        default: () => Date.now()
        },        // Timestamp indicating when the message was sent
      read: {
        type:Boolean,
        default: false
      }       // Array of participant IDs who have read the message
    }
  ],
  createdAt: {
    type:Date,
    default: () => Date.now()
    },            // Timestamp indicating when the chat session was created
  updatedAt: {
    type:Date,
    default: () => Date.now()
    }           // Timestamp indicating when the chat session was last updated (e.g., new message)
})

module.exports = mongoose.model('Messages',MessagesSchema)
