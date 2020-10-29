"use strict";

let allData = [];

function parseCsv(name, year, csv) {
    let lines = csv.split("\n").map(s => s.split(","));
    let headings = lines[0].slice(2);
    let data = new CompetitionData(year, headings);
    lines.slice(1).forEach(row => {
        data.addMatch(row[0], row.slice(2));
    });
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
        getAndParseCsv("2791_2019dar", 2019),
        getAndParseCsv("3476_2015cc", 2015),
        getAndParseCsv("3476_2018cc", 2018),
        getAndParseCsv("3476_2018roe", 2018),
        getAndParseCsv("3538_2020misou", 2020),
    ]).then(() => {
        console.log(allData);
        initPathing();
    });
}