# Helm chart

##  The project can be run like in [simple k8s deploy](../README.md)  or USING HELM
- simple k8s deploy is without helm
- We need to run deploy.sh for each folder of `<service>/k8s` to start each service (app, orchestrator and microservices) using k8s

### [USES MICROK8S](../microk8sandversions/README.md) 

### need to add 127.0.0.1 main-server.local to /etc/hosts to run
- we call main-server.local, that is why we define that domain
- We don't call orchestrator or microservices directly, they comunicate using clusterIP between main-server <--> orchestrator <--> microservices

### Need docker images
Need my images available, this case uses the images locally pushed
`bash dockerImgs/pushimages.sh `

- checks if service is up, if not starts the services
- pushes the images to docker

## Run project USING HELM (not like "simple k8s deploy" hehe)
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
   - I can call cluster ip too `curl 10.152.183.100:5000`

- Creates or updates the helm chart with changes made in my chart
- shows all the pods created when deploy:
   ```
      - main-server
      - microservice-0
      - microservice-1
      - orchestrator 
   ```

Once deployed I can use [testing api](../codeHelpers/loginmainserver.py) to test it 

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
   │   │   ├── ingress.yaml
   │   │   ├── deployment.yaml
   │   │   ├── service.yaml
   │   ├── orchestrator/
   │   │   ├── ingress.yaml
   │   │   ├── deployment.yaml
   │   │   ├── service.yaml
   │   ├── microservices/
   │   │   ├── statefulstate.yaml
   └──────────────────────────────
```


