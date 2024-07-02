## orchestrator 
Need microservices to be running first 

- Assigns a pod to a user group
- Called by main-server
- Orchestates the microservices containers

### in /orchestrator
- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/orchestrator
    - Run `bash dockerImg.sh`

### in /orchestrator/k8s 
- Run using ONLY k8s 
- Static ip to always call the same one, if not every deploy changes 
- Two ways to call my service
    - Call using clusterIP `http://<clusterIp>:<port>` or `http://10.152.183.101:5045`
    - Call using domain-ingress `http://<clusterIp>:<tcpPort>` or `http://orchestrator.local:31231`

- Run `bash deploy.sh` --> 

    - Deletes previous deployments, services, ingress etc.
    - Creates services(ports to serve), deployment(containers) and ingress (main-server.local path)
    - Adds orchestrator.local to /etc/hosts to be accesible 
    - Shows my kubectl services for that label 

    Check deploy   `microk8s kubectl get deployments`

    Check service `microk8s kubectl get services -l app=orchestrator`

    Check pods `microk8s kubectl get pods -l app=orchestrator`

    ```
    microk8s kubectl get services -o wide
    NAME                            TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE   SELECTOR
    orchestrator-nodeport-service   NodePort   10.152.183.101   <none>        5045:31231/TCP   5s    app=orchestrator
    ```

This calls my clusterip, the port of the app and the route

Eg.  `curl http://orchestrator.local/31231` This is how to call from my end

Eg.  `curl 10.152.183.101:5045/` This how to call between pods
