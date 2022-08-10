FROM --platform=linux/amd64 node:16-bullseye-slim
# Create app directory
WORKDIR /app

COPY package*.json  /app/
COPY . /app/

RUN npm install --platform=linuxmusl
RUN npm install -g nodemon

EXPOSE 4000
CMD [ "nodemon", "start"]