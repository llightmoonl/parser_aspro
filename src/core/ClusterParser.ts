import puppeteer from 'puppeteer';
import {Cluster} from 'puppeteer-cluster';
import {ClusterOptions} from './ClusterParser.d';

export class ClusterParser {
  private cluster;

  async constructor(clusterOptions: ClusterOptions) {
    this.cluster = await Cluster.launch(clusterOptions);
  }
}