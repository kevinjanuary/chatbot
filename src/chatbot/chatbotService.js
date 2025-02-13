const prisma=require('../../prisma/prismaClient')
require("dotenv").config();
const axios = require("axios");
const { ApiError } = require('../helper/error');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



async function sendChatbot(userId, userInput) {
    try {
        // Simpan input user ke database dengan botReply sementara kosong
        const chatRecord = await prisma.chat.create({
            data: { userId, userInput, botReply: null }
        });

        
        const prompt = `kamu adalah pakar hp,berikan saran saran hp terbaik di dunia sekarang ini'${userInput}'`;

        // Kirim ke Gemini API menggunakan SDK
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const botReply = response.text() || "Error generating response";

        // Update database dengan balasan bot
        await prisma.chat.update({
            where: { id: chatRecord.id },
            data: { botReply }
        });

        return botReply;
    } catch (error) {
        console.error("Chatbot API Error:", error.message);
        throw new ApiError(error.statusCode || 400, error.message);
    }
}
async function deleteChatById(chatId) {
try {

    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
    });

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    
    const deleteChat= await prisma.chat.delete({
        where: { id: chatId },
    })

    return deleteChat
} catch (error) {
    console.error("failed delete chat", error.response?.data || error.message);
    throw new ApiError(error.statusCode || 400, error.message); 
}
    
}

async function getChatById(chatId) {
    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });
    
        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }

        return chat
    } catch (error) {
        console.error("failed to get chat ByID", error.response?.data || error.message);
        throw new ApiError(error.statusCode || 400, error.message); 
    }
}

async function getAllChat(userId) {
try {
    const chats = await prisma.chat.findMany({
        where: { userId },
    })

    return chats
    
} catch (error) {
    console.error("Failed To Get All Chat", error.response?.data || error.message);
    throw new ApiError(error.statusCode || 400, error.message); 
}
}

async function updateChatbot(chatId, newPrompt) {
    try {
        // Cari chat berdasarkan ID
        const chatRecord = await prisma.chat.findUnique({ where: { id: chatId } });
        if (!chatRecord) throw new ApiError(404, "Chat tidak ditemukan");

        // Buat prompt baru
        const prompt = [
            { role: "user", parts: [{ text: newPrompt }] }
        ];

        // Kirim ke Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({ contents: prompt });

        // Ambil respons teks
        const responseText = await result.response.text(); // Memanggil text sebagai fungsi

        // Debugging respons jika gagal
        if (!responseText) {
            console.log("Gemini API Full Response:", JSON.stringify(result, null, 2));
            throw new Error("Gagal mendapatkan teks dari Gemini API");
        }

        // Update chat di database
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: { botReply: responseText }
        });

        return updatedChat;

    } catch (error) {
        console.error("Update Chatbot Error:", error?.response?.data || error?.message);
        throw new ApiError(error?.statusCode || 500, error?.message);
    }
}


module.exports={
    sendChatbot,
    deleteChatById,
    getChatById,
    getAllChat,
    updateChatbot
}