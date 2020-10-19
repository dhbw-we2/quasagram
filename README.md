# Quasagram
This is an instagram-like demo application developed during the lecture "Web Engineering 2" at the State University of Baden-Wuerttemberg in Karlsruhe, Germany.


## Install app dependencies
```bash
npm install
```

## Install backend dependencies
```bash
cd backend
npm install
```

## Add your Heroku project name
- On line 8 of `/backend/package.json` add your own Heroku project name
```
{
  ...
  "scripts": {
    ...
    "deploy": "heroku builds:create -a [YOUR HEROKU PROJECT NAME]"
  },
  ...
}
```

## Start the backend (from /backend folder)
```bash
npm start
```

## Start the app in development mode (from / folder)
```bash
quasar dev
```
View the posts endpoint at `http://localhost:3000/posts`

## Build the app for production
```bash
quasar build
```
