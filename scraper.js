var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var http    = require('http')
var fs      = require('fs');
var path    = require('path');
var app     = express();

var rails_full_url = "http://weblog.rubyonrails.org"
var rails_release_url = rails_full_url + "/releases";

var ruby_news_url = "https://www.ruby-lang.org/en/news";

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

// TODO: Refactor this

app.get('/', function(req, res){

  res.render('home', {
    title: 'Releases',
    items: [
      { title: "Ruby", url: "/ruby"   },
      { title: "Rails", url: "/rails" }
    ]
  });

});
  
app.get('/rails', function(req, res){

  request(rails_release_url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var parsedResults = [];

      $('.entry-title').each(function (i, element){
        var a = $(this).find('a');

        var metadata = {
          title: a.text(),
          url: rails_full_url + a.attr('href')
        };

        parsedResults.push(metadata);
      });

      res.render('list', {
        title: 'Rails',
        items: parsedResults
      });

      // Alternative solution of putting parsed results in a json file and load it.
      // fs.writeFile('output.json', JSON.stringify(parsedResults, null, 4), function(err){
      //   console.log('File successfully written! - Check your project directory for the output.json file');
      // })
    }
  });
});

app.get('/ruby', function(req, res){
  request(ruby_news_url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var parsedResults = [];

      $('.post').each(function (i, element){
        var a = $(this).find('h3 a');

        var metadata = {
          title: a.text(),
          url: ruby_news_url + a.attr('href')
        };

        parsedResults.push(metadata);
      });

      res.render('list', {
        title: 'Ruby',
        items: parsedResults
      });

      // Alternative solution of putting parsed results in a json file and load it.
      // fs.writeFile('output.json', JSON.stringify(parsedResults, null, 4), function(err){
      //   console.log('File successfully written! - Check your project directory for the output.json file');
      // })
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
