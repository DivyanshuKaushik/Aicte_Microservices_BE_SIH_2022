'use strict';
const express = require('express');
const { Response } = require('./helpers');

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// run email consumers 
require('./email');

app.listen(process.env.PORT);

console.log(`Alerts Server Up!!`);