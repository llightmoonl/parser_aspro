import fs from 'fs';
import {stringify} from 'csv-stringify';

export class CsvHandler {
  protected filename: string;
  protected columns: Array<string>;

  constructor(filename: string, columns: Array<string>) {
    this.filename = filename;
    this.columns = columns;
  }

  public recordFile(data: Array<Array<string>>): void {
    const writableStream = fs.createWriteStream(this.filename);
    const stringfier = stringify(data, {header: true, columns: this.columns});

    stringfier.pipe(writableStream);
  }
}
