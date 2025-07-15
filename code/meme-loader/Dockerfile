FROM node:18

WORKDIR /app

COPY package.json .
COPY ./src ./src
COPY ./memes ./memes

RUN npm install

CMD [ "npm", "run", "dev" ]
