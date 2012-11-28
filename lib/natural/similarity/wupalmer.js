var natural = require('natural');
var wordnet = new natural.WordNet();

/**
 *
 */
var getNodes = function(str) {
	wordnet.lookup(str, function(results) {
		results.forEach(function(result) {
			if (result.pos === 'n') {
				console.log(str + ': ' + result.lemma);
			}
		});
	});
}


/**
 *
 */
var getSimilarity = function(str1, str2) {
	var str1Nodes = getNodes(str1);
	var str2Nodes = getNodes(str2);
};

module.exports = getSimilarity;