module.exports = (error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const details = error.validation;
    const data = error.data;
    res.status(status).json({
        message,
        details,
        data
    });
};