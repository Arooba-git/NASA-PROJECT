// @ts-nocheck
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

// @ts-ignore
mongoose.connection.once('open', () => {
    console.log('mongoose connection successful!');
});

// @ts-ignore
mongoose.connection.on('error', (error) => {
    console.log('mongoose error', error);
});

module.exports = { mongoConnect, mongoDisconnect  }
