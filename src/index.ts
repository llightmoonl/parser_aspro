import puppeteer from 'puppeteer';
import fs from 'fs';
import {stringify} from 'csv';

(async () => {
  let time = performance.now();
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(
    "https://aspro.ru/poweredbyaspro/",
    {waitUntil: "domcontentloaded"}
  );

  const sectionsLinks: Array<string | null> = await page.$$eval('a.sections-list__item-link', links => {
    return links.map(link => link.href);
  })

  const urlSection: Array<string | null | any> = [];

  const newPage = await browser.newPage();
  await newPage.setRequestInterception(true);
  await newPage.setJavaScriptEnabled(false);

  newPage.on('request', req => {
    if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  })

  for (let link of sectionsLinks) {
    if (!link) {
      return null;
    }
    await newPage.goto(link, {waitUntil: "domcontentloaded"});
    const pageNumber: number = Number(await newPage.$eval('a.module-pagination__item:last-of-type', link => link.textContent));

    for (let i = 1; i < pageNumber; i++) {
      if (!(i === 1)) {
        await newPage.goto(`${link}/?PAGEN_1=${i}`, {waitUntil: "domcontentloaded"});
      }

      const urls = await newPage.$$eval('a.catalog-list__item-site-link', links => {
        return links.map(link => `https://${link.textContent?.trim()}`)
      })
      urlSection.push(...urls);
    }
  }
  await newPage.close();

  const filename = "data.csv";

  const columns = ['url', 'telephone', 'mail'];
  const writableStream = fs.createWriteStream(filename);

  const stringfier = stringify({header: true, columns});

  for (let url of urlSection) {
    const newPage = await browser.newPage();
    let telephone: string | null = "";
    let mail: string | null = "";

    if (!url) {
      await newPage.close();
    }

    const task = newPage.goto(url, {waitUntil: "domcontentloaded"});
    const wait = new Promise(r => setTimeout(r, 3000));

    try {
      await Promise.race([task, wait]);
    } catch (err) {
      await newPage.close();
      continue;
    }

    try {
      telephone = await newPage.$eval('a[href^="tel:"]', tel => tel.textContent);
    } catch (error) {
      console.log(error)
    }

    try {
      mail = await newPage.$eval('a[href^="mailto:"]', mail => mail.textContent);
    } catch (error) {
      console.log(error);
    }

    stringfier.write([url, telephone, mail]);
    await newPage.close();
  }

  stringfier.pipe(writableStream);
  await browser.close();
})();



