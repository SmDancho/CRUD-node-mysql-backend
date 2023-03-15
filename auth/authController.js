
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { secret } = require('../config');

const saltRounds = 10;

const connection = require('../db');


function generateAccessToken(id) {
  const payload = { id };
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
}

async function registration(req, res) {
  const { name, mail, password } = req.body;
  console.log(req.body);
  const isUserRegister = `SELECT * FROM users WHERE name = name`;
  const addNewUser = 'INSERT INTO users (name,mail, password) VALUES (?, ?,?)';
  if (!name || !password || !mail) {
    return res
      .status(400)
      .json({ message: 'Username , password ,mail are required' });
  }
  connection.query(isUserRegister, [name], (error, result) => {
    console.log(result);
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (result.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    } else {
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      connection.query(
        addNewUser,
        [name, mail, hashedPassword],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: error.message });
          }
          res.status(200).json({ message: 'User registered successfully' });
        }
      );
    }
  });
}

async function login(req, res) {
  const { name, mail, password } = req.body;
  const loginUser =
    'SELECT * FROM users WHERE name = name AND password = password';

  connection.query(loginUser, [name, mail, password], (error, result) => {
    const userHashedPassword = result[0].password;
    const username = result[0].name;
    const status = result[0].status;
    if (!username || !password || !mail) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }
    if (status === 'blocked') {
      return res.status(500).json('user blocked');
    }

    if (error) {
      return console.log(error);
    }

    if (name != username) {
      return res.status(404).json('user dose not exist');
    } else {
      const validatePassword = bcrypt.compareSync(password, userHashedPassword);
      if (!validatePassword) {
        return res.status(401).json({ message: `password is invalid` });
      }
      const currentData = new Date().getTimezoneOffset();
      console.log(currentData);
      const changeLoginDate = `UPDATE users SET last_login_time = CONVERT_TZ(NOW(), 'UTC', 'America/New_York') WHERE name = name`;

      connection.query(changeLoginDate, [currentData], (error) => {
        if (error) {
          console.log(error);
        }
      });
      const token = generateAccessToken(result.id);
      return res.status(200).json({ token });
    }
  });
}

async function blockUser(req, res) {
  const { id } = req.body;
  const CheckStatus = 'SELECT * FROM users WHERE id = id';
  const blockQuery = ' UPDATE users SET status = "blocked" WHERE id = id;';

  connection.query(CheckStatus, [id], (error, result) => {
    const status = result[0].status;
    if (error) {
      return console.log(error);
    }
    if (status === 'active') {
      connection.query(blockQuery, [id], (error, result) => {
        if (error) {
          return res.status(500).json(error.message);
        } else {
          res.status(200).json('user blocked');
        }
      });
    } else {
      res.json('user already blocked');
    }
  });
}

async function unblockUser(req, res) {
  const { id } = req.body;
  const CheckStatus = 'SELECT * FROM users WHERE id = id';
  const blockQuery = ' UPDATE users SET status = "active" WHERE id = id;';

  connection.query(CheckStatus, [id], (error, result) => {
    const status = result[0].status;
    if (error) {
      return console.log(error);
    }
    if (status === 'blocked') {
      connection.query(blockQuery, [id], (error, result) => {
        if (error) {
          return res.status(500).json(error.message);
        } else {
          res.status(200).json('user unblocked');
        }
      });
    } else {
      res.json('user already active');
    }
  });
}
async function deleteUser(req, res) {
  const { id } = req.body;
  const deleteUser = 'DELETE FROM users WHERE id = id;';
  connection.query(deleteUser, [id], (error) => {
    if (error) {
      return console.log(error);
    } else {
      res.status(200).json('user deleted');
    }
  });
}

const getMe = async (req, res) => {
  const { id } = req.body;
  const findUser = 'SELECT * FROM users WHERE id = id';
  connection.query(findUser, [id], (error, result) => {
    const User = result[0];
    console.log(User.id);
    if (error) {
      res.status(500).json(error.message);
    }
    if (User.id != id) {
      res.status(401).json({
        message: 'user is not defined',
      });
    } else {
      const token = generateAccessToken(User._id);
      return res.json({ User, token });
    }
  });

};

module.exports = {
  registration,
  login,
  getMe,
  blockUser,
  unblockUser,
  deleteUser,
};
