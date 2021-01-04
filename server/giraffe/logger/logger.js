import { hostname } from "os";

const host = hostname();

function addZero(number, length = 2) {
  const s = `0000${number}`;
  return s.substr(s.length - length);
}

function getDate() {
  const date = new Date();

  const yyyy = date.getFullYear();
  const MM = addZero(date.getMonth() + 1);
  const dd = addZero(date.getDate());
  const hh = addZero(date.getHours());
  const mm = addZero(date.getMinutes());
  const ss = addZero(date.getSeconds());
  const SSS = addZero(date.getMilliseconds(), 3);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}.${SSS}`;
}

export function getLogger(level) {
  const upcaseLevel = level.toUpperCase();
  return (thread, subject, ...others) => {
    console[level](getDate(), upcaseLevel, host, subject, thread, ...others);
  };
}

export const logger = {
  info: getLogger("info"),
  error: getLogger("error")
};
