import express, { json } from 'express';
import fetch from 'node-fetch';
import promClient from 'prom-client';

const app = express();
app.use(express.json());
app.use(express.json({
    limit: '250mb',
}));

// prometheus metrics
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
// prometheus metrics

app.get('/', async (req, res) => {
    console.log('API working main-server.local');
    res.status(200).send('API working main-server.local');
});

const groups = {
    'engineers': ['inaki', 'rafa'],
    'lawyers': ['juan', 'pepe'],
    'chef': ['bori', 'ximi'],
}

//localhost:5000/login/user/engineers
app.get('/login/user/:user', async (req, res) => {
    const user = req.params.user;

    let foundGroup = Object.entries(groups).find(([key, names]) => names.includes(user))?.[0];
    if (!foundGroup) foundGroup = 'default';
    console.log(`Group for ${user} is ${foundGroup} `);
    console.log('Calling orchestrator to see which pod user needs');
    let podUrl = undefined;
    try {
        // if app running using npm http:localhost:5045
        //const res = await fetch('http://orchestrator.local/assign-pod', {
        console.log('Calling http://10.152.183.101:5045/assign-pod')
        console.log('with params: ', JSON.stringify({ 'group': foundGroup }));
        //const res = await fetch('http://orchestrator.local:31231/assign-pod', {       
        //cant call orchestrator.local because it is not on cloud cluster , everything locally needs cluster ip
        const res = await fetch('http://10.152.183.101:5045/assign-pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'group': foundGroup })
        });

        console.log('status: ', res.status)
        console.log('text: ', res.statusText)
        podUrl = await res.json();
        console.log(podUrl)

    } catch (e) {
        console.log('ERROR: ' + e);
        res.status(439).send({ 'error': 'Error getting pod ' + e });
        return;
    }


    let microserverRes = undefined;
    try {
        const res = await fetch(`http://${podUrl.podIP}:5983/`);
        microserverRes = await res.text();
    } catch (e) {
        console.log('Error intializing server ' + e);
    }

    res.status(200).send({
        'success': true,
        'pod': podUrl,
        'microserverRes': microserverRes,
    });
});

// prometheus metrics
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
// prometheus metrics

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});