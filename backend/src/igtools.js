try {
    const followUser = require('tools-for-instagram/src/followUser');
    const unfollowUser = require('tools-for-instagram/src/unfollowUser');
    const topHashtagList = require('tools-for-instagram/src/topHashtagList');

    require('dotenv').config();
    require("tools-for-instagram");

    let alllogin = {};
    console.log('ig tools start')

    function setalllogin(key, value) {
        alllogin[key] = value
    }

    function getalllogin(key) {
        return alllogin[key]
    }

    function checkallloginuserexist(key) {
        return alllogin.hasOwnProperty(key)
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // let ig, ig2;
    (async () => {
        // ig = await login(logincred);
        // await setAntiBanMode(ig);
        // ig2 = await login(logincred2);
        // await setAntiBanMode(ig2);
        // console.log(ig)

        // let inbox = await getInbox(ig)
        // inbox = inbox.map(x => {
        //     return {
        //         user: JSON.stringify(x.users),
        //         message: x.lastMessage
        //     }
        // })
        // console.log(inbox)
        // let likers = await getRecentPostLikersByUsername(ig, 'cynthia._.lkk');
        // for (var j = 0; j < temppostcodes.length; j++) {
        //     await likeUrl(ig, 'https://www.instagram.com/p/' + temppostcodes[j] + '/');
        // }

        // let user = await getUserInfo(ig, "yph_ay");
        // for (var j = 0; j < 10000; j++) {
        //     await timeout(2000)
        //     let sendDm = await replyDirectMessage(ig, {
        //         userId: user.pk
        //     }, "yay!" + j);
        // }

        // let inbox = await getInbox(ig);
        // console.log(inbox)
        // let sendDm = await replyDirectMessage(ig, {
        //     threadId: inbox[0].threadId
        // }, "yay!");



        // console.log(likers)
        // myfollowers = await getFollowers(ig, 'yph_ay');
        // console.log(followers[0].is_new_follower);
        // console.log(myfollowers)
        //Show the last liker of the array
        // console.log(likers[likers.length - 1]);
        // .. Implement your code here
        // let info = await getUserInfo(ig, "yph_ay");
        // console.log("User information" + info);
        // myfollowers = await getFollowers(ig, userid);
        // ..
        // let info = await spider.getUserLikers("yph_ay");
        // console.log(info);
    })();

    async function mylogin(username, pw) {
        return await login({
            inputLogin: username,
            inputPassword: pw,
            inputProxy: false,
        });

    }

    async function enterverifycode(key, code) {
        const tempig = alllogin[key];
        console.log(tempig.challenge.sendSecurityCode)
        return await tempig.challenge.sendSecurityCode(code);
    }

    async function myantiban(ig) {
        return await setAntiBanMode(ig)
    }

    async function myfollow(ig, userid) {
        return await followUser(ig, userid)
    }

    async function myunfollow(ig, userid) {
        return await unfollowUser(ig, userid);
    }

    async function getpost(ig, userid, callback) {
        let posts = await getUserRecentPosts(ig, userid);
        if (callback)
            callback(posts)
    }


    async function getcls(ig, postnum, userid, callback) {
        postnum = parseInt(postnum)
        let allcls = {}
        let posts = await getUserRecentPosts(ig, userid);
        console.log(postnum)
        let post = posts[postnum]
        let likers = await getRecentPostLikers(ig, post);
        likers.forEach(like => {
            console.log(like)
            if (!allcls[like.username])
                allcls[like.username] = {}
            allcls[like.username].data = like
            allcls[like.username].type = "L"
        });

        let comments = await getPostCommentsById(ig, post.pk);
        comments.forEach(comment => {
            console.log(comment)
            if (!allcls[comment.user.username])
                allcls[comment.user.username] = {}
            allcls[comment.user.username].data = comment.user
            if (allcls[comment.user.username].type == "L" || allcls[comment.user.username] == "CL")
                allcls[comment.user.username].type = "CL"
            else
                allcls[comment.user.username].type = "C"
        });
        console.log(allcls)
        console.log('ok')
        if (callback)
            callback(allcls)
    }


    async function gethashtaglikers(ig, tag, postnum, callback) {
        let posts = await topHashtagList(ig, tag);
        console.log(posts[postnum])
        let likers = await getRecentPostLikers(ig, posts[postnum]);
        // let templikeusers = []
        // likers.forEach(like => {
        //     // console.log(like)
        //     templikeusers.push(like.username)
        // });
        // callback(templikeusers)
        callback(likers)
    }

    async function gethashtagposts(ig, tag, callback) {
        let posts = await topHashtagList(ig, tag);

        callback(posts)
    }

    exports.getcls = getcls
    exports.getpost = getpost
    exports.follow = myfollow
    exports.unfollow = myunfollow
    exports.login = mylogin
    exports.antiban = myantiban
    exports.gethashtaglikers = gethashtaglikers
    exports.gethashtagposts = gethashtagposts
    exports.getalllogin = getalllogin
    exports.setalllogin = setalllogin
    exports.checkallloginuserexist = checkallloginuserexist
    exports.timeout = timeout
    exports.enterverifycode = enterverifycode
} catch (e) {
    console.log(e)
}