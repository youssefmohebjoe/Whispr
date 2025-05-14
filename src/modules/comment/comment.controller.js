import { Router } from "express";
import * as commentService from './services/comment.service.js'
import { authentication, authorization } from '../../middlewares/auth.middleware.js'
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { endPoint } from "./comment.authorization.endpoint.js";
import * as validators from "./comment.validation.js"


const router = Router({ mergeParams: true, caseSensitive: true })

router.post('/:commentId?',
    authentication(),
    authorization(endPoint.create),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 2),
    validation(validators.createComment),
    commentService.createComment)

router.patch('/:commentId',
    authentication(),
    authorization(endPoint.create),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 2),
    validation(validators.updateComment),
    commentService.updateComment)

router.delete('/:commentId',
    authentication(),
    authorization(endPoint.freeze),
    validation(validators.freezeComment),
    commentService.freezeComment)

router.patch('/:commentId/restore',
    authentication(),
    authorization(endPoint.freeze),
    validation(validators.freezeComment),
    commentService.restoreComment)

export default router