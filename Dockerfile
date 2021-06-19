FROM node:14-alpine
WORKDIR /app
RUN apk update && apk add git && npm install -g truffle
COPY package*.json ./
# install server dependencies
RUN npm install
COPY ./client/package*.json ./client/
# install client dependencies
RUN cd client && npm install
COPY . .
# get CT logs and create empty .env file   
RUN node ./server/ctlogs/getCTLogs.js; touch .env