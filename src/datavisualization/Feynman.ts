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

    for (let metric of data) {
      let years = Object.keys(metric);
      for (let year of years) {
        tableData += `<tr>\n`;
        let months = Object.keys(metric[year]);
        tableData += `<td rowspan="${months.length}"> ${year} </td>\n`;
        for (let month of months) {
          tableData += `<td class='month'> ${month} </td>\n`;
          let result: number = <number>(<PeriodAggregation>metric[year])[month];
          tableData += `<td class='result'> ${result}</td>\n`;
          tableData += `</tr>\n`;
        }
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
