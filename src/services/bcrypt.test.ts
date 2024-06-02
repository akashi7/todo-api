import bcrypt from 'bcryptjs'
import PwdService from './bcrypt'

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn(),
  genSaltSync: jest.fn(),
}))

describe('PwdService', () => {
  describe('hashPassword', () => {
    it('should hash password', () => {
      const password = 'myPassword'
      const hashedPassword = 'hashedPassword'

      ;(bcrypt.genSaltSync as jest.Mock).mockReturnValue('salt')
      ;(bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword)

      const result = PwdService.hashPassword(password)

      expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10)
      expect(bcrypt.hashSync).toHaveBeenCalledWith(password, 'salt')
      expect(result).toBe(hashedPassword)
    })
  })

  describe('checkPassword', () => {
    it('should return true for matching password', () => {
      const password = 'myPassword'
      const hashedPassword = 'hashedPassword'

      ;(bcrypt.compareSync as jest.Mock).mockReturnValue(true)

      const result = PwdService.checkPassword(password, hashedPassword)

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword)
      expect(result).toBe(true)
    })

    it('should return false for non-matching password', () => {
      const password = 'myPassword'
      const hashedPassword = 'hashedPassword'

      ;(bcrypt.compareSync as jest.Mock).mockReturnValue(false)

      const result = PwdService.checkPassword(password, hashedPassword)

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword)
      expect(result).toBe(false)
    })

    it('should return false when hashed password is null', () => {
      const password = 'myPassword'

      const result = PwdService.checkPassword(password, null)

      expect(result).toBe(false)
    })
  })
})
