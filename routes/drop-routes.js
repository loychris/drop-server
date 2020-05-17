const express = require("express");
const { check } = require("express-validator");

const dropController = require("../controllers/drop-controller");

const router = express.Router();

router.get("/:dropId", dropController.getDropById);

router.delete("/:dropId", dropController.deleteDrop);

router.patch("/:dropId", dropController.updateDrop);

router.post("/", dropController.createDrop);

router.post("/:dropId/swipe", dropController.swipeDrop);

router.post("/:dropId/save", dropController.saveDrop);



module.exports = router;
