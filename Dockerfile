FROM node:latest
ENV DEBUG='*'
ADD . /app
WORKDIR /app
RUN npm install
CMD node app.js
