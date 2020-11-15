import { NextFunction, Request, Response } from 'express'

interface ResponseError {
  status: number
  message?: string
}

export default (err: ResponseError, req: Request, res: Response, next: NextFunction): (Response<string> | void) => {
  if (err) {
    const message: string = err.message || 'error'
    const statusCode: number | string = err.status || 500
    console.log(`${statusCode} Error: ${err.message}`)

    return res.status(statusCode).send(message)
  }

  next()
}
