// app.js 실행 명령어: sudo forever start app.js
// 리스트 확인 명령어: sudo forever list
// app.js 스톱 명령어: sudo forever stop 0

// app.js

const express = require('express');
const http = require('http');
const https = require('https');
const app = express();
const path = require('path');
const server = http.createServer(app);
const fs = require('fs');

const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { checkLogin } = require("./module/checkLogin.js");
const { getSunrise, getSunset } = require('sunrise-sunset-js');

const pjson = require('./package.json');
const os = require("os");

// https cert

const options = {
    key: fs.readFileSync('./cocoartz.kr.key'),
    cert: fs.readFileSync('./cocoartz.kr.pem')
  };

const httpsServer = https.createServer(options, app);

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
    return new Promise(function (resolve, reject){
        db
        .query(query)
        .then((res) => {
            if (res.rows && res.rows[0]) {
                resolve(res.rows);
            } else {
                resolve( true );
            }
        })
        .catch((e) => reject(Error(e.stack)));
    })
}

// 라우팅

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('index', { uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get('/about', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    res.render('about', { uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
function mod(n, m) {
    return ((n % m) + m) % m;
  }

app.get('/town/:townID', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    var sunrise = mod(new Date(getSunrise(36.3, 127.4)).getTime()+32400000, 86400000);
    var sunset = mod(new Date(getSunset(36.3, 127.4)).getTime()+32400000, 86400000);
    var today = mod(new Date().getTime()+32400000, 86400000);
    res.render('town', { townID: req.params.townID, sunrise: sunrise, sunset: sunset, uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});

app.get('/login', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    console.log(cookie);
    res.render('login', { uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin, msg: cookie.msg});
});
app.get("/logout", function(req, res){
    console.log("clear cookie");
    // 로그아웃 쿠키 삭제
    res.clearCookie('uuid');
    res.redirect('/login');
});

// 설치, 관리와 관련된 리다이렉트

var version = pjson.version; 
var host = os.hostname();

app.get("/install", function(req, res) {
    const installQuery = fs.readFileSync("./db/installQuery.sql").toString();
    dbQuery(installQuery)
    .then(function(result1) {
        if ( result1 ){
            dbQuery(`SELECT * FROM users WHERE true;`)
            .then(function(result2) {
                if ( result2.length ){
                    res.redirect('/admin');
                } else {
                    cookie = checkLogin(req, db).cookie;
                    if (cookie.uuid){
                        res.send('뭔가 이상하네요. <a href="/logout">로그아웃</a> 해 보시겠어요?');
                    } else {
                        res.render('install', { isLogin: false, adminExists: false });
                    }
                }
            })
            .catch(e => {
                res.send('뭔가 문제가 생긴 것 같아요.');
            })
        } else {
            res.send('설치에 문제가 생긴 것 같아요.');
        }
    })
    .catch(e => {
        res.send('설치에 문제가 생긴 것 같아요.');
    })
})

app.get('/admin', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    if (!cookie.isLogin) {
        dbQuery(`SELECT * FROM users WHERE true;`)
        .then(function(userRows) {
            if ( userRows.length ){
                res.render('admin', { uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: cookie.isLogin });
            } else {
                res.redirect('/install');
            }
        });
    } else {
        dbQuery(`SELECT isadmin FROM users WHERE uuid = '`+cookie.uuid+`';`)
        .then(function(user) {
            if (user[0].isadmin){
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
            }
        });
    }
});

app.get('/dashboard', function (req, res) {
    cookie = checkLogin(req, db).cookie;
    if (!cookie.uuid) {
        dbQuery(`SELECT * FROM users WHERE true;`)
        .then(function(userRows) {
            if ( userRows.length ){
                res.redirect('/admin');
            } else {
                res.redirect('/install');
            }
        });
    } else {
        dbQuery(`SELECT isadmin FROM users WHERE uuid = '`+cookie.uuid+`';`)
        .then(function(user) {
            if (user[0].isadmin){
                res.render('dashboard', { uuid: cookie.uuid, userID: cookie.userID, userName: cookie.userName, isLogin: true, version: version, host: host });
            } else {
                res.redirect('/');
            }
        });
    }
});

// 회원가입

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser());

const joinSQL = async (userid, encryptedpw, useremail, isadmin) => {
    dbQuery(`INSERT INTO users (userid, userpw, useremail, username, townname, isadmin) VALUES ('`+userid+`', '`+encryptedpw+`', '`+useremail+`', '`+userid+`', '`+userid+` 님의 홈타운', `+isadmin+`);`). then(function(result1){
        if (result1){
            dbQuery(`SELECT uuid FROM users WHERE userid = '`+userid+`';`).then(function(result2){
                if (result2.length){
                    const uuid = result2[0].uuid;
                    dbQuery(`INSERT INTO usersavatar (uuid) VALUES ('`+uuid+`');`+
                    `INSERT INTO itemownedavatar (owneruuid, itemtype, itemid, isonavatar) VALUES ('`+uuid+`', 'skin', 'basicSkin', true), ('`+uuid+`', 'hair', 'basicHair', true), ('`+uuid+`', 'top', 'basicTop', true), ('`+uuid+`', 'bottom', 'basicPants', true), ('`+uuid+`', 'shoes', 'basicShoes', true);`).then(function(result3){
                        if ( result3 ){
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .catch(e => {
                        return false;
                    })
                }
            })
            .catch(e => {
                return false;
            })
        } else {
            return false;
        }
    })
    .catch(e => {
        return false;
    })
}


app.post("/install", function (req, res) {
    const email = req.body.email,
    id = req.body.id,
    password = req.body.password,
    isAdmin = true;
    const encryptedPw = bcrypt.hashSync(password, 10);

    if (joinSQL(id, encryptedPw, email, isAdmin)) {

        const getUuid = async (userid) => {
            dbQuery(`SELECT uuid FROM users WHERE userid = '`+userid+`';`).then(function(result){
                if (result.length){
                    console.log(result[0].uuid);
                    res.setHeader('Set-Cookie', 'uuid='+result[0].uuid);
                    res.redirect('/dashboard');
                    //return true;
                } else{
                    res.redirect('/install');
                    return false;
                }
            })
            .catch(e => {
                res.redirect('/install');
                return false;
            })
        }
        
        console.log("계정 생성됨: "+'userid='+id+';username='+id+';login=true');
        getUuid(id);
        
    } else {
        console.log("계정 생성되지 않음.");
        res.redirect('/install');
    }
})

// 로그인



//let result = {rows: [{uid: 1, uuid: 'anyrandomvalue', userid: 'test', userpw: '$2b$10$4zQ3fB1PXKzjIlRxzJSSXux0KH4xIImmeXlc6pP06a.5VmA.D1r1C', useremail: 'test@cocoartz.kr', username: '테스트', townname: '테스트님의 홈타운', townbio: null, landtype: 'basicLand', skytype: 'basicSky', floortype: null, joineddate: 0, lastlogin: 0, isadmin: false }]}

app.post("/login", function (req, res) {
    const id = req.body.id,
    password = req.body.password;

    const loginSQL = async (userid) => {
        dbQuery(`SELECT * FROM users WHERE userid = '`+userid+`';`).then(function(result){
            if (result.length){
                if (result[0].userid === id && bcrypt.compareSync(password, result[0].userpw)) {
                    const name = result[0].username;
                    const uuid = result[0].uuid;
                    console.log("로그인 성공: "+'userid='+id+';username='+name+';login=true');
                    res.setHeader('Set-Cookie', 'uuid='+uuid);
                    res.redirect('/');
                } else {
                    console.log("로그인 실패");
                    res.redirect('/login');
                    return false;
                }
                return result[0];
            } else {
                console.log("로그인 실패");
                res.redirect('/login');
                return false;
            }
        }).catch(e => {
            console.log("로그인 실패");
            res.redirect('/login');
            return false;
        })
    }

    loginSQL(id);
    
});

// 소켓 io

const io = require('socket.io')(httpsServer, { cors: { origin: "*", methods: ["GET", "POST"]}, maxHttpBufferSize: 1e8 });

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
        eval(room_id+"_User."+name+".position.dir = "+position.dir);

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

    socket.on('mineCraft', function(name){
        io.sockets.emit('updateMessage', {
            name : '<시스템>',
            message : name + '님이 높은 곳에서 떨어졌습니다.'
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
            predir : eval(room_id+"_User."+name+".position.dir"),
            posx : position.x,
            posy : position.y,
            posz : position.z,
            posdir : position.dir
        })
        eval(room_id+"_User."+name+".position.x = "+position.x);
        eval(room_id+"_User."+name+".position.y = "+position.y);
        eval(room_id+"_User."+name+".position.z = "+position.z);
        eval(room_id+"_User."+name+".position.dir = "+position.dir);
    })
});

server.listen(8080, function(){
    console.log('포트 8080에서 서버 실행중...');
});

httpsServer.listen(8443, function(){
    console.log('포트 8443에서 서버 실행중...');
});

