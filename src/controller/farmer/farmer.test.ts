import { prisma } from '../../config/database'
import Response from '../../services/response'
import { ForbiddenException } from '../../utils/exception'
import FarmerController from './farmer'

jest.mock('../../config/database', () => ({
  prisma: {
    farm: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))
jest.mock('../../services/response')
jest.mock('../../utils/exception')

describe('FarmerController', () => {
  describe('getFarms', () => {
    it('should return farms successfully', async () => {
      const req: any = {
        user: { id: 1 },
        query: { page: 1, size: 10 },
      }
      const res: any = {}
      const next: any = jest.fn()

      const farmsData = {
        message: 'farms',
        data: {
          items: [
            { farmName: 'Test Farm 1', id: 1, landSize: '100', userId: 1 },
            { farmName: 'Test Farm 2', id: 2, landSize: '200', userId: 1 },
          ],
        },
      }
      const findManyMock = jest.fn().mockResolvedValue(farmsData)
      prisma.farm.findMany = findManyMock

      await FarmerController.getFarms(req, res, next)

      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { farmName: 'asc' },
        skip: 10,
        take: 10,
      })
    })
  })

  describe('registerFarm', () => {
    it('should create a new farm successfully', async () => {
      const req: any = {
        user: { id: 1 },
        body: { farmName: 'Test Farm', landSize: '100' },
      }
      const res: any = {}
      const next: any = jest.fn()

      const createMock = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        farmName: 'Test Farm',
        landSize: '100',
      })
      prisma.farm.create = createMock

      await FarmerController.registerFarm(req, res, next)

      expect(createMock).toHaveBeenCalled()
      expect(Response.send).toHaveBeenCalledWith(res, 201, 'farm created', {
        id: 1,
        userId: 1,
        farmName: 'Test Farm',
        landSize: '100',
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException if land size is invalid', async () => {
      const req: any = {
        user: { id: 1 },
        body: { farmName: 'Test Farm', landSize: '-10' },
      }
      const res: any = {}
      const next: any = jest.fn()

      await FarmerController.registerFarm(req, res, next)
      expect(next).toHaveBeenCalledWith(
        new ForbiddenException('Invalid land size')
      )
    })
  })
})
