const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    username:String,
    fullName:String,
    email:String,
    password:String,
    biography:{
        type:String,
        default:() => "new at Gigs"
    },
    blocked_by_viewer:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Users"
    }],
    profile_img:{
        type:String,
        default:() => "https://i0.wp.com/www.stignatius.co.uk/wp-content/uploads/2020/10/default-user-icon.jpg?fit=415%2C415&ssl=1"
    },
    interests:[{type:String}],
    posts:{
        type:Number,
        default:0
    },
    followers_count:{
        type:Number,
        default:() => 0
    },
    following_count:{
        type:Number,
        default:() => 0
    },
    followers : [{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Freinds"
    }],
    following : [{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Freinds"
    }],
})

module.exports = mongoose.model('Users',UserSchema)