const Genre = require("../model/Genre");

// create a story in a genre
const createStory = async (req, res) => {
  // check if genre exists
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  // check if story exists

  if (genre.stories.find((story) => story.title === req.body.title)) {
    return res
      .status(409)
      .json({ message: `Story ${req.body.title} already exists.` });
  }

  // create story
  const story = {
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
    date: new Date(),
  };

  // add story to genre
  genre.stories.push(story);

  // save genre
  try {
    const result = await genre.save();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

// get all stories in a genre
const getAllStories = async (req, res) => {
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  res.status(200).json(genre.stories);
};

// get a story in a genre
const getStory = async (req, res) => {
  // check if genre exists
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }
  //   check if story exists
  const story = genre.stories.find((story) => story.title === req.body.title);

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  //   return story
  res.status(200).json(story);
};

// update a story in a genre
const updateStory = async (req, res) => {
  // check if genre exists
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  // check if story exists
  const story = genre.stories.find((story) => story.title === req.body.title);

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // update story
  story.title = req.body.title;
  story.author = req.body.author;
  story.body = req.body.body;
  story.date = new Date();

  // save genre
  try {
    const result = await genre.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStory,
  updateStory,
};
