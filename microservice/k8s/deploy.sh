#delete services before new one 
microk8s kubectl delete service microservice
microk8s kubectl delete statefulset microservice

#create stateful server
microk8s kubectl apply -f statefulstate.yaml

sleep 5

#shows my microservices 
microk8s kubectl get pods -o wide -l app=microservice


echo "Now you can call microservices by its dynamic ip..."
