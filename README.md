# Samoyed
Project นี้เป็นการจำลอง Web-Based DApp สำหรับการเลือกซื้อน้องหมาพันธุ์ซามอยด์(Samoyed) 
สำหรับโปรเจคนี้ Smart Contract ถูกสร้างขึ้นภายใต้ชื่อ File Babeshop.sol เขียนด้วยภาษา Solidity
โดยมี Address = 6 Address สำหรับ SamoyedID


## กำหนดค่าสิ่งแวดล้อม
สร้าง Directory สำหรับบันทึก Projectนี้ และ ใช้คำสั่งต่อไปนี้เพื่อสร้างและย้ายเข้าไปยัง Moss Directory
```
mkdir Moss
cd Moss
```

ดาวน์โหลดโครงสร้างของโปรเจ็ค pet-shop ซึ่งมีอยู่ใน Truffle Framework โดยใช้คำสั่งต่อไปนี้
```
truffle unbox pet-shop
```


### 1. Create Smart Contract
ใช้ Visual Studio Code เพื่อสร้างไฟล์ชื่อ Name.sol ในไดเร็กทอรี contracts โดยมีโค้ดดังนี้
```
pragma solidity ^0.5.0;

contract BabeShop {
    address[6] public adopters;

    function adopt(uint SamoyedId) public returns (uint) {
        require(SamoyedId >= 0 && SamoyedId <=5);
        adopters[SamoyedId] = msg.sender;
        return SamoyedId;
    }

    function getAdopters() public view returns (address[6] memory) {
        return adopters;
    }
}
```

### 2. Compile และ Migrate
ทำการ Compile Smart Contracts โดยใช้คำสั่ง
```
truffle compile
```


ใช้ Visual Studio Code ในการสร้างไฟล์ 2_deploy_contracts.js ในไดเร็กทอรี migrations ดังนี้
```
var BabeShop = artifacts.require("BabeShop");

module.exports = function(deployer) {
  deployer.deploy(BabeShop);
};
```
เปิดโปรแกรม Ganache โดยการใช้เมาส์ดับเบิลคลิกที่ชื่อไฟล์ จากนั้น Click ที่ Workspace ที่ต้องการใช้งาน
จากนั้นทำการ Migrate โดยใช้คำสั่ง 
```
truffle migrate
```

#### 3.1 แก้ไข image
ให้นำไฟล์ภาพที่ต้องการแสดงผลไปไว้ใน Directory image

#### 3.2 แก้ไข pets.json
ทำการ เปลี่ยนชื่อจาก pets.json ให้เป็น Samoyeds.json และ แก้ไขโค๊ดให้เป็นดังต่อไปนี้
```
[
  {
    "id": 0,
    "name": "Frieda",
    "picture": "images/Dog1.jpeg",
    "age": 3,
    "gender": "Male",
    "location": "Lisco, Alabama"
  },
  {
    "id": 1,
    "name": "Gina",
    "picture": "images/Dog2.jpeg",
    "age": 3,
    "gender": "Male",
    "location": "Tooleville, West Virginia"
  },
  {
    "id": 2,
    "name": "Collins",
    "picture": "images/Dog3.jpeg",
    "age": 2,
    "gender": "Female",
    "location": "Freeburn, Idaho"
  },
  {
    "id": 3,
    "name": "Melissa",
    "picture": "images/Dog4.jpeg",
    "age": 2,
    "gender": "Male",
    "location": "Camas, Pennsylvania"
  },
  {
    "id": 4,
    "name": "Jeanine",
    "picture": "images/Dog5.jpeg",
    "age": 2,
    "gender": "Female",
    "location": "Gerber, South Dakota"
  },
  {
    "id": 5,
    "name": "Elvia",
    "picture": "images/Dog6.jpeg",
    "age": 3,
    "gender": "Male",
    "location": "Innsbrook, Illinois"
  }
  
]

```
#### 3.3 แก้ไข app.js
ทำการแก้ไขตัวแปรต่างๆ สำหรับ Back-end

```
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
```

### 3. แก้ไข Front-end 
ทำการแก้ไขในส่วนของ UI ให้มีการแสดงผลตามต้องการ

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Love DoG </title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-sm-8 col-sm-push-2">
          <h1 class="text-center">BaBe Samoyed Shop</h1>
          <hr/>
          <br/>
        </div>
      </div>

      <div id="SamoyedsRow" class="row">
        <!-- SamoyedS LOAD HERE -->
      </div>
    </div>
    <style>
      body {
        background-image: url('https://ae01.alicdn.com/kf/HTB11EelIVXXXXayaXXXq6xXFXXXX/10x10ft-Vinyl-Garden-Background-Colorful-Flowers-Sky-Fashion-Background-Photographic-For-Outdoors-Wedding-Photo-3x3m-S.jpg_Q90.jpg_.webp');
        background-repeat: no-repeat;
        background-attachment: fixed; 
        background-size: 100% 100%;
      }
      </style>
    <div id="SamoyedTemplate" style="display: none;">
      <div class="col-sm-6 col-md-4 col-lg-4">
        <div class="panel panel-default panel-Samoyed">
          <div class="panel-heading">
            <h3 class="panel-title">Scrappy</h3>
          </div>
          <div class="panel-body">
            <img alt="140x140" data-src="holder.js/140x140" class="img-rounded img-center" style="width: 100%;" src="https://animalso.com/wp-content/uploads/2017/01/Golden-Retriever_6.jpg" data-holder-rendered="true">
            <br/><br/>
            <strong>Gender</strong>: <span class="Samoyed-gender">Golden Retriever</span><br/>
            <strong>Age</strong>: <span class="Samoyed-age">3</span><br/>
            <strong>Location</strong>: <span class="Samoyed-location">Warren, MI</span><br/><br/>
            <button class="btn btn-default btn-adopt" type="button" data-id="0">Book</button>
          </div>
        </div>
      </div>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/web3.min.js"></script>
    <script src="js/truffle-contract.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>

```

### 4.ทำการสั่ง Run

```
npm run dev
```
Firefox จะถูกเรียกที่ http://localhost:3000 เพื่อแสดงผลลัพธ์  
![1](https://user-images.githubusercontent.com/77539213/104816220-3da64e00-584c-11eb-9b20-12dcc30ad0a9.png)
เมื่อกด Book ระบบจะเชื่อมต่อไปยัง Wallet  

![Booked](https://user-images.githubusercontent.com/77539213/104816223-4008a800-584c-11eb-8406-771b5fa5a425.png)
เมื่อยืนยันการทำธุรกรรม หรือ การจอง ปุ่มจะเปลียนสถานะเป็น Booked  

และด้านล่างจะเป็นภาพตัวอย่าง Transaction ที่เกิดขึ้นบน Wallet
![Front](https://user-images.githubusercontent.com/77539213/104816224-40a13e80-584c-11eb-9424-8c19d8304ff4.png)
![TR1](https://user-images.githubusercontent.com/77539213/104816225-4139d500-584c-11eb-8f9c-b50f9039722e.png)
![TR2](https://user-images.githubusercontent.com/77539213/104816226-4139d500-584c-11eb-88d8-99552dcbdab4.png)
