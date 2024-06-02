import { PrismaClient } from '@prisma/client'
import { connectDatabase, disconnectDatabase } from './database'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  }
  return { PrismaClient: jest.fn(() => mockPrisma) }
})

describe('Database connection tests', () => {
  let prisma: PrismaClient
  const originalExit = process.exit

  beforeAll(() => {
    prisma = new PrismaClient() as unknown as PrismaClient
    console.log = jest.fn()
    console.error = jest.fn()
    process.exit = jest.fn() as never
  })

  afterAll(() => {
    process.exit = originalExit
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('connectDatabase should connect to the database', async () => {
    ;(prisma.$connect as jest.Mock).mockResolvedValueOnce(undefined)

    await expect(connectDatabase()).resolves.toBeUndefined()
    expect(prisma.$connect).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('Database connected')
  })

  test('connectDatabase should call process.exit if connection fails', async () => {
    const errorMessage = 'Failed to connect to database'
    ;(prisma.$connect as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(connectDatabase()).resolves.toBeUndefined()
    expect(prisma.$connect).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(
      'Failed to connect to database:',
      new Error(errorMessage)
    )
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  test('disconnectDatabase should disconnect from the database', async () => {
    ;(prisma.$disconnect as jest.Mock).mockResolvedValueOnce(undefined)

    await expect(disconnectDatabase()).resolves.toBeUndefined()
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('Database disconnected')
  })
})
