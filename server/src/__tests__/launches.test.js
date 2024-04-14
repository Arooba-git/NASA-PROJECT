// @ts-nocheck
const { mongoConnect, mongoDisconnect } = require('../services/mongo');
const request = require('supertest');
const app = require('../app');

describe('TEST launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('TEST /GET LAUNCHES', () => {
        test('it should return with status 200', () => {
            request(app)
                .get('/v1/launches')
                .expect(200)
        })
    });

    describe('TEST /POST LAUNCHES', () => {
        const completeRequestData = {
            mission: 'test mission',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2028'
        };

        const completeRequestDataWithoutDate = {
            mission: 'test mission',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        }

        const completeRequestDataWithInvalidDate = {
            mission: 'test mission',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'qqqq'
        }

        test('it should return with status 201', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeRequestData)
                .expect('Content-Type', /json/)
                .expect(201);

            const expectedLaunchDate = new Date().valueOf(completeRequestData.launchDate);
            const responseLaunchDate = new Date().valueOf(response.body.launchDate);

            expect(response.body).toMatchObject(completeRequestDataWithoutDate);
            expect(expectedLaunchDate).toBe(responseLaunchDate);
        })

        test('it should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeRequestDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ "error": "Missing required launch property" });
        });

        test('it should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeRequestDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ "error": "Invalid launch date" });
        });
    });
});
