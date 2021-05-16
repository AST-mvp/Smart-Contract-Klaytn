const Ast = artifacts.require("Ast");

module.exports = function (deployer) {
  deployer.deploy(Ast);
};
