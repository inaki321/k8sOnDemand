
# Start registry to alocate my docker images here

if sudo docker ps -a --filter "name=registry" --format "{{.Names}}" | grep -q "^registry$"; then
    echo "registry for docker already registered..."
    if [ "$(sudo docker inspect -f '{{.State.Running}}' registry 2>/dev/null)" == "true" ]; then
        echo "registry is already running, no need to start it..."
    else
        echo "Starting registry container, not started yet..."
        sudo docker start registry
    fi
else
    echo "Need to create registry"
    sudo docker run -d -p 32000:5000 --name registry registry:2
fi

sleep 2

echo "Pushing to docker registry main-server to localhost:32000"
sudo docker build -t main-server ../../app/
sudo docker tag main-server localhost:32000/main-server
sudo docker push localhost:32000/main-server


echo "Pushing to docker registry microservice to localhost:32000"
sudo docker build -t microservice ../../microservice/
sudo docker tag microservice localhost:32000/microservice
sudo docker push localhost:32000/microservice

echo "Pushing to docker registry orchestrator to localhost:32000"
sudo docker build -t orchestrator ../../orchestrator/
sudo docker tag orchestrator localhost:32000/orchestrator
sudo docker push localhost:32000/orchestrator

echo "Images pushed to docker..."

curl http://localhost:32000/v2/_catalog

