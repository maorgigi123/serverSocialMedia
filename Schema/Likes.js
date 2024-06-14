const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Likes',LikeSchema)