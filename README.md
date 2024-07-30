# k8sOnDemand
Example of creating deployments on demand

## Diagram of the app 
[Diagram](./codeHelpers/README.md) 


## Run 

- Run by using k8s only  "simple k8s deploy"
    - Deploy app `/app/k8s ` for local environment `bash locallydeploy.sh`, in a k8s cloud cluster (google this case )`bash clouddeploy.sh`
    - Deploy microservices `/microservice/k8s -> bash deploy.sh` 
    - Deploy orchestrator `/orchestrator/k8s -> bash deploy.sh` 

- Run by using helm chart
    - Helm chart uses grafana 
    - This is only for local environment, more info about ips, external and internal deploys in folders /app, /orchestrator and /microservices 
    - [HELM DEPLOY](./helm/README.md) 

### [USES MICROK8S](./microk8sandversions/README.md) 

Helpers
- check my deployments (no namespace)

`microk8s kubectl get deployments` or `microk8s kubectl delete deployment <deploy-name>`

`microk8s kubectl get pods` or `microk8s kubectl delete pod <pod-name>`

`microk8s kubectl get services` or `microk8s kubectl delete service <service-name>`

`microk8s kubectl get pod <pod-name> -o jsonpath='{.metadata.ownerReferences[0].kind}'` type of pod 

`microk8s kubectl get statefulsets`

`microk8s kubectl get nodes -o wide` --> get my nodes in my k8s, gets locally nodes if not connected to any cloud 

`microk8s kubectl describe pod <pod-name>` --> logs check pod status (container creating taking too much time, err pod pull image etc.)

###  Locally need to intialize docker for fetching those images, saved in http://localhost:32000/v2/_catalog

- automatic pushing of all the docker images [Push all images](./helm/dockerImgs/pushimages.sh)

```
# registry my port to fetch images if first time using docker
sudo docker run -d -p 32000:5000 --name registry registry:2

#start docker registry if already registered
sudo docker start registry

```



# UPDATE HELPERS
# WHAT IS A DEPLOY, POD AND EXTERNAL AND INTERNAL IPS 