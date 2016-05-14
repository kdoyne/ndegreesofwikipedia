
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var cheerio = require('cheerio');
var start = process.argv[2];
var end = process.argv[3];
var count = 0;

console.log(start);
console.log(end);

function processTitle(title) {
  return title.replace(' ', '_');
}

function verifyLink(link) {
  if (!link.attribs.title) {
    return false;
  } 
  if (link.attribs.title.indexOf('wiktionary') !== -1) {
    return false;
  }
  if (link.attribs.title.indexOf('wikt') !== -1) {
    return false;
  }
  if (link.attribs.title.indexOf('disambiguation') !== -1) {
    return false;
  }
  if (link.attribs.href.indexOf('upload') !== -1) {
    return false;
  }
  if (link.attribs.href.indexOf(':') !== -1) {
    return false;
  }
  if (link.attribs.class === 'mw-redirect') {
    return false;
  }
  return true;
}

function getValidLink(links) {
  var index = Math.floor(Math.random() * (3 - 0));
  var returnVal;

  function check() {
    if (verifyLink(links[index])) {
      returnVal = links[index];
    } else {
      if (index < links.length + 1) {
        ++index;
        check();
      } else {
        return 'this is broke';
      }
    }
  }
  
  check();

  return returnVal;
}

function getPageLink(href) {
  return request({
    method: 'GET',
    url: 'https://en.wikipedia.org' + href
  }).then(function(response) {
    var $ = cheerio.load(response.body);
    var links = $('#mw-content-text p a');
    var nextArticle;
    var nextArticleTitle;

    nextArticle = getValidLink(links);
    nextArticleTitle = nextArticle.attribs.title;

    if (nextArticleTitle.toLowerCase() !== end.toLowerCase().replace('_', ' ')) {
      console.log(nextArticleTitle);
      console.log(count);
      ++count;
      getPageLink(nextArticle.attribs.href);
    } else {
      console.log(count);
      return;
    }
  });
}

getPageLink('/wiki/' + processTitle(start));

