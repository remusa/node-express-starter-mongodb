/* tslint:disable */
import { sign, verify, register, login, ensureUser, JWT_SECRET } from '../auth'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
// import config from '../../config'
import { User } from '../../resources/users/users.model'

const config = {
  secrets: {
    jwt: JWT_SECRET,
  },
}

describe('Authentication:', () => {
  describe('sign', () => {
    test('creates new jwt from user', () => {
      const id = 123
      const token = sign(id)
      const user = jwt.verify(token, config.secrets.jwt)

      expect(user.id).toBe(id)
    })
  })

  describe('verify', () => {
    test('validates jwt and returns payload', async () => {
      const id = 1234
      const token = jwt.sign({ id }, config.secrets.jwt)
      const user = await verify(token)

      expect(user.id).toBe(id)
    })
  })

  describe('register', () => {
    test('requires email and password', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await register(req, res, () => {})
    })

    test('creates user and and sends new token from user', async () => {
      expect.assertions(2)

      const req = { body: { email: 'hello@hello.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verify(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user.email).toBe('hello@hello.com')
        },
      }

      await register(req, res, () => {})
    })
  })

  describe('login', () => {
    test('requires email and password', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await login(req, res, () => {})
    })

    test('user must be real', async () => {
      expect.assertions(2)

      const req = { body: { email: 'hello@hello.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await login(req, res, () => {})
    })

    test('passwords must match', async () => {
      expect.assertions(2)

      await User.create({
        email: 'hello@me.com',
        password: 'yoyoyo',
      })

      const req = { body: { email: 'hello@me.com', password: 'wrong' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await login(req, res, () => {})
    })

    test('creates new token', async () => {
      expect.assertions(2)
      const fields = {
        email: 'hello@me.com',
        password: 'yoyoyo',
      }
      const savedUser = await User.create(fields)

      const req = { body: fields }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verify(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user._id.toString()).toBe(savedUser._id.toString())
        },
      }

      await login(req, res, () => {})
    })
  })

  describe('ensureUser', () => {
    test('looks for Bearer token in headers', async () => {
      expect.assertions(2)

      const req = { headers: {} }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await ensureUser(req, res, () => {})
    })

    test('token must have correct prefix', async () => {
      expect.assertions(2)

      let req = { headers: { authorization: sign({ id: '123sfkj' }) } }
      let res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await ensureUser(req, res, () => {})
    })

    test('must be a real user', async () => {
      const token = `Bearer ${sign({ id: mongoose.Types.ObjectId() })}`
      const req = { headers: { authorization: token } }

      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await ensureUser(req, res, () => {})
    })

    test('finds user form token and passes on', async () => {
      const user = await User.create({
        email: 'hello@hello.com',
        password: '1234',
      })
      const token = `Bearer ${sign(user)}`
      const req = { headers: { authorization: token } }

      const next = () => {}
      await ensureUser(req, {}, next)
      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(req.user).not.toHaveProperty('password')
    })
  })
})
