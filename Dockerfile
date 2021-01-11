FROM node:12-slim

WORKDIR /home/node/giraffe

EXPOSE 8080

COPY . /home/node/giraffe

CMD ["yarn", "run", "prod"]
