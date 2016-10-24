var express = require('express');
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var config = require('./config');
var localization = require('./localization');
console.log("server is running");

//express app and router
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = config.RESTport;
var router = express.Router();

//MAC and station list
var MACList = config.MACList;
var stationList = config.stationList;

//filter
var filterEnabled = config.filterEnabled;

//rss object
var rssObj = {};
var rssTimeObj = {};
var previousRssObj = {};
var previousRssTimeObj = {};
var rssDiffCriteria = config.rssDiffCriteria;

var meanRssObj = {};
var rssObjCounter = {};

var rssValueObj = {};
var multipleRssObj = {};
var multipleObjCounter = 0;
initRssObject();
initRssCounter();

//beacon location
var beaconLocation = {};


/****************************************** */
/********client connection***************** */
/****************************************** */
var client = mqtt.connect(config.connectOptions);


client.on('connect', function () {
    client.subscribe(config.topic);
    console.log("subscribing to " + config.topic);
})
 
client.on('message', function (topic, message) {
    //decode messages
    var decodedMessages = decodeBeaconMessage(message);

    //update rssObj
    updateRssObject(decodedMessages);

    //filter rss object to make smooth transitions
    if(filterEnabled){
        filterRssObject();
    }
    
    //update location
    beaconLocation = localization.updateLocation(rssObj);
})



/****************************************** */
/*************GET API********************** */
/****************************************** */
router.get('/', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.json(beaconLocation);   
});

//rssi data 
router.get('/rssi', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.json(meanRssObj);   
});

//multiple rssi data 
router.get('/multipleRssi', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.json(multipleRssObj);   
});

//POST API
router.post('/filter', function(req, res){
    var filterStatus = req.body.filterStatus;
    filterEnabled = filterStatus;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.json({
        message: "Filter changed successfully"
    });
});

//register router
app.use('/location', router);

//listen to port
app.listen(port);
console.log('Express server running on port ' + port);




/****************************************** */
/********Message Processing**************** */
/****************************************** */
function decodeBeaconMessage(msg){
    var decodedMessages = [];

    var time = Math.floor(Date.now());
    //var messageJSON = msg.payloadString;
    messageJSON = JSON.parse(msg.toString());

    //beacon station id
    var stationId = messageJSON.id;

    //raw beacon data array
    var rawBeaconMessages = messageJSON.raw_beacons_data.split(';');

    //remove the last empty element
    rawBeaconMessages.pop();

    for(var i = 0; i < rawBeaconMessages.length; i++)
    {
        //console.log('Start decoding...');
        var currentBeaconMessage = rawBeaconMessages[i];
        var decodedMessage = {};

        //decode beacon data
        decodedMessage.time = time;
        decodedMessage.stationId = stationId;
        decodedMessage.mac = currentBeaconMessage.substring(0, 12);
        decodedMessage.uuid = currentBeaconMessage.substring(12, 44);
        decodedMessage.major = currentBeaconMessage.substring(44, 48);
        decodedMessage.minor = currentBeaconMessage.substring(48, 52);
        decodedMessage.measuredPower = parseInt(currentBeaconMessage.substring(52, 54), 16) - 255;
        decodedMessage.batteryPower = currentBeaconMessage.substring(54, 56);
        if(decodedMessage.batteryPower == 'FF')
        {
            decodedMessage.batteryPower = 'Not available';
        }
        else{
            decodedMessage.batteryPower = parseInt(decodedMessage.batteryPower, 16) + '%';
        }
        decodedMessage.rssi = parseInt(currentBeaconMessage.substring(56, 58), 16) - 255;
        decodedMessages.push(decodedMessage);        
    }
    //console.log('decodedMessages: ');
    //console.log(decodedMessages);
    //console.log('End decoding...');
    return decodedMessages;
}


//Limit the RSSI derivative
function filterMessages(decodedMessages){ 
    var filteredMessages = [];

    decodedMessages.forEach(function(decodedMessage){

    });

    return decodedMessages;
}

