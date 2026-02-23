import sys
import os

from app import run
if __name__ == '__main__':
    print("Starting DuetPrintGuard application...")
    #print(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    #sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    #print(sys.path)
    sys.argv[0] = sys.argv[0].removesuffix('.exe')
    sys.exit(run())