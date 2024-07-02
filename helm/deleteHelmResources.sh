echo "Deleting K8S resources..."

microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-nodeport-service
microk8s kubectl delete ingress main-server-ingress 

microk8s kubectl delete service microservice
microk8s kubectl delete statefulset microservice

microk8s kubectl delete deployment orchestrator
microk8s kubectl delete service orchestrator-nodeport-service
microk8s kubectl delete ingress orchestrator-ingress 

echo "Deleting HELM chart..."
microk8s helm uninstall ondemandrelease