"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.USER_STATUS = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    USER: 'user',
    ADMIN: 'admin',
};
exports.USER_STATUS = {
    ACTIVE: 'active',
    BLOCKED: 'blocked',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
