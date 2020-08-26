require('dotenv').config();
require("tools-for-instagram");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const logincred = {
    inputLogin: process.env.IGUSER,
    inputPassword: process.env.IGPW,
    inputProxy: false,
};



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

async function login(username, pw) {
    let igac = await login({
        inputLogin: username,
        inputPassword: pw,
        inputProxy: false,
    });
    await setAntiBanMode(igac)
    return igac
}

async function follow(ig, userid) {
    return await likeUrl(ig, 'https://www.instagram.com/p/' + posturl + '/');
}

async function unfollow(ig, userid) {
    return await likeUrl(ig, 'https://www.instagram.com/p/' + posturl + '/');
}

async function getpost(ig, userid, callback) {
    let posts = await getUserRecentPosts(ig, userid);
    if (callback)
        callback(posts)
}


async function getcls(postnum, userid, callback) {
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

exports.getcls = getcls
exports.getpost = getpost
exports.follow = follow
exports.unfollow = unfollow