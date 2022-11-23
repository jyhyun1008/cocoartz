// app.js

const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/login', function (req, res) {
    res.render('login');
});
  
app.get('/guest', function (req, res) {
    res.render('guest');
});

app.get('/land/:userID', function (req, res) {
    console.log(req.params.userID);
    res.render('land', {userID: req.params.userID});
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