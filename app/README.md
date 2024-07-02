## app 
- main server, all the calls from front end should go here
- This calls orchestrator
    - Orchestrator returns a cluster ip
    - We can call from here the microservice directly

### in /app/
- Need to create docker image, and push it to my local docker
    - IMAGE NAME : localhost:32000/main-server
    - Run `bash dockerImg.sh`
    - my registry host is localhost:32000, *it can be the url of my docker image*


### in /app/k8s 
- Run using ONLY k8s 
- Static ip to always call the same one, if not every deploy changes 
- Two ways to call my service
    - Call using clusterIP `http://<clusterIp>:<port>` or `http://10.152.183.100:5000`
    - Call using domain-ingress `http://<clusterIp>:<tcpPort>` or `http://main-server.local:31230`

- Run `bash deploy.sh` --> 

    - Deletes previous deployments, services, ingress etc.
    - Creates services(ports to serve), deployment(containers) and ingress (main-server.local path)
    - Adds orchestrator.local to /etc/hosts to be accesible 
    - Shows my kubectl services for that label 

    Check deploy   `microk8s kubectl get deployments`

    Check service `microk8s kubectl get services -l app=main-server`

    Check pods `microk8s kubectl get pods -l app=main-server`
------------------------------------


```
microk8s kubectl get services -l app=main-server

NAME                           TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
main-server-nodeport-service   NodePort   10.152.183.100   <none>        5000:31230/TCP   2m3s
```


Eg.  `curl http://main-server.local:31230/login/user/engineer` 

Eg.  `curl 10.152.183.100:5000/login/user/engineer` 

*esto chance se puede ir 
This how to call between pods
    * That is why this fetch http://10.152.183.101:5045/assign-pod IN THE POD console.log('Calling http://10.152.183.101:5045/assign-pod')
