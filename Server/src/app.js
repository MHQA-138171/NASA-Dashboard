const path = require('path');

const cors = require('cors');
const morgan = require('morgan');
const express = require('express');

const api = require('./Routers/api');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Public')));
app.use('/v1', api);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Public', 'index.html'))
})

module.exports = app;