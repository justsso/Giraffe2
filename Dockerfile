FROM node:12

WORKDIR /home/node/puma

EXPOSE 8080

COPY . /home/node/puma

CMD ["yarn", "run", "start:production"]
