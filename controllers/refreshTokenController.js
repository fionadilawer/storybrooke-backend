const User = require("../model/User");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401); // unauthorized
  // console.log(cookies.jwt);
  const refreshToken = cookies.jwt;
  // check if user exists
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); // forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403); // forbidden
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create new jwt
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
    // send new jwt
    res.json({ roles, accessToken });
    console.log("new access token sent")
  });
};

module.exports = {
  handleRefreshToken,
};
