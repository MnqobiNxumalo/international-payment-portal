class BaseController {
    constructor(model) {
        this.model = model;
    }

    // Handle success response
    success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    // Handle error response
    error(res, error, message = 'Server error', statusCode = 500) {
        console.error(error);
        return res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

    // Handle validation error
    validationError(res, errors, message = 'Validation failed', statusCode = 400) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    }
}

module.exports = BaseController;