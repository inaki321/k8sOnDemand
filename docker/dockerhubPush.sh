# Just a pushing script to my public docker hub


# ----------------------
# you can use local registry (local Docker daemon)
# localhost:32000/main-server
# create registry - push image  on local docker
# ----------------------


# push app image (arm64 arch since I am using M1)
docker buildx build --platform linux/arm64 -t inaki99/app-arm64:latest --push ../app/


# push microservice image (arm64 arch since I am using M1)
docker buildx build --platform linux/arm64 -t inaki99/microservice-arm64:latest --push ../microservice/


# push orchestrator image (arm64 arch since I am using M1)
docker buildx build --platform linux/arm64 -t inaki99/orchestrator-arm64:latest --push ../orchestrator/