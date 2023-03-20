const Router = require('express');
const router = new Router();

const { registration, login, getMe, blockUser ,unblockUser,deleteUser,getUsers } = require('./authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', (req, res) => {
  return registration(req, res);
});

router.post('/login', (req, res) => {
  return login(req, res);
});

router.get('/getme', authMiddleware, (req, res) => {
  getMe(req, res);
});
router.post('/block', (req, res) => {

  blockUser(req, res);
});
router.post('/unblock', (req, res) => {

  unblockUser(req, res);
});

router.post('/delete', (req,res) => {
  deleteUser(req,res)
})
router.get('/users',authMiddleware, (req,res) => {
  getUsers(req, res)
})
module.exports = router;
