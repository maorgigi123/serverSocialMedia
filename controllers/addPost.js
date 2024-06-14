const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const AddPost = (Posts,User) => (req,res) => {
    if (req.body === undefined) {
    return res.status(413).send('Request Entity Too Large');
    }
    
    const userID = req.body.userId;
    const tags = req.body.tags;
    const content = req.body.content;
    const images = req.body.images;
    const username = req.body.username;
    const cover = req.body.cover;

    const _id = new mongoose.mongo.ObjectId(userID);
    const newPost = new Posts({
        author:_id,
        content,
        tags:tags,
        post_imgs:images,
        thumbnail:cover,
        username
    })
    
    newPost.save().then(savePost => {
        User.findOne({username:username}).then(user => {user.posts+=1; user.save()})
        return res.json('post save')
    }).catch(err =>{
        console.log(err)
        return res.status(400).json('error')
    })

        
    
}

module.exports = AddPost;