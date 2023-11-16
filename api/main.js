// Atsiliepimai API
// Padarytas Aido Šalvio ir Gusto Šiurkaus

const express = require("express");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var hash = require("jshashes")


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const port = 3000;

async function getConnection() {
    var mysql = require("mysql2/promise");
    return con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "multidefender",
    });
}

async function generateSession(id, name, password) {
    let token = jwt.sign({'id': id, 'name': name, 'password': password, 'random-point': Math.random()}, "secret-key-multidefendergame");
    await con.query("INSERT INTO session(token, user_id) VALUES (?, ?)", [token, id]);
    return token;
};

app.get("/", (req, res) => {
    res.json({"version": 1.0});
});

// Authentification
app.post("/api/auth/register", async (req, res) => {
    var SHA256 = new hash.SHA256;
    let name = req.body.name;
    let password = SHA256.hex(req.body.password);
    let id;

    con = await getConnection();

    user = await con.query("SELECT * FROM users WHERE name = ?", [name], function(err, result, fields) {
        
        if (err) throw err;
            return result;
    });
    if (user[0].length) {
        return res.json({"error": "userexists"})
    }


    let sql = "INSERT INTO users(name, password) VALUES (?, ?)";
    await con.query(sql, [name, password, name], function (err, result, fields) {
        if (err) throw err;
    });
    
    id = await con.query("SELECT id FROM users WHERE name = ?", [name], function (err, result, fields) {
        if (err) throw err;
        
        return result

    });
    

    let token = await generateSession(id[0][0].id, name, password)

    return res.json({"token": token, "id": id[0][0].id});
});

app.post("/api/auth/login", async (req, res) => {
    let SHA256 = new hash.SHA256;
    let name = req.body.name;
    let password = SHA256.hex(req.body.password);

    let con = await getConnection();
    
    let user;

    let sql = "SELECT * FROM users WHERE name = ? AND password = ?";
    result = await con.query(sql, [name, password]);

    user = result[0][0];
    if (user) {
        user.password = "-";
    } else {
        return res.json({"error": "usernotfound"})
    };
    
    let token_con_result = await con.query("SELECT * FROM session WHERE user_id = ?", [user.id])

    let token_result = token_con_result[0][0];

    if (token_result) {
        token_result = token_result.token;  
    } else {
        token_result = await generateSession(user.id, user.name, password).token;
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({"user":user, "token": token_result}));
    return res.end();
    
});


app.get("/api/user/:id", async (req, res) => {
    let id = req.params.id
    let sql = "SELECT name, points, elo, level, xp, statistics FROM users WHERE id = ?";
    let con = await getConnection();
    await con.query(sql, [id], function (err, result, fields) {
        if (err) throw err;
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(result));
        return res.end();
    });
});

app.get("/api/user/:id", (req, res) => {
    let id = req.params.id
    let sql = "SELECT name, points, elo, level, xp, statistics FROM users WHERE id = ?";
    con.query(sql, [id], function (err, result, fields) {
        if (err) throw err;
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(result));
        return res.end();
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});