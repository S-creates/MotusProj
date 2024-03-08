const express = require('express');
const app = express();
const port = process.env.PORT || 7000;
const redis_url = process.env.REDIS || 'redis://localhost:6379';
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/callback";
const os = require('os');
const path = require('path');

const bodyParser = require('body-parser');

const cors = require('cors');

const redis = require('redis');

const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;
const CLIENTID = process.env.CLIENTID;

app.use(express.static(path.join(__dirname, 'public')));

const client = redis.createClient({ url: redis_url })
client.on('error', err => console.log('Redis Client Error', err))
client.connect().then(() => {
    console.log("OK");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/authorize', (req, res) => {
    const { clientid, secret, redirect_uri } = req.query;
  
    if (clientid === CLIENTID && secret === SECRET && redirect_uri === REDIRECT_URI) {
    	res.redirect(`/login.html`);
    } else {
    	res.status(400).send('Invalid parameters');
    }
});
  
app.post('/login-checker', (req, res) => {
	const login = req.body.login;
	const passwd = req.body.passwd;

	client.hGet('login', login).then((data) => {
		if (data && data.trim() === passwd.trim()) {
			const code = Math.random().toString(36).substring(7);
			client.hSet("oauth", code, login);
			res.send(code);
		} else {
			res.send("Not adeuqate");
		}
	});
});

app.post('/register', (req, res) => {
	const login = req.body.login;
	const password1 = req.body.password1;
	const password2 = req.body.password2;

	client.hGet('login', login).then((data) => {
		if (data) {
			res.send("<span style='color: red;'>Identifiant déjà existant</span>");
		} else {
			if (password1.trim() !== password2.trim()) {
				res.send("incorrect");
			} else {
				client.hSet("login", login, password1);
				res.send("registered");
			}
		}
	});
});

app.get('/token', (req, res) => {
	const { code } = req.query;

	client.hGet('oauth', code).then((data) => {
		if (data) {
			const idToken = jwt.sign(data, 'shhhhh');
			res.json({ id_token: idToken });
		} else {
			res.json({ error: 'Code invalide' });
		}
	});
});

app.listen(port, () => {
	console.log(`OAUTH APP running on port ${port}`);
});