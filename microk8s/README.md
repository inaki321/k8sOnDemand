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

# add custom hostname for my localhost (Already in the deploy.sh of /k8s folders is included the domain add )
sudo nano /etc/hosts
add 127.0.0.1 main-server.local --> domain for main server
# didn't add microservices, because the ip changes in the deploy , if I want I can add 10.1.131.158 microservice-01.local

## check microk8s config 
microk8s config
#should show 
server: https://172.28.210.205:16443
clusters etc.

Need to setup k8s config in the terminal for kubernetes library to work as expected 
#create kube dir to fetch using kubernetes/client-node library (only for orchestrator )
mkdir -p ~/.kube
export KUBECONFIG=~/.kube/config --> this is for const kc = new k8s.KubeConfig();

```