"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.sendPushNotification = functions.https.onCall((data, context) => {
    return sendPushNotificationHandler(data, context, true);
});
exports.sendPushNotificationDev = functions.https.onCall((data, context) => {
    return sendPushNotificationHandler(data, context, false);
});
function sendPushNotificationHandler(data, context, isProd) {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }
    return new Promise((resolve, reject) => {
        console.log(data);
        const targetApps = data.target.map(m => m.mobileApp.language);
        console.log(targetApps.join(', '));
        let message = '';
        targetApps.forEach(topic => {
            console.log(topic);
            console.log(data.title);
            sendNotification(topic, data.title, data.message, data.articleId ? data.articleId.toString() : '')
                .then(response => {
                message += `Success: ${topic}`;
                if (!isProd) {
                    message += `(dry run)`;
                }
                console.log(message);
            })
                .catch(error => {
                message += `Failed: ${topic}`;
                if (!isProd) {
                    message += `(dry run)`;
                }
                console.log(message);
                console.error(error);
            });
        });
        resolve({ message: message });
    });
}
function sendNotification(topic, title, message, articleId) {
    const payload = {
        data: {
            articleId: articleId,
        },
        notification: {
            title: title,
            body: message,
            sound: 'default',
            badge: '1',
        },
    };
    const options = {
        priority: 'high',
        contentAvailable: true,
    };
    console.log(`/topics/${topic}`);
    return admin.messaging().sendToTopic(`/topics/${topic}`, payload, options);
}
//# sourceMappingURL=index.js.map