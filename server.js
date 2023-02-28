const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const port = process.env.PORT || 4000;

// custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});
// Middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// Middleware to handle json data
app.use(express.json());

// Middleware to handle cors - cross origin resource sharing
app.use(cors(corsOptions));

// Middleware to handle static files
app.use(express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
// app.use("/employees", require("./routes/api/employees"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));

// handle 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
    return;
  } else if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  } else res.type("txt").send("Not found");
});

// handle errors
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
