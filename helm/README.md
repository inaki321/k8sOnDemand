# Helm chart

##  The project can be run like in [simple k8s deploy](../README.md)  or USING HELM
- simple k8s deploy is without helm, you have to run `kubectl apply -f file.yaml` for every k8s resource you want to deploy 
- We need to run deploy.sh for each folder of `<service>/k8s` to start each service (app, orchestrator and microservices) using k8s


THIS PROJECT DEPLOYS LOCALLY, WE CAN USE 

### [USES MICROK8S](../microk8sandversions/README.md) 

### need to add 127.0.0.1 main-server.local to /etc/hosts to run
- we call main-server.local, that is why we define that domain
- We don't call orchestrator or microservices directly, they comunicate using clusterIP between main-server <--> orchestrator <--> microservices
- Added in helmdeploy.sh

### Need docker images
Need my images available, this case uses the images locally pushed
`bash dockerImgs/pushimages.sh `

- checks if service is up, if not starts the services
- pushes the images to docker

## Run project USING HELM (not like "simple k8s deploy" hehe)
### my helm chart is /ondemandchart
- Create helm project, init project, (run only to create the template, skip because there is already a helm template)
`microk8s helm create ondemandchart`

- Create helm package to export (optionally, no need of this )
creates tar file to export it to any cloud, in helm/ondemandchart
   ```
   cd ondemandchart
   microk8s helm package .
   ```

### helmdeploy.sh --> only need to run this to deploy
- Deletes all k8s services, deploys etc.
- adds main-server.local to /etc/hosts --> this is the only domain I call
   - that is why I setted up that domain
   - I can call cluster ip too `curl 10.152.183.100:5000` or `curl main-server.local:31230`

   - Pods/services communicate between them using SERVICE-ClusterIP or POD-IP, but we can call them by its domain, SERVICE-ClusterIP or POD-IP

- Creates or updates the helm chart with changes made in my chart
- shows all the pods created when deploy:
   ```
   ------PODS------
   NAME                            READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
   main-server-8495669c8c-lpvlz    1/1     Running   0          2s    10.1.131.163   tr-2gx5vl3   <none>           <none>
   microservice-0                  1/1     Running   0          2s    10.1.131.156   tr-2gx5vl3   <none>           <none>
   microservice-1                  1/1     Running   0          1s    10.1.131.152   tr-2gx5vl3   <none>           <none>
   orchestrator-66dbcb99b5-lqkzj   1/1     Running   0          2s    10.1.131.153   tr-2gx5vl3   <none>           <none>
   ```

- Shows all the services created when deploy:
Eg.
   ```
   ------SERVICES------
   NAME                            TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE    SELECTOR
   kubernetes                      ClusterIP   10.152.183.1     <none>        443/TCP          6d1h   <none>
   main-server-nodeport-service    NodePort    10.152.183.100   <none>        5000:31230/TCP   4s     app=main-server
   microservice                    ClusterIP   None             <none>        5983/TCP         4s     app=microservice
   orchestrator-nodeport-service   NodePort    10.152.183.101   <none>        5045:31231/TCP   4s     app=orchestrator
   ```

- Ways I can call main-server:
   - `curl  10.152.183.100:5000`
   - `curl  main-server.local:31230`
   - `curl  10.1.131.163:5000` dynamic because its pod ip

Once deployed I can use [testing api](../codeHelpers/loginmainserver.py) to test it

Should run like this [code run](../codeHelpers/results/README.md) to test it

Deployment diagram [diagram](../codeHelpers/README.md) 

## /ondemandchart


- `ondemandchart/app` & `ondemandchart/orchestrator` & `ondemandchart/microservices`
     - has the same files as `app/k8s/` & `orchestrator/k8s/` & `microservices/k8s/`
     - These files use the values from `values.yaml` instead of *harcoded* values

```
ondemandchart/
   ├── Chart.yaml
   ├── values.yaml
   ├── templates/
   │   ├── app/
   │   │   ├── ingress.yaml --> sets main-server.local to be accesed
   │   │   ├── deployment.yaml --> creates deployment for docker image
   │   │   ├── service.yaml --> deploys clusterip service with staticIP 
   │   ├── orchestrator/
   │   │   ├── ingress.yaml --> sets main-server.local to be accesed (unused, because it is accesed by clusterip)
   │   │   ├── deployment.yaml --> creates deployment for docker image
   │   │   ├── service.yaml --> deploys clusterip service with staticIP (to be accessed always by main-server)
   │   ├── microservices/ 
   │   │   ├── statefulstate.yaml --> variables ip, because it is can have multiple microservices (replicates)
   └──────────────────────────────
```

-----------------------------

### deleteHelmResources.sh

Deletes all helm and k8s services 

----------------------

### grafana prometheus

This creates the prometheus-grafana server, already in helmdeploy.sh

Grafana and prometheus pods, services are on --namespace monitoring 

grafana and prometeus values to use are in /grafanaprometheus/values.yaml

```
# add charts 
microk8s helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
microk8s helm repo add grafana https://grafana.github.io/helm-charts

# helm update data
microk8s helm repo update

# install in case not installed, if not update 
microk8s helm install prometheus prometheus-community/prometheus
microk8s helm install grafana grafana/grafana


# Access to grafana and prometheus using localhost for :9000 and :3000 
microk8s kubectl port-forward service/prometheus-server 9090:80
microk8s kubectl port-forward service/grafana 3000:80

# modify helm values if needed 

helm show values prometheus-community/prometheus > prometheus-values.yaml
helm show values grafana/grafana > grafana-values.yaml

# Edit prometheus-values.yaml and grafana-values.yaml as needed

helm install prometheus prometheus-community/prometheus -f prometheus-values.yaml
helm install grafana grafana/grafana -f grafana-values.yaml

```

Export service once deployed  to access by localhost:5055


user: admin
pass: admin

### Data sources
My services I want to use 
Home --> Connections --> Data sources

#### Import dashboards
Dashboards templates 
https://grafana.com/grafana/dashboards/ 

Copy Id clipboard from grafana dashboards and paste it in my "import dashboard"

Home --> Dashboards --> Import dashboard



