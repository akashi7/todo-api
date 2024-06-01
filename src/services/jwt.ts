import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '../config/env'

export default class JWTService {
  /** Generate a token
   *
   * @param {object} data - Payload
   * @returns {string} - Token
   */
  static signToken(data: object): string {
    const token = jwt.sign(data, env.JWT_KEY as string, { expiresIn: '24h' })
    return token
  }

  /** Verify a token
   *
   * @param {string} token - Token
   * @returns {JwtPayload | string | null} - Decoded payload or null if verification fails
   */
  static verifyToken(token: string): JwtPayload | string | null {
    let decoded: JwtPayload | string | null
    try {
      decoded = jwt.verify(token, env.JWT_KEY as string)
    } catch (err) {
      decoded = null
    }
    return decoded
  }
}
