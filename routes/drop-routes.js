const express = require("express");
const { check } = require("express-validator");
const dropController = require("../controllers/drop-controller");
const fileUpload = require('../middleware/file-upload');
const {
    checkAuth,
    checkOptionalAuth,
    checkAdminAuth
} = require('../middleware/check-auth');

const router = express.Router();

router.get('/api/drop/ids', dropController.getAllDropIds)
router.get("/api/drop/:dropId/comment", dropController.getCommentsForDrop);
router.get("/api/drop/:dropId", checkOptionalAuth, dropController.getDropById);
router.get("/api/drop/", dropController.getAllDrops);
router.post("/api/drop/:dropId/swipe", checkOptionalAuth, dropController.swipeDrop);
router.post("/api/drop/:dropId/save", dropController.saveDrop);
router.post('/api/drop/drops', checkOptionalAuth, dropController.getDropsByIds);
router.post("/api/drop/", checkAuth, fileUpload.single('file'), dropController.createDrop);

router.delete("/api/drop/:dropId", dropController.deleteDrop);
router.patch("/api/drop/:dropId", dropController.updateDrop);


module.exports = router;
