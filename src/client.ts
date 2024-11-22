import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'

export const client = new CloudWatchClient({ region: 'us-east-1' })
