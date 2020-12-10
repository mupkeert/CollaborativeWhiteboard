"use strict";

(function () {
  var buttons = document.querySelectorAll(".choice button"),
    tallyVal = {
      1: 0,
      2: 0,
      total1: 0
    };

  function voteStateSave(choice) {
    tallyVal[choice]++;
    tallyVal["total1"]++;
    console.log(tallyVal);
  }

  function barPercentageCal(node, tallyVal) {
    var choice = node.dataset.choice;
    if (tallyVal[choice]) return (tallyVal[choice] / tallyVal["total1"]) * 100;
    return 0;
  }

  function renderBars() {
    var bars = document.getElementsByClassName("bar");
    var percentage1;
    for (var i = 0; i < bars.length; i++) {
      percentage1 = barPercentageCal(bars[i], tallyVal);
      console.log(percentage1);
      bars[i].style.height = percentage1.toString() + "%";
    }
  }

  function setup() {
    // Set up event listeners
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (e) {
        voteStateSave(e.target.dataset["choice"]);
        renderBars();
      });
    }
    renderBars();
  }
  setup();
})();