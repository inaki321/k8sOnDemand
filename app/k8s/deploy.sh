#deletes the deployment with the pods 
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-service
#generate deployment
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
microk8s kubectl apply -f ingress.yaml