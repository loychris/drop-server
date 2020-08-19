const express = require("express");
const { check } = require("express-validator");

const dropController = require("../controllers/drop-controller");
const drop = require("../models/drop");

const router = express.Router();

router.get('/ids', dropController.getAllDropIds)
router.get("/:dropId/comment", dropController.getCommentsForDrop);
router.get("/:dropId", dropController.getDropById);
router.get("/", dropController.getAllDrops);
router.post("/", dropController.createDrop);
router.post("/:dropId/swipe", dropController.swipeDrop);
router.post("/:dropId/save", dropController.saveDrop);
router.delete("/:dropId", dropController.deleteDrop);
router.patch("/:dropId", dropController.updateDrop);


module.exports = router;
