/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'

import FastSpeedtest from 'fast-speedtest-api'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { client } from './client'
import logger from './logger'
import { sleep } from './utils'

logger.info('Starting...')

const speedtest = new FastSpeedtest({
  token: process.env.FAST_TOKEN, // required
  verbose: false, // default: false
  timeout: 10000, // default: 5000
  https: true, // default: true
  urlCount: 5, // default: 5
  bufferSize: 8, // default: 8
  unit: FastSpeedtest.UNITS.Mbps, // default: Bps
})

let successfulTest = false
let numberOfTriesRemaining = Number(process.env.NUMBER_OF_RETRIES ?? 3)
const delayBetweenTries = Number(process.env.DELAY_BETWEEN_TRIES ?? 5000)

const runSpeedTest = async () => {
  logger.info('Speed test running')
  let speed
  try {
    speed = await speedtest.getSpeed()
  } catch (error: any) {
    logger.error('Speed test failed', error)
    logger.error(error?.message ?? error)
    throw error
  }

  logger.info(`Speed: ${speed} Mbps`)

  const command = new PutMetricDataCommand({
    MetricData: [
      {
        MetricName: `${process.env.LOCATION}NetworkSpeed`,
        Unit: 'Megabits/Second',
        Value: speed,
      },
    ],
    Namespace: `NetworkSpeed/${process.env.LOCATION}`,
  })

  try {
    logger.info(`Sending metric to AWS ${process.env.LOCATION}`)
    await client.send(command)
    logger.info('Sent metric successfully')
  } catch (error) {
    logger.error('Failed to send metric to AWS', error)
    logger.error(error)
    throw error
  }

  logger.info('Done')
  successfulTest = true
}

const main = async () => {
  while (!successfulTest && numberOfTriesRemaining > 0) {
    try {
      await runSpeedTest()
    } catch (error: any) {
      logger.error('Failed to run speed test')
      logger.error(error.message ?? error)
    }

    numberOfTriesRemaining -= 1

    if (!successfulTest && numberOfTriesRemaining > 0) {
      logger.error(`Will try again in ${delayBetweenTries} ms`)
      await sleep(delayBetweenTries)
    }
  }
}

main()
