const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: {
        type: Array,
        default: [],
    }
})

module.exports = mongoose.model("Genre", GenreSchema);