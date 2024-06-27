# k8sOnDemand
Example of creating deployments on demand

## USES MICROK8S
```
sudo snap install microk8s --classic
microk8s enable dns storage
microk8s enable registry
microk8s enable ingress

# set sudo permissions if microk8s doesn't have
# my username: inaki99
sudo usermod -a -G microk8s <username>
sudo chown -R <username> ~/.kube

# add custom hostname for my localhost (Already in the deploy.sh of /k8s folders is included the domain add )
sudo nano /etc/hosts
add 127.0.0.1 main-server.local --> domain for main server
# didn't add microservices, because the ip changes in the deploy , if I want I can add 10.1.131.158 microservice-01.local

## check microk8s config 
microk8s config
#should show 
server: https://172.28.210.205:16443
clusters etc.


Need to setup k8s config in the terminal for kubernetes library to work as expected 
#create kube dir to fetch using kubernetes/client-node library (only for orchestrator )
mkdir -p ~/.kube
export KUBECONFIG=~/.kube/config --> this is for const kc = new k8s.KubeConfig();

```

Helpers
- check my deployments (no namespace)

`microk8s kubectl get deployments` or `microk8s kubectl delete deployment <deploy-name>`

`microk8s kubectl get pods` or `microk8s kubectl delete pod <pod-name>`

`microk8s kubectl get services` or `microk8s kubectl delete service <service-name>`

`microk8s kubectl get pod <pod-name> -o jsonpath='{.metadata.ownerReferences[0].kind}'` type of pod 

`microk8s kubectl get statefulsets`

###  Locally need to intialize docker for fetching those images, saved in http://localhost:32000/v2/_catalog
```
# registry my port to fetch images if first time using docker
sudo docker run -d -p 32000:5000 --name registry registry:2

#start docker registry if already registered
sudo docker start registry

```
------------------------------------------------------------------------------------------------------------------------------
## app 
- main server, all the calls from front end should go here

### in /app/
- Need to create docker image, and push it to my local docker
    - IMAGE NAME : localhost:32000/main-server
    - Run `bash dockerImage.sh`
    - my registry host is localhost:32000, *it can be the url of my docker image*


### in /app/k8s 
- Run using k8s 
- Static cluster ip, to access its cluster by its `http://<clusterIp>:<port>`  we can access by CLUSTER IP
- Run `bash deploy.sh` --> 

    Check deploy   `microk8s kubectl get deployments`


- Access my app, I already added it to etc/hosts
- App runs on 5000
```
microk8s kubectl get services -o wide

NAME             READY   STATUS    RESTARTS   AGE     IP             NODE         NOMINATED NODE   READINESS GATES
main-server            ClusterIP   10.152.183.232   <none>        5000/TCP   20h     app=main-server
main-server-service    ClusterIP   10.152.183.100   <none>        5000/TCP   71s     app=main-server
```

This calls the clusterip, then I can call my port and service 

Eg.  `curl http://main-server.local/login/user/engineer` This is how to call from my end

Eg.  `curl 10.152.183.100:5000/login/user/engineer` This how to call between pods
    * That is why this fetch http://10.152.183.101:5045/assign-pod IN THE POD


------------------------------------------------------------------------------------------------------------------------------

## microservice
### in /microservice

- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/microservice
    - Run `bash dockerImage.sh`

### in /microservice/k8s 
- Uses stateful state deploy, to be scalable.

- Assigned is null, because we are going to assing pods depending on the user group const groups = ['engineers', 'lawyers', 'doctors', 'chefs', 'ninis'];

    To test creation of automatic replicas, uncomment # assigned: 'uncommentexampleWithAssignedPodPerGroup' and comment null assignment

- Run using k8s 
- Dynamic ips, because it replicates sometimes, we can access by POD IP
- Run `bash deploy.sh` --> 

check deploy `microk8s kubectl get statefulsets`


- Access my app
- App runs on 5983
Each pod has its own IP (variable, that is why I didn't added it to the etc/hosts)


```
microk8s kubectl get pods -o wide

NAME             READY   STATUS    RESTARTS   AGE     IP             NODE         NOMINATED NODE   READINESS GATES
microservice-0   1/1     Running   0          3m53s   10.1.131.177   tr-2gx5vl3   <none>           <none>
microservice-1   1/1     Running   0          3m51s   10.1.131.178   tr-2gx5vl3   <none>           <none>
```

`http://<IP>:5983` 

Eg.  `curl 10.1.131.177:5983/groupServer`

## orchestrator 
Need microservices to be running first 

- Assigns a pod to a user group

I can run directly the app using /orchestrator npm start and test 
```
import requests
import json
url = "http://orchestrator.local/assign-pod"
payload = json.dumps({
  "group": "engineers" #use different user groups to test scalation
})
headers = {
  'Content-Type': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)
```
### in /orchestrator
- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/orchestrator
    - Run `bash dockerImage.sh`

### in /orchestrator/k8s 
- Run using k8s 
- Static cluster ip, to access its cluster by its `http://<clusterIp>:<port>` we can access by CLUSTER IP
- Run `bash deploy.sh` --> 

    Check deploy   `microk8s kubectl get deployments`

    ```
    microk8s kubectl get services -o wide
    NAME                            READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
    orchestrator-service   ClusterIP   10.152.183.101   <none>        5045/TCP   8m21s   app=orchestrator
    ```

This calls my clusterip, the port of the app and the route

Eg.  `curl http://orchestrator.local/` This is how to call from my end

Eg.  `curl 10.152.183.101:5045/` This how to call between pods