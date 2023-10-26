const Comment = require("../model/Comment");
const Story = require("../model/Story");
const Genre = require("../model/Genre");
const User = require("../model/User");

// CREATE A NEW COMMENT
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

  let dateObj = new Date();
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const commenter =
    req.body.commenter.charAt(0).toUpperCase() +
    req.body.commenter.slice(1).toLowerCase();
  const body = req.body.body;
  const date = dateObj.toLocaleDateString(undefined, options);
  const time = dateObj.toLocaleTimeString();

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
    commenter,
    body,
    date,
    time,
  });

  //   save comment
  try {
    await newComment.save();
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

    // // add comment to user stories
    // await User.updateOne(
    //   { stories: { $elemMatch: { _id: storyId } } },
    //   { $push: { "stories.$.comments": newComment } }
    // ).exec();

    //  send response
    res.status(201).json({
      comment: newComment,
      message: "Comment added successfully!",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL COMMENTS FOR A STORY
const getComments = async (req, res) => {
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

  //   get comments
  const comments = story.comments;

  //   send response
  res.status(200).json(comments);
};

// DELETE A COMMENT
const deleteComment = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No comment id provided" });
    return;
  }

  //   get comment id from params
  const commentId = req?.params?.id;

  //   check if comment id is valid
  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  //   delete comment
  try {
    await Comment.deleteOne({ _id: commentId });
    await Story.updateOne(
      { comments: { $elemMatch: { _id: commentId } } },
      { $pull: { comments: { _id: commentId } } }
    ).exec();

    await Genre.updateMany(
      { "stories.comments": { $elemMatch: { _id: commentId } } },
      { $pull: { "stories.$.comments": { _id: commentId } } }
    ).exec();

    // await User.updateMany(
    //   { "stories.comments": { $elemMatch: { _id: commentId } } },
    //   { $pull: { "stories.$.comments": { _id: commentId } } }
    // ).exec();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE A COMMENT
const updateComment = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No comment id provided" });
    return;
  }

  // check if no commenter and body
  if (!req.body.commenter || !req.body.body) {
    res.status(400).json({ message: "Both commenter and body are required" });
    return;
  }

  //   get comment id from params
  const commentId = req?.params?.id;

  // check if comment exists in db
  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  let dateObj = new Date();
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  // new comment
  const newComment = {
    _id: commentId,
    commenter:
      req.body.commenter.charAt(0).toUpperCase() +
      req.body.commenter.slice(1).toLowerCase(),
    body: req.body.body,
    reply: comment.reply,
    date: dateObj.toLocaleDateString(undefined, options),
    time: dateObj.toLocaleTimeString(),
  };

  // check if commenter is a user
  if (!(await User.findOne({ username: newComment.commenter }))) {
    res.status(404).json({
      message:
        "You have to be a registered user to comment on stories. Please sign up/sign in.",
    });
    return;
  }

  // check if commenter isn't the owner of the comment
  if (comment.commenter !== newComment.commenter) {
    res.status(400).json({ message: "You can't edit someone else's comment" });
    return;
  }
  // update comment
  try {
    await Comment.updateOne({ _id: commentId }, newComment);

    // update in story
    await Story.updateOne(
      { comments: { $elemMatch: { _id: commentId } } },
      { $set: { "comments.$": newComment } }
    ).exec();

    // update in genres
    await Genre.updateMany(
      { "stories.comments": { $elemMatch: { _id: commentId } } },
      { $set: { "stories.$[story].comments.$[comment]": newComment } },
      {
        arrayFilters: [
          { "story.comments._id": commentId },
          { "comment._id": commentId },
        ],
      }
    ).exec();

    // send response
    res.status(200).json({ message: "Comment updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// CREATE COMMENT REPLY
const createCommentReply = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No comment id provided" });
    return;
  }

  let commentID = req?.params?.id;

  //   check if comment id is valid
  const comment = await Comment.findOne({ _id: commentID });
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  // check if no commenter or body
  if (!req.body.commenter || !req.body.body) {
    res.status(400).json({ message: "Both commenter and body are required" });
    return;
  }

  // new comment
  const date = new Date();

  const reply = new Comment({
    commenter:
      req.body.commenter.charAt(0).toUpperCase() +
      req.body.commenter.slice(1).toLowerCase(),
    body: req.body.body,
    date: date,
  });

  // check if commenter is a user
  const user = await User.findOne({ username: reply.commenter });
  if (!user) {
    res.status(404).json({
      message:
        "You have to be a registered user to comment on stories. Please sign up/sign in.",
    });
    return;
  }

  try {
    //  save reply in comment
    comment.reply.push(reply);
    await comment.save();

    // add reply to story
    await Story.updateOne(
      { comments: { $elemMatch: { _id: commentID } } },
      { $push: { "comments.$.reply": reply } }
    ).exec();

    // update the stories in the genre
    const stories = await Genre.find({
      stories: { $elemMatch: { comments: { $elemMatch: { _id: commentID } } } },
    });

    stories.forEach(async (genre) => {
      const story = genre.stories.find((story) =>
        story.comments.find((comment) => comment._id == commentID)
      );
      const comment = story.comments.find(
        (comment) => comment._id == commentID
      );
      comment.reply.push(reply);
      await genre.save();
    });

    // update the stories in the user
    // const userStories = await User.find({
    //   stories: { $elemMatch: { comments: { $elemMatch: { _id: commentID } } } },
    // });

    // userStories.forEach(async (user) => {
    //   const story = user.stories.find((story) =>
    //     story.comments.find((comment) => comment._id == commentID)
    //   );
    //   const comment = story.comments.find(
    //     (comment) => comment._id == commentID
    //   );
    //   comment.reply.push(reply);
    //   await user.save();

    // });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

  res.status(201).json({
    reply: reply,
    message: "Response added successfully!",
  });
};

// DELETE REPLY
const deleteReply = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No comment id provided" });
    return;
  }

  //   get comment id from params
  const commentId = req?.params?.id;

  //   check if comment id is valid
  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  // check if the comment has a reply with the given id
  const reply = comment.reply.find((reply) => reply._id == req.body.replyId);

  if (!reply) {
    res.status(404).json({ message: "Reply not found" });
    return;
  }

  try {
    // delete reply from comment
    const comment = await Comment.findById(commentId).exec();
    comment.reply = comment.reply.filter(
      (reply) => reply._id != req.body.replyId
    );
    await comment.save();

    // delete reply from story
    const storyComment = await Story.findOne({
      comments: { $elemMatch: { _id: commentId } },
    }).exec();

    storyComment.comments.forEach((comment) => {
      comment.reply = comment.reply.filter(
        (reply) => reply._id != req.body.replyId
      );
    });

    await storyComment.save();

    // delete reply from genre
    const genreStories = await Genre.find({
      stories: { $elemMatch: { comments: { $elemMatch: { _id: commentId } } } },
    });
    genreStories.forEach(async (genre) => {
      const story = genre.stories.find((story) =>
        story.comments.find((comment) => comment._id == commentId)
      );
      const comment = story.comments.find(
        (comment) => comment._id == commentId
      );
      comment.reply = comment.reply.filter(
        (reply) => reply._id != req.body.replyId
      );
      await genre.save();
    });

    // // delete reply from user
    // const userStories = await User.find({
    //   stories: { $elemMatch: { comments: { $elemMatch: { _id: commentId } } } },
    // });

    // userStories.forEach(async (user) => {
    //   const story = user.stories.find((story) =>
    //     story.comments.find((comment) => comment._id == commentId)
    //   );
    //   const comment = story.comments.find(
    //     (comment) => comment._id == commentId
    //   );
    //   comment.reply = comment.reply.filter(
    //     (reply) => reply._id != req.body.replyId
    //   );
    //   await user.save();
    // });

    res.status(200).json({ message: "Reply deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL REPLIES FOR A COMMENT
const getReplies = async (req, res) => {
  // check if no params
  if (!req?.params?.id) {
    res.status(400).json({ message: "No comment id provided" });
    return;
  }

  // check if comment exists
  const comment = await Comment.findOne({ _id: req.params.id });
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  // get replies
  try {
    const replies = comment.reply;
    res.status(200).json(replies);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
  updateComment,
  createCommentReply,
  deleteReply,
  getReplies,
};
