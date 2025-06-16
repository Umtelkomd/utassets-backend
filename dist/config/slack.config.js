"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackConfig = void 0;
exports.slackConfig = {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    enabled: process.env.SLACK_WEBHOOK_ENABLED === 'true' || false
};
