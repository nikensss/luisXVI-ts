import fs from 'fs';
import path from 'path';
import PeriodAggregation from '../analytics/PeriodAggregation';
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

  exportToHtml(periods: PeriodAggregation[]) {
    const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();

    const tableBody = periods.map((p) => p.toHtmlTableData()).join('\n');
    const table = `<table class="rounded m-3 bg-white outer-table">\n${tableBody}</table>`;
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
