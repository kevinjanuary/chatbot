const chatbotService = require("../chatbot/chatbotService");
const responseWrapper= require('../helper/wrapper')

class ChatbotController {
    static async chat(req, res) {
        try {
            const userId = req.userData.id; // Dari token JWT
            const { userInput } = req.body;

            if (!userInput) {
                return responseWrapper(res, 400, "User input is required", {});
            }

            const botReply = await chatbotService.sendChatbot(userId, userInput);

            return responseWrapper(res, 200, "Chat processed successfully", { userId, userInput, botReply });
        } catch (error) {
            return responseWrapper(res, error.statusCode, error.message, {});
        }
    }

    static async deleteChat(req,res){
        try {
            const {id}= req.params
            const deleteChat= await chatbotService.deleteChatById(id)
            return responseWrapper(res, 201, "Successfully Delete Chat",{ deleteChat });
        } catch (error) {
            return responseWrapper(res, error.statusCode, error.message, {});
        }
    }

    static async getChatById(req,res){
        try {
            const {id}= req.params
            const getChat = await chatbotService.getChatById(id)

            return responseWrapper(res,201,"Successfully Chat By Id",getChat)
        } catch (error) {
             return responseWrapper(res, error.statusCode, error.message, {});
        }
    }

    static async getAllChat(req,res){
        try {
        const userId = req.userData.id; 
        const getAllChats= await chatbotService.getAllChat(userId)
        return responseWrapper(res,201,"Successfully Get All Chat",getAllChats)
        } catch (error) {
        return responseWrapper(res, error.statusCode, error.message, {});  
        }
    }

    static async updateBotChat(req,res){
        try {
            const { id } = req.params;
            const { newPrompt } = req.body; // Ambil prompt baru dari request body
    
            if (!newPrompt) {
                return res.status(400).json({ message: "Prompt tidak boleh kosong" });
            }
    
            const updatedChat = await chatbotService.updateChatbot(id, newPrompt);
            
        if (!updatedChat || !updatedChat.botReply) {
            return res.status(500).json({ message: "Gagal memperbarui chat" });
        }

        return responseWrapper(res, 200, "Successfully updated chat", {
            userInput: newPrompt,
            botReply: updatedChat.botReply
        });

        } catch (error) {
            return responseWrapper(res, error.statusCode, error.message, {});  
        }
    }
}

module.exports=ChatbotController