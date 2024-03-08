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
  
    client.get('words_found_record').then((data) => {
        resData.nb = data;
  
        client.get('guess_trials').then((data) => {
            resData.avg = data;
            res.json(resData);
        })
    })
})
  
app.post('/setscore', (req, res) => {
    const attempts = req.body.attempts;
    const int_attempts = parseInt(attempts);
    let resData = {};
    
    client.get('words_found_record').then((data) => {
        int_data = parseFloat(data);
        resData.words_found_record = int_data + 1;
  
        client.get('total_attempts').then((data) => {
            int_data = parseFloat(data);
            resData.total_attempts = int_data + int_attempts;
            resData.guess_trials = parseFloat(resData.total_attempts / resData.words_found_record);
    
            client.set('words_found_record', resData.words_found_record);
            client.set('total_attempts', resData.total_attempts);
            client.set('guess_trials', resData.guess_trials);
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