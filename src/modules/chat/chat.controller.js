import * as chatServices from './services/chat.service.js'
import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
const router = Router()

router.get('/:destId',
    authentication(),
    chatServices.findOneChat
)



export default router 