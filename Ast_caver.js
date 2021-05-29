const Caver = require('caver-js')
const ethers = require('ethers')
const toBytes32 = ethers.utils.formatBytes32String
const toString = ethers.utils.parseBytes32String
const caver = new Caver('https://api.baobab.klaytn.net:8651/')

const abi = [{"constant": true,"inputs": [],"name": "owner","outputs": [{"internalType": "address","name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"internalType": "uint256","name": "nfcId","type": "uint256"},{"internalType": "bytes32","name": "brandId","type": "bytes32"},{"internalType": "bytes32","name": "productId","type": "bytes32"},{"internalType": "bytes32","name": "editionId","type": "bytes32"},{"internalType": "bytes32","name": "manufactureDate","type": "bytes32"},{"internalType": "bool","name": "isLimited","type": "bool"},{"internalType": "bool","name": "isAppeared","type": "bool"},{"internalType": "uint256","name": "ownerId","type": "uint256"}],"name": "registerProductInfo","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "allProductInfo","outputs": [{"components": [{"internalType": "uint256","name": "nfcId","type": "uint256"},{"internalType": "bytes32","name": "brandId","type": "bytes32"},{"internalType": "bytes32","name": "productId","type": "bytes32"},{"internalType": "bytes32","name": "editionId","type": "bytes32"},{"internalType": "bytes32","name": "manufactureDate","type": "bytes32"},{"internalType": "bool","name": "isLimited","type": "bool"},{"internalType": "bool","name": "isAppeared","type": "bool"},{"internalType": "uint256","name": "ownerId","type": "uint256"}],"internalType": "struct Ast.ProductInfo[]","name": "","type": "tuple[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"internalType": "uint256","name": "_number","type": "uint256"},{"internalType": "uint256","name": "new_ownerId","type": "uint256"}],"name": "changeOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"}]
const Ast = new caver.contract(abi, "0x61D074c849140D53457A0f8b250CfAfF7361BADE")
const account = caver.wallet.keyring.create("0xdd6e0b6d3c71c0a43a6ea2cedf91e1e48e194ea6", "0x9bd8e94d3edc022a6d2b5d3e2fb6b55e1d300c72748dfb99db451cd885315373")
caver.wallet.add(account)

async function registerProductInfo(nfcID, brandID, productID, editionID, manufactureDate, limited, appeared, ownerID) {
    return allProductInfo().then(result => {
        for (var i = 0; i < result.length; i++) {
            if (result[i][0] == nfcID) {
                return false
            }
        }
        Ast.methods.registerProductInfo(nfcID, toBytes32(brandID), toBytes32(productID), toBytes32(editionID), toBytes32(manufactureDate), limited, appeared, ownerID).send({
            from: account.address,
            gas: 250000
        }).then(function(message) {
            console.log(message)
        })
        return true
    })
}

async function allProductInfo() {
    var result = await Ast.methods.allProductInfo().call()
    return result
}

async function changeOwnership(nfcID, new_ownerId) {
    return allProductInfo().then(result =>{
        for (var i = 0; i < result.length; i++) {
            if (result[i][0] == nfcID) {
                Ast.methods.changeOwnership(i, new_ownerId).send({
                    from: account.address,
                    gas: 250000
                }).then(function(message) {
                    console.log(message)
                })
                return true
            }
        }
        return false
    })
}

async function nfcIDcheck(nfcID) {
    return allProductInfo().then(result => {
        for (var i = 0; i < result.length; i++) {
            if (result[i][0] == nfcID) {
                return false
            }
        }
        return true
    })
}

// async function myProductCheck(nfcID, userID) {
//     return allProductInfo().then(result => {
//         for (var i = 0; i < result.length; i++) {
//             if (result[i][0] == nfcID){
//                 if (result[i][6])
//             }
//         }
//     })
// }

module.exports = {
    registerProductInfo: registerProductInfo,
    allProductInfo: allProductInfo,
    changeOwnership: changeOwnership,
    nfcIDcheck: nfcIDcheck,
    toString: toString
}

// -- Please don't erase it. --
// registerProductInfo(0911,2,3,4,"21-05-17",true,2345)
// allProductInfo().then(result =>  { console.log(result) } )
// changeOwnership(911, 911)
