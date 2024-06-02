import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServerErrorException,
  TooManyRequestsException,
  UnauthorizedException,
} from './exception'

describe('Custom Exceptions', () => {
  describe('BadRequestException', () => {
    it('should have correct properties', () => {
      const exception = new BadRequestException()
      expect(exception.message).toBe('Bad Request')
      expect(exception.name).toBe('BadRequestException')
      expect(exception.statusCode).toBe(400)
    })
  })

  describe('UnauthorizedException', () => {
    it('should have correct properties', () => {
      const exception = new UnauthorizedException()
      expect(exception.message).toBe('Unauthorized')
      expect(exception.name).toBe('UnauthorizedException')
      expect(exception.statusCode).toBe(401)
    })
  })

  describe('ForbiddenException', () => {
    it('should have correct properties', () => {
      const exception = new ForbiddenException()
      expect(exception.message).toBe('Forbidden')
      expect(exception.name).toBe('ForbiddenException')
      expect(exception.statusCode).toBe(403)
    })
  })

  describe('NotFoundException', () => {
    it('should have correct properties', () => {
      const exception = new NotFoundException()
      expect(exception.message).toBe('Not Found')
      expect(exception.name).toBe('NotFoundException')
      expect(exception.statusCode).toBe(404)
    })
  })

  describe('ConflictException', () => {
    it('should have correct properties', () => {
      const exception = new ConflictException()
      expect(exception.message).toBe('Conflict')
      expect(exception.name).toBe('ConflictException')
      expect(exception.statusCode).toBe(409)
    })
  })

  describe('TooManyRequestsException', () => {
    it('should have correct properties', () => {
      const exception = new TooManyRequestsException()
      expect(exception.message).toBe('Too Many Requests')
      expect(exception.name).toBe('TooManyRequestsException')
      expect(exception.statusCode).toBe(429)
    })
  })

  describe('ServerErrorException', () => {
    it('should have correct properties', () => {
      const exception = new ServerErrorException()
      expect(exception.message).toBe('Server Error')
      expect(exception.name).toBe('ServerErrorException')
      expect(exception.statusCode).toBe(500)
    })
  })

  describe('BadGatewayException', () => {
    it('should have correct properties', () => {
      const exception = new BadGatewayException()
      expect(exception.message).toBe('Bad Gateway')
      expect(exception.name).toBe('BadGatewayException')
      expect(exception.statusCode).toBe(502)
    })
  })
})
