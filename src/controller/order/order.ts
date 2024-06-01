import { EStatus, Orders, Prisma, User } from '@prisma/client'
import { Response as ExpressResponse, NextFunction, Request } from 'express'
import { prisma } from '../../config/database'
import Response from '../../services/response'
import { ForbiddenException, NotFoundException } from '../../utils/exception'
import { paginate } from '../../utils/pagination'
import { CreateOrderDTO } from './dto'

interface AuthenticatedRequest extends Request {
  user?: User
}

export default class OrderController {
  static async makeOrder(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    try {
      const dto: CreateOrderDTO = req.body
      const userId = req.user?.id ?? ''

      await prisma.$transaction(async (tx) => {
        for (const farmId of dto.farmIds) {
          const farm = await prisma.farm.findFirst({
            where: {
              id: farmId.toString(),
            },
          })

          if (!farm) {
            throw new NotFoundException('Farm not found')
          }

          const landSize = parseFloat(farm.landSize)
          const fertilizerQuantity = landSize * 3
          const seedQuantity = landSize
          if (fertilizerQuantity > landSize * 3) {
            throw new ForbiddenException(
              'Fertilizer quantity exceeds the limit'
            )
          }

          if (seedQuantity > landSize) {
            throw new ForbiddenException('Seed quantity exceeds the limit')
          }

          await tx.orders.create({
            data: {
              fertilizerQuantity,
              seedQuantity,
              status: EStatus.PENDING,
              fertilizerName: dto.fertilizerName,
              seedName: dto.seedName,
              userId,
              farmId: farm.id,
            },
          })
        }
      })

      return Response.send(res, 201, 'Order created', undefined)
    } catch (error) {
      next(error)
    }
  }

  static async listOrders(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 0
      const size = parseInt(req.query.size as string) || 0
      const userId = req.params.userId as string

      let result

      if (userId) {
        result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
          prisma.orders,
          {
            where: {
              userId,
            },
          },
          +page,
          +size
        )
      } else {
        result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
          prisma.orders,
          {},
          +page,
          +size
        )
      }

      return Response.send(res, 200, 'Orders retrieved', result)
    } catch (error) {
      next(error)
    }
  }

  static async approveOrder(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    try {
      const orderId = req.params.orderId as string

      const order = await prisma.orders.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new NotFoundException('Order not found')
      }

      const updatedOrder = await prisma.orders.update({
        where: { id: orderId },
        data: {
          status: EStatus.APPROVED,
        },
      })

      return Response.send(res, 200, 'Order approved', updatedOrder)
    } catch (error) {
      next(error)
    }
  }

  static async rejectOrder(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    try {
      const orderId = req.params.orderId as string

      const order = await prisma.orders.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new NotFoundException('Order not found')
      }

      const updatedOrder = await prisma.orders.update({
        where: { id: orderId },
        data: {
          status: EStatus.REJECTED,
        },
      })

      return Response.send(res, 200, 'Order rejected', updatedOrder)
    } catch (error) {
      next(error)
    }
  }
}
