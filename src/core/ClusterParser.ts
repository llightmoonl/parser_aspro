import puppeteer from 'puppeteer';
import {Cluster} from 'puppeteer-cluster';
import type {ClusterOptions} from './ClusterParser.d';

export class ClusterParser {
  private cluster: Cluster<any, any>;
  private readonly clusterOptions: Partial<ClusterOptions>;

  public constructor(clusterOptions: ClusterOptions) {
    this.clusterOptions = clusterOptions;
  }

  public async init() {
    try {
      this.cluster = await Cluster.launch(this.clusterOptions);
    } catch (error) {
      console.error(error)
    }
  }
}