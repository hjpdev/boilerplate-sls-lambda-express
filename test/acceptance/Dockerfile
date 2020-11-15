FROM node:14.15.0-alpine

WORKDIR /usr/src/acceptance

COPY package.json ./
RUN npm install

ADD . .

EXPOSE 8081

CMD npm run test
