const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;

    if (!user || !pwd)
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    // check if user exists
  const foundUser = usersDB.users.find((person) => person.username === user);
  if (!foundUser) return res.sendStatus(401) // unauthorized
  // check if password is correct
  const isMatch = await bcrypt.compare(pwd, foundUser.password);
  if(isMatch) {
    res.status(200).json({ "message": `User ${user} logged in successfully!` });
  } else {
    res.sendStatus(401); // unauthorized
  }
}

module.exports = {
  handleLogin,
}