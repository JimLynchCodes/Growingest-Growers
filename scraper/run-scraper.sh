#!/bin/bash -l

source ~/.bashrc
source ~/.nvm/nvm.sh
source ~/.profile

# Print some nice things in the logs.
printf "=======================================\n\n"
printf "Running Growingest Growers Scraper...\n"
printf "$(date)\n\n"

cd ~/Git-Projects/Growingest-Growers/scraper

nvm use

npm i

npm run start:timed

printf "\nGrowingest Growers Scraper cronjob has completed!\n"
