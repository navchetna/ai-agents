FROM node:latest
ARG SERVER_URL

# Set the working directory in the container
WORKDIR /usr/src/app

# Install app dependencies
COPY ui/package*.json ./

RUN npm install

# Bundle app source
COPY ui/ .

ENV NEXT_PUBLIC_BACKEND_URL=$SERVER_URL
# Build your Next.js app for production
RUN npm run build

# Start the application
CMD ["npm", "start"]