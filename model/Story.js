const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    default: "Anonymous", 
  },
  body: {
    type: [String],
    required: true,
  },
  genres: {
    type: [String],
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("Story", StorySchema);
