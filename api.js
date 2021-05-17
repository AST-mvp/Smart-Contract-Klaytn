const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const sqlite3 = require("sqlite3");
const { PythonShell } = require("python-shell");
const fs = require('fs');
const sha256 = require("sha256");
const request = require("request");
const db = new sqlite3.Database("./db/account.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('account.db connected');
    }
});
const logger = require("morgan");
const Ast = require("./Ast_caver");
const { json } = require("body-parser");

require("dotenv").config();
app.use(logger("short"));

const PORT = process.env.PORT || 5002;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());

app.get('/', function (req, res) {
    return res.status(200).json({
        message: "hello world!"
    });
});

app.post('/login', function (req, res) {
    const sql = `SELECT pw FROM account WHERE name = '${req.body.id}'`;
    db.get(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({
                result: "sql error"
            });
        }
        else {
            console.log(rows)
            try {
                if (rows.pw === sha256(req.body.pw)) {
                    let token = jwt.sign({ name: req.body.id }, process.env.JWT_SECRET);
                    return res.status(200).json({
                        result: "success",
                        access_token: token
                    })
                }
                else {
                    return res.status(404).json({
                        result: `invalid id`
                    })
                }
            }
            catch (e) {
                return res.status(400).json({
                    result: `err`
                })
            }
        }
    });
});

app.get('/login', function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"])
            return res.status(200).json({
                result: true
            });
    }
    catch (e) {
        return res.status(200).json({
            result: false
        })
    }
});

app.get('/users/me', function (req, res) {
    try {
        var user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"];
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
    const sql = `SELECT userid FROM account WHERE name = '${user}'`;
    db.get(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({
                result: "sql error"
            });
        }
        else {
            try {
                if (rows.userid) {
                    return res.status(200).json({
                        username: user,
                        userID: rows.userid
                    })
                }
                else {
                    return res.status(404).json({
                        result: "invalid token"
                    })
                }
            }
            catch (e) {
                console.log("invalid user");
            }
        }
    });
});

// app.post('/users/add', function (req, res) {
//     let userid_hash = sha256(req.body.id + process.env.JWT_SECRET);
//     try {
//         var user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"];
//         if (user !== "admin") // token 이 admin 권한이 아닐때
//             return res.status(403).json({
//                 result: "admin required"
//             })
//     }
//     catch (e) { // authorization header 가 없을때 
//         return res.status(401).json({
//             result: "login required"
//         })
//     }
//     try {
//         const sql = `SELECT EXISTS (select * from account where name = '${req.body.id}') as success;"`;
//         db.get(sql, [], (err, rows) => {
//             if (err) {
//                 console.log(err)
//                 return res.status(400).json({
//                     result: "sql error"
//                 });
//             }
//             else {
//                 if (rows.success) { // 이미 해당 user가 존재할 경우
//                     return res.status(400).json({
//                         result: "user already exists"
//                     })
//                 }
//                 db.run(`INSERT INTO account(name, pw, userid)VALUES('${req.body.id}', '${sha256(req.body.pw)}', '${String(userid_hash)}')`);
//                 return res.status(200).json({
//                     result: "success"
//                 })
//             }
//         });
//     }
//     catch (e) { // post data가 잘못되었을때
//         return res.status(400).json({
//             result: "err"
//         })
//     }
// });

app.get('/products', function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"] === "admin") {
            Ast.allProductInfo().then(result => {
                return res.status(200).json({
                    result
                })
            })
        }
        else
            return res.status(403).json({
                result: "admin required"
            })
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            result: "login required"
        })
    }
});

app.post("/products", function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"] === "admin") {
            Ast.registerProductInfo(req.body.nfcID, req.body.brandID, req.body.productID, req.body.editionID, req.body.manufactureDate, req.body.limited, req.body.ownerID).then(result => {
                if (result)
                    return res.status(200).json({
                        result: "success"
                    })
                else
                    return res.status(400).json({
                        result: "nfcID already exists"
                    })
            });
        }
        else
            return res.status(403).json({
                result: "admin required"
            })
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
});

