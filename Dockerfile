FROM node:12-slim

WORKDIR /home/node/puma

EXPOSE 8080

COPY . /home/node/puma

CMD ["yarn", "run", "start:production"]
