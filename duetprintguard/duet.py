"""
Shared globals across modules
Used for duet3d version
useage:
from (.)duet import duet
 then reference variables with dot notation
 duet.<variable name>

"""
### ---------- ONLY CHANGE ENTRIES BETWEEN { and } -----------###
"""
duet = {
<values go in here>
}
"""

duet = {
"DWC" : True, # Don't change this
"HOST" : "0.0.0.0", # Usually unchanged
"PORT" : 8001
}

### ------------ DO NOT CHANGE BELOW HERE ------  ###

### ---------DO NOT CHANGE -------------------###
class dotdict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

duet = dotdict(duet)





