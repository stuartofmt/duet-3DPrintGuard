
import re
from datetime import datetime, timedelta
import time
import requests
import json


def urlCall(url, cmd, post):
	# Makes all the calls to the printer
	# If post is True then make a http post call
	# Get commands need a leading /
	# Set defaults for return codes
	code = 0
	error = 'Unknown'

	timelimit = 5  # timout for call to return
	loop = 0
	limit = 2  # seems good enough to catch transients
	r = ''
	if post is False:
		url = url + cmd  # concatenate for GET
	while loop < limit:
		try:
			if post is False:
				msg = f'''Connection attempt: {loop} url: {url} post:{post}'''
				logger.debug(msg)
				r = requests.get(url, timeout=timelimit) # if using rr_ API
			else: #post includes the http command type in the url
				msg = f'''Connection attempt {loop} url: {url} cmd: {cmd} post:{post}'''
				logger.debug(msg)
				r = requests.post(url, timeout=timelimit, data=cmd) # If using rr_ API

		except requests.ConnectionError as e:
			msg = 'Cannot connect to the printer - likely a network error'
			logger.info(msg)
		except requests.exceptions.Timeout as e:
			msg = 'Timed out - Is the printer turned on?'
			logger.info(msg)
		except Exception as e:
			logger.info(f'Is this a valid url - http:// or https:/ or similar ==> {url}')
			logger.debug(e)
		finally:
			if r.status_code in [200,204]: #204 is no content e.g. disconnect
				return r.status_code, r.text
			else:
				time.sleep(1)
				loop += 1 # Loop back and try again
	
	msg = f'''Error - code = {r.status_code} payload = {r.text}'''
	logger.info(msg)

	return r.status_code, r.text

def send_duet_code(command):
	# send a gcode command to Duet
	command = f'''/rr_gcode?gcode={command}'''  #Post includes command type in url
	urlCall(printerURL, command, False) # Post form - sent blindly
		
def loginPrinter(printerUrl,duetPassword): #logon and get key parameters
	global printerURL
	printerURL = printerUrl
	cmd = (f'''/rr_connect?sessionKey=yes&password={duetPassword}''') # using rr_ API
	code, payload = urlCall(printerUrl, cmd, False)
	if code in [200,204]:
		return True
	elif code == 403:
		msg = 'Password is invalid'
	elif code == 503:
		msg = 'No more connections available'
	elif code == 502:
		msg = 'Incorrect DCS version'
	else:
		msg = f'''Is the Printer turned on?.'''
	
	msg = f'''Login issue: {msg} code = {code}'''
	logger.debug(msg)
	return False

def duet_stop():
	msg = 'Stopping print'
	duet_cancel() # pause then cancel
	send_duet_code(f'''M291 S1 T0 P"{msg}"''')
	send_duet_code('M98 P"stop.g"') # Emergency stop is M112 - possibility?

def duet_pause():
	msg = 'Pausing print'
	send_duet_code(f'''M291 S1 T0 P"{msg}"''')
	send_duet_code('M98 P"pause.g"')

def duet_cancel():
	duet_pause()
	msg = 'Cancelling print'
	send_duet_code(f'''M291 S1 T0 P"{msg}"''')
	send_duet_code('M98 P"cancel.g"')

if __name__ == "__main__":
	import sys
	import os
	sys.path.append(os.path.dirname(__file__))
	global printerURL
	printerURL = 'http://192.168.30.41'
	duetpassword = 'reprap'
	file_path = os.getcwd()
	LOGFILENAME = 'test.log'
	progName = 'test'
	
	from logger_module import (setup_logfile)
	global logger
	logger = setup_logfile(file_path,LOGFILENAME,progName)
	
	loginPrinter(printerURL,duetpassword)
	send_duet_code('M115')
	duet_stop()

