const express = require('express');

const app = express();

app.get('/', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/index.html');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/index.js', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/index.js');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/big-img.jpg', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/big-img.jpg');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/thing.gif', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/thing.gif');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/favicon.ico', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/favicon.ico');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/service-worker.js', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/service-worker.js');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/styles.css', (req, res) => {
    console.log('Hit the home route!');
    res.sendFile('/Users/mikecronin/Desktop/practice-projects/service-worker/src/styles.css');
    // res.send({ msg: 'hello world'}); // json payload
});

app.get('/test3', (req, res) => {
    console.log('Hit the home rodadasdasdasute!');
    setTimeout(() => {
        res.status(202).send({ msg: 'allll new 7' }); // json payload
    }, 2000);
});

app.get('/test2', (req, res) => {
    console.log('hit test 2 no mistake');
    setTimeout(() => {
        res.send({ msg: 'second test' }); // json payload
    }, 2000);
});

const port = 4321;
// "start" the app by listening on a port
app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}!`);
});
