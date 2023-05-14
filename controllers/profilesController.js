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

module.exports = {
  createProfile,
};
