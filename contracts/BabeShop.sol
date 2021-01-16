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