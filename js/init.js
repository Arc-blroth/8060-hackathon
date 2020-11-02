"use strict";

import scrawl from "https://unpkg.com/scrawl-canvas@8.2.5";

let allData = [];
const datasets = [
  "2791_2019dar",
  "3476_2015cc",
  "3476_2018cc",
  "3476_2018roe",
  "3538_2020misou"
];

let lastElement = null;
let previousCharts = [];
let dataset = null;
let teamNumber = 0;
let field = 0;
let canvasIdCounter = 0;

function parseCsv(name, year, csv) {
  let lines = csv.split("\n").map(s => s.split(","));
  let headers = lines[0].slice(2);
  let data = new CompetitionData(year, headers);
  if (name == datasets[0]) {
    // sneak 100
    lines.slice(1).forEach(row => {
      data.addMatch(row[0], row.slice(2));
    });
  } else {
    lines.slice(1).forEach(row => {
      data.addMatch(row[1], row.slice(2));
    });
  }
  return data;
}

function getAndParseCsv(name, year) {
  return getFile(`/data/${name}.csv`).then(csv => {
    allData[name] = parseCsv(name, year, csv);
  });
}

// Called from load.js
window.init = function() {
  Promise.all([
    getAndParseCsv(datasets[0], 2019),
    getAndParseCsv(datasets[1], 2015),
    getAndParseCsv(datasets[2], 2018),
    getAndParseCsv(datasets[3], 2018),
    getAndParseCsv(datasets[4], 2020)
  ]).then(() => {
    console.log(allData);

    let datasetSelect = document.getElementById("dataset");
    for (let i = 0; i < datasets.length; i++) {
      datasetSelect.options[i + 1] = new Option(datasets[i], datasets[i]);
    }

    let teamSelect = document.getElementById("team");

    let updateOtherOptions = () => {
      let teams = Object.keys(allData[dataset].teamData).filter(t => t != 0);

      for (let i = teamSelect.options.length - 1; i >= 1; i--) {
        teamSelect.remove(i);
      }

      for (let i = 0; i < teams.length; i++) {
        let option = new Option(teams[i], teams[i]);
        teamSelect.options[i + 1] = option;
      }
    };

    let eighteen =
      "url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)";

    let updateImage = () => {
      if (dataset == "2791_2019dar") {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg",
          0.5
        );
      } else if (dataset == "3476_2015cc") {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg",
          0.5
        );
      } else if (dataset == "3476_2018cc") {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg",
          0.5
        );
      } else if (dataset == "3476_2018roe") {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg",
          0.5
        );
      } else {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg",
          0.5
        );
      }
    };

    function setBackgroundImage(imageid, opacity) {
      var s = document.body.style;
      //s.backgroundImage = `url(${imageid})`;
    }

    datasetSelect.onchange = function() {
      if (this.selectedIndex) {
        dataset = this.value;
        updateOtherOptions();
        updateImage();
        if (teamNumber) updateGraphs();
      }
    };

    teamSelect.onchange = function() {
      if (this.selectedIndex) {
        teamNumber = this.value;
        updateGraphs();
      }
    };
  });
};

function updateGraphs() {
  let teamData = allData[dataset].teamData[teamNumber];
  let chartData = buildChartData(teamData);

  if (previousCharts.length > 0) {
    previousCharts.forEach(e => e.parentElement.removeChild(e));
    previousCharts = [];
  }

  chartData.forEach(c => {
    let ele = c.buildElement();
    previousCharts.push(ele);
    document.body.append(ele);
  });
}

class ChartData {
  constructor(title, labels, data) {
    this.title = title;
    this.labels = labels;
    this.data = data;
  }

  buildElement() {
    let ele = buildElement("canvas");
    let ctx = ele.getContext("2d");
    let chart = new Chart(ctx, {
      type: "bar",

      // The data for our dataset
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.title,
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: this.data
          }
        ]
      },

      // Configuration options go here
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                stepSize: 1,
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
    return ele;
  }
}

class PathingData {
  constructor(title, segments) {
    this.title = title;
    this.segments = segments;
  }

  buildElement() {
    this.canvas = scrawl.document.addStack({ host: document.body });
    this.canvas.set({
      backgroundColor: "blanchedalmond",
      css: {
        border: "1px solid black"
      }
    });
    return this.canvas;
  }
}

const sum = (a, b) => Number(a) + Number(b);

