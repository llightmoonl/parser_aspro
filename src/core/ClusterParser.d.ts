import type { PuppeteerNodeLaunchOptions } from 'puppeteer';

export interface ClusterOptions {
  concurrency: number,
  maxConcurrency: number,
  monitor: boolean,
  puppeteerOptions: PuppeteerNodeLaunchOptions,
}

export {};