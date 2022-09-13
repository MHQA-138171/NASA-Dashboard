const request = require('supertest');

const {
    mongoConnect,
    mongoDisconnect,
} = require('../../services/mongo');

const app = require('../../app');

describe('testing Launches API', () => {
    beforeAll(async () => {
        await mongoConnect()
    });
    afterAll(async () => {
        await mongoDisconnect()
            .then(console.log('we exit mongoDB'))
    })

    describe('Test GET/launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })
    })

    describe('Test POST/launch', () => {
        const completeLaunchData = {
            mission: 'MHQA X',
            target: 'kepler 442 b',
            rocket: 'NCC 1701-D',
            launchDate: 'January 4, 2028',
        };
        const LaunchDataWithoutDate = {
            mission: 'MHQA X',
            target: 'kepler 442 b',
            rocket: 'NCC 1701-D',
        }
        const LaunchDataWithInvalidDate = {
            mission: 'MHQA X',
            target: 'kepler 442 b',
            rocket: 'NCC 1701-D',
            launchDate: 'lol',
        }

        test('It should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect(201)
                .expect('Content-Type', /json/)

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(LaunchDataWithoutDate)
        })

        test('it should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(LaunchDataWithoutDate)
                .expect(400)
                .expect('Content-Type', /json/)

            expect(response.body).toStrictEqual({
                error: 'missing required properties'
            });

        })

        test('it should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(LaunchDataWithInvalidDate)
                .expect(400)
                .expect('Content-Type', /json/)

            expect(response.body).toStrictEqual({
                error: 'invalid launch date'
            });
        })
    })
})