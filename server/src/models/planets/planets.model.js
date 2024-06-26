// @ts-nocheck
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const planets = require('../planets/planets.schema');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, "..", "..", "..", "data", 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject();
            })
            .on('end', async () => {
                console.log(`${(await getAllPlanets()).length} habitable planets found!`);
                // @ts-ignore
                resolve();
            });
    })
}

async function getAllPlanets() {
    try {
        return await planets.find({}, {
            '_id': 0,
            '__v': 0
        });
    } catch (error) {
        console.log('Mongoose error: Could not find planets', error);
    }
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch(error) {
        console.log('Mongoose error: Could not create planet', error);
    }
}

module.exports = { loadPlanetsData, getAllPlanets, savePlanet }
