import React, { useState } from 'react';
import classNames from 'classnames';
import './Calendar.css';

const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const monthLabels = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const areDateEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  const dy = date1.getYear();
  const ty = date2.getYear();
  if (dy !== ty) return false;

  const dm = date1.getMonth();
  const tm = date2.getMonth();
  if (dm !== tm) return false;

  const dd = date1.getDate();
  const td = date2.getDate();
  return dd === td;
}

function MonthView({ dowStart, currentMonth, renderDay, isDisabled, selectedDate, onSelectDate }) {
  const today = new Date();
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
      <div className="Calendar__row columns" key="header-row">
        {
          new Array(7).fill(0).map((d, i) => (
            <div key={`header-cell-${i}`} className="Calendar__cell Calendar__cell--header column">
              {dayLabels[i]}
            </div>
          ))
        }
      </div>
      {
        rows.map((cells, ri) => (
          <div className="Calendar__row columns" key={`row-${ri}`}>
          {
            cells.map((date, ci) => (
              <div
                key={`cell-${ri}-${ci}`}
                className={classNames('Calendar__cell', 'column', { empty: !date, 'Calendar__cell--today': date && areDateEqual(date, today), 'Calendar__cell--selected': date  && areDateEqual(date, selectedDate), 'Calendar__cell--disabled': !date || isDisabled(date) })}
                onClick={() => date && !isDisabled(date) && onSelectDate(date)}
              >
              {date ? renderDay(date) : <span>&nbsp;</span>}
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

function Calendar({ renderDay, isDisabled, selectedDate, setSelectedDate }) {
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
        <span className="Calendar__monthSelector__nav icon-chevron-left" onClick={decrementDate} />
        <span className="Calendar__monthSelector__value">{monthLabels[currentMonth]} {currentYear}</span>
        <span className="Calendar__monthSelector__nav icon-chevron-right" onClick={incrementDate} />
      </div>
      <MonthView
        currentMonth={currentMonth}
        renderDay={renderDay}
        isDisabled={isDisabled}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  )
}

const defaultRenderDay = (date) => (
  <span className="Calendar__day">{date.getDate()}</span>
);

Calendar.defaultProps = {
  renderDay: defaultRenderDay,
};

export default Calendar;
