const mongoose = require('mongoose');



const PostsSchema =new mongoose.Schema({
    author:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Users"
    },
    username:String,
    content:String,
    createdAt: {
        type:Date,
        default: () => Date.now()
    },
    post_imgs : [{}],
    thumbnail:{
        type:String,
        default: () => ""
    },
    tags:[{type:String}],
    saves:{
        type:Number,
        default:0
    },
    likesCount:{
        type:Number,
        default:0
    },
    likes: [{
        type:mongoose.SchemaTypes.ObjectId,
        ref: 'Users'
    }],
    commentsCount:{
        type:Number,
        default:0
    },
    comments:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref: 'Comments'
    }]
})


module.exports = mongoose.model('Posts',PostsSchema)