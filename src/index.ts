#!/usr/bin/env node

import { loader } from '@common/downloadbar';
import { getVersion, pullImage, getContainer, isRunning } from '@core/localstack';
import { IMAGE_NAME, PREFIX } from '@core/constants';
import Stream from 'stream';

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
 *
 * TODO: move to cli.ts
 */
const main = async (): Promise<void> => {
  console.log(`Running ${IMAGE_NAME} with Docker (${await getVersion})`);

  await pullImage();
  let container = await getContainer();

  const stream = await container.attach({
    stream: true, stdout: true, stderr: true
  });

  if (await isRunning(container)) {
    process.stdout.write(`${PREFIX} Container already started, stopping`);
    await loader(container.stop());
    console.log();

    process.stdout.write(`${PREFIX} Removing container`);
    await loader(container.remove());
    console.log();

    container = await getContainer();
  }

  console.log(`${PREFIX} Starting container`);
  await container.start();

  await new Promise((resolve) => {
    const monitor = new Stream.Writable();
    monitor.write = (data): boolean => {
      const str = data.toString('utf8').trim();
      // console.log('data', str)
      if (str.includes('Starting mock')) {
        str.split('...')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('Starting mock'))
          .forEach((line) => console.log(`${PREFIX} ${line.trim()}...`));
      } else if (str.startsWith('Ready.')) {
        monitor.end();
      }
      return false; // Wait for drain event
    };

    console.log(`${PREFIX} Waiting for all LocalStack services to be ready`);
    stream.pipe(monitor);

    monitor.on('finish', () => {
      console.log('All ready!');
      resolve(); // Exit
    });
  });

};

main().then(() => process.exit(0)).catch((error) => console.error(error));

export default {}; // Library
