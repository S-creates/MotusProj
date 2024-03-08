const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const redis_url = process.env.REDIS || "redis://localhost:6379";
const os = require('os');

const bodyParser = require('body-parser');

const redis = require('redis');


const client = redis.createClient({ url: redis_url });
client.on('error', err => console.log('Redis Client Error', err));
client.connect().then(() => {
    console.log('OK');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/getscore', (req, res) => {
    let resData = {};
  
    client.get('nb_words_found').then((data) => {
        resData.nb = data;
  
        client.get('average_try').then((data) => {
            resData.avg = data;
            res.json(resData);
        })
    })
})
  
app.post('/setscore', (req, res) => {
    const attempts = req.body.attempts;
    const int_attempts = parseInt(attempts);
    let resData = {};
    
    client.get('nb_words_found').then((data) => {
        int_data = parseFloat(data);
        resData.nb_words_found = int_data + 1;
  
        client.get('total_attempts').then((data) => {
            int_data = parseFloat(data);
            resData.total_attempts = int_data + int_attempts;
            resData.average_try = parseFloat(resData.total_attempts / resData.nb_words_found);
    
            client.set('nb_words_found', resData.nb_words_found);
            client.set('total_attempts', resData.total_attempts);
            client.set('average_try', resData.average_try);
            res.send('Score set succesfully');
        })
    })
  })
  
app.get('/port', (req, res) => {
      res.send(`SCORE APP working on ${os.hostname} port ${port}`);
})
  
  
app.listen(port, () => {
    console.log(`SCORE APP working on ${os.hostname} port ${port}`);
})