#!/usr/bin/env python3
import sys

try:
    user_input = input("prompt: ")
    print(f"User input: {user_input}")
except EOFError:
    print("No input available (non-interactive mode)")
    sys.exit(0)
