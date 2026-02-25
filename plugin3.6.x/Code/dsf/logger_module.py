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


def setup_logfile(file_path, logfilename, debug_mode,logname="duetPrintGuard.log", progName="duetPrintGuard"):  
	global logger
	logfile = os.path.join(file_path, logfilename)
	if os.path.exists(logfile):
		os.remove(logfile)
	progName = progName + 'File'

	if debug_mode:
		logging.basicConfig(filename=logfile, encoding='utf-8',level=logging.DEBUG)
	else:
		logging.basicConfig(filename=logfile, encoding='utf-8',level=logging.INFO)
	logger = logging.getLogger(progName)
	logger.addHandler(logging.StreamHandler(sys.stdout))

	logger.info(f'''File logging started at {logfile}''')
	logger.info(f'''debug mode set to {debug_mode}''')
	logger.debug(f'''Debug logging enabled''')

	return logger