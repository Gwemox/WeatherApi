FROM node:9-alpine

MAINTAINER Thibault Buathier <thibault@milkywan.fr>

RUN apk update
RUN apk upgrade
RUN apk add bash

ADD . /web-server
WORKDIR /web-server

RUN npm install
EXPOSE 3000

CMD ["node", "index.js"]