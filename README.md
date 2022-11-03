**m42** (message for two) is an Instant Messaging App.

_currently in development._

### feature

- no group chat, 1-on-1 only
- no chat history stored
- no login needed
- easy deploy

### deploy

1. clone this repo
2. rename the `env_temp` to `.env`
3. install dependencies and build

   ```bash
   npm i
   npm run build

   # or if you prefer yarn
   yarn
   yarn build
   ```

4. start the server

   ```bash
   npm run serve

   # or
   yarn serve
   ```

enjoy!

---

### development

#### first stage

- [x] UI
- [x] send text
- [x] security
  - [x] self-destroy when no activity
  - [x] 1-end session
  - [x] end-to-end encryption

#### second stage

- [ ] send files and images
- [ ] user selectable theme
- [ ] push notification
- [ ] notification sound
