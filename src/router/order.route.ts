import { Router } from 'express'
import OrderController from '../controller/order/order'

const orderRouter: Router = Router()

orderRouter.post('/make-order', OrderController.makeOrder)
orderRouter.put('/approve-order/:orderId', OrderController.approveOrder)
orderRouter.put('/reject-order/:orderId', OrderController.rejectOrder)
orderRouter.get('/list-orders/:userId', OrderController.listOrders)
orderRouter.get('/list-orders', OrderController.listOrders)

export default orderRouter
