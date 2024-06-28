import express, { json } from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.json({
    limit: '250mb',
}));


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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});