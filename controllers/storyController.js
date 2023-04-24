const mongoose = require("mongoose");
const Genre = require("../model/Genre");

// CREATE A NEW STORY
const createStory = async (req, res) => {
  // story object
  const story = {
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
    genres: req.body.genres,
    date: new Date(),
  };

  // if body is less than 50 characters, return error
  // if (story.body.length < 50) {
  //   return res.status(400).json({
  //     message: "Story body must be at least 50 characters.",
  //   });
  // }

  // check if genre exists and update story by removing non-existent genres

  for (let i = 0; i < story.genres.length; i++) {
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();
    if (!genre || story.genres.indexOf(story.genres[i]) !== i) {
      story.genres.splice(i, 1);
      i--;
      continue;
    }
  }

  //  check if story content/body exists in any genre
  const result = await Genre.findOne({
    stories: { $elemMatch: { body: story.body } },
  }).exec();

  if (result) {
    return res.status(400).json({
      message: `The story you're trying to add already exists in at least one genre in the database (i.e. ${result.genre}). Please come up with a new story. If you want to add this story to another genre, please use the update story route.`,
    });
  }

  //   find the genres and add the story to them
  for (let i = 0; i < req.body.genres.length; i++) {
    // find genre in db
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();

    // check if story title exists in the genre
    if (genre.stories.find((story) => story.title === req.body.title)) {
      // remove the genre from the story's genres array
      story.genres.splice(i, 1);
      i--;
      continue;
    }

    // check if genres length is greater than 3
    if (story.genres.length > 3) {
      // remove anything after the 3rd index
      story.genres.splice(3, story.genres.length - 3);
    }

    // push story to genre
    genre.stories.push(story);

    // save story in genre
    try {
      const result = await genre.save();
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }

  // if by this point no genres are valid, return message
  if (story.genres.length === 0) {
    return res.status(400).json({
      message: `It appears that none of the genres you specified were valid options. The most likely reason is that the title of the story you're trying to add already exists in the genres you specified. Please change the title or the genres and try again.`,
      // message: `It appears that none of the genres you specified were valid options. Please go through the following exceptions to understand what went wrong Exceptions: 1. A genre is not allowed to have multiple similar titles for a story as this creates confusion for the user. Please change the title of the story and try again. 2. If the story's content already exists in the database, the story will not be added to any genre. We encourage originality and creativity. Therefore, each story must be unique. While titles can be shared across genres, the content must be unique. 3. If the genre you specified does not exist, the story will not be added to that genre. Please check the spelling of the genre and try again. Thank you for your understanding.`,
    });
  }

  res.status(201).json({
    message: `The story ${story.title} has been successfully published in genres ${story.genres}. Note: If any of the specified genres are missing, it is because the story's title already exists in that genre.`,
    // message: `Story ${story.title} created in genres ${story.genres}. Exceptions: 1. If the story's title already exists in a specified genre or a genre simply doesn't exist, the story will not be added to the specified genres. 2. Moreover, if the story's content already exists in the database, the story will not be added to any genre. We encourage originality and creativity. Therefore, each story must be unique. While titles can be shared across genres, the content must be unique. Also, it creates less confusion for the user if a specific genre does not have multiple stories with the same title. Thank you for your understanding.`,
  });
};

// get all stories in a genre
const getAllStories = async (req, res) => {
  const genre = await Genre.findOne({ genre: req.params.genre }).exec();

  if (!genre) {
    return res
      .status(404)
      .json({ message: `Genre ${req.params.genre} not found.` });
  }

  // if no stories in genre
  if (genre.stories.length === 0) {
    return res
      .status(200)
      .json({ message: `No stories found in genre ${req.params.genre}.` });
  }

  res.status(200).json(genre.stories);
};

// GET A STORY IN A SPECIFIC GENRE
const getStory = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

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

// GET A STORY IN ALL GENRES
const getStoryAllGenres = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

  // check if story exists in any genre
  const story = await Genre.findOne({
    stories: { $elemMatch: { title: req.body.title } },
  }).exec();

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // return story
  const result = story.stories.find((story) => story.title === req.body.title);
  res.status(200).json(result);
};

//  UPDATE STORY GLOBALLY