//initialize rss object
function initRssObject(){
    MACList.forEach(function(mac){
        rssObj[mac] = {};
        rssTimeObj[mac] = {};
        previousRssObj[mac] = {};
        previousRssTimeObj[mac] = {};
        meanRssObj[mac] = {};
        rssObjCounter[mac] = {};  
        rssValueObj[mac] = {};      
    });
    multipleRssObj["data"] = [];
}

//initRssCounter
function initRssCounter(){
     MACList.forEach(function(mac){
        stationList.forEach(function(stationId){
            rssObjCounter[mac][stationId] = 0;
        });
     });
}


//update rss object
function updateRssObject(filteredMessages){
    filteredMessages.forEach(function(filteredMessage){
        //if the scanned message is from one of our beacons
        if(MACList.indexOf(filteredMessage.mac) > -1){
            var mac = filteredMessage.mac;
            var stationId = filteredMessage.stationId;
            rssObj[mac][stationId] = filteredMessage.rssi - filteredMessage.measuredPower;
            rssTimeObj[mac][stationId] = filteredMessage.time;

            //record multiple rss object
            rssValueObj[mac][stationId] = filteredMessage.rssi;
            if(multipleObjCounter < 5000){
                if(multipleObjCounter % 500 === 0){
                    multipleRssObj["data"].push(rssValueObj);
                }               
            }
            if(multipleObjCounter < Number.MAX_VALUE / 100){
                multipleObjCounter++;
            }
                    
            //update mean rss object
            if(rssObjCounter[mac][stationId] == 0){
                meanRssObj[mac][stationId] = filteredMessage.rssi;
            }else{
                meanRssObj[mac][stationId] = (meanRssObj[mac][stationId] * rssObjCounter[mac][stationId] + filteredMessage.rssi)/(rssObjCounter[mac][stationId] + 1);
            }

            meanRssObj[mac][stationId] = meanRssObj[mac][stationId].toFixed(2);
            rssObjCounter[mac][stationId]++;

            //if counter is too large, reset it
            if(rssObjCounter[mac][stationId] > Number.MAX_VALUE / 100){
                rssObjCounter[mac][stationId] = 0;
            }            
        } 
    });
}


//filter rss object
function filterRssObject(){
    if(previousRssObj !== null){
        MACList.forEach(function(mac){
            stationList.forEach(function(stationId){
                var rssDiff = rssObj[mac][stationId] - previousRssObj[mac][stationId];
                var timeDIff = (rssTimeObj[mac][stationId] - previousRssTimeObj[mac][stationId])/1000;
                var slope = rssDiff/timeDIff;
                if(slope > rssDiffCriteria){
                    //console.log("filtering for transition from " + previousRssObj[mac][stationId] + " to " + rssObj[mac][stationId] + " in " + timeDIff + " seconds");
                    rssObj[mac][stationId] = Math.round(previousRssObj[mac][stationId] + rssDiffCriteria * timeDIff);
                    //console.log("after filtering, the rss is " + rssObj[mac][stationId]);
                }else if(slope < -1 * rssDiffCriteria){
                    //console.log("filtering for transition from " + previousRssObj[mac][stationId] + " to " + rssObj[mac][stationId] + " in " + timeDIff + " seconds");
                    rssObj[mac][stationId] = Math.round(previousRssObj[mac][stationId] - rssDiffCriteria * timeDIff);
                    //console.log("after filtering, the rss is " + rssObj[mac][stationId]);
                }else{
                    //console.log("No filtering...");
                }
            })
        });
    }
    updatePreviousRssObj();
}


function updatePreviousRssObj(){
    MACList.forEach(function(mac){
        stationList.forEach(function(stationId){                
            previousRssObj[mac][stationId] = rssObj[mac][stationId];
            previousRssTimeObj[mac][stationId] = rssTimeObj[mac][stationId];
        });
    });

}


