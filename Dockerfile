FROM node:14-alpine3.15

RUN apk add python2 g++ make
# Create app directory
WORKDIR /app
RUN yarn global add serve



COPY package*.json ./
RUN yarn install


EXPOSE 3000
CMD  "["yarn","run","start"]"

