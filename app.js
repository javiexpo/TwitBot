//cargamos el modulo dotenv y lo configuramos para que use nuestras crendenciales
var credentialFile = '';
var indexCounterInitAt = 0;
if (process.argv.length < 3) {
    console.log('ERROR: Por favor indique el fichero con las credenciales')
    process.exit(1);
} else {
    credentialFile = process.argv[2];
    indexCounterInitAt = process.argv[3] || 0;
    console.log('indexCounterInitAt = ' + indexCounterInitAt);
}

require('dotenv').config({path: credentialFile});
fs = require('fs')
Twit = require('twit');

TWEETS_DB_FILE = 'tweetsDB.txt';
//TWEETS_DB_FILE = 'tweetsDB_TEST.txt';
HOURS_10 = 60 * 60 * 10 * 1000.


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
          var interval = HOURS_10 / nTweetsToPost;
          console.log(nTweetsToPost + ' Tweets to be posted very ' + interval / 1000 + ' seconds' );
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
    if(indexCounter >= tweetsDB.length ){
        console.log('Reiniciamos indexCounter')
        indexCounter = indexCounterInitAt;
        console.log('Proceso finalizado!');
        process.exit(1);
    }
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
    }
}
