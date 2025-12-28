FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y libgomp1

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]