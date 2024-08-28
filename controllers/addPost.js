const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AnalyzeImageScript = require('./AnalyzeImageScript');
const analyzeVideoScript = require('./analyzeVideoScript');

// Function to format the date as DD.MM.YY-HH:mm
const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2); // Last two digits of the year
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year}-${hours}-${minutes}-${seconds}`;
};

const truncateContent = (content, maxLength) => {
    if (content.length <= maxLength) {
        return content;
    }
    return content.substring(0, maxLength);
};

const AddPost = async (Posts, User, userID, tags, content, images, username, cover, folder,typePost) => {
    const MAX_FOLDER_NAME_LENGTH = 50;

    const _id = new mongoose.mongo.ObjectId(userID);

    // Define the user's folder path
    const userFolderPath = path.join(__dirname, '../uploads', username);

    const truncatedContent = truncateContent(content, MAX_FOLDER_NAME_LENGTH);

    const date = formatDate();

    // Define the post's folder path (caption of the post)
    const postFolderPath = path.join(userFolderPath, truncatedContent, date);

    // Create the folders if they don't exist
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
    }

    if (!fs.existsSync(postFolderPath)) {
        fs.mkdirSync(postFolderPath, { recursive: true });
    }

    // Save files (images and cover) to the folder
    const saveFile = (fileData, fileName, fileType) => {
        return new Promise((resolve, reject) => {
            if (!fileData) {
                return reject(new Error('No file data provided'));
            }
            // Ensure fileData is in Base64 format
            const base64Data = fileType === 'video' ? fileData.replace(/^data:video\/\w+;base64,/, '') : fileData.replace(/^data:image\/\w+;base64,/, '');
            const filePath = path.join(postFolderPath, fileName);
            fs.writeFile(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(filePath);
                }
            });
        });
    };

    // Save images and cover
    const saveFiles = async () => {
        try {
            const imagePromises = images.map((image, index) => {
                const extension = image.type.split('/')[1];
                return saveFile(image.data, `image_${index}.${extension}`, image.type.split('/')[0]);
            });
            const extensionCover = cover.split(':')[1].split(';')[0].split('/')[1];
            const coverPromise = saveFile(cover, `cover.${extensionCover}`, extensionCover);

            // Wait for all files to be saved
            await Promise.all([...imagePromises, coverPromise]);
        } catch (err) {
            throw new Error(`Error saving files: ${err.message}`);
        }
    };

    // Create and save the post
    const createAndSavePost = async () => {
        console.log('typePost ',typePost)
        try {
            // Save files first
            await saveFiles();
            const extensionCover = cover.split(':')[1].split(';')[0].split('/')[1];
            const newPost = new Posts({
                author: _id,
                content,
                tags,
                post_imgs: images.map((_, index) => ({
                    data: path.join(username, truncatedContent, date, `image_${index}.${images[index].type.split('/')[1]}`),
                    type: _.type,
                    name: _.name
                })),
                thumbnail: path.join(username, content, date, `cover.${extensionCover}`),
                username,
                typePost : typePost
            });

            await newPost.save();
            const allTags = [];

            // Create an array of promises using map
            const promises = images.map(async (_image, index) => {
                let tag;
                if (_image.type.split('/')[0] === 'video') {
                    tag = await analyzeVideoScript(path.join(postFolderPath, `image_${index}.${images[index].type.split('/')[1]}`), username, _image.name.split('.')[0]);
                } else {
                    tag = await AnalyzeImageScript(path.join(postFolderPath, `image_${index}.${images[index].type.split('/')[1]}`));
                }
                return tag; // Return the tag to collect in allTags
            });

            // Wait for all promises to resolve
            allTags.push(...await Promise.all(promises));

            await Posts.findByIdAndUpdate(newPost._id, { $push: { tags: allTags.flat() } }, { new: true });

            const user = await User.findOne({ username });
            user.posts += 1;
            await user.save();

            console.log('Post saved');
            return 'Post saved';
        } catch (err) {
            console.error(err);
            throw new Error('Error saving post');
        }
    };

    return await createAndSavePost();
};

module.exports = AddPost;
