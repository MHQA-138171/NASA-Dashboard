const http = require('http');

require('dotenv').config();

const { mongoConnect } = require('./services/mongo');
const { loadPlanets } = require('./Models/planets.model');
const { loadLaunchData } = require('./Models/launches.models');
const App = require('./app');

const PORT = process.env.PORT || 8000;

const server = http.createServer(App);

async function startServer() {
    await mongoConnect();
    await loadPlanets();
    await loadLaunchData();
    server.listen(PORT, () => {
        console.log(`listening on ${PORT}...`)
    })
}

startServer();