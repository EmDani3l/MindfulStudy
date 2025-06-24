export function addMinutes(time, mins, day) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + mins;
  let newDay = day + Math.floor(total / (24 * 60));
  let newMinutes = total % (24 * 60);
  let nh = Math.floor(newMinutes / 60);
  let nm = newMinutes % 60;
  return {
    time: `${nh < 10 ? '0' : ''}${nh}:${nm < 10 ? '0' : ''}${nm}`,
    day: newDay
  };
}

export function isTimeUsed(time, day, list) {
  return list.some(item => item.time === time && item.day === day);
}

export function addBlocks(start, end, name, list, day) {
  if (!start || !end) return day;
  let time = start;
  let current = { time, day };
  while (current.time < end || current.day < day) {
    if (!isTimeUsed(current.time, current.day, list)) {
      list.push({ time: current.time, activity: name, day: current.day });
    }
    current = addMinutes(current.time, 60, current.day);
  }
  return current.day;
}
