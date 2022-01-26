

async function sendMessage (number, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const newSMS = await client.messages
        .create({
            body: message,
            from: process.env.TWILIO_ADMIN_NUMBER,
            to: `+88${number}`})
    if (Object.keys(newSMS).length) {
        return {
            status: true,
        }
    }else {
        return {
            status: false,
        }
    }
}

module.exports = sendMessage