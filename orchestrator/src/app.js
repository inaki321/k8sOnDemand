import { assingLabeltoPod, getAvailablePods, getGroupPod, getStatefulDeployments, replicateMoreServices } from './k8sfunctions.js';
//this library directly grabs the gcloud configuration in your machine 
import k8s from '@kubernetes/client-node';
import express from 'express'
import fetch from 'node-fetch';
import promClient from 'prom-client';

const app = express();
app.use(express.json());

app.use(express.json({
    limit: '250mb',
}));

// ---------- prometheus metrics
// Create a Registry which registers the metrics
const register = new promClient.Registry();
// Add a default metrics collection
promClient.collectDefaultMetrics({ register });
// Create a custom metric
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500] // buckets for response time from 50ms to 500ms
});
// ---------- prometheus metrics

app.get('/', async (req, res) => {
    console.log('API working orchestrator.local');
    res.status(200).send('API working orchestrator.local');
});

app.post('/assign-pod', async (req, res) => {
    const group = req.body.group;
    console.log('assign-pod called with group: ', group)
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const namespace = 'default';

    let groupPod = await getGroupPod(kc, namespace, group);
    if (Object.keys(groupPod).length > 0) {
        groupPod.assigned = group;
        console.log('Group pod already assinged: ', groupPod);
        res.status(200).send(groupPod)
        return;
    }

    console.log("Group doesn't haven an assigned pod ");
    const availablePods = await getAvailablePods(kc, namespace);
    console.log('available pods: ', availablePods);

    const assignStatus = await assingLabeltoPod(kc, namespace, availablePods, group);
    let initServer;
    if (assignStatus) {
        console.log('pod assigned ', assignStatus);
        console.log('Initializing server with url ', `http://${assignStatus.podIP}:5983/initServer`);
        try {
            const res = await fetch(`http://${assignStatus.podIP}:5983/initServer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'group': group })
            });
            initServer = await res.json();
        } catch (e) {
            console.log('Error intializing server ' + e);
        }

        res.status(200).send({
            pod: assignStatus,
            initServer: initServer
        });
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
        replicateMoreServices(kc, namespace, statefulDeployment);
    }
    else {
        console.log('There are ', Object.keys(availablePods).length, ' available pods');
    }


    console.log('-------------------')
}

setInterval(checkAndScale, 15000);

// ---------- prometheus metrics
// Middleware to measure request duration
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route ? req.route.path : 'unknown', code: res.statusCode });
    });
    next();
});
// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
// ---------- prometheus metrics

app.listen(5045, () => {
    console.log('Server is running on port 5045');
});