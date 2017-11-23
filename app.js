// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
//
// // var index = require('./routes/index');
// // var users = require('./routes/users');
//
// var routes = require('./routes/index');
//
// var app = express();
//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//
// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// //设置静态文件目录
// app.use(express.static(path.join(__dirname, 'public')));
//
// // app.use('/', index);
// // app.use('/users', users);
//
// routes(app);
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
//
// module.exports = app;


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var session = require('express-session');
//创建mongo和session回话机制
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// secret:一个String类型的字符串，作为服务器端生成session的签名。
// name:返回客户端的key的名称，默认为connect.sid,也可以自己设置。
// resave:(是否允许)当客户端并行发送多个请求时，其中一个请求在另一个请求结束时对session进行修改覆盖并保存。
//
// 默认为true。但是(后续版本)有可能默认失效，所以最好手动添加。
//
// saveUninitialized:初始化session时是否保存到存储。默认为true， 但是(后续版本)有可能默认失效，所以最好手动添加。
//
// cookie:设置返回到前端key的属性，默认值为{ path: ‘/’, httpOnly: true, secure: false, maxAge: null }。
//
//     express-session的一些方法:
//
//     Session.destroy():删除session，当检测到客户端关闭时调用。
//
// Session.reload():当session有修改时，刷新session。
//
// Session.regenerate()：将已有session初始化。
//
// Session.save()：保存session。
app.use(session({
    name: "blog",// 设置 cookie 中保存 session id 的字段名称
    secret: "blog",// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {maxAge: 6000000},// 过期时间，过期后 cookie 中的 session id 自动删除
    store:new MongoStore({url:'mongodb://localhost/mongodb'}),//将session储存到mongodb中
    resave: false,
    saveUninitialized: true
}));

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
app.use("/lib",express.static(path.join(__dirname, 'node_modules')));

//flash
app.use(flash());
//设置flash
app.use(function(req, res, next){
    res.locals.user = req.session.user;//设置整站全局变量，一般存放用户全局信息，session和一些整站配置变量
    res.locals.error = req.flash('error') || "";
    res.locals.success = req.flash('success') || "";
    next();
});
// 设置路由
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);//对于相同的挂载路径可以挂载多个中间件，因为路径的相同，调用next的时候会自动执行下一个匹配相同路径的中间件
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('post'),function(){
    console.log("Express server listening on port: " + 3000);
});

module.exports = app;