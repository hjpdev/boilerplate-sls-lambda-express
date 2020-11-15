import express, { Application, Router } from 'express'

import errorHandler from '../server/middleware/errorHandler'

interface NewDateOptions {
  m?: number | string
  d?: number | string
  h?: number | string
  min?: number | string
  sec?: number | string
}

export const newDate = (options: NewDateOptions = {}): string => {
  const padLeft = (value: number | string) => `${value}`.length === 1 ? `0${value}` : value
  const { m, d, h, min, sec } = options

  const date = new Date()
  const month = m ? padLeft(m) : padLeft(date.getMonth() + 1)
  const day = d ? padLeft(d) : padLeft(date.getDate())
  const hours = h ? padLeft(h) : padLeft(date.getHours())
  const minutes = min ? padLeft(min) : padLeft(date.getMinutes())
  const seconds = sec ? padLeft(sec) : padLeft(date.getSeconds())
  const dateString = [date.getFullYear(), month, day].join('-')
  const timeString = [hours, minutes, seconds, '000000'].join(':')

  return `${dateString} ${timeString}`
}

export const createSingleRouteTestApp = (options: { path: string; router: Router; }): Application => {
  const app = express()
  app.use(express.json())
  app.use(options.path, options.router)
  app.use(errorHandler)

  return app
}
