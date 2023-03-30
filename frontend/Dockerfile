FROM node:16-bullseye

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm ci
RUN npm install -g @angular/cli@14.2.11
COPY . /usr/src/app

EXPOSE 4200

CMD ["ng","serve","--host", "0.0.0.0"]
