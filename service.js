/*  Обертка для запуска сервисных модулей

    Они лежат в каталоге service
    Должны экспортировать функцию run(params)
*/
const MODELS = './models/';
const UTILS = './utils/';

const SRV_MODULES_PATH = '/service/'; // БЕЗ ТОЧКИ в начале!

let mongoose = require('mongoose');
let fs = require('fs');

const config = require('config');
global.__basedir = __dirname;

let tmp;

// process.argv[2] = 'sql_tags_to_mongo_tags'; //переносит таблицу тегов категорий из старой БД в монгу в коллекцию тегов категорий
// process.argv[2] = 'sql_products_to_mongo_products';//переносит таблицу продуктов из старой БД в монгу в коллекцию продуктов 
// process.argv[2] = 'sql_images_to_mongo_images'; //переносит таблицу изображений из старой БД в монгу в коллекцию изображений
// process.argv[2] = 'sql_orders_to_mongo_orders'; //переносит таблицу заказов из старой БД в монгу в коллекцию заказов
// process.argv[2] = 'sql_users_to_mongo_users'; //переносит таблицу пользователей из старой БД в монгу в коллекцию пользователей игнарируя невалидных пользователей 
// process.argv[2] = 'untag_products_description'; //избавляется от тегов в свойстве описания продуктов
// process.argv[2] = 'slugify_tags'; //переводит слаги тегов из кирилицы в латиницу
process.argv[2] = 'sql_delivery_types_to_mongo_delivery_types'; //переносит таблицу типов доставок из старой БД в монгу в коллекцию типов доставок


if (typeof(process.argv[2]) === "undefined") {
    tmp = process.argv[1].split('/');
    let selfFile = tmp[tmp.length - 1];

    console.log('Usage: node ' + selfFile + ' service_module_name [module_params]');

    process.exit(0);
}

// проверяем наличие модуля
let srvModule = SRV_MODULES_PATH + process.argv[2];
let modulePath = __dirname + srvModule + '.js';
try {
    tmp = fs.statSync(modulePath);
} catch (error) {
    console.log('Check module existence is failed: ' + error.message);

    process.exit(0);
}

const RunFn = require('.' + srvModule).run;

// проверяем наличие стартовой функции
let RunFnType = typeof(RunFn);

if (RunFnType !== "function") {
    console.log('Error: ' + process.argv[2] + '.run is not a function: ' + RunFnType);

    process.exit(0);
}

// запускаем запрошенный модуль
let runFnParams = process.argv.slice(3);

let dbConnect = '';
if (
    typeof(config.dbuser) !== 'undefined' &&
    config.dbuser.length > 0 &&

    typeof(config.dbuser_pwd) !== 'undefined' &&
    config.dbuser_pwd.length > 0 &&

    typeof(config.dbhost) !== 'undefined' &&
    config.dbuser_pwd.length > 0
) {
    dbConnect = 'mongodb+srv://' +
        config.dbuser +
        ':' +
        config.dbuser_pwd +
        '@' +
        config.dbhost +
        '/' +
        config.db +
        '?retryWrites=true';
} else {
    dbConnect = config.db;
}

mongoose
    .connect(
        dbConnect, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }
    )
    .then(() => console.log("Connected to MongoDB: " + config.db))
    .catch(e => {
        console.log("Ошибка в коннекте к базе: " + e);
        console.log('NOT connected to MongoDB...');
    });

//mongoose.connect(config.db);
console.log(config.db);
let db = mongoose.connection;

db.on('error', function(err) {
    console.log('connection error:' + err.message);
    process.exit(0);
});

db.once('open', async function() {
    console.log('Running module ' + process.argv[2] + '...');

    await RunFn(runFnParams);

    console.log('Module finished');

    await mongoose.disconnect();
    process.exit(0);
});