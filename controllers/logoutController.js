const User = require("../model/User");

const handleLogout = async (req, res) => {
  // note for front-end dev - on client also delete the access token

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No Content

  const refreshToken = cookies.jwt;

  // check if refresh token exists in db
  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204); // No Content
  }

  // delete refresh token from db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  // console.log(result);

  // delete refresh token from cookies
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204); // No Content
};

module.exports = {
  handleLogout,
};
