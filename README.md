# Guardian_Angel
### Install Dependencies
Download and install python3 and pip from [here](https://www.python.org/downloads).
Install sqlite database from [sqlite download page](http://www.sqlite.org/download.html) .
```
sudo pip3 install Pillow
sudo pip3 install sqlite3
sudo pip3 install Flask
```
Install sqlite database from [sqlite download page](http://www.sqlite.org/download.html) .

### Usage

Download this repository.
Copy the floorplan to this folder and name it as floorplan.png

Run the simulator:
```
python simulator.py
```

Run the server on port 8889:
```
python simulator_server.py
```

To get the elderlies' locations, send a get request to http://127.0.0.1:8889/location
![](https://github.com/MaxPoon/Guardian_Angel/blob/master/response.png) 

Response format (json):
```
{
  id: [x, y, status]
}
```

### Parameters
Below are some parameters in the python program you may change:
##### simulator.py:
```
line 290: numberOfAgents = 10
line 291: speed = 50 #pixel per second
```
##### simulator_server.py:
```
line 8: meterPerPixel = 0.05
```
