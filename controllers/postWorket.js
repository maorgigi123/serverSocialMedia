const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const AnalyzeImageScript = require('./AnalyzeImageScript');
const analyzeVideoScript = require('./analyzeVideoScript');

// Extract worker data
const { userID, tags, content, images, username, cover, folder } = workerData;

// Define helper functions
const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
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

const saveFile = (fileData, fileName, fileType) => {
    return new Promise((resolve, reject) => {
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

// Save files and process tags
const saveFilesAndProcess = async () => {
    const MAX_FOLDER_NAME_LENGTH = 50;
    const truncatedContent = truncateContent(content, MAX_FOLDER_NAME_LENGTH);
    const date = formatDate();
    const userFolderPath = path.join(__dirname, '../uploads', username);
    const postFolderPath = path.join(userFolderPath, truncatedContent, date);

    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
    }
    if (!fs.existsSync(postFolderPath)) {
        fs.mkdirSync(postFolderPath, { recursive: true });
    }

    const imagePromises = images.map((image, index) => {
        const extension = image.type.split('/')[1];
        return saveFile(image.data, `image_${index}.${extension}`, image.type.split('/')[0]);
    });
    const extensionCover = cover.split(':')[1].split(';')[0].split('/')[1];
    const coverPromise = saveFile(cover, `cover.${extensionCover}`, extensionCover);

    await Promise.all([...imagePromises, coverPromise]);

    const allTags = [];
    const tagPromises = images.map(async (_image, index) => {
        const filePath = path.join(postFolderPath, `image_${index}.${_image.type.split('/')[1]}`);
        let tag;
        if (_image.type.split('/')[0] === 'video') {
            tag = await analyzeVideoScript(filePath, username, _image.name.split('.')[0]);
        } else {
            tag = await AnalyzeImageScript(filePath);
        }
        return tag;
    });

    allTags.push(...await Promise.all(tagPromises));

    parentPort.postMessage({ status: 'success', tags: allTags.flat() });
};

saveFilesAndProcess().catch(err => {
    parentPort.postMessage({ status: 'error', message: err.message });
});
