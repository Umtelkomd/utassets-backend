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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CommentController = void 0;
var data_source_1 = require("../config/data-source");
var Comment_1 = require("../entity/Comment");
var User_1 = require("../entity/User");
var commentRepository = data_source_1.AppDataSource.getRepository(Comment_1.Comment);
var CommentController = /** @class */ (function () {
    function CommentController() {
    }
    // Get all comments for a report
    CommentController.prototype.getByReportId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var reportId, comments, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        reportId = req.params.reportId;
                        return [4 /*yield*/, commentRepository.find({
                                where: { report: { id: Number(reportId) } },
                                relations: ['user'],
                                order: { createdAt: 'ASC' }
                            })];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, res.json(comments)];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error fetching comments', error: error_1 })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Update comment
    CommentController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, content, comment, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        content = req.body.content;
                        return [4 /*yield*/, commentRepository.findOne({
                                where: { id: Number(id) },
                                relations: ['user']
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            return [2 /*return*/, res.status(404).json({ message: 'Comment not found' })];
                        }
                        // Check if user is the owner or admin
                        if (comment.user.id !== req.user.id && req.user.role !== User_1.UserRole.ADMIN) {
                            return [2 /*return*/, res.status(403).json({ message: 'Not authorized to update this comment' })];
                        }
                        comment.content = content;
                        return [4 /*yield*/, commentRepository.save(comment)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.json(comment)];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error updating comment', error: error_2 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Delete comment
    CommentController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, comment, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, commentRepository.findOne({
                                where: { id: Number(id) },
                                relations: ['user']
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            return [2 /*return*/, res.status(404).json({ message: 'Comment not found' })];
                        }
                        // Check if user is the owner or admin
                        if (comment.user.id !== req.user.id && req.user.role !== User_1.UserRole.ADMIN) {
                            return [2 /*return*/, res.status(403).json({ message: 'Not authorized to delete this comment' })];
                        }
                        return [4 /*yield*/, commentRepository.remove(comment)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.status(204).send()];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error deleting comment', error: error_3 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CommentController;
}());
exports.CommentController = CommentController;
