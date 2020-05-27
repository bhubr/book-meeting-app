import React from 'react';
import classNames from 'classnames';
import './Calendar.css';

function Calendar({ dowStart }) {
  const today = new Date();
  const thisMonth = today.getMonth();
  let month = thisMonth;
  let day = 1;
  const dates = [];
  while(true) {
    const date = new Date();
    date.setDate(day);
    month = date.getMonth();
    if (month > thisMonth) break;
    day++;
    dates.push(date);
  }
  console.log(dates);
  const [first] = dates;
  const firstDow = first.getDay();
  const rows = [];
  let cells = [];
  let dow;
  console.log(dowStart, firstDow);
  for (let dow = dowStart; dow < firstDow; dow++) {
    cells.push(null);
  }
  const numEmpty = cells.length;
  for (let i = 0; i < 7 - numEmpty; i++) {
    cells.push(dates.shift());
  }
  rows.push(cells);
  cells = [];
  let count = 0;
  while (dates.length) {
    console.log(dates.length)
    cells.push(dates.shift());
    count += 1;
    if (count === 7) {
      rows.push(cells);
      cells = [];
      count = 0;
    }
  }
  if (count > 0) {
    for (let i = count; i < 7; i++) {
      cells.push(null);
    }
    rows.push(cells);
  }
  return (
    <div>
      {
        rows.map((cells) => (
          <div className="Calendar__row">
          {
            cells.map((date, index) => (
              <div
                key={index}
                className={classNames('Calendar__cell', { empty: !date })}
              >
              {date ? date.getDate() : <span>&nbsp;</span>}
              </div>
            ))
          }
          </div>
        ))
      }
    </div>
  );
}

Calendar.defaultProps = {
  dowStart: 1,
};

export default Calendar;
