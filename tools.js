function getStringsBetween(subject, str1, str2, inclusive) {
	if (inclusive == null) inclusive = false;

	var found = [],
	rxp = new RegExp(str1+'(.*?)'+str2, 'g'),
	curMatch;

	while( curMatch = rxp.exec( subject ) ) {
		found.push( curMatch[inclusive ? 0 : 1] );
	}

	return found;
}

function extendd(obj1, obj2) {
	for (var k in obj2) {
		obj1[k] = obj2[k];
	}
}

function capitaliseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

exports.getStringsBetween = getStringsBetween;
exports.extend = extendd;
exports.capitaliseFirstLetter = capitaliseFirstLetter;