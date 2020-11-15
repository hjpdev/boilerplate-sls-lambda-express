import sinon from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'

import { Store } from '../../server/store'

chai.use(sinonChai)

describe('Store', () => {
  const sandbox = sinon.createSandbox()
  const fakeConnection = {
    query: sandbox.spy(),
    one: sandbox.spy(),
    any: sandbox.spy(),
    result: sandbox.spy(),
    none: sandbox.spy()
  }
  const store = new Store({ connection: fakeConnection })
  const table = 'bg'

  it('getReadings', async () => {
    await store.getReadings({ table, limit: 40 })

    sandbox.assert.calledOnce(fakeConnection.any)
    expect(fakeConnection.any).calledWith('SELECT * FROM bg ORDER BY created DESC LIMIT 40')
  })

  it('getLastReading', async () => {
    await store.getLastReading({ table: 'bg' })

    sandbox.assert.calledOnce(fakeConnection.one)
    expect(fakeConnection.one).calledWith('SELECT * FROM bg ORDER BY created DESC LIMIT 1')
  })

  it('getTodaysReadings', async () => {
    const hours = new Date().getHours()
    fakeConnection.result = sandbox.spy(() => { return { rows: [] } })

    await store.getTodaysReadings({ table: 'bg' })

    sandbox.assert.calledOnce(fakeConnection.result)
  })

  it('writeReading', async () => {
    const reading = { data: 5.2 }
    fakeConnection.result = sandbox.spy(() => { return { rows: [{ id: 27, created: 'timeCreated', data: 5.2 }] } })

    await store.writeReading({ table, reading })

    sandbox.assert.calledOnce(fakeConnection.result)
    expect(fakeConnection.result.getCall(0).firstArg).to.eql('INSERT INTO bg(data) VALUES($(data)) RETURNING id, created')
    expect(fakeConnection.result.getCall(0).lastArg).to.eql(reading)
  })

  it('updateReading', async () => {
    const reading = { data: 7.2 }
    fakeConnection.result = sandbox.spy(() => { return { rowCount: 1 } })

    await store.updateReading({ table: 'bg', id: 2, reading })

    sandbox.assert.calledOnce(fakeConnection.result)
    expect(fakeConnection.result.getCall(0).firstArg).to.eql('UPDATE bg SET data = $1 WHERE id = $2')
    expect(fakeConnection.result.getCall(0).lastArg).to.eql([7.2, 2])
  })

  it('increment', async () => {
    fakeConnection.result = sandbox.spy(() => { return { rowCount: 1 } })

    await store.increment({ table, id: 2, column: 'reading' })

    sandbox.assert.calledOnce(fakeConnection.result)
    expect(fakeConnection.result).calledWith('UPDATE bg SET reading = reading + 1 WHERE id = 2')
  })

  it('deleteReading', async () => {
    fakeConnection.result = sandbox.spy(() => { return { rowCount: 1 } })

    await store.deleteReading({ table, id: 2 })

    sandbox.assert.calledOnce(fakeConnection.result)
    expect(fakeConnection.result.getCall(0).firstArg).to.eql('DELETE FROM bg WHERE id = $1')
    expect(fakeConnection.result.getCall(0).lastArg).to.eql(2)
  })

  describe('getStats', () => {
    const sandbox = sinon.createSandbox()
  
    it('BG/Keto', async () => {
      fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
      await store.getStats({ table: 'bg', days: 30 })
  
      sandbox.assert.calledOnce(fakeConnection.result)
      expect(fakeConnection.result).calledWith('SELECT AVG(data), STDDEV(data) FROM bg WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
    })
  
    describe('Dose', () => {
      afterEach(() => {
        sandbox.restore()
        sandbox.reset()
      })
  
      it('Short', async () => {
        fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
        await store.getStats({ table: 'dose', days: 30, long: false })
  
        sandbox.assert.calledOnce(fakeConnection.result)
        expect(fakeConnection.result).calledWith('SELECT AVG(data), STDDEV(data) FROM dose WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW() AND long = false')
      })
  
      it('Long', async () => {
        fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
        await store.getStats({ table: 'dose', days: 30, long: true })
  
        sandbox.assert.calledOnce(fakeConnection.result)
        expect(fakeConnection.result).calledWith('SELECT AVG(data), STDDEV(data) FROM dose WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW() AND long = true')
      })
  
      it('Both', async () => {
        fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
        await store.getStats({ table: 'dose', days: 30 })
  
        sandbox.assert.calledTwice(fakeConnection.result)
        expect(fakeConnection.result.getCall(0).firstArg).to.eql('SELECT AVG(data), STDDEV(data) FROM dose WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW() AND long = true')
        expect(fakeConnection.result.getCall(1).firstArg).to.eql('SELECT AVG(data), STDDEV(data) FROM dose WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW() AND long = false')
      })
    })
  
    describe('Macro', () => {
      it('Specific macros', async () => {
        fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
        await store.getStats({ table: 'macro', days: 30, macros: { kcal: true, fat: true } })
  
        sandbox.assert.calledTwice(fakeConnection.result)
        expect(fakeConnection.result.getCall(0).firstArg).to.eql('SELECT AVG(kcal), STDDEV(kcal) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
        expect(fakeConnection.result.getCall(1).firstArg).to.eql('SELECT AVG(fat), STDDEV(fat) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
      })
  
      it('All macros', async () => {
        fakeConnection.result = sandbox.spy(() => { return { rows: [] } })
  
        await store.getStats({ table: 'macro', days: 30 })
  
        sandbox.assert.callCount(fakeConnection.result, 5)
        expect(fakeConnection.result.getCall(0).firstArg).to.eql('SELECT AVG(kcal), STDDEV(kcal) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
        expect(fakeConnection.result.getCall(1).firstArg).to.eql('SELECT AVG(carbs), STDDEV(carbs) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
        expect(fakeConnection.result.getCall(2).firstArg).to.eql('SELECT AVG(sugar), STDDEV(sugar) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
        expect(fakeConnection.result.getCall(3).firstArg).to.eql('SELECT AVG(protein), STDDEV(protein) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
        expect(fakeConnection.result.getCall(4).firstArg).to.eql('SELECT AVG(fat), STDDEV(fat) FROM macro WHERE created BETWEEN NOW() - INTERVAL \'30 DAYS\' AND NOW()')
      })
    })
  })  
})
