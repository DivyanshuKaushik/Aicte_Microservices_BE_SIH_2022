const router = require('express').Router();
const multer = require('multer');
const {Response,uploadImage,deleteImage} = require('./helpers');
// multer config 
const storage = multer.memoryStorage();
const fileFilter = (req,file,cb) => {
    if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/svg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Image uploaded is not of type jpg/jpeg or png"), false);
    }
};
const limits = {
    fileSize: 1024*1024*5,
}
const upload = multer({ storage, fileFilter, limits });

router.post('/upload/:folder', upload.single('image'), async (req, res) => {
    try {
        const image = req.file.buffer;
        const name = req.file.originalname.split('.')[0];
        const image_name = `${req.params.folder}/${name}-${new Date().getTime()}`;
        const url = await uploadImage(image, image_name);
        return res.status(200).json(Response(200, 'Success', url));
    } catch (error) {
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error));
    }
});

router.delete('/deleteImage',async(req,res)=>{
    try{
        const image_name = req.query.image_name;
        const deleted = await deleteImage(image_name);
        return res.status(200).json(Response(200, 'Success', deleted));
    }catch(error){
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error));
    }
})

module.exports = router;