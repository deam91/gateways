FROM node:16-bullseye

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm cache clean
RUN npm ci
COPY . /usr/src/app

EXPOSE 4200

CMD ["npm","start"]
