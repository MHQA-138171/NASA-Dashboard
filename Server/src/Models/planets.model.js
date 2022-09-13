const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const Planet = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;

}

function loadPlanets() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'Data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }

            })
            .on('error', (error) => {
                console.log(error);
                reject(error);
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound} Habitable planets found`);
                resolve();
            });
    })
}
async function getAllPlanets() {
    return await Planet.find({}, '-_id -__v');
}
async function savePlanet(planet) {
    try {
        await Planet.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        })
    } catch (err) {
        console.log(`could not save planet ${err}`)
    }
}

module.exports = {
    loadPlanets,
    getAllPlanets
}
