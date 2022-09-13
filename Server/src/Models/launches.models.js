const Launches = require('./launches.mongo');
const Planets = require('./planets.mongo');
const axios = require('axios');


const DEFAULT_LAUNCH_NUMBER = 100;
const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query';

async function findLaunch(filter) {
    return await Launches.findOne(filter);
}

async function launchIdExists(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}
async function getLatestFlightNumber() {
    const latestLaunch = await Launches.findOne().sort('-flightNumber')
    if (!latestLaunch) {
        return DEFAULT_LAUNCH_NUMBER;
    }
    return latestLaunch.flightNumber;
}
async function populateLaunches() {
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch Data download failed');
    }
    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            rocket: launchDoc['rocket']['name'],
            mission: launchDoc['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber} ${launch.mission}`);
        saveLaunch(launch);
    }
}
async function saveLaunch(launch) {
    await Launches.findOneAndUpdate({
        flightNumber: Launches.flightNumber,
    }, launch, {
        upsert: true,
    });
}
async function loadLaunchData() {
    console.log('Downloading Launch Data from SpaceX...');
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })
    if (firstLaunch) {
        console.log('launch data already exists')
    }
    else {
        await populateLaunches()
    };


}
async function getAllLaunches(skip, limit) {
    return await Launches
        .find({}, '-_id -__v')
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}
async function scheduleNewLAunch(launch) {
    const planet = Planets.findOne({
        keplerName: Launches.target
    })
    if (!planet) {
        throw new Error('No planet with given target found')
    }
    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        flightNumber: newFlightNumber,
        customers: ['Humayun', 'NASA'],
    })
    await saveLaunch(newLaunch);
}
async function abortLaunchById(launchId) {
    const aborted = await Launches.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    })
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    launchIdExists,
    getAllLaunches,
    scheduleNewLAunch,
    abortLaunchById,
}