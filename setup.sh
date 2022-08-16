#!/bin/bash
echo "Installing packages..."
cd api-gateway && npm install && cd ..
cd users && npm install && cd ..
cd events && npm install && cd ..
cd venue && npm install && cd ..
cd mail_sms && npm install && cd ..
echo "Packages installed"