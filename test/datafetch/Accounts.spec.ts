import Account from '../../src/datafetch/Account';
import { expect } from 'chai';

describe('Account', () => {
  it('Accounts constructor succeeds', () => {
    const account = new Account('MrPiglover');

    expect(account).to.not.be.undefined;
  });

  it('gets the proper name', () => {
    const account = new Account('MrPiglover');
    expect(account.name).to.equal('MrPiglover');
  });

  it('gets the proper link', () => {
    const account = new Account('MrPiglover');
    expect(account.link).to.equal(
      'https://analytics.twitter.com/user/MrPiglover'
    );
  });
});
