# iBeaconServer
This is the nodejs server for receiving and decoding iBeacon packets via MQTT protocol

REST API (Go to the urls and check the json format)

1. http://155.69.146.180:8889/location/
Get the location data of each mac address

2. http://155.69.146.180:8889/location/rssi
Get the mean rssi of each beacon from each sniffer

3. http://155.69.146.180:8889/location/multipleRssi
Get 10 sets of rssi values within 5 minutes from the booting up of the server
