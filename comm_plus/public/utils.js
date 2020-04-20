export function materialFormatFilter(_materialFormats) {
	let materialFormatsDes = ''
	if (_materialFormats.materialConversionGrade === 1) {
		materialFormatsDes = _materialFormats.unitCountThird + _materialFormats.unitNameThird
	} else if (_materialFormats.materialConversionGrade === 2) {
		materialFormatsDes = _materialFormats.unitCountSecond + _materialFormats.unitNameSecond +
			' x ' + _materialFormats.unitCountThird + _materialFormats.unitNameThird
	} else if (_materialFormats.materialConversionGrade === 3) {
		materialFormatsDes = '1 ' + _materialFormats.unitNameFirst +
			' = ' + _materialFormats.unitCountSecond + _materialFormats.unitNameSecond +
			' x ' + _materialFormats.unitCountThird + _materialFormats.unitNameThird
	}
	return materialFormatsDes
}

/*函数防抖*/
export function debounce(fn, interval) {
	var timer;
	var gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
	return function () {
		clearTimeout(timer);
		var context = this;
		var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
		timer = setTimeout(function () {
			fn.call(context, args);
		}, gapTime);
	};
}
