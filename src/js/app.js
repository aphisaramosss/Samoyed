App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load Samoyeds.
    $.getJSON('../Samoyeds.json', function(data) {
      var SamoyedsRow = $('#SamoyedsRow');
      var SamoyedTemplate = $('#SamoyedTemplate');

      for (i = 0; i < data.length; i ++) {
        SamoyedTemplate.find('.panel-title').text(data[i].name);
        SamoyedTemplate.find('img').attr('src', data[i].picture);
        SamoyedTemplate.find('.Samoyed-gender').text(data[i].gender);
        SamoyedTemplate.find('.Samoyed-age').text(data[i].age);
        SamoyedTemplate.find('.Samoyed-location').text(data[i].location);
        SamoyedTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        SamoyedsRow.append(SamoyedTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BabeShop.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BabeShopArtifact = data;
      App.contracts.BabeShop = TruffleContract(BabeShopArtifact);

      // Set the provider for our contract
      App.contracts.BabeShop.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted Samoyeds
      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var BabeShopInstance;

    App.contracts.BabeShop.deployed().then(function (instance) {
      BabeShopInstance = instance;

      return BabeShopInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-Samoyed').eq(i).find('button').text('Booked').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var SamoyedId = parseInt($(event.target).data('id'));

    var BabeShopInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BabeShop.deployed().then(function (instance) {
        BabeShopInstance = instance;

        // Execute adopt as a transaction by sending account
        return BabeShopInstance.adopt(SamoyedId, { from: account });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});