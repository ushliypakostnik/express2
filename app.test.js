import request from 'supertest';

import app from './app';

describe('test the api', () => {
  test('GET /api', (done) => {
    request(app).get('/api').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
