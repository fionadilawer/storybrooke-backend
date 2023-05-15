const Profile = require("../model/Profile");
const User = require("../model/User");

const createProfile = async (req, res) => {
  const { firstname, lastname, username, bio, profilePicture } = req.body;
  const newFirstName = firstname
    ? firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase()
    : null;
  const newLastName = lastname
    ? lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase()
    : null;
  const newUserName = username
    ? username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
    : null;

  if (!firstname || !lastname || !username) {
    return res
      .status(400)
      .json({ message: "First name, last name, and username are required." });
  }

  // check if user exists in the database
  const user = await User.findOne({ username: newUserName }).exec();

  if (!user) {
    return res
      .status(404)
      .json({ message: `No user with username ${req.body.username} found.` });
  } else if (user) {
    // check if first name, last name, and username match
    if (
      user.firstname !== newFirstName ||
      user.lastname !== newLastName ||
      user.username !== newUserName
    ) {
      return res.status(400).json({
        message: `First name, last name, and username do not match.`,
      });
    }
  }

  // check if profile already exists

  const profileExists = await Profile.findOne({ username: newUserName }).exec();

  if (profileExists) {
    return res.status(400).json({
      message: `Profile with username ${req.body.username} already exists. If you wish to update your profile, please use the update profile endpoint.`,
    });
  }

  // create profile
  const profile = new Profile({
    firstname: newFirstName,
    lastname: newLastName,
    username: newUserName,
    bio: bio,
    profilePicture: profilePicture,
    dateJoined: new Date(),
  });

  try {
    const result = await profile.save();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  // check if no params
  if (!req.params.username) {
    return res.status(400).json({ message: "No username provided." });
  }

  // check if profile exists
  const profileExists = await Profile.findOne({
    username: req.params.username,
  }).exec();

  if (!profileExists) {
    return res.status(404).json({
      message: `No profile with username ${req.params.username} found.`,
    });
  }

  // find and return profile
  const profile = await Profile.findOne({
    username: req.params.username,
  }).exec();

  res.status(200).json(profile);
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  // check if no params
  if (!req.params.username) {
    return res.status(400).json({ message: "No username provided." });
  }

  // check if no body
  if (!req.body) {
    return res.status(400).json({ message: "No update provided." });
  }

  // check if bio is empty
  if (req.body.bio === "") {
    return res.status(400).json({ message: "Bio cannot be empty." });
  }

  // check if profile exists
  const profileExists = await Profile.findOne({
    username: req.params.username,
  }).exec();

  if (!profileExists) {
    return res.status(404).json({
      message: `No profile with username ${req.params.username} found.`,
    });
  }

  // find and update profile
  const profile = await Profile.findOneAndUpdate(
    { username: req.params.username },
    { bio: req.body.bio },
    { new: true }
  ).exec();

  // save new profile to user collection
  await User.findOneAndUpdate(
    { username: req.params.username },
    { profile: profile },
    { new: true }
  ).exec();

  res.status(200).json(profile);
};

module.exports = {
  getProfile,
  updateProfile,
};
