"""

settingsFileName = printguard.config
def parseSettingsFile(filename)
settingsFile = os.path.normpath(os.path.join(pluginPath,fileneme))
			logger.debug(f'Processing requirements file: {reqfile}')
			with open(settingsFile, 'r') as f:
				for line in f:
					line = line.strip()
					if line == '' or line.startswith('#'):
						continue  # skip blank lines and comments
					updatedModuleList.append(line)
"""