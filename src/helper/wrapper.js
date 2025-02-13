const responseWrapper = (res, statusCode, message, data = {}, code = statusCode) => {
    res.status(statusCode).json({
        status: code,  // Status code masuk dalam response
        message,
        data
    });
};

module.exports=responseWrapper