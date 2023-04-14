const Genre = require("../model/Genre");

// prettier-ignore
const genres = [
  "Fiction", "Non-Fiction", "Romance", "Thriller", "Who-done-it", "Historical", "Western", "Fantasy", "Paranormal", "Sci-Fi", "Food", "Fashion", "Mystery", "Horror", "Adventure", "Dystopian", "Young Adult", "Children's", "Coming of Age", "Folklore", "Poetry", "Technology", "Art", "Music", "Books", "Education", "Philosophy", "Psychology", "Society", "Environment", "Economics", "Crafts", "Gardening", "Home Improvement", "Travel", "Self-Help", "Health", "Fitness", "Biography", "Memoir", "Politics", "Religion", "Sports", "Entertainment"
];

// set all genres to database based on model/Genre.js
const setAllGenres = async (req, res) => {
  // drop all indices

  try {
    await Genre.collection.dropIndexes();
    const result = await Genre.insertMany(
      genres.sort().map((genre) => ({ genre }))
    );
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

// GET all genres
const getAllGenres = async (req, res) => {
  const genres = await Genre.find();
  if (!genres)
    return res.status(204).json({
      message: "No genres found.",
    });
  res.status(200).json(genres);
};

// POST new genre
const createNewGenre = async (req, res) => {
  if (!req.body.genre)
    return res.status(400).json({ message: "Genre is required." });

  try {
    const result = await Genre.create({
      genre: req.body.genre,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

// GET genre
const getGenre = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  const genre = await Genre.findOne({
    _id: req.params.id,
  }).exec();

  if (!genre) {
    return res.status(204).json({
      message: `No genre matches ID ${req.params.id}.`,
    });
  }
  res.json(genre);
};

// delete all genres
const deleteAllGenres = async (req, res) => {
  try {
    const result = await Genre.deleteMany({});
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

// delete one genre
const deleteGenre = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  const genre = await Genre.findOne({ _id: req.body.id }).exec();

  if (!genre)
    return res
      .status(204)
      .json({ message: `No genre matches ID ${req.body.id}.` });

  try {
    const result = await Genre.deleteOne({ _id: req.body.id });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getAllGenres,
  createNewGenre,
  getGenre,
  setAllGenres,
  deleteAllGenres,
  deleteGenre,
};
