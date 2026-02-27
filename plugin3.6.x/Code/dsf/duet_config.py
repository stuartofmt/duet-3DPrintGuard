import configparser
import os

def get_DWC_config(file_path,file_name):
    print("!!!!!!!!!!!!!!!!")
    global PORT, DEBUG, HOST
    config_file = os.path.join(file_path, file_name)
    print(f"Looking for config file at {config_file}")
    if os.path.exists(file_path):
        config = configparser.ConfigParser()
        config.read(config_file)
        DWC = config["DWC"]

        # Access values
        PORT = int(DWC["PORT"])
        DEBUG = DWC["DEBUG"]
        HOST = str(DWC["HOST"])
        return True
    return False

print("Config loaded")