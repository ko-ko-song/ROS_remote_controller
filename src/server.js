import WebSocket from "ws";
import express from "express";

const http = require('http');
const app = express();

// app.set("view engine", "pug");
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

// app.get("/", (req,res) => res.render("home"));
app.get("/", (req,res) => res.render("index"));
app.get("/*", (req,res) => res.redirect("/"));

app.use(express.json())
app.use(express.urlencoded({extended : true}))

const handleListen = () => console.log(`http Listening on http://localhost:30003`);
app.listen(30003, handleListen);


//http, webSocket server를 동시에 돌릴 때
// const wss = new WebSocket.Server({server});

//websocket server만 돌릴 때
const wss = new WebSocket.Server({ port: 8001 });
console.log(`ws Listening on ws://localhost:8001`);

const sockets = [];

wss.on("connection", (socket) =>{
    console.log("wss : Connected some client ✔")
    sockets.push(socket);

    socket.on("close", () => {
        console.log("wss : Disconnected some client");
    });
    
    socket.on("message",(e) => {
        console.log("recieved from websocket : " + e.toString())
    })
})








app.post("/goToPose", (req, res) => {

    //websocket으로 보내기
    
    if(sockets.length==0)
        return;
    sockets.forEach((aSocket) => {
        aSocket.send(JSON.stringify(req.body));
    });



})











module.exports = this;