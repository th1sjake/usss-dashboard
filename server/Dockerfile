FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# We will run prisma generate later in the entrypoint or manually
# RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
