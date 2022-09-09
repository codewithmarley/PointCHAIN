var PointChain = new Blockchain(SHA256("_THE_POINT_CHAIN_"), 1000000)
var lastExport = String(PointChain.exportSave());

var contract = SHA256("_THE_POINT_CHAIN_")

var levins_contract = SHA256("LEVIN")
var marleys_contract = SHA256("MARLEY")

function doChorePOS_LEVIN(choreName, points_for_chore) {
    PointChain.createBlock(contract, levins_contract, points_for_chore, choreName)
}

function doChoreNEG_LEVIN(choreName, points_for_chore) {
    PointChain.createBlock(levins_contract, contract, points_for_chore, choreName)
}

function getPoints_LEVIN() {
    document.getElementById('levBal').innerHTML = PointChain.getBallanceOfAdress(levins_contract)
    return PointChain.getBallanceOfAdress(levins_contract)
}
function doChorePOS_MARLEY(choreName, points_for_chore) {
    PointChain.createBlock(contract, marleys_contract, points_for_chore, choreName)
}

function doChoreNEG_MARLEY(choreName, points_for_chore) {
    PointChain.createBlock(marleys_contract, contract, points_for_chore, choreName)
}

function getPoints_MARLEY() {
    document.getElementById('marlBal').innerHTML = PointChain.getBallanceOfAdress(marleys_contract)
    return PointChain.getBallanceOfAdress(marleys_contract)
}

function save() {
    var lastExport = PointChain.exportSave();
    console.log(lastExport)
    document.getElementById('save').innerHTML = JSON.stringify(lastExport);
}

function loadSave(saveSTR) {
    var saveOBJ = JSON.parse(saveSTR);
    PointChain.importSave(saveOBJ);
}