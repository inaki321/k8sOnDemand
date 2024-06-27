#logs for main server
#bash getlogs.sh main

#logs for orchestrator
#bash getlogs.sh orch

deployment=$1
echo "$1"

POD=""
if [ "$deployment" == "main" ]; then
    POD=$(microk8s kubectl get pods -o wide -l app=main-server --no-headers | awk '{print $1}')
else
    POD=$(microk8s kubectl get pods -o wide -l app=orchestrator --no-headers | awk '{print $1}')
fi

echo "Logs for pod with name $POD"

microk8s kubectl logs "$POD"