const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "No bio created.",
  },
  profilePicture: {
    type: String,
    default: "https://www.w3schools.com/howto/img_avatar.png"
  },
  dateJoined: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
