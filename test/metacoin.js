const MetaCoin = artifacts.require("./MetaCoin.sol");
const ENSBuilder = require('ens-builder');
const ethers = require('ethers');
const Ganache = require('ganache-core');
const {providers} = ethers;
const {withENS, defaultGanacheOptions} = require('./utils');

contract('MetaCoin', function(accounts) {
  before(async () => {
    const web3Provider = Ganache.provider(defaultGanacheOptions);
    let provider = new providers.Web3Provider(web3Provider);
    userWallet = new ethers.Wallet('0x29f3edee0ad3abf8e2699402e0e28cd6492c9be7eaab00d732a791c33552f797', provider);
    deployWallet = new ethers.Wallet('0x5c8b9227cd5065c7e3f6b73826b8b42e198c4497f6688e3085d5ab3a6d520e74', provider);
    builder = new ENSBuilder(deployWallet);
  });

  it.only("should put 10000 MetaCoin in the first account", async function() 
  {
    // Fails here.
    let ensAddress = await builder.bootstrapWith('example', 'eth');
    assert.notEqual(ensAddress,0);
    // let providerWithEns = withENS(provider, ensAddress);
    // const address = providerWithEns.resolveName('example.eth');
    // const name = providerWithEns.lookupAddress('example.eth');
  });

  it("should put 10000 MetaCoin in the first account", function() {
    return MetaCoin.deployed().then(function(instance) {
      return instance.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
  it("should call a function that depends on a linked library", function() {
    var meta;
    var metaCoinBalance;
    var metaCoinEthBalance;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(accounts[0]);
    }).then(function(outCoinBalance) {
      metaCoinBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth) {
      metaCoinEthBalance = outCoinBalanceEth.toNumber();
    }).then(function() {
      assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
    });
  });
  it("should send coin correctly", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });
});
