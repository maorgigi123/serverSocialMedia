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
    }],
    typePost:{
        type:String,
        default:'post'
    },
    views: [{
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Users'
        },
        count: {
            type: Number,
            default: 0
        }
    }],
    totalViews: {
        type: Number,
        default: 0
    },
    rankScore: { // New field to store the calculated rank score
        type: Number,
        default: 0
    },
    selectedImages: [{
        imageIndex: Number, // The index of the selected image in post_imgs
        users: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Users'
        }]
    }],
    totalSelections: {
        type: Number,
        default: 0
    }
})


module.exports = mongoose.model('Posts',PostsSchema)