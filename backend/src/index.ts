import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import jwt from '@fastify/jwt'

// Se tiver, importa sua conexão com o banco
import Database from './infra/database'

const fastify = Fastify()

// Registrar o plugin JWT
fastify.register(jwt, {
  secret: 'CHAVE_SECRETA_DO_ARQUIVO_ENV',
  sign: {
    algorithm: 'HS256'
  }
})
fastify.addHook('onRequest', async (request, reply) => {
  if (request.raw.url !== '/login') {
    await fastify.authenticate(request, reply)
  }
})

// Tipar os dados da requisição de login
interface LoginRequestBody {
  username: string
  password: string
}

// Adiciona a função de autenticação (middleware)
fastify.decorate(
  'authenticate',
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  }
)

// Rota de login
fastify.post('/login', async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
  const { username, password } = request.body

  if (username === 'admin' && password === '123') {
    const token = fastify.jwt.sign({ username }, { expiresIn: '1m' })
    return reply.send({ token })
  }

  return reply.status(401).send({ error: 'Unauthorized' })
})

fastify.get("/",(request,reply)=>{
  reply.send("Não precisa logar aqui!")
})

// Rota protegida
fastify.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
  return { user: request.user}
})

// Inicialização do servidor
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server running at ${address}`)
})

