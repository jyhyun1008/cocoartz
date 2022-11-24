
function checkLogin(req) {
    if (req.headers.cookie === undefined) {
        var userID = 'guest';
        var isLogin = false;
        var msg = '로그인 실패';
    } else {
        var [, userID] = req.headers.cookie.split('=');
        var isLogin = true;
        var msg = "로그인 성공";
    }
    return {
        cookie: {
            userID,
            isLogin,
            msg
        }
    };
  }
  
  module.exports.checkLogin = checkLogin;