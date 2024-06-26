const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {OAuth2Client} = require('google-auth-library');
require("dotenv").config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const REACT_APP_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const authController = {}

authController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email })
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                //token
                const token = await user.generateToken();
                return res.status(200).json({status: "success", user, token})
            }
        }
        throw new Error("Invalid email or password")
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message });
    }
}

authController.loginWithGoogle = async (req, res) => {
    try {
        const { token } = req.body
        const googleClient = new OAuth2Client(REACT_APP_GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: REACT_APP_GOOGLE_CLIENT_ID,
        })

        const { email, name } = ticket.getPayload()
        let user = await User.findOne({ email })
        if (!user) {
            //Create New User
            const randomPassword = "" + Math.floor(Math.random() * 100000000)
            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(randomPassword, salt)
            user = new User({
                name,
                email,
                password: newPassword
            })
            await user.save()
        }
        // Issue Token
        const sessionToken = await user.generateToken()
        res.status(200).json({status: "success", user, token: sessionToken})
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) throw new Error("Token not found")
        const token = tokenString.replace("Bearer ", "");
        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if (error) throw new Error("Invalid Token")
            req.userId = payload._id
        })
        next();
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

authController.checkAdminPermission = async (req, res, next) => {
    try {
        //token
        const { userId } = req;
        const user = await User.findById(userId);
        if (user.level !== "admin") throw new Error("No Permission")
        next();
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

module.exports = authController;