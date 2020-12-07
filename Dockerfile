FROM node:12-alpine3.12

# Create app directory
WORKDIR /app
#RUN npm install -g yarn


COPY package*.json ./
RUN yarn install


EXPOSE 3000
CMD  ["yarn","run","start"]

