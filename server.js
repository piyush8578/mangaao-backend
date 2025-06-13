const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const users = {}; // userId: socketId

io.on('connection', (socket) => {
  console.log("Connected:", socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('call-user', ({ offer, to, socket: fromSocket }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit('call-made', { offer, socket: fromSocket });
    }
  });

  socket.on('answer-call', ({ answer, to }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit('call-answered', { answer });
    }
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit('ice-candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
    console.log("Disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server listening on port 5000");
});