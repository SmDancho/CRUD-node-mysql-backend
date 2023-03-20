const bcrypt = require('bcrypt');
const e = require('cors');
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

  const addNewUser = 'INSERT INTO users (name,mail, password) VALUES (?, ?,?)';
  if (!name || !password || !mail) {
    return res
      .status(400)
      .json({ message: 'Username , password ,mail are required' });
  }

  const isUserRegister = `SELECT * FROM users WHERE name = ?`;
  const getUser = 'SELECT * FROM users WHERE id  = ?';
  connection.query(isUserRegister, [name], (error, result) => {
    console.log(result);
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (result.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    connection.query(
      addNewUser,
      [name, mail, hashedPassword],
      (error, result) => {
        const id = result.insertId;
        if (error) {
          return res.status(500).json({ message: error.message });
        }
        connection.query(getUser, [id], (error, result) => {
          const user = result[0]
          console.log(user)
          const token = generateAccessToken(user.id);
          return res.json({ token });
        });
      }
    );
  });
}

async function login(req, res) {
  const { name, mail, password } = req.body;
  const loginUser = 'SELECT * FROM users WHERE name = ?';

  connection.query(loginUser, [name], (error, result) => {
    const user = result[0];

    if (!user) {
      return res.status(404).json('user dose not exist');
    } else if (user.status === 'blocked') {
      return res.status(403).json('user blocked');
    } else if (error) {
      return console.log(error);
    } else if (!name || !password || !mail) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    } else if (user.status === 'blocked') {
      return res.status(500).json('user blocked');
    } else {
      const validatePassword = bcrypt.compareSync(password, user.password);

      if (!validatePassword) {
        return res.status(401).json({ message: `password is invalid` });
      }
      const changeLoginDate =
        'UPDATE users SET last_login_time = CURRENT_TIMESTAMP WHERE name = ?;';

      connection.query(changeLoginDate, [name], (error) => {
        if (error) {
          console.log(error);
        }
      });
      const token = generateAccessToken(result[0].id);
      return res.status(200).json({ token, user });
    }
  });
}

async function blockUser(req, res) {
  const { id } = req.body;
  const CheckStatus = `SELECT * FROM users WHERE id = ?`;

  const blockQuery = ' UPDATE users SET status = "blocked" WHERE id = ?;';

  connection.query(CheckStatus, [id], (error, result) => {
    const user = result[0];
    if (!user) {
      res.status(404).json('user is not defined');
    }
    connection.query(blockQuery, [id], (error) => {
      if (error) {
        return res.status(500).json(error.message);
      } else {
        return res.status(200).json('user blocked');
      }
    });
  });
}

async function unblockUser(req, res) {
  const { id } = req.body;
  const CheckStatus = 'SELECT * FROM users WHERE id = ?';
  const blockQuery = ' UPDATE users SET status = "active" WHERE id = ?;';

  connection.query(CheckStatus, [id], (error) => {
    if (error) {
      return console.log(error);
    }
    connection.query(blockQuery, [id], (error, result) => {
      if (error) {
        return res.status(500).json(error.message);
      } else {
        res.status(200).json('user unblocked');
      }
    });
  });
}
async function deleteUser(req, res) {
  const { id } = req.body;
  const deleteUser = 'DELETE FROM users WHERE id = ?;';
  connection.query(deleteUser, [id], (error) => {
    if (error) {
      return console.log(error);
    } else {
      res.status(200).json('user deleted');
    }
  });
}

const getMe = async (req, res) => {
  const id = req.userId;
  const findUser = 'SELECT * FROM users WHERE id = ?';
  connection.query(findUser, [id], (error, result) => {
    const User = result[0];
    if (error) {
      return res.status(500).json(error.message);
    }
    if (req.userId != id) {
      return res.status(401).json({
        message: 'user is not defined',
      });
    }
    const token = generateAccessToken(User?.id);
    return res.json({ User, token });
  });
};
const getUsers = async (req, res) => {
  const allUsers = 'SELECT * FROM users';
  connection.query(allUsers, [], (error, result) => {
    if (error) {
      return res.status(500).json(error);
    } else {
      return res.status(200).json(result);
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
  getUsers,
};
