'use strict';

import svcGpio from './gpioService.js';
import express from 'express';

const port = process.env.PORT || 8081;

//var express = require("express");
var app = express();

app.listen(port, () => {
    console.log("Server running on port " + port);
});

//Get the LED state
app.get("/api/iotBulb/ledState", (req, res) => {
    console.log("Get Request");

    res.json(svcGpio.getLedState());
});

//Set the LED state
app.post("/api/iotBulb/ledState", async (req, res) => {
    let isOnBool = (req.query.isOn === 'true');

    await svcGpio.setLedState(isOnBool);

    res.send('Got a POST request');

    console.dir(req.query);
});

//export default {iotBulbApi}
