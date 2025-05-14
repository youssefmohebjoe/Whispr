import { Server } from "socket.io"
import { connectSocket, disconnectSocket } from "./services/chat.auth.service.js"
import { sendMessage } from "./services/message.service.js"


let io = undefined;


export const runIo = async (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
        }
    })

    return io.on("connection", async (socket) => {
        console.log(socket.handshake.auth)
        await connectSocket(socket)
        await sendMessage(socket)
        await disconnectSocket(socket)
    })

}


export const getIo = () => {
    return io
}