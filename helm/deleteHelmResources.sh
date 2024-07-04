echo "Deleting K8S resources..."

microk8s kubectl delete pods --all
microk8s kubectl delete services --all
microk8s kubectl delete deployments --all
kubectl delete statefulsets --all

echo "Deleting HELM chart..."
microk8s helm uninstall ondemandrelease

#microk8s helm uninstall grafana
#microk8s helm uninstall prometheus