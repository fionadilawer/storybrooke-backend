const Profile = require("../model/Profile");
const User = require("../model/User");
const Genre = require("../model/Genre");
const Story = require("../model/Story");

// const createProfile = async (req, res) => {
//   const { firstname, lastname, username, bio, profilePicture } = req.body;
//   const newFirstName = firstname
//     ? firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase()
//     : null;
//   const newLastName = lastname
//     ? lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase()
//     : null;
//   const newUserName = username
//     ? username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
//     : null;

//   if (!firstname || !lastname || !username) {
//     return res
//       .status(400)
//       .json({ message: "First name, last name, and username are required." });
//   }

//   // check if user exists in the database
//   const user = await User.findOne({ username: newUserName }).exec();

//   if (!user) {
//     return res
//       .status(404)
//       .json({ message: `No user with username ${req.body.username} found.` });
//   } else if (user) {
//     // check if first name, last name, and username match
//     if (
//       user.firstname !== newFirstName ||
//       user.lastname !== newLastName ||
//       user.username !== newUserName
//     ) {
//       return res.status(400).json({
//         message: `First name, last name, and username do not match.`,
//       });
//     }
//   }

//   // check if profile already exists

//   const profileExists = await Profile.findOne({ username: newUserName }).exec();

//   if (profileExists) {
//     return res.status(400).json({
//       message: `Profile with username ${req.body.username} already exists. If you wish to update your profile, please use the update profile endpoint.`,
//     });
//   }

//   // create profile
//   const profile = new Profile({
//     firstname: newFirstName,
//     lastname: newLastName,
//     username: newUserName,
//     bio: bio,
//     profilePicture: profilePicture,
//     dateJoined: new Date(),
//   });

//   try {
//     const result = await profile.save();
//     res.status(201).json(result);
//   } catch (err) {
//     console.error(err);
//   }
// };

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

// GET ALL PROFILES
const getAllProfiles = async (req, res) => {
  const profiles = await Profile.find({}).exec();

  res.status(200).json(profiles);
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

  const newUserName =
    req.params.username.charAt(0).toUpperCase() +
    req.params.username.slice(1).toLowerCase();
  const updatedUserName =
    req.body.username.charAt(0).toUpperCase() +
    req.body.username.slice(1).toLowerCase();

  // check if profile exists
  const profileExists = await User.findOne({
    username: newUserName,
  }).exec();

  if (!profileExists) {
    return res.status(404).json({
      message: `No profile with username ${newUserName} found.`,
    });
  }

  // delete old profile
  await Profile.findOneAndDelete({ username: newUserName }).exec();

  // create new profile
  const profile = new Profile({
    firstname: profileExists.firstname,
    lastname: profileExists.lastname,
    username: updatedUserName ? updatedUserName : profileExists.username,
    bio: req.body.bio ? req.body.bio : profileExists.bio,
    profilePicture: req.body.profilePicture
      ? req.body.profilePicture
      : profileExists.profilePicture,
    dateJoined: profileExists.dateJoined,
  });

  // if bio is more than 250 characters, return error
  if (profile.bio.length > 250) {
    return res.status(400).json({
      message: "Bio cannot be more than 200 characters.",
    });
  }

  try {
    const result = await profile.save();

    // save the new profile in the user's profile field
    await User.findOneAndUpdate(
      { username: newUserName },
      { $set: { profile: profile } }
    ).exec();

    if (updatedUserName) {
      // update the username in the users collection
      await User.findOneAndUpdate(
        { username: newUserName },
        { $set: { username: updatedUserName } }
      ).exec();

      // if username is updated, update the author field in the stories collection
      await Story.updateMany(
        // find all stories with the old username
        { author: newUserName },
        // update the author field with the new username
        { $set: { author: updatedUserName } }
      ).exec();

      // update the username in the stories in the user's genres array
      await Genre.updateMany(
        // find all stories with the old username
        { "stories.author": newUserName },
        // update the author field with the new username
        { $set: { "stories.$.author": updatedUserName } }
      ).exec();

      // update the username in the stories in the user's stories array
      await User.updateMany(
        // find all stories with the old username
        { "stories.author": newUserName },
        // update the author field with the new username
        { $set: { "stories.$.author": updatedUserName } }
      ).exec();
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllProfiles,
};
