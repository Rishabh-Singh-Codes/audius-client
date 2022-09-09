import type { Environment } from '@audius/common'
import Config from 'react-native-config'

export const env = {
  EAGER_DISCOVERY_NODES: Config.EAGER_DISCOVERY_NODES,
  ENVIRONMENT: Config.ENVIRONMENT as Environment,
  EXPLORE_CONTENT_URL: Config.EXPLORE_CONTENT_URL,
  SUGGESTED_FOLLOW_HANDLES: Config.SUGGESTED_FOLLOW_HANDLES,
  AAO_ENDPOINT: Config.AAO_ENDPOINT,
  ORACLE_ETH_ADDRESSES: Config.ORACLE_ETH_ADDRESSES
}
