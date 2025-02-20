import type {Page, PuppeteerNodeLaunchOptions} from 'puppeteer';

export {TaskFunction} from "puppeteer-cluster/dist/Cluster";

export interface ClusterOptions {
  concurrency: number,
  maxConcurrency: number,
  monitor: boolean,
  puppeteerOptions: PuppeteerNodeLaunchOptions,
}

export interface TaskFunctionArguments<T> {
  page: Page;
  data: T;
  worker: {
    id: number;
  };
}

