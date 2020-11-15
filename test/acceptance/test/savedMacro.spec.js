const fetch = require('node-fetch')
const { expect } = require('chai')

const baseUrl = 'http://172.17.0.1:8088/readings/macro/saved'

describe('Saved Macro', () => {
  const testSavedMacroReading1 = {
    name: 'Test Saved Macro Reading 1',
    kcal: 100,
    carbs: 10.0,
    sugar: 10.0,
    protein: 10.0,
    fat: 10.0,
    amount: 100,
    unit: 'g'
  }

  const testSavedMacroReading2 = {
    name: 'Test Saved Macro Reading 2',
    kcal: 200,
    carbs: 20.0,
    sugar: 20.0,
    protein: 20.0,
    fat: 20.0,
    amount: 100,
    unit: 'g'
  }

  const testSavedMacroReading3 = {
    name: 'Test Saved Macro Reading 3',
    kcal: 300,
    carbs: 30.0,
    sugar: 30.0,
    protein: 30.0,
    fat: 30.0,
    amount: 100,
    unit: 'g'
  }

  describe('POST', () => {
    it('Uploads Readings', async () => {
      const firstPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testSavedMacroReading1),
        headers: { 'Content-Type': 'application/json' }
      })

      const secondPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify(testSavedMacroReading2),
        headers: { 'Content-Type': 'application/json' }
      })

      const thirdPost = await fetch(baseUrl, {
        method: 'POST',
        body: JSON.stringify({ created: '2018-04-18 14:14:46.000000', ...testSavedMacroReading3 }),
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

      expect(result[0].name).to.eql('test_saved_macro_reading_2')
      expect(result[0].kcal).to.eql(testSavedMacroReading2.kcal)
      expect(result[0].carbs).to.eql(testSavedMacroReading2.carbs)
      expect(result[0].sugar).to.eql(testSavedMacroReading2.sugar)
      expect(result[0].protein).to.eql(testSavedMacroReading2.protein)
      expect(result[0].fat).to.eql(testSavedMacroReading2.fat)
      expect(result[1].name).to.eql('test_saved_macro_reading_1')
      expect(result[1].kcal).to.eql(testSavedMacroReading1.kcal)
      expect(result[1].carbs).to.eql(testSavedMacroReading1.carbs)
      expect(result[1].sugar).to.eql(testSavedMacroReading1.sugar)
      expect(result[1].protein).to.eql(testSavedMacroReading1.protein)
      expect(result[1].fat).to.eql(testSavedMacroReading1.fat)
    })

    it('By ID', async () => {
      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      expect(result.name).to.eql('test_saved_macro_reading_1')
      expect(result.kcal).to.eql(testSavedMacroReading1.kcal)
      expect(result.carbs).to.eql(testSavedMacroReading1.carbs)
      expect(result.sugar).to.eql(testSavedMacroReading1.sugar)
      expect(result.protein).to.eql(testSavedMacroReading1.protein)
      expect(result.fat).to.eql(testSavedMacroReading1.fat)
      expect(result.amount).to.eql(testSavedMacroReading1.amount)
      expect(result.unit).to.eql(testSavedMacroReading1.unit)
    })
  })

  describe('PUT', () => {
    it('Updates Reading', async () => {
      await fetch(`${baseUrl}/1`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'new_name', kcal: 400.0, carbs: 4.0, fat: 40.0, unit: 'ml' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await fetch(`${baseUrl}/1`, {
        method: 'GET'
      }).then(res => res.json())

      expect(result.name).to.eql('new_name')
      expect(result.kcal).to.eql(400.0)
      expect(result.carbs).to.eql(4.0)
      expect(result.sugar).to.eql(testSavedMacroReading1.sugar)
      expect(result.protein).to.eql(testSavedMacroReading1.protein)
      expect(result.fat).to.eql(40.0)
      expect(result.amount).to.eql(testSavedMacroReading1.amount)
      expect(result.unit).to.eql('ml')
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
