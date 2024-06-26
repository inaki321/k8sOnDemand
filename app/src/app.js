import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.json({
    limit: '250mb',
}));


//localhost:5000/login/user/engineers
app.get('/login/user/:group', async (req, res) => {
    console.log('hey ')
    const group = req.params.group;

    const groups = ['engineers', 'lawyers', 'doctors', 'chefs', 'ninis'];
    const randomGroup = groups[Math.floor(Math.random() * groups.length)]

    console.log(randomGroup)
    let podUrl = undefined;
    try {
        podUrl = await fetch('http:localhost:5045/assign-pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group: randomGroup })
        });
    } catch (e) {
        console.log('ERROR: ' + e);
    }


    console.log(podUrl)
    res.status(200).send({ success: 'User with pod assinged ' });
});



app.listen(5000, () => {
    console.log('Server is running on port 5000');
});