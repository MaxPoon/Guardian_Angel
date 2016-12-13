import os
import sys
import random
import heapq
import time
import threading
import sqlite3
import json
from PIL import Image
from queue import Queue

toilets = []
width, height = 0, 0
def readFloorplan():
	global width, height
	floorplanRGB = Image.open("floorplan.png")
	width, height = floorplanRGB.size
	floorplanRGB = floorplanRGB.load()
	floorplan = [[None for i in range(height)] for j in range(width)]
	for row in range(height):
		for col in range(width):
			if floorplanRGB[col,row] == (255,255,255): #white
				floorplan[col][row] = 1
			elif floorplanRGB[col,row] == (0,0,0): #black
				floorplan[col][row] = 0
			else:	#green
				floorplan[col][row] = 2
	del floorplanRGB

	for col in range(width):
		for row in range(height):
			if floorplan[col][row] == 2:
				r = row
				while r<height:
					if floorplan[col][r] != 2: break
					r += 1
				r -= 1
				c = col
				while c<width:
					if floorplan[c][row] != 2: break
					c += 1
				c -= 1
				midR = int((row+r)/2)
				midC = int((col+c)/2)
				for x in range(col, c+1):
					for y in range(row, r+1):
						if x!=midC or y!= midR: floorplan[x][y] = 1

	global toilets
	for col in range(width):
		for row in range(height):
			if floorplan[col][row]==2: toilets.append((col,row))

	return floorplan

class Elderly(object):
	def __init__(self, id, x, y):
		self.id = id
		self.x = x
		self.y = y
		self.mode = "standing"
		self.target = None
		self.targetPosition = None
		self.path = None
		self.toiletTime = 100 
		self.targetToilet = None
		self.lastUpdateX = 0
		self.lastUpdateY = 0
		#the time interval between the current time and the last time the agent went toilet

