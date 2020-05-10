import fs from 'fs';
import path from 'path';
import PeriodAggregation from '../analytics/interfaces/PeriodAggregation';
import nunjucks, { Environment } from 'nunjucks';
import ora, { Ora } from 'ora';

class Feynman {
  private njk: Environment;
  constructor() {
    this.njk = nunjucks.configure(path.join(__dirname, 'views'), { autoescape: false });
  }

  exportToHtml(data: PeriodAggregation[]) {
    const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();
    let tableData = '';

    let years = Object.keys(data[0]);
    for (let year of years) {
      tableData += `<tr>\n`;
      let months = Object.keys(data[0][year]);
      tableData += `<td rowspan="${months.length}" class="year"> ${year} </td>\n`;
      for (let month of months) {
        tableData += `<td class='month'> ${month} </td>\n`;
        tableData += data.reduce((t, c) => `${t}<td class='result'> ${(<PeriodAggregation>c[year])[month]}</td>\n`, '');
        tableData += `</tr>\n`;
      }
    }

    let html = this.njk.render('report.njk', { tableData: tableData });
    fs.writeFileSync(path.join(__dirname, 'reports', 'report.html'), html);
    spinner.succeed('Successfully exported to HTML!');
  }

  //Private implementations

  log(msg: string): void {
    console.log(`[Feynmann] ${msg}`);
  }
}

export default Feynman;
