try {
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
    const getFollowers = require('tools-for-instagram/src/getFollowers');
    const setAntiBanMode = require('tools-for-instagram/src/setAntiBanMode');
    const logger = require('logger').createLogger('first_stage_testing.log');

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
        //log ip
        // request.connection.remoteAddress
        (async () => {
            //clear cookies
            rimraf("./cookies", async function () {
                try {
                    const defaultig = await login(logincred);
                    // await setAntiBanMode(defaultig);
                    igtoolsapi.setalllogin('default', defaultig) // alllogin.default = defaultig
                } catch (e) {
                    console.log(e)
                }


            });

        })();
    } catch (e) {
        console.log(e)
        logger.error(e)
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
            logger.info('get/searchtag/:tag/:postnum' + JSON.stringify(req.params))
            await igtoolsapi.gethashtaglikers(igtoolsapi.getalllogin('default'), req.params.tag, req.params.postnum, function (result) {
                res.send(result)
            })
        } catch (e) {
            res.send(e)
            logger.error(e)
        }

    })


    app.get('/searchtagpost/:tag', async (req, res) => {
        try {
            //alllogin.default
            logger.info('get/searchtag/:tag' + JSON.stringify(req.params))
            await igtoolsapi.gethashtagposts(igtoolsapi.getalllogin('default'), req.params.tag, function (data) {
                res.send(data)
            })
        } catch (e) {
            res.send(e)
            logger.error(e)
        }

    })



    app.post('/loginig', async (req, res) => {
        try {
            logger.info('post/loginig' + JSON.stringify(req.body))
            var myusername = req.body.username;
            var mypassword = req.body.password;
            // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
            var decrypted = CryptoJS.AES.decrypt(mypassword, myusername).toString(CryptoJS.enc.Utf8);
            console.log(myusername)
            console.log(mypassword)
            console.log(decrypted)
            rimraf("./cookies/" + myusername + '.json', async function () {
                try {
                    const tempigac = await login({
                        inputLogin: myusername,
                        inputPassword: decrypted,
                        inputProxy: false,
                        // verificationMode: 2
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
                    res.send('ok')
                } catch (e) {
                    logger.error(e)
                    console.log(e)
                    res.send(e)
                }


            });

            // alllogin[myusername] = tempigac


        } catch (e) {
            logger.error(e)
            res.send(e)
        }
    })


    app.post('/verifyig', async (req, res) => {
        try {
            console.log('verifying!')
            logger.info('post/verify' + JSON.stringify(req.body))
            var myusername = req.body.username;
            var mycode = req.body.code;
            // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
            await igtoolsapi.enterverifycode(myusername, mycode)
            res.send('ok')
            console.log('ok')
        } catch (e) {
            logger.error(e)
            res.send('error')
            console.log('not ok')
        }
    })

    function loginfromaws(username) {
        logger.info('loginfromaws ' + username)
        const temppromise = new Promise(function (resolve, reject) {
            awsapi.readitem('iguser', 'username', username, undefined, undefined, async function (data) {
                var password = data.Item.password
                var decrypted = CryptoJS.AES.decrypt(password, username).toString(CryptoJS.enc.Utf8);
                const tempigac = await login({
                    inputLogin: username,
                    inputPassword: decrypted,
                    inputProxy: false,
                    // verificationMode: 2
                });;
                // alllogin[myusername] = tempigac
                igtoolsapi.setalllogin(username, tempigac)
                resolve('ok')
            })
        })
        return temppromise
    }



    app.post('/follow', async (req, res) => {
        try {
            var myusername = req.body.username;
            // var mypassword = req.body.password;
            var followuserid = req.body.followuserid;
            // var ciphertext = CryptoJS.AES.encrypt(mypassword, myusername).toString();
            // if (!alllogin.hasOwnProperty(myusername)) {
            if (!igtoolsapi.checkallloginuserexist(myusername)) {
                await loginfromaws(myusername)
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
                await loginfromaws(myusername)
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
            logger.info('post/follownow' + JSON.stringify(req.body))
            var myusername = req.body.username;
            // var mypassword = req.body.password;
            var followuserlist = req.body.followuserlist;
            var tag = req.body.tag;
            // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
            // if (!alllogin.hasOwnProperty(myusername)) {
            if (!igtoolsapi.checkallloginuserexist(myusername)) {
                await loginfromaws(myusername)
            }
            // console.log(followuserlist)
            const now = new Date();
            const nowtime = now.getTime()
            // awsapi.uploadJSONToS3(myusername + '-' + tag + '-' + nowtime, followuserlist, function (data) {
            //     awsapi.createitem('followrecord', {
            //         username: myusername,
            //         time: nowtime,
            //         filename: myusername + '-' + tag + '-' + nowtime
            //     })
            // })
            res.send('start')
            for (var j = 0; j < followuserlist.length; j++) {
                console.log(myusername + ' following ' + followuserlist[j])
                await followUser(igtoolsapi.getalllogin(myusername), followuserlist[j], true)
                await igtoolsapi.timeout(1000)
            }
            followuserlist.map((x, index) => {
                const tempdayadd = parseInt(index / 100)
                const tempdate = date.format(date.addDays(now, tempdayadd + 5), 'DD/MM/YYYY');
                // console.log(tempdate.toString(), myusername.toString(), x.toString())
                localjson.pushunfollowtask(tempdate.toString(), myusername.toString(), x.toString())
            })


            awsapi.createitem('followrecord', {
                recordid: myusername + '-' + nowtime,
                username: myusername,
                data: followuserlist
            }, undefined, undefined, undefined)



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
                await loginfromaws(myusername)
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
                const tempdate2 = date.format(date.addDays(now, tempdayadd + 5), 'DD/MM/YYYY');
                localjson.pushunfollowtask(tempdate2, myusername, x)
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
                await loginfromaws(myusername)
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
            logger.info('get/getfollower' + JSON.stringify(req.body))
            var myusername = req.body.username;
            // var mypassword = req.body.password;
            // var ciphertext = CryptoJS.AES.encrypt(myusername, mypassword).toString();
            // if (!alllogin.hasOwnProperty(myusername)) {
            // if (!igtoolsapi.checkallloginuserexist(myusername)) {
            //     await loginfromaws(myusername)
            //     // const tempigac = await login({
            //     //     inputLogin: myusername,
            //     //     inputPassword: mypassword,
            //     //     inputProxy: false,
            //     // });
            //     // igtoolsapi.setalllogin(myusername, tempigac)
            //     // // alllogin[myusername] = tempigac
            //     // // await setAntiBanMode(tempigac)
            // }
            await getFollowers(igtoolsapi.getalllogin("default"), myusername);
            let followers = await readFollowers(igtoolsapi.getalllogin(myusername), myusername);
            let followerslist = followers.map(x => x.username)
            res.send(followerslist)
        } catch (e) {
            console.log(e)
            logger.error(e)
            res.send(e)
        }
    })


    app.post('/addtocrm', async (req, res) => {
        try {
            logger.info('post/addtocrm' + JSON.stringify(req.body))
            const now = new Date();
            const nowtime = now.getTime()
            var myusername = req.body.username;
            var mydata = req.body.data;
            var myfrom = req.body.from;
            awsapi.createitem('crm', {
                recordid: myusername + '-' + nowtime,
                username: myusername,
                data: mydata,
                from: myfrom
            }, undefined, undefined, function () {
                res.send('ok')
            })
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
            logger.info('get/getposts/:userid' + JSON.stringify(req.params))
            console.log(req.params.userid)
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
            res.send('error')
            logger.error(e)
        }
    })


    app.get('/getcls/:userid/:pk', (req, res) => {
        try {
            logger.info('get/getcls/:userid/:pk' + JSON.stringify(req.params))
            igtoolsapi.getcls(igtoolsapi.getalllogin('default'), req.params.pk, req.params.userid, function (data) {
                res.send(data)
                uploadtos3(req.params.userid + '_post' + req.params.pk + '.json', JSON.stringify(data, null, 2))
            })
        } catch (e) {
            res.send(e)
            logger.error(e)
        }
    })

    app.get('/getcrm/:userid', (req, res) => {
        logger.info('get/getcrm/:userid' + JSON.stringify(req.params))
        awsapi.scandata('crm', 'username', req.params.userid, function (data) {
            res.send(data)
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

    app.get('/home', (req, res) => {
        res.sendFile('public/dashboard.html', {
            root: __dirname
        })
    })


    app.get('/searchresult', (req, res) => {
        res.sendFile('public/dashboard.html', {
            root: __dirname
        })
    })

    app.get('/invoice', (req, res) => {
        res.sendFile('public/invoice.html', {
            root: __dirname
        })
    })

    app.get('/crm', (req, res) => {
        res.sendFile('public/crm.html', {
            root: __dirname
        })
    })







    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

} catch (e) {
    console.log(e)
}