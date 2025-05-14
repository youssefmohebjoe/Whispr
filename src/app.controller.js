import path from 'node:path'
import connectDB from './DB/connection.js'
import authController from './modules/auth/auth.controller.js'
import userController from './modules/user/user.controller.js'
import chatController from './modules/chat/chat.controller.js'
import postController from './modules/post/post.controller.js'
import { globalErrorHandling } from './utils/response/error.response.js'
import helmet from "helmet";
import morgan from 'morgan'
import { createHandler } from 'graphql-http/lib/use/express'
import { schema } from './modules/modules.schema.js'
import cors from 'cors'

const bootstrap = (app, express) => {



    // var whitelist = process.env.ORIGIN.split(",") || []
    // app.use(async (req, res, next) => {
    //     console.log(req.header('origin'));
    //     console.log(req.method);

    //     if (!whitelist.includes(req.header('origin'))) {
    //         return next(new Error('NOT ALLOWED BY CORS', { status: 403 }))
    //     }
    //     if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    //         return next(new Error('NOT ALLOWED BY CORS', { status: 403 }))
    //     }
    //     await res.header('Access-Control-Allow-Origin', req.header('origin'));
    //     await res.header('Access-Control-Allow-Headers', '*')
    //     await res.header('Access-Control-Allow-Private-Network', 'true')
    //     await res.header('Access-Control-Allow-Methods', '*')
    //     console.log("Origin Work");
    //     next()
    // })
    // console.log(whitelist);


    app.use(cors())

    app.use(express.json())
    app.use('/uploads', express.static(path.resolve('./src/uploads')))



    app.use(helmet())
    // app.use(morgan('dev'))

    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Welcome in node.js project powered by express and ES6" })
    })


    app.use('/graphql', createHandler({ schema }))
    app.use("/auth", authController)
    app.use("/user", userController)
    app.use("/chat", chatController)
    app.use("/post", postController)

    app.all("*", (req, res, next) => {
        return res.status(404).json({ message: "In-valid routing" })
    })


    app.use(globalErrorHandling)

    //DB
    connectDB()

}

export default bootstrap