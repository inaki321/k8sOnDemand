# k8sOnDemand
Example of creating deployments on demand

## USES MICROK8S
```
sudo snap install microk8s --classic
microk8s enable dns storage
microk8s enable registry
microk8s enable ingress

# set sudo permissions if microk8s doesn't have
mkdir /home/<user>/.kube
sudo chown -R <user>:<user> /home/<user>/.kube

# add custom hostname for my localhost (optionaly)
sudo nano /etc/hosts
## add 127.0.0.1 mycustomdomain.local
```

## app 
- main server 

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
- locally uses nodePort instead of ingress 
    ```
    sudo microk8s kubectl apply -f deployment.yaml
    sudo microk8s kubectl apply -f service.yaml
    ```

- check my deployments (no namespace)
`microk8s kubectl get deployments`
`microk8s kubectl get pods`
`microk8s kubectl get services`
- Access my app

`microk8s kubectl get nodes -o wide`

Service yaml exposes to 30000
`http://<INTERNAL-IP>:30000` 

Eg.  `curl http://172.28.210.205:30000/login/user/engineer`








