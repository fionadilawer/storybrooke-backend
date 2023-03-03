const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/rolesList");
const usersController = require("../../controllers/usersController");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(usersController.getAllUsers)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

module.exports = router;
