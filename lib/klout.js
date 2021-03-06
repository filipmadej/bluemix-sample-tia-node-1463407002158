// Copyright IBM Corp. 2013 All Rights Reserved. See footer for details.

var URL  = require("url")
var http = require("http")

var async   = require("async")

var utils = require("./utils")

var klout = exports

var KloutIds = {}

var Key  

//------------------------------------------------------------------------------
klout.setKey = function(key) {
    Key = key
}

//------------------------------------------------------------------------------
klout.getKloutInfo = function(twitterSN, callback) {

    var kloutId = KloutIds[twitterSN]

    if (kloutId != null) {
        getKloutInfo(kloutId, callback)
        return
    }

    getKloutId("twitter", twitterSN, function(err, data) {
        if (err) {
            callback(err)
            return
        }

        KloutIds[twitterSN] = data.id
        getKloutInfo(data.id, callback)
    })
}

//------------------------------------------------------------------------------
function getKloutInfo(kloutId, callback) {
    async.parallel([
        function(cb) { getKloutScore(     kloutId, cb) },
        function(cb) { getKloutInfluence( kloutId, cb) },
        function(cb) { getKloutTopics(    kloutId, cb) }
        ],
        function(err, results) {
            if (err) return callback(err)

            var data = {
                score:      results[0],
                influence:  results[1],
                topic:      results[2]
            }

            callback(null, data)
        }
    )
}

//------------------------------------------------------------------------------
function getKloutId(network, user, callback) {
    url = "http://api.klout.com/v2/identity.json"
    
    if (network == "twitter") {
        url += "/twitter?screenName=" + user + "&"
    }
    else if (network == "gp") {
        url += "/gp/" + user + "?"
    }

    url += "key=" + Key

    httpRequest(url, callback)
}

//------------------------------------------------------------------------------
function getKloutScore(kloutId, callback) {
    url = "http://api.klout.com/v2/user.json/" + kloutId + "/score?"
    url += "key=" + Key

    httpRequest(url, callback)
}

//------------------------------------------------------------------------------
function getKloutInfluence(kloutId, callback) {
    url = "http://api.klout.com/v2/user.json/" + kloutId + "/influence?"
    url += "key=" + Key

    httpRequest(url, callback)
}

//------------------------------------------------------------------------------
function getKloutTopics(kloutId, callback) {
    url = "http://api.klout.com/v2/user.json/" + kloutId + "/topics?"
    url += "key=" + Key

    httpRequest(url, callback)
}

//------------------------------------------------------------------------------
function httpRequest(url, callback) {
    callback = utils.onlyCallOnce(callback)

    // utils.log("httpRequest(" + url + ")")
    var options = URL.parse(url)
    var request = http.get(options, function(response) {
        handleHttpGet(response, callback)
    })
    
    request.on("error", function(err) {
        callback({statusCode: 500, message: err})
    })

    request.end()
}

//------------------------------------------------------------------------------
function handleHttpGet(response, callback) {
    response.setEncoding("utf8")

    var body = ""

    response.on("data", function (chunk) {
        body += chunk
    })

    response.on("end", function (chunk) {
        if (chunk) {
            body += chunk
        }

        if (response.statusCode != 200) {
            callback({statusCode: response.statusCode, message: body})
            return
        }

        try {
            body = JSON.parse(body)
        }
        catch (err) {
            callback({statusCode: response.statusCode, message: err})
            return
        }

        callback(null, body)
    })
}

/*-------------------------------------------------------------------*/
/*                                                                   */
/* Copyright IBM Corp. 2013 All Rights Reserved                      */
/*                                                                   */
/*-------------------------------------------------------------------*/
/*                                                                   */
/*        NOTICE TO USERS OF THE SOURCE CODE EXAMPLES                */
/*                                                                   */
/* The source code examples provided by IBM are only intended to     */
/* assist in the development of a working software program.          */
/*                                                                   */
/* International Business Machines Corporation provides the source   */
/* code examples, both individually and as one or more groups,       */
/* "as is" without warranty of any kind, either expressed or         */
/* implied, including, but not limited to the warranty of            */
/* non-infringement and the implied warranties of merchantability    */
/* and fitness for a particular purpose. The entire risk             */
/* as to the quality and performance of the source code              */
/* examples, both individually and as one or more groups, is with    */
/* you. Should any part of the source code examples prove defective, */
/* you (and not IBM or an authorized dealer) assume the entire cost  */
/* of all necessary servicing, repair or correction.                 */
/*                                                                   */
/* IBM does not warrant that the contents of the source code         */
/* examples, whether individually or as one or more groups, will     */
/* meet your requirements or that the source code examples are       */
/* error-free.                                                       */
/*                                                                   */
/* IBM may make improvements and/or changes in the source code       */
/* examples at any time.                                             */
/*                                                                   */
/* Changes may be made periodically to the information in the        */
/* source code examples; these changes may be reported, for the      */
/* sample code included herein, in new editions of the examples.     */
/*                                                                   */
/* References in the source code examples to IBM products, programs, */
/* or services do not imply that IBM intends to make these           */
/* available in all countries in which IBM operates. Any reference   */
/* to the IBM licensed program in the source code examples is not    */
/* intended to state or imply that IBM's licensed program must be    */
/* used. Any functionally equivalent program may be used.            */
/*-------------------------------------------------------------------*/
