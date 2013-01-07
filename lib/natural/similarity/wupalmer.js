var natural = require('natural');
var wordnet = new natural.WordNet();

/**
 *
 */
var getWuPalmerSimilarity = function(str1, str2, callback) {
	var pending = 2;
	var resultPaths = {};
	[str1, str2].forEach(function(str, i) {
		wordnet.lookup(str, function(results) {
			var startingNodes = [];
			results.forEach(function(result) {
				if (result.pos === 'n') startingNodes.push([result.synsetOffset]);
			});
			wordnet.getPathsToEntity(startingNodes, function(paths) {
				pending--;
				resultPaths['str' + i] = paths;

				if (pending == 0) calculateSimilarity(resultPaths, callback)
			});
		});
	});
};

/**
 *
 */
var calculateSimilarity = function(results, callback) {
	var similarity;

	results.str0.forEach(function(referencePath) {
		referencePath.forEach(function(referenceNode, i) {
			results.str1.forEach(function(comparisonPath) {
				var index = comparisonPath.indexOf(referenceNode);
				if (index != -1) {
					var lengthStr0 = i;
					var lengthStr1 = index;
					var lsoDepth = referencePath.length - lengthStr0;

					var wuPalmer = (2 * lsoDepth) / (lengthStr0 + lengthStr1 + 2 * lsoDepth);

					if (!similarity || wuPalmer > similarity) similarity = wuPalmer;
				}
			});
		});
	});

	callback(similarity);
}

module.exports = getWuPalmerSimilarity;