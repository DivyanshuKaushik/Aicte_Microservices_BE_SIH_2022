#!/bin/bash
echo "Installing packages..."
cd users && npm install express-validator && cd ..
cd events && npm install express-validator && cd ..
cd venue && npm install express-validator && cd ..
cd alerts && npm install express-validator && cd ..
cd logs && npm install express-validator && cd ..
cd chat && npm install express-validator && cd ..
echo "Packages installed"