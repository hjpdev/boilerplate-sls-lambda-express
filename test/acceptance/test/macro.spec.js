const fetch = require('node-fetch')
const { expect } = require('chai')

const baseUrl = 'http://172.17.0.1:8088/readings/macro'

describe('Macro', () => {
  const testMacroReading1 = {
    kcal: 100,
    carbs: 10.0,
    sugar: 10.0,
    protein: 10.0,
    fat: 10.0
  }

  const testMacroReading2 = {
    kcal: 200,
    carbs: 20.0,
    sugar: 20.0,
    protein: 20.0,
    fat: 20.0
  }

  const testMacroReading3 = {
    kcal: 300,
    carbs: 30.0,
    sugar: 30.0,
    protein: 30.0,
    fat: 30.0
  }

  describe('POST', () => {
    it('Uploads Readings', async () => {
      const firstPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testMacroReading1),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testMacroReading2),
        headers: { 'Content-Type': 'application/json' }
      })

      const thirdPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify({ created: '2018-04-18 14:14:46.000000', ...testMacroReading3 }),
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

      expect(result[0].kcal).to.eql(testMacroReading2.kcal)
      expect(result[0].carbs).to.eql(testMacroReading2.carbs)
      expect(result[0].sugar).to.eql(testMacroReading2.sugar)
      expect(result[0].protein).to.eql(testMacroReading2.protein)
      expect(result[0].fat).to.eql(testMacroReading2.fat)
      expect(result[1].kcal).to.eql(testMacroReading1.kcal)
      expect(result[1].carbs).to.eql(testMacroReading1.carbs)
      expect(result[1].sugar).to.eql(testMacroReading1.sugar)
      expect(result[1].protein).to.eql(testMacroReading1.protein)
      expect(result[1].fat).to.eql(testMacroReading1.fat)
    })

    it('By ID', async () => {
      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.kcal).to.eql(testMacroReading1.kcal)
      expect(result.carbs).to.eql(testMacroReading1.carbs)
      expect(result.sugar).to.eql(testMacroReading1.sugar)
      expect(result.protein).to.eql(testMacroReading1.protein)
      expect(result.fat).to.eql(testMacroReading1.fat)
    })

    it('Last reading', async () => {
      const result = await fetch(`${baseUrl}/last`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.kcal).to.eql(testMacroReading2.kcal)
      expect(result.carbs).to.eql(testMacroReading2.carbs)
      expect(result.sugar).to.eql(testMacroReading2.sugar)
      expect(result.protein).to.eql(testMacroReading2.protein)
      expect(result.fat).to.eql(testMacroReading2.fat)
    })

    xit('Todays readings', async () => {
      const results = await fetch(`${baseUrl}/today`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(results.length).to.eql(2)
      expect(results[0].kcal).to.eql(testMacroReading2.kcal)
      expect(results[0].carbs).to.eql(testMacroReading2.carbs)
      expect(results[0].sugar).to.eql(testMacroReading2.sugar)
      expect(results[0].protein).to.eql(testMacroReading2.protein)
      expect(results[0].fat).to.eql(testMacroReading2.fat)
      expect(results[1].kcal).to.eql(testMacroReading1.kcal)
      expect(results[1].carbs).to.eql(testMacroReading1.carbs)
      expect(results[1].sugar).to.eql(testMacroReading1.sugar)
      expect(results[1].protein).to.eql(testMacroReading1.protein)
      expect(results[1].fat).to.eql(testMacroReading1.fat)
    })

    it('Stats', async () => {
      const macroKeys = ['kcal', 'carbs', 'sugar', 'protein', 'fat']
      const results = await fetch(`${baseUrl}/stats/30`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(Object.keys(results)).to.eql(macroKeys)
      macroKeys.forEach(key => {
        expect(typeof results[key].avg).to.eql('number')
        expect(typeof results[key].stddev).to.eql('number')
      })
    })
  })

  describe('PUT', () => {
    it('Updates Reading', async () => {
      await fetch(`${baseUrl}/1`, {
        method: 'PUT',
        body: JSON.stringify({ kcal: 400.0, carbs: 4.0, fat: 40.0 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET'
      }).then(res => res.json())

      expect(result.kcal).to.eql(400.0)
      expect(result.carbs).to.eql(4.0)
      expect(result.sugar).to.eql(testMacroReading1.sugar)
      expect(result.protein).to.eql(testMacroReading1.protein)
      expect(result.fat).to.eql(40.0)
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
