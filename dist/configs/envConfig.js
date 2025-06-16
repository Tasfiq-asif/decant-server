"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load env variables from .env with error handling
try {
    const result = dotenv_1.default.config();
    // Check if .env file was loaded successfully
    if (result.error) {
        console.warn("Warning: .env file not found or could not be loaded.\n", result.error.message);
        process.exit(1);
    }
}
catch (error) {
    console.error("Error loading environment configuration:", error instanceof Error ? error.message : String(error));
    process.exit(1);
}
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/decantperfume";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1y";
exports.env = {
    PORT,
    HOST,
    NODE_ENV,
    DB_URL,
    BCRYPT_SALT_ROUNDS,
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
};
