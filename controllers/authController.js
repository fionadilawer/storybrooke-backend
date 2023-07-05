const User = require("../model/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  // check if user exists
  const foundUser = await User.findOne({ username: user.charAt(0).toUpperCase() + user.slice(1).toLowerCase()}).exec();

  if (!foundUser) return res.sendStatus(404); // not found
  // check if password is correct
  const isMatch = await bcrypt.compare(pwd, foundUser.password);
  if (isMatch) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    const interests = Object.values(foundUser.interests);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );
    // refresh token
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // save refresh token with user in db
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    // console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ roles, interests, accessToken });
  } else {
    res.sendStatus(401); // unauthorized
  }
};

module.exports = {
  handleLogin,
};
