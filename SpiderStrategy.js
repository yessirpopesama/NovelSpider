/**
 * 爬虫抓取的策略文件， 根据不同网站类型进行解析
 */
var cheerio = require('cheerio');
var http = require('http');
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');

//书宝的抓取策略
function method_shubao(content) {
	var $ = cheerio.load(content);
	return $('#view_content_txt').text().trim();
}

//起点的抓取策略有些不同，需要解析web源代码中包含txt文件的url，再通过http访问获取里面的内容
function method_qidian(content) {
	var re = /(http[s]?:\/\/.*?\.(txt))/gi;
	return content.match(re);
}

exports.findStrategy = function(content, targetName, callback) {
	if (targetName === 'shubao') {
		callback(method_shubao(content));
	}
	if (targetName === 'qidian') {
		var finalContent;
		var targetUrl = method_qidian(content).toString().trim();
		http.get(targetUrl, function(res) {
			var bufferHelper = new BufferHelper();
			res.on('data', function(chunk) {
				bufferHelper.concat(chunk);
			});
			res.on('end', function() {
				callback(iconv.decode(bufferHelper.toBuffer(), 'gb2312'));
			});
		});
	}
}