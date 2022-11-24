
function checkLogin(req, db) {
    if (req.headers.cookie === undefined) {
        var randNumber = parseInt(Math.random() * 100000);
        var guestID = randNumber.toString().length < 5 ? '0' + randNumber : randNumber;
        var userID = 'guest'+ guestID;
        var userName = '게스트'+ guestID;
        var isLogin = false;
        var msg = '로그인 실패';
    } else {
        let result = {rows: [{userID: 'test', userPW: '1234', userName: '테스트'}]}

        console.log(req.headers.cookie);
        var [, userID] = req.headers.cookie.split('=');
        var userName = result.rows[0].userName;
        var isLogin = true;
        var msg = "로그인 성공";
    }
    return {
        cookie: {
            userID, userName, isLogin, msg
        }
    };
  }
  
  module.exports.checkLogin = checkLogin;