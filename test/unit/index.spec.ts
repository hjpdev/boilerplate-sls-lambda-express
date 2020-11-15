import { Request } from 'express'
import sinon from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'

import { sayHello } from '../../src/middleware/sayHello'

chai.use(sinonChai)

describe('Unit tests', () => {
  const sandbox = sinon.createSandbox()

  it('sayHello should return 200', () => {
    const fakeRes = {
      status: () => {
        return { send: sandbox.spy() }
      }
    }
    sandbox.spy(fakeRes, 'status')

    sayHello({}, fakeRes, () => {})

    expect(fakeRes.status).calledWith(200)
  })
})
