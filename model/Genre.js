const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    genre: {
        type: Array,
        default: [],
    }
})

module.exports = mongoose.model("Genre", GenreSchema);