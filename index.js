const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Go to /hello endpoint to see response.');
});

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.listen(8080, () => {
  console.log('Listening on port 8080');
});