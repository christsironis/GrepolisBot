const express =require('express');
const {authenticate, register} =require('./login-register.js');
const { Login } = require("./grep_login.js");

const authRouter = express.Router();
const router = express.Router();

// We use router.use instead of app.use because the app and the router are 2 different objects
authRouter.use(express.urlencoded({ extended: true }));

authRouter.route("/login").get(function (req, res) {
    res.render("login.hbs"/* , { list: prwino, css: "/general.css", js: "/general.js" } */);
})
authRouter.route("/login").post(authenticate,function (req, res) {
    res.send(res.locals.userInfo)
})
authRouter.route("/register").get(function (req, res) {
    res.render("register.hbs"/* , { list: prwino, css: "/general.css", js: "/general.js" } */);
})
authRouter.route("/register").post(register,function (req, res) {
    res.send(res.locals.status)
})

router.route("/").get(function (req,res){
    res.render("main.hbs");
})




module.exports = {router, authRouter}; 
