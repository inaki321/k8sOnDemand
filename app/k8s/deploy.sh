#deletes the deployment with the pods 
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-service
microk8s kubectl delete ingress main-server-ingress 
#generate deployment
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
microk8s kubectl apply -f ingress.yaml

sleep 5

#shows my deployment pod 
microk8s kubectl get services -o wide 

#set localhost  in /etc/hosts for main-server-local
sudo sed -i.bak '/main-server.local/d' /etc/hosts
echo "127.0.0.1 main-server.local" | sudo tee -a /etc/hosts


sleep 2
echo "Calling service..."
curl main-server.local
echo " "