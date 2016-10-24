var firebase = require("firebase");
var math = require('mathjs');
var config = require('./config');
var stationList = config.stationList;
var macList = config.MACList;

//station info
var stationLocation = {};

stationLocation[stationList[0]] = {
    x: 3.5,
    y: 7.9
};
stationLocation[stationList[1]] = {
    x: 8.5,
    y: 8.9
};
stationLocation[stationList[2]] = {
    x: 0.1,
    y: 8.2
};
stationLocation[stationList[3]] = {
    x: 4.4,
    y: 0.1
};

//for localization algorithm performance testing purpose
var realBeaconLocation = {};

realBeaconLocation[macList[0]] = {
    x: 3.8,
    y: 9.0
};
realBeaconLocation[macList[1]] = {
    x: 5.8,
    y: 6.2
};
realBeaconLocation[macList[2]] = {
    x: 5.9,
    y: 4.0
};
realBeaconLocation[macList[3]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[4]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[5]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[6]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[7]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[8]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[9]] = {
    x: 4.2,
    y: 9.7
};
realBeaconLocation[macList[10]] = {
    x: 0.1,
    y: 7.0
};
realBeaconLocation[macList[11]] = {
    x: 0.1,
    y: 7.0
};

//beacon location
var beaconLocation = {};
beaconLocation["type"] = "Beacon Location";

var historicalLocations = {};
for(var i = 0; i < macList.length; i++){
    historicalLocations[macList[i]] = {};
    historicalLocations[macList[i]].x = [];
    historicalLocations[macList[i]].y = [];
}

var historicalDataLength = 1000;

//firebase
var firebaseConfig = config.firebaseConfig;
firebase.initializeApp(firebaseConfig);
var ref = firebase.database().ref();
var messagesRef = ref.child("test");

//updateLocation
function updateLocation(rssObj){ 
    beaconLocation["data"] = [];   
    for(var mac in rssObj){
        if(rssObj.hasOwnProperty(mac)){
            var stationDist = convertToDistance(rssObj[mac]);//return {x: xCoordinate, y: yCoordinate}
            var loc = getLocation(stationDist);
            loc.mac = mac;
            

            //add to historical locations
            historicalLocations[mac].x.push(loc.x);
            historicalLocations[mac].y.push(loc.y);

            if(historicalLocations[mac].x.length > historicalDataLength){
                historicalLocations[mac].x.shift();
                historicalLocations[mac].y.shift();
            }
            var currentError = getEuclideanDistance(realBeaconLocation[mac].x, realBeaconLocation[mac].y, loc.x, loc.y);
            var meanError = calculateMeanError(mac);

            loc.currentError = currentError.toFixed(2);
            loc.meanError = meanError.toFixed(2);

            beaconLocation["data"].push(loc);
        }
    }
    return beaconLocation;
}


//convertToDistance
function convertToDistance(stationRSS){
    var stationDist = {};
    for(var station in stationRSS){
        if(stationRSS.hasOwnProperty(station)){
            var distance = getDistance(stationRSS[station]);
            stationDist[station] = distance;
        }
    }
    return stationDist;
}


//get distance based on path loss
function getDistance(pathLoss){
    var distance = Math.pow(10, -(pathLoss + 13.5)/28.9);
    return distance;
}

//get physical distance between two points
function getEuclideanDistance(x1, y1, x2, y2){
    diffX = x1 - x2;
    diffY = y1 - y2;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}


//getLocation
function getLocation(stationDist){
    var minCost = 100;
    var optimalX, optimalY;
    for(var i = 0; i <= 100; i++){
        for(var j = 0; j <= 100; j++){
            var x = i/10; 
            var y = j/10;
            var cost = computeCost(x, y, stationDist);
            if(cost < minCost){
                optimalX = x;
                optimalY = y;
                minCost = cost;
            }
        }
    }
    return {
        x: optimalX.toFixed(1),
        y: optimalY.toFixed(1)
    }
}


//computeCost
function computeCost(x, y, r){
    var cost = 0;
    for(var station in r){
        if(r.hasOwnProperty(station)){
            var distanceToStation = getEuclideanDistance(x, y, stationLocation[station]["x"], stationLocation[station]["y"]);
            var stationRadius = r[station];
            cost = cost + Math.abs(distanceToStation - stationRadius)/stationRadius;
        }
    }
    return cost;
}


function calculateMeanError(mac){
    var realX = realBeaconLocation[mac].x;
    var realY = realBeaconLocation[mac].y;
    var xMatrix = math.matrix(historicalLocations[mac].x);
    var yMatrix = math.matrix(historicalLocations[mac].y);

    var xDiffMatrix = math.subtract(xMatrix, realX);
    var yDiffMatrix = math.subtract(yMatrix, realY);
    
    var distanceSqureMatrix = math.add(math.square(xDiffMatrix), math.square(yDiffMatrix));

    return math.sqrt(math.mean(distanceSqureMatrix));
}



module.exports = {
    updateLocation: updateLocation
}