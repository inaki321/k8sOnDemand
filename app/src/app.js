import express from 'express';
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

    const groups = ['engineers', 'lawyers', 'doctors', 'chefs', 'ninis'];
    const randomGroup = groups[Math.floor(Math.random() * groups.length)]

    console.log(randomGroup)
    let podUrl = undefined;
    try {
        // if app running using npm http:localhost:5045
        const res = await fetch('http:127.0.0.1:5045/assign-pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group: randomGroup })
        });
        podUrl = await res.json();
        console.log(podUrl)
    } catch (e) {
        console.log('ERROR: ' + e);
    }


    res.status(200).send({
        'success': 'User with pod assinged correctly',
        'pod': podUrl
    });
});



app.listen(5000, () => {
    console.log('Server is running on port 5000');
});