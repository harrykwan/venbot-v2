require("tools-for-instagram");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




(async () => {
    let ig = await login({
        inputLogin: 'harrykwan0_0',
        inputPassword: '23999hkhk',
        inputProxy: false,
    });
    await setAntiBanMode(ig);
    // let posts = await getUserRecentPosts(ig, "yph_ay");
    // var temppostcodes = []
    // console.log(posts.map(x => {
    //     temppostcodes.push(x.code)
    //     return x.code
    // }))

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

    let inbox = await getInbox(ig);
    console.log(inbox)
    let sendDm = await replyDirectMessage(ig, {
        threadId: inbox[0].threadId
    }, "yay!");

    // let comments = await getPostCommentsById(ig, posts[0].pk);
    // comments.forEach(comment => {
    //     console.log(comment.text);
    // });

    // let likers = await getRecentPostLikers(ig, posts[0]);
    // let likers = await getRecentPostLikersByUsername(ig, 'cynthia._.lkk');
    // console.log(likers)
    // myfollowers = await getFollowers(ig, 'yph_ay');
    // let followers = await getMyLastFollowers(ig);
    // console.log(followers[0].is_new_follower);
    // console.log(myfollowers)
    //Show the last liker of the array
    // console.log(likers[likers.length - 1]);
    // .. Implement your code here
    // let info = await getUserInfo(ig, "yph_ay");
    // console.log("User information" + info);

    // ..
})();