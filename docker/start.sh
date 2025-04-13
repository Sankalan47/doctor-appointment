# docker/start.sh
#!/bin/sh

# Start Node.js application with PM2
cd /app/server
pm2-runtime start dist/index.js --name "app"

# Start Nginx
nginx -g 'daemon off;'