import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '../config/env'
import JWTService from './jwt'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

describe('JWTService', () => {
  describe('signToken', () => {
    it('should generate a token', () => {
      const payload = { userId: '123' }
      const token = 'generatedToken'

      ;(jwt.sign as jest.Mock).mockReturnValue(token)

      const result = JWTService.signToken(payload)

      expect(jwt.sign).toHaveBeenCalledWith(payload, env.JWT_KEY, {
        expiresIn: '24h',
      })
      expect(result).toBe(token)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = 'validToken'
      const decodedPayload: JwtPayload = { userId: '123', exp: 1234567890 }

      ;(jwt.verify as jest.Mock).mockReturnValue(decodedPayload)

      const result = JWTService.verifyToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, env.JWT_KEY)
      expect(result).toEqual(decodedPayload)
    })

    it('should return null for an invalid token', () => {
      const token = 'invalidToken'

      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = JWTService.verifyToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, env.JWT_KEY)
      expect(result).toBeNull()
    })
  })
})
