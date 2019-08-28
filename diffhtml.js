(function() {
	// doesn't really work due to the UW NetID login screen
	var USE_PROXY = false;
	var PROXY_URL = "proxy.php";
	
	document.observe("dom:loaded", function() {
		// $("output2").hide();
		$("maximizelink").href = "#";
		$("maximizelink").style.position = "absolute";
		$("maximizelink").style.right = "8px";
		$("maximizelink").style.top = "8px";
		$("maximizelink").observe("click", maximizeClick);

		$("compareform").observe("submit", stopEvent);
		$("compare").observe("click", compareClick);
		$("page1").observe("change", compareClick);
		$("page1suggest").observe("change", page1SuggestChange);
		$("page2").observe("change", compareClick);
		$("show1").observe("click", updateOpacity);
		$("show2").observe("click", updateOpacity);
		$("mix12").observe("click", updateOpacity);
		$("output2").observe("load", updateSize);

		if ($("page1").scrollWidth != $("page1suggest").scrollWidth) {
			$("page1suggest").style.width = $("page1").scrollWidth + "px";
		}

		Cookies.makeTextBoxStateful("page1");
		Cookies.makeSelectStateful("page1suggest");
		Cookies.makeTextBoxStateful("page2");
		Cookies.makeTextBoxStateful("uwnetid");
		Cookies.makeRadioButtonStateful("show1");
		Cookies.makeRadioButtonStateful("show2");
		Cookies.makeRadioButtonStateful("mix12");

		$("output2").startingLeft = 0;
		$("output2").startingTop  = 0;
		$("shiftx").observe("change", shiftXValue);
		$("shiftx").observe("input", shiftXValue);
		$("shifty").observe("change", shiftYValue);
		$("shifty").observe("input", shiftYValue);

		doEnabling();

		// show message for Chrome users
		if (navigator.userAgent.match(/Chrome/) || navigator.userAgent.match(/Webkit/) || navigator.userAgent.match(/Internet Explorer/)) {
			browserNotFirefoxError();
			// USE_PROXY = true;
		}

		var zoom = getScreenZoom();
		if (zoom != 1) {
			browserZoomError();
		}

		// auto-display the image if there's already one selected (e.g. after Ctrl-R refresh)
		if ($("page1suggest").value) {
			page1SuggestChange();
		}
	});

	// if the browser is not able to do cross-domain iframes
	function browserNotFirefoxError() {
		$("browsermessagearea").className = "error";
		$("browsermessagearea").innerHTML += " NOTE: This tool may not work on your browser.  We recommend Firefox on Windows.";
		$("compareform").style.top = "40px";
	}

	// if the browser is not able to do cross-domain iframes
	function browserSecurityError() {
		$("browsermessagearea").className = "error";
		$("browsermessagearea").innerHTML += " NOTE: We recommend using Firefox on Windows to match these images most exactly.";
		$("compareform").style.top = "40px";
	}

	// if the browser is not zoomed at 100% (messes up diff)
	function browserZoomError() {
		$("browsermessagearea").className = "error";
		$("browsermessagearea").innerHTML += " Your browser's zoom level is not set to 100%.  Please press Ctrl-0 or unset your zoom and then reload this page.";
		$("compareform").style.top = "40px";
	}

	// http://stackoverflow.com/questions/1713771/how-to-detect-page-zoom-level-in-all-modern-browsers
	function getScreenZoom() {
		var zoomLevel = 1;
		if (navigator.userAgent.match(/Firefox/)) {
			zoomLevel = getScreenZoomFF();
		} else if (navigator.userAgent.match(/WebKit/)) {
			zoomLevel = getScreenZoomWebKit();
		} else if (navigator.userAgent.match(/Internet Explorer/)) {
			zoomLevel = getScreenZoomIE();
		}

		return Math.round(100 * zoomLevel) / 100;
	}

	function getScreenZoomWebKit() {
		var zoomLevel = 1;
		var screenCssPixelRatio = (window.outerWidth - 8) / window.innerWidth;
		if (screenCssPixelRatio < .1) {
			zoomLevel = 0.1;
		} else if (screenCssPixelRatio > 10) {
			zoomLevel = 10;
		} else if (screenCssPixelRatio >= .92 && screenCssPixelRatio <= 1.10) {
			zoomLevel = 1;
		} else {
			zoomLevel = screenCssPixelRatio;
		}
		return zoomLevel;
	}

	function getScreenZoomWebKitOld() {
		return parseFloat(getComputedStyle(document.documentElement,null).width) / document.documentElement.clientWidth;
	}

	function getScreenZoomFF() {
		var mediaQueryMatches = function(property, r) {
			var style = document.getElementById('binarysearch');
			var dummyElement = document.getElementById('dummyelement');
			style.sheet.insertRule('@media (' + property + ':' + r + ') {#dummyelement ' + '{text-decoration: underline} }', 0);
			var matched = getComputedStyle(dummyElement, null).textDecoration == 'underline';
			style.sheet.deleteRule(0);
			return matched;
		};

		var mediaQueryBinarySearch = function(property, unit, a, b, maxIter, epsilon) {
			var mid = (a + b) / 2;
			if (maxIter == 0 || b - a < epsilon) return mid;
			if (mediaQueryMatches(property, mid + unit)) {
				return mediaQueryBinarySearch(property, unit, mid, b, maxIter-1, epsilon);
			} else {
				return mediaQueryBinarySearch(property, unit, a, mid, maxIter-1, epsilon);
			}
		};

		var zoomLevel = 1;
		var mozDevicePixelRatio = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 6000, 25, .0001);
		if (mozDevicePixelRatio) {
			zoomLevel = mozDevicePixelRatio;
		} else {
			var ff35DevicePixelRatio = screen.width / mediaQueryBinarySearch('min-device-width', 'px', 0, 6000, 25, .0001);
			zoomLevel = ff35DevicePixelRatio;
		}

		return zoomLevel;
	}

	function getScreenZoomIE() {
		var zoomLevel = 1;
		if (typeof(screen.deviceXDPI) !== "undefined" && typeof(screen.logicalXDPI) !== "undefined") {
			zoomLevel = screen.deviceXDPI / screen.logicalXDPI;
		} else if (typeof(document.body.getBoundingClientRect) === "function") {
			var body = document.body, r = body.getBoundingClientRect();
			zoomLevel = (r.left - r.right) / body.offsetWidth;
		}
		return zoomLevel;
	}

	function maximizeClick(event) {
		this.siblings().each(function(el) {
			el.toggle();
		});
		return stopEvent(event);
	}

	function page1SuggestChange(event) {
		stopEvent(event);

		$("page1").value = $("page1suggest").value;
		Cookies.statefulSelectChange("page1");

		var opt = $("page1suggest").options[$("page1suggest").selectedIndex];
		if (!opt || !opt.title) {
			return;
		}

		var page2url = "https://webster.cs.washington.edu/USERNAME/" + opt.title;
		var uwnetid = $("uwnetid").value.strip();
		if (uwnetid && uwnetid.match(/[a-zA-Z0-9_]{1,8}/)) {
			page2url = page2url.replace(/USERNAME/, uwnetid);
		}

		$("page2").value = page2url;
		Cookies.statefulSelectChange("page2");
		compareClick(event);

		return false;
	}

	function shiftXValue(event) {
		stopEvent(event);
		var left = parseInt($("output2").startingLeft);
		var shiftXValue = parseInt($("shiftx").value);
		$("output2").style.left = (left + shiftXValue) + "px";
	}

	function shiftYValue(event) {
		stopEvent(event);
		var top = parseInt($("output2").startingTop);
		var shiftYValue = parseInt($("shifty").value);
		$("output2").style.top = (top + shiftYValue) + "px";
	}
		
	function updateOpacity(event) {
		if ($("show1").checked) {
			$("output1").show();
			$("output1").setOpacity(1.0);
			$("output2").hide();
			$("output2").setOpacity(0.0);
		} else if ($("show2").checked) {
			$("output1").hide();
			$("output1").setOpacity(0.0);
			$("output2").show();
			$("output2").setOpacity(1.0);
			updateSize();
		} else {
			// blend
			$("output1").show();
			$("output1").setOpacity(1.0);
			$("output2").show();
			$("output2").setOpacity(0.5);
			updateSize();
		}
	}

	function doEnabling() {
		var disable = !!(!$("page1").value || !$("page2").value);
		$("show1").disabled = disable;
		$("show2").disabled = disable;
		$("mix12").disabled = disable;
		return !disable;
	}

	function compareClick(event) {
		stopEvent(event);
		if (!doEnabling()) {
			return false;
		}

		try {
			$("output1").src = $("page1").value;
			$("output1").alt = "Image file not found: " + $("page1").value;
		} catch (e) {
			browserSecurityError();
		}

		// target the iframe at their page.
		// hack: append a query parameter to it so that it will not cache the
		// page and will instead re-fetch it fresh every time they click Compare
		var page2url = $("page2").value;
		if (page2url.indexOf("?") >= 0) {
			page2url += "&";
		} else {
			page2url += "?";
		}
		page2url += "dontcacheme1=" + new Date().getTime() + "&dontcacheme2=" + Math.random();
		
		if (USE_PROXY) {
			page2url = PROXY_URL + "?url=" + encodeURIComponent(page2url);
		}

		try {
			$("output2").src = page2url;
		} catch (e) {
			browserSecurityError();
		}

		updateOpacity();
		updateSize();
		
		if (typeof(document.body.scrollTo) === "function") {
			document.body.scrollTo(0, 0);
		}
		
		return false;
	}

	// make iframe height match document's actual height
	function updateSize(event) {
		try {
			stopEvent(event);

			// update width
			if ($("output1") && $("output1").width) {
				$("output2").style.width = $("output1").width + "px";
			}

			// update height
			try {
				if (!$("output2")
						|| !$("output2").contentWindow
						|| !$("output2").contentWindow.document
						|| !$("output2").contentWindow.document.body) {
					return;
				}

				var height = $("output2").contentWindow.document.body.scrollHeight;
				$("output2").style.height = (height + 0) + "px";
				if ($("output1").height) {
					// if page taller than image, put padding under image so bottoms match
					// var heightDiff = ((height + 0) - $("output1").height);
					// if (heightDiff >= 0) {
					//	 $("output1").style.paddingBottom = heightDiff + "px";
					// }
				}
			} catch (e) {
				$("output2").style.height = "2048px";
				$("errors").update("Unable to display page at " + $("page2").value + "<br />\n" + e);
				$("errors").show();
				if ($("output1").height && $("output1").height >= 200) {
					$("output2").style.height = $("output1").height + 0 + "px";
				}
			}
		} catch (e) {
			return false;
		}

		return false;
	}

	function stopEvent(event) {
		if (event) {
			event.stop();
			if (typeof(event.stopPropagation) === "function") {
				event.stopPropagation();
			}
		}
		return false;
	}
})();

