import { NextFunction, Request, Response } from 'express'

export default (req: Request, res: Response, next: NextFunction): void => {
  console.log('HIT:', req.url, req.method, req.body)
  next()
}
