import { expect as _expect, use, request } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server.js';
import db from '../../src/models/index.js';
const expect = _expect;

use(chaiHttp);

describe('Integration: Health Check', () => {
  it('should respond to GET /', (done) => {
    request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(404); // No root route defined, should 404
        done();
      });
  });
});