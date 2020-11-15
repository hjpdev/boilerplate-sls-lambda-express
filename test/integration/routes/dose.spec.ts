import chai, { expect } from 'chai'
import request from 'supertest'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import createDoseRouter from '../../../server/routes/readings/dose'
import { Store } from '../../../server/store'
import { createSingleRouteTestApp, newDate } from '../../helpers'

chai.use(sinonChai)

describe('Dose Reading', () => {
  const sandbox = sinon.createSandbox()
  const testReading = { id: 23, created: '2020-06-10T18:28:09.261Z', data: 4.5, long: false }

  const createApp = (connection) => {
    const router = createDoseRouter(new Store({ connection }))
    return createSingleRouteTestApp({ path: '/readings/dose', router })
  }

  describe('GET', () => {
    describe('/', () => {
      describe('(Happy)', () => {
        const fakeConnection = {
          any: sandbox.stub().resolves([testReading]),
          one: sandbox.stub().resolves([testReading])
        }
        const app = createApp(fakeConnection)

        it('Returns up to 40 of the most recent readings when no id provided', async () => {
          await request(app)
            .get('/readings/dose')
            .expect(200)
            .then(res => expect(res.body).to.eql([testReading]))

          sandbox.assert.calledOnce(fakeConnection.any)
        })

        it('Returns a single reading for specified ID', async () => {
          await request(app)
            .get('/readings/dose/23')
            .expect(200)
            .then(res => expect(res.body).to.eql([testReading]))

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
              .get('/readings/dose')
              .expect(500)
              .expect('DB Failure')

            sandbox.assert.calledOnce(fakeConnection.any)
          })

          it('Returns an error if reading from DB for specified ID fails', async () => {
            await request(app)
              .get('/readings/dose/23')
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
            .get('/readings/dose/last')
            .expect(200)
            .expect([{ id: 23, created: '2020-06-10T18:28:09.261Z', data: 4.5, long: false }])

          sandbox.assert.calledOnce(fakeConnection.one)
        })
      })

      describe('(Unappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { one: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/dose/last')
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
            .get('/readings/dose/today')
            .expect(200)
            .expect([{ id: 23, created: '2020-06-10T18:28:09.261Z', data: 4.5, long: false }])

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })

      describe('(Unappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/dose/today')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })

    describe('/stats', () => {
      describe('(Happy)', () => {
        const testStats = { avg: 6.63999996185303, stddev: 1.422322085003 }

        it('Returns stats for type specified by long', async () => {
          const fakeConnection = { result: sandbox.stub().resolves({ rows: [testStats] }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/dose/stats/17/short')
            .expect(200)
            .expect(testStats)

          sandbox.assert.calledOnce(fakeConnection.result)
        })

        it('Returns stats for given number of days separated according to type if long not specified', async () => {
          const fakeConnection = { result: sandbox.stub().resolves({ rows: [testStats] }) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/dose/stats/17')
            .expect(200)
            .expect({ long: testStats, short: testStats })

          sandbox.assert.calledTwice(fakeConnection.result)
        })
      })

      describe('(Unhappy)', () => {
        it('Returns an error if reading from DB fails', async () => {
          const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
          const app = createApp(fakeConnection)

          await request(app)
            .get('/readings/dose/stats/17')
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
        const reading = { data: 7.2, long: false }

        await request(app)
          .post('/readings/dose')
          .send(reading)
          .expect(201)
          .expect({ id: 'testId', created: 'testCreated', ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })

      it('Stores reading provided in request, time created provided', async () => {
        const reading = { created: newDate({}), data: 7.2, long: false }

        await request(app)
          .post('/readings/dose')
          .send(reading)
          .expect(201)
          .expect({ id: 'testId', ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })

    describe('(Unhappy)', () => {
      const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
      const app = createApp(fakeConnection)

      beforeEach(() => {
        fakeConnection.result.resetHistory()
      })

      it('Returns an error if zero value provided for reading', async () => {
        await request(app)
          .post('/readings/dose')
          .send({ data: 0.0, long: false })
          .expect(400)
          .expect({ error: 'Zero/no reading provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if no value provided for reading', async () => {
        await request(app)
          .post('/readings/dose')
          .send({ long: false })
          .expect(400)
          .expect({ error: 'Zero/no reading provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if no value provided for long', async () => {
        await request(app)
          .post('/readings/dose')
          .send({ data: 4.5 })
          .expect(400)
          .expect({ error: 'long not specified' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if writing to DB fails', async () => {
        await request(app)
          .post('/readings/dose')
          .send({ data: 7.2, long: false })
          .expect(500)
          .expect('DB Failure')

        sandbox.assert.calledOnce(fakeConnection.result)
      })
    })
  })

  describe('PUT', () => {
    const createdAt = newDate({})

    describe('(Happy)', () => {
      it('Updates reading for entry with specified ID', async () => {
        const reading = { data: 7.2 }
        const fakeConnection = { result: sinon.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        await request(app)
          .put('/readings/dose/23')
          .send(reading)
          .expect(200)
          .expect({ id: 23, ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })

      it('Updates time created for entry with specified ID', async () => {
        const reading = { created: createdAt }
        const fakeConnection = { result: sinon.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        await request(app)
          .put('/readings/dose/23')
          .send(reading)
          .expect(200)
          .expect({ id: 23, ...reading })

        sandbox.assert.calledOnce(fakeConnection.result)
      })

      it('Updates reading & time created for entry with specified ID', async () => {
        const reading = { created: createdAt, data: 7.2 }
        const fakeConnection = { result: sinon.stub().resolves({ rowCount: 1 }) }
        const app = createApp(fakeConnection)

        await request(app)
          .put('/readings/dose/23')
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
          .put('/readings/dose/23')
          .expect(400)
          .expect({ error: 'No/invalid data provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if any zero value provided for reading', async () => {
        await request(app)
          .put('/readings/dose/23')
          .send({ data: 0.0 })
          .expect(400)
          .expect({ error: 'No/invalid data provided' })

        sandbox.assert.notCalled(fakeConnection.result)
      })

      it('Returns an error if DB fails', async () => {
        await request(app)
          .put('/readings/dose/23')
          .send({ data: 3.0 })
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
          .delete('/readings/dose/23')
          .expect(200)
          .expect({ id: 23 })

        sandbox.assert.calledOnce(fakeConnection.result)
        expect(fakeConnection.result.getCall(0).firstArg).to.eql('DELETE FROM dose WHERE id = $1')
        expect(fakeConnection.result.getCall(0).lastArg).to.eql(23)
      })
    })

    describe('(Unhappy)', () => {
      describe('DB Failure', () => {
        const fakeConnection = { result: sandbox.stub().rejects(new Error('DB Failure')) }
        const app = createApp(fakeConnection)

        it('Returns an error if no reading for specified ID', async () => {
          await request(app)
            .delete('/readings/dose/23')
            .expect(500)
            .expect('DB Failure')

          sandbox.assert.calledOnce(fakeConnection.result)
        })
      })
    })
  })
})
