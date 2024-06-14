const UploadPrfoleImage = (Users) => (req,res) => {
    const profileImage = req.body.profileImage;
    const username = req.body.username;
  if (!profileImage) {
    return res.status(400).json('No file uploaded');
  }
  Users.findOne({username}).then(data => {
    data.profile_img = profileImage;
    data.save();

    res.json('profile image upload')
  }).catch(err => res.json('error'))
}

module.exports = UploadPrfoleImage