
# push locally on docker registry (local)
sudo docker ps
sudo docker build -t main-server .
sudo docker tag main-server localhost:32000/main-server
sudo docker push localhost:32000/main-server
curl http://localhost:32000/v2/_catalog


# push to my dockerhub pubic
docker buildx build --platform linux/arm64 -t inaki99/simple-deploy-arm64:latest --push . 