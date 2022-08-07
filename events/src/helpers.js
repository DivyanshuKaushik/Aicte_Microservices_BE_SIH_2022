const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
function Response(status=200,message="success",data=[]){
    return {status,message,data};
}

/** upload image to AWS S3 */
const uploadImage = (image, name) => {
    config()
    return new Promise(async (resolve, reject) => {
        try {
            // optimize and convert image to webp format
            const optimized_image = await sharp(image).webp().toBuffer();
            // image name as webp extension
            const img_name = `${name}.webp`;
            // upload image to s3 bucket
            const upload = await s3
                .upload({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Body: optimized_image,
                    Key: img_name,
                    ContentType: "image/webp",
                    ACL: "public-read",
                })
                .promise();
            // return url of uploaded image
            return resolve(upload.Location);
        } catch (error) {
            return reject((error));
        }
    });
};
/** upload image to AWS S3 - end */

/** delete image from AWS S3 bucket */
const deleteImage = (name) => {
    config()
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: name,
            };
            // delete image from bucket
            const remove = await s3.deleteObject(params).promise();
            if (!remove) {
                throw new Error("Error");
            }
            return resolve("Image Deleted Successfully!!");
        } catch (error) {
            return reject(Error("Error Deleting Image!!"));
        }
    });
};
/** delete image from AWS S3 bucket - end */
module.exports = {Response,uploadImage,deleteImage};