const express = require('express');
//const { Pool } = require('pg'); // Assuming PostgreSQL for the connection pool

//this library directly grabs the gcloud configuration in your machine 
const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node'); // Kubernetes client
const app = express();
app.use(express.json());

app.use(express.json({
    limit: '250mb',
}));

/*const pool = new Pool({
    user: 'test-user',
    host: 'localhost',
    database: 'available-pods-redis',
    password: '1234567',
    port: 5432,
});*/

async function assignAvailablePod(client, redisClient, sessionId) {
    try {
        //gets the pods that aren't assigned to a group
        const availablePods = await getUnassignedPods(client);


        //Loops trough all my available pods 
        for (const pod of availablePods) {
            const patch = {
                metadata: {
                    labels: {
                        assignment: null,
                        session_id: sessionId,
                        "karpenter.sh/do-not-evict": "true"
                    }
                }
            };



            try {
                //This assings to an existing pod the new url to use 
                await axios.patch(
                    `${client.baseUrl}/api/v1/namespaces/default/pods/${pod.metadata.name}`,
                    patch,
                    { headers: { 'Content-Type': 'application/merge-patch+json' } }
                );

                const podName = pod.metadata.name;
                const podIp = pod.status.podIP;

                const res = await redisClient.pipeline()
                    .hset('assigned_pod_names', sessionId, podName)
                    .hset('assigned_pod_ips', sessionId, podIp)
                    .sadd('sessions', sessionId)
                    .hget('assigned_pod_names', sessionId)
                    .hget('assigned_pod_ips', sessionId)
                    .exec();

                const podInfo = {
                    pod_name: res[3][1],
                    pod_ip: res[4][1]
                };

                return podInfo;
            } catch (err) {
                if (err.response && err.response.status === 409) {
                    // If there's a conflict error (HTTP status 409), it means the resource was updated in the meantime,
                    // so we continue with the next available pod.
                    continue;
                } else {
                    throw err;
                }
            }
        }

        throw new Error("no available pods");
    } catch (err) {
        throw err;
    }
}

async function getUnassignedPods(client, runtimeConfig) {
    const namespace = runtimeConfig.namespace;
    if (!namespace) {
        throw new Error("namespace not found in runtimeConfig");
    }

    const appName = runtimeConfig.app_name;
    if (!appName) {
        throw new Error("app_name not found in runtimeConfig");
    }

    const k8sApi = client.api.v1.namespaces(namespace).pods;
    const labelSelector = `assignment=unassigned`;


    //check if 
    try {
        const podList = await k8sApi.get({ qs: { labelSelector: labelSelector } });
        const pods = podList.body.items.filter(p => podIsReady(p));
        return pods;
    } catch (err) {
        throw new Error(`Error fetching pods: ${err.message}`);
    }
}

function podIsReady(pod) {
    const conditions = pod.status.conditions;
    if (!conditions) return false;

    return conditions.some(cond => cond.type === 'Ready' && cond.status === 'True');
}



app.post('/assign-pod', async (req, res) => {
    console.log(req.body)
    const group = req.body.group;
    console.log('me llamaron ', group)


    /*let dbClient;
    try {
        dbClient = await pool.connect();
    } catch (e) {
        return res.status(500).send(e.toString());
    }

    const available = await checkAndScale();

    if(!available){
        return "No pods available to assing";
    } 

    const kc = new KubeConfig();
    kc.loadFromDefault();

    //create kubeclt client
    //instead of doing kubeclt get pods, we get directly the client 
    const kubeClient = kc.makeApiClient(CoreV1Api);

    try {
        const result = await assignAvailablePod(kubeClient, dbClient, req.body.session_id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).send(e.toString());
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }*/
});


async function checkAndScale() {
    try {
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
    }
}

//setInterval(checkAndScale, 60000);

app.listen(5045, () => {
    console.log('Server is running on port 5045');
});