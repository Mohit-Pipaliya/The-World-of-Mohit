import os
import subprocess

def run():
    try:
        print("Initializing git...")
        res = subprocess.run(["git", "init"], capture_output=True, text=True)
        print(f"STDOUT: {res.stdout}")
        print(f"STDERR: {res.stderr}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run()
