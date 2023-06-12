webSocket = new WebSocket("ws://localhost:8080");

var smilesArray = [];
webSocket.onopen = (event) => {
    webSocket.send("Here's some text that the server is urgently awaiting!");
  };
  webSocket.onmessage = (event) => {
    console.log(JSON.parse(event.data));
    smilesArray = JSON.parse(event.data).sort((a,b) => b.value - a.value);;
  };