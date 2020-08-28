const express = require('express')
const bodyParser = require("body-parser");
const awsapi = require('./src/aws')
const igtoolsapi = require('./src/igtools')
var CryptoJS = require("crypto-js");
const fs = require('fs');
const followUser = require('tools-for-instagram/src/followUser');
const setAntiBanMode = require('tools-for-instagram/src/setAntiBanMode');
require('dotenv').config();
// console.log(process.env);
const port = process.env.PORT || 3000;
const logincred = {
    inputLogin: process.env.IGUSER,
    inputPassword: process.env.IGPW,
    inputProxy: false,
};
const app = express()

let alllogin = {};

(async () => {
    const defaultig = await login(logincred);
    await setAntiBanMode(defaultig);
    alllogin.default = defaultig
})();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(express.static('public', {
    root: __dirname
}))


app.get('/searchtag/:tag', (req, res) => {
    igsearch.searchtag(alllogin.default, req.params.tag, function (result) {
        res.send(result)
    })
})

app.get('/searchuser/:userid', (req, res) => {
    igsearch.searchuser(alllogin.default, req.params.userid, function (result) {
        res.send(result)
    })
})

app.get('/getlikelist/:postid', (req, res) => {
    igpost.getlikelist(alllogin.default, req.params.postid, function (result) {
        res.send(result)
    })
})


app.post('/login', async (req, res) => {
    var myusername = req.body.username;
    var mypassword = req.body.password;
    var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
    const tempigac = await login({
        inputLogin: myusername,
        inputPassword: mypassword,
        inputProxy: false,
    });;
    alllogin[myusername] = tempigac
    await setAntiBanMode(tempigac)
    res.send('ok')
})


app.post('/follow', async (req, res) => {
    var myusername = req.body.username;
    var mypassword = req.body.password;
    var followuserid = req.body.followuserid;
    var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
    if (!alllogin.hasOwnProperty(myusername)) {
        console.log('login')
        const tempigac = await login({
            inputLogin: myusername,
            inputPassword: mypassword,
            inputProxy: false,
        });;
        alllogin[myusername] = tempigac
        // await setAntiBanMode(tempigac)
    }
    await followUser(alllogin[myusername], followuserid)
    res.send('ok')
})

app.post('/unfollow', async (req, res) => {
    var myusername = req.body.username;
    var mypassword = req.body.password;
    var unfollowuserid = req.body.unfollowuserid;
    var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
    if (!alllogin.hasOwnProperty(myusername)) {
        const tempigac = await login({
            inputLogin: myusername,
            inputPassword: mypassword,
            inputProxy: false,
        });;
        alllogin[myusername] = tempigac
        // await setAntiBanMode(tempigac)
    }
    await unfollowUser(alllogin[myusername], unfollowuserid)
    res.send('ok')
})






function uploadfollower(userid) {
    fs.readFile('./../output/' + userid + '.json', (err, data) => {
        if (err) throw err;
        const filedata = {
            name: req.params.userid + '.json',
            data: JSON.stringify(data, null, 2)
        };
        awsapi.uploadToS3(filedata, res, function (x) {
            console.log('ok')
        })
    });
}

function updatefollower(userid) {

}

function uploadtos3(filename, body) {
    const filedata = {
        name: filename,
        data: body
    };
    awsapi.uploadToS3(filedata, undefined, function (x) {
        console.log('ok')
    })
}


app.get('/getposts/:userid', (req, res) => {
    igtoolsapi.getpost(alllogin.default, req.params.userid, function (data) {
        data = data.map((x, index) => {
            if (x.carousel_media) {
                return {
                    pk: index,
                    image: x.carousel_media[0].image_versions2.candidates[0].url,
                    caption: x.caption.text
                }
            } else if (x.image_versions2 && x.caption) {
                return {
                    pk: index,
                    image: x.image_versions2.candidates[0].url,
                    caption: x.caption.text
                }
            } else if (x.image_versions2) {
                return {
                    pk: index,
                    image: x.image_versions2.candidates[0].url,
                    caption: ""
                }
            } else {
                return x
            }

        })
        res.send(data)
    })
})


app.get('/getcls/:userid/:pk', (req, res) => {
    igtoolsapi.getcls(alllogin.default, req.params.pk, req.params.userid, function (data) {
        res.send(data)
        uploadtos3(req.params.userid + '_post' + req.params.pk + '.json', JSON.stringify(data, null, 2))
    })
})

app.get('/posts', (req, res) => {
    res.sendFile('public/posts.html', {
        root: __dirname
    })
})

app.get('/cls', (req, res) => {
    res.sendFile('public/cls.html', {
        root: __dirname
    })
})


app.get('/', (req, res) => {
    res.sendFile('public/login.html', {
        root: __dirname
    })
})

app.get('/login', (req, res) => {
    res.sendFile('public/login.html', {
        root: __dirname
    })
})


app.get('/igsetup', (req, res) => {
    res.sendFile('public/igsetup.html', {
        root: __dirname
    })
})


app.get('/register', (req, res) => {
    res.sendFile('public/register.html', {
        root: __dirname
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))