#deletes the deployment with the pods 
microk8s kubectl delete deployment orchestrator
microk8s kubectl delete service orchestrator-service
microk8s kubectl delete ingress orchestrator-ingress 
#generate deployment
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
microk8s kubectl apply -f ingress.yaml


sleep 5

#shows my deployment pod 
microk8s kubectl get pods -o wide -l app=orchestrator

sudo sed -i.bak '/orchestrator.local/d' /etc/hosts
echo "127.0.0.1 orchestrator.local" | sudo tee -a /etc/hosts

sleep 2
echo "Calling service..."
curl orchestrator.local
echo " "