import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import request from 'supertest'

import createSavedMacroRouter from '../../../server/routes/readings/savedMacro'
import { Store } from '../../../server/store'
import { createSingleRouteTestApp, newDate } from '../../helpers'

chai.use(sinonChai)

describe('Saved Macro Reading', () => {
  const sandbox = sinon.createSandbox()

  const testReading = {
    name: 'test_saved_macro',
    kcal: 500.0,
    carbs: 10.2,
    sugar: 0.0,
    protein: 40.1,
    fat: 30.0,
    amount: 100,
    unit: 'g'
  }

  const createApp = (connection) => {
    const router = createSavedMacroRouter(new Store({ connection }))
    return createSingleRouteTestApp({ path: '/readings/macro/saved', router })
  }

  describe('GET', () => {
    const testGetReading = {
      id: 23,
      created: '2020-06-10T18:28:09.261Z',
      name: 'test_saved_macro',
      kcal: 544,
      carbs: 2.3,
      sugar: 1.1,
      protein: 40.3,
      fat: 40.1,
      amount: 100,
      unit: 'g'
    }

    describe('(Happy)', () => {
      const fakeConnection = {
        any: sandbox.stub().resolves([testGetReading]),
        one: sandbox.stub().resolves([testGetReading])
      }
      const app = createApp(fakeConnection)

      it('Returns up to 40 of the most recent readings when no id provided', async () => {
        await request(app)
          .get('/readings/macro/saved')
          .expect(200)
          .then(res => expect(res.body).to.eql([testGetReading]))

        sandbox.assert.calledOnce(fakeConnection.any)
      })

      it('Returns a single reading for specified ID', async () => {
        await request(app)
          .get('/readings/macro/saved/23')
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
            .get('/readings/macro/saved')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.any)
        })

        it('Returns an error if reading from DB for specified ID fails', async () => {
          await request(app)
            .get('/readings/macro/saved/23')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.one)
        })
      })
    })
  })

  describe('POST', () => {
    describe('/', () => {
      describe('(Happy)', () => {
        const fakeConnection = { result: sandbox.stub().resolves({ rows: [{ id: 'testId', created: 'testCreated' }] }) }
        const app = createApp(fakeConnection)

        beforeEach(() => {
          fakeConnection.result.resetHistory()
        })

        it('Stores reading provided in request, time created not provided', async () => {
          await request(app)
            .post('/readings/macro/saved')
            .send(testReading)
            .expect(201)
            .expect({ id: 'testId', created: 'testCreated', ...testReading })

          sandbox.assert.calledOnce(fakeConnection.result)
        })

        it('Stores reading provided in request, time created provided', async () => {
          const reading = { created: newDate({}), ...testReading }

          await request(app)
            .post('/readings/macro/saved')
            .send(reading)
            .expect(201)
            .expect({ id: 'testId', ...reading })

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })

      describe('(Unhappy)', () => {
        const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
        const app = createApp(fakeConnection)

        const zeroReading = {
          name: 'zero_reading',
          kcal: 0.0,
          carbs: 0.0,
          sugar: 0.0,
          protein: 0.0,
          fat: 0.0,
          amount: 100,
          unit: 'g'
        }

        beforeEach(() => {
          fakeConnection.result.resetHistory()
        })

        it('Returns an error if empty object passed', async () => {
          await request(app)
            .post('/readings/macro/saved')
            .send({})
            .expect(400)
            .expect({ error: 'No reading received' })

          sandbox.assert.notCalled(fakeConnection.result)
        })

        it('Returns an error if all macros are zero', async () => {
          await request(app)
            .post('/readings/macro/saved')
            .send(zeroReading)
            .expect(400)
            .expect({ error: 'All macros were zero' })

          sandbox.assert.notCalled(fakeConnection.result)
        })

        describe('Returns an error', () => {
          it('if name is undefined', async () => {
            const app = createApp(fakeConnection)

            await request(app)
              .post('/readings/macro/saved')
              .send({ ...testReading, name: '' })
              .expect(400)
              .expect({ error: 'Name, amount or unit not provided' })

            sandbox.assert.notCalled(fakeConnection.result)
          })

          it('if amount is zero', async () => {
            const app = createApp(fakeConnection)

            await request(app)
              .post('/readings/macro/saved')
              .send({ ...testReading, amount: 0 })
              .expect(400)
              .expect({ error: 'Name, amount or unit not provided' })

            sandbox.assert.notCalled(fakeConnection.result)
          })

          it('if unit is undefined', async () => {
            const app = createApp(fakeConnection)

            await request(app)
              .post('/readings/macro/saved')
              .send({ ...testReading, unit: '' })
              .expect(400)
              .expect({ error: 'Name, amount or unit not provided' })

            sandbox.assert.notCalled(fakeConnection.result)
          })
        })

        it('Returns an error if writing to DB fails', async () => {
          await request(app)
            .post('/readings/macro/saved')
            .send(testReading)
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })

    describe('/increment', () => {
      describe('(Happy)', () => {
        const fakeConnection = { result: sandbox.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        it('Increments the times_added for specified saved_macro', async () => {
          await request(app)
            .post('/readings/macro/saved/increment/27')
            .expect(200)
            .expect({ success: 'Incremented times_added for saved_macro with ID: 27' })

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })

      describe('(Unhappy)', () => {
        it('Returns an error if DB fails', async () => {
          const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .post('/readings/macro/saved/increment/27')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
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
          .put('/readings/macro/saved/23')
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
          .put('/readings/macro/saved/23')
          .send(reading)
          .expect(200)
          .expect({ id: 23, ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })

    describe('(Unhappy)', () => {
      const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
      const app = createApp(fakeConnection)

      it('Returns an error if no/invalid reading provided', async () => {
        await request(app)
          .put('/readings/macro/saved/23')
          .expect(400)
          .expect({ error: 'No/invalid reading provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if DB fails', async () => {
        await request(app)
          .put('/readings/macro/saved/23')
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
          .delete('/readings/macro/saved/23')
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
            .delete('/readings/macro/saved/23')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })
  })
})
