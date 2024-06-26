## DELETE ALL K8S FIRST, TO REDEPLOY
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-service
microk8s kubectl delete ingress main-server-ingress 

microk8s kubectl delete service microservice
microk8s kubectl delete statefulset microservice

microk8s kubectl delete deployment orchestrator
microk8s kubectl delete service orchestrator-service
microk8s kubectl delete ingress orchestrator-ingress 



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

microk8s kubectl get pods -o wide

sleep 5
echo "Calling main server to test deploy..."
curl main-server.local
echo " "