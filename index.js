const express = require('express');
const cron = require('node-cron');
const axios = require("axios");


// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = '8556932456:AAHPy_FVSNeoEEgF7A3F1FDefejDyh9G_R8';
const CHAT_ID = '1171563190';


const pnrData = {
  "pnrNo": "8645445216",
  "trainName": "KAMAYANI EXPRESS",
  "departureTime": "2026-05-04T13:50:00",
  "arrivalTime": "2026-05-05T07:28:00",
  "srcCode": "LTT",
  "dstCode": "SGO",
  "passengers": [
    {
      "name": "Passenger 1",
      "currentStatus": "Waitlist",
      "currentSeatDetails": "PQWL-71",
      "confirmProb": 18
    },
     {
      "name": "Passenger 1",
      "currentStatus": "Waitlist",
      "currentSeatDetails": "PQWL-72",
      "confirmProb": 18
    }
  ]
};

async function sendTelegramMessage(messageData) {

    const fetch = (await import('node-fetch')).default;
    // const message = 'Test message from MacBook Pro!';


    // console.log(message)
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: messageData })
        });
        const data = await response.json();

        // console.log('Telegram Response:', messageData);
        console.log('sent message');
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

function formatMessage(data) {
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      // year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  let message = `🚆 Train Ticket Update\n\n`;
  message += `📌 PNR: ${data.pnrNo}\n`;
  message += `🚆 Train: ${data.trainName}\n\n`;
  message += `🕒 Departure: ${formatDate(data.departureTime)}\n`;
  message += `🕗 Arrival: ${formatDate(data.arrivalTime)}\n\n`;
  message += `📍 From: ${data.srcCode}\n`;
  message += `📍 To: ${data.dstCode}\n\n`;

  message += `👤 Passenger Details:\n--------------------------------\n`;

  data.passengers.forEach((p, index) => {
    message += `${index + 1}️⃣ ${p.name}\n`;
    message += `   • Seat: ${p.currentSeatDetails}\n`;
    message += `   • Confirmation Chance: ${p.confirmProb}%\n\n`;
  });

  message += `--------------------------------\n`;
  message += `⚠️ Ticket status may change until chart preparation.`;

  return message;
}

async function getPNRData(pnr) {
  console.log("checking PNR: ",  pnr)
  const API_URL = "https://www.redbus.in/rails/api/getPnrToolKitData";
  try {
    const response = await axios.post(API_URL, {
      pnr: pnr,
    });

    const data = response.data;

    const result = {
      pnrNo: data.pnrNo,
      trainName: data.trainName,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      srcCode: data.srcCode,
      dstCode: data.dstCode,
      passengers: data.passengers.map(p => ({
        name: p.name,
        currentStatus: p.currentStatus,
        currentSeatDetails: p.currentSeatDetails,
        confirmProb: p.confirmProb,
      })),
    };

    // console.log(result);
    return result;

  } catch (error) {
    console.error("Error fetching PNR data:", error.message);
  }
}

// API endpoint
app.get('/api/check_pnr', async (req, res) => {
  const pnrList = [
    // '8545442624','8145446008','8146495108', '8345444093'
  ];
  try {
    for (const pnr of pnrList) {
      const pnrResponse = await getPNRData(pnr);
      const formatted = formatMessage(pnrResponse)
      await sendTelegramMessage(formatted);
      // console.log('PNR Response:', formatMessage(pnrResponse));
    }
    console.log('All PNRs processed successfully');
    res.json({ success: true, message: 'All PNRs processed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint
app.get('/api/test_app_telegram', async (req, res) => {
  try {
    const formatted = formatMessage(pnrData)
    await sendTelegramMessage(formatted);
    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint
app.get('/api/format', async (req, res) => {
      

  try {
    console.log('Telegram Response:', formatMessage(pnrData));
    res.json({ success: true, message: formatMessage(pnrData) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule task 3 times a day at 9:00, 14:00, 20:00
// cron.schedule('0 9,14,20 * * *', () => {
//   console.log('Running scheduled Telegram message...');
//   sendTelegramMessage();
// });

// cron.schedule('* * * * *', () => {
//   console.log('Running scheduled Telegram message...');
//   sendTelegramMessage();
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});