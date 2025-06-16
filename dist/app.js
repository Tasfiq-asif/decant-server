"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
// Initialize the express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '16mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Decantifume API is running successfully!',
    });
});
// API routes
app.use('/api/v1', routes_1.default);
// Not found handler
app.use(notFound_1.default);
// Global error handler
app.use(globalErrorHandler_1.default);
exports.default = app;
