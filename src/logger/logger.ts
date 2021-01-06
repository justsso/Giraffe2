import { hostname } from 'os'

const host = hostname()

function addZero(number: Number, length = 2) {
  const s = `0000${number}`
  return s.substr(s.length - length)
}

function getDate() {
  const date = new Date()

  const yyyy = date.getFullYear()
  const MM = addZero(date.getMonth() + 1)
  const dd = addZero(date.getDate())
  const hh = addZero(date.getHours())
  const mm = addZero(date.getMinutes())
  const ss = addZero(date.getSeconds())
  const SSS = addZero(date.getMilliseconds(), 3)

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}.${SSS}`
}

export function getLogger(level: string) : (thread: any, subject: string, ...others: any[]) => void {
  const upcaseLevel = level.toUpperCase()
  return (thread: any, subject: String, ...others) => {
    (console as any)[level](
      getDate(),
      upcaseLevel,
      host,
      subject,
      thread,
      ...others
    )
  }
}

export const logger = {
  info: getLogger('info'),
  error: getLogger('error')
}
