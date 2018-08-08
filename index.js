// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");

// Set some global constants for the app
const PORT = process.env.PORT || 8080;

// "Database"
const users = [];

// Setup express app
const app = express();

// Setup middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine
app.set("view engine", "ejs");

// App routes
// GET / - Home route
app.get("/", (req, res) => {
  res.render("index");
});

// GET /login - Login Form
app.get("/login", (req, res) => {
  res.render("login");
});

// POST /login - Process Login
app.post("/login", (req, res) => {
  // TODO: Implement me
});

// GET /register - Register Form
app.get("/register", (req, res) => {
  res.render("register");
});

// POST /register - Process registration
app.post("/register", (req, res) => {
  // TODO: Implement me
});

app.post("/logout", (req, res) => {
  // TODO: Implement me
});

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening at http://localhost:${PORT}/`);
});
