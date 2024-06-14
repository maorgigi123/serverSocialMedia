
const LoginUser = (Users,bcrypt) => async(req,res) => {
    const {username,password,email} = req.body;

    Users.findOne((email) ? {email:email} : {username:username})
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