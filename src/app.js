const express = require("express")
const app = express()
const PORT= 3000
const userRoutes=require('../src/user/userRoute')
const chatRoutes=require('../src/chatbot/chatbotRoute')
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', userRoutes)
app.use('/chatbot',chatRoutes)

app.get('/', (req,res)=>{
    res.send('Hallo bro')
})

app.listen(PORT,()=>{
    console.log(`this server run at port: ${PORT}`);
})

