const mongoose = require('mongoose');

// Define the Reply schema
const ReplySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    replayTo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: false
    },
    content: {
        type: String,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

// Define the Comment schema
const CommentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    replies: [ReplySchema],  // Embed ReplySchema as an array of subdocuments
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

module.exports = mongoose.model('Comments', CommentSchema);
