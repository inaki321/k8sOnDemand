# Helm chart


## /ondemandchart

```
ondemandchart/
   ├── Chart.yaml
   ├── values.yaml
   ├── TEMPLATES/
   │   ├── APP/
   │   │   ├── ingress.yaml --> sets domain -> routes to app services-pods
   │   │   ├── deployment.yaml --> creates pods with template/app labels  for app image 
   │   │   ├── service.yaml --> deploys nodeport service with static ClusterIP
   │   │
   │   ├── ORCHESTRATOR/
   │   │   ├── ingress.yaml --> sets domain -> routes to orchestrator services-pods
   │   │   ├── deployment.yaml --> creates pods with template/orchestrator labels for orchestrator                   
                                    image 
   │   │   ├── service.yaml --> deploys nodeport service with static ClusterIP
   │   │
   │   ├── MICROSERVICES/ 
   │   │   ├── statefulstate.yaml --> variables ip, because it is can have multiple microservices (replicates)
                                          creates pods with template/microservices labels for 
                                           microservices image 
   │
   └──────────────────────────────
```


# Docker images available
 ** In **../docker** -> images pushed to docker hub

* Need my images available, this case uses the images locally pushed

   - For local usage (optional): c
      - need local registry in local docker daemon (need daemon running)

# Package helm chart (optional)
```
cd ondemandchart
microk8s helm package .
```

# ondemandDeploy.sh 

## **Commands to deploy the project**


***Steps*** 

1. (optional) set context in kube config to use specific cluster 

2. Create namespace if needed, uninstall helm package if needed
   - `bash ondemandDeploy.sh delete-res=true`

3. (optional) add needed domains to etc/hosts to use domains for testing (optional)
   - `curl main-server.local:31230` 

4. helm lint -> check helm chart syntax working fine

5. just deploy helm chart by installing or upgrading

6. print output of the helm release


# how to call pods 

## 4 ways to access 

### Access outside the cluster (from any terminal)

- Nodeport
   - `kubectl get nodes -o wide` -> use the  INTERNAL-IP node used by my service
      - `<nodePort> : <serviceNodePort>` =~= `192.168.64.18:31230`

- Ingress 
   - Add ingress controller ip or NodeIP to DNS zones or Route 53 etc as "A record"
   - local test -> Add ingress controller ip or NodeIP to /etc/hosts and domain 
      ```
      127.0.0.1 main-server.local
      192.168.64.18 main-orchestrator.local
      ```

   - `<ingresspath-route>:<serviceNodePort>`  `main-server.local:31230`

   - you can use 8080 or 443 changing the ports (check this )

### Access inside the cluster (inside a pod)

- ClusterIP
   - `kubectl get pods -o wide` -> use CLUSTER-IP  
      - `<clusterIP>:<containerimagePort>` =~= `10.1.254.99:5045`

- ClusterDNS
   - use the service name `service.metadata.name`
      - `<service.metadata.name><containerimagePort>` =~= `orchestrator-container-nodeport-service:5045`


# Testing helpers
Once deployed I can use [testing api](../codeHelpers/loginmainserver.py) to test it

Should run like this [code run](../codeHelpers/results/README.md) to test it

Deployment diagram [diagram](../codeHelpers/README.md) 