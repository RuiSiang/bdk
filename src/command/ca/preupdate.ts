import { Argv } from 'yargs'
import prompts from 'prompts'
import Ca from '../../service/caService'
import config from '../../config'
import { CaDownType } from '../../model/type/caService.type'

export const command = 'preupdate'

export const desc = 'Preupdate CA certificates and restart.'
interface CaDownParams extends CaDownType {
  interactive: boolean
}

export const builder = (yargs: Argv) => {
  return yargs
    .example('bdk ca preupdate --interactive', 'Cathay BDK 互動式問答')
    .example('bdk ca preupdate --ca-name ica', '關閉名稱為 ica 的 CA 機器')
    .option('interactive', { alias: 'i', describe: '是否使用 Cathay BDK 互動式問答', type: 'boolean' })
    .option('ca-name', { describe: 'Name of the CA server', type: 'string' })
}

export const handler = async (argv: CaDownParams) => {
  const ca = new Ca(config)
  if (argv.interactive) {
    const info = await prompts([
      {
        type: 'text',
        name: 'caName',
        message: 'What do you call this CA?',
      },
    ])
    await ca.preupdate({ caName: info.caName })
  } else {
    await ca.preupdate({ caName: argv.caName })
  }
}
