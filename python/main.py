import os
import sys
import subprocess

def main():
    # Change current working directory to the directory of main.py so relative paths resolve correctly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    # Launch log.py using the active python interpreter
    subprocess.run([sys.executable, "log.py"])

if __name__ == "__main__":
    main()
