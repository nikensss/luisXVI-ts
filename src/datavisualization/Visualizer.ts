import fs from 'fs';
import path from 'path';
import PeriodAggregations from '../analytics/PeriodAggregations';
import nunjucks, { Environment } from 'nunjucks';
import ora, { Ora } from 'ora';
import TableBuilder from './TableBuilder';

/**
 * The Visualizer helps visualizing all the data in neat HTML tables.
 * It should also be able to generate a PDF out of the HTML output.
 */
class Visualizer {
  private njk: Environment;
  constructor() {
    this.njk = nunjucks.configure(path.join(__dirname, 'views'), { autoescape: false });
  }

  exportToHtml(periods: PeriodAggregations[]) {
    // const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();
    this.log('exporting to html');
    const tableBody = new TableBuilder(periods);
    const table = `<table class="rounded m-3 bg-white">\n${tableBody.build('Metrics')}</table>`;
    const html = this.njk.render('report.njk', { table });

    fs.writeFileSync(path.join(__dirname, 'reports', 'report.html'), html);
    this.log('successfuly exported the HTML');
    // spinner.succeed('Successfully exported to HTML!');
  }

  //Private implementations

  log(msg: string): void {
    console.log(`[Feynmann] ${msg}`);
  }
}

export default Visualizer;
