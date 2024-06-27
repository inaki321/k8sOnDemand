sudo docker ps
sudo docker build -t main-server .
sudo docker tag main-server localhost:32000/main-server
sudo docker push localhost:32000/main-server
curl http://localhost:32000/v2/_catalog