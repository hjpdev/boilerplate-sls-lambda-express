import { IRouter, Request, Response, NextFunction, Router } from 'express'

const sayHello = (req: Request, res: Response, next: NextFunction): Response<string> => {
  const time = new Date().toLocaleTimeString()
  return res.status(200).send(`Hi, it's ${time}.`)
}

const createRouter = (): IRouter => {
  const router: IRouter = Router()

  router.use('/', sayHello)

  return router
}

export default createRouter
