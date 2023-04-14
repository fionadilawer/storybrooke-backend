const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const storyController = require("../../controllers/storyController");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/:genre")
  .get(storyController.getAllStories)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.createStory
  )
    .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.updateStory
    )

router
    .route("/:genre/find").get(storyController.getStory);

module.exports = router;