const yesNo = {
  0: "No",
  1: "Yes"
};

function buildChartData(teamData) {
  let out = [];
  if (dataset == datasets[0]) {
    // 2019
    out.push(
      countEnum(teamData, "Starting Position", 0, {
        L1: "Left 1",
        L2: "Left 2",
        M: "Middle",
        R1: "Right 1",
        R2: "Right 2"
      })
    );
    out.push(countEnum(teamData, "Habitat Line", 1, yesNo));
    out.push(
      countNums(teamData, "Hatches Scored: Auto", {
        2: "Ship Side",
        3: "Ship Front"
      })
    );
    out.push(
      countNums(teamData, "Cargo Scored: Auto", {
        4: "Ship Side"
      })
    );
    out.push(
      countNums(teamData, "Auto Rocket Level when Scored", {
        5: "Cargo Rocket Level",
        6: "Hatch Rocket Level",
        7: "2nd Hatch Rocket Level"
      })
    );
    out.push(
      countNums(teamData, "Number Dropped in Auto", {
        8: "Number of Cargo Dropped",
        9: "Number of Hatches Dropped"
      })
    );
    out.push(
      countNums(teamData, "Number of H/C Scored in Cargo Ship in Teleop", {
        10: "Hatches Scored in Teleop",
        11: "Cargo Scored in Teleop"
      })
    );
    out.push(
      countNums(teamData, "Number of Hatches Scored in the Teleop Rocket", {
        12: "Level 1",
        13: "Level 2",
        14: "Level 3"
      })
    );
    out.push(
      countNums(teamData, "Number of cargo scored in the Teleop Rocket", {
        15: "Level 1",
        16: "Level 2",
        17: "Level 3"
      })
    );
    out.push(
      countNums(teamData, "Number of H/C Dropped in Teleop", {
        18: "Hatches Dropped",
        19: "Cargo Dropped"
      })
    );
    out.push(
      countNums(teamData, "Defense", {
        20: "Amount of Defense Played",
        21: "Defense Quality",
        22: "Amount of Defense Recieved"
      })
    );
    out.push(
      countNums(teamData, "Defense", {
        20: "Amount of Defense Played",
        21: "Defense Quality",
        22: "Amount of Defense Recieved"
      })
    );
    out.push(
      countNums(teamData, "Highest level of HAB by team in endgame", {
        26: "Achieved",
        27: "Attempted"
      })
    );
    out.push(
      countNums(teamData, "Dead", {
        25: "Amount of Defense Played"
      })
    );
    out.push(countEnum(teamData, "Who Played Defense?", 23, yesNo));
    out.push(countEnum(teamData, "Did they have any Fouls?", 24, yesNo));
    out.push(countEnum(teamData, "Was the team assisted?", 28, yesNo));
  } else if (dataset == datasets[1]) {
    // 2015
    out.push(
      countNums(teamData, "Autozone Totes", 0, {
        0: "Number of totes moved into Autozone during autonomous"
      })
    );
    out.push(countEnum(teamData, "Moved Into Auto Zone", 1, yesNo));
    out.push(
      countNums(teamData, "Bins Retrieved from Step", 2, {
        2: "Bins retrieved from the step zone"
      })
    );
    out.push(
      countNums(teamData, "Stacks", {
        3: "Number of Stacks"
      })
    );
    out.push(
      countNums(teamData, "Binned Stacks", {
        4: "Number of Binned Stacks"
      })
    );
    out.push(
      countNums(teamData, "Noodled Stacks", {
        5: "Number of Noodled Stacks"
      })
    );
    out.push(
      countNums(teamData, "Coop Totes Placed", {
        6: "Coopertition totes placed"
      })
    );
    out.push(countEnum(teamData, "Intake human", 7, yesNo));
    out.push(countEnum(teamData, "Intake landfill", 8, yesNo));
    out.push(
      countNums(teamData, "Number of Capped Stacks", {
        9: "Number of Capped Stacks 1",
        10: "Number of Capped Stacks 2",
        11: "Number of Capped Stacks 3",
        12: "Number of Capped Stacks 4",
        13: "Number of Capped Stacks 5",
        14: "Number of Capped Stacks 6"
      })
    );
    out.push(
      countNums(teamData, "Number of Stacks", {
        15: "Number of Stacks 1",
        16: "Number of Stacks 2",
        17: "Number of Stacks 3",
        18: "Number of Stacks 4",
        19: "Number of Stacks 5",
        20: "Number of Stacks 6"
      })
    );
  } else if (dataset == datasets[2]) {
    // 2018cc
    out.push(countEnum(teamData, "Crossed line autonomously?", 1, yesNo));
    out.push(
      countNums(teamData, "Cubes Moved Autonomously", {
        2: "Num of Own Cubes on Switch",
        3: "Num of Own Cubes on Scale"
      })
    );
    out.push(
      countNums(teamData, "Cubes Moved w/ Teleop", {
        4: "Num of Own Cubes on Switch",
        5: "Num of Own Cubes on Scale",
        6: "Num of Opponent Cubes on Switch"
      })
    );
    out.push(
      countNums(teamData, "Exchanged Cubes", {
        7: "Num of Cubes Exchanged"
      })
    );
    out.push(
      countNums(teamData, "Num of Bots Climbed", {
        8: "Own Bot Climbed",
        9: "Own Bot Climbed w/ 1 Teammate",
        10: "Own Bot Climbed w/ 2 Teammates"
      })
    );
    out.push(new PathingData("test pathing", []));
    out.push(countEnum(teamData, "Did they play defense?", 11, yesNo));
  } else if (dataset == datasets[3]) {
    // 2018roe
    out.push(countEnum(teamData, "Crossed line autonomously?", 1, yesNo));
    out.push(
      countNums(teamData, "Cubes Moved Autonomously", {
        2: "Num of Own Cubes on Switch",
        3: "Num of Own Cubes on Scale"
      })
    );
    out.push(
      countNums(teamData, "Cubes Moved w/ Teleop", {
        4: "Num of Own Cubes on Switch",
        5: "Num of Own Cubes on Scale",
        6: "Num of Opponent Cubes on Switch"
      })
    );
    out.push(
      countNums(teamData, "Exchanged Cubes", {
        7: "Num of Cubes Exchanged"
      })
    );
    out.push(
      countNums(teamData, "Num of Bots Climbed", {
        8: "Own Bot Climbed",
        9: "Own Bot Climbed w/ 1 Teammate",
        10: "Own Bot Climbed w/ 2 Teammates"
      })
    );

    out.push(countEnum(teamData, "Did They Defend?", 11, yesNo));
  } else if (dataset == datasets[4]) {
    // 2020

    //column 1
    out.push(
      countEnum(teamData, "Starting Location", 0, {
        "Inline with Opposing Trench": "Opp. Trench",
        "Right of Goal": "Right Goal",
        "Left of Goal": "Left Goal"
      })
    );

    //column 2-9
    out.push(
      countNums(teamData, "Auto Balls", {
        1: "Low",
        2: "1",
        3: "2/3",
        4: "4",
        5: "5",
        6: "6",
        7: "Acquired",
        8: "End Location"
      })
    );

    //column 10-15
    out.push(
      countNums(teamData, "Tele Balls", {
        9: "Low",
        10: "1",
        11: "2/3",
        12: "4",
        13: "5",
        14: "6"
      })
    );

    //column 16
    out.push(countEnum(teamData, "Wheel Spin", 15, yesNo));

    //column 17
    out.push(countEnum(teamData, "Wheel Color Match", 16, yesNo));

    //column 18
    out.push(
      countEnum(teamData, "Defender", 17, {
        None: "None",
        Light: "Light",
        Heavy: "Heavy"
      })
    );

    //column 19
    out.push(
      countEnum(teamData, "Target", 18, {
        None: "None",
        Light: "Light",
        Heavy: "Heavy"
      })
    );
  }
  return out;
}

/**
 * Counts data that is specified as an enum.
 * Example: Starting Position can be L1, L2, M, R1, or R2
 */
function countEnum(teamData, title, field, map) {
  let keys = Object.keys(map);
  let out = new Array(keys.length).fill(0);
  teamData
    .map(m => m[field])
    .forEach(f => {
      for (let i = 0; i < keys.length; i++) {
        if (f == keys[i]) {
          out[i]++;
          break;
        }
      }
    });
  return new ChartData(title, Object.values(map), out);
}

/**
 * Counts several columns of related numerical data.
 * Example: Number of Stacks 1, Number of Stacks 2, etc
 */
function countNums(teamData, title, map) {
  console.log(teamData);
  let out = Object.keys(map).map(k => teamData.flatMap(m => m[k]).reduce(sum));
  return new ChartData(title, Object.values(map), out);
}
