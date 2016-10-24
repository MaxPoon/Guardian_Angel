var MQTThost = '155.69.146.180';
var MQTTport = 8883;
var RESTport = 8889;

module.exports = {
    connectOptions: { 
        port: MQTTport, 
        host: MQTThost, 
        keepalive: 10000
    },
    topic: "/beacons",
    MACList: [
        "D0B5C28DBB39",
        "D0B5C28DBB84",
        "D0B5C28E4087",
        "D0B5C28E4369",
        "D0B5C28E4401",
        "D0B5C28E4402",
        "D0B5C28E45D4",
        "D0B5C28E4993",
        "D0B5C28E4C92",
        "D0B5C28E4F93",
        "123B6A1A7541",
        "123B6A1A7542"
    ],
    stationList: [
        "F4B85E03FB6F", 
        "F4B85E03F143", 
        "F4B85E03F26F", 
        "F4B85E03F376"
    ],
    filterEnabled: true,
    rssDiffCriteria: 2,
    firebaseConfig: {
        apiKey: "AIzaSyBPwcunGdc1WFsSUpiT92jecI2x2fT3qbo",
        authDomain: "lilyibeacon.firebaseapp.com",
        databaseURL: "https://lilyibeacon.firebaseio.com",
        storageBucket: "gs://lilyibeacon.appspot.com"
    },
    RESTport: RESTport
};
