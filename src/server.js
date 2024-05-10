require('dotenv').config()
const Hapi = require('@hapi/hapi')
const notes = require('./api/notes')
const logger = require('./logger/index')
const ClientError = require('./exceptions/ClientError')
const os = require('os')

const init = async () => {
  const server = Hapi.server({
    host: 'localhost',
    port: 3000
  })

  await server.register(
    {
      plugin: notes
    }
  )

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }

    logger.info(`userIP=${request.info.remoteAddress}, host=${os.hostname},  method=${request.method}, path=${request.path}, payload=${JSON.stringify(response.source)}`)
    return h.continue
  })

  await server.start()
  console.log(`server start at ${server.info.uri}`)
}

init()
