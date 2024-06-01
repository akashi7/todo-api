import {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
  Application,
} from 'express'
import morgan from 'morgan'
import cors, { CorsOptions } from 'cors'
import { UnauthorizedException } from '../utils/exception'
import env from './env'
import limiter from './limiter'

export const corsConfig = (): ReturnType<typeof cors> =>
  cors({
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookies',
    origin: (origin, callback) => {
      const whitelist = env.ALLOWED_ORIGINS || []
      const canAllowUndefinedOrigin =
        origin === undefined && env.NODE_ENV !== 'production'

      if (whitelist.indexOf(origin || '') !== -1 || canAllowUndefinedOrigin) {
        callback(null, true)
      } else {
        callback(
          new UnauthorizedException(
            `Not allowed by CORS for origin:${origin} on ${env.NODE_ENV}`
          )
        )
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  } as CorsOptions)

export const httpsConfig = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.header('x-forwarded-proto') !== 'https' &&
    env.NODE_ENV === 'production'
  ) {
    res.redirect(`https://${req.get('host') + req.originalUrl}`)
  } else {
    next()
  }
}

export const configureMiddleware = (app: Application): void => {
  if (env.NODE_ENV === 'production') app.use(limiter)
  app.use(corsConfig())
  app.use(morgan('dev'))
  app.use(json())
  app.use(urlencoded({ extended: false }))
  app.use(httpsConfig)
}
