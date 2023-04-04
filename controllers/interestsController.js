const User = require("../model/User");

const updateUserInterests = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  const user = await User.findOne({ _id: req.body.id }).exec();

  if (!user)
    return res
      .status(204)
      .json({ message: `No user matches ID ${req.body.id}.` });

  if (req?.body?.interests) user.interests = req.body.interests;

  try {
    const result = await user.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  updateUserInterests,
};
