// const socket = new WebSocket(`ws://${window.location.host}`);

const socket = new WebSocket(`ws://172.16.165.208:8001`);

socket.addEventListener("message", (e) => {
    console.log(e)
})