"""
Logging module needs to be imported twice during startup
The first time imports the setup functions
After the setup funcrions have been called,
the logger can be imported 

All other modules simply need to import the logger

"""
import logging
import sys
import os

global logger

def setup_logfile(file_path, logfilename, progName="duetPrintGuard"):
	global logger

	logfile = os.path.join(file_path, logfilename)
	if os.path.exists(logfile):
		print(f'Removing old logfile {logfile}')
		os.remove(logfile)
		
	# Create logger    
	logger = logging.getLogger(__name__)
	logger.propagate = False
	
	# set initial logging level
	logger.setLevel(logging.DEBUG)

	# Create handler for console output - file output handler is created
	c_handler = logging.StreamHandler(sys.stdout)
	c_format = logging.Formatter(f'''{progName} "%(asctime)s [%(levelname)s] %(message)s"''')
	c_handler.setFormatter(c_format)
	logger.addHandler(c_handler)

	# Create handler for logfile
	f_handler = logging.FileHandler(logfile, mode='w', encoding='utf-8')
	f_format = logging.Formatter(f'''"%(asctime)s [%(levelname)s] %(message)s"''')
	f_handler.setFormatter(f_format)
	logger.addHandler(f_handler)

	logger.info(f'''Logging started at {logfile}''')

	return logger

def set_log_level(log_level,logger):  
	logger.info(f'Log level changed to {log_level}')

	if log_level == 'DEBUG':
		logger.setLevel(logging.DEBUG)
	elif log_level == 'INFO':
		logger.setLevel(logging.INFO)
	else: # warning
		logger.setLevel(logging.WARNING)

	return logger