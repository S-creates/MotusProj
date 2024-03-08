const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const score_uri = process.env.SCORE_URI || "http://localhost:4000";
const api_path = process.env.API_PATH || "/home/cytech/Desktop/Microservices-main/motus/data/liste_francais_utf8.txt";
const oauth_uri = process.env.OAUTH_URI || "http://localhost:7000";
const redirect_uri = process.env.REDIRECT_URI || "http://localhost:3000/callback";
const os = require('os');
const path = require('path');


const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const fetch = require('node-fetch');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;
const clientid = process.env.CLIENTID;


let attempts = 0;  

function create_list() {
    const file = fs.readFileSync(api_path);
    const word_list = file.toString().split('\n');
    return word_list;
}

function get_word(word_list, number) {
    return word_list[number];
}

function get_number(word_list) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return (day + month + year) % word_list.length;
}

app.use(bodyParser.urlencoded({ extended: false }));

app.set('trust proxy', 1);
app.use(session({
    secret: 'ssmd',
    name: 'sessionId',
    resave: true,
    saveUninitialized: true
}));





app.post('/checkword', (req, res) => {
    httpRequestCounter.inc();
    const word_list = create_list();
    const number = get_number(word_list);
    let word = get_word(word_list, number);
    console.log(word);
    const word_to_guess_split = word.split('');
    
    let foundWord = req.body.foundWord;
    const foundWord_split = foundWord.split('');

    if (foundWord.length !== word.length) {
        res.send("<p>Length not adequate</p>");
    } else {
        attempts++;
        let result = '';

        for (let i = 0; i < foundWord_split.length; i++) {
            if (foundWord_split[i] === word_to_guess_split[i]) {
                result += "<p class='correct'>" + foundWord_split[i] + "</p>";
            }
            else if (word_to_guess_split.includes(foundWord_split[i])) {
                result += "<p class='present'>" + foundWord_split[i] + "</p>";
            }
            else {
                result += foundWord_split[i];
            }
        }
        
        if (foundWord.trim() === word.trim()) {
            fetch(score_uri + "/setscore", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attempts }),
            })
                .then(response => response.text())
                .then(data => {
                    attempts = 0
                    res.send(result)
                })
                .catch(error => console.error('Error:', error))
        } else {
            res.send(result);
        }
    }

    
});
app.use((req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect(`${oauth_uri}/authorize?clientid=${clientid}&secret=${secret}&redirect_uri=${redirect_uri}`);
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/port', (req, res) => {
    res.send(`APP working on ${os.hostname} port ${port}`);
});
app.listen(port, () => {
    console.log(`APP working on ${os.hostname} port ${port}`);
});

app.get('/callback', (req, res) => {
    const { code } = req.query;

    if (!code) {
        res.send('Not found');
    }
    
    fetch(`${oauth_server}/token?code=${code}`)
        .then(async response => {
            const data = await response.json();
            const idToken = data.id_token;
            const decodedToken = jwt.verify(idToken, 'shhhhh');
            console.log(decodedToken);
            req.session.user = decodedToken;
            res.redirect('/');
        })
        .catch(error => {
            console.log('Error: ', error.message);
            res.send('Internal server error');
        })
});



