# M42

**m42** (message for two) is an Instant Messaging App.

> [!IMPORTANT]  
> A refreshed version of M42 is being developed, this time we are using Cloudflare Workers/Pages as the backend service and front-end hosting, expecting a really fast and flexible deployment experience with multiple new features and better UX, stay tuned!


## Features

- 🔐 end-to-end encryption
- ☝️ no group chat, 1-on-1 only
- 😎 no chat history stored
- 🫣 no login needed
- 🫡 1-end session
- ☠️ self-destroy room when no activity
- ⚙️ easy deploy

## Deploy

### Prerequisites

- nodejs 12+
- npm 6+

```bash
# clone repo
git clone https://github.com/jw-12138/m42.git
cd m42

# rename `env_temp` to `.env`
cp env_temp .env

# install dependencies
npm i

# build m42
npm run build

# run m42 server
npm run serve
```

now visit `localhost:5009`, enjoy!
