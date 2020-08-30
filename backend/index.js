const express = require('express')
const bodyParser = require("body-parser");
const awsapi = require('./src/aws')
const igtoolsapi = require('./src/igtools')
const CryptoJS = require("crypto-js");
const fs = require('fs');
const followUser = require('tools-for-instagram/src/followUser');
const setAntiBanMode = require('tools-for-instagram/src/setAntiBanMode');
require('./src/schedule')
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

try {

    (async () => {
        const defaultig = await login(logincred);
        await setAntiBanMode(defaultig);
        alllogin.default = defaultig
    })();
} catch (e) {
    console.log(e)
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(express.static('public', {
    root: __dirname
}))


app.get('/searchtag/:tag/:postnum', async (req, res) => {
    try {
        await igtoolsapi.gethashtaglikers(alllogin.default, req.params.tag, req.params.postnum, function (result) {
            res.send(result)
        })
    } catch (e) {
        res.send(e)
    }

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
    try {

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
        await followUser(alllogin[myusername], followuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})

app.post('/unfollow', async (req, res) => {
    try {
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
        await unfollowUser(alllogin[myusername], unfollowuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})

app.post('/getfollower', async (req, res) => {
    try {
        var myusername = req.body.username;
        var mypassword = req.body.password;
        var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        if (!alllogin.hasOwnProperty(myusername)) {
            const tempigac = await login({
                inputLogin: myusername,
                inputPassword: mypassword,
                inputProxy: false,
            });
            alllogin[myusername] = tempigac
            // await setAntiBanMode(tempigac)
        }
        await getFollowers(alllogin[myusername], myusername);
        let followers = await readFollowers(alllogin[myusername], myusername);
        let followerslist = followers.map(x => x.username)
        res.send(followerslist)
    } catch (e) {
        res.send(e)
    }
})






function uploadfollower(userid) {
    try {
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
    } catch (e) {
        res.send(e)
    }
}

function updatefollower(userid) {

}

function uploadtos3(filename, body) {
    try {
        const filedata = {
            name: filename,
            data: body
        };
        awsapi.uploadToS3(filedata, undefined, function (x) {
            console.log('ok')
        })
    } catch (e) {
        res.send(e)
    }
}


app.get('/getposts/:userid', (req, res) => {
    try {
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
    } catch (e) {
        res.send(e)
    }
})


app.get('/getcls/:userid/:pk', (req, res) => {
    try {
        igtoolsapi.getcls(alllogin.default, req.params.pk, req.params.userid, function (data) {
            res.send(data)
            uploadtos3(req.params.userid + '_post' + req.params.pk + '.json', JSON.stringify(data, null, 2))
        })
    } catch (e) {
        res.send(e)
    }
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