# Growingest-Growers

First, set up the environment variables in each env file:

- /scraper/.env
- /notifier/.env


Ensure you have `nvm` installed on the host system.

(In either scraper or notifier folders)
```
nvm i && nvm use
```

You may also need to manually create the "logs" folders:
```
mkdir ~/Git-Projects/Growingest-Growers/scraper/logs/
mkdir ~/Git-Projects/Growingest-Growers/notifier/logs/
```

On ubuntu, may need to do this as well for scraper to work:
```
sudo apt-get update
sudo apt-get install -y libgbm-dev
```

Assumes you are cloing the "Growing-Growers" repo into "~/Git-Projects" on your host sysmtem...

Use this crontab to schedule it every weekday at 5:32pm:

```
32 17 * * 1-5  ~/Git-Projects/Growingest-Growers/scraper/run-scraper.sh >> ~/Git-Projects/Growingest-Growers/scraper/logs/cron-logs_`date +\%Y-\%m-\%d`.log 2>&1 && ~/Git-Projects/Growingest-Growers/notifier/run-notifier.sh >> ~/Git-Projects/Growingest-Growers/notifier/logs/cron-logs_`date +\%Y-\%m-\%d`.log 2>&1 &
```