// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Ast {
  struct ProductInfo {
    uint256 nfcId;
    uint256 brandId;
    uint256 productId;
    uint256 editionId;
    string manufactureDate;
    bool isLimited;
    uint256 ownerId;
  }

  ProductInfo[] products;
  address public owner = msg.sender;

  modifier onlyOwner() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  function registerProductInfo(
    uint256 nfcId,
    uint256 brandId,
    uint256 productId,
    uint256 editionId,
    string memory manufactureDate,
    bool isLimited,
    uint256 ownerId
  ) public onlyOwner() {
    products.push(
      ProductInfo(nfcId, brandId, productId, editionId, manufactureDate, isLimited, ownerId)
      );
  }

  function allProductInfo() public view returns(ProductInfo[] memory) {
    return products;
  }

  function changeOwnership(
    uint256 _number,
    uint256 new_ownerId
  ) public onlyOwner() {
    products[_number].ownerId = new_ownerId;
  }
}