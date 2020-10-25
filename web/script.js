console.log("are a winnin son");

getStuff("/data/2791_2019dar.csv", (data) => {
  let lines = data.split("\n");
  var ctx = document.getElementById("myChart").getContext("2d");
  var content = lines.slice(1);
  console.log(content);
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "bar",

    // The data for our dataset
    data: {
      labels: lines[0].split(",").slice(2),
      datasets: [
        {
          label: "winnin",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: content[0].split(",").slice(2)
        }
      ]
    },

    // Configuration options go here
    options: {}
  });
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