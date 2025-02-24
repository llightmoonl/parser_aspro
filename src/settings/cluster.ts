import {Cluster} from "puppeteer-cluster";
import {ClusterSettings} from "../types";

export const clusterSettings: ClusterSettings = {
  concurrency: Cluster.CONCURRENCY_PAGE,
  maxConcurrency: 6,
  monitor: true,
  puppeteerOptions: {
    headless: false,
    args: ['--no-sandbox'],
  },
};
