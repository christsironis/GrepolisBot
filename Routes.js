const express =require('express');
const { authenticate, setAutomation } =require('./Util_Funct.js');

const router = express.Router();

// We use router.use instead of app.use because the app and the router are 2 different objects
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


router.route("/login").get(function (req, res) {
    res.render("login.hbs"/* , { list: prwino, css: "/general.css", js: "/general.js" } */);
})
router.route("/login").post(authenticate,function (req, res) {
    console.log("user logged in");
	res.render("main.hbs");
})

router.route("/automation").post(setAutomation);


router.route("/").get(authenticate,function (req,res){
    res.render("main.hbs");
})


module.exports = {router}; 
