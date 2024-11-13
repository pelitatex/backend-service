import sharp from "sharp";
import fs from "fs";

async function compressImage(fileInput, outputPath) {
    let quality = 70;
    console.log(fileInput);

    if (fileInput.size > 20000 * 1024) {
        quality = 10;
    }else if(fileInput.size > 10000 * 1024) {
        quality = 15;
    } else if (fileInput.size > 7000 * 1024) {
        quality = 20;
    } else if (fileInput.size > 5000 * 1024) {
        quality = 30;
    } else if (fileInput.size > 1750 * 1024) {
        quality = 35;
    } else if (fileInput.size > 1000 * 1024) {
        quality = 50;
    }
    try {
        sharp.cache(false);
        await sharp(fileInput.path)
            .jpeg({ quality: quality })
            .toFile(outputPath, (err, info) => {
                if (err) {
                    console.error('Error compressing image:', err);
                }

                fs.unlinkSync(fileInput.path, (err) => {
                    if (err) {
                        console.error('Error deleting original image:', err);
                    }
                });
            });
        console.log('Image compressed successfully');
    } catch (error) {
        console.error('Error compressing image:', error);
    }
}

// Example usage
export default compressImage;