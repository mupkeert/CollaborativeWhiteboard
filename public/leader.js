function electLeaderFunction() {
  var socket = io();
  socket.on("electing", onElectUserEvent);
  onElectUserEvent();

  function onElectUserEvent() {
    var user = prompt("Enter your name.");
    var vote = prompt("Who you wanna vote to? Choose one:", "");
    var data = [{ user, vote }];
    console.log("user", data);
    console.log("vote", data);
    console.log(data);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
    fetch("/scores", options).then(response => {
      console.log(response);
    });
    electUserAction(data);
  }

  function electUserAction(data) {
    //voting scores calculation
    var scores1 = data.reduce((acc1, cur1) => {
      if (!acc1[cur1.vote]) {
        acc1[cur1.vote] = 1;
      } else {
        acc1[cur1.vote]++;
      }
      return acc1;
    }, {});

    console.log(scores1);

    var sortScores1 = [];
    for (var person in scores1) {
      sortScores1.push([person, scores1[person]]);
    }

    sortScores1.sort(function (b1, a1) {
      return a1[1] - b1[1];
    });
    console.log(sortScores1);
    if (sortScores1.length > 0) {
      console.log(sortScores1[0][0] + " is the leader.");
    } else {
      console.log("No leader is elected");
    }

    if (!socket.emit) {
      return;
    }
    socket.emit("voting", sortScores1);
  }
}