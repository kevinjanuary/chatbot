const prisma= require('../../prisma/prismaClient')
const bcrypt=require('../helper/bcrypt')
const jwt=require('../helper/jwt')
const { ApiError } = require('../helper/error');

async function register(data) {
  try {
    const {email,password,name}=data
    const existingUser= await prisma.user.findUnique({where:{email}})

    if (existingUser) throw new ApiError(409,'User Already Exist')

    const hashedPassword= bcrypt.hashPassword(password)

        const user= await prisma.user.create({
            data: { 
                email,
                name,
                password: hashedPassword,  
            },
            select: { id: true, email: true, name: true, createdAt: true ,updatedAt:true}
        })
        return user

  } catch (error) {
    console.log(error);
    throw new ApiError(error.statusCode || 400, error.message || "Something went wrong");
  }


}
async function login(data) {
    try {
       const {email,password}=data
       const user = await prisma.user.findUnique({ where: { email } });
       if (!user) throw new ApiError(400,"Invalid email");

       // Cek password
       const isPasswordValid = bcrypt.comparePassword(password, user.password);
       if (!isPasswordValid) throw new ApiError(400,"Invalid password");

       // Buat token JWT
       const token = jwt.generateToken({ id: user.id, email: user.email });

       return {token,user}
    } catch (error) {
        console.log(error);
        throw new ApiError(error.statusCode || 400, error.message); 
    }
}


module.exports={
    register,
    login
}