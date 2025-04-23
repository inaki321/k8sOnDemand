## *optional* use my desired context (I want to use microk8s)
kubectl config use-context microk8s 


## --------------------------- DELETE ALL K8S FIRST, TO REDEPLOY ---------------------------


## Create ondemand namespace
if kubectl get namespace ondemand >/dev/null 2>&1; then
  echo "Namespace 'ondemand' exists."
else
  echo "Namespace 'ondemand' does not exist. Creating namespace"
	kubectl create ns ondemand
fi

# OPTIONAL bash ondemandDeploy.sh delete-res=true

if [ "$1" = "delete-res" ] || [ "$1" = "delete-res=true" ]; then
  DELETE_RESOURCES=true
  echo "Will delete existing Kubernetes resources from chart namespace"
  echo "you can use 'kubectl delete pods --all -n ondemand and all resources etc' too...)"
  helm uninstall ondemandrelease
fi


#--------------------------- Add domain to etc/hosts ---------------------------
# only add main server domain (it is the one I am calling from fetch)
#(optional since it added to etc hosts )
# use NODE IP or VM IP
#sudo sed -i.bak '/main-server.local/d' /etc/hosts
#echo "192.168.64.18 main-server.local" | sudo tee -a /etc/hosts



# ------------------- CHECK HELM CHART WORKING --------------
helm lint ondemandchart
echo "helm chart syntax is fine"

#--------------------------- DEPLOY HELM CHART ------------------------

# Install helm chart k8sonemdand chart 
if  helm status "ondemandrelease" ; then
    echo "release already exists, updating release..."
    helm upgrade ondemandrelease ./ondemandchart 
else
    echo "release doesn't exists, creating a new release..."
    helm install ondemandrelease ./ondemandchart
fi

#--------------------------- SHOW K8S AND HELM REUSLTS ---------------------------

# check if installation worked, if not quit
echo "-------------------------"
echo "-------------------------"
echo "Checking if chart is installed"
HELM_RELEASE="ondemandrelease"

helm status "$HELM_RELEASE" 2>&1 | grep -q "Error: release: not found"

if [ $? -eq 0 ]; then
	echo "existing because chart did not worked"
  exit 1 # Sale con error si no encuentra el release
fi

sleep 2

# ONLY SHOW K8SONDEMMAND SERVICES AND PODS BY IDENTIFIER 

echo "--------------------PODS--------------------"
kubectl get pods -o wide -l identifier=k8sondemand -n ondemand
echo " "
echo "--------------------SERVICES--------------------"
kubectl get services -o wide -l identifier=k8sondemand -n ondemand
echo " "
echo "--------------------INGRESS from app--------------------"
kubectl get ingress -n ondemand
echo " "
echo "--------------------IF INGRESS LIVING IN 127.0.0.1 OR LOCALHOST, USE NODE IP as endpoint (/etc/hosts or DNS ZONE)--------------------"
kubectl get nodes -o wide
echo " "
sleep 2

echo "--------------------------------------------------ondemand release chart ----------------- "

echo "Externally you can call main server by its NodePort IP or Ingress Domain"
echo " "
echo "curl http://app-container.local"
echo " "
echo "curl 192.168.64.18:31230" 
echo " " 
echo "Externally you call orchestrator by its NodePort or Ingress Domain..."
echo " " 
echo "Microservices deployment pods does not have external IP, just internal..."
echo " " 
echo "Pods are going to call between them by their ClusterIP or ClusterDNS (serviceNameDNS) because they live inside the same Cluster"
echo " "
echo "Outside the cluster, pods can just call externalIP or domain pods or domains, NO clusterIP or clusterDNS"
