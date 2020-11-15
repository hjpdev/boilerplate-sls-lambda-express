FROM node:14.15.0-alpine as builder

WORKDIR /usr/src/app

ADD . .
RUN npm run build


FROM node:14.15.0-alpine

COPY --from=builder /usr/src/app/dist/ dist
COPY package.json package-lock.json ./

RUN npm install

EXPOSE 8088
CMD npm start
