sudo docker ps
sudo docker build -t orchestrator .
sudo docker tag orchestrator localhost:32000/orchestrator
sudo docker push localhost:32000/orchestrator
curl http://localhost:32000/v2/_catalog