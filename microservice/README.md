## microservice
### in /microservice

- Need to create docker image, and push it to my local docker, 
IMAGE NAME : localhost:32000/microservice
    - Run `bash dockerImg.sh`

### in /microservice/k8s 
- Uses stateful state deploy, to be scalable.

- Assigned is null, because we are going to assing pods depending on the user group const groups = ['engineers', 'lawyers', 'doctors', 'chefs', 'ninis'];

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

