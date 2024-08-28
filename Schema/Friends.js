const mongoose = require('mongoose');

const FriendstSchema = new mongoose.Schema({
    follower: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    following:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Freinds',FriendstSchema)
