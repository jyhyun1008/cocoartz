// app.js

const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const server = http.createServer(app);
const cookieParser = require('cookie-parser')
const { checkLogin } = require("./module/checkLogin.js");

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

// 라우팅

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('index', { userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get('/about', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('about', { userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get('/guest', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('guest', { userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get('/land/:landID', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('land', { landID: req.params.landID, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});

app.get('/login', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('login', { userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get("/logout", function(req, res){
    console.log("clear cookie");
    // 로그아웃 쿠키 삭제
    res.clearCookie('userid');
    
    res.redirect('/login');
});

// 로그인

let result = {rows: [{userID: 'test', userPW: '1234', userName: '테스트'}]}

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser());

app.post("/login", function (req, res) {
    const id = req.body.id,
    password = req.body.password;

    if (result.rows[0].userID === id && result.rows[0].userPW === password) {
        const name = result.rows[0].userName;
        console.log("로그인 성공: "+'userid='+id+';username='+name+';login=true');
        res.setHeader('Set-Cookie', 'userid='+id);
        res.redirect('/');
    } else {
        console.log("로그인 실패");
        res.redirect('/login');
    }
});

// 소켓 io

const io = require('socket.io')(server);

let room_id = 'test';
eval("var "+room_id+"_User = {}");

//test_User = { test: {position: {x: 0}} } 같은 느낌으로 저장

io.sockets.on('connection', function(socket){
    socket.join("_room" + room_id);
    socket.on('newUserConnect', function(name, position){
        socket.name = name;
        socket.postion = position;
        eval(room_id+"_User."+name+" = {}");
        eval(room_id+"_User."+name+".position = {}");
        eval(room_id+"_User."+name+".position.x = "+position.x);
        eval(room_id+"_User."+name+".position.y = "+position.y);
        eval(room_id+"_User."+name+".position.z = "+position.z);

        io.sockets.emit('loadNewbieAvatar', {
            newbie : name,
            user : eval(room_id+"_User")
        })

        io.sockets.emit('updateMessage', {
            name : '<시스템>',
            message : name + '님이 접속했습니다.'
        });
    });

    socket.on('disconnect', function(){
        eval("delete "+room_id+"_User."+socket.name);

        io.sockets.emit('disconnectAvatar', {
            oldbie : socket.name
        })

        io.sockets.emit('updateMessage', {
            name : '<시스템>',
            message : socket.name + '님이 퇴장했습니다.'
        });
    });

    socket.on('sendMessage', function(data){
        data.name = socket.name;
        io.sockets.emit('updateMessage', data);
    });
    
    socket.on('positionChanged', function(name, position){
        io.sockets.emit('loadUserPosition', {
            name : name,
            prex : eval(room_id+"_User."+name+".position.x"),
            prey : eval(room_id+"_User."+name+".position.y"),
            prez : eval(room_id+"_User."+name+".position.z"),
            posx : position.x,
            posy : position.y,
            posz : position.z
        })
        eval(room_id+"_User."+name+".position.x = "+position.x);
        eval(room_id+"_User."+name+".position.y = "+position.y);
        eval(room_id+"_User."+name+".position.z = "+position.z);
    })
});

server.listen(8080, function(){
    console.log('포트 8080에서 서버 실행중...');
});