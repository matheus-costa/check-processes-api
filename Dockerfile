FROM node:alpine
WORKDIR /usr/scr/app

COPY . .
RUN npm install

EXPOSE 3000
CMD [ "npm", "run", "start.dev" ]