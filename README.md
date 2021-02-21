# Growingest-Growers

First, set up the environment variables in each env file:

- /scraper/.env
- /notifier/.env


Ensure you have `nvm` installed on the host system.

```
nvm i && nvm use
```

Assumes you are cloing the "Growing-Growers" repo into "~/Git-Projects" on your host sysmtem...

Use this crontab to schedule it every weekday at 5:32pm:

```
32 17 * * 1-5  ~/Git-Projects/Growingest-Growers/scraper/run-scraper.sh >> ~/Git-Projects/Growingest-Growers/scraper/logs/cron-logs_`date +\%Y-\%m-\%d`.log 2>&1 && ~/Git-Projects/Growingest-Growers/notifier/run-notifier.sh >> ~/Git-Projects/Growingest-Growers/notifier/logs/cron-logs_`date +\%Y-\%m-\%d`.log 2>&1
```