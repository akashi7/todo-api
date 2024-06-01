import { ERole } from '@prisma/client'
import { Response as ExpressResponse, NextFunction, Request } from 'express'
import { prisma } from '../../config/database'
import PwdService from '../../services/bcrypt'
import JWTService from '../../services/jwt'
import Response from '../../services/response'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../utils/exception'
import { AuthSingUpDTO, LoginDTO } from './dto'

export default class AuthController {
  static async signUp(
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const AuthData: AuthSingUpDTO = req.body
      if (!AuthData) {
        throw new ForbiddenException()
      } else {
        const userExists = await prisma.user.findFirst({
          where: {
            email: AuthData.email,
          },
        })
        if (userExists) {
          throw new ConflictException('User arleady exists')
        } else {
          const password = PwdService.hashPassword(AuthData.password)
          AuthData.password = password
          const user = await prisma.user.create({
            data: {
              role: ERole.FARMER,
              ...AuthData,
            },
          })
          const token = JWTService.signToken({
            id: user.id,
            email: user.email,
            fullNames: user.fullNames,
            role: user.role,
          })
          return Response.send(res, 201, 'User created successfully', {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              fullNames: user.fullNames,
            },
            token,
          })
        }
      }
    } catch (error) {
      next(error)
    }
  }

  static async login(
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const dto: LoginDTO = req.body
      const user = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      })
      if (!user) {
        throw new NotFoundException('User not found')
      } else {
        const passwordMatch = PwdService.checkPassword(
          dto.password,
          user.password
        )
        if (!passwordMatch) {
          throw new BadRequestException('Password is incorrect')
        } else {
          const token = JWTService.signToken({
            id: user.id,
            email: user.email,
            fullNames: user.fullNames,
            role: user.role,
          })
          return Response.send(res, 201, 'User LoggedIn successfully', {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              fullNames: user.fullNames,
            },
            token,
          })
        }
      }
    } catch (error) {
      next(error)
    }
  }
}
