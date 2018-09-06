const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

// "Database"
const users = [];
let nextId = 1;

const findUserBy = function(cb) {
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (cb(user)) {
      return user;
    }
  }

  return null;
};

const findUserByUsernameAndPassword = function(username, password, cb) {
  const user = findUserByUsername(username);

  if (user) {
    // use bcrypt to check our password
    bcrypt.compare(password, user.password, function(err, res) {
      if (err) {
        console.error(err);
        return cb(null);
      }

      if (res) {
        cb(user);
      } else {
        cb(null);
      }
    });
  } else {
    cb(null);
  }
};

const findUserByUsername = function(username) {
  return findUserBy(function(user) {
    return user.username === username;
  });
};

const findUserById = function(id) {
  return findUserBy(function(user) {
    return user.id === id;
  });
};

const createUser = function(username, password, cb) {
  if (!findUserByUsername(username)) {
    bcrypt.hash(password, SALT_ROUNDS, function(err, hash) {
      if (err) {
        console.error(err);
        return cb(null);
      }

      const user = {
        id: nextId++,
        username: username,
        password: hash
      };
      users.push(user);

      cb(user);
    });
  } else {
    cb(null);
  }
};

module.exports = {
  findUserById: findUserById,
  findUserByUsername: findUserByUsername,
  findUserByUsernameAndPassword: findUserByUsernameAndPassword,
  createUser: createUser,
  getUsers: function() {
    return users;
  }
};
