import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { Server as HttpsServer } from 'https'


interface ConnectedUser {
  socketId: string
  userId: string
}

class SocketService {
  private io: SocketIOServer | null = null
  private connectedUsers: ConnectedUser[] = []

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Change this in production
        methods: ['GET', 'POST'],
      },
    })

    console.log('✅ Socket.IO initialized')

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔵 User connected: ${socket.id}`)

      import('../sockets').then(({ default: registerSocketEvents }) => {
        registerSocketEvents(socket)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`)
        this.connectedUsers = this.connectedUsers.filter(user => user.socketId !== socket.id)
      })
    })
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO not initialized')
    }
    return this.io
  }

  // socketService.ts
  getConnectedUserIdsInRoom(roomName: string): string[] {
    if (!this.io) return [];

    const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);
    if (!socketsInRoom) return [];

    const userIds: string[] = [];

    for (const socketId of socketsInRoom) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket?.data?.userId) {
        userIds.push(socket.data.userId.toString());
      }
    }

    return userIds;
  }

}

export default new SocketService()
