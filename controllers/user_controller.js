const User = require('../models/user');
const bcrypt = require('bcrypt');
const { Sequelize , Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../email_utils');
const crypto = require('crypto');

const authController = {
  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: API endpoints for user authentication
   */

  /**
   * @swagger
   * /register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Check your email format
   *       409:
   *         description: Username or email is already taken
   *       500:
   *         description: Internal Server Error
   */
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Check your email format.' });
      }

      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Username or email is already taken.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      }, {
        fields: ['user_id', 'username', 'email', 'password', 'access_token'],
      });
      

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Login with username and password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Welcome back user
   *       400:
   *         description: Bad request
   *       401:
   *         description: Invalid username or password
   *       500:
   *         description: Internal Server Error
   */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const user = await User.findOne({
        where: {
          username,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const accessToken = jwt.sign({ userId: user.user_id }, 'secretkey', { expiresIn: '1h' });
      await user.update({ access_token: accessToken });

      console.log(`Welcome back ${username} `);
      res.status(200).json({ accessToken });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  /**
   * @swagger
   * /forgotPassword:
   *   post:
   *     summary: Used to generate a token in case user forgot password and wants to reset it 
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *              
   *     responses:
   *       200:
   *         description: Password email sent 
   *       400:
   *         description: Bad request
   *       401:
   *         description: Invalid email
   *       500:
   *         description: Error fetching/updating user from database 
   */
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({
        where: { email },
      });
  
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).send({ error: "Invalid email" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 2);
      await user.update({
        reset_token: token,
        reset_token_expiration: expirationDate,
      });
      console.log('User updated:', user);
      sendResetPasswordEmail(email, token);
      return res.status(200).send({ message: "Password reset email sent" });
    }  catch (error) {
      console.error("Sequelize Error:", error);
      return res.status(500).send({ error: "Error fetching/updating user from database" });
    }
  },
  /**
   * @swagger
   * /resetPassword:
   *   post:
   *     summary: Reset password by entering the email,reset token and new password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               token:
   *                 type: string
   *               newPassword: 
   *                 type: string 
   *              
   *     responses:
   *       200:
   *         description: Password reset successful 
   *       400:
   *         description: Bad request
   *       401:
   *         description: Invalid reset token or expired
   *       500:
   *         description: Error resetting password 
   */
  resetPassword: async (req, res) => {
    const { email, token, newPassword } = req.body;
  
    try {
      const user = await User.findOne({
        where: {
          email: email,
          reset_token: token,
          reset_token_expiration: { [Op.gt]: new Date() },
        },
     });
  
      if (!user) {
        console.log('Invalid reset token or expired:', email);
        return res.status(401).send({ error: "Invalid reset token or expired" });
      }
      
      const hashedPassword = await bcrypt.hashSync(newPassword, 10);

      await user.update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiration: null,
      });
  
      console.log('Password reset successful:', email);
  
      return res.status(200).send({ message: "Password reset successful" });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).send({ error: "Error resetting password" });
    }
  },
  
   logout : async (req, res) => {
    try {
       verifyToken(req, res, async () => {
         const user = req.user;
   
         // Add the token to the blacklisted tokens set
         blacklistedTokens.add(user.access_token);
   
         // Remove the access token from the user in the database
         await User.update({ access_token: null }, { where: { user_id: user.userId } });
   
         res.status(200).json({ message: 'Logout successful' });
       });
    } catch (error) {
       console.error('Error during logout:', error);
       res.status(500).json({ error: 'Internal Server Error' });
    }
   },

};
const blacklistedTokens = new Set();

const verifyToken = async (req, res, next) => {
 const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
 const user = req.user;

 if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
 }

 try {
    const decoded = jwt.verify(token, 'secretkey'); // Use the same secret key you used to sign the token

    user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check if the token is blacklisted
    if (blacklistedTokens.has(token)) {
      return res.status(401).json({ error: 'Unauthorized: Token is blacklisted' });
    }

    req.user = user;
    next(); // Continue with the next middleware or the route handler
 } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
 }
};

module.exports = authController;
