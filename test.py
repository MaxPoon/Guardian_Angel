import os, sys, random, heapq
from PIL import Image
width, height = 0, 0

def distance(x,y, targetX,targetY):
	return ((x-targetX)**2 + (y- targetY)**2)**0.5

def aStarPath(floorplan, X, Y, targetX, targetY):
	openStack = []
	currentState = (0, 0,(X, Y), None) 
	visited = set()
	visited.add((X, Y))
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
				if floorplan[x+i][y+j] != 1: continue
				if (x+i, y+j) in visited: continue
				newDistance = dist + distance(x,y,x+i,y+j)
				newHeuristic = newDistance + distance(x+i, y+j, targetX, targetY)
				newState = (newHeuristic, newDistance, (x+i, y+j), state)
				visited.add((x+i, y+j))
				heapq.heappush(openStack, newState)
	path = [(x,y)]
	while state is not None:
		x = state[2][0]
		y = state[2][1]
		path.append((x,y))
		state = state[3]
	path.reverse()
	return path

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

toilets = []
floorplan = readFloorplan()
path = aStarPath(floorplan, 100, 420, 130 ,420)
# print(path)
