const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  // check for duplicates
  const duplicate = await User.findOne({ username: user }).exec();
  if (duplicate)
    return res.status(409).json({ message: "User already exists" }); // conflict

  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
    // create and save new user
   const result = await User.create({
            "username": user.charAt(0).toUpperCase() + user.slice(1),
            "password": hashedPwd
        });

    console.log(result);

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
