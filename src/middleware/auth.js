const { verifyToken } = require("../helper/jwt");
const prisma = require("../../prisma/prismaClient");

const authentication = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Bearer token not provided!" });
        }

        // Ambil token setelah "Bearer "
        const token = authHeader.split(" ")[1];

        // Verifikasi token
        const decoded = verifyToken(token);

        // Cari user berdasarkan decoded token
        const userData = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true }
        });
        
        if (!userData) {
            return res.status(401).json({ message: "User not found" });
        }

        // Simpan userData ke request agar bisa digunakan di endpoint lain
        req.userData = {
            id: userData.id,
            email: userData.email,
            username: userData.username,
        };

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = authentication;
