import { Router } from 'express'
import { authentication, authorization } from '../../middlewares/auth.middleware.js';
import { validation } from '../../middlewares/validation.middleware.js';
import { endPoint } from './post.authorization.endpoint.js';
import { uploadCloudFile } from '../../utils/multer/cloud.multer.js';
import * as postService from './services/post.service.js';
import * as validators from './post.validation.js'
import { fileValidationTypes } from '../../utils/multer/local.multer.js';
import commentController from '../comment/comment.controller.js';

const router = Router();

router.use("/:postId/comment", commentController)

router.post("/",
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 5),
    validation(validators.createPost),
    postService.createPost
)

router.get("/posts",
    // authentication(),
    postService.getAllPosts
)

router.patch("/:postId",
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 5),
    validation(validators.updatePost),
    postService.updatePost
)

router.delete("/:postId",
    authentication(),
    authorization(endPoint.freezePost),
    validation(validators.freezePost),
    postService.freezePost
)

router.patch("/:postId/restore",
    authentication(),
    authorization(endPoint.freezePost),
    validation(validators.freezePost),
    postService.restorePost
)

router.patch("/:postId/like",
    authentication(),
    authorization(endPoint.likePost),
    validation(validators.likePost),
    postService.likePost
)





export default router