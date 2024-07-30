#deletes the created resouces if exists 
microk8s kubectl delete deployment main-server
microk8s kubectl delete service main-server-loadbalancer-service
microk8s kubectl delete service main-server-nodeport-service
microk8s kubectl delete service main-server-ingress-service

#generate deployment
microk8s kubectl apply -f deployment.yaml
# create loadbalancer to access by generic address 
microk8s kubectl apply -f loadbalancer.yaml
# create domain address 
microk8s kubectl apply -f nodeport.yaml
microk8s kubectl apply -f managed-cert.yaml # creates certificate for k8s, ONLY USED FOR HTTPS, NOO FOR TLS 
microk8s kubectl apply -f ingress.yaml #searches for my nodeport service, to export domain , need to add dns saved 

sleep 5

#shows my deployment pod 
microk8s kubectl get services -l app=main-server



