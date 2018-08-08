// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

// Set some global constants for the app
const PORT = process.env.PORT || 8080;
const SALT_ROUNDS = 10;

// "Database"
let users = [];
let nextUserId = 1;

/**
 * Find a user from the `users` array by id
 * @param {int} id The id of the user to find
 * @returns {(Object|null)} Either the user that was found or `null` if no user was found
 */
const fetchUser = id => {
  const intId = parseInt(id, 10);
  for (let i = 0; i < users.length; i++) {
    const currentUser = users[i];
    if (currentUser.id === intId) {
      return currentUser;
    }
  }

  return null;
};

/**
 * Find a user from the `users` array by username
 * @param {String} username The username to look for
 * @returns {(Object|null)} Either the user that was found or `null` if no user was found
 */
const fetchUserByUsername = username => {
  for (let i = 0; i < users.length; i++) {
    const currentUser = users[i];
    if (currentUser.username === username) {
      return currentUser;
    }
  }

  return null;
};

// Setup express app
const app = express();

// Setup middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["my-super-secret-key"],
    maxAge: 10 * 60 * 1000
  })
);

// Set view engine
app.set("view engine", "ejs");

// App routes
// GET / - Home route
app.get("/", (req, res) => {
  const user = fetchUser(req.session.user_id);
  res.render("index", { user: user });
});

// GET /login - Login Form
app.get("/login", (req, res) => {
  res.render("login");
});

// POST /login - Process Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    const user = fetchUserByUsername(username);

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log("There was an error trying to compare passwords", err);
          res.redirect("/login");
        } else if (result) {
          req.session.user_id = user.id;
          res.redirect("/");
        } else {
          console.log("passwords do not match");
          res.redirect("/login");
        }
      });
    } else {
      console.log("Invalid username", username);
      res.redirect("/login");
    }
  } else {
    console.log("Please provide all parameters: username and password");
    res.redirect("/login");
  }
});

// GET /register - Register Form
app.get("/register", (req, res) => {
  res.render("register");
});

// POST /register - Process registration
app.post("/register", (req, res) => {
  const { username, password, password_confirm } = req.body;

  if (username && password && password_confirm) {
    if (password === password_confirm) {
      bcrypt.hash(password, SALT_ROUNDS, (err, password_hashed) => {
        if (err) {
          console.log("There was an error hashing the password", err);
        } else {
          const user = {
            id: nextUserId++,
            username,
            password: password_hashed
          };

          users.push(user);
          req.session.user_id = user.id;
          res.redirect("/");
        }
      });
    } else {
      console.log("Password and Password Confirmation do not match");
      res.redirect("/register");
    }
  } else {
    console.log(
      "Missing attributes, make sure to inlcude: username, password and password_confirm"
    );
    res.redirect("/register");
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
