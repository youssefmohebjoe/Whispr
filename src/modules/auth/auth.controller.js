import { Router } from 'express'
import * as registrationService from './service/registration.service.js';
import * as loginService from './service/login.service.js';
import { validation } from '../../middlewares/validation.middleware.js';
import * as validators from './auth.validation.js'
const router = Router();


router.post("/register", validation(validators.register), registrationService.register)
router.patch("/confirm-email", validation(validators.confirmEmail), registrationService.confirmEmail)
router.post("/login", validation(validators.login), loginService.login)
router.post("/gmail-login", loginService.googleLogin)
router.get("/refresh-token", loginService.refreshToken)
router.patch("/forget-password", validation(validators.forgetPassword), loginService.forgetPassword)
router.patch("/reset-password", validation(validators.resetPassword), loginService.resetPassword)


export default router