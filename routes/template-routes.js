const express = require("express");
const { 
    getTemplateById, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
} = require("../controllers/template-controller");

const {
    checkAuth,
    checkOptionalAuth,
    checkAdminAuth,
  } = require('../middleware/check-auth');

const router = express.Router();

router.post("/", checkAdminAuth, createTemplate);
router.get("/:id", checkOptionalAuth, getTemplateById);
router.patch(":id", checkAdminAuth , updateTemplate);
router.delete("/:id", checkAdminAuth, deleteTemplate);


module.exports = router;
