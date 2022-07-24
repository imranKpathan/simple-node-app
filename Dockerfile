FROM node:alpine
WORKDIR /app/simpleweb
COPY ./package.json ./
RUN npm install
COPY ./ ./
CMD ["npm", "start"]