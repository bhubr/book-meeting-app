import React, { useState } from 'react';
import classNames from 'classnames';
import './Calendar.css';

const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const monthLabels = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function MonthView({ dowStart, currentMonth }) {
  const thisMonth = currentMonth;
  let month = thisMonth;
  let day = 1;
  const dates = [];
  while(true) {
    const date = new Date();
    date.setMonth(currentMonth);
    date.setDate(day);
    month = date.getMonth();
    if (month > thisMonth) break;
    day++;
    dates.push(date);
  }
  const [first] = dates;
  const firstDow = first.getDay();
  const rows = [];
  let cells = [];
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
      <div className="Calendar__row" key="header-row">
        {
          new Array(7).fill(0).map((d, i) => (
            <div key={`header-cell-${i}`} className="Calendar__cell Calendar__cell--header">
              {dayLabels[i]}
            </div>
          ))
        }
      </div>
      {
        rows.map((cells, ri) => (
          <div className="Calendar__row" key={`row-${ri}`}>
          {
            cells.map((date, ci) => (
              <div
                key={`cell-${ri}-${ci}`}
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

MonthView.defaultProps = {
  dowStart: 1,
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getYear() + 1900;
  const setDate = (month, year) => {
    const nextMonthStr = (month + 1).toString();
    const nextDate = new Date(`${year}-${nextMonthStr.padStart(2, '0')}-01`);
    setCurrentDate(new Date(nextDate));
  }
  const decrementDate = () => {
    let nextYear = currentYear;
    let nextMonth = currentMonth;
    if (currentMonth === 0) {
      nextYear -= 1;
      nextMonth = 11;
    } else {
      nextMonth -= 1;
    }
    setDate(nextMonth, nextYear);
  }
  const incrementDate = () => {
    let nextYear = currentYear;
    let nextMonth = currentMonth;
    if (currentMonth === 11) {
      nextYear += 1;
      nextMonth = 0;
    } else {
      nextMonth += 1;
    }
    setDate(nextMonth, nextYear);
  }
  return (
    <div className="Calendar">
      <div className="Calendar__monthSelector">
        <span className="icon-chevron-left" onClick={decrementDate} />
        <span className="Calendar__monthSelector__value">{monthLabels[currentMonth]} {currentYear}</span>
        <span className="icon-chevron-right" onClick={incrementDate} />
      </div>
      <MonthView
        currentMonth={currentMonth}
      />
    </div>
  )
}

export default Calendar;
