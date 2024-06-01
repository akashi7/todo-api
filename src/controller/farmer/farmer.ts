import { Farm, Prisma, User } from '@prisma/client'
import { Response as ExpressResponse, NextFunction, Request } from 'express'
import { prisma } from '../../config/database'
import Response from '../../services/response'
import { ForbiddenException } from '../../utils/exception'
import { paginate } from '../../utils/pagination'
import { CreateFarmDTO } from './dto'

interface AuthenticatedRequest extends Request {
  user?: User
}

export default class FarmerController {
  static async registerFarm(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const farmDTO: CreateFarmDTO = req.body
      if (parseInt(farmDTO.landSize) <= 0) {
        throw new ForbiddenException('Invalid land size')
      } else {
        const farm: Farm = await prisma.farm.create({
          data: {
            userId: req.user?.id,
            ...farmDTO,
          },
        })
        return Response.send(res, 201, 'farm created', farm)
      }
    } catch (error) {
      next(error)
    }
  }

  static async getFarms(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const page = parseInt(req.query.page as string) || 0
      const size = parseInt(req.query.size as string) || 0

      const result = await paginate<Farm, Prisma.FarmFindManyArgs>(
        prisma.farm,
        {
          orderBy: {
            farmName: 'asc',
          },
          where: {
            userId: req.user?.id,
          },
        },
        +page,
        +size
      )
      return Response.send(res, 200, 'farms', result)
    } catch (error) {
      next(error)
    }
  }
}
