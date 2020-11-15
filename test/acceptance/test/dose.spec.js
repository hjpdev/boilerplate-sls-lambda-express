const fetch = require('node-fetch')
const { expect } = require('chai')

const baseUrl = 'http://172.17.0.1:8088/readings/dose'

describe('Dose', () => {
  const testDoseReading1 = { data: 2.5, long: false }
  const testDoseReading2 = { data: 13.0, long: true }
  const testDoseReading3 = { created: '2018-04-18 14:14:46.000000', data: 3.5, long: false }

  describe('POST', () => {
    it('Uploads Readings', async () => {
      const firstPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testDoseReading1),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testDoseReading2),
        headers: { 'Content-Type': 'application/json' }
      })

      const thirdPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testDoseReading3),
        headers: { 'Content-Type': 'application/json' }
      })

      expect(firstPost.status).to.eql(201)
      expect(firstPost.statusText).to.eql('Created')
      expect(secondPost.status).to.eql(201)
      expect(secondPost.statusText).to.eql('Created')
      expect(thirdPost.status).to.eql(201)
      expect(thirdPost.statusText).to.eql('Created')
    })
  })

  describe('GET', () => {
    it('All Readings', async () => {
      const result = await fetch(baseUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result[0].data).to.eql(testDoseReading2.data)
      expect(result[0].long).to.eql(testDoseReading2.long)
      expect(result[1].data).to.eql(testDoseReading1.data)
      expect(result[1].long).to.eql(testDoseReading1.long)
    })

    it('By ID', async () => {
      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.data).to.eql(testDoseReading1.data)
      expect(result.long).to.eql(testDoseReading1.long)
    })

    it('Last reading', async () => {
      const result = await fetch(`${baseUrl}/last`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.data).to.eql(testDoseReading2.data)
      expect(result.long).to.eql(testDoseReading2.long)
    })

    xit('Todays readings', async () => {
      const results = await fetch(`${baseUrl}/today`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(results.length).to.eql(2)
      expect(results[0].data).to.eql(testDoseReading2.data)
      expect(results[0].long).to.eql(testDoseReading2.long)
      expect(results[1].data).to.eql(testDoseReading1.data)
      expect(results[1].long).to.eql(testDoseReading1.long)
    })

    it('Stats', async () => {
      const results = await fetch(`${baseUrl}/stats/30/short`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(Object.keys(results)).to.eql(['avg', 'stddev'])
    })
  })

  describe('PUT', () => {
    it('Updates Reading', async () => {
      await fetch(`${baseUrl}/1`, {
        method: 'PUT',
        body: JSON.stringify({ data: 9.0 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET'
      }).then(res => res.json())

      expect(result.data).to.eql(9.0)
    })
  })

  describe('DELETE', () => {
    it('Removes Reading', async () => {
      await fetch(`${baseUrl}/1`, {
        method: 'DELETE'
      })

      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET'
      })
        .then(res => res)

      expect(result.status).to.eql(500)
    })
  })
})
