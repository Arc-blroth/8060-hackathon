"use strict";

import scrawl from "https://unpkg.com/scrawl-canvas@8.2.5";

let allData = [];
const datasets = [
  "3476_2015cc",
  "3476_2018cc",
  "3476_2018roe",
  "2791_2019dar",
  "3538_2020misou"
];

const datasetStyles = [
  { name: "Recycle Rush (2015)", color: "#00a94f" },
  { name: "Power Up (2018)", color: "#f7c628" },
  { name: "Power Up (2018)", color: "#f7c628" },
  { name: "Destination: Deep Space (2019)", color: "#121014" },
  { name: "Infinite Recharge (2020)", color: "#0066b3" },
];

const charts = document.getElementById("charts");

let lastElement = null;
let previousCharts = [];
let dataset = null;
let datasetNumber = 0;
let teamNumbers = [];
let field = 0;
let canvasIdCounter = 0;

function parseCsv(name, year, csv) {
  let lines = csv.split("\n").map(s => {
    if(!s.includes("\"")) {
      return s.split(",");
    } else {
      let out = [];
      let current = [];
      let inString = false;
      for(let i = 0; i < s.length; i++) {
        let char = s.charAt(i);
        if(!inString && char == ",") {
          out.push(current.join(""));
          current = [];
        } else if(char == "\"") {
          inString = !inString;
        } else {
          current.push(char);
        }
      }
      out.push(current.join(""));
      return out;
    }
  });
  let headers = lines[0].slice(2);
  let data = new CompetitionData(year, headers);
  if (name == datasets[3]) {
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
    getAndParseCsv(datasets[0], 2015),
    getAndParseCsv(datasets[1], 2018),
    getAndParseCsv(datasets[2], 2018),
    getAndParseCsv(datasets[3], 2019),
    getAndParseCsv(datasets[4], 2020)
  ]).then(() => {
    let loadingEle = document.getElementById("loading");
    loadingEle.parentElement.removeChild(loadingEle);
    document.getElementById("controls-inner").style.display = "block";

    let datasetSelect = document.getElementById("dataset");
    for (let i = 0; i < datasets.length; i++) {
      datasetSelect.options[i + 1] = new Option(datasets[i], datasets[i]);
    }

    let teamSelect = document.getElementById("team1");

    let updateOtherOptions = () => {
      let teams = Object.keys(allData[dataset].teamData).filter(t => t != 0);

      for (let i = teamSelect.options.length - 1; i >= 0; i--) {
        teamSelect.remove(i);
      }

      for (let i = 0; i < teams.length; i++) {
        let option1 = new Option(teams[i], teams[i]);
        console.log(teams[i]);
        teamSelect.options[i] = option1;
      }
    };

    let updateImage = () => {
      if (dataset == "2791_2019dar") {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg"
        );
      } else if (dataset == "3476_2015cc") {
        setBackgroundImage(
          "https://www.badgerbots.org/wp-content/uploads/2015/03/recycle-rush-logo.png"
        );
      } else if (dataset == "3476_2018cc") {
        setBackgroundImage(
          "https://firstfrc.blob.core.windows.net/frc2018/Manual/HTML/2018FRCGameSeasonManual_files/image002.jpg"
        );
      } else if (dataset == "3476_2018roe") {
        setBackgroundImage(
          "https://firstfrc.blob.core.windows.net/frc2018/Manual/HTML/2018FRCGameSeasonManual_files/image002.jpg"
        );
      } else {
        setBackgroundImage(
          "https://www.firstinspires.org/sites/default/files/uploads/rightimage/infinite-recharge-web-promo_0.png"
        );
      }
    };

    function setBackgroundImage(imageId) {
      let logoImg = document.getElementById("yearLogo");
      logoImg.style.display = "block";
      logoImg.src = imageId;
    }

    datasetSelect.onchange = function() {
      if(this.selectedIndex) {
        dataset = this.value;
        datasetNumber = this.selectedIndex - 1;
        updateOtherOptions();
        updateImage();
        clearGraphs();
        teamNumbers = [];
      }
    };

    teamSelect.onchange = function() {
      teamNumbers = [];
      for (let i = 0; i < teamSelect.options.length; i++) {
        if(teamSelect.options[i].selected) {
          teamNumbers.push(teamSelect.options[i].value);
        }
      }
      updateGraphs();
    };
    
  });
};

function clearGraphs() {
  if (previousCharts.length > 0) {
    previousCharts.forEach(e => e.parentElement.removeChild(e));
    previousCharts = [];
  }
}

