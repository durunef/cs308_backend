FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x /app/start.sh

# Create a startup script
RUN echo '#!/bin/sh\n\
echo "Waiting for MongoDB to be ready..."\n\
sleep 10\n\
echo "Running database seeding..."\n\
node seedProducts.js\n\
node seedAccounts.js\n\
echo "Starting the application..."\n\
node index.js' > /app/start.sh && \
chmod +x /app/start.sh

EXPOSE 3000
CMD ["sh", "/app/start.sh"] 