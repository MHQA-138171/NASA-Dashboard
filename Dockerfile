FROM node:lts-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY Client/package.json Client/
RUN npm run install-client --only=production

COPY Server/package.json Server/
RUN npm run install-server --only=production

COPY Client/ Client/
RUN npm run build --prefix Client

COPY Server/ Server/

USER node

CMD [ "npm","start","--prefix","Server" ]

EXPOSE 8000




