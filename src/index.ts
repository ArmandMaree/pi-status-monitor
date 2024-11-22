import 'dotenv/config'

import FastSpeedtest from 'fast-speedtest-api'
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { client } from './client'
import logger from './logger'

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

logger.info('Speed test running')

speedtest
  .getSpeed()
  .then(async (s: number) => {
    logger.info(`Speed: ${s} Mbps`)

    const command = new PutMetricDataCommand({
      MetricData: [
        {
          MetricName: `${process.env.LOCATION}NetworkSpeed`,
          Unit: 'Megabits/Second',
          Value: s,
        },
      ],
      Namespace: `NetworkSpeed/${process.env.LOCATION}`,
    })

    try {
      logger.info('Sending metric to AWS')
      await client.send(command)
      logger.info('Sent metric successfully')
    } catch (error) {
      logger.error('Failed to send metric to AWS')
      logger.error(error)
    }

    logger.info('Done')
  })
  .catch((error: Error) => {
    logger.error('Speed test failed')
    logger.error(error.message)
  })
