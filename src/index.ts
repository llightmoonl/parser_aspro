import puppeteer from 'puppeteer';
import {FormattingData, CsvHandler} from './utils';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  const resourcesLimited: Array<string> = ['stylesheet', 'font', 'image'];

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

  const sectionsLinks: Array<string | null> = await page.$$eval('a.sections-list__item-link', links => {
    return links.map(link => link.href);
  })

  const urlSection: Array<string | null | any> = [];

  for (let link of sectionsLinks) {
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
  }

  const contacts = [];
  const csvHandler = new CsvHandler("data.csv", ['URL-сайта', 'Решение аспро', 'Email', 'Телефон']);

  for (let section of urlSection) {
    let telephone: string | null = "";
    let mail: string | null = "";

    if (!section.url) {
      return null;
    }

    const task = page.goto(section.url, {waitUntil: "domcontentloaded"});
    const wait = new Promise(r => setTimeout(r, 3000));

    try {
      await Promise.race([task, wait]);
    } catch (err) {
      continue;
    }

    try {
      telephone = await page.$eval('a[href^="tel:"]', tel => tel.textContent);
    } catch (error) {
      console.log(error)
    }

    try {
      mail = await page.$eval('a[href^="mailto:"]', mail => mail.textContent);
    } catch (error) {
      console.log(error);
    }

    contacts.push([
      section.url,
      section.solution,
      FormattingData.email(mail as string),
      FormattingData.telephone(telephone as string)]
    );
  }
  csvHandler.recordFile(contacts);

  await page.close();
  await browser.close();
})();