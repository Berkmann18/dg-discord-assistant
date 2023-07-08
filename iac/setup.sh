#!/bin/bash
sudo apt update -y && sudo apt upgrade -y
sudo apt install git -y
cd ~
echo Installing Node and NPM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source /root/.bashrc
nvm install node
sudo apt install npm -y
git clone https://github.com/Berkmann18/dg-discord-assistant.git
cd dg-discord-assistant
npm i
mv /root/config.json .
npm run update
npm start