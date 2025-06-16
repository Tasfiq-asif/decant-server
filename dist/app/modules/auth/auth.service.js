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
exports.AuthServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const constants_1 = require("../../constants");
const auth_1 = require("../../utils/auth");
const envConfig_1 = require("../../../configs/envConfig");
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const existingUser = yield user_model_1.User.findOne({ email: payload.email });
    if (existingUser) {
        throw new AppError_1.default(constants_1.HTTP_STATUS.CONFLICT, 'User already exists with this email');
    }
    // Create user with default role
    const userData = Object.assign(Object.assign({}, payload), { role: constants_1.USER_ROLE.USER });
    const result = yield user_model_1.User.create(userData);
    return result;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const user = yield user_model_1.User.findOne({
        email: payload.email,
        isDeleted: false
    }).select('+password');
    if (!user) {
        throw new AppError_1.default(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // Check if password matches
    const isPasswordMatched = yield bcryptjs_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }
    // Create JWT tokens
    const jwtPayload = {
        userId: user._id.toString(),
        role: user.role,
    };
    const accessToken = (0, auth_1.createToken)(jwtPayload, envConfig_1.env.JWT_ACCESS_SECRET, envConfig_1.env.JWT_ACCESS_EXPIRES_IN);
    const refreshToken = (0, auth_1.createToken)(jwtPayload, envConfig_1.env.JWT_REFRESH_SECRET, envConfig_1.env.JWT_REFRESH_EXPIRES_IN);
    return {
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
});
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const user = yield user_model_1.User.findById(userId).select('+password');
    if (!user) {
        throw new AppError_1.default(constants_1.HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    // Check if old password matches
    const isOldPasswordMatched = yield bcryptjs_1.default.compare(payload.oldPassword, user.password);
    if (!isOldPasswordMatched) {
        throw new AppError_1.default(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Old password is incorrect');
    }
    // Hash new password and update
    const hashedNewPassword = yield bcryptjs_1.default.hash(payload.newPassword, envConfig_1.env.BCRYPT_SALT_ROUNDS);
    yield user_model_1.User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
    });
    return null;
});
exports.AuthServices = {
    registerUser,
    loginUser,
    changePassword,
};
