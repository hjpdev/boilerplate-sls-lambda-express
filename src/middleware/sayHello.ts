import { Request, Response, NextFunction } from 'express'

export const sayHello = (req: Request | any, res: Response | any, next: NextFunction): Response<string> => {
  const time = new Date().toLocaleTimeString()
  return res.status(200).send(`Hi, it's ${time}.`)
}
