var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var http    = require('http')
var fs      = require('fs');
var path    = require('path');
var app     = express();

var site_release_url = "http://weblog.rubyonrails.org/releases";
var site_full_url = "http://weblog.rubyonrails.org"

app.configure(function(){
  app.set('port', process.env.PORT || 3003);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'views')));
});

app.get('/', function(req, res){

  request(site_release_url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var parsedResults = [];

      $('.entry-title').each(function (i, element){
        var a = $(this).find('a');

        var metadata = {
          title: a.text(),
          url: site_full_url + a.attr('href')
        };

        parsedResults.push(metadata);
      });

      // Alternative solution of putting parsed results in a json file and load it.
      // fs.writeFile('output.json', JSON.stringify(parsedResults, null, 4), function(err){
      //   console.log('File successfully written! - Check your project directory for the output.json file');
      // })

      res.render('list', {
        title: 'Release Me',
        items: parsedResults
      });
    }
  });

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
