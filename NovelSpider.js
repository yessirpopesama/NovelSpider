/**
 * NovelSpider的爬虫模块
 */
var http = require('http');
var config = require('./Config');
var strategy = require('./SpiderStrategy');
var fs = require('fs');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var cheerio = require('cheerio');

/*
 * @private 
 * 写入我们所需要的文件
 */
function writeIntoFile(data) {
  fs.writeFile('output.txt', data, function(err) {
    if (err) return err.stack;
    console.log('File write done!');
  });
}

/**
 * @private 
 * 获取页面的正文内容
 */
function getWebsiteContent(buffer, objName) {
  //处理特殊编码
  var encoding = 'utf-8';
  if (objName === 'shubao') {
    encoding = 'GBK';
  }
  var contentStr = iconv.decode(buffer.toBuffer(), encoding);
  // 回调的方式获取策略结果
  strategy.findStrategy(contentStr, objName, function(content) {
    // 获取目标爬虫结果
    if (content) {
      contentStr = content;
      //写入文件
      writeIntoFile(contentStr);
    } else {
      console.log('Content spider failed!!!');
    }
  });
}

exports.createSpiderServer = function(targetName) {
  // 根据target点查看是否存在爬虫策略
  var findFlag = false;
  config.forEach(function(object) {
    var objName = object.targetName;
    if (objName === targetName) {
      console.log('Spider Strategy ready');
      findFlag = true;
      //获取页面buffer数据
      http.get(object.url, function(res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
          bufferHelper.concat(chunk);
        });
        res.on('end', function() {
          getWebsiteContent(bufferHelper, objName);
        });
      })
    }
  });
  //没有找到爬虫策略
  if (!findFlag) {
    console.log('Spider Strategy Not Found!!!! owo');
  }
}