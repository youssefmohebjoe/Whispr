import * as profileService from "./services/profile.service.js"
import * as validators from "./user.validation.js"
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { Router } from 'express'
import { fileValidationTypes, uploadDiskFile } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endPoint } from "./user.authorization.js";

const router = Router();

router.get("/profile",
    authentication(),
    profileService.profile)

router.get("/profile/:profileId",
    validation(validators.viewProfile),
    authentication(),
    profileService.viewProfile)

router.patch("/profile/settings",
    validation(validators.updateSimpleInfo),
    authentication(),
    profileService.updateSimpleInfo)

router.patch("/profile/settings/update-password",
    validation(validators.updatePassword),
    authentication(),
    profileService.updatePassword)

router.patch("/profile/settings/update-email",
    validation(validators.updateEmail),
    authentication(),
    profileService.updateEmail)

router.patch("/profile/settings/email-otps",
    validation(validators.replaceEmail),
    authentication(),
    profileService.replaceEmail)

router.patch("/profile/friends/:friendId/add",
    authentication(),
    profileService.addFriend)

router.patch("/profile/image",
    authentication(),
    // uploadDiskFile("user/profile", fileValidationTypes.image).single('image'),
    uploadCloudFile(fileValidationTypes.image).single('attachment'),
    profileService.updateImage)

router.patch("/profile/image/cover",
    authentication(),
    // uploadDiskFile("user/profile/cover", fileValidationTypes.image).array('image', 5),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 5),
    profileService.coverImages)

router.get("/profile/admin/dashboard",
    authentication(),
    authorization(endPoint.admin),
    profileService.dashBoard)

router.patch("/profile/admin/role",
    authentication(),
    authorization(endPoint.admin),
    profileService.changePrivileges)

export default router