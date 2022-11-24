// app.js

const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const server = http.createServer(app);
const cookieParser = require('cookie-parser')
const { checkLogin } = require("./module/checkLogin.js");

// 라우팅

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('index', { userID: checkLogin(req).cookie.userID, isLogin: checkLogin(req).cookie.isLogin, msg: checkLogin(req).cookie.msg});
});
app.get('/about', function (req, res) {
    res.render('about');
});
app.get('/login', function (req, res) {
    res.render('login');
});
app.get("/logout", function(req, res){
    console.log("clear cookie");
    // 로그아웃 쿠키 삭제
    res.clearCookie('userid');
    res.clearCookie('login');
    
    res.redirect('/login');
});
app.get('/guest', function (req, res) {
    res.render('guest');
});
app.get('/land/:landID', function (req, res) {
    console.log(req.params.landID);
    res.render('land', {landID: req.params.landID});
});

// DB 연결부

const { Client } = require("pg");
const config = require("./db/psql.js").local;

const db = new Client({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});
db.connect();

if ( db.user == config.user ) {
    console.log('데이터베이스에 잘 연결되었습니다!');
}

function dbQuery(query) {
    db
    .query(query)
    .then((res) => {
        console.log(res.rows[0]);
        db.end();
    })
    .catch((e) => console.error(e.stack));
}

// 로그인

let result = {rows: [{userID: 'test', userPW: '1234', userName: '테스트'}]}

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser());

app.post("/login_cookie", function (req, res) {
    const id = req.body.id,
    password = req.body.password;

    if (result.rows[0].userID === id && result.rows[0].userPW === password) {
        console.log("로그인 성공");
        res.setHeader('Set-Cookie', 'userid='+id+';');
        res.redirect('/');
    } else {
        console.log("로그인 실패");
        res.redirect('/login');
    }
});

// 소켓 io

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