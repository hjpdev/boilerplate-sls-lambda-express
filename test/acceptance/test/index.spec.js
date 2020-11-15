const fetch = require('node-fetch')
const { expect } = require('chai')

const baseUrl = 'http://172.17.0.1:8088/healthcheck'

describe('Acceptance Tests', () => {
  it('Gets Readings', async () => {
    const result = await fetch(baseUrl, {
      method: 'GET'
    })

    expect(result.status).to.eql(200)
  })
})