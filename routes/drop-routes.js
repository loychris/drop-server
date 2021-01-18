const express = require("express");
const { check } = require("express-validator");
const dropController = require("../controllers/drop-controller");
const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/check-auth');
const optionalAuth = require('../middleware/check-optional-auth');

const router = express.Router();

router.get('/ids', dropController.getAllDropIds)
router.get("/:dropId/comment", dropController.getCommentsForDrop);
router.get("/:dropId", optionalAuth, dropController.getDropById);
router.get("/", dropController.getAllDrops);
router.post("/:dropId/swipe", dropController.swipeDrop);
router.post("/:dropId/save", dropController.saveDrop);
router.post('/drops', optionalAuth, dropController.getDropsByIds);
router.post("/", fileUpload.single('file'), dropController.createDrop);

router.delete("/:dropId", dropController.deleteDrop);
router.patch("/:dropId", dropController.updateDrop);


module.exports = router;
