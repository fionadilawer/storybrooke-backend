const Comment = require("../model/Comment");
const Story = require("../model/Story");
const Genre = require("../model/Genre");
const User = require("../model/User");

// Create a new comment
const createComment = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No story id provided" });
    return;
  }

  //   get story id from params
  const storyId = req?.params?.id;

  //   check if story id is valid
  const story = await Story.findOne({ _id: storyId });
  if (!story) {
    res.status(404).json({ message: "Story not found" });
    return;
  }

  const commenter = req.body.commenter;
  const body = req.body.body;
  const date = new Date();

  //  check if no commenter or body
  if (!commenter || !body) {
    res.status(400).json({ message: "Both commenter and body are required" });
    return;
  }

  //   check if commenter is a user
  const user = await User.findOne({ username: commenter });
  if (!user) {
    res.status(404).json({
      message:
        "You have to be a registered user to comment on stories. Please sign up/sign in.",
    });
    return;
  }

  //   create new comment
  const newComment = new Comment({
    commenter: commenter,
    body: body,
    date: date,
  });

  //   save comment
  try {
    //   add comment to story
    story.comments.push(newComment);
    //   save story
    await story.save();

    // find the story in genres and add comment to it
    await Genre.updateMany(
      {
        stories: { $elemMatch: { _id: storyId } },
      },
      { $push: { "stories.$.comments": newComment } }
    ).exec();

    // add comment to user stories
    await User.updateOne(
      { stories: { $elemMatch: { _id: storyId } } },
      { $push: { "stories.$.comments": newComment } }
    ).exec();

    //  send response
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createComment,
};
