var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');
var xml = require('xml');

var requestNoEncoding = require('request').defaults({ encoding: null });

/* GET home page. */
router.get('/', function(req, res, next) {

  request('https://www.infowars.com/category/featured-stories/', function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var RawThumbnailArticles = [];
      var RawNonThumbnailArticles = [];
      $('.articles-wrap article').each(function(i, elem){
        var element = $(this);
        if(element.find('.thumbnail').length == 1){
          RawThumbnailArticles.push(element);
        }
        else {
          RawNonThumbnailArticles.push(element);
        }
      });

      var ArticlesWithoutThumbnails = [];
      //for each one with a thumbnail
      for(i=0;i<RawThumbnailArticles.length;i++){
        var $ThumbnailArticle = cheerio.load(RawThumbnailArticles[i].html());
        var Title = $ThumbnailArticle('.article-content h3 a').text();
        var Subtitle = $ThumbnailArticle('.article-content .entry-subtitle').text();
        var Category = $ThumbnailArticle('.article-content .category-name').text();
        var ArticleURL = $ThumbnailArticle('.article-content h3 a').attr('href');

        var ArticleData = {
          Title: Title,
          Subtitle: Subtitle,
          Category: Category,
          ArticleURL: ArticleURL
        }
        ArticlesWithoutThumbnails.push(ArticleData);
      }

      var ArticlesWithThumbnails = [];
      //for each one with a thumbnail
      for(i=0;i<RawThumbnailArticles.length;i++){
        var $ThumbnailArticle = cheerio.load(RawThumbnailArticles[i].html());
        var Title = $ThumbnailArticle('.article-content h3 a').text();
        var Subtitle = $ThumbnailArticle('.article-content .entry-subtitle').text();
        var Category = $ThumbnailArticle('.article-content .category-name').text();
        var ArticleURL = $ThumbnailArticle('.article-content h3 a').attr('href');
        var ThumbnailImageURLSmall = $ThumbnailArticle('.thumbnail a img').attr('data-cfsrc');
        var ThumbnailImageURLFull = ThumbnailImageURLSmall.slice(0,-12) + '.jpg';

        var ArticleData = {
          Title: Title,
          Subtitle: Subtitle,
          Category: Category,
          ArticleURL: ArticleURL,
          ThumbnailImage: ThumbnailImageURLFull
        }
        ArticlesWithThumbnails.push(ArticleData);
      }

      var Articles = { WithThumbnails: ArticlesWithThumbnails, WithoutThumbnails: ArticlesWithoutThumbnails };
      var ArticlesString = JSON.stringify(Articles).replace('\n', '');
      res.json(Articles);
    }
  });

});

module.exports = router;
