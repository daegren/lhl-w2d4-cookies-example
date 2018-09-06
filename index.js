// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const users = require("./users");

// Set some global constants for the app
const PORT = process.env.PORT || 8080;

// Setup express app
const app = express();

// Setup middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["my super secret password, please don't steal it"]
  })
);

// Set view engine
app.set("view engine", "ejs");

app.use(function(req, res, next) {
  const userId = parseInt(req.session.user_id, 10);
  const currentUser = users.findUserById(userId);
  req.currentUser = currentUser;

  next();
});

// App routes
// GET / - Home route
app.get("/", (req, res) => {
  res.render("index", {
    users: users.getUsers(),
    currentUser: req.currentUser
  });
});

// GET /login - Login Form
app.get("/login", (req, res) => {
  res.render("login");
});

// POST /login - Process Login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    users.findUserByUsernameAndPassword(username, password, function(user) {
      if (user) {
        req.session.user_id = user.id;
        res.redirect("/");
      } else {
        res.status(422);
        res.send("Invalid username or password");
      }
    });
  } else {
    res.status(422);
    res.send("Unable to process login, please provide a username and password");
  }
});

// GET /register - Register Form
app.get("/register", (req, res) => {
  res.render("register");
});

// POST /register - Process registration
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const password_confirm = req.body.password_confirm;

  if (username && password && password_confirm) {
    if (password === password_confirm) {
      // Process the registration
      users.createUser(username, password, function(user) {
        if (user) {
          req.session.user_id = user.id;
          res.redirect("/");
        } else {
          res.status(422);
          res.send(`Username ${username} has already been taken.`);
        }
      });
    } else {
      res.status(422);
      res.send("Passwords do not match");
    }
  } else {
    res.status(422);
    res.send(
      "Unable to process registration, please provide a username, password and password_confirm"
    );
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening at http://localhost:${PORT}/`);
});
