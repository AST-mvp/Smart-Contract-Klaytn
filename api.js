const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const sqlite3 = require("sqlite3");
//const { PythonShell } = require("python-shell");
const fs = require('fs');
const sha256 = require("sha256");
const request = require("request");
const https = require("https");
const http = require("http");
// const log_saver = require('./config/winston');
const logger = require("morgan");
const Ast = require("./Ast_caver");
const { json } = require("body-parser");
const moment = require("moment-timezone")
// const { swaggerUi, specs } = require("./swagger/swagger");

const PORT = process.env.PORT || 80;
const db = new sqlite3.Database("./db/account.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('account.db connected');
    }
});

require("dotenv").config();

moment.tz.setDefault('Asia/Seoul');

logger.token('date', (req, res, tz) => {
    return moment().tz(tz).format();
})
logger.format('myformat', '[:Asia/Seoul]] ":method :url" :status :res[content-length] - :response-time ms');

app.use(logger('common', {
    stream: fs.createWriteStream('./log/console.log', { flags: 'a' })
}));
app.use(logger('dev'));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());

app.get('/', function (req, res) {
    res.render("index")
});

app.post('/login', function (req, res) {
    const sql = `SELECT pw FROM account WHERE name = '${req.body.id}'`;
    db.get(sql, [], (err, rows) => {
        if (err)
            return res.status(400).json({
                result: "sql error"
            });
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
                else
                    return res.status(404).json({
                        result: "invalid id"
                    })
            }
            catch (e) {
                return res.status(400).json({
                    result: "err"
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
    const sql = `SELECT * FROM account WHERE name = '${user}'`;
    db.get(sql, [], (err, rows) => {
        if (err)
            return res.status(400).json({
                result: "sql error"
            });
        else {
            try {
                if (rows.userid)
                    return res.status(200).json({
                        username: user,
                        userID: rows.userid,
                        isAdmin: rows.isAdmin
                    })
                else
                    return res.status(404).json({
                        result: "invalid token"
                    })
            }
            catch (e) {
                console.log("invalid user");
            }
        }
    });
});

app.post('/users/register', function (req, res) {
    try {
        var user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"];
        db.get(`SELECT isAdmin FROM account WHERE name = '${user}'`, [], (err, rows) => {
            if (err)
                return res.status(400).json({
                    result: "sql error"
                });
            if (rows.isAdmin) {
                try {
                    const sql = `SELECT EXISTS (select * from account where name = '${req.body.id}') as success;`;
                    db.get(sql, [], (err, rows2) => {
                        if (err) {
                            console.log(err)
                            return res.status(400).json({
                                result: "sql error"
                            });
                        }
                        else {
                            if (rows2.success)
                                return res.status(400).json({
                                    result: "user already exists"
                                })
                            var rand = Math.floor(Math.random() * (9999 - 2010) + 2010);
                            db.run(`INSERT INTO account(name, pw, userid, isAdmin)VALUES('${req.body.id}', '${sha256(req.body.pw)}', '${rand}', ${req.body.isAdmin})`);
                            return res.status(200).json({
                                result: "success"
                            })
                        }
                    });
                }
                catch (e) {
                    return res.status(400).json({
                        result: "err"
                    })
                }
            }
            else
                return res.status(403).json({
                    result: "admin required"
                })
        });
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
});

app.get('/products', function (req, res) {
    try {
        var user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"];
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
    db.get(`SELECT isAdmin FROM account WHERE "name" = '${user}'`, [], (err, rows) => {
        if (err)
            return res.status(400).json({
                result: "sql error"
            });
        if (rows.isAdmin)
            Ast.allProductInfo().then(result => {
                var products = new Array;
                for (i = 0; i < result.length; i++) {
                    products.push({
                        "nfcID": result[i][0],
                        "brandID": Ast.to_String(result[i][1]),
                        "productID": Ast.to_String(result[i][2]),
                        "editionID": Ast.to_String(result[i][3]),
                        "manufactureDate": Ast.to_String(result[i][4]),
                        "limited": result[i][5],
                        "drop": result[i][6],
                        "ownerID": result[i][7]
                    });
                }
                return res.status(200).json({
                    products
                })
            })
        else
            return res.status(403).json({
                result: "admin required"
            })
    });
});

app.post("/products", function (req, res) {
    try {
        var user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"];
    }
    catch (e) {
        return res.status(401).json({
            result: "login required"
        })
    }
    db.get(`SELECT isAdmin FROM account WHERE "name" = '${user}'`, [], (err, rows) => {
        if (err)
            return res.status(400).json({
                result: "sql error"
            });
        if (rows.isAdmin) {
            if (req.body.brandID && req.body.productID && req.body.editionID) {
                db.get(`SELECT seq FROM sqlite_sequence WHERE name = 'product'`, [], (err, rows) => {
                    if (err) {
                        console.log(err)
                        return res.status(400).json({
                            result: "sql error"
                        });
                    }
                    else {
                        db.run(`INSERT INTO product(brandname, productname, editionname)VALUES('${req.body.brandID}', '${req.body.productID}', '${req.body.editionID}')`);
                        Ast.registerProductInfo(req.body.nfcID, req.body.brandID, req.body.productID, req.body.editionID, req.body.manufactureDate, req.body.limited, req.body.drop, req.body.ownerID).then(result => {
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
                });
            }
            else
                return res.status(400).json({
                    result: "err"
                })
        }
        else
            return res.status(403).json({
                result: "admin required"
            })
    });
});

app.get('/products/:nfcid', function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]) {
            Ast.allProductInfo().then(result => {
                for (var i = 0; i < result.length; i++)
                    if (result[i][0] == req.params.nfcid)
                        return res.status(200).json({
                            products: {
                                "nfcID": result[i][0],
                                "brandID": Ast.to_String(result[i][1]),
                                "productID": Ast.to_String(result[i][2]),
                                "editionID": Ast.to_String(result[i][3]),
                                "manufactureDate": Ast.to_String(result[i][4]),
                                "limited": result[i][5],
                                "drop": result[i][6],
                                "ownerID": result[i][7]
                            }
                        });
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
                                                if (req.body.userID === userID)
                                                    return res.status(400).json({
                                                        result: "can't change ownership to me"
                                                    })
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
                            var products = new Array();
                            for (var i = 0; i < result.length; i++) {
                                if (rows.userid == result[i][7]) {
                                    console.log(rows.userid, result[i]);
                                    products.push({
                                        "nfcID": result[i][0],
                                        "brandID": Ast.to_String(result[i][1]),
                                        "productID": Ast.to_String(result[i][2]),
                                        "editionID": Ast.to_String(result[i][3]),
                                        "manufactureDate": Ast.to_String(result[i][4]),
                                        "limited": result[i][5],
                                        "drop": result[i][6],
                                        "ownerID": result[i][7]
                                    });
                                }
                            }
                            return res.status(200).json({
                                products: products
                            })
                        });
                    }
                    else
                        return res.status(404).json({
                            result: "invalid user"
                        })
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

app.get('/drops', function (req, res) {
    try {
        if (jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]) {
            Ast.allProductInfo().then(result => {
                var products = new Array();
                if (!(req.query.type))
                    return res.status(404).json({
                        result: "no type query"
                    })
                for (var i = 0; i < result.length; i++) {
                    //try {
                    if (result[i][6] && req.query.type == "ongoing")
                        products.push({
                            "nfcID": result[i][0],
                            "brandID": Ast.to_String(result[i][1]),
                            "productID": Ast.to_String(result[i][2]),
                            "editionID": Ast.to_String(result[i][3]),
                            "manufactureDate": Ast.to_String(result[i][4]),
                            "limited": result[i][5],
                            "drop": result[i][6],
                            "ownerID": result[i][7]
                        });
                    else if (!(result[i][6]) && req.query.type == "finished")
                        products.push({
                            "nfcID": result[i][0],
                            "brandID": Ast.to_String(result[i][1]),
                            "productID": Ast.to_String(result[i][2]),
                            "editionID": Ast.to_String(result[i][3]),
                            "manufactureDate": Ast.to_String(result[i][4]),
                            "limited": result[i][5],
                            "drop": result[i][6],
                            "ownerID": result[i][7]
                        });
                    //}
                    // catch (e) {
                    //     products.push({
                    //         "nfcID": result[i][0],
                    //         "brandID": result[i][1],
                    //         "productID": result[i][2],
                    //         "editionID": result[i][3],
                    //         "manufactureDate": result[i][4],
                    //         "limited": result[i][5],
                    //         "drop": 0,
                    //         "ownerID": result[i][7]
                    //     });
                    // }
                }
                return res.status(200).json({
                    products: products
                })
            });
        }
        else
            return res.status(404).json({
                result: "invalid user"
            })
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

app.get("*", function (req, res) {
    return res.status(404).json({
        message: `404 not found`
    });
});

// app.listen(PORT, function () {
//     console.log(`Connected port ${PORT}`);
// });

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/fullchain.pem')
};

const server_80 = http.createServer(app).listen(80);
const server_443 = https.createServer(options, app).listen(443);