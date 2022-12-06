
function checkLogin(req, db) {
    if (req.headers.cookie === undefined) {
        var randNumber = parseInt(Math.random() * 100000);
        var guestID = randNumber.toString().length < 5 ? '0' + randNumber : randNumber;
        var uuid = null;
        var userID = 'guest'+ guestID;
        var userName = '게스트'+ guestID;
        var isLogin = false;
        var msg = '로그인 실패';
    } else {
        let result = {rows: [{uid: 1, uuid: 'anyrandomvalue', userid: 'test', userpw: '$2b$10$4zQ3fB1PXKzjIlRxzJSSXux0KH4xIImmeXlc6pP06a.5VmA.D1r1C', useremail: 'test@cocoartz.kr', username: '테스트', townname: '테스트님의 홈타운', townbio: null, landtype: 'basicLand', skytype: 'basicSky', floortype: null, joineddate: 0, lastlogin: 0, isadmin: false }]}

        console.log(req.headers.cookie);
        var [, uuid] = req.headers.cookie.split('=');
        var userID = result.rows[0].userid;
        var userName = result.rows[0].username;
        var isLogin = true;
        var msg = "로그인 성공";
    }
    return {
        cookie: {
            uuid, userID, userName, isLogin, msg
        }
    };
  }
  
  module.exports.checkLogin = checkLogin;