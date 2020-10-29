"use strict";

class CompetitionData {
    
    constructor(year, headers) {
        this.year = year;
        this.headers = headers;
        this.teamData = {};
    }
    
    addMatch(team, matchData) {
        if(!this.teamData.hasOwnProperty(team)) {
            this.teamData[team] = [];
        }
        this.teamData[team].push(matchData);
    }
    
}