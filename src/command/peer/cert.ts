import { Argv } from 'yargs'

export const command = 'cert'

export const desc = '管理 Peer 的憑證'

export const builder = (yargs: Argv) => {
  return yargs.commandDir('cert').demandCommand()
}

export const handler = {}
