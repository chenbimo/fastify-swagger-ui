'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const Swagger = require('@apidevtools/swagger-parser')
const yaml = require('yaml')
const fastifySwagger = require('@fastify/swagger')
const fastifySwaggerUi = require('../index')
const {
  schemaQuerystring,
  schemaBody,
  schemaParams,
  schemaSecurity,
  swaggerOption
} = require('../examples/options')

const resolve = require('path').resolve
const readFileSync = require('fs').readFileSync

const schemaParamsWithoutDesc = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      }
    }
  }
}

const schemaParamsWithKey = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'user id'
        },
        key: {
          type: 'string',
          description: 'just some random key'
        }
      }
    }
  }
}

test('/documentation/json route', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/json'
  })

  const payload = JSON.parse(res.payload)

  await Swagger.validate(payload)
  t.pass('valid swagger object')
})

test('/documentation/uiConfig route', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  const uiConfig = {
    docExpansion: 'full'
  }

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { uiConfig })

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/uiConfig'
  })

  const payload = JSON.parse(res.payload)

  t.match(payload, uiConfig, 'uiConfig should be valid')
})

test('/documentation/initOAuth route', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  const initOAuth = {
    scopes: ['openid', 'profile', 'email', 'offline_access']
  }

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { initOAuth })

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/initOAuth'
  })

  const payload = JSON.parse(res.payload)

  t.match(payload, initOAuth, 'initOAuth should be valid')
})

test('fastify.swagger should return a valid swagger yaml', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})
  fastify.all('/parametersWithoutDesc/:id', schemaParamsWithoutDesc, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/yaml'
  })

  t.equal(typeof res.payload, 'string')
  t.equal(res.headers['content-type'], 'application/x-yaml')
  yaml.parse(res.payload)
  t.pass('valid swagger yaml')
})

test('/documentation should redirect to ./documentation/static/index.html', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './documentation/static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/documentation/ should redirect to ./static/index.html', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/v1/documentation should redirect to ./documentation/static/index.html', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { routePrefix: '/v1/documentation' })

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/v1/documentation'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './documentation/static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/v1/documentation/ should redirect to ./static/index.html', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { routePrefix: '/v1/documentation' })

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/v1/documentation/'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/v1/foobar should redirect to ./foobar/static/index.html - in plugin', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(async function (fastify, options) {
    await fastify.register(fastifySwagger, swaggerOption)
    await fastify.register(fastifySwaggerUi, { routePrefix: '/foobar' })

    fastify.get('/', () => {})
    fastify.post('/', () => {})
    fastify.get('/example', schemaQuerystring, () => {})
    fastify.post('/example', schemaBody, () => {})
    fastify.get('/parameters/:id', schemaParams, () => {})
    fastify.get('/example1', schemaSecurity, () => {})
  }, { prefix: '/v1' })

  const res = await fastify.inject({
    method: 'GET',
    url: '/v1/foobar'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './foobar/static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/v1/foobar/ should redirect to ./static/index.html - in plugin', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(async function (fastify, options) {
    await fastify.register(fastifySwagger, swaggerOption)
    await fastify.register(fastifySwaggerUi, { routePrefix: '/foobar' })

    fastify.get('/', () => {})
    fastify.post('/', () => {})
    fastify.get('/example', schemaQuerystring, () => {})
    fastify.post('/example', schemaBody, () => {})
    fastify.get('/parameters/:id', schemaParams, () => {})
    fastify.get('/example1', schemaSecurity, () => {})
  }, { prefix: '/v1' })

  const res = await fastify.inject({
    method: 'GET',
    url: '/v1/foobar/'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('with routePrefix: \'/\' should redirect to ./static/index.html', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { routePrefix: '/' })

  fastify.get('/foo', () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './static/index.html')
  t.equal(typeof res.payload, 'string')
})

test('/documentation/static/:file should send back the correct file', async (t) => {
  t.plan(22)
  const fastify = Fastify()

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  await fastify.ready()

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/'
    })
    t.equal(res.statusCode, 302)
    t.equal(res.headers.location, './static/index.html')
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'text/html; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'index.html'),
        'utf8'
      ),
      res.payload
    )
    t.ok(res.payload.indexOf('swagger-initializer.js') !== -1)
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/swagger-initializer.js'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'swagger-initializer.js'),
        'utf8'
      ),
      res.payload
    )
    t.ok(res.payload.indexOf('resolveUrl') !== -1)
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/oauth2-redirect.html'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'text/html; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'oauth2-redirect.html'),
        'utf8'
      ),
      res.payload
    )
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/swagger-ui.css'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'text/css; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'swagger-ui.css'),
        'utf8'
      ),
      res.payload
    )
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/swagger-ui-bundle.js'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'swagger-ui-bundle.js'),
        'utf8'
      ),
      res.payload
    )
  }

  {
    const res = await fastify.inject({
      method: 'GET',
      url: '/documentation/static/swagger-ui-standalone-preset.js'
    })
    t.equal(typeof res.payload, 'string')
    t.equal(res.headers['content-type'], 'application/javascript; charset=UTF-8')
    t.equal(
      readFileSync(
        resolve(__dirname, '..', 'dist', 'swagger-ui-standalone-preset.js'),
        'utf8'
      ),
      res.payload
    )
  }
})

test('/documentation/static/:file 404', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/static/stuff.css'
  })
  const payload = JSON.parse(res.payload)
  t.equal(res.statusCode, 404)
  t.match(payload, {
    error: 'Not Found',
    statusCode: 404
  })
})

test('/documentation2/json route (overwrite)', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi, { routePrefix: '/documentation2' })

  fastify.get('/', () => {})
  fastify.post('/', () => {})
  fastify.get('/example', schemaQuerystring, () => {})
  fastify.post('/example', schemaBody, () => {})
  fastify.get('/parameters/:id', schemaParams, () => {})
  fastify.get('/example1', schemaSecurity, () => {})
  fastify.get('/parameters/:id/:key', schemaParamsWithKey, () => {})

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation2/json'
  })

  const payload = JSON.parse(res.payload)

  await Swagger.validate(payload)
  t.pass('valid swagger object')
})

test('/documentation/:myfile should return 404 in dynamic mode', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/swagger-ui.js'
  })
  t.equal(res.statusCode, 404)
})

test('/documentation/:myfile should run custom NotFoundHandler in dynamic mode', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  const notFoundHandler = function (req, reply) {
    reply.code(410).send()
  }
  fastify.setNotFoundHandler(notFoundHandler)
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/swagger-ui.js'
  })
  t.equal(res.statusCode, 410)
})

test('/documentation/ should redirect to ./static/index.html', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  await fastify.register(fastifySwagger, swaggerOption)
  await fastify.register(fastifySwaggerUi)

  const res = await fastify.inject({
    method: 'GET',
    url: '/documentation/'
  })
  t.equal(res.statusCode, 302)
  t.equal(res.headers.location, './static/index.html')
})
