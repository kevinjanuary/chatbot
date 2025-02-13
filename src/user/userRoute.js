const router = require('express').Router();

const UserController=require("./userController")

router.post("/register",UserController.userRegister)
router.post("/login",UserController.userLogin)


module.exports=router