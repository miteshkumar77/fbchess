FROM node:latest

WORKDIR /client 
COPY client/src /client/src/ 
COPY client/*.json /client/
COPY client/public /client/public
RUN npm install 
RUN npm run build 

WORKDIR /server
COPY server/src /server/src/
COPY server/*.json /server/
COPY server/.env /server/
RUN mkdir dest
RUN npm install 
RUN npm run build 

CMD node dest/index.js
