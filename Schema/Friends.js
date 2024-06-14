const mongoose = require('mongoose');

const FriendstSchema = new mongoose.Schema({
    user1_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    user2_id:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Friends',FriendstSchema)
