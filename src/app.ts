import serverless from 'serverless-http'
import express from 'express'
import { APIGatewayProxyResult, APIGatewayProxyStructuredResultV2, Context, Handler } from 'aws-lambda'
import { Application, Request, Response } from 'express'

import createRouter from './routes'
import errorHandler from './middleware/errorHandler'

export const createServer = () => {
  const app: Application = express()
  const router = createRouter()

  app.use(express.json())

  app.get('/healthcheck', (req: Request, res: Response): (Response<string> | void) => {
    res.status(200).send('Healthy\n')
  })

  app.use(router)
  app.use(errorHandler)

  return app
}

const app = createServer()

export const handler: Handler = async (event: any, context: Context): Promise<APIGatewayProxyResult | APIGatewayProxyStructuredResultV2> => {
  const handler = serverless(app)

  return handler(event, context)
}
