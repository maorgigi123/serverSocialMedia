const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String, folderPath, filename) => {
    // Define the path where the image will be save
    const _folderPath = path.join(__dirname,'../uploads',folderPath); // Adjust __dirname as needed
    const filePath = path.join(_folderPath, filename);

    // Ensure the directory exists
    if (!fs.existsSync(_folderPath)) {
      fs.mkdirSync(_folderPath, { recursive: true });
    }else {
      // Clear the folder before saving the new image
      clearFolder(_folderPath);
    }

    // Extract the base64 data part
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    // Write the binary data to a file
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error saving image:', err);
      } else {
        console.log('Image saved successfully:', filePath);
      }
    });
  };

  const clearFolder = (folderPath) => {
    // Remove all files in the folder
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
      files.forEach(file => {
        fs.unlink(path.join(folderPath, file), err => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      });
    });
  };
const UploadPrfoleImage = (Users) => (req,res) => {
    const profileImage = req.body.profileImage;
    const profileImageType = req.body.profileImageType;
    const username = req.body.username;
    const filename = `profile_img${Date.now()}.${profileImageType.split('/')[1]}`;
    const folderPath = path.join('Profiles',username); // Adjust __dirname as needed
    if (!profileImage) {
      return res.status(400).json('No file uploaded');
    }
    saveBase64Image(profileImage, folderPath,filename);



      Users.findOne({username}).then(data => {
        data.profile_img = path.join(folderPath,filename);
        data.save();

        res.json(path.join(folderPath,filename))
      })
      .catch(err => res.json('error'))
}

module.exports = UploadPrfoleImage