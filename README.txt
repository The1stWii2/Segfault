Recommended process manager: pm2

pm2 start segfault.js --watch

See package.json for dependencies.

Bot creates a log.txt in same directory as execution.

Bot creates a hash (command_hash) of the command files to skip registering identical commands in the same directory as execution.

Contents of expected .env is as follows:
APP_ID=
GUILD_ID=
DEV_GUILD_ID=
DISCORD_TOKEN=

WEBHOOKS=[Name]:[channel/ID],[etc.]