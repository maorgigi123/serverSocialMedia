const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// טעינת המודל
const modelPromise = cocoSsd.load();
let tags = []
// פונקציה לניתוח תמונה
async function analyzeImage(imagePath) {
    const model = await modelPromise;
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    const predictions = await model.detect(canvas);
    const tagsSet = new Set();

    predictions.forEach(prediction => {
        // console.log(`Detected ${prediction.class} with ${Math.round(prediction.score * 100)}% confidence.`);
        tagsSet.add(prediction.class);
    });
    
    tags =  Array.from(tagsSet)
    return predictions;
}

// פונקציה לחילוץ פריימים מווידאו
function extractFrames(videoPath, outputDir) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .on('end', resolve)
            .on('error', reject)
            .screenshots({
                count: 10,
                folder: outputDir,
                size: '320x240'
            });
    });
}

// פונקציה לניתוח ווידאו
async function analyzeVideo(videoPath,username,imageName) {
    const framesDir = path.join(__dirname, 'temp', username, imageName);

    try {
        await fs.mkdirSync(framesDir, { recursive: true });
    } catch (error) {
        console.error(`Failed to create directory ${framesDir}:`, error);
    }
    await extractFrames(videoPath, framesDir);
    
    const files = fs.readdirSync(framesDir);
    for (const file of files) {
        const filePath = path.join(framesDir, file);
        const predictions = await analyzeImage(filePath);
        // Process predictions
    }

    return tags
}

// פונקציה למחיקת תיקיה ותוכנה
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        // console.log(`Deleted folder: ${folderPath}`);
    } else {
        console.log(`Folder not found: ${folderPath}`);
    }
}
// קריאה לפונקציה לניתוח ווידאו

const analyzeVideoScript = async(pathVideo, username,imageName) => {
    return await analyzeVideo(pathVideo,username,imageName).then((data) => {
        deleteFolderRecursive(path.join(__dirname, 'temp', username, imageName))
        return tags.flat();
    }).catch((error) =>{
        console.log(error)
    })
    
}

module.exports = analyzeVideoScript;

