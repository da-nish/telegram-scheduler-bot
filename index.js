const express = require('express');
const cron = require('node-cron');


// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = '8556932456:AAHPy_FVSNeoEEgF7A3F1FDefejDyh9G_R8';
const CHAT_ID = '1171563190';

async function sendTelegramMessage() {

    const fetch = (await import('node-fetch')).default;
    const message = 'Test message from MacBook Pro!';

    console.log(message)
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
        const data = await response.json();
        console.log('Telegram Response:', data);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

// API endpoint
app.get('/api/test_app_telegram', async (req, res) => {
  try {
    await sendTelegramMessage();
    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule task 3 times a day at 9:00, 14:00, 20:00
// cron.schedule('0 9,14,20 * * *', () => {
//   console.log('Running scheduled Telegram message...');
//   sendTelegramMessage();
// });

cron.schedule('* * * * *', () => {
  console.log('Running scheduled Telegram message...');
  sendTelegramMessage();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});