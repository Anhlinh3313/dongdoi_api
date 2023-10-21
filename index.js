const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();
const morgan = require('morgan');
var cors = require('cors');
const app = express();
app.use(morgan('combined'));
app.use(cors());
app.options('*', cors());

const port = process.env.PORT;
const userRoute = require('./api/routes/authentication/userRoute');
const roleRoute = require('./api/routes/authentication/roleRoute');
const actionRoute = require('./api/routes/authentication/actionRoute');
const roleActionRoute = require('./api/routes/authentication/roleActionRoute');
const menuRoute = require('./api/routes/menuRoute');
const postRoute = require('./api/routes/postRoute');
const slideRoute = require('./api/routes/slideRoute');
const bankRoute = require('./api/routes/bankRoute');
const accountBankRoute = require('./api/routes/accountBankRoute');
const bannerSlidesRoute = require('./api/routes/bannerSlidesRoute');
const thumbnailRoute = require('./api/routes/thumbnailRoute');
const transactionRoute = require('./api/routes/transactionRoute');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//import routes
app.use('/api/user', userRoute);
app.use('/api/role', roleRoute);
app.use('/api/action', actionRoute);
app.use('/api/roleaction', roleActionRoute);
app.use('/api/menu', menuRoute);
app.use('/api/post', postRoute);
app.use('/api/slide', slideRoute);
app.use('/api/bank', bankRoute);
app.use('/api/accountBank', accountBankRoute);
app.use('/api/bannerSildes', bannerSlidesRoute);
app.use('/api/thumbnail', thumbnailRoute);
app.use('/api/transaction', transactionRoute);

app.listen(port, (req, res) => {
    console.log('server listening on port ' + port);
});