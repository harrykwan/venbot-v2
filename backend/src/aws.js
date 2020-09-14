const AWS = require('aws-sdk');
require('dotenv').config();
const BUCKET_NAME = 'venbot-ig-follower';
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

AWS.config.update({
    region: 'ap-southeast-1',
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
});


let s3bucket = new AWS.S3({
    // accessKeyId: IAM_USER_KEY,
    // secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

function uploadToS3(file, res, callback) {
    s3bucket.createBucket(function () {
        var params = {
            Bucket: BUCKET_NAME,
            Key: file.name,
            Body: file.data
        };
        s3bucket.upload(params, function (err, data) {
            if (err) {
                console.log('error in callback');
                console.log(err);
            }
            console.log('success');
            console.log(data.Location);
            if (callback) {
                callback()
            }
            if (res) {
                res.send(data)
            }

        });
    });
}

function uploadJSONToS3(filename, jsondata, callback) {
    s3.putObject({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: JSON.stringify(jsondata),
            ContentType: "application/json"
        },
        function (err, data) {
            console.log(JSON.stringify(err) + " " + JSON.stringify(data));
            if (callback) {
                callback(data)
            }
        }
    );
}

function getphotofroms3(x, req, res) {
    var params = {
        Bucket: BUCKET_NAME,
        Key: x
    };
    s3bucket.getObject(params, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'image/' + x.split('.')[1]
        });
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
    });
}




function createtable(tablename, keyname) {
    var params = {
        TableName: tablename,
        KeySchema: [{
            AttributeName: keyname,
            KeyType: "HASH"
        }],
        AttributeDefinitions: [{
            AttributeName: keyname,
            AttributeType: "S"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

// createtable('iguser', 'username')
// createtable('followrecord', 'recordid')
// createtable('crm', 'recordid')

function createitem(table, item, req, res, callback) {
    var params = {
        TableName: table,
        Item: item
    };

    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            if (res) {
                res.send(data)
            }
            if (callback) {
                callback(data)
            }
            console.log("Added item:", data);
        }
    });
}

// createitem({
//     uid: "testuid",
//     testdata: "testdata"
// })

function readitem(table, key, value, req, res, callback) {

    var tempjson = {}
    tempjson[key] = value
    var params = {
        TableName: table,
        Key: tempjson
    };

    docClient.get(params, function (err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {

            if (callback) {
                callback(data)
            }
            if (res) {
                res.send(data)

            }
            console.log("GetItem succeeded:", data);
        }
    });
}

function querydata(table, key, value, callback) {
    var params = {
        TableName: table,
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames: {
            "#key": key
        },
        ExpressionAttributeValues: {
            ":value": value
        }
    };

    docClient.query(params, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            // data.Items.forEach(function (item) {
            //     console.log(" -", item.year + ": " + item.title);
            // });
            if (callback) {
                callback(data.Items)
            }
        }
    });
}

function scandata(table, key, value, callback) {
    var params = {
        TableName: table,
        FilterExpression: "#key = :value",
        ExpressionAttributeNames: {
            "#key": key
        },
        ExpressionAttributeValues: {
            ":value": value
        }
    };

    docClient.scan(params, function (err, data) {
        if (err) {
            console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("scan succeeded.");
            // data.Items.forEach(function (item) {
            //     console.log(" -", item.year + ": " + item.title);
            // });
            if (callback) {
                callback(data.Items)
            }
        }
    });
}


// readitem('testuid')


exports.uploadToS3 = uploadToS3
exports.getphoto = getphotofroms3
exports.createtable = createtable
exports.createitem = createitem
exports.readitem = readitem
exports.querydata = querydata
exports.scandata = scandata
exports.uploadJSONToS3 = uploadJSONToS3