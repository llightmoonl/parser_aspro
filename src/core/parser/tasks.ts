import type {TaskFunction, TaskFunctionArguments} from "../../types";
import {FormattingData} from "../../utils";

export class Tasks {
  public static getLinksToCategories: TaskFunction<any, any> = async ({page, data: {selector, url}}: TaskFunctionArguments<any>) => {
    await page.goto(url, {waitUntil: 'domcontentloaded'})

    return await page.$$eval(selector, sections => sections.map(section => (section as HTMLAnchorElement).href))
  }

  public static getExternalLinks: TaskFunction<any, any> = async ({page, data: {section, externalLinks}}: TaskFunctionArguments<any>) => {
    await page.goto(section, {waitUntil: "domcontentloaded"});
    const pageNumber: number = Number(await page.$eval('a.module-pagination__item:last-of-type', link => link.textContent));

    for (let i = 1; i < pageNumber; i++) {
      if (!(i === 1)) {
        await page.goto(`${section}/?PAGEN_1=${i}`, {waitUntil: "domcontentloaded"});
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
      externalLinks.push(...sectionElement);
    }
  }

  public static getProcessedContacts: TaskFunction<any, any> = async ({page, data: {link, processedContacts}}: TaskFunctionArguments<any>) => {
    let telephone: string | null = "";
    let mail: string | null = "";

    const task = page.goto(link.url, {waitUntil: "domcontentloaded"});
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

    processedContacts.push([
      link.url,
      link.solution,
      FormattingData.email(mail as string),
      FormattingData.telephone(telephone as string)
    ])
  }
}