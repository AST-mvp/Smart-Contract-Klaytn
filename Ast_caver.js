const Caver = require('caver-js')
const caver = new Caver('https://api.baobab.klaytn.net:8651/')

const abi = [{"constant": true,"inputs": [],"name": "owner","outputs": [{"internalType": "address","name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"internalType": "uint256","name": "nfcId","type": "uint256"},{"internalType": "uint256","name": "brandId","type": "uint256"},{"internalType": "uint256","name": "productId","type": "uint256"},{"internalType": "uint256","name": "editionId","type": "uint256"},{"internalType": "string","name": "manufactureDate","type": "string"},{"internalType": "bool","name": "isLimited","type": "bool"},{"internalType": "uint256","name": "ownerId","type": "uint256"}],"name": "registerProductInfo","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "allProductInfo","outputs": [{"components": [{"internalType": "uint256","name": "nfcId","type": "uint256"},{"internalType": "uint256","name": "brandId","type": "uint256"},{"internalType": "uint256","name": "productId","type": "uint256"},{"internalType": "uint256","name": "editionId","type": "uint256"},{"internalType": "string","name": "manufactureDate","type": "string"},{"internalType": "bool","name": "isLimited","type": "bool"},{"internalType": "uint256","name": "ownerId","type": "uint256"}],"internalType": "struct Ast.ProductInfo[]","name": "","type": "tuple[]"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"internalType": "uint256","name": "_number","type": "uint256"},{"internalType": "uint256","name": "new_ownerId","type": "uint256"}],"name": "changeOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"}]
const Ast = new caver.contract(abi, "0xd1AF5Fda5770cc7d2783A59eb845C7e1B520e1ab")
const account = caver.wallet.keyring.create("0xdd6e0b6d3c71c0a43a6ea2cedf91e1e48e194ea6", "0x9bd8e94d3edc022a6d2b5d3e2fb6b55e1d300c72748dfb99db451cd885315373")
caver.wallet.add(account)

async function registerProductInfo(nfcID, brandID, productID, editionID, manufactureDate, limited, ownerID) {
    Ast.methods.registerProductInfo(nfcID, brandID, productID, editionID, manufactureDate, limited, ownerID).send({
        from: account.address,
        gas: 250000
    }).then(function(message) {
        console.log(message)
    })
}

async function allProductInfo() {
    var result = await Ast.methods.allProductInfo().call()
    return result
}

async function changeOwnership(nfcID, userID) {
    try
    Ast.methods.changeOwnership(nfcID, userID).send({
        from: account.address,
        gas: 250000
    }).then(function(message) {
        console.log(message)
    })
}

module.exports = {
    registerProductInfo: registerProductInfo,
    allProductInfo: allProductInfo,
    changeOwnership: changeOwnership,
}

allProductInfo()