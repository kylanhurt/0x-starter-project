FROM node:9
WORKDIR /app
COPY package.json /app
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn install
RUN yarn
COPY . /app
EXPOSE 3000
CMD ["npm", "run", "go"]