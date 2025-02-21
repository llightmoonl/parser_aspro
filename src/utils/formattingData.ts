export class FormattingData {
  static telephone(initialTelephone: string): string {
    const formatTelephone = ((/(?:\+|\d)[\d\-\(\) ]{9,}\d/g).exec(initialTelephone));

    return formatTelephone ? formatTelephone[0] : initialTelephone;
  }

  static email(initialEmail: string): string {
    const formatEmail = ((/([A-Za-z0-9._-]+@[a-z0-9.-]+)/i).exec(initialEmail));

    return formatEmail ? formatEmail[0] : initialEmail;
  }
}
