FROM node:18

WORKDIR /app

COPY package.json .
COPY ./src ./src

RUN npm install

CMD [ "npm", "run", "dev" ]
