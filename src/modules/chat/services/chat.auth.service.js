import { socketConnections } from "../../../DB/model/User.model.js";
import { authenticationSocket } from "../../../middlewares/auth.socket.middleware.js";



export const connectSocket = async (socket) => {
    const { data } = await authenticationSocket({ socket })
    if (!data.valid) {
        return socket.emit("socketErrorResponse", data)
    }
    console.log("Sockect connected");
    socketConnections.set(data.user._id.toString(), socket.id)

    console.log(socketConnections);

    return "Done"
}

export const disconnectSocket = async (socket) => {
    return socket.on("disconnect", async () => {
        console.log("Socket disconnected");

        const { data } = await authenticationSocket({ socket })
        if (!data.valid) {
            return socket.emit("socketErrorResponse", data)
        }
        socketConnections.delete(data.user._id.toString(), socket.id)
        console.log(socketConnections);
        return "Done"
    })
}