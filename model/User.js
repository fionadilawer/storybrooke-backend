const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Profile = require("./Profile");
const Story = require("./Story");

const UserSchema = new Schema({
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
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Editor: Number,
    Admin: Number,
  },
  interests: {
    type: Array,
    default: [],
  },
  stories: {
    type: [Story.schema],
    default: [],
  },
  profile: {
    type: Profile.schema,
    default: null,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

module.exports = mongoose.model("User", UserSchema);
