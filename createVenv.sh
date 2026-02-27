VENV_DIR="./"
PLUGIN_VERSION="plugin3.6.x"
# make sure we are at the system python level
if [ -d "$VENV_DIR" ]
    then
    source ./venv/bin/activate
    deactivate
fi
#Create Venv if it does not exist
if [ ! -d "$VENV_DIR" ]
    then
		echo creating fresh venv
        python -m venv $VENV_DIRvenv --clear --system-site-packages --upgrade-deps

fi
source ./venv/bin/activate
python -m pip install -r ./$PLUGIN_VERSION/Code/dsf/requirements.txt
