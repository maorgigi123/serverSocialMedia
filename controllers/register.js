const HandleRegister = (Users,bcrypt) => async(req,res) => {


    const {fullName,username,password,email} = req.body;
    const have_user = await Users.exists({username:username})
    const have_email = await Users.exists({email:email})
    if(have_user)
        return res.status(404).json('this username is alerdy in used');
    if(have_email)
        return res.status(404).json('this email is alerdy in used');
    const bcrypsPassword = bcrypt.hashSync(password);
    try{
        const user = new Users({
            username,
            password:bcrypsPassword,
            fullName,
            email
        })
        user.save().then((user) => res.json(user));
    }
    catch(e){
        res.json.status(404).json('error');
    }
    
}

module.exports = HandleRegister;