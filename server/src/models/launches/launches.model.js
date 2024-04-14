// @ts-nocheck
const launchesMongo = require('../launches/launches.schema');
const planetsMongo = require('../planets/planets.schema');
const DEFAULT_LAUNCH_NUMBER = 100;
const axios = require('axios');
const SPACEX_API = 'https://api.spacexdata.com/v4/launches/query';

async function scheduleNewLaunch(launch) {
    const foundPlanet = await planetsMongo.findOne({
        keplerName: launch.target
    });

    if (!foundPlanet) {
        throw new Error('Target planet not found');
    }

    const newLaunch = Object.assign(launch, {
        customer: ['ZTM', 'NASA'],
        upcoming: true,
        success: true,
        flightNumber: await getLatestFlightNumber() + 1
    });

    await saveLaunch(newLaunch);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesMongo
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_LAUNCH_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function fetchAndSaveLaunches() {
    // Step 1. check if flight exists
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstLaunch) {
        console.log('Lauch data already loaded');
    } else {
        // Step 2. if not, save launches
        saveSpaceXLaunchesToDatabase();
    }
}

async function findLaunch(filter) {
    return await launchesMongo.findOne(filter);
}

async function saveSpaceXLaunchesToDatabase() {
    const response = await axios.post(SPACEX_API, {
        query: {},
        options: {
            pagination: false,
            populate: [{
                path: 'rocket',
                select: {
                    name: 1
                }
            },
            {
                path: 'payloads',
                select: {
                    'customers': 1
                }
            }
            ]
        }
    });

    if (response.status !== 200) {
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        await saveLaunch(launch);
        
    }
}

async function saveLaunch(launch) {
    await launchesMongo.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    }
    );
}

async function getAllLaunches(skip, limit) {
    return await launchesMongo.find({}, {
        '__v': 0,
        '_id': 0
    }).sort({flightNumber: 1}).skip(skip).limit(limit);
}

async function launchExists(launchID) {
    return await await findLaunch ({
        flightNumber: launchID
    });
}

async function abortLaunch(launchId) {
    const aborted = await launchesMongo.updateOne({
        flightNumber: launchId
    }, {
            upcoming: false,
            success: false,
    });

    console.log('aborted', aborted);
    return aborted.modifiedCount === 1;
}

module.exports = {
    fetchAndSaveLaunches,
    getAllLaunches,
    launchExists,
    scheduleNewLaunch,
    abortLaunch
}
