const express = require('express')
const bodyParser = require("body-parser");
const awsapi = require('./src/aws')
const igtoolsapi = require('./src/igtools')
const CryptoJS = require("crypto-js");
const date = require('date-and-time');
const rimraf = require("rimraf");
const fs = require('fs');
const localjson = require('./src/localjson')
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


try {

    (async () => {
        //clear cookies
        rimraf("./cookies", async function () {
            const defaultig = await login(logincred);
            // await setAntiBanMode(defaultig);
            igtoolsapi.setalllogin('default', defaultig) // alllogin.default = defaultig
        });

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
        //alllogin.default
        await igtoolsapi.gethashtaglikers(igtoolsapi.getalllogin('default'), req.params.tag, req.params.postnum, function (result) {
            res.send(result)
        })
    } catch (e) {
        res.send(e)
    }

})



app.post('/loginig', async (req, res) => {
    var myusername = req.body.username;
    var mypassword = req.body.password;
    // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
    var decrypted = CryptoJS.AES.decrypt(mypassword, myusername).toString(CryptoJS.enc.Utf8);
    console.log(myusername)
    console.log(mypassword)
    console.log(decrypted)
    if (!igtoolsapi.checkallloginuserexist(myusername)) {
        console.log('login')
        const tempigac = await login({
            inputLogin: myusername,
            inputPassword: decrypted,
            inputProxy: false,
        });;
        // alllogin[myusername] = tempigac
        igtoolsapi.setalllogin(myusername, tempigac)
        awsapi.createitem('iguser', {
            username: myusername,
            password: mypassword
        }, undefined, undefined, function (data) {
            // loginfromaws(myusername)
            console.log('saved to aws')
        })
        // await setAntiBanMode(tempigac)
        // await setAntiBanMode(tempigac)
    }
    // alllogin[myusername] = tempigac

    res.send('ok')
})

function loginfromaws(username) {
    awsapi.readitem('iguser', 'username', username, undefined, undefined, function (data) {
        var password = data.Item.password
        var decrypted = CryptoJS.AES.decrypt(password, username).toString(CryptoJS.enc.Utf8);
        const tempigac = await login({
            inputLogin: username,
            inputPassword: decrypted,
            inputProxy: false,
        });;
        // alllogin[myusername] = tempigac
        igtoolsapi.setalllogin(username, tempigac)
    })
}



app.post('/follow', async (req, res) => {
    try {

        var myusername = req.body.username;
        // var mypassword = req.body.password;
        var followuserid = req.body.followuserid;
        // var ciphertext = CryptoJS.AES.encrypt(mypassword, myusername).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // console.log('login')
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });;
            // // alllogin[myusername] = tempigac
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // await setAntiBanMode(tempigac)
        }
        await followUser(igtoolsapi.getalllogin(myusername), followuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})

app.post('/unfollow', async (req, res) => {
    try {
        var myusername = req.body.username;
        // var mypassword = req.body.password;
        var unfollowuserid = req.body.unfollowuserid;
        // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });;
            // // alllogin[myusername] = tempigac
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // await setAntiBanMode(tempigac)
        }
        await unfollowUser(igtoolsapi.getalllogin(myusername), unfollowuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})


app.post('/follownow', async (req, res) => {
    try {
        var myusername = req.body.username;
        // var mypassword = req.body.password;
        var followuserlist = req.body.followuserlist;
        // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // console.log('login')
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });;
            // // alllogin[myusername] = tempigac
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // await setAntiBanMode(tempigac)
        }
        for (var j = 0; j < followuserlist.length; j++) {
            console.log(myusername + ' following ' + followuserlist[j])
            await followUser(igtoolsapi.getalllogin(myusername), followuserlist[j], true)
            await igtoolsapi.timeout(1000)
        }

        // await followUser(igtoolsapi.getalllogin(myusername), followuserid, true)
        res.send('ok')
    } catch (e) {
        // console.log(e)
        res.send(e)
    }
})

app.post('/schedulefollow', async (req, res) => {
    try {
        var myusername = req.body.username;
        // var mypassword = req.body.password;
        var followuserlist = req.body.followuserlist;
        // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // console.log('login')
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });;
            // // alllogin[myusername] = tempigac
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // await setAntiBanMode(tempigac)
        }
        followuserlist.map((x, index) => {
            const tempdayadd = parseInt(index / 100)
            const now = new Date();
            const tempdate = date.format(date.addDays(now, tempdayadd), 'DD/MM/YYYY');
            localjson.pushfollowtask(tempdate, myusername, x)
        })

        // await followUser(igtoolsapi.getalllogin(myusername), followuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})

app.post('/scheduleunfollow', async (req, res) => {
    try {
        var myusername = req.body.username;
        // var mypassword = req.body.password;
        var unfollowuserlist = req.body.unfollowuserlist;
        // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // console.log('login')
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });;
            // // alllogin[myusername] = tempigac
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // await setAntiBanMode(tempigac)
        }
        unfollowuserlist.map((x, index) => {
            const tempdayadd = parseInt(index / 100)
            const now = new Date();
            const tempdate = date.format(date.addDays(now, tempdayadd + 5), 'DD/MM/YYYY');
            localjson.pushunfollowtask(tempdate, myusername, x)
        })

        // await followUser(igtoolsapi.getalllogin(myusername), followuserid, true)
        res.send('ok')
    } catch (e) {
        res.send(e)
    }
})


app.post('/getfollower', async (req, res) => {
    try {
        var myusername = req.body.username;
        // var mypassword = req.body.password;
        // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
        // if (!alllogin.hasOwnProperty(myusername)) {
        if (!igtoolsapi.checkallloginuserexist(myusername)) {
            loginfromaws(myusername)
            // const tempigac = await login({
            //     inputLogin: myusername,
            //     inputPassword: mypassword,
            //     inputProxy: false,
            // });
            // igtoolsapi.setalllogin(myusername, tempigac)
            // // alllogin[myusername] = tempigac
            // // await setAntiBanMode(tempigac)
        }
        await getFollowers(igtoolsapi.getalllogin(myusername), myusername);
        let followers = await readFollowers(igtoolsapi.getalllogin(myusername), myusername);
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
        igtoolsapi.getpost(igtoolsapi.getalllogin('default'), req.params.userid, function (data) {
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
        // console.log(e)
        res.send(e)
    }
})


app.get('/getcls/:userid/:pk', (req, res) => {
    try {
        igtoolsapi.getcls(igtoolsapi.getalllogin('default'), req.params.pk, req.params.userid, function (data) {
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

app.get('/searchtag', (req, res) => {
    res.sendFile('public/searchtag.html', {
        root: __dirname
    })
})

app.get('/searchresult', (req, res) => {
    res.sendFile('public/searchresult.html', {
        root: __dirname
    })
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))