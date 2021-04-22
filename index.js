const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const moment = require('moment');
const momentTZ = require('moment-timezone');

momentTZ.tz.setDefault('Etc/UTC');

const Collection = require('./models/collection');

const app = express();

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

const parser = require('./utils/parser');

const data = [];

fs.createReadStream('hours.csv')
  .pipe(csv())
  .on('data', (d) => {
    const temp = {};
    const openHourTemp = {};
    temp.name = d['Restaurant Name'];
    temp.hours = d['Open Hours'];
    d['Open Hours'].split('/').forEach((o) => {
      o.trim();
      const openclose = parser.parseHours(o);
      const days = parser.parseDays(o);
      days.forEach((day) => {
        openHourTemp[day] = {
          open: openclose[0],
          close: openclose[1],
        };
      });
    });
    temp.open_hours = openHourTemp;
    data.push(temp);
  });

app.get('/api/restaurant', (request, response) => {
  if (request.query.query && request.query.date) {
    response.json(data.filter(
      (d) => {
        const openHours = d.open_hours[moment(request.query.date.split(' ')[0]).format('ddd')];
        const userTime = parseInt(moment(request.query.date).format('H'), 10)
          + parseInt(moment(request.query.date).format('mm'), 10) / 60;

        if (openHours) {
          return d.name.toLowerCase().includes(request.query.query.toLowerCase())
            && openHours.open <= userTime
            && openHours.close >= userTime;
        }
      },
    ));
  } else if (request.query.date) {
    response.json(data.filter(
      (d) => {
        const openHours = d.open_hours[moment(request.query.date.split(' ')[0]).format('ddd')];
        const userTime = parseInt(moment(request.query.date).format('H'), 10)
          + parseInt(moment(request.query.date).format('mm'), 10) / 60;
        if (openHours) {
          return openHours.open <= userTime && openHours.close >= userTime;
        }
      },
    ));
  } else if (request.query.query) {
    response.json(data.filter(
      (d) => d.name.toLowerCase().includes(request.query.query.toLowerCase()),
    ));
  } else {
    response.json(data);
  }
});

app.get('/api/collections', (request, response) => {
  Collection.find({}).then((collection) => {
    response.json(collection);
  });
});

app.post('/api/collections', (request, response) => {
  console.log(request.body);
  if (request.body.restaurant_name === undefined || request.body.collection_name === undefined) {
    return response.status(400).json({
      error: 'name or collection name is missing',
    });
  }

  const collcetion = new Collection({
    name: request.body.collection_name,
    restaurants: [request.body.restaurant_name],
  });

  collcetion.save()
    .then((savedCollection) => savedCollection.toJSON())
    .then((savedAndFormattedCollection) => {
      response.json(savedAndFormattedCollection);
    })
    .catch((error) => next(error));
});

app.put('/api/collections/:id', (request, response, next) => {
  const collection = {
    name: request.body.collection_name,
    restaurants: request.body.restaurants,
  };

  Collection.findByIdAndUpdate(request.params.id, collection, { new: true })
    .then((updatedCollection) => {
      response.json(updatedCollection);
    })
    .catch((error) => next(error));
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
