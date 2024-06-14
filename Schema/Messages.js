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
      content: String,        // Content of the message
      timestamp: {
        type:Date,
        default: () => Date.now()
        },        // Timestamp indicating when the message was sent
      readBy: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
    }]        // Array of participant IDs who have read the message
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
