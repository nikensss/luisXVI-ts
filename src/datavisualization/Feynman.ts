import fs from 'fs';
import path from 'path';
import PeriodAggregations from '../analytics/PeriodAggregations';
import nunjucks, { Environment } from 'nunjucks';
import ora, { Ora } from 'ora';

/**
 * Mr Richard Feynman helps visualizing all the data in neat HTML tables.
 * It should also be able to generate a PDF out of the HTML output.
 */
class Feynman {
  private njk: Environment;
  constructor() {
    this.njk = nunjucks.configure(path.join(__dirname, 'views'), { autoescape: false });
  }

  exportToHtml(periods: PeriodAggregations[]) {
    const test: any[] = periods.map((p) => p.periodTree());
    // console.log(JSON.stringify(test, null, 2));
    let r = `<tr><td rowspan=${3}>Metrics</td>`;
    r += test[0][0] + test[1][0] + test[2][0] + '</tr>\n';
    r += '<tr>' + test[0][1][0][0] + test[1][1][0][0] + test[1][1][1][0] + test[2][1][0][0] + '</tr>\n';
    r +=
      '<tr>' +
      test[0][1][0][1].join('') +
      test[1][1][0][1].join('') +
      test[1][1][1][1].join('') +
      test[2][1][0][1].join('') +
      '</tr>\n';
    const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();
    const tableBody = periods.map((p) => p.toHtmlTableData()).join('\n');
    const table = `<table class="rounded m-3 bg-white outer-table">\n${r}</table>`;
    const html = this.njk.render('report.njk', { table });

    fs.writeFileSync(path.join(__dirname, 'reports', 'report.html'), html);
    spinner.succeed('Successfully exported to HTML!');
  }

  //Private implementations

  log(msg: string): void {
    console.log(`[Feynmann] ${msg}`);
  }
}

export default Feynman;
