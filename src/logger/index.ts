import pino from 'pino'
import ospath from 'path'

declare type LogLevels = 'warn' | 'error' | 'info' | 'debug'
export const logLevel: LogLevels = (process.env.LOG_LEVEL ||
  'info') as LogLevels

const targets = []

console.log(ospath.join(__dirname, '../../app.log'))

if (process.env.NODE_ENV === 'development') {
  targets.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  })
} else {
  targets.push({
    target: 'pino/file',
    options: { destination: ospath.join(__dirname, '../../app.log') },
  })
}

const logger = pino({ level: logLevel, transport: { targets } })

export default logger
