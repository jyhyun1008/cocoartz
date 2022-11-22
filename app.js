// app.js

const express = require('express');
const http = require('http');
const app = express();
const fs = require('fs');

// Helper function 
function readAndServe(path, res)   
{
    fs.readFile(path,function(err, data)
    {
        //console.log(data);
        // res.setHeader('Content-Type', 'text/html');
        res.end(data);
    })
}

const server = http.createServer((req, res) => {  
  const url = req.url;
  const method = req.method;
  
  /* Serving static files on specific Routes */
  if(url === "/") {
    readAndServe("./views/index.html",res) 
  } else if(url === "/about") {
    readAndServe("./views/about.html",res) 
  } else if(url === "/login") {
    readAndServe("./views/login.html",res) 
  } else if(url === "/guest") {
    readAndServe("./views/guest.html",res) 
  } else if(url.startsWith("/views") == true) {
    readAndServe("."+url, res)
    //path 이름이 /views로 시작하는 url을 받았을 경우 그 url을 그대로 읽어서 serve해준다.
  } else {
    res.end("Path not found"); 
      /* All paths other than / and /about will send an error as 
      a response */
  }
});

const io = require('socket.io')(server);

let room_id = 111;

io.sockets.on('connection', function(socket){
    socket.join("_room" + room_id);
    socket.on('newUserConnect', function(name){
        socket.name = name;
        let members = io.sockets.adapter.rooms.get('_room'+room_id).size;
        //console.log(members);

        io.sockets.emit('updateMessage', {
            name : '<시스템>',
            message : name + '님이 접속했습니다.',
            members: members
        });

    });

    socket.on('disconnect', function(){

        if (io.sockets.adapter.rooms.get('_room'+room_id) !== undefined){
            socket.members = io.sockets.adapter.rooms.get('_room'+room_id).size;
            //console.log(socket.members);
        } else {
            socket.members = 0;
        }

        io.sockets.emit('updateMessage', {
            name : '<시스템>',
            message : socket.name + '님이 퇴장했습니다.',
            members : socket.members
        });

    });

    socket.on('sendMessage', function(data){
        data.name = socket.name;
        io.sockets.emit('updateMessage', data);
    });
});

server.listen(8080, function(){
    console.log('포트 8080에서 서버 실행중...');
});