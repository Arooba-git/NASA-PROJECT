// @ts-nocheck
require('dotenv').config();
const {loadPlanetsData} = require('./models/planets/planets.model');
const { fetchAndSaveLaunches } = require('./models/launches/launches.model');
const{ mongoConnect  } = require('../src/services/mongo');
const app = require('./app');
const http = require('http');

const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

async function startServer() {
    await mongoConnect();

    await loadPlanetsData();
    await fetchAndSaveLaunches();
    
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

startServer();
