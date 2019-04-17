FROM node:8
WORKDIR /home/node/app
COPY package.json package-lock.json ./
RUN npm install
COPY ./packages/travelfunds/package.json ./packages/travelfunds/package-lock.json ./packages/travelfunds/
COPY ./packages/travelfunds-api/package.json ./packages/travelfunds-api/package-lock.json ./packages/travelfunds-api/
COPY ./packages/travelfunds-db/package.json ./packages/travelfunds-db/package-lock.json ./packages/travelfunds-db/
COPY ./packages/travelfunds-env/package.json ./packages/travelfunds-env/package-lock.json ./packages/travelfunds-env/
COPY ./packages/travelfunds-front/package.json ./packages/travelfunds-front/package-lock.json ./packages/travelfunds-front/
COPY ./packages/travelfunds-mailer/package.json ./packages/travelfunds-mailer/package-lock.json ./packages/travelfunds-mailer/
COPY lerna.json ./
RUN npx lerna bootstrap
COPY ./ ./
EXPOSE 3000
RUN npm run build
CMD ["npm","start"]
