const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts',
        required:true
    },
    user_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    content:{
        type:String,
        required:true
    },
    likesCount:{
        type:Number,
        default:0
    },
    likes: [{
        type:mongoose.SchemaTypes.ObjectId,
        ref: 'Users'
    }],
    createdAt:{
        type:Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Comments',CommentSchema)
