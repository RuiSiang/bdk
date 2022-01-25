import { Argv } from 'yargs'
import prompts from 'prompts'
import { onCancel, ParamsError } from '../../util'
import Ca from '../../service/caService'
import { CaReenrollType } from '../../model/type/caService.type'
import config from '../../config'

export const command = 'reenroll'

export const desc = 'Reenroll certifications.'
interface CaReenrollParams extends CaReenrollType {
  interactive: boolean
}

export const builder = (yargs: Argv) => {
  return yargs
    .example('bdk ca reenroll --interactive', 'Cathay BDK 互動式問答')
    .example('bdk ca reenroll -t client -u rca --client-id admin --role rca --org-hostname rca', '重新登入名稱為 rca 的 CA 機器')
    .option('interactive', { alias: 'i', describe: '是否使用 Cathay BDK 互動式問答', type: 'boolean' })
    .option('type', { alias: 't', describe: 'enrollment type - required', type: 'string', default: 'client' })
    .option('upstream', { alias: 'u', describe: 'enrollment upstream host - required', type: 'string' })
    .option('client-id', { describe: 'client id to enroll with - required', type: 'string' })
    .option('role', { alias: 'r', describe: 'ca type rca, peer org or orderer org - required', type: 'string', default: 'rca' })
    .option('org-hostname', { alias: 'h', describe: 'enroll org hostname - required', type: 'string' })
}

const checkRequired = (argv: CaReenrollParams) => {
  if (
    !(
      !!argv.type &&
      !!argv.upstream &&
      !!argv.clientId &&
      !!argv.role &&
      !!argv.orgHostname
    )
  ) {
    throw new ParamsError('Invalid params: Required parameter missing')
  }
}

export const handler = async (argv: CaReenrollParams) => {
  const ca = new Ca(config)

  if (argv.interactive) {
    const args = await prompts(
      [
        {
          type: 'select',
          name: 'type',
          message: 'Please specify enrollment type',
          choices: [
            {
              title: 'enroll ca client and org credentials',
              value: 'client',
            },
            {
              title: 'enroll orderer credentials',
              value: 'orderer',
            },
            {
              title: 'enroll peer certificates',
              value: 'peer',
            },
            {
              title: 'enroll org admin/user credentials',
              value: 'user',
            },
          ],
          initial: 0,
        },
        {
          type: 'text',
          name: 'upstream',
          message: 'Please specify upstream server hostname',
        },
        {
          type: 'text',
          name: 'clientId',
          message: 'Please specify client id to enroll',
        },
        {
          type: 'select',
          name: 'role',
          message: 'Please specify org type',
          choices: [
            {
              title: 'this is a rca',
              value: 'rca',
            },
            {
              title: 'this is an orderer org',
              value: 'orderer',
            },
            {
              title: 'this is peer org',
              value: 'peer',
            },
          ],
          initial: 0,
        },
        {
          type: 'text',
          name: 'orgHostname',
          message:
            'Please specify the enroll org hostname',
        },
        // {
        //   type: 'text',
        //   name: 'tlsCertfile',
        //   message:
        //     'Please specify the path to the tls certfile of the upstream server',
        // },
      ],
      { onCancel },
    )

    await ca.reenroll(args)
  } else {
    checkRequired(argv)
    await ca.reenroll(argv)
  }
}
