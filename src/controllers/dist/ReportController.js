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
exports.ReportController = void 0;
var data_source_1 = require("../config/data-source");
var Report_1 = require("../entity/Report");
var Comment_1 = require("../entity/Comment");
var User_1 = require("../entity/User");
var reportRepository = data_source_1.AppDataSource.getRepository(Report_1.Report);
var commentRepository = data_source_1.AppDataSource.getRepository(Comment_1.Comment);
var ReportController = /** @class */ (function () {
    function ReportController() {
    }
    // Create a new report
    ReportController.prototype.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, title, description, type, userId, report, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, title = _a.title, description = _a.description, type = _a.type;
                        userId = req.user.id;
                        report = reportRepository.create({
                            title: title,
                            description: description,
                            type: type,
                            user: { id: userId }
                        });
                        return [4 /*yield*/, reportRepository.save(report)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, res.status(201).json(report)];
                    case 2:
                        error_1 = _b.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error creating report', error: error_1 })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get all reports
    ReportController.prototype.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var reports, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, reportRepository.find({
                                relations: ['user', 'comments'],
                                order: { createdAt: 'DESC' }
                            })];
                    case 1:
                        reports = _a.sent();
                        return [2 /*return*/, res.json(reports)];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error fetching reports', error: error_2 })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get report by ID
    ReportController.prototype.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, report, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, reportRepository.findOne({
                                where: { id: Number(id) },
                                relations: ['user', 'comments', 'comments.user']
                            })];
                    case 1:
                        report = _a.sent();
                        if (!report) {
                            return [2 /*return*/, res.status(404).json({ message: 'Report not found' })];
                        }
                        return [2 /*return*/, res.json(report)];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error fetching report', error: error_3 })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Update report
    ReportController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, title, description, type, status, report, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        _a = req.body, title = _a.title, description = _a.description, type = _a.type, status = _a.status;
                        return [4 /*yield*/, reportRepository.findOne({
                                where: { id: Number(id) },
                                relations: ['user']
                            })];
                    case 1:
                        report = _b.sent();
                        if (!report) {
                            return [2 /*return*/, res.status(404).json({ message: 'Report not found' })];
                        }
                        // Check if user is the owner or admin
                        if (report.user.id !== req.user.id && req.user.role !== User_1.UserRole.ADMIN) {
                            return [2 /*return*/, res.status(403).json({ message: 'Not authorized to update this report' })];
                        }
                        report.title = title || report.title;
                        report.description = description || report.description;
                        report.type = type || report.type;
                        report.status = status || report.status;
                        return [4 /*yield*/, reportRepository.save(report)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, res.json(report)];
                    case 3:
                        error_4 = _b.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error updating report', error: error_4 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Delete report
    ReportController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, report, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, reportRepository.findOne({
                                where: { id: Number(id) },
                                relations: ['user']
                            })];
                    case 1:
                        report = _a.sent();
                        if (!report) {
                            return [2 /*return*/, res.status(404).json({ message: 'Report not found' })];
                        }
                        // Check if user is the owner or admin
                        if (report.user.id !== req.user.id && req.user.role !== User_1.UserRole.ADMIN) {
                            return [2 /*return*/, res.status(403).json({ message: 'Not authorized to delete this report' })];
                        }
                        return [4 /*yield*/, reportRepository.remove(report)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.status(204).send()];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error deleting report', error: error_5 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Add comment to report
    ReportController.prototype.addComment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, content, userId, report, comment, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        content = req.body.content;
                        userId = req.user.id;
                        return [4 /*yield*/, reportRepository.findOne({
                                where: { id: Number(id) }
                            })];
                    case 1:
                        report = _a.sent();
                        if (!report) {
                            return [2 /*return*/, res.status(404).json({ message: 'Report not found' })];
                        }
                        comment = commentRepository.create({
                            content: content,
                            user: { id: userId },
                            report: { id: Number(id) }
                        });
                        return [4 /*yield*/, commentRepository.save(comment)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.status(201).json(comment)];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ message: 'Error adding comment', error: error_6 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ReportController;
}());
exports.ReportController = ReportController;
