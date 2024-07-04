import express from 'express';
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

var microserviceGroup = undefined;

app.get('/', async (req, res) => {
    console.log('API working for microserver: ' + microserviceGroup);
    res.status(200).send('API working for microserver: ' + microserviceGroup);
});

app.post('/initServer', async (req, res) => {

    console.log(req.body)
    const group = req.body.group;
    microserviceGroup = group;
    if (!(microserviceGroup || group)) return;

    console.log('Initializing microservice for ' + microserviceGroup);
    res.status(200).send({ success: 'Server initialized for ' + microserviceGroup });
});


app.get('/groupServer', async (req, res) => {
    console.log('Getting group server...');
    console.log('Group: ', microserviceGroup);
    res.status(200).send({ group: microserviceGroup });
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

app.listen(5983, () => {
    console.log('Microservice is running on port 5983');
});