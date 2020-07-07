import Metric from '../../src/analytics/enums/Metric';
import Aggregation from '../../src/analytics/Aggregation';
import { expect } from 'chai';

describe('Aggregation tests', () => {
  it('should create from Metric with default value 0', () => {
    const agg = new Aggregation(Metric.LIKES);
    expect(agg.value).to.be.equal(0);
  });

  it('should create from Metric and given value 123', () => {
    const agg = new Aggregation(Metric.LIKES, 123);
    expect(agg.value).to.be.equal(123);
  });

  it('should not accept negative values at construction time', () => {
    expect(() => new Aggregation(Metric.LIKES, -1)).to.throw('Invalid value');
  });

  it('should get metric Metric.LIKES', () => {
    const agg = new Aggregation(Metric.LIKES);
    expect(agg.name).to.be.equal(Metric.LIKES);
  });

  it('should add up to 246', () => {
    const agg = new Aggregation(Metric.LIKES, 123);
    agg.add(123);
    expect(agg.value).to.be.equal(246);
  });

  it('should not accept negative added value', () => {
    const agg = new Aggregation(Metric.LIKES);
    expect(() => agg.add(-1)).to.throw('n must be 0 or positive');
  });
});
