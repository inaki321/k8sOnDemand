import express from 'express';

const app = express();
app.use(express.json());

app.use(express.json({
    limit: '250mb',
}));

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


app.listen(5983, () => {
    console.log('Microservice is running on port 5983');
});