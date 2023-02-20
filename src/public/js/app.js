// const socket = new WebSocket(`ws://${window.location.host}`);

const socket = new WebSocket(`ws://192.168.1.22:36008`);

socket.addEventListener("message", (e) => {
    // console.log("on data")
    // console.log(e)
    let parsed = JSON.parse(e.data)
    let messageType = parsed["type"]
    // if(messageType != "amcl")
    //     console.log(e)
    // if(messageType != "lassssser_scan")
        // console.log(e)

    if(messageType == "static_map"){
        mapResolution = parsed["resolution"]
        mapWidth = parsed["width"]
        mapHeight = parsed["height"]
        mapPositionX = parsed["positionX"]
        mapPositionY = parsed["positionY"]
        mapData = parsed["data"]
        mapImage = makeMapImage(mapWidth, mapHeight, mapData)
        mapScaleWidth = canvas.width / mapWidth
        mapScaleHeight = canvas.height / mapHeight
    }
    else if(messageType == "amcl"){
        if(mapResolution != null){
            // console.log(parsed["angle"])
            //나중에 모니터에서 정밀하게 보고 싶을 때, map Position X, Y 사용해야 할 수도 있음
            robotPositionX = canvas.width/2 + ((parsed["positionX"] ) * 1/mapResolution) * mapScaleWidth
            robotPositionY = canvas.height/2 + ((parsed["positionY"] )* 1/mapResolution) * mapScaleHeight
            robotAngle = radToDeg(parsed["angle"])
        }   
    }
    else if(messageType == "laser_scan"){
        ranges = parsed["ranges"]
    }
    else if(messageType == "feedback"){
        let feedback = parsed["feedback"]
        if(feedback != null)
            document.getElementById("feedback_msg").innerText = feedback
    }
    else if(messageType == "result"){
        let result = parsed["result"]
        if(result != null)
            document.getElementById("result_msg").innerText = result
    }
    // console.log(e);

    
    

    // let parsedData = JSON.parse(e.data);
    // robotPositionX = canvas.width/2 + parsedData["x"];
    // robotPositionY = canvas.height/2 - parsedData["y"];
})

let robotPositionX = 0.0;
let robotPositionY = 0.0;
let robotAngle = 0.0; //degree

const canvas = document.getElementById("monitor");

// let canvas = document.createElement("canvas");
// document.body.appendChild(canvas);

let ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

let mapImageData;
let mapImage;
let robotImage;

let mapWidth;
let mapHeight;
let mapData;
let mapPositionX;
let mapPositionY;
let mapResolution; // m/cell

let mapScaleWidth;
let mapScaleHeight;

let ranges = []

function radToDeg(rad) {
    return rad * (180.0 / Math.PI);
}

function degToRad(deg){
    return deg * (Math.PI / 180.0)
}

function makeMapImage(width, height, mapData){
    let canvas_temp = document.createElement("canvas");
    let ctx_temp = canvas_temp.getContext("2d");
    const imgData = ctx_temp.createImageData(width, height);
    const data = imgData.data;
    for (let i = 0; i < mapData.length; i++) {
        const index = i * 4;
        let gray = mapData[i];
        if(gray == 0)
            gray = 255
        data[index] = data[index + 1] = data[index + 2] = gray;
        data[index + 3] = 255;    
    }
    return imagedata_to_image(imgData)
}





function loadRobotImage(){
    robotImage  = new Image();
    robotImage.src = "/public/images/robot.png";
}

function imagedata_to_image(imagedata) {
    let canvas_temp = document.createElement('canvas');
    let ctx = canvas_temp.getContext('2d');
    canvas_temp.width = imagedata.width;
    canvas_temp.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    let image = new Image();
    image.src = canvas_temp.toDataURL();
    return image;
}

let robotSizeInMonitor = 30;
function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    console.log("render")
    
    if(mapImage != undefined){
        ctx.drawImage(mapImage,0,0, canvas.width, canvas.height)
    }

    renderLaserScan() 
    ctx.drawImage(robotImage, robotPositionX-robotSizeInMonitor/2, robotPositionY-robotSizeInMonitor/2, robotSizeInMonitor, robotSizeInMonitor);   
    
    requestAnimationFrame(render);
}

let rx, ry;
let rx2, ry2;
function renderLaserScan(){
    
    if(mapResolution != null){
        let robotPosX = robotPositionX;
        let robotPosY = robotPositionY;
        //이상하게 90도를 더 해야 맞음..
        let robotAng = robotAngle;
        ctx.beginPath(); // Start a new path
        for(let i=0; i<360; i++){
            
            xy= rotate(robotPosX, robotPosY, robotPosX, ranges[i]*1.2/mapResolution*mapScaleHeight+robotPosY, robotAng - i)
            // xy2= rotate(robotPosX, robotPosY, xy[0], xy[1], robotAng)
            let minLaserCoordinates = rotate(robotPosX, robotPosY, robotPosX, 1.0 /mapResolution*mapScaleHeight+robotPosY, robotAng - i)
            ctx.moveTo(minLaserCoordinates[0], minLaserCoordinates[1])
            // ctx.lineTo(xy2[0], xy2[1])
            ctx.lineTo(xy[0], xy[1])
            
        }
        let xy2= rotate(robotPosX, robotPosY, robotPosX, 5.0*1.2/mapResolution*mapScaleHeight+robotPosY, robotAng)
        ctx.moveTo(robotPosX, robotPosY)
        ctx.lineTo(xy2[0], xy[1])

        ctx.stroke();
        // ctx.stroke();
    }

}

function rotate(cx, cy, x, y, angle) {
    let radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function main(){
    loadRobotImage();
    render();
}

main();



// document.body.appendChild(robotImage);

