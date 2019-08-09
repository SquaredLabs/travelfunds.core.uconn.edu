# Travel Funds

[![Build Status](https://drone.core.uconn.edu/api/badges/SquaredLabs/travelfunds.core.uconn.edu/status.svg)](https://drone.core.uconn.edu/SquaredLabs/travelfunds.core.uconn.edu)

## Setup

```sh
npm install
npx lerna bootstrap
```

## Development

```sh
npm run dev:backend
npm run dev:frontend
```

Setting up MailHog is highly recommended for local email delivery testing: https://github.com/mailhog/MailHog

## CAS in development

You can set the `CAS_DEV_USER` in `.env` to your NetID to automatically have your account logged in without needing to use the CAS system.

## Deploying to production

Change to deployment directory

```
cd /var/www/travelfunds.core.uconn.edu
```

Pull changes

```
git pull
```

bootstrap lerna

```
npx lerna bootstrap
```

Run build

```
npm run build
```

Migrate DB

```
NODE_ENV=production npx sequelize db:migrate
```

Reload pm2

```
pm2 reload travelfunds
```
