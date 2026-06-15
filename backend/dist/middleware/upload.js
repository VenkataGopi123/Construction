"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
exports.getUploadPath = getUploadPath;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const types_1 = require("../types");
const uploadDir = path_1.default.resolve(env_1.env.upload.uploadDir);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, filename);
    },
});
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
];
function fileFilter(_req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new types_1.AppError(`File type not allowed: ${file.mimetype}`, 400));
    }
}
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.env.upload.maxFileSize },
    fileFilter,
});
exports.uploadSingle = exports.upload.single('file');
exports.uploadMultiple = exports.upload.array('files', 10);
function getUploadPath(filename) {
    return path_1.default.join(uploadDir, filename);
}
//# sourceMappingURL=upload.js.map