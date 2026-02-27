import configparser
import os

global DUET

# From https://gist.github.com/laywill/63d75b53e8a7a801d77f0dd2b97de54d
class DictToClass:
    def __init__(self, dictionary):
        for key, value in dictionary.items():
            if isinstance(value, dict):
                value = DictToClass(value)
            setattr(self, key, value)

def get_DWC_config(file_path,file_name):
    global DUET
    config_file = os.path.join(file_path, file_name)
    print(f"Looking for config file at {config_file}")

    if os.path.exists(config_file):
        config = configparser.ConfigParser()
        config.read(config_file)

        # Convert to dict
        # Source - https://stackoverflow.com/a/28990982
        config_dict = {s:dict(config.items(s)) for s in config.sections()}

        # We only want the DUET section
        duet_section = config_dict["DUET"]

        #Change the keys to UPPER
        config_dict_duet = {k.upper():v.upper() for k,v in duet_section.items()}

        #Convert to dot dict
        DUET = DictToClass(config_dict_duet)

        # Adjust types and values
        DUET.PORT = int(DUET.PORT)

        if DUET.DEBUG.lower() in ['true', '1', 't', 'y', 'yes']:
            DUET.DEBUG = True
        else:
            DUET.DEBUG = False

        # Default Values
        DUET.HOST = '0.0.0.0'
        DUET.DWC = True
        DUET.FILE_PATH = file_path

        return True
    
    return False
