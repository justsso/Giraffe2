FROM node:12-slim

WORKDIR /home/node/giraffe

EXPOSE 8080

COPY . /home/node/giraffe

RUN npm install yarn

RUN yarn run build

CMD [ "yarn run prod" ]