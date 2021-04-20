const helpers = require('./helpers');

module.exports = {
  parseHours(rawHours) {
    const hoursRegex = /\d*:*\d+ [ap]m - \d*:*\d+ [ap]m/;
    const openclose = rawHours.match(hoursRegex)[0].split(' - ');
    openclose[0] = helpers.to24Hr(openclose[0]);
    openclose[1] = helpers.to24Hr(openclose[1]);

    return openclose;
  },

  parseDays(rawDays) {
    let openDays = [];

    const dayRangeRegex = /[a-z]{3}-[a-z]{3}/i;
    if (rawDays.match(dayRangeRegex) && rawDays.match(dayRangeRegex).length > 0) {
      const dayRange = rawDays.match(dayRangeRegex)[0].split('-');
      openDays = helpers.rangeToDays(dayRange[0], dayRange[1]);
    }

    const singleDaysRegex = /([a-zA-Z]{3})/g;
    const singleDays = rawDays.match(singleDaysRegex);

    singleDays.forEach((day) => {
      openDays.push(day);
    });

    return openDays;
  },
};