def movement(q, floorplan, toilets, elderlies, elderly, id):
	global height, width, speed, numberOfAgents

	def distance(x,y, targetX,targetY):
		return ((x-targetX)**2 + (y- targetY)**2)**0.5

	def aStarPath(targetX, targetY):
		openStack = []
		currentState = (0, 0,(elderly.x, elderly.y), None) 
		visited = set()
		visited.add((elderly.x, elderly.y))
		#format of state: (heuristic, distance from starting point, (x, y), preivous)
		heapq.heappush(openStack, currentState)	
		while len(openStack)>0:
			state = heapq.heappop(openStack)
			x = state[2][0]
			y = state[2][1]
			if x == targetX and y == targetY: break
			dist = state[1]
			for i in (-1,0,1):
				for j in (-1,0,1):
					if i==0 and j==0: continue
					if x+i >= width or x+i<0 or y+j>=height or y+j<0:continue
					if floorplan[x+i][y+j] ==0 : continue
					if (x+i, y+j) in visited: continue
					newDistance = dist + distance(x,y,x+i,y+j)
					newHeuristic = newDistance + distance(x+i, y+j, targetX, targetY)
					newState = (newHeuristic, newDistance, (x+i, y+j), state)
					visited.add((x+i, y+j))
					heapq.heappush(openStack, newState)
		path = []
		while state is not None:
			x = state[2][0]
			y = state[2][1]
			path.append((x,y))
			state = state[3]
		path.reverse()
		return path

	def aStarPathDistance(targetX, targetY):
		openStack = []
		currentState = (0, 0,(elderly.x, elderly.y), None) 
		visited = set()
		visited.add((elderly.x, elderly.y))
		#format of state: (heuristic, distance from starting point, (x, y), preivous)
		heapq.heappush(openStack, currentState)	
		while len(openStack)>0:
			state = heapq.heappop(openStack)
			x = state[2][0]
			y = state[2][1]
			if x == targetX and y == targetY: return state[1]
			dist = state[1]
			for i in (-1,0,1):
				for j in (-1,0,1):
					if i==0 and j==0: continue
					if x+i >= width or x+i<0 or y+j>=height or y+j<0:continue
					if floorplan[x+i][y+j] != 1: continue
					if (x+i, y+j) in visited: continue
					newDistance = dist + distance(x,y,x+i,y+j)
					newHeuristic = newDistance + distance(x+i, y+j, targetX, targetY)
					newState = (newHeuristic, newDistance, (x+i, y+j), state)
					visited.add((x+i, y+j))
					heapq.heappush(openStack, newState)


	def wander():
		if elderly.mode != "wandering":
			elderly.mode = "wandering"
			x = random.randint(0, width-1)
			y = random.randint(0, height-1)
			while floorplan[x][y] != 1 or (x== elderly.x and y == elderly.y):
				x = random.randint(0, width-1)
				y = random.randint(0, height-1)
			elderly.targetPosition = (x,y)
			elderly.path = aStarPath(x,y)
			print("Id: ", elderly.id, "decided to go to ", elderly.targetPosition)
		# print("current position: ", elderly.x, elderly.y)
		# print("target position: ", elderly.targetPosition)
		nextPosition = elderly.path.pop(0)
		# print("next position:", nextPosition)
		walkingTime = distance(elderly.x , elderly.y, nextPosition[0], nextPosition[1])/speed
		time.sleep(walkingTime)
		elderly.toiletTime += walkingTime
		elderly.x = nextPosition[0]
		elderly.y = nextPosition[1]
		if distance(elderly.x, elderly.y, elderly.lastUpdateX, elderly.lastUpdateY)>20:
			q.put(("UPDATE Location  SET x = %s, y = %s, status = 'wandering' WHERE id = %s;" % ( elderly.x, elderly.y, elderly.id)))
			elderly.lastUpdateX = elderly.x
			elderly.lastUpdateY = elderly.y
		if (elderly.x, elderly.y) == elderly.targetPosition:
			print("Id: ", elderly.id, "arrived at ", elderly.targetPosition)
			elderly.mode = "standing"
			q.put(("UPDATE Location  SET status = 'standing' WHERE id = %s;" % ( elderly.id)))
			elderly.targetPosition = None
			elderly.path = None

	def goToTalk():
		if elderly.mode != "going to talk":
			elderly.mode = "going to talk"
			q.put(("UPDATE Location  SET status = 'going to talk' WHERE id = %s;" % ( elderly.id)))
			rand = random.randint(0, numberOfAgents-1)
			target = elderlies[rand]
			while target.mode != "standing" or target.id == elderly.id:
				time.sleep(1)
				rand = random.randint(0, numberOfAgents-1)
				target = elderlies[rand]
			print("Id: ", elderly.id, "starts going to talk with Id: ", target.id)
			elderly.target = target
			target.mode = "listening"
			q.put(("UPDATE Location  SET status = 'listening' WHERE id = %s;" % ( target.id)))
			elderly.path = aStarPath(target.x, target.y)
			elderly.path.pop(0)
		if distance(elderly.x, elderly.y, elderly.target.x, elderly.target.y) < 20:
			print("Id: ", elderly.id, "starts talking with Id: ", elderly.target.id)
			q.put(("UPDATE Location  SET status = 'talking' WHERE id = %s;" % ( elderly.id)))
			elderly.mode = "talking"
			talkingTime = random.randint(5, 60)
			time.sleep(talkingTime)
			print("Id: ", elderly.id, "finished talking with Id: ", elderly.target.id)
			elderly.target.mode = "standing"
			elderly.mode = "standing"
			q.put(("UPDATE Location  SET status = 'standing' WHERE id = %s;" % ( elderly.id)))
			q.put(("UPDATE Location  SET status = 'standing' WHERE id = %s;" % ( elderly.target.id)))
			elderly.target = None
		else:
			nextPosition = elderly.path.pop(0)
			walkingTime = distance(elderly.x , elderly.y, nextPosition[0], nextPosition[1])/speed
			time.sleep(walkingTime)
			elderly.x = nextPosition[0]
			elderly.y = nextPosition[1]
			if distance(elderly.x, elderly.y, elderly.lastUpdateX, elderly.lastUpdateY)>20:
				q.put(("UPDATE Location  SET x = %s, y = %s WHERE id = %s;" % ( elderly.x, elderly.y, elderly.id)))
				elderly.lastUpdateX = elderly.x
				elderly.lastUpdateY = elderly.y


	def goToilet():
		if elderly.mode != "going toilet":
			q.put(("UPDATE Location  SET  status = 'going toilet' WHERE id = %s;" % ( elderly.id)))
			elderly.mode = "going toilet"
			dist = None
			for toilet in toilets:
				tempDist = distance(elderly.x, elderly.y, toilet[0], toilet[1])
				if dist is None or tempDist < dist:
					dist = tempDist
					elderly.targetToilet = toilet
			print("Id: ", elderly.id, " going to the toilet at ", elderly.targetToilet)
			elderly.path = aStarPath(elderly.targetToilet[0], elderly.targetToilet[1])
			elderly.path.pop(0)
		if elderly.path[0] == elderly.targetToilet:
			while True:
				nobodyInside = True
				for agent in elderlies:
					if agent.x == elderly.targetToilet[0] and agent.y == elderly.targetToilet[1]:
						nobodyInside = False
						break
				if not nobodyInside: 
					print("Id: ", elderly.id, "is waiting outside the toilet at ", elderly.targetToilet)
					time.sleep(1)
					continue
				if nobodyInside:
					print("Id: ", elderly.id, "is in the toilet at ", elderly.targetToilet)
					elderly.x = elderly.targetToilet[0]
					elderly.y = elderly.targetToilet[1]
					elderly.mode = "in toilet"
					q.put(("UPDATE Location  SET  status = 'in toilet' WHERE id = %s;" % ( elderly.id)))
					time.sleep(random.random()*5)
					elderly.toiletTime = 0
					elderly.mode = "wandering"
					q.put(("UPDATE Location  SET status = 'wandering' WHERE id = %s;" % (elderly.id)))
					x = random.randint(0, width-1)
					y = random.randint(0, height-1)
					while floorplan[x][y] != 1 or (x== elderly.x and y == elderly.y):
						x = random.randint(0, width-1)
						y = random.randint(0, height-1)
					elderly.targetPosition = (x,y)
					elderly.path = aStarPath(x,y)
					return
		nextPosition = elderly.path.pop(0)
		walkingTime = distance(elderly.x , elderly.y, nextPosition[0], nextPosition[1])/speed
		time.sleep(walkingTime)
		elderly.x = nextPosition[0]
		elderly.y = nextPosition[1]
		if distance(elderly.x, elderly.y, elderly.lastUpdateX, elderly.lastUpdateY)>20:
			q.put(("UPDATE Location  SET x = %s, y = %s WHERE id = %s;" % ( elderly.x, elderly.y, elderly.id)))
			elderly.lastUpdateX = elderly.x
			elderly.lastUpdateY = elderly.y
		return

	while True:
		# print(elderly.toiletTime)
		if elderly.mode == "listening":
			time.sleep(3)

		if elderly.mode == "going to talk":
			goToTalk()

		if elderly.mode == "standing":
			if elderly.toiletTime > 100:
				rand = random.random()
				if rand < 2.718**(-(100/elderly.toiletTime)):
					goToilet()
					continue
			rand = random.random()
			if rand < 0.6: 
				waitTime = 10 * random.random()
				elderly.toiletTime += waitTime
				time.sleep(waitTime) #continue to stand
			elif rand < 0.7:
				goToTalk()
			else:
				wander()
		if elderly.mode == "wandering":
			wander()
		if elderly.mode == "going toilet":
			goToilet()



