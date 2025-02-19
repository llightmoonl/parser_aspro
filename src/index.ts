import puppeteer from 'puppeteer';
import {Cluster} from 'puppeteer-cluster';

import {FormattingData, CsvHandler} from './utils';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  const resourcesLimited: Array<string> = ['stylesheet', 'font', 'image', 'media', 'other'];

  page.on('request', req => {
    if (resourcesLimited.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  })

  await page.goto(
    "https://aspro.ru/poweredbyaspro/",
    {waitUntil: "domcontentloaded"}
  );

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 6,
    monitor: true,
    puppeteerOptions: {
      headless: true,
      args: ['--no-sandbox'],
    },
  })

  const sectionsLinks: Array<string | null> = await page.$$eval('a.sections-list__item-link', links => {
    return links.map(link => link.href);
  });


  await cluster.task(async ({page, data: link}) => {
    if (!link) {
      return null;
    }
    await page.goto(link, {waitUntil: "domcontentloaded"});
    const pageNumber: number = Number(await page.$eval('a.module-pagination__item:last-of-type', link => link.textContent));

    for (let i = 1; i < pageNumber; i++) {
      if (!(i === 1)) {
        await page.goto(`${link}/?PAGEN_1=${i}`, {waitUntil: "domcontentloaded"});
      }

      const sectionElement = await page.evaluate(() => {
        const productInfo = document.querySelectorAll('.catalog-list__item-info');

        return Array.from(productInfo).map((productInfoItem) => {
          const productInfoUrl = productInfoItem.querySelector('a.catalog-list__item-site-link');
          const productInfoSolution = productInfoItem.querySelector('span.catalog-list__item-prop-value > a');

          return {
            url: `https://${productInfoUrl?.textContent?.trim()}`,
            solution: productInfoSolution?.textContent,
          }
        })
      })
      urlSection.push(...sectionElement);
    }
  })

  const urlSection: Array<string | null | any> = [];

  for (let link of sectionsLinks) {
    await cluster.queue(link);
  }

  await cluster.idle();

  const contacts: Array<Array<string>> = [];
  const csvHandler = new CsvHandler("data.csv", ['URL-сайта', 'Решение аспро', 'Email', 'Телефон']);

  await cluster.task(async ({page, data: section}) => {
    let telephone: string | null = "";
    let mail: string | null = "";

    if (!section.url) {
      return null;
    }

    const task = page.goto(section.url, {waitUntil: "domcontentloaded"});
    const wait = new Promise(r => setTimeout(r, 3000));

    await Promise.race([task, wait]);

    try {
      telephone = await page.$eval('a[href^="tel:"]', tel => tel.href);
    } catch (error) {
      console.log(error)
    }

    try {
      mail = await page.$eval('a[href^="mailto:"]', mail => mail.href);
    } catch (error) {
      console.log(error);
    }

    contacts.push([
      section.url,
      section.solution,
      FormattingData.email(mail as string),
      FormattingData.telephone(telephone as string)]
    );
  })

  for (let section of urlSection) {
    await cluster.queue(section);
  }
  await page.close();
  await browser.close();

  await cluster.idle();
  await cluster.close();

  csvHandler.recordFile(contacts);
})();
