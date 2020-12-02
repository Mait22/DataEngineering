FROM node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .

RUN npm install

USER node

CMD node server.js




