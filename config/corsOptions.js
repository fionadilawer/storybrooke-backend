const whiteList = [
  "https://localhost:3000",
  "https://www.google.com",
  "https://localhost:4000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;