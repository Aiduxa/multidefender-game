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


app.get("/", (req, res) => {
    res.send("Labas pasauli!");
});

app.post("/api/register", async (req, res) => {
    var SHA256 = new hash.SHA256;
    let name = req.body.name;
    let password = SHA256.hex(req.body.password);
    let id;

    con = await getConnection();

    console.log(3)
    await con.query("SELECT * FROM users WHERE name = ?", [name], function(err, result, fields) {
        console.log(2);
        if (err) throw err;
        console.log(result);
        if (result.length()) {
            console.log(1);
            return res.json({"error": "userexists"});
        };
    });


    // let sql = "INSERT INTO users(name, password) VALUES (?, ?)";
    // await con.query(sql, [name, password, name], function (err, result, fields) {
    //     if (err) throw err;
    // });
    
    id = await con.query("SELECT id FROM users WHERE name = ?", [name], function (err, result, fields) {
        if (err) throw err;
        
        return result

    });
    

    let token = jwt.sign({'id': id[0][0].id, 'name': name, 'password': password, 'random-point': Math.random()}, "secret-key-multidefendergame");
    con.query("INSERT INTO session(token, user_id) VALUES (?, ?)", [token, id[0][0].id], function(err, result, fields) {
        if (err) throw err;

    })

    return res.json({"token": token, "id": id[0][0].id});
});

app.get("/api/login", (req, res) => {
    let name = req.params.name
    let password = req.params.password

    let sql = "SELECT * FROM users WHERE name = ? AND password = ?";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(result));
        return res.end();
    });

    let token = jwt.sign(data={})
});

// Authentification

app.get("/api/auth/login", (req, res) => {
    let user = req.params.user
    let sql = "SELECT name, points, elo, level, xp, statistics FROM users WHERE id = ?";
    con.query(sql, [id], function (err, result, fields) {
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