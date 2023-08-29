const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  commenter: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
    required: true,
  },
  reply: {
    type: [this],
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
