const router = require('express').Router();

const chatBotController=require("./chatbotController")
const authentication=require('../middleware/auth')

router.post("/send-message",authentication,chatBotController.chat)
router.delete("/delete/:id",authentication,chatBotController.deleteChat)
router.get("/get-chats",authentication,chatBotController.getAllChat)
router.get("/get-chat/:id",authentication,chatBotController.getChatById)
router.put("/update-chat/:id",authentication,chatBotController.updateBotChat)

module.exports=router