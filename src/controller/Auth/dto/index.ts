export interface AuthSingUpDTO {
  fullNames: string
  email: string
  password: string
}

export interface LoginDTO extends Omit<AuthSingUpDTO, 'fullNames'> {}
