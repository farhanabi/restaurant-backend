module.exports = {
  rangeToDays(startDay, endDay) {
    const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = [];

    let i; let
      open = false;

    for (i = 0; i < week.length * 2; i += 1) {
      if (week[i % 7] === startDay) { open = true; }
      if (open) { days.push(week[i % 7]); }
      if (week[i % 7] === endDay && open === true) { break; }
    }

    return days;
  },

  to24Hr(twelveHour) {
    const hoursRegex = /\d*/;
    const eveningRegex = /pm/i;

    const time = twelveHour.split(':');
    let hours = parseInt(hoursRegex.exec(time[0])[0], 10);

    if (eveningRegex.test(twelveHour) && hours < 12) {
      hours += 12;
    } else if (!eveningRegex.test(twelveHour) && hours === 12) {
      if (!time[1] || parseInt(time[1], 10) === 0) {
        hours = 24;
      } else {
        hours -= 12;
      }
    }

    if (time[1]) {
      hours += parseInt(time[1], 10) / 60;
    }

    return hours;
  },
};
