import { Response as ExpressResponse } from 'express'
import Response from './response'

interface MockExpressResponse {
  status: jest.Mock<ExpressResponse>
  json: jest.Mock<ExpressResponse>
}

describe('Response', () => {
  let mockResponse: MockExpressResponse

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
  })

  describe('send', () => {
    it('should send response with status and message', () => {
      const status = 200
      const message = 'Success'
      const data = { key: 'value' }

      Response.send(
        mockResponse as unknown as ExpressResponse,
        status,
        message,
        data
      )

      expect(mockResponse.status).toHaveBeenCalledWith(status)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message,
        data,
      })
    })

    it('should send response without data if not provided', () => {
      const status = 200
      const message = 'Success'

      Response.send(mockResponse as unknown as ExpressResponse, status, message)

      expect(mockResponse.status).toHaveBeenCalledWith(status)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message,
        data: null,
      })
    })

    it('should return the ExpressResponse object', () => {
      const status = 200
      const message = 'Success'
      const data = { key: 'value' }

      const result = Response.send(
        mockResponse as unknown as ExpressResponse,
        status,
        message,
        data
      )

      expect(result).toBe(mockResponse)
    })
  })
})
