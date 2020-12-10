"use strict";

(function () {
  var socket = io();
  var canvas = document.getElementsByClassName("whiteboard")[0];
  var colors = document.getElementsByClassName("color");
  var snapshotButton = document.getElementById("snapshotButton");
  var snapshotImageElement = document.getElementById("snapshotImageElement");
  var choiceVal = document.getElementById("choices");
  var leaderVal = document.getElementById("leader");
  var letCollaborate = document.getElementById("letCollaborate");
  // var colorErase = document.getElementsByClassName("btn");
  var context = canvas.getContext("2d");

  var current = {
    color: "blue"
  };
  var drawing = false;

  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  socket.on("drawing", onDrawingEvent);

  window.addEventListener("resize", onResize, false);
  onResize();

  var dataUrl;
  snapshotButton.onclick = function () {
    dataUrl = canvas.toDataURL();
    if (snapshotButton.value === "Take snap") {
      snapshotImageElement.src = dataUrl;
      snapshotImageElement.style.display = "inline";
      canvas.style.display = "none";
      choiceVal.style.display = "none";
      leaderVal.style.display = "none";
      letCollaborate.style.display = "none";
      snapshotButton.value = "back to Canvas";
    } else if (snapshotButton.value === "back to Canvas") {
      snapshotImageElement.src = dataUrl;
      snapshotImageElement.style.display = "none";
      canvas.style.display = "inline";
      choiceVal.style.display = "inline ";
      leaderVal.style.display = "inline";
      letCollaborate.style.display = "inline";
      snapshotButton.value = "Take snap";
    } else {
      snapshotImageElement.src = dataUrl;
      snapshotImageElement.style.display = "none";
      canvas.style.display = "inline";
      snapshotButton.value = "Take snap";
    }
  };

  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  //start position
  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }
  //finished position

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
  }
  //draw event on the board
  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(" ")[1];
  }
  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  /*function saveToLocal(data) {
    let localData = [...localStorage.getItem("data")];
    localData.push(data);
    localStorage.setItem("data", localData);
  } */

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  const saved = localStorage.getItem("dataUrl");
  if (saved) {
    dataUrl.innerHTML = saved;
  }
  TogetherJS.hub.on("draw", function (msg) {
    if (!msg.sameUrl) {
      return;
    }
    draw(msg.start, msg.end, msg.color, true);
  });

  TogetherJS.hub.on("togetherjs.hello", function (msg) {
    if (!msg.sameUrl) {
      return;
    }
    var image = canvas.toDataURL("image/png");
    TogetherJS.send({
      type: "init",
      image: image
    });
    TogetherJS.hub.on("init", function (msg) {
      if (!msg.sameUrl) {
        return;
      }
      var image = new Image();
      image.src = msg.image;
      context.drawImage(image, 0, 0);
    });
  });
})();