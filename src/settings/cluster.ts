import {Cluster} from "puppeteer-cluster";
import {ClusterOptions} from "../types";

export const cluster: ClusterOptions = {
  concurrency: Cluster.CONCURRENCY_PAGE,
  maxConcurrency: 6,
  monitor: true,
  puppeteerOptions: {
    headless: false,
    args: ['--no-sandbox'],
  },
};
