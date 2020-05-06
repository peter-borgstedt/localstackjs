import readline from 'readline';

export const renderDownloadProgress = (current = 0, total = 0): void => {
  const currentMB = (current / 1000000).toFixed(3);
  const totalMB = (total / 1000000).toFixed(3);

  const procentage = current / total;
  const progressAmount = Math.floor(50 * procentage || 0);
  const progress = new Array(progressAmount).join('=').padEnd(50, ' ');
  const amount = `${currentMB} / ${totalMB}MB`;

  const bar = `Downloading: [${progress}] ${amount}`;

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(bar);

  if (procentage === 1) {
    process.stdout.write('\n');
  }
};

export const loader = async <T>(promise: Promise<T>): Promise<T> => {
  const interval = setInterval(() => process.stdout.write('.'), 1000);
  const result = await promise;
  clearInterval(interval);
  return result;
};