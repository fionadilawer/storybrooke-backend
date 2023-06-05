const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const storiesController = require("../../controllers/storiesController");
const verifyRoles = require("../../middleware/verifyRoles");

// global routes
router
  .route("/")
  // .get(storiesController.getAllStories)
  .post(storiesController.createStory)
  .delete(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storiesController.deleteStory
  )
  .get(storiesController.getAllStoriesGlobal);

// specific genre
router
  .route("/:id")
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    storiesController.updateStory
  );
router.route("/title/:title").get(storiesController.getStoryAllGenres);

router.route("/count").get(storiesController.countStoriesGlobal);

router.route("/author/:author").get(storiesController.getStoriesByAuthor);

router
  .route("/:genre")
  .get(storiesController.getAllStories)

  // .delete(
  //   verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  //   storiesController.deleteStoryGenre
  // );

router.route("/:genre/find").get(storiesController.getStory);

module.exports = router;
