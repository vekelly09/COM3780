// CSE 190 M, Homework 9 (Remember the Cow To-Do List)
// Helper script for TA grading

(function() {
	var LIST_JSON_RESET_PAGE = "/cse190m/homework/hw9/reset.php";
	var DEFAULT_PASSWORD = "12345";
	
	// dynamically load the JStep library
	if (typeof(JStep) === "undefined" && 
			(location.search.match(/__grading=(true|on|1|yes)/) || document.cookie.match(/__grading/))) {
		document.write('\n<script type="text/javascript" src="http://www.webstepbook.com/jstep.js"><\/script>\n');
	}
	
	var removeBG = function() {
		document.body.style.backgroundColor = document.body.oldBackgroundColor;
		document.body.removeClassName("fail");
		// $("__gradingmessages").innerHTML = "";
	};
	
	var filterOutGradingElements = function(a) {
		var a2 = [];
		for (var i = 0; i < a.length; i++) {
			var up = a[i].up("#__gradingarea");
			if (!up && a[i] != $("__gradingarea")) {
				a2.push(a[i]);
			}
		}
		return a2;
	};
	
	var $$f = function(str) {
		var elements = $$(str);
		return filterOutGradingElements(elements);
	};
	
	var getUWNetID = function() {
		// location.href = "https://webster.cs.washington.edu/ctrzj/hw9/index.php?__grading=1"
		// location.pathname = "/ctrzj/hw9/index.php"
		return location.pathname.replace(/^\/([^/]+)\/.*$/, "$1");
	};
	
	var tryToLogIn = function(event) {
		tryToLogInHelper(event, DEFAULT_PASSWORD);
	}
	
	var tryToLogInBad = function(event) {
		tryToLogInHelper(event, "booyah");   // wrong password
	}
	
	// try to fill in the user name and given pw and submit the login form
	var tryToLogInHelper = function(event, pw) {
		event.stop();
		removeBG();

		var userNamePw = $$f("input[type='text'], input[type='password']");
		if (userNamePw.length < 2) {
			alert("I can't find two text fields on the page.  Aborting.");
			return false;
		}
		var submitButton = $$f("input[type='submit']")[0];
		if (!submitButton) {
			submitButton = $$f("button, input[type='button']")[0];
		}
		
		var uwnetid = getUWNetID();
		userNamePw[0].value = uwnetid;
		userNamePw[0].simulate("change");
		userNamePw[1].value = pw;
		userNamePw[1].simulate("change");
		if (submitButton) {
			submitButton.simulate("click");
		}
	};
	
	var logIn400Error = function(event) {
		event.stop();
		removeBG();
		
		new Ajax.Request("login.php", {
			method: "post",
			parameters: {},     // no user name / pw!
			
			onSuccess: function(ajax) {
				JStep.Test.fail("POST to login.php without username / pw is supposed to emit HTTP error 400, but student's file returned HTTP 200 OK.  This is incorrect.");
				JStep.Test.showResults();
			},
			
			onFailure: function(ajax) {
				JStep.Test.assertEquals(400, ajax.status, "Ajax request HTTP result code");
				JStep.Test.showResults();
			},
			
			onException: function(ajax) {
				// JStep.Test.fail("Ajax request to login.php without user name / pw should not throw an exception.");
				// JStep.Test.showResults();
			}
		});
	}
	
	var webService400Error = function(event) {
		event.stop();
		removeBG();
		
		new Ajax.Request("webservice.php", {
			method: "post",
			parameters: {},     // no JSON data!
			
			onSuccess: function(ajax) {
				JStep.Test.fail("Ajax POST to webservice.php without any JSON data should not be successful!");
				JStep.Test.showResults();
			},
			
			onFailure: function(ajax) {
				JStep.Test.assertEquals(400, ajax.status, "Ajax request HTTP result code");
				JStep.Test.showResults();
			},
			
			onException: function(ajax) {
				// JStep.Test.fail("Ajax request to login.php without user name / pw should not throw an exception.");
				// JStep.Test.showResults();
			}
		});
	}
	
	var tryToAddItemHelper = function(event, text) {
		event.stop();
		removeBG();

		var textbox = $$f("input[type='text'], input[type=''], textarea")[0];
		if (!textbox) {
			alert("I can't find a text box on the page.  Aborting.");
			return false;
		}

		var addDelButtons = $$f("button, input[type='button'], input[type='submit']");
		if (addDelButtons.length < 1) {
			alert("I can't find an Add button on the page.  Aborting.");
			return false;
		}
		
		textbox.value = text;
		addDelButtons[0].simulate("click");
	};

	var getPath = function() {
		var path = location.href;
		path = path.replace(/\/[^\/]+\.php/, "/");      // remove *.php filename
		path = path.replace(/[?].*$/, "");              // remove query string
		return path;
	};
	
	// redirects to user's logout.php page
	var tryToLogOut = function(event) {
		location.href = getPath() + "logout.php";
	};
	
	// forcefully delete PHP session cookie (logs the user out)
	var nukeSession = function(event) {
		JStep.Cookie.remove("PHPSESSID");
	};
	
	var gotoPage = function(event) {
		var page = this.innerHTML.trim().replace(/Go to /gi, "");
		location.href = getPath() + page + "?__fail=1";
	};

	// forcefully delete student's list.json file and replace with a blank one
	var nukeListJson = function(event) {
		new Ajax.Request(LIST_JSON_RESET_PAGE, {
			method: "post",
			parameters: {"uwnetid": getUWNetID()},
			
			onSuccess: function(ajax) {
				location.reload();
			},
			
			onFailure: function(ajax) {
				JStep.Test.fail("Ajax request to nuke list.json failed: HTTP result code " + ajax.status + ":\n\n" + ajax.responseText);
				JStep.Test.showResults();
			},
			
			onException: function(ajax) {
				// JStep.Test.fail("Ajax request to login.php without user name / pw should not throw an exception.");
				// JStep.Test.showResults();
			}
		});
	};

	// forcefully replace student's list.json file with some pre-defined contents
	var prefillListJson = function(event) {
		new Ajax.Request(LIST_JSON_RESET_PAGE, {
			method: "post",
			parameters: {"uwnetid": getUWNetID(), "prefill": "true"},
			
			onSuccess: function(ajax) {
				location.reload();
			},
			
			onFailure: function(ajax) {
				JStep.Test.fail("Ajax request to prefill list.json failed: HTTP result code " + ajax.status + ":\n\n" + ajax.responseText);
				JStep.Test.showResults();
			},
			
			onException: function(ajax) {
				// JStep.Test.fail("Ajax request to login.php without user name / pw should not throw an exception.");
				// JStep.Test.showResults();
			}
		});
	};

	var checkAppearance = function(event) {
		event.stop();
		removeBG();

		var fonts = {"Arial, Helvetica, sans-serif": true, "Arial,Helvetica,sans-serif": true, "Arial": true};
		var topBottomBars = $$f("div.headfoot");
		if (topBottomBars.length < 2) {
			// maybe they didn't use my headfoot class
			topBottomBars = $$f("body > div");
			if (topBottomBars.length > 2) {
				topBottomBars = [topBottomBars[0], topBottomBars[1]];
			}
		}
		
		if (topBottomBars.length >= 2) {
			JStep.Test.assertStyle(topBottomBars, "font-family", fonts);
			JStep.Test.assertStyle(topBottomBars, "font-size", {"19px": true, "14pt": true});
			JStep.Test.assertStyle(topBottomBars, "background-color", {"#005AB4": true, "#005ab4": true, "rgb(0, 90, 180)": true,  "rgb(0,90,180)": true});
			JStep.Test.assertStyle(topBottomBars, "color", {"white": true, "#FFFFFF": true, "#ffffff": true, "#FFF": true, "#fff": true, "rgb(255, 255, 255)": true,  "rgb(255,255,255)": true});
			JStep.Test.assertStyle(topBottomBars, "padding-left", {"9px": true, "0.5em": true, ".5em": true});
			JStep.Test.assertStyle(topBottomBars, "padding-right", {"9px": true, "0.5em": true, ".5em": true});
			JStep.Test.assertStyle(topBottomBars, "padding-top", {"9px": true, "0.5em": true, ".5em": true});
			JStep.Test.assertStyle(topBottomBars, "padding-bottom", {"9px": true, "0.5em": true, ".5em": true});
		}
		
		var h1s = $$f("h1");
		JStep.Test.assertStyle(h1s, "font-family", fonts);
		JStep.Test.assertStyle(h1s, "font-size", {"37px": true, "28pt": true});
		
		var h1_imgs = $$f("h1 img");
		JStep.Test.assertStyle(h1_imgs, "float", "left", "cow logo image within h1 header");
		
		var linkImages = topBottomBars[topBottomBars.length - 1].select("a img");
		JStep.Test.assert(linkImages.length >= 3, "bottom bar should have three images in bottom-right that link to validators");
		
		// assume that the 3 validator links are the last three links on the page
		var aTags = $A($$f("a"));
		// if (aTags[0].href.match(/logout\.php/)) {
		while (aTags.length > 3) {
			aTags.shift();   // remove first log out link on todolist.php
		}
		JStep.Test.assertAttribute(aTags, "href", [
			"https://webster.cs.washington.edu/validate-html.php",
			"https://webster.cs.washington.edu/validate-css.php",
			"https://webster.cs.washington.edu/jslint/?referer"], true);
		
		JStep.Test.showResults();
	};
	
	document.observe("dom:loaded", function() {
		// only continue if the "grading" query param or cookie is set to a truthy value
		if (typeof($_REQUEST) === "undefined" ||
				(!$_REQUEST["__grading"] || $_REQUEST["__grading"] == "off" || $_REQUEST["__grading"] == "0" || $_REQUEST["__grading"] == "no") && !JStep.Cookie.get("__grading")) {
			return;
		}
		if ($_REQUEST["__grading"] && ($_REQUEST["__grading"] == "on" || $_REQUEST["__grading"] == "1" || $_REQUEST["__grading"] == "yes") && !JStep.Cookie.exists("__grading")) {
			JStep.Cookie.set("__grading", "true", 2);
		} else if ($_REQUEST["__grading"] && ($_REQUEST["__grading"] == "off" || $_REQUEST["__grading"] == "0" || $_REQUEST["__grading"] == "no") && JStep.Cookie.exists("__grading")) {
			JStep.Cookie.remove("__grading");
			return;
		}
		
		document.body.oldBackgroundColor = document.body.getStyle("backgroundColor");

		var fieldset = $(document.createElement("fieldset"));
		fieldset.id = "__gradingarea";
		fieldset.style.position = "fixed";
		fieldset.style.right = "5px";
		fieldset.style.top = "5px";
		fieldset.style.backgroundColor = "white";
		fieldset.style.borderRadius = "8px";
		fieldset.style.fontFamily = "sans-serif";
		fieldset.style.fontSize = "11pt";
		fieldset.style.fontWeight = "11pt";
		fieldset.style.zIndex = 999999;
		
		var legend = $(document.createElement("legend"));
		legend.innerHTML = "TA Grading";
		legend.style.backgroundColor = "white";
		legend.style.border = "5px solid black";
		legend.style.padding = "3px 6px";
		legend.style.borderRadius = "8px";
		legend.style.fontFamily = "sans-serif";
		legend.style.fontSize = "11pt";
		legend.style.fontWeight = "11pt";
		fieldset.appendChild(legend);
		
		var makeButton = function(text, onclick, pad) {
			var butt = $(document.createElement("button"));
			butt.value = text;
			butt.innerHTML = text;
			butt.style.minWidth = "12em";
			butt.style.fontFamily = "sans-serif";
			butt.style.fontSize = "11pt";
			butt.style.fontWeight = "normal";
			butt.style.paddingTop = "4px";
			butt.style.paddingBottom = "4px";
			
			if (pad) {
				butt.style.marginTop = "10px";
			}
			
			butt.observe("click", onclick);
			
			var div = $(document.createElement("div"));
			div.appendChild(butt);
			fieldset.appendChild(div);
		};
		
		if (location.pathname.match(/todolist\.php/i)) {
			var todolistDiv = $(document.createElement("div"));
			todolistDiv.innerHTML = "todolist.php:";
			todolistDiv.style.marginTop = "10px";
			fieldset.appendChild(todolistDiv);
			makeButton("Appearance", checkAppearance);
			var itemCount = 1;
			makeButton("Add Item #X", function(event) {
				tryToAddItemHelper(event, "GRADER Item #" + itemCount);
				itemCount++;
			});
			makeButton("Add Item w/ HTML", function(event) {
				tryToAddItemHelper(event, "You should see the tags and &s: <b>bye</b> lol &hearts; && <i>yay</i>");
			});
			makeButton("Log Out", tryToLogOut);
			makeButton("Nuke Session", nukeSession);
			makeButton("Go to index.php", gotoPage);

			var webserviceDiv = $(document.createElement("div"));
			webserviceDiv.innerHTML = "webservice.php:";
			webserviceDiv.style.marginTop = "10px";
			fieldset.appendChild(webserviceDiv);
			makeButton("Prefill list.json", prefillListJson);
			makeButton("Nuke list.json", nukeListJson);
			makeButton("Webservice 400 Error", webService400Error);
		} else {  // (location.pathname.match(/index\.php/i))
			var indexDiv = $(document.createElement("div"));
			indexDiv.innerHTML = "index.php:";
			fieldset.appendChild(indexDiv);
			makeButton("Appearance", checkAppearance);
			makeButton("Log In Bad PW", tryToLogInBad);
			makeButton("Log In 400 Error", logIn400Error);
			makeButton("Log In", tryToLogIn);
			makeButton("Go to todolist.php", gotoPage);
		}

		document.body.appendChild(fieldset);
		
		if (location.search.match(/__fail/)) {
			// redirect failed
			JStep.Test.fail("Page should not allow me to go to this page in this login state!");
			JStep.Test.showResults();
		}
	});
})();
