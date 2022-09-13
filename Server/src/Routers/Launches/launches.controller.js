const {
    getAllLaunches,
    scheduleNewLAunch,
    abortLaunchById,
    launchIdExists,
} = require('../../Models/launches.models');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    console.log(req.query);
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches);
}
async function httpPostNewLaunch(req, res) {
    launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate
        || !launch.target) {
        return res.status(400).json({
            error: 'missing required properties'
        })
    }
    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'invalid launch date'
        })
    }
    await scheduleNewLAunch(launch);
    return res.status(201).json(launch);
}
async function httpDeleteLaunch(req, res) {
    const launchId = Number(req.params.id)
    const idExists = await launchIdExists(launchId);
    if (!idExists) {
        return res.status(404).json({
            error: 'Launch not found'
        });
    }
    const aborted = await abortLaunchById(launchId)
    if (!aborted) {
        return res.status(400).json({
            error: 'Launch not aborted',
        });
    }
    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpDeleteLaunch,
}