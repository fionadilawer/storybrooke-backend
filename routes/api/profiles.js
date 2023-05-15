const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const profilesController = require("../../controllers/profilesController");
const verifyRoles = require("../../middleware/verifyRoles");

// global routes
// router.route("/").post(profilesController.createProfile);
router.route("/")
.get(profilesController.getProfile)

module.exports = router;
