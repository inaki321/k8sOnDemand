## versions to use 
- Node version == v20.14.0 
- npm version == 10.7.0 
- python version == 3.10

- k8s version

    Client Version: v1.29.4

    Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3

- helm version

    version.BuildInfo{Version:"v3.9.1+unreleased", GitCommit:"7b27f35dd67826049e5466a5dcb6ec86d8308856", GitTreeState:"clean", GoVersion:"go1.21.9"}

- microk8s version
    
    MicroK8s v1.29.4 revision 6809

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