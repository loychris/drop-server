const express = require("express");
const { check } = require("express-validator");
const imageController = require("../controllers/image-controller");
const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/check-auth');
const optionalAuth = require('../middleware/check-optional-auth');

const router = express.Router();

router.post("/", auth, fileUpload.single('file'), imageController.createImage);
router.get("/:imageId", optionalAuth, imageController.getImage);
router.delete("/:imageId", imageController.deleteImage);
router.patch("/:imageId", imageController.updateImage);


module.exports = router;
caht
