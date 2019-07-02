import request from 'supertest';

import app from '../app';

describe('test the api', () => {
  test('GET /', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
