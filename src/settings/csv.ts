interface CsvSettings {
  filename: string,
  columns: Array<string>
}

export const csvSettings: CsvSettings = {
  filename: 'data.csv',
  columns: ['URL-сайта', 'Решение аспро', 'Email', 'Телефон']
}