import sys
import os
import configparser
import logging

def setup_logging(log_file, debug):
    if debug:
        logging_level = logging.DEBUG
    else:
        logging_level = logging.INFO
    logging.basicConfig(level=logging_level, format='%(asctime)s - %(levelname)s - %(message)s', filename=log_file, filemode='a')

def get_DWC_config(file_path):
    global PORT, DEBUG
    if os.path.exists(file_path):
        config = configparser.ConfigParser()
        config.read(file_path)
        DWC = config["DWC"]

        # Access values
        PORT = DWC["PORT"]
        DEBUG = DWC["DEBUG"]
        return True
    return False

def init(log_file, config_file):
    if not get_DWC_config(config_file):
        print(f"Failed to load configuration from {config_file}")
        return 1
    setup_logging(log_file,DEBUG)
    logging.info("Duet Print Guard plugin initialized successfully.")

    # Add further initialization code here
    


if __name__ == '__main__':
    config_file = sys.argv[1]
    config_file = "../sd/sys/duetPrintGuard/duetPrintGuard.config"
    config_file = os.path.join(os.path.dirname(__file__), config_file)
    config_file = os.path.abspath(config_file)
    sys_path = os.path.dirname(config_file)
    log_file = os.path.join(sys_path, "duetPrintGuard.log")
    print(f"SD sys path: {log_file}")
    print(f"Loading configuration from: {config_file}")
    sys.exit(init(log_file, config_file)) 