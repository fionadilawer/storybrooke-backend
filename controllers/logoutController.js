const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");

const handleLogout = async (req, res) => {
  // note for front-end dev - on client also delete the access token

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No Content

  const refrehToken = cookies.jwt;

  // check if refresh token exists in db
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refrehToken
  );
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204); // No Content
  }

  // delete refresh token from db
  const otherUsers = usersDB.users.filter(
    (person) => person.refreshToken !== foundUser.refreshToken
  );
  const currentUser = { ...foundUser, refreshToken: "" };
  usersDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "users.json"),
    JSON.stringify(usersDB.users)
  );

  // delete refresh token from cookies
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204); // No Content
};

module.exports = {
  handleLogout,
};
