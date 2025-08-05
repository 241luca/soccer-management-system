#!/bin/bash

# Script per chiudere tutti i terminali aperti

echo "Chiudendo tutti i terminali aperti..."

# Metodo 1: Chiudi l'applicazione Terminal completamente
osascript -e 'tell application "Terminal" to quit'

# Se vuoi essere più aggressivo e chiudere tutti i processi shell
# pkill -f "bash|zsh|sh"

echo "Tutti i terminali sono stati chiusi."
