const fetch = require('node-fetch')
const { expect } = require('chai')

const baseUrl = 'http://172.17.0.1:8088/readings/bg'

describe('Bg', () => {
  describe('POST', () => {
    it('Uploads Readings', async () => {
      const firstPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify({ data: 7.2 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify({ data: 5.2 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const thirdPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify({ created: '2018-04-18 14:14:46.000000', data: 6.2 }),
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

      expect(result[0].data).to.eql(5.2)
      expect(result[1].data).to.eql(7.2)
    })

    it('By ID', async () => {
      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.data).to.eql(7.2)
    })

    it('Last reading', async () => {
      const result = await fetch(`${baseUrl}/last`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.data).to.eql(5.2)
    })

    xit('Todays readings', async () => {
      const results = await fetch(`${baseUrl}/today`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(results.length).to.eql(2)
      expect(results[0].data).to.eql(5.2)
      expect(results[1].data).to.eql(7.2)
    })

    it('Stats', async () => {
      const results = await fetch(`${baseUrl}/stats/30`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(typeof results.avg).to.eql('number')
      expect(typeof results.stddev).to.eql('number')
    })
  })

  describe('PUT', () => {
    it('Updates Reading', async () => {
      await fetch(`${baseUrl}/1`, {
        method: 'PUT',
        body: JSON.stringify({ data: 4.0 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET'
      }).then(res => res.json())

      expect(result.data).to.eql(4.0)
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
