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
const multer = require('multer');
const formidable = require("formidable");
const exec = require('shelljs.exec')
// const { swaggerUi, specs } = require("./swagger/swagger");

const PORT = process.env.PORT || 5000;
const db = new sqlite3.Database("./db/account.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('account.db connected');
    }
});

const drop_db = new sqlite3.Database("./db/drop.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('drop.db connected');
    }
});

require("dotenv").config();

moment.tz.setDefault('Asia/Seoul');

logger.token('date', (req, res, tz) => {
    return moment().tz(tz).format();
})
logger.format('myformat', '[:Asia/Seoul]] ":method :url" :status :res[content-length] - :response-time ms');

// app.use(logger('common', {
//     stream: fs.createWriteStream('./log/console.log', { flags: 'a' })
// }));
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

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //file.originalname
    }
})
const upload = multer({ storage: storage })

app.get('/', function (req, res) {
    res.render("index")
});

app.all('/', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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

app.all('/login', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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

app.all('/users/me', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
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

app.all('/users/register', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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
                        // drop_db.run(`INSERT INTO drop (nfcID, dropTime, imageName) VALUES(${req.body.nfcID}, '${req.body.dropTime}', ${req.file.filename})`);
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

app.all('/products', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
});

// app.post("/products/image", function (req, res) {

// })

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

app.all('/products/:nfcid', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
});

app.post('/products/trade', function (req, res) {
    try {
        db.get(`SELECT userid FROM account WHERE name = '${jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)["name"]}'`, [], (err, rows) => {
            if (err)
                return res.status(400).json({
                    result: "sql error"
                });
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

app.all('/products/trade', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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

app.all('/closet', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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
                // for (var i = 0; i < result.length; i++) {
                //     drop_db.get(`SELECT * FROM "drop" WHERE nfcID = ${result[i][0]}`, [], (err, rows) => {
                //         if (err)
                //             return res.status(400).json({
                //                 result: "sql error"
                //             });
                //         var current_unix_time = Math.floor(new Date().getTime() / 1000);
                //         // console.log(rows);
                //         console.log(products)
                //         try {
                //             var isDrop = parseInt(rows.dropStart) <= current_unix_time && current_unix_time <= parseInt(rows.dropFinish);
                //             console.log(isDrop)
                //             if (isDrop && req.query.type == "ongoing") {
                //                 products.push({
                //                     "nfcID": result[i][0],
                //                     "brandID": Ast.to_String(result[i][1]),
                //                     "productID": Ast.to_String(result[i][2]),
                //                     "editionID": Ast.to_String(result[i][3]),
                //                     "manufactureDate": Ast.to_String(result[i][4]),
                //                     "limited": result[i][5],
                //                     "dropStart": rows.dropStart,
                //                     "dropFinish": rows.dropFinish,
                //                     "drop": true,
                //                     "ownerID": result[i][7],
                //                     "productImage": `./uploads/${result[i][0]}.png`
                //                 });
                //             }
                //             else if (!isDrop && req.query.type == "finished") {
                //                 products.push({
                //                     "nfcID": result[i][0],
                //                     "brandID": Ast.to_String(result[i][1]),
                //                     "productID": Ast.to_String(result[i][2]),
                //                     "editionID": Ast.to_String(result[i][3]),
                //                     "manufactureDate": Ast.to_String(result[i][4]),
                //                     "limited": result[i][5],
                //                     "dropStart": rows.dropStart,
                //                     "dropFinish": rows.dropFinish,
                //                     "drop": false,
                //                     "ownerID": result[i][7],
                //                     "productImage": `./uploads/${result[i][0]}.png`
                //                 });
                //             }
                //         }
                //         catch (e) { }
                //     });
                // }
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

app.all('/drops', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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

app.all('/auth/oauth/kakao', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
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

app.all('/auth/oauth/google', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
});

app.post('/upload', upload.single('userfile'), function (req, res) {
    console.log(req.file)
    if (req.file && req.body.nfcID && req.body.description && req.body.dropStart && req.body.dropFinish) {
        if (req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/png") {
            drop_db.run(`INSERT INTO "drop"(nfcID, description, dropStart, dropFinish)VALUES('${req.body.nfcID}', '${req.body.description}', '${req.body.dropStart}', '${req.body.dropFinish}')`);
            // exec(`mv ${req.file.path} ${req.file.destination}/${req.body.nfcID}.${req.file.originalname.split(".")[(req.file.originalname.split(".").length) - 1]}`, { silent: true });
            exec(`mv ${req.file.path} ${req.file.destination}/${req.body.nfcID}.png`, { silent: true });
            return res.status(200).json({
                result: `success`
            });
        }
        else
            return res.status(400).json({
                result: `not an image file`
            });
    }
    else
        return res.status(400).json({
            result: `err`
        });
});

app.all('/upload', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
});

app.get("*", function (req, res) {
    return res.status(404).json({
        message: `404 not found`
    });
});

app.all('*', (req, res, next) => {
    return res.status(405).json({
        result: "method not allowed"
    });
});

app.listen(PORT, function () {
    console.log(`Connected port ${PORT}`);
});

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/cert.pem'),
//     ca: fs.readFileSync('/etc/letsencrypt/live/d0hwq1.xyz/fullchain.pem')
// };

// const server_80 = http.createServer(app).listen(80);
// const server_443 = https.createServer(options, app).listen(443);

