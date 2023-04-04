const express = require("express");
const router = express.Router();
const interestsController = require("../controllers/interestsController");

router
  .route("/")
  .put(interestsController.updateUserInterests);


module.exports = router;
