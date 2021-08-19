FROM node:14-alpine

WORKDIR /app

ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile
ADD . .
RUN yarn build
CMD ["node", "./dist/app.js"]
