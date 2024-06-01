import { Router } from 'express'
import FarmerController from '../controller/farmer/farmer'

const FarmRouter: Router = Router()

FarmRouter.post('/create-farm', FarmerController.registerFarm)
FarmRouter.get('/get-farm', FarmerController.getFarms)

export default FarmRouter