numberOfAgents = 10
speed = 50 #pixel per second
floorplan = readFloorplan()

#initialize the database
conn = sqlite3.connect('Elderlies.sqlite')
cur = conn.cursor()
cur.executescript('''
DROP TABLE IF EXISTS Location;
CREATE TABLE Location (
    id     INTEGER NOT NULL PRIMARY KEY UNIQUE,
    x      INTEGER,
    y      INTEGER,
    status TEXT
);
''')

elderlies = []
for i in range(numberOfAgents):
	x = random.randint(0, width-1)
	y = random.randint(0, height-1)
	while floorplan[x][y] != 1:
		x = random.randint(0, width-1)
		y = random.randint(0, height-1)
	elderlies.append(Elderly(i, x, y))
q = Queue()
for id, elderly in enumerate(elderlies):
	newThread = threading.Thread(target = movement, args = (q, floorplan, toilets,elderlies, elderly, i,))
	newThread.start()
	cur.execute('''INSERT OR IGNORE INTO Location (id, x, y, status) 

				   VALUES ( ?, ?, ?, ? )''', ( id, elderly.x, elderly.y, "standing") )
conn.commit()
while True:
	if q.qsize() == 0:
		time.sleep(0.1)
	else:
		# print(q.qsize())
		command = q.get()
		cur.execute(command)
		conn.commit()
