import puppeteer from 'puppeteer';
import {generate} from 'csv-generate';

(async () => {
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
  const contactsUrls = [];

  for (let link of sectionsLinks) {
    const newPage = await browser.newPage();

    if (link) {
      await newPage.goto(link, {waitUntil: "domcontentloaded"});

      const urls = await newPage.$$eval('a.catalog-list__item-site-link', links => {
        return links.map(link => `https://${link.textContent}`)
      })
      urlSection.push(...urls);

      await newPage.close();
    } else {
      await newPage.close();
      return;
    }
  }

  for (let url of urlSection) {
    const newPage = await browser.newPage();

    if (url) {
      let task = null;

      try {
        task = newPage.goto(url, {waitUntil: "domcontentloaded"});
      }
      catch (err) {
        await newPage.close();
        continue;
      }

      const wait = new Promise(r => setTimeout(r, 10000));

      try {
        await Promise.race([task, wait]);
      }
      catch (err) {
        await newPage.close();
        continue;
      }

      let telephone: string | null = "";
      let mail: string | null = "";

      try {
        telephone = await newPage.$eval('a[href^="tel:"]', tel => tel.textContent);
      }
      catch {
        telephone = "";
      }

      try {
        mail = await newPage.$eval('a[href^="mailto:"]', mail => mail.textContent);
      }
      catch {
        mail = "";
      }

      contactsUrls.push({url, telephone, mail});
      await newPage.close();
    } else {
      await newPage.close();
      return;
    }
  }
  await browser.close();
})();



