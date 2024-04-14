// @ts-nocheck
const { getAllLaunches, scheduleNewLaunch, launchExists, abortLaunch }  = require('../models/launches/launches.model');
const { getPagination } = require('../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAbortLaunch(req, res) {
    const launchID = Number(req.params.id);
    const existingLaunch = await launchExists(launchID);

    if (!existingLaunch) {
        return res.status(200).json({
            error: "Launch does not exist"
        });
    }

    const aborted = abortLaunch(launchID);
    if (!aborted) {
        return res.status(200).json({ error: 'Deletion failed' });
    }

    return res.status(200).json({ok: true});
}

async function httpAddAllLaunches(req, res) {
    const { mission, rocket, launchDate, target } = req.body;

    if (!mission || !rocket || !launchDate || !target) {
        return res.status(400).json({
            error: "Missing required launch property"
        });
    }

    if (isNaN(new Date(launchDate))) {
        return res.status(400).json({
            error: "Invalid launch date"
        });
    }

    const newLaunch = { ...req.body, launchDate: new Date(req.body.launchDate) };
    await scheduleNewLaunch(newLaunch);
    return res.status(201).json(newLaunch);
}

module.exports = {
    httpGetAllLaunches,
    httpAddAllLaunches,
    httpAbortLaunch
}
