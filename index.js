const csv = require('csv-parser');
const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.static('build'));
app.use(express.json());

const data = [];

fs.createReadStream('hours.csv')
  .pipe(csv())
  .on('data', (d) => {
    data.push(d);
  });

app.get('/api/restaurant', (request, response) => {
  if (request.query.query) {
    response.json(data.filter(
      (d) => d['Restaurant Name'].toLowerCase().includes(request.query.query),
    ));
  } else {
    response.json(data);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
