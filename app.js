const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(http);
const users = [];

// Static files to be served.
app.use(express.static(__dirname + "/public"));

// Create an event handler.
const onConnection = socket => {
  socket.on("drawing", data => socket.broadcast.emit("drawing", data));
  //socket.on("voting", data => socket.broadcast.emit("drawing", data));
};
app.post("/eScores", express.json(), (request, response) => {
  console.log(request.body);

  const data = request.body;
  response.json({
    status: "success",
    user: data.user,
    vote: data.vote
  });
});

// Initialise it.
io.on("connection", onConnection);

http.listen(port, () => console.log("listening on port " + port));