const WebSocket = require("ws");
const express = require("express");

const http = require('http');
const app = express();

// app.set("view engine", "pug");
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// app.get("/", (req,res) => res.render("home"));
app.get("/", (req,res) => res.render("index"));
app.get("/*", (req,res) => res.redirect("/"));

app.use(express.json())
app.use(express.urlencoded({extended : true}))


let localIPAddress = getLocalIPAdrress();

const handleListen = () => console.log(`http Listening on http://${localIPAddress}:30003`);
app.listen(30003, handleListen);

const port_ROS = 36888;
const wss_ROS = new WebSocket.Server({ port: port_ROS, host : localIPAddress });
console.log(`ws for ROS Listening on ws://${localIPAddress}:${port_ROS}`);

const port_browser = 36008;
const wss_browser = new WebSocket.Server({ port: port_browser, host : localIPAddress});
console.log(`ws for browser Listening on ws://${localIPAddress}:${port_browser}`);

let socket_ROS;
const sockets_browser = [];

wss_ROS.on("connection", (socket) =>{
    console.log("wss_ROS : Connected a client ✔")
    socket_ROS = socket;

    socket.on("close", () => {
        console.log("wss_ROS : Disconnected a client");
    });
    
    socket.on("message",(e) => {
        // console.log("wss_ROS : recieved from websocket " + e.toString())
        console.log("wss_ROS : recieved from websocket ")
        sockets_browser.forEach((aSocket) => {
            aSocket.send(e.toString());
        });
    })
})

app.post("/goToPose", (req, res) => {
    //websocket으로 보내기
    console.log("http: goToPose")
    if(socket_ROS==undefined){
        console.log("socket_ROS undefined")
        return;
    }
    let requestGoToPose = req.body
    requestGoToPose["type"] = "requestGoToPose"
    socket_ROS.send(JSON.stringify(req.body));
})


wss_browser.on("connection", (socket) =>{
    console.log("wss_browser : Connected a client ✔")
    sockets_browser.push(socket);

    let request_static_map_msg = Object()
    request_static_map_msg["type"] = "requestStaticMap"
    if(socket_ROS != null)
        socket_ROS.send(JSON.stringify(request_static_map_msg))
    
    socket.on("close", () => {
        console.log("wss_browser : Disconnected a client");
    });
    
    socket.on("message",(e) => {
        console.log("wss_browser : recieved from websocket " + e.toString())
    })
    
    // setInterval(() => {
    //     socket.send(
    //       JSON.stringify({
    //         x: Math.floor(Math.random() * 100),
    //         y: Math.floor(Math.random() * 100),
    //       })
    //     );
    // }, 1000);

})











function getLocalIPAdrress(){
    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
    }
    return results["이더넷"][0];
}




module.exports = this;