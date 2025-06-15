export const slackConfig = {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    enabled: process.env.SLACK_WEBHOOK_ENABLED === 'true' || false
}; 