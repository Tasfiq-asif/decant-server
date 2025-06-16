"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envConfig_1 = require("../configs/envConfig");
const AppError_1 = __importDefault(require("../app/errors/AppError"));
const globalErrorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    // Handle AppError
    if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err.message,
            },
        ];
    }
    // Handle Mongoose validation errors
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errorSources = Object.values(err.errors).map((val) => ({
            path: val === null || val === void 0 ? void 0 : val.path,
            message: val === null || val === void 0 ? void 0 : val.message,
        }));
    }
    // Handle Mongoose CastError
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID';
        errorSources = [
            {
                path: err === null || err === void 0 ? void 0 : err.path,
                message: err === null || err === void 0 ? void 0 : err.message,
            },
        ];
    }
    // Handle duplicate key error
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        statusCode = 400;
        message = 'Duplicate Entry';
        const match = err.message.match(/"([^"]*)"/);
        const extractedMessage = match && match[1];
        errorSources = [
            {
                path: '',
                message: `${extractedMessage} already exists`,
            },
        ];
    }
    // Handle generic errors
    else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: '',
                message: err.message,
            },
        ];
    }
    // Return error response
    const errorResponse = {
        success: false,
        message,
        errorSources,
    };
    // Add stack trace in development
    if (envConfig_1.env.NODE_ENV === 'development') {
        errorResponse.stack = err === null || err === void 0 ? void 0 : err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.default = globalErrorHandler;
