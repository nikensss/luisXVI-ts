import fs, { PathLike } from 'fs';
import path from 'path';
import PeriodAggregations from '../analytics/PeriodAggregations';
import nunjucks, { Environment } from 'nunjucks';
import TableBuilder from './TableBuilder';

/**
 * The Visualizer helps visualizing all the data in neat HTML tables.
 * It should also be able to generate a PDF out of the HTML output.
 */
class Visualizer {
  private njk: Environment;

  constructor() {
    this.njk = nunjucks.configure(path.join(__dirname, 'views'), {
      autoescape: false
    });
  }

  export(periods: PeriodAggregations[]) {
    const html = this.asHtml(periods);
    this.exportToPdf(html);
  }

  //Private implementations

  private exportToPdf(html: string): void {
    //const pdf = convertToPdf(html);

    //fs.writeFileSync(path.join(__dirname, 'reports', 'report.pdf'), pdf);
    this.log('successfuly exported the PDF');
  }
  /**
   * Convert this array of period aggregations to an HTML table. Gives nice
   * formatting and stuff.
   *
   * @param periods array of period aggregations to summarize
   */
  private asHtml(periods: PeriodAggregations[]) {
    // const spinner: Ora = ora({ text: 'exporting to HTML', prefixText: '[Feynmann]' }).start();
    this.log('exporting to html');
    const tableBody = new TableBuilder(periods);
    const table = `<table class="rounded m-3 bg-white">\n${tableBody.build(
      'Metrics'
    )}</table>`;
    return this.njk.render('report.njk', { table });
  }

  log(msg: string): void {
    console.log(`[Feynmann] ${msg}`);
  }
}

export default Visualizer;
