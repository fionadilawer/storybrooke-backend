const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Story = require("./Story");

const GenreSchema = new Schema({
  genre: {
    type: String,
    required: true,
    unique: true,
  },
  stories: {
    type: [Story.schema],
    required: true,
  },
});

module.exports = mongoose.model("Genre", GenreSchema);
