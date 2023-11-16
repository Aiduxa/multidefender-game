// Atsiliepimai API
// Padarytas Aido Šalvio ir Gusto Šiurkaus

const express = require("express");
const bodyParser = require("body-parser");
var mysql = require("mysql");
var jwt = require("jwt");


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const port = 3000;

var con = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "",
});

con.connect(function (err) {
    if (err) throw err;
});

app.get("/", (req, res) => {
    res.send("Labas pasauli!");
});

app.get("/api/login", (req, res) => {
    let name = req.params.name
    let password = req.params.password

    let sql = "SELECT * FROM users WHERE name = ? AND password = ?";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        
        
    });

    

    res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(result));
        return res.end();
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