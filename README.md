# k8sOnDemand
Example of creating deployments on demand

## Diagram of the app 
[Diagram](./codeHelpers/README.md) 


## Run 

- Run by using k8s only  "simple k8s deploy"
    - Deploy app `/app/k8s -> bash deploy.sh` 
    - Deploy microservices `/microservice/k8s -> bash deploy.sh` 
    - Deploy orchestrator `/orchestrator/k8s -> bash deploy.sh` 

- Run by using helm chart
    - Helm chart uses grafana 
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

## uses NodePort to be accesible from a cloud
### Pods/services communicate between them using SERVICE-ClusterIP or POD-IP, but we can call them by its domain, SERVICE-ClusterIP or POD-IP
Locally I can access to main-server.local and orchestrator.local, I can call the services by it's domain

This is because I added them to /etc/hosts

Between the services, they are called by its cluster ip, because they don't have the domain in the /etc/hosts

Exporting the service from a cloud, now I can access by its domain
