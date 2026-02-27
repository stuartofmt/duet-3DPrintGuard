"""
The she-bang is not required if called with fully qualified paths
The plugin manager does this.  Otherwise use ...
Standard python install e.g.
#!/usr/bin/python3 -u
Venv python install e.g.
#! <path-to-virtual-environment/bin>python -u
"""
# 3D Printer spaghetti detection

# Author Stuartofmt - chunks of code sourced from various internet examples
# Released under The MIT License. Full text available via https://opensource.org/licenses/MIT

# This is more-or-less a wrapper for the detection app PrintGuard.
# https://github.com/oliverbravery/PrintGuard
# This plugin modifies the original with some changes in UI use as well as minor augmentations
# to make it more suited to the DWC environment

"""
Version 0.1 - Initial release
"""

import sys
import os
import socket

sys.path.append(os.path.dirname(__file__))

from logger_module import setup_logfile
from duet_config import get_DWC_config

global progName, progVersion
progName = 'duetPrintGuard'
progVersion = '0.0.0'
# Min python version
pythonMajor = 3
pythonMinor = 8

CONFIGFILENAME = 'duetPrintGuard.config'
LOGFILENAME = 'duetPrintGuard.log'

def checkIP(host,port):
    #  Check to see if the requested IP and Port are available for use
    ip_address = '0.0.0.0'
    if port != 0:
        #  Get the local ip address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(('10.255.255.255', 1))  # doesn't even have to be reachable
            ip_address = s.getsockname()[0]
        except Exception as e:
            logger.warning(f'''Make sure IP address {ip_address} is reachable and unique''')
            logger.warning(f'''{e}''')
        finally:
            s.close()

        try:
            sock = socket.socket()
        except Exception as e:
            logger.critical(f'''Unknown error trying to open Port {port}''')
            logger.critical(f'''{e}''')
            force_quit(1)  
        finally:
            if sock.connect_ex((host, port)) == 0:
                logger.critical(f'''Port {port} is already in use.''')
                force_quit(1)
    else:
        logger.critical('No port number was provided - terminating the program')
        force_quit(1)
    ip_address = '0.0.0.0'
    logger.info(f'''IP address {ip_address} with port {PORT} is available and will be used for the server''')
    return ip_address

def force_quit(code):
    logger.critical(f'''Terminating the program with exit code {code}''')
    sys.exit(code)

def start(file_path):

    global logger
    #from logger_module import logger # Need to import after setup_logging is called

    print(f"Calling config with {file_path}")
    if not get_DWC_config(file_path, CONFIGFILENAME):
        print(f"Failed to load configuration from {file_path}. Please ensure the file exists and is properly formatted.")
        force_quit(1)
    
    # Add in logfile and set logging level based on config
    setup_logfile(file_path,LOGFILENAME,DEBUG,progName)
    from logger_module import logger # Need to import after setup_logging is called
    logger.info(f'''{progName} -- {progVersion}''')

    # Exit if invalid  IP and Port combination is provided
    ip_address = checkIP(HOST, PORT)

    # DWC is used to modify the UI and some of the functionality of the original PrintGuard app
    DWC = True 
    from app import appstartup
    appstartup(DWC, HOST, PORT, file_path)


if __name__ == '__main__':
    print(f' passed in {sys.argv[]}')
    #start(sys.argv[1])