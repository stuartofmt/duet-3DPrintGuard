"""
Sends actions to duet printer and calls the configuration service
"""

import time
import requests
import json
import time
import sys

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

def _duet_pause():
	msg = 'Pausing print'
	_send_duet_code(f'''echo "{msg}"''')
	if ACTION.PAUSE == '':
		_send_duet_code('M25')
	else:
		_send_duet_code(ACTION.PAUSE)	


def _duet_cancel():
	_duet_pause()
	time.sleep(2)
	msg = 'Cancelling print'
	_send_duet_code(f'''echo "{msg}"''')
	if ACTION.CANCEL == '':
		_send_duet_code('M2') # Currently equivalent of M0
	else:
		_send_duet_code(ACTION.CANCEL)		


def duet_send_notification(alert):
	logger.critical(f'Defect notification {alert}')
	_send_macro(alert)
	_send_ntfy(alert)
	_send_pushover(alert)
	return True

def get_printer_config(camera_uuid):
	return None
	
def suspend_print_job(camera_uuid, action):
	msg = f'Failure detected on printer {camera_uuid} with countdown action {countdown_action}'
	logger.critical(msg)
	
	#action = ACTION.ONFAILURE
	if action  == 'pause_print':
		_duet_pause()
		_send_duet_code(f'''M291 S1 T0 P"Paused Printing"''')
	elif action  == 'cancel_print':
		_duet_cancel()
		_send_duet_code(f'''M291 S1 T0 P"Cancelled Printing"''')
	else:
		logger.critical(f'Unknown action {action}')


def _send_macro(alert):
	if MACRO.MACRO != '':
		logger.debug(f'Sending macro {MACRO.MACRO}')
		_send_duet_code(f'M98 {MACRO.MACRO}')


def _send_ntfy(alert):
	if NTFY.TOPIC != '':
		logger.debug(f'Sending NTFY with topic {NTFY.TOPIC}')
		title = ''
		message = ''
		if NTFY.TITLE !='':
			title = NTFY.TITLE
		else:
			title = alert.title

		if NTFY.MESSAGE !='':
			message = NTFY.MESSAGE
		else:
			message = alert.body		

		data=json.dumps({
			"Topic": NTFY.TOPIC,
			"Title": title,
			"Priority": 5,
			"Message": message,
			})
	
	code, _ = _urlCall('https://ntfy.sh', data, True)
	if code in [200,204]:
		return True
	else:
		logger.info(f'NTFY send failed with code {code}')
		logger.debug(f'\n{data}\n')
		return False
	
def _send_pushover(alert):
		logger.debug(f'Sending PUSHOVER')
		return


if __name__ == "__main__":    # Test setup
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
	from duet_config import DUET,ACTION,MACRO,NTFY,PUSHOVER

	# Set logging level
	logger = set_log_level(LOGGING.LEVEL,logger)

	printerURL = f'http://{DUET.IP}:{DUET.PORT}'
	
	_loginPrinter(printerURL,DUET.PASSWORD)
	_send_duet_code('M115') # Just a comms test results should show in DWC console
	suspend_print_job('test','test')
	duet_send_notification('test')
else:
	# This is used when running as module
	from duet_config import DUET,ACTION,MACRO,NTFY,PUSHOVER
	from logger_module import logger
	printerURL = f'http://{DUET.IP}:{DUET.PORT}'
	
	if _loginPrinter(printerURL,DUET.PASSWORD):
		logger.info(f'Successful login to printer at {printerURL}')
	else:
		logger.critical(f'Failed to login to printer at {printerURL}')
		sys.exit(1)


