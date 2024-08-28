const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const modelPromise = cocoSsd.load();
let tags = []
async function analyzeImage(imagePath) {
    try{
        const model = await modelPromise;
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    const predictions = await model.detect(canvas);
    const tagsSet = new Set();

    predictions.forEach(prediction => {
        console.log(`Detected ${prediction.class} with ${Math.round(prediction.score * 100)}% confidence.`);
        tagsSet.add(prediction.class);
        // Save or use the prediction data
    });
    tags =  Array.from(tagsSet)
     
    return predictions;
    }catch(e){
        console.log('Error analyzing image for',imagePath)
    }
}

// analyzeImage('/Users/maorgigi/Desktop/ServerSocialMedia/uploads/maor gigi/Sss/30.07.24-16-07-26/cover.png').then(predictions => {
//     console.log(tags)
// });

const AnalyzeImageScript = async(pathImage) => {
    return await analyzeImage(pathImage).then(predictions => {
        return tags.flat()
    }).catch((error) =>{
        console.log(error)
        return []
    })
}

module.exports = AnalyzeImageScript;
