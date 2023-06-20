const User = require("../model/User");
const Story = require("../model/Story");
const Profile = require("../model/Profile");
const Genre = require("../model/Genre");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found." });
  res.status(200).json(users);
};

const updateUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  const user = await User.findOne({ _id: req.body.id }).exec();

  if (!user)
    return res
      .status(204)
      .json({ message: `No user matches ID ${req.body.id}.` });

  const hashedPwd = await bcrypt.hash(req.body.pwd, 10);

  if (req?.body?.user) user.username = req.body.user;
  if (req?.body?.roles) user.roles = req.body.roles;
  if (req?.body?.pwd) user.password = hashedPwd;
  if (req?.body?.interests) user.interests = req.body.interests;

  try {
    const result = await user.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (req, res) => {
  if (!req?.params?.username)
    return res.status(400).json({ message: "Username required." });

  // capitalize username
  req.params.username =
    req.params.username.charAt(0).toUpperCase() +
    req.params.username.slice(1).toLowerCase();

  // Find user
  const user = await User.findOne({ username: req.params.username }).exec();

  if (!user)
    return res
      .status(404)
      .json({ message: `No user matches username ${req.params.username}.` });

  // Delete user
  const deletedUser = await User.deleteOne({
    username: user.username,
  }).exec();

  // Delete user's profile
  const deletedProfile = await Profile.deleteOne({
    username: user.username,
  }).exec();

  // Delete user's stories
  const deletedStories = await Story.deleteMany({
    author: user.username,
  }).exec();

  // delete stories from genres
  const deletedGenres = await Genre.updateMany(
    { stories: { $elemMatch: { author: user.username } } },
    { $pull: { stories: { author: user.username } } }
  ).exec();

  res.status(200).json({
    message: `User ${req.params.username} deleted.`,
  });
};

// GET USER
const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required." });

  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `No user matches ID ${req.params.id}.` });
  }
  res.json(user);
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getUser,
};
