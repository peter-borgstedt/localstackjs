/* eslint-disable no-redeclare */

declare global {
  let __basedir: string;

  namespace NodeJS {
    interface ProcessEnv {
      bitbucketApi1Url: string;
      bitbucketApi2Url: string;
    }
  }
}

export {};
