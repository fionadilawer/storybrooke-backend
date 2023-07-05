const User = require("../model/User");
const Profile = require("../model/Profile");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { firstname, lastname, user, pwd } = req.body;
  const newFirstName =
    firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase();
  const newLastName =
    lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase();
  const newUser = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();

  if (!firstname || !lastname || !user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  // check for duplicates
  const duplicate = await User.findOne({ username: newUser }).exec();
  if (duplicate)
    return res.status(409).json({ message: "User already exists" }); // conflict

  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
    // create user profile
    const profile = {
      firstname: newFirstName,
      lastname: newLastName,
      username: newUser,
    };
    // create and save new user
    const result = await User.create({
      //  capitalize first letter of names
      firstname: newFirstName,
      lastname: newLastName,
      username: newUser,
      profile: profile,
      password: hashedPwd,
    });

    // save profile to profile collection
    await Profile.create(profile);

    // console.log(result);

    res
      .status(201)
      .json({ success: `New user ${user} has been successfully created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  handleNewUser,
};
