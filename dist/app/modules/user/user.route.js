"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// Admin only routes
router.post('/', (0, auth_1.default)(constants_1.USER_ROLE.ADMIN), user_controller_1.UserControllers.createUser);
router.get('/', (0, auth_1.default)(constants_1.USER_ROLE.ADMIN), user_controller_1.UserControllers.getAllUsers);
router.delete('/:id', (0, auth_1.default)(constants_1.USER_ROLE.ADMIN), user_controller_1.UserControllers.deleteUser);
// User and Admin routes
router.get('/:id', (0, auth_1.default)(constants_1.USER_ROLE.USER, constants_1.USER_ROLE.ADMIN), user_controller_1.UserControllers.getSingleUser);
router.patch('/:id', (0, auth_1.default)(constants_1.USER_ROLE.USER, constants_1.USER_ROLE.ADMIN), user_controller_1.UserControllers.updateUser);
exports.UserRoutes = router;
