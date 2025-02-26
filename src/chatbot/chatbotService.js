const prisma = require("../../prisma/prismaClient")
require("dotenv").config()
const { ApiError } = require("../helper/error")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function sendChatbot(userId, userInput) {
  try {
    // Simpan input user ke database dengan botReply sementara kosong
    const chatRecord = await prisma.chat.create({
      data: { userId, userInput, botReply: null },
    })

    // Kirim ke Gemini API menggunakan SDK
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "Anda adalah seorang asisten dalam study jam yang diselenggarakan oleh Google Developer Group on Campus Esa Unggul. Berikan jawaban yang ramah, informatif, dan sedikit humoris jika konteksnya memungkinkan. Fokus pada memberikan penjelasan yang jelas dan mudah dipahami untuk membantu orang belajar. Jangan ragu untuk memberikan contoh atau analogi yang mudah dipahami, agar pembelajaran lebih menarik. Jika pengguna bingung, coba jelaskan dengan cara yang berbeda.",
      generationConfig: {
        temperature: 0.7,
      },
    })
    const result = await model.generateContent(userInput)
    const response = await result.response
    const botReply = response.text() || "Error generating response"

    // Update database dengan balasan bot
    await prisma.chat.update({
      where: { id: chatRecord.id },
      data: { botReply },
    })

    return botReply
  } catch (error) {
    console.error("Chatbot API Error:", error.message)
    throw new ApiError(error.statusCode || 400, error.message)
  }
}
async function deleteChatById(chatId) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    })

    if (!chat) {
      throw new ApiError(404, "Chat not found")
    }

    const deleteChat = await prisma.chat.delete({
      where: { id: chatId },
    })

    return deleteChat
  } catch (error) {
    console.error("failed delete chat", error.response?.data || error.message)
    throw new ApiError(error.statusCode || 400, error.message)
  }
}

async function getChatById(chatId) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    })

    if (!chat) {
      throw new ApiError(404, "Chat not found")
    }

    return chat
  } catch (error) {
    console.error(
      "failed to get chat ByID",
      error.response?.data || error.message
    )
    throw new ApiError(error.statusCode || 400, error.message)
  }
}

async function getAllChat(userId) {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    return chats.reverse()
  } catch (error) {
    console.error(
      "Failed To Get All Chat",
      error.response?.data || error.message
    )
    throw new ApiError(error.statusCode || 400, error.message)
  }
}

async function updateChatbot(chatId, newPrompt) {
  try {
    // Cari chat berdasarkan ID
    const chatRecord = await prisma.chat.findUnique({ where: { id: chatId } })
    if (!chatRecord) throw new ApiError(404, "Chat tidak ditemukan")

    // Buat prompt baru
    const prompt = [{ role: "user", parts: [{ text: newPrompt }] }]

    // Kirim ke Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent({ contents: prompt })

    // Ambil respons teks
    const responseText = await result.response.text() // Memanggil text sebagai fungsi

    // Debugging respons jika gagal
    if (!responseText) {
      console.log("Gemini API Full Response:", JSON.stringify(result, null, 2))
      throw new Error("Gagal mendapatkan teks dari Gemini API")
    }

    // Update chat di database
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { botReply: responseText },
    })

    return updatedChat
  } catch (error) {
    console.error(
      "Update Chatbot Error:",
      error?.response?.data || error?.message
    )
    throw new ApiError(error?.statusCode || 500, error?.message)
  }
}

module.exports = {
  sendChatbot,
  deleteChatById,
  getChatById,
  getAllChat,
  updateChatbot,
}
