const express = require('express')
const bodyParser = require("body-parser");
const awsapi = require('./src/aws')
const igtoolsapi = require('./src/igtools')
const fs = require('fs')
require('dotenv').config();
// console.log(process.env);
const port = process.env.PORT || 3000;
const logincred = {
    inputLogin: process.env.IGUSER,
    inputPassword: process.env.IGPW,
    inputProxy: false,
};
const app = express()


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(express.static('public', {
    root: __dirname
}))


app.get('/searchtag/:tag', (req, res) => {
    igsearch.searchtag(req.params.tag, function (result) {
        res.send(result)
    })
})

app.get('/searchuser/:userid', (req, res) => {
    igsearch.searchuser(req.params.userid, function (result) {
        res.send(result)
    })
})

app.get('/getlikelist/:postid', (req, res) => {
    igpost.getlikelist(req.params.postid, function (result) {
        res.send(result)
    })
})

app.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    let tempuser = await igtoolsapi.login(username, password)
    var ciphertext = CryptoJS.AES.encrypt(username, password).toString();
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
    igtoolsapi.getpost(req.params.userid, function (data) {
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
    igtoolsapi.getcls(req.params.pk, req.params.userid, function (data) {
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