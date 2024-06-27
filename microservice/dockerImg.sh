sudo docker ps
sudo docker build -t microservice .
sudo docker tag microservice localhost:32000/microservice
sudo docker push localhost:32000/microservice
curl http://localhost:32000/v2/_catalog