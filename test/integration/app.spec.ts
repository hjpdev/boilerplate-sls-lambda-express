import request from 'supertest'
import { expect } from 'chai'

import { createServer } from '../../src/app'

describe('App', () => {
  const app = createServer()

  describe('/healthcheck', () => {
    it('Returns "Healthy" when app is up and running', () => {
      request(app)
        .get('/healthcheck')
        .expect(200)
        .then(res => expect(res.text).to.equal('Healthy'))
    })
  })
})
