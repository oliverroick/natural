var natural = require('natural');
var wordnet = new natural.WordNet();

/**
 *
 */
var getSimilarity = function(str1, str2, callback) {
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
var getShortestPath = function(results) {
	var intersectingPaths = [], shortestPath;
	results.str0.forEach(function(referencePath) {
		referencePath.forEach(function(referenceNode, i) {
			results.str1.forEach(function(comparisonPath) {
				var index = comparisonPath.indexOf(referenceNode);
				if (index != -1) {
					var concatenation = referencePath.slice(0, i + 1).concat(comparisonPath.slice(0, index).reverse()); 
					if (!shortestPath || shortestPath.length > concatenation.length) shortestPath = concatenation;
				}
			});
		});
	});

	return shortestPath;
}

/**
 *
 */
var calculateSimilarity = function(results, callback) {
	var shortestPath = getShortestPath(results);
	
}

module.exports = getSimilarity;