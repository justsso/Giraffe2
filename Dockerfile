FROM node:12-slim

WORKDIR /home/node/tiger

EXPOSE 8080

COPY . /home/node/tiger

CMD ["yarn", "run", "prod"]
