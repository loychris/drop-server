const express = require("express");
const { check } = require("express-validator");
const imageController = require("../controllers/image-controller");
const fileUpload = require('../middleware/file-upload');
const {
    checkAuth,
    checkOptionalAuth
} = require('../middleware/check-auth');

const router = express.Router();

router.post("/", checkAuth, fileUpload.single('file'), imageController.createImage);
router.get("/:imageId", checkOptionalAuth, imageController.getImageById);
router.delete("/:imageId", checkAuth, imageController.deleteImage);
router.patch("/:imageId", checkAuth, fileUpload.single('file'), imageController.updateImage);


module.exports = router;

