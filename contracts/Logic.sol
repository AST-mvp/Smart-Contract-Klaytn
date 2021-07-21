// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "@klaytn/contracts/token/KIP17/KIP17.sol";

contract Logic is KIP17 {
    
    struct ProductInfo {
    uint256 nfcId;
    bytes32 brandId;
    bytes32 productId;
    bytes32 editionId;
    bytes32 manufactureDate;
    bool isLimited;
    bool isAppeared;
    uint256 ownerId;
    }

    ProductInfo[] products;
    address public owner;

    constructor() public {
        owner  = msg.sender;
    }   

    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    function registerProductInfo(
        uint256 nfcId,
        bytes32 brandId,
        bytes32 productId,
        bytes32 editionId,
        bytes32 manufactureDate,
        bool isLimited,
        bool isAppeared,
        uint256 ownerId
    ) public isOwner() {
        uint256 tokenId = products.length;
        products.push(
            ProductInfo(nfcId, brandId, productId, editionId, manufactureDate, isLimited, isAppeared, ownerId)
        );
        _mint(msg.sender, tokenId);
    }

    function allProductInfo() public view returns(ProductInfo[] memory) {
        return products;
    }

    function changeOwnership(
        uint256 _number,
        uint256 new_ownerId
    ) public isOwner() {
        products[_number].ownerId = new_ownerId;
    }

}