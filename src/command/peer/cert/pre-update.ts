import { Arguments, Argv } from 'yargs'
import { logger, ParamsError, onCancel } from '../../../util'
import Channel from '../../../service/channel'
import config from '../../../config'
import { OrgTypeEnum } from '../../..'
import prompts from 'prompts'
import { getOrdererList, joinedChannelChoice } from '../../../model/prompts/util'
import { ChannelCertPreUpdateType } from '../../../model/type/channel.type'

export const command = 'preupdate'

export const desc = 'Generate required PB diffs.'
interface OptType {
  interactive: boolean
  name: string
  orderer: string
  port: number
}

const ordererList = getOrdererList(config)

export const builder = (yargs: Argv<OptType>) => {
  return yargs
    .option('interactive', { type: 'boolean', description: '是否使用 Cathay BDK 互動式問答', alias: 'i' })
    .option('name', { type: 'string', description: '更新 Channel 的名稱', alias: 'n' })
    .option('orderer', { type: 'string', choices: ordererList, description: '使用 Orderer 的 Domain name 和 Port 號碼' })
    .option('adminName', { type: 'string', description: '更新用的 admin 名稱', alias: 'a' })
}

export const handler = async (argv: Arguments) => {
  const channel = new Channel(config)

  const channelName = await (async () => {
    if (argv.interactive) {
      return (await prompts([
        {
          type: 'select',
          name: 'channelName',
          message: 'What is your channel name?',
          choices: await joinedChannelChoice(channel),
        },
      ], { onCancel })).channelName
    } else if (argv.name) {
      return argv.name
    } else {
      throw new ParamsError('Invalid params: Duplicate parameters <name>')
    }
  })()

  const channelGroup = await channel.getChannelGroup(channelName)
  const orderer = await (async () => {
    if (argv.interactive) {
      return (await prompts([
        {
          type: 'select',
          name: 'orderer',
          message: 'Ordering service endpoint',
          choices: channelGroup.orderer.map(x => ({
            title: x,
            value: x,
          })),
        },
      ], { onCancel })).orderer
    } else if (argv.orderer) {
      return argv.orderer
    } else {
      throw new ParamsError('Invalid params: Duplicate parameters <orderer>')
    }
  })()

  const adminName = await (async () => {
    if (argv.interactive) {
      return (await prompts([
        {
          type: 'text',
          name: 'adminName',
          message: 'What is your channel admin\'s name?',
          initial: 'Admin@org.example.com',
        },
      ], { onCancel })).adminName
    } else if (argv.adminName) {
      return argv.adminName
    } else {
      throw new ParamsError('Invalid params: Duplicate parameters <adminName>')
    }
  })()
  

  const certPreUpdateInput: ChannelCertPreUpdateType = {
    channelName,
    orderer,
    adminName
  }

  await channel.channelCertPreUpdate(certPreUpdateInput)
}
