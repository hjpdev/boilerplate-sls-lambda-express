import chai, { expect } from 'chai'
import request from 'supertest'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import createMacroRouter from '../../../server/routes/readings/macro'
import { Store } from '../../../server/store'
import { createSingleRouteTestApp, newDate } from '../../helpers'

chai.use(sinonChai)

describe('Macro Reading', () => {
  const sandbox = sinon.createSandbox()
  const testReading = {
    kcal: 500.0,
    carbs: 10.2,
    sugar: 0.0,
    protein: 40.1,
    fat: 30.0
  }

  const createApp = (connection) => {
    const router = createMacroRouter(new Store({ connection }))
    return createSingleRouteTestApp({ path: '/readings/macro', router })
  }

  describe('GET', () => {
    const testGetReading = {
      id: 23,
      created: '2020-06-10T18:28:09.261Z',
      kcal: 544,
      carbs: 2.3,
      sugar: 1.1,
      protein: 40.3,
      fat: 40.1
    }

    describe('/', () => {
      describe('(Happy)', () => {
        const fakeConnection = {
          any: sandbox.stub().resolves([testGetReading]),
          one: sandbox.stub().resolves([testGetReading])
        }
        const app = createApp(fakeConnection)

        it('Returns up to 40 of the most recent readings when no id provided', async () => {
          await request(app)
            .get('/readings/macro')
            .expect(200)
            .then(res => expect(res.body).to.eql([testGetReading]))

          sandbox.assert.calledOnce(fakeConnection.any)
        })

        it('Returns a single reading for specified ID', async () => {
          await request(app)
            .get('/readings/macro/23')
            .expect(200)
            .then(res => expect(res.body).to.eql([testGetReading]))

          sandbox.assert.calledOnce(fakeConnection.one)
        })
      })

      describe('(Unhappy)', () => {
        describe('DB Failure', () => {
          const fakeConnection = {
            any: sandbox.stub().rejects(new Error('DB Failure')),
            one: sandbox.stub().rejects(new Error('DB Failure'))
          }
          const app = createApp(fakeConnection)

          it('Returns an error if reading from DB fails', async () => {
            await request(app)
              .get('/readings/macro')
              .expect(500)
              .expect('DB Failure')

            sandbox.assert.calledOnce(fakeConnection.any)
          })

          it('Returns an error if reading from DB for specified ID fails', async () => {
            await request(app)
              .get('/readings/macro/23')
              .expect(500)
              .expect('DB Failure')

            sandbox.assert.calledOnce(fakeConnection.one)
          })
        })
      })
    })

    describe('/last', () => {
      describe('(Happy)', () => {
        it('Returns the last entered reading', async () => {
          const fakeConnection = { one: sandbox.stub().resolves([testReading]) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/last')
            .expect(200)
            .expect([testReading])

          sandbox.assert.calledOnce(fakeConnection.one)
        })
      })

      describe('(Unappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { one: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/last')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.one)
        })
      })
    })

    describe('/today', () => {
      describe('(Happy)', () => {
        it('Returns the readings entered today', async () => {
          const fakeConnection = { result: sandbox.stub().resolves({ rows: [testReading] }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/today')
            .expect(200)
            .expect([testReading])

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })

      describe('(Unappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { result: sandbox.spy(() => { throw new Error('DB Failure') }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/today')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })

    describe('/stats', () => {
      describe('(Happy)', () => {
        const testStats = { avg: 6.63999996185303, stddev: 1.422322085003 }

        it('Returns stats for all macros if none specified', async () => {
          const fakeConnection = { result: sandbox.stub().resolves({ rows: [testStats] }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/stats/17')
            .send({ days: 17 })
            .expect(200)
            .expect({ kcal: testStats, carbs: testStats, sugar: testStats, protein: testStats, fat: testStats })

          sandbox.assert.callCount(fakeConnection.result, 5)
        })

        it('Returns stats for specified macros', async () => {
          const fakeConnection = { result: sandbox.stub().resolves({ rows: [testStats] }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/stats/17')
            .send({ days: 17, macros: { kcal: true, carbs: true } })
            .expect(200)
            .expect({ kcal: testStats, carbs: testStats })

          sandbox.assert.calledTwice(fakeConnection.result)
        })
      })

      describe('(Unhappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/macro/stats/17')
            .expect(500)
            .expect('DB Failure')

          expect(sandbox.assert.calledOnce(fakeConnection.result))
        })
      })
    })
  })

  describe('POST', () => {
    describe('(Happy)', () => {
      const fakeConnection = { result: sandbox.stub().resolves({ rows: [{ id: 'testId', created: 'testCreated' }] }) }
      const app = createApp(fakeConnection)

      beforeEach(() => {
        fakeConnection.result.resetHistory()
      })

      it('Stores reading provided in request, time created not provided', async () => {
        await request(app)
          .post('/readings/macro')
          .send(testReading)
          .expect(201)
          .expect({ id: 'testId', created: 'testCreated', ...testReading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })

      it('Stores reading provided in request, time created provided', async () => {
        const reading = { created: newDate({}), ...testReading }

        await request(app)
          .post('/readings/macro')
          .send(reading)
          .expect(201)
          .expect({ id: 'testId', ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })

    describe('(Unhappy)', () => {
      const fakeConnection = {result: sandbox.stub().rejects(new Error('DB Failure')) }
      const app = createApp(fakeConnection)

      const zeroReading = {
        kcal: 0.0,
        carbs: 0.0,
        sugar: 0.0,
        protein: 0.0,
        fat: 0.0
      }

      beforeEach(() => {
        fakeConnection.result.resetHistory()
      })

      it('Returns an error if empty object passed', async () => {
        await request(app)
          .post('/readings/macro')
          .send({})
          .expect(400)
          .expect({ error: 'No reading received' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if all values are zero', async () => {
        await request(app)
          .post('/readings/macro')
          .send(zeroReading)
          .expect(400)
          .expect({ error: 'All properties were zero' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if writing to DB fails', async () => {
        await request(app)
          .post('/readings/macro')
          .send(testReading)
          .expect(500)
          .expect('DB Failure')

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })
  })

  describe('PUT', () => {
    describe('(Happy)', () => {
      it('Updates single property for entry with specified ID', async () => {
        const reading = { kcal: 200.4 }
        const fakeConnection = { result: sinon.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        await request(app)
          .put('/readings/macro/23')
          .send(reading)
          .expect(200)
          .expect({ id: 23, ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })

      it('Updates multiple properties for entry with specified ID', async () => {
        const reading = { kcal: 400.0, protein: 20.0, fat: 30.6 }
        const fakeConnection = { result: sinon.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        await request(app)
          .put('/readings/macro/23')
          .send(reading)
          .expect(200)
          .expect({ id: 23, ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })

    describe('(Unhappy)', () => {
      const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
      const app = createApp(fakeConnection)

      it('Returns an error if no/invalid data provided', async () => {
        await request(app)
          .put('/readings/macro/23')
          .expect(400)
          .expect({ error: 'No/invalid reading provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if DB fails', async () => {
        await request(app)
          .put('/readings/macro/23')
          .send({ kcal: 500 })
          .expect(500)
          .expect('DB Failure')

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })
  })

  describe('DELETE', () => {
    describe('(Happy)', () => {
      const fakeConnection = { result: sandbox.stub().resolves({ rowCount: 1 }) }
      const app = createApp(fakeConnection)

      it('Deletes reading with the specified ID', async () => {
        await request(app)
          .delete('/readings/macro/23')
          .expect(200)
          .expect({ id: 23 })

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })

    describe('(Unhappy)', () => {
      describe('DB Failure', () => {
        const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
        const app = createApp(fakeConnection)

        it('Returns an error if no reading for specified ID', async () => {
          await request(app)
            .delete('/readings/macro/23')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })
  })
})
