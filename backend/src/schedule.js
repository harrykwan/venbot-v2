const schedule = require('node-schedule')
const localjson = require('./localjson')
const date = require('date-and-time');
const igtoolsapi = require('./igtools')

schedule.scheduleJob('0 0 * * *', async () => {
    const nowdate = date.format(new Date(), 'DD/MM/YYYY');
    console.log(nowdate)
    var nowtask = localjson.popfollowtask()
    while (nowtask) {
        try {
            await followUser(igtoolsapi.getalllogin(nowtask.username), nowtask.targetuser, true)
            await igtoolsapi.timeout(1000)
        } catch (e) {
            console.log(error)
        }
        nowtask = localjson.popfollowtask()
    }
    nowtask = localjson.popunfollowtask()
    while (nowtask) {
        try {
            await unfollowUser(igtoolsapi.getalllogin(nowtask.username), nowtask.targetuser, true)
            await igtoolsapi.timeout(1000)
        } catch (e) {
            console.log(error)
        }
        nowtask = localjson.popunfollowtask()
    }
}) // run everyday at midnight