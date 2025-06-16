"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../app/errors/AppError"));
const constants_1 = require("../app/constants");
const envConfig_1 = require("../configs/envConfig");
const user_model_1 = require("../app/modules/user/user.model");
const catchAsync_1 = __importDefault(require("../app/utils/catchAsync"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        // Check if token exists
        if (!token) {
            throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'You are not authorized');
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, envConfig_1.env.JWT_ACCESS_SECRET);
            // Check if user still exists
            const currentUser = yield user_model_1.User.findById(decoded.userId);
            if (!currentUser) {
                throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'The user no longer exists');
            }
            // Check if user is deleted
            if (currentUser.isDeleted) {
                throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'The user is deleted');
            }
            // Check user role
            if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
                throw new AppError_1.default(constants_1.HTTP_STATUS.FORBIDDEN, 'You are not authorized');
            }
            // Add user to request object
            req.user = decoded;
            next();
        }
        catch (error) {
            throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'You are not authorized');
        }
    }));
};
exports.default = auth;
