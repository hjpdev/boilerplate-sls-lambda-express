import { IRouter, Router } from 'express'
import { sayHello } from '../middleware/sayHello'

const createRouter = (): IRouter => {
  const router: IRouter = Router()

  router.use('/', sayHello)

  return router
}

export default createRouter
