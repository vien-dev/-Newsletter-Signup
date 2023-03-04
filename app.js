const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const port = 3000;

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;

    var subscriptionData = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(subscriptionData);
    
    var dc = process.env.SERVER;
    var apiKey = process.env.API_KEY;
    var listId = process.env.LIST_ID;
    var url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}`

    var options = {
        method: "POST",
        auth: `anystring:${apiKey}`
    }

    var clientReq = https.request(url, options, (subscriptionRes) => {
        subscriptionRes.on("data", (data) => {
            var serverFeedback = JSON.parse(data);

            if (subscriptionRes.statusCode === 200) {
                //res.send("Successfully subscribed!");
                res.sendFile(`${__dirname}/success.html`);
            } else {
                //res.send(`[${serverFeedback.status}: ${serverFeedback.title}] ${serverFeedback.detail}`);
                res.sendFile(`${__dirname}/failure.html`);
            }
        })
    }).on("error", (err) => {
        console.log(err);
    });

    clientReq.write(jsonData);
    clientReq.end();
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.post("/success", (req, res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}.`);
})
