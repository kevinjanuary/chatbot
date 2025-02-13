const userService= require('./userService')
const responseWrapper= require('../helper/wrapper')

class UserController{
    static async userLogin (req,res){
        try {
            const { token, user }= await userService.login(req.body)
            responseWrapper(res,200, "Login Successfully", {token})
        } catch (error) {
            console.log("Error in userLogin:", error);
            responseWrapper(res, error.statusCode || 400, error.message, {});
        }
    }
                                                                                                                                            
    static async userRegister (req,res){
    try {
       const user = await userService.register(req.body);
       responseWrapper(res,200, "User registered successfully", user)
    } catch (error) {
        responseWrapper(res, error.statusCode || 400, error.message, {});
    }
    }
}


module.exports=UserController