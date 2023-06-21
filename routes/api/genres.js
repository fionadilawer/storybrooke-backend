const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const genresController = require("../../controllers/genresController");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(genresController.getAllGenres)
  .post(verifyRoles(ROLES_LIST.Admin), genresController.setAllGenres)
  .delete(verifyRoles(ROLES_LIST.Admin), genresController.deleteAllGenres);

router.route("/new").post(genresController.createNewGenre);
router.route("/delete").delete(genresController.deleteGenre);

router.route("/find").get(genresController.getGenre);

module.exports = router;