const updateStory = async (req, res) => {
  // check if params are empty
  if (!req?.params?.id)
    return res.status(400).json({ message: "Story ID is required." });

  // check if body is empty
  if (!req.body.title || !req.body.author || !req.body.body || !req.body.genres)
    return res.status(400).json({
      message: `All fields are required. Please enter the title, author, body, and genres.`,
    });

  // check if story exists in any genre in db
  const story = await Genre.findOne({
    stories: { $elemMatch: { _id: req?.params?.id } },
  }).exec();

  // if story doesn't exist
  if (!story) {
    return res.status(404).json({
      message: `Story ${req.body.title} not found in the database.`,
    });
  }

  // create the new story
  const newStory = {
    _id: req?.params?.id,
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
    genres: req.body.genres,
    date: new Date(),
  };

  // check if the new story story body already exists in the db with a different id

  const storyExists = await Genre.findOne({
    stories: {
      $elemMatch: {
        body: newStory.body,
        _id: { $ne: req?.params?.id },
      },
    },
  }).exec();

  if (storyExists) {
    return res.status(400).json({
      message: `Story ${req.body.title} already exists in the database. Please come up with a unique story. Thank you for your understanding.`,
    });
  }

  // remove story from the db
  const result = await Genre.updateMany(
    { stories: { $elemMatch: { _id: req?.params?.id } } },
    { $pull: { stories: { _id: req?.params?.id } } }
  ).exec();

  // check if genre exists and update story by removing non-existent genres

  for (let i = 0; i < newStory.genres.length; i++) {
    const genre = await Genre.findOne({ genre: newStory.genres[i] }).exec();
    if (!genre || newStory.genres.indexOf(newStory.genres[i]) !== i) {
      newStory.genres.splice(i, 1);
      i--;
      continue;
    }

    // check if any of the remaining genres already have the story title
    const storyExists = await Genre.findOne({
      genre: newStory.genres[i],
      stories: { $elemMatch: { title: newStory.title } },
    }).exec();

    if (storyExists) {
      newStory.genres.splice(i, 1);
      i--;
      continue;
    }
  }

  // check if any of the remaining genres already have the story title
  // for (let i = 0; i < newStory.genres.length; i++) {
  //   const genre = await Genre.findOne({
  //     genre: newStory.genres[i],
  //     stories: { $elemMatch: { title: newStory.title } },
  //   }).exec();

  //   if (genre) {
  //     newStory.genres.splice(i, 1);
  //     i--;
  //     continue;
  //   }
  // }

  // check if genres length is greater than 3
  if (newStory.genres.length > 3) {
    // remove anything after the 3rd index
    newStory.genres.splice(3, newStory.genres.length - 3);
  }

  // if by this point no genres are valid, return message
  if (newStory.genres.length === 0) {
    return res.status(400).json({
      message: `It appears that none of the genres you specified were valid options. The most likely reason is that the title of the story you're trying to add already exists in the genres you specified. Please change the title or the genres and try again.`,
      // message: `It appears that none of the genres you specified were valid options. Please go through the following exceptions to understand what went wrong Exceptions: 1. A genre is not allowed to have multiple similar titles for a story as this creates confusion for the user. Please change the title of the story and try again. 2. If the story's content already exists in the database, the story will not be added to any genre. We encourage originality and creativity. Therefore, each story must be unique. While titles can be shared across genres, the content must be unique. 3. If the genre you specified does not exist, the story will not be added to that genre. Please check the spelling of the genre and try again. Thank you for your understanding.`,
    });
  }

  // add story to all genres
  const result2 = await Genre.updateMany(
    { genre: { $in: req.body.genres } },
    { $push: { stories: newStory } }
  ).exec();

  res.status(200).json({
    // display new story
    // message: `Story ${req.body.title} successfully updated in genres ${req.body.genres}.`,
    message: `The story ${req.body.titl} has been successfully published in genres ${req.body.genres}. Note: If any of the specified genres are missing, it is because the story's title already exists in that genre.`,
  });
};

// GET ALL STORIES GLOBALLY

const getAllStoriesGlobal = async (req, res) => {
  const genres = await Genre.find().exec();

  if (!genres) {
    return res.status(404).json({ message: `No genres found.` });
  }

  let stories = [];
  for (let i = 0; i < genres.length; i++) {
    stories = [...stories, ...genres[i].stories];
  }

  // if no stories in genre
  if (stories.length === 0) {
    return res.status(404).json({ message: `No stories found.` });
  }

  // return stories only if the content of the body is unique
  stories = stories.filter(
    (story, index, self) =>
      index === self.findIndex((b) => b.body === story.body)
  );
  res.status(200).json(stories);
};

// COUNT STORIES GLOBALLY
const countStoriesGlobal = async (req, res) => {
  const genres = await Genre.find().exec();

  if (!genres) {
    return res.status(404).json({ message: `No genres found.` });
  }

  let stories = [];
  for (let i = 0; i < genres.length; i++) {
    stories = [...stories, ...genres[i].stories];
  }

  // if no stories in genre
  if (stories.length === 0) {
    return res.status(404).json({ message: `No stories found.` });
  }

  res.status(200).json({ count: stories.length });
};

// DELETE A STORY GLOBALLY
const deleteStory = async (req, res) => {
  // check if no id and title provided
  if (!req.body.title || !req.body.id) {
    return res.status(400).json({ message: "Title and id are required." });
  }

  // check if story exists in any genre by id and title
  const story = await Genre.findOne({
    stories: { $elemMatch: { _id: req.body.id, title: req.body.title } },
  }).exec();

  if (!story) {
    return res
      .status(404)
      .json({ message: `Story ${req.body.title} not found.` });
  }

  // if id and title belong to the same story in the db then remove it from all genres

  const result = await Genre.updateMany(
    {},
    { $pull: { stories: { _id: req.body.id, title: req.body.title } } }
  ).exec();
  res.status(200).json({
    message: `Story ${req.body.title} successfully deleted from all genres.`,
  });
};

// DELETE A STORY FROM A GENRE
const deleteStoryGenre = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

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

  // remove story from genre
  const result = await Genre.updateOne(
    { genre: req.params.genre },
    { $pull: { stories: { title: req.body.title } } }
  ).exec();

  await Genre.updateMany(
    { stories: { $elemMatch: { title: req.body.title } } },
    { $pull: { genres: req.params.genre } }
  ).exec();

  res.status(200).json(result);

  // remove genre from story

  // check if story exists in any genre
  const storyGenre = await Genre.findOne({
    stories: { $elemMatch: { title: req.body.title } },
  }).exec();

  if (!storyGenre) return;

  // update story to remove genre from genres array in story object
  const storyUpdate = storyGenre.stories.find(
    (story) => story.title === req.body.title
  );

  storyUpdate.genres = storyUpdate.genres.filter(
    (genre) => genre !== req.params.genre
  );

  await storyGenre.save();
};

module.exports = {
  createStory,
  getAllStories,
  getStory,
  updateStory,
  deleteStory,
  getStoryAllGenres,
  getAllStoriesGlobal,
  deleteStoryGenre,
  countStoriesGlobal,
};
