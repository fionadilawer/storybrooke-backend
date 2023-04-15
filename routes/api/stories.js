const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const storyController = require("../../controllers/storyController");
const verifyRoles = require("../../middleware/verifyRoles");

// global routes
router
  .route("/")
  // .get(storyController.getAllStories)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.createStory
  )
  .delete(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.deleteStory
  )
  .get(storyController.getAllStoriesGlobal);

router.route("/find").get(storyController.getStoryAllGenres);

// specific genre
router
  .route("/:genre")
  .get(storyController.getAllStories)
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.updateStory
  )
  .delete(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storyController.deleteStoryGenre
  );

router.route("/:genre/find").get(storyController.getStory);

module.exports = router;
