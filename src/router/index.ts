import { Router } from 'express'
import { authenticate } from '../middleware/authHandler'
import ErrorHandler from '../middleware/errorHandler'
import AuthRouter from './auth.router'
import FarmRouter from './farmer.router'
import orderRouter from './order.route'

const router: Router = Router()

router.use('/auth', ErrorHandler.watch(AuthRouter))
router.use('/farm', authenticate, ErrorHandler.watch(FarmRouter))
router.use('/order', authenticate, ErrorHandler.watch(orderRouter))

router.all('/*', ErrorHandler.notFound)

export default router
