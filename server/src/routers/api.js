const launchesRouter = require("./launches.router");
const planetsRouter = require("./planets.router");
const express = require('express');

const api = express.Router();
api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;
