import fs from 'fs';
import path from 'path';
import PeriodAggregations from '../analytics/PeriodAggregations';
import nunjucks, { Environment } from 'nunjucks';
import ora, { Ora } from 'ora';
import TableBuilder from './TableBuilder';

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
    const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();
    const tableBody = TableBuilder.fromPeriodsAggregations(periods);
    const table = `<table class="rounded m-3 bg-white">\n${tableBody.build('Metrics')}</table>`;
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
