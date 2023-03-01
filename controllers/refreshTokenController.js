const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401); // unauthorized
  console.log(cookies.jwt);
  const refrehToken = cookies.jwt;
  // check if user exists
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refrehToken
  );
  if (!foundUser) return res.sendStatus(403); // forbidden
  // evaluate jwt
  jwt.verify(refrehToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403); // forbidden
    const roles = Object.values(foundUser.roles);
    // create new jwt
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60s" }
    );
    // send new jwt
    res.json({ accessToken });
  });
};

module.exports = {
  handleRefreshToken,
};
