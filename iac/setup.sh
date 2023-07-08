#!/bin/bash
sudo apt update -y && sudo apt upgrade -y
sudo apt install git -y
cd ~
echo Installing Node and NPM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source /root/.bashrc
nvm install node
nvm use node
git clone https://github.com/Berkmann18/dg-discord-assistant.git
cd dg-discord-assistant
npm i
mv /root/config.json .
npm i -g pm2
npm run update
pm2 start index.js --name "dg-discord-assistant"
pm2 startup
pm2 save
