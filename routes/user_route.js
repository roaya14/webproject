const express = require('express');
const router = express.Router();
const authController = require('../controllers/user_controller');

// Register endpoint
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword',authController.forgotPassword);
router.post('/resetPassword',authController.resetPassword);
router.delete('/logout',authController.logout);

module.exports = router;
