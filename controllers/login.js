
const LoginUser = (Users,bcrypt) => async(req,res) => {
    const {username,password,email} = req.body;
    Users.findOne((email) ? {email:email} : {username:username})
    .populate({
        path: 'following',
        populate: { path: 'following' }, // Populate following within following
        perDocumentLimit:7 // Limit comments to 5 per document
    })
    .populate({
        path: 'followers',
        populate: { path: 'follower' }, // Populate followers within followers
        perDocumentLimit:7 // Limit comments to 5 per document
    })
    .then(data => {
        const isValid = bcrypt.compareSync(password,data.password);

        if(isValid){
            return res.json(data)
        }
        else{
            return res.status(400).json('wrong credentials')
        }
    }).catch(_ => res.status(404).json('wrong credentials'))
}

module.exports = LoginUser;