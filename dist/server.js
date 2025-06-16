"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const envConfig_1 = require("./configs/envConfig");
const database_1 = __importDefault(require("./configs/database"));
// Connect to database
(0, database_1.default)();
const server = app_1.default.listen(envConfig_1.env.PORT, () => {
    console.log(`🚀 Server (${envConfig_1.env.NODE_ENV}) running at http://${envConfig_1.env.HOST}:${envConfig_1.env.PORT}`);
});
// Graceful shutdown handler
const onCloseSignal = () => {
    console.log("🛑 SIGINT/SIGTERM received, shutting down gracefully...");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
    // Force shutdown if it takes too long
    setTimeout(() => {
        console.error("❌ Forcefully exiting after timeout");
        process.exit(1);
    }, 10000).unref();
};
// Listen to termination signals
process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
