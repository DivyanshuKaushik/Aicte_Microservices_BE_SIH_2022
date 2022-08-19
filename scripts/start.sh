echo "starting containers..."
sudo docker-compose up -d
echo "containers started"
echo "restarting nginx..."
sudo service nginx restart
echo "nginx restarted"