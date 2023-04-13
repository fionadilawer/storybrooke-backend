const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const genresController = require("../../controllers/genresController");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(genresController.getAllGenres)
  // .post(genresController.createNewGenre);
  .post(verifyRoles(ROLES_LIST.Admin), genresController.setAllGenres);

router.route("/:id").get(genresController.getGenre);

module.exports = router;
