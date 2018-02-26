FROM node:9-alpine

MAINTAINER Thibault Buathier <thibault@milkywan.fr>

ADD . /web-server
WORKDIR /web-server

RUN npm install
EXPOSE 3000

CMD ["node", "index.js"]