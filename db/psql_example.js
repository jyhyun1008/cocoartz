module.exports = (function () {
    return {
        local: {
            user: "postgres",
            host: "localhost",
            database: "postgres",
            password: "examplepassword",
            port: 5432
        }
    }
})();

// 이 파일을 복사해서 psql.js를 만들고 수정해주세요.

// 코코아츠는 postgresql을 사용하며, 따로 설치하는 것을 권장합니다. 
// 따로 설치했다면 password만 바꿔주면 될 것입니다.