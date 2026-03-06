import configparser
import os

global DUET, UI, LOGGING, ACTION, NOTIFICATION

# From https://gist.github.com/laywill/63d75b53e8a7a801d77f0dd2b97de54d
class DictToClass:
    def __init__(self, dictionary):
        for key, value in dictionary.items():
            if isinstance(value, dict):
                value = DictToClass(value)
            setattr(self, key, value)

def get_DWC_config(file_path,file_name,logger):
    global DUET, UI, LOGGING, ACTION, NOTIFICATION
    config_file = os.path.join(file_path, file_name)
    logger.debug(f"Looking for config file at {config_file}")

    if os.path.exists(config_file):
        config = configparser.ConfigParser()
        config.read(config_file)

        # Convert to dict
        # Source - https://stackoverflow.com/a/28990982
        config_dict = {s:dict(config.items(s)) for s in config.sections()}

        # Get the various sections
        duet_section = config_dict["DUET"]
        ui_section = config_dict["UI"]
        logging_section = config_dict["LOGGING"]
        action_section = config_dict["ACTION"]
        notification_section = config_dict["NOTIFICATION"]

        #Change the keys to UPPER
        config_dict_duet = {k.upper():v.upper() for k,v in duet_section.items()}
        config_dict_ui = {k.upper():v.upper() for k,v in ui_section.items()}
        config_dict_logging = {k.upper():v.upper() for k,v in logging_section.items()}
        config_dict_action = {k.upper():v.upper() for k,v in action_section.items()}
        config_dict_notification = {k.upper():v.upper() for k,v in notification_section.items()}

        #Convert to dot dict
        DUET = DictToClass(config_dict_duet)
        UI = DictToClass(config_dict_ui)
        LOGGING = DictToClass(config_dict_logging)
        ACTION = DictToClass(config_dict_action)
        NOTIFICATION = DictToClass(config_dict_notification)

        # Adjust types and values
        # DUET
        
        if not hasattr(DUET,'PASSWORD') : DUET.PASSWORD = 'reprap'
        UI.PORT = int(UI.PORT) or 80
        DUET.DWC = True
        DUET.FILE_PATH = file_path

        # UI
        if not hasattr(UI,'LOGLEVEL') : UI.LOGLEVEL = 'INFO'
        UI.HOST = '0.0.0.0'

        # LOGGING

        # ACTION

        # NOTIFICATION
        
        

        """  template for booleans 
        if DUET.DEBUG.lower() in ['true', '1', 't', 'y', 'yes']:
            DUET.DEBUG = True
        else:
            DUET.DEBUG = False
        """


        return True
    
    return False
