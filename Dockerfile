FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN rm -rf test-share/* volume/*

COPY . .

CMD [ "node", "index.js" ]
