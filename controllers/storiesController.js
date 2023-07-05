const mongoose = require("mongoose");
const Genre = require("../model/Genre");
const User = require("../model/User");
const Story = require("../model/Story");

// CREATE A NEW STORY
const createStory = async (req, res) => {
  const newTitle = req.body.title.toUpperCase().trim().split(/ +/).join(" ");
  // story object
  const story = {
    _id: new mongoose.Types.ObjectId(),
    title: newTitle,
    author: req.body.author,
    body: req.body.body,
    genres: req.body.genres,
    date: new Date(),
  };

  // capitalize the first letter of author
  req.body.author =
    req.body.author.charAt(0).toUpperCase() +
    req.body.author.slice(1).toLowerCase();
  story.author =
    story.author.charAt(0).toUpperCase() + story.author.slice(1).toLowerCase();
  // check if author exists in db
  const verifyAuthor = await User.findOne({ username: story.author }).exec();

  if (!verifyAuthor && story.author !== "Anonymous") {
    return res.status(404).json({
      message: `The author ${story.author} does not exist in the database. Please create an account and try again.`,
    });
  }

  // check if genre exists and update story by removing non-existent genres

  for (let i = 0; i < story.genres.length; i++) {
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();
    if (!genre || story.genres.indexOf(story.genres[i]) !== i) {
      story.genres.splice(i, 1);
      i--;
      continue;
    }
  }

  // check the story for plagiarism (i.e. check if a large chunk of the story already exists in the database)

  // story collection
  // const resultInStory = await Story.findOne({
  //   body: {
  //     $regex: story.body.slice(0, Math.floor(story.body.length / 2)),
  //     $regex: story.body.slice(-Math.floor(story.body.length / 2)),
  //     $regex: story.body.slice(
  //       Math.floor(story.body.length / 4),
  //       -Math.ceil(story.body.length / 4)
  //     ),
  //   },
  // }).exec();

  const resultInStory = await Story.findOne({
    body: {
      $in: [
        ...story.body.slice(0, Math.floor(story.body.length / 2)),
        ...story.body.slice(-Math.floor(story.body.length / 2)),
        ...story.body.slice(
          Math.floor(story.body.length / 4),
          -Math.ceil(story.body.length / 4)
        ),
      ].filter((paragraph) => paragraph.trim() !== ""), // Remove empty paragraphs
    },
  }).exec();

  if (resultInStory) {
    return res.status(400).json({
      message: `The story you're trying to add already exists in at least one genre in the database (e.g. ${resultInStory.genres[0]}). Please come up with a new story. If you want to add this story to another genre, please use the update story route.`,
    });
  }

  for (let i = 0; i < req.body.genres.length; i++) {
    // find genre in db
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();
    // console.log(genre);
    // check if story title exists in the genre
    if (genre.stories.find((story) => story.title === newTitle)) {
      // remove the genre from the story's genres array
      story.genres.splice(i, 1);
      i--;
      continue;
    }
  }

  // check if genres length is greater than 3
  if (story.genres.length > 3) {
    // remove anything after the 3rd index
    story.genres.splice(3, story.genres.length - 3);
  }

  // push story to story collection
  const newStory = new Story(story);
  // push story to genre
  for (let i = 0; i < story.genres.length; i++) {
    const genre = await Genre.findOne({ genre: story.genres[i] }).exec();
    // genre.stories.unshift(newStory);
    genre.stories.push(newStory);

    // save genre
    await newStory.save();
    await genre.save();

    // save story in user
    const currentUserStories = await User.findOne({
      username: req.body.author,
    }).exec();

    // push story to user's stories array (if the body doesn't already exist)
    if (currentUserStories) {
      if (
        !currentUserStories.stories.find(
          (story) => story.body === newStory.body
        )
      ) {
        currentUserStories.stories.push(newStory);
      }

      // save user
      await currentUserStories.save();
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

// GET ALL STORIES IN A GENRE
const getAllStoriesInGenre = async (req, res) => {
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

  // sort stories by date (newest to oldest)
  genre.stories.sort((a, b) => b.date - a.date);

  res.status(200).json(genre.stories);
};

// GET A STORY IN A SPECIFIC GENRE
const getStory = async (req, res) => {
  // check if empty
  if (!req.body.title)
    return res.status(400).json({ message: "Title is required." });

  req.body.title = req.body.title.toUpperCase().trim().split(/ +/).join(" ");

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

// GET ALL STORIES WITH  THE SAME TITLE IN THE DATABASE
const getStoryGlobal = async (req, res) => {
  // find stories with both uppercase and lowercase titles, capitalized titles and titles with each word capitalized
  const newTitle = req?.params?.title
    .toUpperCase()
    .trim()
    .split(/ +/)
    .join(" ");

  // find stories with the same title
  const stories = await Story.find({ title: newTitle }).exec();

  if (!stories) {
    return res
      .status(404)
      .json({ message: `No stories found with title ${newTitle}.` });
  }

  // sort stories by date (newest to oldest)
  stories.sort((a, b) => b.date - a.date);

  res.status(200).json(stories);
};

// GET STORY BY ID
const getStoryById = async (req, res) => {
  // check if id params is empty
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Id is required." });
  }

  // check if story exists
  const story = await Story.findOne({ _id: req?.params?.id }).exec();

  if (!story) {
    return res.status(404).json({ message: `Story not found.` });
  }

  res.status(200).json(story);
};

// GET ALL STORIES WRITTEN BY THE SAME AUTHOR IN THE DATABASE
const getStoriesByAuthor = async (req, res) => {
  // check if empty
  if (!req.params.author) {
    return res.status(400).json({ message: "Author is required." });
  }

  const author =
    req.params.author.charAt(0).toUpperCase() +
    req.params.author.slice(1).toLowerCase();

  // check if author exists
  const user = await User.findOne({ username: author }).exec();

  // check if author has published any stories
  const stories = await Story.find({ author: author }).exec();

  // author name is Anonymous
  if (author === "Anonymous") {
    const anonymousStories = await Story.find({ author: "Anonymous" }).exec();

    if (!anonymousStories) {
      return res
        .status(200)
        .json({ message: `No stories have been published anonymously yet.` });
    } else {
      // sort by date published in descending order
      anonymousStories.sort((a, b) => b.date - a.date);

      return res.status(200).json(anonymousStories);
    }
  }

  // if no user found in database
  if (!user && author !== "Anonymous") {
    // console.log(`User ${author} not found`);
    return res.status(404).json({ message: `User ${author} not found` });
  }

  // if no stories found
  if (!stories) {
    return res
      .status(200)
      .json({ message: `${author} has not published any stories.` });
  }

  // sort by date published in descending order
  stories.sort((a, b) => b.date - a.date);

  res.status(200).json(stories);
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

  // capitalize author
  req.body.author =
    req.body.author.charAt(0).toUpperCase() +
    req.body.author.slice(1).toLowerCase();
  // uppercase title
  const newTitle = req.body.title.toUpperCase().trim().split(/ +/).join(" ");

  // check if author exists
  const user = await User.findOne({ username: req.body.author }).exec();

  if (!user && req.body.author !== "Anonymous") {
    return res.status(404).json({
      message: `Author ${req.body.author} not found.`,
    });
  }

  // check if story exists in any genre in db
  const story = await Genre.findOne({
    stories: { $elemMatch: { _id: req?.params?.id } },
  }).exec();

  // if story doesn't exist
  if (!story) {
    return res.status(404).json({
      message: `Story ${newTitle} not found in the database.`,
    });
  }

  // create the new story
  const newStory = {
    _id: req?.params?.id,
    title: newTitle,
    author: req.body.author,
    body: req.body.body,
    genres: req.body.genres,
    date: new Date(),
  };

  // check if the new story story body already exists in the db with a different id
  const storyExists = await Story.findOne({
    body: {
      $in: [
        ...newStory.body.slice(0, Math.floor(newStory.body.length / 2)),
        ...newStory.body.slice(-Math.floor(newStory.body.length / 2)),
        ...newStory.body.slice(
          Math.floor(newStory.body.length / 4),
          -Math.ceil(newStory.body.length / 4)
        ),
      ].filter((paragraph) => paragraph.trim() !== ""), // Remove empty paragraphs
    },
    _id: { $ne: req?.params?.id },
  });

  if (storyExists) {
    return res.status(400).json({
      message: `Story ${newTitle} already exists in the database. Please come up with a unique story. Thank you for your understanding.`,
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
      stories: { $elemMatch: { title: newStory.newTitle } },
    }).exec();

    if (storyExists) {
      newStory.genres.splice(i, 1);
      i--;
      continue;
    }
  }

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

  // update story in db
  const resultInStory = await Story.updateOne(
    { _id: req?.params?.id },
    {
      $set: {
        title: newStory.title ? newStory.title : story.title,
        author: newStory.author ? newStory.author : story.author,
        body: newStory.body ? newStory.body : story.body,
        genres: newStory.genres ? newStory.genres : story.genres,
        date: new Date(),
      },
    }
  ).exec();

  // update story in user's stories
  const resultInUser = await User.updateMany(
    { stories: { $elemMatch: { _id: req?.params?.id } } },
    {
      $set: {
        "stories.$.title": newStory.title ? newStory.title : story.title,
        "stories.$.author": newStory.author ? newStory.author : story.author,
        "stories.$.body": newStory.body ? newStory.body : story.body,
        "stories.$.genres": newStory.genres ? newStory.genres : story.genres,
        "stories.$.date": new Date(),
      },
    }
  ).exec();

  res.status(200).json({
    // display new story
    // message: `Story ${req.body.title} successfully updated in genres ${req.body.genres}.`,
    message: `The story ${newTitle} has been successfully published in genres ${req.body.genres}. Note: If any of the specified genres are missing, it is because the story's title already exists in that genre.`,
  });
};

// GET ALL STORIES GLOBALLY

const getAllStoriesGlobal = async (req, res) => {
  const stories = await Story.find().exec();

  if (!stories) {
    return res.status(404).json({ message: `No stories found.` });
  }

  // sort by date in descending order
  stories.sort((a, b) => b.date - a.date);

  // return all stories
  res.status(200).json({ stories });
};

// COUNT STORIES GLOBALLY
const countStoriesGlobal = async (req, res) => {
  const stories = await Story.find().exec();

  if (!stories) {
    return res.status(404).json({ message: `No stories found.` });
  }

  res.status(200).json({ count: stories.length });
};

// DELETE STORY GLOBALLY
const deleteStory = async (req, res) => {
  // check if no id is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Id is required." });
  }

  // check if story exists in db
  const story = await Story.findOne({
    _id: req?.params?.id,
  }).exec();

  if (!story) {
    return res.status(404).json({ message: `Story not found.` });
  }

  // remove story from the db
  const result = await Story.deleteOne({
    _id: req?.params?.id,
  }).exec();

  // delete story from the user's stories
  const result2 = await User.updateMany(
    {},
    { $pull: { stories: { _id: req?.params?.id } } }
  ).exec();

  // delete story from all genres
  const result3 = await Genre.updateMany(
    {},
    { $pull: { stories: { _id: req?.params?.id } } }
  ).exec();

  res.status(200).json({
    message: `Story successfully deleted.`,
  });
};

module.exports = {
  createStory,
  getAllStoriesInGenre,
  getStory,
  updateStory,
  deleteStory,
  getStoryGlobal,
  getAllStoriesGlobal,
  countStoriesGlobal,
  getStoriesByAuthor,
  getStoryById,
};
