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

# add custom hostname for my localhost (recommended)
sudo nano /etc/hosts
add 127.0.0.1 main-server.local --> domain for main server
add 127.0.0.1 microservice.local --> domain for microservice 

## check microk8s config 
microk8s config
#should show 
server: https://172.28.210.205:16443
clusters etc.
```

Helpers
- check my deployments (no namespace)

`microk8s kubectl get deployments` or `microk8s kubectl delete deployment <deploy-name>`

`microk8s kubectl get pods` or `microk8s kubectl delete pod <pod-name>`

`microk8s kubectl get services` or `microk8s kubectl delete service <service-name>`

------------------------------------------------------------------------------------------------------------------------------
## app 
- main server, all the calls from front end should go here
- Access by 

### in /app/
- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/main-server
    
    my registry host is localhost:32000, *it can be the url of my docker image*
    ```
    # registry my port to fetch images if first time using docker
    sudo docker run -d -p 32000:5000 --name registry registry:2
    
    #build, tag and push image
    sudo docker build -t main-server .
    sudo docker tag main-server localhost:32000/main-server
    sudo docker push localhost:32000/main-server

    #my images lives under localhost:32000
    sudo docker ps 

    #should return {"repositories":["main-server"]}
    curl http://localhost:32000/v2/_catalog
    ```

### in /app/k8s 
- Run using k8s 
- Run deploy.sh --> this has the kubectl commands I need 


- Access my app, I already added it to etc/hosts

Eg.  `curl http://main-server.local/login/user/engineer`

------------------------------------------------------------------------------------------------------------------------------

## microservice
### in /microservice

- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/microservice

    ```
    # registry my port to fetch images if first time using docker
    sudo docker run -d -p 32000:5000 --name registry registry:2
    
    #build, tag and push image
    sudo docker build -t microservice .
    sudo docker tag microservice localhost:32000/microservice
    sudo docker push localhost:32000/microservice

    #my images lives under localhost:32000
    sudo docker ps 

    #should return {"repositories":["main-server","microservice"]}
    curl http://localhost:32000/v2/_catalog
    ```

### in /microservice/k8s 
- Run using k8s 
- locally uses nodePort instead of ingress 
    ```
    microk8s kubectl apply -f deployment.yaml --> deployment of my containers
    microk8s kubectl apply -f service.yaml --> export to 5983 
    microk8s kubectl apply -f hpa.yaml --> autoscale, can have 10 replicas 
    microk8s kubectl apply -f ingress.yaml --> We can access to microservice.local
    ```

- Access my app

`microk8s kubectl get pods -o wide`

Service yaml exposes to 32000
`http://<INTERNAL-IP>:32000` 

Eg.  `curl http://172.28.210.205:32000/login/user/engineer`

## orchestrator 

need to setup k8s config for kubernetes library to work as expected 

```
#create kube dir to fetch using kubernetes/client-node library (only for orchestrator )
mkdir -p ~/.kube
export KUBECONFIG=~/.kube/config --> this is for const kc = new k8s.KubeConfig();
```