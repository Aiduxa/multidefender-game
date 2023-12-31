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
    await con.query("INSERT INTO session(token, id) VALUES (?, ?)", [token, id]);
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
    
    await con.query("INSERT INTO friends(id) VALUES (?)", [id[0][0].id])

    let token = await generateSession(id[0][0].id, name, password)
    
    await con.query("INSERT INTO session(token, id) VALUES (?, ?)" [token, id[0][0].id])

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
    
    let token_con_result = await con.query("SELECT * FROM session WHERE id = ?", [user.id])

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
    let result = await con.query(sql, [id], function (err, result, fields) {
        if (err) throw err;
        
    });
    var user = result[0][0]
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(user));
    return res.end();
});

app.get("/api/friends/get", async (req, res) => {
    let token = req.body.token;

    let con = await getConnection();

    let result = await con.query("SELECT * FROM session WHERE token = ?", [token]);

    let user_id = result[0][0];
    

    if (user_id) {

        result = await con.query("SELECT * FROM users WHERE id = ?", [user_id.id])
    
        let user = result[0][0];
    
        if (user) {
            result = await con.query("SELECT * FROM friends WHERE id = ?", [user.id])

            let friends = result[0][0];

            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(friends));
            return res.end()

            
        } else {
            return res.json({"error": "usernotfound"})
        }

    } else {
        return res.json({"error": "sessionnotfound"})
    }


});

app.post("/api/friends/add/:id", async (req, res) => {
    let id = req.params.id
    let token = req.body.token

    let con = await getConnection();

    let result = await con.query("SELECT * FROM friends WHERE id = ?", [id])

    let player = result[0][0];

    if (player) {

        result = await con.query("SELECT * FROM session WHERE token = ?", [token])

        let usersession = result[0][0];

        if (usersession.id == id) {
            return res.json( {"error": "cannotaddurselfdummy"})
        }

        let userfriends = await con.query("SELECT * FROM friends WHERE id = ?", [usersession.id])

        userfriends = userfriends[0][0]

        userfriends.friends = JSON.parse(userfriends.friends);
        player.friends = JSON.parse(player.friends);
        userfriends.requests = JSON.parse(userfriends.requests);

        if (String(player.id) in userfriends.requests) {
            delete userfriends[player.id];

            let date = new Date();

            userfriends.friends[player.id] = date.getTime();
            player.friends[userfriends.id] = date.getTime();

            await con.query("UPDATE friends SET friends = ?, requests = ? WHERE id = ?", [JSON.stringify(userfriends.friends), JSON.stringify(userfriends.requests), userfriends.id]);

            await con.query("UPDATE friends SET friends = ? WHERE id = ?", [JSON.stringify(player.friends), player.id])

            return res.json( {"status": "addedfriend"} )
        } else if (String(userfriends.id) in JSON.parse(player.requests)) {
            return res.json ( {"status": "alreadyrequested"} )
        };
        if (usersession) {
            let requests = JSON.parse(player.requests);
            let date = new Date();
            requests[usersession.id] = date.getTime();

            await con.query("UPDATE friends SET requests = ? WHERE id = ?", [JSON.stringify(requests), player.id])
            return res.json({"status": "success"})

        } else {
            return res.json({"error": "sessionnotfound"})
        }

    } else {
        return res.json({"error": "frienduserdoesnotexist"});
    };
});

app.post("/api/friends/remove/:id", async (req, res) => {
    let id = req.params.id;
    let token = req.body.token;

    let con = await getConnection();

    let result = await con.query("SELECT * FROM friends WHERE id = ?", [id]);

    let player = result[0][0];

    if (player) {
        
        result = await con.query("SELECT * FROM session where token = ?", [token]);

        let user = result[0][0];

        if (user) {

            if (user.id == id) {
                return res.json( {"error": "cannotremoveurselfdummy"} )
            }

            result = await con.query("SELECT * FROM friends WHERE id = ?", [user.id]);
    
            let user_friends = result[0][0];

            if (user_friends) {

                player.friends = JSON.parse(player.friends);
                user_friends.friends = JSON.parse(user_friends.friends);
                player.requests = JSON.parse(player.requests);
                user_friends.requests = JSON.parse(user_friends.requests);
        
                if (String(user.id) in player.friends) {
                    delete player.friends[String(user.id)];
                    delete user_friends.friends[String(player.id)];
                    
                    await con.query("UPDATE friends SET friends = ? WHERE id = ?", [JSON.stringify(player.friends), player.id])
                    await con.query("UPDATE friends SET friends = ? WHERE id = ?", [JSON.stringify(user_friends.friends), user.id])
                    return res.json( {"status": "success"} )
                } else if (String(user.id) in player.requests) {
                
                    delete player.requests[String(user.id)];

                    await con.query("UPDATE friends SET requests = ? WHERE id = ?", [JSON.stringify(player.requests), player.id]);

                    return res.json( {"status": "success"} )
                } else {
                    return res.json( {"status": "notassociated"} )
                }

            } else {
                return res.json( {"error": "somethinghappened"} )
            }
    
        } else {
            return res.json( {"error": "sessionnotfound"})

        }
    };
});

//Prideti matchmakinga
//Elo skaiciavima


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});