console.log("are a winnin son");



var ctx = document.getElementById("myChart").getContext("2d");
var chart = new Chart(ctx, {
  // The type of chart we want to create
  type: "bar",

  // The data for our dataset
  data: {
    labels: ["Swag Wins"],
    datasets: [
      {
        label: "Fortnite Dub Percentage",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: [732]
      }
    ]
  },

  // Configuration options go here
  options: {}
});

getStuff("/data/2791_2019dar.csv", (e) => {
  console.log(e);
});


function getStuff(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}