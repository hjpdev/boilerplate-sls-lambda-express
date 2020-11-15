import { Application } from 'express'

import { createServer } from './app'

const PORT: (number | string) = process.env.PORT || 8088
const server: Application = createServer()

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
})
