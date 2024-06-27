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

//localhost:5000/login/user/engineers
app.get('/login/user/:group', async (req, res) => {
    const group = req.params.group;

    //const groups = ['engineers', 'lawyers', 'doctors', 'chefs', 'ninis'];
    //const randomGroup = groups[Math.floor(Math.random() * groups.length)]

    console.log('calling orchestrator to assign a pod for group ', group);
    let podUrl = undefined;
    try {
        // if app running using npm http:localhost:5045
        //10.1.131.188
        //const res = await fetch('http://orchestrator.local/assign-pod', {
        // microk8s   kubectl get svc main-server-service
        //curl my ip adress  curl 10.152.183.100:5000
        console.log('Calling http://10.152.183.101:5000/assign-pod')
        console.log('with params: ',JSON.stringify({ 'group': group }));
        const res = await fetch('http://10.152.183.101:5000/assign-pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'group': group })
        });

        console.log('status: ',res.status)
        console.log('text: ',res.statusText)
        podUrl = await res.json();
        console.log(podUrl)
    } catch (e) {
        console.log('ERROR: ' + e);
    }

    console.log('podurl res: ',podUrl);

    res.status(200).send({
        'success': 'User with pod assinged correctly',
        'pod': podUrl
    });
});



app.listen(5000, () => {
    console.log('Server is running on port 5000');
});