function updateGraphs() {
  let teamData = teamNumbers.map(n => [n, allData[dataset].teamData[n]]);
  
  clearGraphs();
  
  if(teamData.length > 0) {
    let chartData = teamData.map(d => buildChartData(d[0], d[1]));
    let otherChartData = chartData.slice(1);
    for(let i = 0; i < chartData[0].length; i++) {
      if(chartData[0][i] instanceof ChartData) {
        let ele = chartData[0][i].buildElement(otherChartData.map(c => c[i]));
        previousCharts.push(ele);
      } /* else if(teamData.length = 1) {
        let ele = chartData[0][i].buildElement();
        previousCharts.push(ele);
      } */
    }
  }
}

class ChartData {
  constructor(title, team, labels, data) {
    this.title = title;
    this.team = team;
    this.labels = labels;
    this.data = data;
  }

  buildElement(moreData = []) {
    let ele = buildElement("div", ["chart"]);
    let ele2 = buildElement("canvas");
    let ctx = ele2.getContext("2d");
    moreData.push(this);
    let chart = new Chart(ctx, {
      type: "bar",

      // The data for our dataset
      data: {
        labels: this.labels,
        datasets: moreData.map(d => {
          return {
            label: d.team,
            backgroundColor: d.team == this.team ? datasetStyles[datasetNumber].color : randomColor(d.team),
            borderColor: "rgb(255, 99, 132)",
            data: d.data
          }
        })
      },

      // Configuration options go here
      options: {
        title: {
          display: true,
          text: this.title
        },
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
    charts.append(ele);
    ele.append(ele2);
    return ele;
  }
}

class PathingData {
  constructor(title, segments) {
    this.title = title;
    this.segments = segments;
  }

  buildElement() {
    this.canvas = scrawl.addCanvas({
      host: charts,
      classes: 'pathing'
    });
    this.canvas.base.set({
      width: 1000,
      height: 1000
    });
    return this.canvas.domElement;
  }
}

const sum = (a, b) => Number(a) + Number(b);

const yesNo = {
  0: "No",
  1: "Yes"
};

function buildChartData(teamNumber, teamData) {
  let out = [];
  if (dataset == datasets[0]) {
    // 2015
    out.push(
      countNums(teamNumber, teamData, "Autozone Totes", {
        0: "Number of totes moved into Autozone during autonomous"
      })
    );
    out.push(countEnum(teamNumber, teamData, "Moved Into Auto Zone", 1, yesNo));
    out.push(
      countNums(teamNumber, teamData, "Bins Retrieved from Step", {
        2: "Bins"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Stacks", {
        3: "Number of Stacks"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Binned Stacks", {
        4: "Number of Binned Stacks"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Noodled Stacks", {
        5: "Number of Noodled Stacks"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Coopertition Totes Placed", {
        6: "Totes"
      })
    );
    out.push(countEnum(teamNumber, teamData, "Intake Human", 7, yesNo));
    out.push(countEnum(teamNumber, teamData, "Intake Landfill", 8, yesNo));
    out.push(
      countNums(teamNumber, teamData, "Number of Capped Stacks", {
        9:  "1",
        10: "2",
        11: "3",
        12: "4",
        13: "5",
        14: "6"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number of Stacks", {
        15: "1",
        16: "2",
        17: "3",
        18: "4",
        19: "5",
        20: "6"
      })
    );
  } else if (dataset == datasets[1]) {
    // 2018cc
    out.push(countEnum(teamNumber, teamData, "Crossed Line Autonomously?", 1, yesNo));
    out.push(
      countNums(teamNumber, teamData, "Cubes Moved Autonomously", {
        2: "Own Cubes on Switch",
        3: "Own Cubes on Scale"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Cubes Moved w/ Teleop", {
        4: "Own Cubes on Switch",
        5: "Own Cubes on Scale",
        6: "Opponent Cubes on Switch"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Cubes Exchanged", {
        7: "Cubes Exchanged"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Num of Bots Climbed", {
        8:  "Own Bot",
        9:  "Own Bot w/ 1 Teammate",
        10: "Own Bot w/ 2 Teammates"
      })
    );
    out.push(new PathingData("test pathing", []));
    out.push(countEnum(teamNumber, teamData, "Did They Defend?", 11, yesNo));
  } else if (dataset == datasets[2]) {
    // 2018roe
    out.push(countEnum(teamNumber, teamData, "Crossed Line Autonomously?", 1, yesNo));
    out.push(
      countNums(teamNumber, teamData, "Cubes Moved Autonomously", {
        2: "Own Cubes on Switch",
        3: "Own Cubes on Scale"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Cubes Moved w/ Teleop", {
        4: "Own Cubes on Switch",
        5: "Own Cubes on Scale",
        6: "Opponent Cubes on Switch"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Exchanged Cubes", {
        7: "Cubes Exchanged"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Num of Bots Climbed", {
        8:  "Own Bot",
        9:  "Own Bot w/ 1 Teammate",
        10: "Own Bot w/ 2 Teammates"
      })
    );

    out.push(countEnum(teamNumber, teamData, "Did They Defend?", 11, yesNo));
  } else if (dataset == datasets[3]) {
    // 2019
    out.push(
      countEnum(teamNumber, teamData, "Starting Position", 0, {
        L1: "Left 1",
        L2: "Left 2",
        M: "Middle",
        R1: "Right 1",
        R2: "Right 2"
      })
    );
    out.push(countEnum(teamNumber, teamData, "Habitat Line", 1, yesNo));
    out.push(
      countNums(teamNumber, teamData, "Hatches Scored: Auto", {
        2: "Ship Side",
        3: "Ship Front"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Cargo Scored: Auto", {
        4: "Ship Side"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Auto Rocket Level when Scored", {
        5: "Cargo Rocket Level",
        6: "Hatch Rocket Level",
        7: "2nd Hatch Rocket Level"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number Dropped in Auto", {
        8: "Number of Cargo Dropped",
        9: "Number of Hatches Dropped"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number of H/C Scored in Cargo Ship in Teleop", {
        10: "Hatches Scored in Teleop",
        11: "Cargo Scored in Teleop"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number of Hatches Scored in the Teleop Rocket", {
        12: "Level 1",
        13: "Level 2",
        14: "Level 3"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number of cargo scored in the Teleop Rocket", {
        15: "Level 1",
        16: "Level 2",
        17: "Level 3"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Number of H/C Dropped in Teleop", {
        18: "Hatches Dropped",
        19: "Cargo Dropped"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Defense", {
        20: "Amount of Defense Played",
        21: "Defense Quality",
        22: "Amount of Defense Recieved"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Defense", {
        20: "Amount of Defense Played",
        21: "Defense Quality",
        22: "Amount of Defense Recieved"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Highest level of HAB by team in endgame", {
        26: "Achieved",
        27: "Attempted"
      })
    );
    out.push(
      countNums(teamNumber, teamData, "Amount of Time Spent Dead in Match", {
        25: "Time (seconds)"
      })
    );
    out.push(countEnum(teamNumber, teamData, "Did they have any Fouls?", 24, yesNo));
    out.push(countEnum(teamNumber, teamData, "Was the team assisted?", 28, yesNo));
  } else if (dataset == datasets[4]) {
    // 2020

    //column 1
    out.push(
      countEnum(teamNumber, teamData, "Starting Location", 0, {
        "Inline with Opposing Trench": "Opp. Trench",
        "Right of Goal": "Right Goal",
        "Left of Goal": "Left Goal"
      })
    );

    //column 2-9
    out.push(
      countNums(teamNumber, teamData, "Auto Balls", {
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
      countNums(teamNumber, teamData, "Tele Balls", {
        9: "Low",
        10: "1",
        11: "2/3",
        12: "4",
        13: "5",
        14: "6"
      })
    );

    //column 16
    out.push(countEnum(teamNumber, teamData, "Wheel Spin", 15, yesNo));

    //column 17
    out.push(countEnum(teamNumber, teamData, "Wheel Color Match", 16, yesNo));

    //column 18
    out.push(
      countEnum(teamNumber, teamData, "Defender", 17, {
        None:  "None",
        Light: "Light",
        Heavy: "Heavy"
      })
    );

    //column 19
    out.push(
      countEnum(teamNumber, teamData, "Target", 18, {
        None:  "None",
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
function countEnum(teamNumber, teamData, title, field, map) {
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
  return new ChartData(title, teamNumber, Object.values(map), out);
}

/**
 * Counts several columns of related numerical data.
 * Example: Number of Stacks 1, Number of Stacks 2, etc
 */
function countNums(teamNumber, teamData, title, map) {
  let out = Object.keys(map).map(k => teamData.flatMap(m => m[k]).reduce(sum));
  return new ChartData(title, teamNumber, Object.values(map), out);
}

scrawl.makeAnimation({
    name: 'pathing',
    fn: function() {
        return new Promise((resolve, reject) => {
            scrawl.render()
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                console.log(err);
                reject(false);
            });
        });
    }
});