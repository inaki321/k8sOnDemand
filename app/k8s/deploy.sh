#deletes the created resouces if exists 
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-nodeport-service
microk8s kubectl delete ingress main-server-ingress 

#generate deployment
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
microk8s kubectl apply -f ingress.yaml

sleep 5

#shows my deployment pod 
microk8s kubectl get services -l app=main-server

#set localhost  in /etc/hosts for main-server-local
echo "adding main-server.local to /etc/hosts..." 
sudo sed -i.bak '/main-server.local/d' /etc/hosts
echo "127.0.0.1 main-server.local" | sudo tee -a /etc/hosts


sleep 2
echo "Now you can call main-server by its domain and its static ip..."
echo " "
echo "curl http://main-server.local:31230"
echo " "
echo "curl http://10.152.183.100:5000" 

echo " "