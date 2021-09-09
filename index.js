const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let userList = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.join('Living Room');

  socket.on('addToUsers', (obj) => {
    userList.push({user:obj.user, room:obj.room, id: socket.id});
    console.log('userList', userList);
    io.emit('addToUsers', userList);
  });

  console.log('Connected sockets', io.sockets.adapter.rooms);
  socket.on('chat message', (obj) => {
    io.to(obj.room).emit('chat message', obj.msg);
  });

  socket.on('goToRoom', (obj) => {
    socket.leave(obj.previousRoom);
    socket.join(obj.room);
    console.log('Room list', socket.rooms);
    console.log('Connected sockets', io.sockets.adapter.rooms);
    io.emit('goToRoom', obj.room);
  });

  socket.on('changeNickname', (obj) => {
    userList = userList.filter(user => user.id !== socket.id);
    userList.push({user: obj.user, room:obj.room, id:socket.id});
    io.emit('addToUsers', userList);
  })

  socket.on('serverMessage', (obj) => {
    io.to(Array.from(socket.rooms)[0]).emit('serverMessage', obj.msg);
  });

  socket.on('disconnect', () => {
    userList = userList.filter(user => user.id !== socket.id);
    io.emit('addToUsers', userList);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
