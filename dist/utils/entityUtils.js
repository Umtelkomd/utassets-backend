"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPartialUpdate = applyPartialUpdate;
function applyPartialUpdate(entity, data, exceptions = []) {
    Object.entries(data).forEach(([key, value]) => {
        if (!exceptions.includes(key) && value !== undefined) {
            entity[key] = value;
        }
    });
}
