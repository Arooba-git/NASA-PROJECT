const express = require('express');
const launchesRouter = express.Router();
const { httpGetAllLaunches, httpAddAllLaunches, httpAbortLaunch } = require('../controllers/launches.controller');

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddAllLaunches);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;
