"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../app/constants");
const notFound = (req, res) => {
    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'API Not Found!',
        error: '',
    });
};
exports.default = notFound;
