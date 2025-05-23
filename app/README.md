# app 
- main server, all the calls from front end should go here
- This calls orchestrator
    - Orchestrator returns a cluster ip
    - We can call from here the microservice directly too


## in /app/
- Need to create docker image and push it
    - IMAGE NAME : localhost:32000/main-server (use local registry) or inaki99/simple-deploy-arm64 (personal docker hub)
    - Run `bash imagePush.sh`


## check deploy
- Check deploy   `microk8s kubectl get deployments`
- Check service `microk8s kubectl get services -l app=main-server`
- Check pods `microk8s kubectl get pods -l app=main-server`

### uses clusterIP to be accesed

## deploy in CLOUD  /cloud
### `bash clouddeploy.sh` -->  Two examples to expose, ingress and loadbalancer
- If running k8s in VM, you can skip loadbalancer, better use ingress
- gcloud compute addresses create main-server-ip --global -> this is to setup a static ip, no needed always, only if needed one

- **Loadbalancer**, this is going to create a generic url to be accessed outside the cloud (locally needs to use microk8s metallb)
- Ingress, selects a service to use for deploying by domain
    - this is a way to do it by tls or ssl, ssl uses cloud certificate(like password key vault) and tls uses dns added url to show 2 options
    - Need to create a certificate for https, both work TLS OR SSL, CHOOSE ONE ONLY 
    - Enable ports 80 and 443 on network settings in case running a VM

        - USE OF TLS **("$)** <--> (search in ingress.yaml): uses tls         
            - `sudo certbot certonly --manual --preferred-challenges dns -d domain-url.co`  -> creates .key and .cert
            - Add information of certbot with dns zone, need to add domain to cloud service and sync information between
            - `kubectl create secret tls main-server-secret-tls --cert=path/to/tls.crt --key=path/to/tls.key` --> create tls to expose https

        - USE OF SSL **("#)** <--> (search in ingress.yaml): uses https, this case is for GCP 
            - Create certificate on cloud 
            - Use that certificate created on the cloud in the same cloud 
            - Create certificate **managed-cert.yaml**

    - ingress selects nodeport service, to expose to domain by using that service, so the nodeport needs to work first 
        ```
        backend: #this is what I'll be looking forward to get the services, 
        service: 
            name: http-nodeport-service  # choose service exposing to outside the cluster
        ```


------------------------------------

## Comunication between services(pods)
- Pods can communicate inside the cluster by its cluster ip, or pod ip
- Pods can communicate outside the cluster using ingress host url(main-server.local) or loadbalancer url (384bsf93ahsf-rkhw345.us-east-2.ebl.amazon.com )

------
## Access to the app services

### INTERNAL CONNECTION, INSIDE THE CLUSTER 
- CLUSTERIP, NODEPORT

```
microk8s kubectl get services -l app=main-server

NAME                                TYPE            CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
main-server-nodeport-service       NodePort       10.152.183.100       <none>       5000:31230/TCP   2m3s
```

Eg.  `curl http://main-server.local:31230/login/user/engineer`  --> this is able because I setup the /etc/hosts and cluster is running locally, no ingress need

Eg.  `curl 10.152.183.100:5000/login/user/engineer`  

-------------------------------------

### EXTERNAL CONNECTION, OUTSIDE CLUSTER
- INGRESS AND LOADBALANCER (external ip address)
- FOR CLOUD --> is running in cloud services (EKS, Google Kubernetes Engine, Azure Kubernetes Services)
 
```
microk8s kubectl get services -l app=main-server

NAME                                TYPE            CLUSTER-IP                   EXTERNAL-IP                            PORT(S)          AGE
main-server-loadbalancer-service   LoadBalancer   10.152.183.111      384bsf93ahsf-rkhw345.us-east-2.ebl.amazon.com     5000:31160/TCP   19s

kubectl get ingress 
NAME      CLASS    HOSTS               ADDRESS          PORTS   AGE
ingress   <none>   main-server.local   34.160.114.147   80      204d

```

Eg.  `curl http://384bsf93ahsf-rkhw345.us-east-2.ebl.amazon.com:31230/login/user/engineer` -> this is the loadbalancer access 

Eg.  `curl https://main-server.local:31230/login/user/engineer`  -> This is the ingress access 


