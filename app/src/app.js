const express = require('express');
const app = express();
app.use(express.json());

//localhost:5000/login/user/engineers
app.get('/login/user/:group', async (req, res) => {
    console.log('hey ')
    const group = req.params.group;

    console.log(group)
    res.status(200).send({success: 'User with pod assinged '});
});



app.listen(5000, () => {
    console.log('Server is running on port 5000');
});