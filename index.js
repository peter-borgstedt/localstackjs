#!/usr/bin/env node

/* eslint-disable
 no-param-reassign,
 no-console,
 no-unused-vars,
 no-async-promise-executor
*/

/**
 * A script that manage the pull and start of localstack with Docker.
 *
 * Using Docker to manage localstack instead of installing
 * their own client that anyway uses Docker.
 *
 * Mainly purpose is when doing integration tests or when
 * using serverless offline (in later case remember to
 * change endpoint ports in configuration for each service)
 *
 * For usage with serverless when developing locally
 * recommended way would using their serverless plugin:
 * https://github.com/localstack/serverless-localstack
 *
 * Example usage:
 * > node localstack.js -s s3,dynamdb,... -r eu-north-1
 * > jest
 */

const PORTS = {
  apigateway: 4567,
  kinesis: 4568,
  dynamodb: 4569,
  dynamodbstreams: 4570,
  s3: 4572,
  firehose: 4573,
  lambda: 4574,
  sns: 4575,
  sqs: 4576,
  redshift: 4577,
  es: 4578,
  ses: 4579,
  route53: 4580,
  cloudformation: 4581,
  cloudwatch: 4582,
  ssm: 4566, // depricated: 4583
  secretsmanager: 4584,
  stepfunctions: 4585,
  logs: 4586, // CloudWatch Logs
  events: 4587, // EventBridge (CloudWatch Events)
  sts: 4592,
  iam: 4593,
  ec2: 4597,
  kms: 4599
}
const readline = require('readline')
const Docker = require('dockerode')
const Stream = require('stream')
const docker = new Docker()

const PREFIX = ' \u2022'
const CONTAINER_NAME = 'localstack'
const IMAGE = 'localstack/localstack:latest'

const progressbar = new function () {
  this.draw = (current = 0, total = 0) => {
    const currentMB = (current / 1000000).toFixed(3)
    const totalMB = (total / 1000000).toFixed(3)

    const procentage = current / total
    const progressAmount = Math.floor(50 * procentage || 0)
    const progress = new Array(progressAmount).join('=').padEnd(50, ' ')
    const amount = `${currentMB} / ${totalMB}MB`

    const bar = `Downloading: [${progress}] ${amount}`

    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(bar)
    if (procentage === 1) {
      process.stdout.write('\n')
    }
  }
}()

const pullImage = () => new Promise(async (resolve, reject) => {
  const stream = await docker.pull(IMAGE, {})

  const finish = (error, _output) => {
    return error ? reject(error) : resolve()
  }

  let progress = undefined
  if (!process.stdin.isTTY) {
    console.log(`${PREFIX} Downloading image...`)
  } else {
    progress = (event) => {
      if (event.progressDetail) {
        const { current, total } = event.progressDetail
        if (current && total) {
          progressbar.draw(current, total)
        }
      } else if (event.status && event.id) {
        console.log(`${PREFIX} ${event.status} (${event.id})`)
      } else if (event.status) {
        console.log(` - ${event.status}`)
      }
    }
  }

  docker.modem.followProgress(stream, finish, progress)
})

const createContainer = () => {
  console.log(`${PREFIX} Creating container`);
  const args = process.argv.slice(2);

  const servicesIndex = args.findIndex((v) => v.toLowerCase() === '-s');
  const regionIndex = args.findIndex((v) => v.toLowerCase() === '-r');

  const servicesArg = ~servicesIndex ? args[servicesIndex + 1] : null;
  const regionArg = (~regionIndex ? args[regionIndex + 1] : 'eu-west-1');

  const services = servicesArg ? servicesArg.split(',').map((s) => s.trim().toLowerCase()) : Object.keys(PORTS);
  const region = regionArg.trim().toLowerCase();

  console.log(' - Using services:')
  services.forEach((service) => console.log(`   \u2027 ${service} (${PORTS[service]})`))

  const options = {
    Image: IMAGE,
    Tty: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    name: CONTAINER_NAME,
    Env: [
      `SERVICES=${servicesArg ? services : ''}`,
      `DEFAULT_REGION=${region}`,
      `AWS_REGION=${region}`,
      `AWS_DEFAULT_REGION=${region}`,
      'LOCALSTACK_HOSTNAME=localhost',
      'DOCKER_HOST=unix:///var/run/docker.sock'
    ],
    Hostname: 'localhost',
    HostConfig: {
      PortBindings: services
        .map((service) => PORTS[service])
        .reduce((acc, port) => {
          acc[`${port}/tcp`] = [{ HostIp: '', HostPort: `${port}` }]
          return acc
        }, {})
    }
  }
  return docker.createContainer(options)
}

const exists = async (container) => {
  try {
    await container.inspect()
    return true
  } catch (error) {
    return false
  }
}

const getContainer = async () => {
  const container = await docker.getContainer(CONTAINER_NAME)

  if (await exists(container)) {
    console.log(`${PREFIX} Found existing container`)
    return container
  }
  return createContainer()
}

const getState = async (container) => {
  return (await container.inspect({})).State.Status.toUpperCase()
}

const isRunning = async (container) => {
  return await getState(container) === 'RUNNING'
}

const loader = async (promise) => {
  const interval = setInterval(() => process.stdout.write('.'), 1000)
  const result = await promise
  clearInterval(interval)
  return result
}

const main = async () => {
  const { Version: version } = await docker.version()
  console.log(`Running ${IMAGE} with Docker (${version})`)

  await pullImage()
  let container = await getContainer()

  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true
  })

  if (await isRunning(container)) {
    process.stdout.write(`${PREFIX} Container already started, stopping`)
    await loader(container.stop())
    console.log()

    process.stdout.write(`${PREFIX} Removing container`)
    await loader(container.remove())
    console.log()
    container = await getContainer()
  }

  console.log(`${PREFIX} Starting container`)
  await container.start()

  await new Promise((resolve) => {
    const hijack = new Stream.Writable()
    hijack.write = (data) => {
      const str = data.toString('utf8').trim()
      // console.log('data', str)
      if (str.includes('Starting mock')) {
        str.split('...')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('Starting mock'))
          .forEach((line) => console.log(`${PREFIX} ${line.trim()}...`))
      } else if (str.startsWith('Ready.')) {
        hijack.end();
      }
    }

    console.log(`${PREFIX} Waiting for all LocalStack services to be ready`)
    stream.pipe(hijack)

    hijack.on('finish', () => {
      console.log('All ready!')
      resolve() // Exit
    })
  })

}

main()
  .then(() => process.exit(0))
  .catch((error) => console.error(error))
