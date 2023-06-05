const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const profilesController = require("../../controllers/profilesController");
const verifyRoles = require("../../middleware/verifyRoles");

// global routes
router.route("/").get(profilesController.getAllProfiles);
// update profile
router.route("/:username").put(profilesController.updateProfile);
//   get profile
router.route("/:username").get(profilesController.getProfile);

module.exports = router;
