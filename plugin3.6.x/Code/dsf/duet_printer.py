"""
Sends actions to duet printer and calls the configuration service
"""

import time
import requests
import json
import time

def _urlCall(url, cmd, post):
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
				r = requests.post(url, timeout=timelimit, data=cmd)

		except requests.ConnectionError as e:
			msg = 'Cannot connect to url - maybe a network error'
			logger.debug(msg)
		except requests.exceptions.Timeout as e:
			msg = 'Timed out - Is the printer turned on?'
			logger.debug(msg)
		except Exception as e:
			logger.info(f'Connection failure this a valid url ==> {url}')
			logger.debug(e)
		finally:
			if r and r.status_code in [200,204]: #204 is no content e.g. disconnect
				return r.status_code, r.text
			else:
				time.sleep(1)
				loop += 1 # Loop back and try again
	if r:
		msg = f'''Error - code = {r.status_code} payload = {r.text}'''
		logger.info(msg)
		return r.status_code, r.text
	else:
		msg = f'''Error - connection attempt failed'''
		logger.info(msg)
		return 0, ''

def _send_duet_code(command):
	# send a gcode command to Duet
	command = f'''/rr_gcode?gcode={command}'''  #Post includes command type in url
	code, _ = _urlCall(printerURL, command, False) # Post form - sent blindly
	if code in [200,204]:
		return True
	else:
		logger.info(f'Duet send failed with code {code}')
		logger.debug(f'{command}')
		return False
		
def _loginPrinter(printerUrl,duetPassword): #logon and get key parameters

	cmd = (f'''/rr_connect?sessionKey=yes&password={duetPassword}''') # using rr_ API
	code, _ = _urlCall(printerUrl, cmd, False)
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

def _duet_action(action):
	if action  == 'PAUSE':
		_duet_pause()
	elif action  == 'CANCEL':
		_duet_cancel()
	else:
		_duet_stop()

def _duet_stop():
	_duet_cancel() # pause then cancel
	time.sleep(2)
	msg = 'Stopping print'
	_send_duet_code(f'''echo "{msg}"''')
	if ACTION.STOP == '':
		_send_duet_code('M98 P"stop.g"') 
	else:
		_send_duet_code(ACTION.STOP) # Emergency stop is M112 - possibility?

def _duet_pause():
	msg = 'Pausing print'
	_send_duet_code(f'''echo "{msg}"''')
	if ACTION.PAUSE == '':
		_send_duet_code('M98 P"pause.g"')
	else:
		_send_duet_code(ACTION.PAUSE)	


def _duet_cancel():
	_duet_pause()
	time.sleep(2)
	msg = 'Cancelling print'
	_send_duet_code(f'''echo "{msg}"''')
	if ACTION.CANCEL == '':
		_send_duet_code('M98 P"cancel.g"')
	else:
		_send_duet_code(ACTION.CANCEL)		


def send_defect_notification():
	_send_macro()
	_send_ntfy()
	_send_pushover()

def get_printer_config(camera_uuid):
	return None
	
def suspend_print_job(camera_uuid, countdown_action):
	msg = f'Failure detected on printer'
	action = ACTION.ONFAILURE
	if action  == 'PAUSE':
		_duet_pause()
		_send_duet_code(f'''M291 S1 T0 P"Paused Printing"''')
	elif action  == 'CANCEL':
		_duet_cancel()
		_send_duet_code(f'''M291 S1 T0 P"Cancelled Printing"''')
	else:
		_duet_stop()
		_send_duet_code(f'''M291 S1 T0 P"Stopped the Printer"''')

def _send_macro():
	if MACRO.MACRO != '':
		logger.debug(f'Sending macro {MACRO.MACRO}')
		_send_duet_code(f'M98 {MACRO.MACRO}')


def _send_ntfy():
	if NTFY.TOPIC != '':
		logger.debug(f'Sending NTFY with topic {NTFY.TOPIC}')

		data=json.dumps({
			"Topic": NTFY.TOPIC,
			"Title": "PRINT FAILURE",
			"Priority": 5,
			"Message": NTFY.MESSAGE,
			})
	
	code, _ = _urlCall('https://ntfy.sh', data, True)
	if code in [200,204]:
		return True
	else:
		logger.info(f'NTFY send failed with code {code}')
		logger.debug(f'\n{data}\n')
		return False
	
def _send_pushover():
		logger.debug(f'Sending PUSHOVER')
		return


if __name__ == "__main__":    # Test setup
	import sys
	import os
	sys.path.append(os.path.dirname(__file__))
	from logger_module import (setup_logfile, set_log_level)
	from duet_config import get_DWC_config
	
	global logger
	file_path = sys.argv[1]
	LOGFILENAME = 'test.log'
	progName = 'test'
	CONFIGFILENAME = 'duetPrintGuard.config'

	# Create a logfile 
	logger = setup_logfile(file_path,LOGFILENAME,progName)
	# from logger_module import logger # Need to import after setup_logging is called
	logger.info(f'''{progName}''')

	if not get_DWC_config(file_path, CONFIGFILENAME,logger):
		print(f"Failed to load configuration from {file_path}. Please ensure the file exists and is properly formatted.")
		sys.exit(1)

	# Can now get config parameters
	from duet_config import (DUET , LOGGING, UI)

	# Set logging level
	logger = set_log_level(LOGGING.LEVEL,logger)

	from duet_config import DUET,ACTION,MACRO,NTFY,PUSHOVER
	printerURL = f'http://{DUET.IP}:{DUET.PORT}'
	
	_loginPrinter(printerURL,DUET.PASSWORD)
	_send_duet_code('M115') # Just a comms test results should show in DWC console
	suspend_print_job('test','test')
	send_defect_notification()
else:
	from duet_config import ACTION,MACRO,NTFY,PUSHOVER
	from logger_module import logger

