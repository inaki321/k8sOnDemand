## DELETE ALL K8S FIRST, TO REDEPLOY

# DELETE MAIN SERVER K8S 
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-nodeport-service
microk8s kubectl delete ingress main-server-ingress 

# DELETE MICROSERVICES K8S 
microk8s kubectl delete service microservice
microk8s kubectl delete statefulset microservice

# DELETE ORCHESTRATOR K8S 
microk8s kubectl delete deployment orchestrator
microk8s kubectl delete service orchestrator-nodeport-service
microk8s kubectl delete ingress orchestrator-ingress 

# DELETE GRAFAANA K8S and create NAMESPACE for it 

microk8s kubectl delete configmap grafana-datasources -n monitoring
microk8s kubectl delete service grafana -n monitoring
microk8s kubectl delete deployment grafana -n monitoring

microk8s kubectl delete namespace monitoring
microk8s kubectl create namespace monitoring

#set localhost  in /etc/hosts for main-server-local
sudo sed -i.bak '/main-server.local/d' /etc/hosts
echo "127.0.0.1 main-server.local" | sudo tee -a /etc/hosts


#HELM
# chart name ondemandrelease 
# can change this bash file with whatever name you want for the chart

# delete helm chart, if deleted helm chart, it is going to create a new release

# microk8s helm uninstall ondemandrelease

# Install helm chart (new ) or update it 
if microk8s helm status "ondemandrelease" ; then
    echo "release already exists, updating release..."
    microk8s helm upgrade ondemandrelease ./ondemandchart 
else
    echo "release doesn't exists, creating a new release..."
    microk8s helm install ondemandrelease ./ondemandchart
fi


echo "-------------------------"
echo "-------------------------"
microk8s helm status "ondemandrelease"

sleep 2

echo "--------------------PODS--------------------"
microk8s kubectl get pods -o wide

echo "--------------------SERVICES--------------------"
microk8s kubectl get services -o wide

sleep 5

echo "Now you can call main-server by its domain and its static ip..."
echo " "
echo "curl http://main-server.local:31230"
echo " "
echo "curl http://10.152.183.100:5000" 


echo "Now you can call orchestrator.local by its domain and its static ip..."
echo " "
echo "curl http://orchestrator.local:31231"
echo " "
echo "curl http://10.152.183.101:5045" 
echo " "

echo "Now you can call microservices by its dynamic ip..."


echo "Pods communicate between them using SERVICE-ClusterIP or POD-IP, but we can call them by its domain, SERVICE-ClusterIP or POD-IP"


echo "------------------- SERVING GRAFANA to 5055--------------------"
echo "http://localhost:5055/login"
microk8s kubectl port-forward -n monitoring svc/grafana 5055:80