app.get('/products/:nfcid', function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]) {
            Ast.allProductInfo().then(result => {
                for (var i = 0; i < result.length; i++) {
                    if (result[i][0] == req.params.nfcid) {
                        return res.status(200).json({
                            result: result[i]
                        });
                    }
                }
                return res.status(404).json({
                    result: "invalid nfcID"
                });
            })
        }
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
});

app.post('/products/trade', function (req, res) {
    try {
        db.get(`SELECT userid FROM account WHERE name = '${jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]}'`, [], (err, rows) => {
            if (err) {
                return res.status(400).json({
                    result: "sql error"
                });
            }
            else {
                if (rows.userid) {
                    var userID = rows.userid;
                    try {
                        db.get(`SELECT EXISTS (SELECT * FROM account WHERE userid = '${rows.userid}') as success`, [], (err, rows) => {
                            if (err)
                                return res.status(400).json({
                                    result: "sql error1"
                                });
                            else {
                                if (!rows.success)
                                    return res.status(404).json({
                                        result: "userID not exists"
                                    })
                                else {
                                    try {
                                        Ast.nfcIDcheck(req.body.nfcID).then(result => {
                                            if (result)
                                                return res.status(400).json({
                                                    result: "nfcID not exists"
                                                })
                                            else {
                                                if (req.body.userID === userID) {
                                                    return res.status(400).json({
                                                        result: "can't change ownership to me"
                                                    })
                                                }
                                                else {
                                                    Ast.changeOwnership(req.body.nfcID, req.body.userID).then(result => {
                                                        if (result)
                                                            return res.status(200).json({
                                                                result: "success"
                                                            })
                                                        else
                                                            return res.status(400).json({
                                                                result: "failed"
                                                            })
                                                    })
                                                }
                                            }
                                        });
                                    }
                                    catch (e) {
                                        return res.status(400).json({
                                            result: "err"
                                        })
                                    }
                                }
                            }
                        });
                    }
                    catch (e) {
                        return res.status(400).json({
                            result: "err"
                        })
                    }
                }
            }
        });
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
});

app.get('/closet', function (req, res) {
    try {
        let user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]
        const sql = `SELECT userid FROM account WHERE name = '${user}'`;
        db.get(sql, [], (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(400).json({
                    result: "sql error"
                });
            }
            else {
                try {
                    if (rows.userid) {
                        Ast.allProductInfo().then(result => {
                            var arr = new Array();
                            for (var i = 0; i < result.length; i++) {
                                if (rows.userid == result[i][6]) {
                                    console.log(rows.userid, result[i]);
                                    arr.push(result[i]);
                                }
                            }
                            return res.status(200).json({
                                result: arr
                            })
                        });
                    }
                    else {
                        return res.status(404).json({
                            result: "invalid user"
                        })
                    }
                }
                catch (e) {
                    console.log("invalid user")
                }
            }
        });

    }
    catch (e) {
        return res.status(401).json({
            message: "login required"
        });
    }

});

app.post('/auth/oauth/kakao', function (req, res) {
    try {
        let access_token = req.body.accessToken;
        let options = {
            uri: "https://kapi.kakao.com/v2/user/me",
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`
            },
            json: true
        };
        request.post(options, function (err, response, body) {
            console.log(body);
            return res.status(200).json({
                result: "success",
                token: jwt.sign({ id: body.id, type: "kakao" }, process.env.JWT_SECRET)
            });
        })
    }
    catch (e) {
        return res.status(400).json({
            result: "err"
        });
    }
});

app.post('/auth/oauth/google', function (req, res) {
    try {
        let access_token = req.body.accessToken;
        let options = {
            uri: "https://www.googleapis.com/oauth2/v3/tokeninfo",
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`
            },
            json: true
        };
        request.post(options, function (err, response, body) {
            console.log(body);
            return res.status(200).json({
                result: "success",
                token: jwt.sign({ id: body.sub, type: "google" }, process.env.JWT_SECRET)
            });
        })
    }
    catch (e) {
        return res.status(400).json({
            result: "err"
        });
    }
});

app.listen(PORT, function () {
    console.log(`Connected port ${PORT}`);
});