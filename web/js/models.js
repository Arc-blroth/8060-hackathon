"use strict";

class CompetitionData {
    
    constructor(year, headings) {
        this.year = year;
        this.headings = headings;
        this.teamData = {};
    }
    
    addMatch(team, matchData) {
        if(!this.teamData.hasOwnProperty(team)) {
            this.teamData[team] = [];
        }
        this.teamData[team].push(matchData);
    }
    
}