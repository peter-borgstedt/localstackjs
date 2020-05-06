import Docker from 'dockerode';
import { renderDownloadProgress } from '@/common/progress';
import {
  CONTAINER_NAME,
  IMAGE_NAME,
  PORTS,
  PREFIX
} from '@core/constants';

const docker = new Docker();

export const getVersion = async (): Promise<string> => (await docker.version()).Version;

export const pullImage = (): Promise<void> => new Promise(async (resolve, reject) => {
  const stream = await docker.pull(IMAGE_NAME, {});

  const finish = (error /* , output */): void => {
    return error ? reject(error) : resolve();
  };

  let progress = undefined;
  if (!process.stdin.isTTY) {
    console.log(`${PREFIX} Downloading image...`);
  } else {
    progress = (event): void => {
      if (event.progressDetail) {
        const { current, total } = event.progressDetail;
        if (current && total) {
          renderDownloadProgress(current, total);
        }
      } else if (event.status && event.id) {
        console.log(`${PREFIX} ${event.status} (${event.id})`);
      } else if (event.status) {
        console.log(` - ${event.status}`);
      }
    };
  }

  docker.modem.followProgress(stream, finish, progress);
});

export const createContainer = (): Promise<Docker.Container> => {
  console.log(`${PREFIX} Creating container`);
  const args = process.argv.slice(2);

  const servicesIndex = args.findIndex((v) => v.toLowerCase() === '-s');
  const regionIndex = args.findIndex((v) => v.toLowerCase() === '-r');

  const servicesArg = ~servicesIndex ? args[servicesIndex + 1] : null;
  const regionArg = (~regionIndex ? args[regionIndex + 1] : 'eu-west-1');

  const services = servicesArg ? servicesArg.split(',').map((s) => s.trim().toLowerCase()) : Object.keys(PORTS);
  const region = regionArg.trim().toLowerCase();

  console.log(' - Using services:');
  services.forEach((service) => console.log(`   \u2027 ${service} (${PORTS[service]})`));

  const options = {
    Image: IMAGE_NAME,
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
          acc[`${port}/tcp`] = [{ HostIp: '', HostPort: `${port}` }];
          return acc;
        }, {})
    }
  };
  return docker.createContainer(options);
};

export const exists = async (container): Promise<boolean> => {
  try {
    await container.inspect();
    return true;
  } catch (error) {
    return false;
  }
};

export const getContainer = async (): Promise<Docker.Container> => {
  const container = docker.getContainer(CONTAINER_NAME);

  if (await exists(container)) {
    console.log(`${PREFIX} Found existing container`);
    return container;
  }
  return createContainer();
};

export const getState = async (container): Promise<string> => {
  return (await container.inspect({})).State.Status.toUpperCase();
};

export const isRunning = async (container): Promise<boolean> => {
  return await getState(container) === 'RUNNING';
};
