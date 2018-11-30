'use strict';

//Packages
var twit = require("twit")
var mysql = require('mysql');
//twithandles are the twitter handles which the program scans (User Defined)
var handleHandler = require("./TwitterHandles")
var twitHandles = handleHandler.handles();

//Object
function tweet() {
    //Initializer
    this.user = 0;
    this.data = 0;
    this.upDate = 0;
    this.keep = 1;

    //Print to log and upload to table
    this.log = function () {
        if (this.keep) {
            console.log(this.upDate + " " + this.user + ":\n " + this.data);
            var sql = "INSERT INTO `data`(`Name`, `Date`, `Data`,`Origin`) VALUES ('" + this.user + "', '" + this.upDate + "', '" + this.data +"','Twitter')";
            if (this.data != "") {
                con.query(sql, function (err, result) {
                    //if (err) throw err;
                    console.log("1 record inserted");
                })
            }
        }
    }

    //Parse tweet for wanted information
    this.parse = function (rawData) {
        //initialize tweet data
        this.data = rawData.text;
        this.upDate = rawData.created_at;
        this.user = rawData.user.name;

        //format date
        var tempDate = this.upDate.split(" ");
        this.upDate = tempDate[1] + " ";
        this.upDate += tempDate[2] + " " + tempDate[5];

        //Data Format
        var splitData = this.data.split(" ");
        //Case of a retweet
        if (splitData[0] == "RT") {
            var temp = splitData[1].split("");
            temp.shift();
            temp.pop();
            this.user = temp.join('');

            splitData.shift();
            splitData.shift();
        }
        //Case of a mention
        else if (splitData[0][0] == '@') {
            this.keep = 0;
        }
        //Get rid of URLs
        for (var i = 0; i < splitData.length; i++) {
            if (splitData[i].length >= 13) {
                if (splitData[i].substr(0, 13) == "https://t.co/") {
                    var removers = splitData.length  - i;
                    while (removers > 0) {
                        splitData.pop();
                        removers--;
                    }
                }
            }
        }
        
        //Pull data back together
        this.data = splitData.join(' ');
        
    }
}

//Array of tweet objects
var tweets = [];
var curTweet = 0;

//read tweets
function tempDisplay (data) {
    for (var i = 0; i < data.length; i++) {
        tweets.push(new tweet());
        tweets[curTweet].parse(data[i]);
        
        if (tweets[curTweet].keep == 0) {
            tweets.pop();
        } else {
            console.log("Tweet: " + curTweet);
            tweets[curTweet].log();
            curTweet++;
        }
    }
}



//MYSQL credentials
var con = mysql.createConnection({
    host: "***mysqlhost***",
    user: "***mysqluser***",
    password: "***mysqlpass***",
    database: "***mysqldatabase***"
});

//Twitter credentials
var T = new twit({
    consumer_key: '***consumer key***',
    consumer_secret: '***secret***',
    access_token: '***access token***',
    access_token_secret: '***access secret***'
})


   

    
    
  
function main() {
    console.log('Start:');
    //connect to database
    con.connect(function (err) {
        if (err) console.log(err);
    })

    //Access tweets for all twitter handles
    for (var i = 0; i < twitHandles.length; i++) {
        T.get('statuses/user_timeline', { screen_name: twitHandles[i], count: 25 }, function (err, data, response) {
            tempDisplay(data) //Function callback goes here
        })
    }
    
    
}

//Run main
main()
