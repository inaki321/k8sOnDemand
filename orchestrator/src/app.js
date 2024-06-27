import { assingLabeltoPod, getAvailablePods, getGroupPod, getStatefulDeployments } from './k8sfunctions.js';
//this library directly grabs the gcloud configuration in your machine 
import k8s from '@kubernetes/client-node';
import express from 'express'

const app = express();
app.use(express.json());

app.use(express.json({
    limit: '250mb',
}));

app.post('/assign-pod', async (req, res) => {
    const group = req.body.group;
    console.log('assign-pod called with group: ', group)
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const namespace = 'default';

    const groupPod = await getGroupPod(kc, namespace, group);
    console.log(groupPod)
    if (Object.keys(groupPod).length > 0) {
        console.log('Group pod already assinged: ', groupPod);
        res.status(200).send(groupPod)
        return;
    }

    console.log("Group doesn't haven an assigned pod ");
    const availablePods = await getAvailablePods(kc, namespace);
    console.log('available pods: ', availablePods);

    const assignStatus = await assingLabeltoPod(kc, namespace, availablePods, group);
    if (assignStatus) {
        console.log('pod assigned ', assignStatus);
        res.status(200).send({ succes: assignStatus });
    } else {
        res.status(439).send({ error: 'Error updating the pod label ' });
    }
});


async function checkAndScale() {
    /*
    Need before to do env vars on terminal
    mkdir -p ~/.kube
    export KUBECONFIG=~/.kube/config --> this is for const kc = new k8s.KubeConfig();
    */
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    //kc.clusters[0].server = 'http://172.28.210.205:16443'; //this works with k8s api, from cloud
    const namespace = 'default'; // Replace 'default' with your namespace if needed


    const statefulDeployment = await getStatefulDeployments(kc, namespace);
    if (!Object.keys(statefulDeployment).includes('microservice')) return; // return in case there is no deployment 
    console.log(statefulDeployment)

    const availablePods = await getAvailablePods(kc, namespace);

    console.log(availablePods)
    if (Object.keys(availablePods).length <= 0) {
        console.log(' NO available pods, creating more ');
    }
    else {
        console.log('There are ', Object.keys(availablePods).length, ' available pods');
    }
    /*const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
    let deployments = undefined;
    try {
        deployments = await k8sApi.listNamespacedDeployment(namespace); // Replace 'default' with your namespace if needed
    } catch (err) {
        console.error('Error fetching deployments:', err);
    }

    console.log('checking deployments: ');
    deployments.body.items.forEach(deployment => {
        console.log('Deployment Name:', deployment.metadata.name);
    });
    console.log('---------------------------');*/


    /*
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    try {
        const podsRes = await k8sApi.listNamespacedPod('default');
        console.log(podsRes.body);
    } catch (err) {
        console.error(err);
    }*/
    /*try {
        // List all pods in the namespace
        const pods = await k8sCoreApi.listNamespacedPod(namespace);

        // Check if there is any pod with label assignment=unassigned
        const unassignedPods = pods.body.items.filter(pod =>
            pod.metadata.labels && pod.metadata.labels.assignment === 'unassigned'
        );

        if (unassignedPods.length > 0) {
            // Get the current deployment
            const deployment = await k8sApi.readNamespacedDeployment(deploymentName, namespace);
            const currentReplicas = deployment.body.spec.replicas;

            // Scale up by 1
            const newReplicas = currentReplicas + 1;
            deployment.body.spec.replicas = newReplicas;

            // Update the deployment
            await k8sApi.replaceNamespacedDeployment(deploymentName, namespace, deployment.body);
            console.log(`Scaled ${deploymentName} to ${newReplicas} replicas`);
            return true;
        } else {
            console.log('No unassigned pods found');
            return true;
        }
    } catch (err) {
        console.error('Error checking and scaling deployment:', err);
        return false;
    }*/
    console.log('-------------------')
}

//setInterval(checkAndScale, 60000);
setInterval(checkAndScale, 5000);

app.listen(5045, () => {
    console.log('Server is running on port 5045');
});