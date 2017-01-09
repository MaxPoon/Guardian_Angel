from flask import Flask
import sqlite3
import json

conn = sqlite3.connect('Elderlies.sqlite')
cur = conn.cursor()
app = Flask(__name__)
meterPerPixel = 0.05

@app.route('/location')
def get_location():
	done = False
	while not done:
		try:
			cur.execute('SELECT * FROM Location')
			done = True
		except Exception as e:
			print("try again")
		finally:
			pass
	d = {}
	for row in cur:
		d[row[0]] = ( row[1]*meterPerPixel, row[2]*meterPerPixel, row[3])
	return json.dumps(d, sort_keys=True, indent=4)

@app.route('/toilet')
def get_toilet():
	done = False
	while not done:
		try:
			cur.execute('SELECT * FROM Toilet')
			done = True
		except Exception as e:
			print("try again")
		finally:
			pass
	d = {}
	for row in cur:
		d[row[0]] = ( row[1]*meterPerPixel, row[2]*meterPerPixel)
	return json.dumps(d, sort_keys=True, indent=4)

if __name__ == "__main__":
	app.run(port=8889)