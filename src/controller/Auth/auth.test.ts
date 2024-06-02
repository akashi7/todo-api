import { Response as ExpressResponse, NextFunction, Request } from 'express'
import { prisma } from '../../config/database'
import PwdService from '../../services/bcrypt'
import JWTService from '../../services/jwt'
import Response from '../../services/response'
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../utils/exception'
import AuthController from './auth'

jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('../../services/bcrypt')
jest.mock('../../services/jwt')
jest.mock('../../services/response')
jest.mock('../../utils/exception')

describe('AuthController', () => {
  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const req: Partial<Request> = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          fullNames: 'Test User',
        },
      }
      const res: Partial<ExpressResponse> = {}
      const next: jest.Mocked<NextFunction> = jest.fn()
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'FARMER',
        fullNames: 'Test User',
      }
      const token = 'fakeToken'

      const findFirstMock = jest.fn().mockResolvedValue(null)
      prisma.user.findFirst = findFirstMock

      const createMock = jest.fn().mockResolvedValue(user)
      prisma.user.create = createMock
      ;(PwdService.hashPassword as jest.Mock).mockReturnValue('hashedPassword')
      ;(JWTService.signToken as jest.Mock).mockReturnValue(token)

      await AuthController.signUp(req as Request, res as ExpressResponse, next)

      expect(findFirstMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(createMock).toHaveBeenCalledWith({
        data: {
          role: 'FARMER',
          email: 'test@example.com',
          password: 'hashedPassword',
          fullNames: 'Test User',
        },
      })
      expect(JWTService.signToken as jest.Mock).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'FARMER',
        fullNames: 'Test User',
      })
      expect(Response.send as jest.Mock).toHaveBeenCalledWith(
        res,
        201,
        'User created successfully',
        {
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'FARMER',
            fullNames: 'Test User',
          },
          token,
        }
      )
    })
    it('should return ConflictException if user already exists', async () => {
      const req: Partial<Request> = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          fullNames: 'Test User',
        },
      }
      const res: Partial<ExpressResponse> = {}
      const next: jest.Mocked<NextFunction> = jest.fn()
      const findFirstMock = jest.fn().mockResolvedValue({ id: 1 })
      prisma.user.findFirst = findFirstMock

      await AuthController.signUp(req as Request, res as ExpressResponse, next)

      expect(findFirstMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(next).toHaveBeenCalledWith(
        new ConflictException('User already exists')
      )
    })
  })

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const req: Partial<Request> = {
        body: { email: 'test@example.com', password: 'password123' },
      }
      const res: Partial<ExpressResponse> = {}
      const next: jest.Mocked<NextFunction> = jest.fn()
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'FARMER',
        fullNames: 'Test User',
        password: 'hashedPassword',
      }
      const token = 'fakeToken'

      const findFirstMock = jest.fn().mockResolvedValue(user)
      prisma.user.findFirst = findFirstMock
      ;(PwdService.checkPassword as jest.Mock).mockReturnValue(true)
      ;(JWTService.signToken as jest.Mock).mockReturnValue(token)

      await AuthController.login(req as Request, res as ExpressResponse, next)

      expect(findFirstMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(PwdService.checkPassword as jest.Mock).toHaveBeenCalledWith(
        'password123',
        'hashedPassword'
      )
      expect(JWTService.signToken as jest.Mock).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        role: 'FARMER',
        fullNames: 'Test User',
      })
      expect(Response.send as jest.Mock).toHaveBeenCalledWith(
        res,
        201,
        'User LoggedIn successfully',
        {
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'FARMER',
            fullNames: 'Test User',
          },
          token,
        }
      )
    })
    it('should return NotFoundException if user does not exist', async () => {
      const req: Partial<Request> = {
        body: { email: 'nonexistent@example.com', password: 'password123' },
      }
      const res: Partial<ExpressResponse> = {}
      const next: jest.Mocked<NextFunction> = jest.fn()
      const findFirstMock = jest.fn().mockResolvedValue(null)
      prisma.user.findFirst = findFirstMock

      await AuthController.login(req as Request, res as ExpressResponse, next)

      expect(findFirstMock).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      })
      expect(next).toHaveBeenCalledWith(new NotFoundException('User not found'))
    })

    it('should return ForbiddenException if password is incorrect', async () => {
      const req: Partial<Request> = {
        body: { email: 'test@example.com', password: 'wrongPassword' },
      }
      const res: Partial<ExpressResponse> = {}
      const next: jest.Mocked<NextFunction> = jest.fn()
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'FARMER',
        fullNames: 'Test User',
        password: 'hashedPassword',
      }

      const findFirstMock = jest.fn().mockResolvedValue(user)
      prisma.user.findFirst = findFirstMock
      ;(PwdService.checkPassword as jest.Mock).mockReturnValue(false)

      await AuthController.login(req as Request, res as ExpressResponse, next)

      expect(findFirstMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(PwdService.checkPassword as jest.Mock).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword'
      )
      expect(next).toHaveBeenCalledWith(
        new ForbiddenException('Incorrect password')
      )
    })
  })
})
