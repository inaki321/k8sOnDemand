import k8s from '@kubernetes/client-node';

// -----------------------------PODS----------------------

export const getAvailablePods = async (kc, namespace) => {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    let k8sPods = undefined;
    try {
        const res = await k8sApi.listNamespacedPod(namespace);
        k8sPods = res.body.items;
    } catch (err) {
        console.error('Error fetching statefulstate deploys:', err);
    }

    const availablePods = {};
    k8sPods.map((pod) => {
        const podname = pod.metadata.name;
        const namespace = pod.metadata.namespace;
        if (!podname.includes('microservice')) return;

        const podAssigned = pod.metadata.labels.assigned;
        if (!podAssigned) {
            availablePods[podname] = {
                'namespace': namespace,
                'podIP': pod.status.podIP,
                'assigned': null
            }
        }
    });

    return availablePods;
}

export const getGroupPod = async (kc, namespace, group) => {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    let k8sPods = undefined;
    try {
        const res = await k8sApi.listNamespacedPod(namespace);
        k8sPods = res.body.items;
    } catch (err) {
        console.error('Error fetching statefulstate deploys:', err);
    }

    let groupPod = {};
    k8sPods.map((pod) => {
        const podname = pod.metadata.name;
        const namespace = pod.metadata.namespace;
        if (!podname.includes('microservice')) return;

        const podAssigned = pod.metadata.labels.assigned;
        if (podAssigned == group) {
            groupPod = {
                'namespace': namespace,
                'podIP': pod.status.podIP,
                'assigned': null
            }
        }
    });

    return groupPod;
}

export const assingLabeltoPod = async (kc, namespace, availablePods, group) => {
    const podKeys = Object.keys(availablePods);
    const randomIndex = Math.floor(Math.random() * podKeys.length);
    const podName = podKeys[randomIndex];
    console.log('Going to set group ', group, ' for pod ', podName);
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    try {
        const res = await k8sApi.readNamespacedPod(podName, namespace);
        const pod = res.body;

        // assign new group
        if (!pod.metadata.labels) {
            pod.metadata.labels = {};
        }
        pod.metadata.labels['assigned'] = group;

        console.log(`Going to assing labels for pod: ${podName} in namespace: ${namespace}`);
        console.log('With labels: ', pod.metadata.labels);
        const patch = [
            {
                op: 'replace',
                path: '/metadata/labels',
                value: pod.metadata.labels,
            },
        ];
        const options = { "headers": { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };

        const podPatchRes = await k8sApi.patchNamespacedPod(
            podName,
            namespace,
            patch,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            options,
        );

        return {
            'namespace': namespace,
            'podIP': podPatchRes.body.status.podIP,
            'assigned': group
        }
    } catch (e) {
        console.log('ERROR updating pod: ' + e);
        return false;
    }
}

// -----------------------------DEPLOYMENTS----------------------

export const getStatefulDeployments = async (kc, namespace) => {
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    const statefulService = {};
    console.log('Getting stateful deployments: ')
    try {
        const res = await k8sApi.listStatefulSetForAllNamespaces();
        const statefulSets = res.body.items;
        statefulSets.forEach((statefulSet) => {
            statefulService[statefulSet.metadata.name] = {
                'replicas': statefulSet.spec.replicas,
                'creation': statefulSet.metadata.creationTimestamp,
            }
        });
    } catch (err) {
        console.error('Error fetching statefulsets:', err);
    }

    return statefulService;
}

export const replicateMoreServices = async (kc, namespace, statefulDeploys) => {
    const deployName = Object.keys(statefulDeploys)[0];
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
    const res = await k8sApi.readNamespacedStatefulSet(deployName, namespace);
    const statefulSet = res.body;
    let replicasCount = statefulSet.spec.replicas;
    console.log('Replicas before: ', replicasCount)
    replicasCount++;
    statefulSet.spec.replicas = replicasCount;
    try {
        await k8sApi.replaceNamespacedStatefulSet(deployName, namespace, statefulSet);
        console.log(`StatefulSet ${deployName} scaled to ${replicasCount} replicas`);
    } catch (e) {
        console.log('ERROR scaling more pods ', e);
    }
}