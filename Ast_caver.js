const Caver = require('caver-js')
const ethers = require('ethers')
const toBytes32 = ethers.utils.formatBytes32String
const caver = new Caver('https://api.baobab.klaytn.net:8651/')

const account = caver.wallet.keyring.create("0xdd6e0b6d3c71c0a43a6ea2cedf91e1e48e194ea6", "0x9bd8e94d3edc022a6d2b5d3e2fb6b55e1d300c72748dfb99db451cd885315373")
caver.wallet.add(account)

const abi =  require('./build/contracts/Logic.json').abi
const cont_addr = require('./build/contracts/Logic.json').networks[1001].address
const Ast = new caver.contract(abi, cont_addr)


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
            console.log(nfcID, toBytes32(brandID), toBytes32(productID), toBytes32(editionID), toBytes32(manufactureDate), limited, appeared, ownerID)
            console.log(message)
        })
        return true
    })
}

async function allProductInfo() {
    var result = await Ast.methods.allProductInfo().call()
    console.log(result)
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

function to_String(hex) {
    return ethers.utils.parseBytes32String(hex)
}

module.exports = {
    registerProductInfo: registerProductInfo,
    allProductInfo: allProductInfo,
    changeOwnership: changeOwnership,
    nfcIDcheck: nfcIDcheck,
    to_String: to_String
}
// registerProductInfo(123456,'1','2','3',"21-07-12", false, false, 4321)
allProductInfo()
