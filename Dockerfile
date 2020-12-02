FROM node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .

RUN npm install

USER node

EXPOSE 4040

CMD node server.js




