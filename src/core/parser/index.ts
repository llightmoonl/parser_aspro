import {Cluster} from 'puppeteer-cluster';
import {Tasks} from './tasks';

import {clusterSettings, csvSettings} from "../../settings";
import {CsvHandler} from '../../utils';

export const parser = async () => {
  const cluster = await Cluster.launch(clusterSettings);
  const sectionsLinks: Array<string | undefined> = await cluster.execute(
    {
      selector: 'a.sections-list__item-link',
      url: 'https://aspro.ru/poweredbyaspro/'
    }, Tasks.getLinksToCategories
  );

  const externalLinks: Array<string | undefined> = [];
  const processedContacts: Array<Array<any>> = [];

  sectionsLinks.map(async section => await cluster.queue({section, externalLinks}, Tasks.getExternalLinks));
  await cluster.idle();

  externalLinks.map(async link => await cluster.queue({link, processedContacts}, Tasks.getProcessedContacts));
  await cluster.idle();
  await cluster.close();

  const csvHandler = new CsvHandler(csvSettings.filename, csvSettings.columns);
  csvHandler.recordFile(processedContacts);
};