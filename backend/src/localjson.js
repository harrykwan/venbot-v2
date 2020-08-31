const {
    JsonDB
} = require('node-json-db')
const {
    Config
} = require('node-json-db/dist/lib/JsonDBConfig');

var db = new JsonDB(new Config("schedulelist", true, false, '/'));
console.log(db.getData('/'))

function pushfollowtask(date, username, targetuser) {
    let newdata = {
        username: username,
        targetuser: targetuser
    }
    db.push("/" + date + "/followlist[]", newdata, true);
}



function pushunfollowtask(username, targetuser) {
    let newdata = {
        username: username,
        targetuser: targetuser
    }
    db.push("/" + date + "/unfollowlist[]", newdata, true);
}




function popunfollowtask(date) {
    var olddata = db.getData("/" + date + "/followlist[-1]")
    db.delete("/" + date + "/followlist[-1]");
    return olddata
}


function popunfollowtask(date) {
    var olddata = db.getData("/" + date + "/unfollowlist[-1]")
    db.delete("/" + date + "/unfollowlist[-1]");
    return olddata
}

exports.popunfollowtask = popunfollowtask
exports.popunfollowtask = popunfollowtask
exports.pushfollowtask = pushfollowtask
exports.pushunfollowtask = pushunfollowtask