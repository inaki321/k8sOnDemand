## --------------------------- DELETE ALL K8S FIRST, TO REDEPLOY ---------------------------

# DELETE MAIN SERVER K8S 
#microk8s kubectl delete deployment main-server
#microk8s kubectl delete service main-server-nodeport-service
#microk8s kubectl delete ingress main-server-ingress 

# DELETE MICROSERVICES K8S 
#microk8s kubectl delete service microservice
#microk8s kubectl delete statefulset microservice

# DELETE ORCHESTRATOR K8S 
#microk8s kubectl delete deployment orchestrator
#microk8s kubectl delete service orchestrator-nodeport-service
#microk8s kubectl delete ingress orchestrator-ingress 

# DELETE GRAFAANA K8S and create NAMESPACE for it 

#microk8s kubectl delete configmap grafana-datasources -n monitoring
#microk8s kubectl delete service grafana -n monitoring
#microk8s kubectl delete deployment grafana -n monitoring

# DELETE ALL INSTEAD OF EACH RESOURCE   
microk8s kubectl delete pods --all
microk8s kubectl delete services --all
microk8s kubectl delete deployments --all
microk8s kubectl delete statefulsets --all

# Create monitoring namespace for grafana and prometheus 
microk8s kubectl delete namespace monitoring
microk8s kubectl create namespace monitoring


#--------------------------- Add domain to etc/hosts ---------------------------
#set localhost  in /etc/hosts for main-server-local
sudo sed -i.bak '/main-server.local/d' /etc/hosts
echo "127.0.0.1 main-server.local" | sudo tee -a /etc/hosts


#HELM
#--------------------------- ondemandrelease HELM CHART ---------------------------
# chart name ondemandrelease 
# can change this bash file with whatever name you want for the chart
# delete helm chart, if deleted helm chart, it is going to create a new release

# microk8s helm uninstall ondemandrelease

# Install helm chart k8sonemdand chart 
if microk8s helm status "ondemandrelease" ; then
    echo "release already exists, updating release..."
    microk8s helm upgrade ondemandrelease ./ondemandchart 
else
    echo "release doesn't exists, creating a new release..."
    microk8s helm install ondemandrelease ./ondemandchart
fi

#--------------------------- prometheus-community HELM CHART---------------------------
#add repo in case doesn't exists 
if ! microk8s helm repo list | grep prometheus-community ; then
    echo "prometheus-community repo not added, adding it to helm"
    microk8s helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
fi

#upgrade or install helm chart
# use preconfigured values /grafanaprometheus/values.yaml
# to fetch my pods values 
if ! microk8s helm list | grep prometheus ; then
    echo "installing prometheus helm chart"
    microk8s helm install prometheus prometheus-community/prometheus -f grafanaprometheus/values.yaml --namespace monitoring
else
    echo "upgrading prometheus helm chart"
    microk8s helm upgrade prometheus prometheus-community/prometheus -f grafanaprometheus/values.yaml --namespace monitoring
fi


#--------------------------- prometheus-community HELM CHART---------------------------
if ! microk8s helm repo list | grep grafana ; then
    echo "garafana repo not added, adding it to helm"
    microk8s helm repo add grafana https://grafana.github.io/helm-charts
fi

if ! microk8s helm list | grep grafana ; then
    echo "installing grafana helm chart"
    microk8s helm install grafana grafana/grafana --namespace monitoring
else
    echo "upgrading grafana helm chart"
    microk8s helm upgrade grafana grafana/grafana --namespace monitoring
fi


#--------------------------- SHOW K8S AND HELM REUSLTS ---------------------------

echo "-------------------------"
echo "-------------------------"
microk8s helm status "ondemandrelease"

sleep 2

# ONLY SHOW K8SONDEMMAND SERVICES AND PODS BY IDENTIFIER 

echo "--------------------PODS--------------------"
microk8s kubectl get pods -o wide -l identifier=k8sondemand

echo "--------------------SERVICES--------------------"
microk8s kubectl get services -o wide -l identifier=k8sondemand

sleep 2

echo "--------------------------------------------------ondemand release chart ----------------- "

echo "Now you can call main-server by its domain and its static ip..."
echo " "
echo "curl http://main-server.local:31230"
echo " "
echo "curl http://10.152.183.100:5000" 

echo " "
echo "Now you can call orchestrator.local by its domain and its static ip..."
echo " "
echo "curl http://orchestrator.local:31231"
echo " "
echo "curl http://10.152.183.101:5045" 
echo " "

echo "Now you can call microservices by its dynamic ip..."


echo "Pods communicate between them using SERVICE-ClusterIP or POD-IP, but we can call them by its domain, SERVICE-ClusterIP or POD-IP"


echo "--------------------------------------------------Grafana and prometheus----------------- "
sleep 2

echo "Run in a terminal to expose prometheus to localhost:9090"
echo " microk8s kubectl port-forward service/prometheus-server 9090:80 -n monitoring"

echo "You can see prometheus targets in http://localhost:9090/targets"

echo " "
echo "Run in a terminal to expose grafana to localhost:3200"
echo " microk8s kubectl port-forward service/grafana 3200:80 -n monitoring"

#microk8s kubectl port-forward -n monitoring svc/grafana 5055:80
