"use strict";

let allData = [];
const datasets = [
    "2791_2019dar",
    "3476_2015cc",
    "3476_2018cc",
    "3476_2018roe",
    "3538_2020misou"
];

let lastElement = null;
let previousTeamOptions = [];
let dataset = null;
let teamNumber = 0;
let field = 0;

function parseCsv(name, year, csv) {
    let lines = csv.split("\n").map(s => s.split(","));
    let headers = lines[0].slice(2);
    let data = new CompetitionData(year, headers);
    if(name == datasets[0]) { // sneak 100
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
function init() {
    Promise.all([
        getAndParseCsv(datasets[0], 2019),
        getAndParseCsv(datasets[1], 2015),
        getAndParseCsv(datasets[2], 2018),
        getAndParseCsv(datasets[3], 2018),
        getAndParseCsv(datasets[4], 2020),
    ]).then(() => {
        console.log(allData);
        
        let datasetSelect = document.getElementById("dataset");
        for(let i = 0; i < datasets.length; i++) {
          datasetSelect.options[i + 1] = new Option(datasets[i], datasets[i]);
        }
        
        let teamSelect = document.getElementById("team");
        let statSelect = document.getElementById("stat");
        
        let updateOtherOptions = function() {
            
            // document.body.style.backgroundImage = `url("https://cdn.discordapp.com/avatars/426932991885967360/aba9162a3baf0d45bd21f1255187ae13.png?size=256)`;
                
            previousTeamOptions.forEach(o => o.parentElement.removeChild(o));
            previousTeamOptions = [];
            let teams = Object.keys(allData[dataset].teamData);
            for(let i = 0; i < teams.length; i++) {
              let option = document.createElement('option');
              option.text = teams[i];
              option.value = teams[i];
              teamSelect.appendChild(option);
              previousTeamOptions.push(option);
            }
                    
            let stats = allData[dataset].headers;
            for(let i = 0; i < stats.length; i++) {
              statSelect.options[i + 1] = new Option(allData[dataset].headers[i], stats[i]);
            }
          
        };
      
       /*let updateImage = function(){
         if(dataset="2791_2019dar"){
           document.body.style.backgroundImage = 'url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)';
         }
         else if(dataset = "3476_2015cc"){
           document.body.style.backgroundImage = 'url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)';
         }
         else if(dataset ="3476_2018cc" ){
           document.body.style.backgroundImage = 'url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)';
         }
         else if(dataset = "3476_2018roe"){
           document.body.style.backgroundImage = 'url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)';
         }
         else{
           document.body.style.backgroundImage = 'url(https://www.firstinspires.org/sites/default/files/uploads/frc/Blog/2019-frc-game-logo-small.jpg)';
         }
       }
       */
        
        datasetSelect.onchange = function() {
            if (this.selectedIndex) {
                dataset = this.value;
                updateOtherOptions();
                updateGraphs();
            }
        }
        
        document.getElementById("teamSelect").addEventListener("change", (e) => {
            if (e.target.value) {
                teamNumber = e.target.value;
                updateGraphs();
            }
          
        });
        
        statSelect.onchange = function() {
            if (this.selectedIndex) {
                field = this.selectedIndex - 1;
                updateGraphs();
            }
        }
        
    });
}

function updateGraphs() {
    let teamData = allData[dataset].teamData[teamNumber];
    let matches = [];
    let data = [];
    Object.keys(teamData).forEach(match => {
        matches.push("Match " + match);
        data.push(teamData[match][field]);
    });
    
    if(lastElement != null) {
        lastElement.parentElement.removeChild(lastElement);
    }
    
    lastElement = buildElement('canvas');
    let ctx = lastElement.getContext('2d');
    let chart = new Chart(ctx, {
        type: 'bar',

        // The data for our dataset
        data: {
            labels: matches,
            datasets: [{
                label: `Team ${teamNumber} ${allData["2791_2019dar"].headers[field]}`,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: data
            }]
        },

        // Configuration options go here
        options: {}
    });
    document.body.append(lastElement);
}