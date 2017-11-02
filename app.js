//cargamos el modulo dotenv y lo configuramos para que use nuestras crendenciales
var credentialFile = '';
var indexCounterInitAt = 0;
var workingHours = 0;
if (process.argv.length < 3) {
    console.log('ERROR: Faltan parámetros');
    process.exit(0);
} else {
    credentialFile = process.argv[2];                       //El 2do parametro representa el fichero con las credenciales de Twitter
    indexCounterInitAt = process.argv[3] || 0;              //El 3er parametro representa el indice a partir del cual empezar a publicar tweets
    workingHours = 60 * 60 * process.argv[4] || 10;         //El 4to parametro representa la cantidad de horas que durante las cuales se distribuyen los tweets
    if(process.argv[5] != undefined) {
        tweetDBfile = process.argv[5];         //El 4to parametro representa la cantidad de horas que durante las cuales se distribuyen los tweets
    } else {
        console.log('ERROR: Falta indicar la ruta al fichero con tweets a publicar');
        process.exit(0);
    }
    
    console.log('credentialFile=' + credentialFile + ' indexCounterInitAt=' + indexCounterInitAt + ' and workingHoursInSeconds=' + workingHours);
}

require('dotenv').config({path: credentialFile});
fs = require('fs')
Twit = require('twit');

TWEETS_DB_FILE = tweetDBfile;
//TWEETS_DB_FILE = 'tweetsDB_TEST.txt';

//Definimos un objeto JSON con las credenciales de nuestra Twiiter App las cuales son necesarias 
//para que el modulo Twit pueda trabajar
var config = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
};

//Instanciamos la libreria de Twit y la configuramos con las credenciales de nuestra Twiiter App
var T = new Twit(config);
var tweetsDB = [];
var indexCounter = indexCounterInitAt;

//Definimos una función para leer el fichero TWEETS_DB_FILE que contiene los Tweets linea a linea
//donde cada linea representa un Tweet
function readTweetsFile() {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(TWEETS_DB_FILE)
      });
      
      lineReader.on('line', function (line) {
        //console.log('Line from file:', line);
        tweetsDB.push(line);
      });
      
      lineReader.on('close', function(evt){
          console.log('Number of Tweets read ' + tweetsDB.length);
          var nTweetsToPost = tweetsDB.length - indexCounter;
          var interval = workingHours / nTweetsToPost;
          console.log(nTweetsToPost + ' Tweets to be posted every ' + interval + ' seconds' );
          startScheduleForTweets(interval);
      });
}

readTweetsFile();

//Función que permite buscar tweets que contengan la cadena de carateres especificada en parámetro query
// y limta el resultado a la cantidad especificada en parámetro count
function searchForTweets(query, count) {
    var params = { q: query, count: count };
    T.get('search/tweets', params,searchedData);  
}

// searchedData es una callback functionque se ejecuta cuando cuando hemos obtenido el resultado de la 
//busqueda de tweets realizda con la función searchForTweets
function searchedData(err, data, response) {
    console.log(data);
} 

//Esta función permite ejecuta la función tweetScheduler cada N segundos (interval)
function startScheduleForTweets(interval) {
    setInterval(tweetScheduler, 1000 * interval); // setinterval
}

//Definimos una función que sea capaz de Publciar un Tweet 
function tweetScheduler(){
    var status = tweetsDB[indexCounter];
    var tweet = { status: status };
    T.post('statuses/update', tweet, tweeted);
    function tweeted(err, data, response) {
        if(err){
            console.log('Something went wrong:' + err);
        }else{
            console.log('Voila It worked!');
            indexCounter++;
        }

        if(indexCounter >= tweetsDB.length ){
            console.log('Proceso finalizado!');
            process.exit(0);
        }
    }
}
