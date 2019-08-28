/**
 * Cookies utility class by Marty Stepp
 * Relies on Prototype framework being loaded on the current page.
 */


/** Cookie class stores things related to cookies. */
function Cookies() {}

/** Returns true if a cookie exists with the given name. */
Cookies.exists = function(name) {
    return Cookies.get(name) !== null;
};

/** Returns the value of the cookie with the given name (null if not found). */
Cookies.get = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
};

/** Turns the given checkbox into one that will remember its checked-ness,
 *  using a client-side cookie with the given name.
 */
Cookies.makeCheckboxStateful = function(element, cookieName, expiration) {
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    
    element.cookieName = cookieName;
    if (Cookies.exists(cookieName) && !element.disabled) {
        var shouldBeChecked = (Cookies.get(cookieName) == "true");
        if (element.checked != shouldBeChecked) {
            if (element.onclick) {
                element.onclick();
            }
            if (element.onchange) {
                element.onchange();
            }
            element.checked = shouldBeChecked;
        }
    }
    element.observe("change", function(event) {
        Cookies.statefulCheckboxChange(element, cookieName, expiration);
    });
};

/** Turns the given radio into one that will remember its checked-ness,
 *  using a client-side cookie with the given name.
 *  Will also uncheck other radio buttons in the same name group.
 */
Cookies.makeRadioButtonStateful = function(element, cookieName, expiration) {
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    
    element.cookieName = cookieName;
    if (Cookies.exists(cookieName)) {
        var shouldBeChecked = (Cookies.get(cookieName) == "true");
        if (element.checked != shouldBeChecked) {
            if (!element.disabled) {
                if (element.onclick) {
                    element.onclick();
                }
                if (element.onchange) {
                    element.onchange();
                }
            }
            element.checked = shouldBeChecked;
        }
    }

    if (!element.disabled) {
        element.observe("change", function(event) {
            Cookies.statefulRadioButtonChange(element, cookieName, expiration);
        });
    }
};

/** Turns the given select box into one that will remember its selected value,
 *  using a client-side cookie with the given name.
 */
Cookies.makeSelectStateful = function(element, cookieName, expiration) {
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    
    element.cookieName = cookieName;
    if (Cookies.exists(cookieName)) {
        element.value = Cookies.get(cookieName);
    }
    element.observe("change", function(event) {
        Cookies.statefulSelectChange(element, cookieName, expiration);
    });
};

/** Turns the given input text box into one that will remember its selected value,
 *  using a client-side cookie with the given name.
 *  Basically identical code to makeSelectStateful...
 */
Cookies.makeTextBoxStateful = function(element, cookieName, expiration) {
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    
    element.cookieName = cookieName;
    if (Cookies.exists(cookieName)) {
        element.value = Cookies.get(cookieName);
        if (element.onchange) {
            element.onchange();
        }
    }
    element.observe("change", function(event) {
        Cookies.statefulSelectChange(element, cookieName, expiration);
    });
};

/** Removes the cookie with the given name. */
Cookies.remove = function(name) {
    Cookies.set(name, "", -1);
};

/** Sets the cookie with the given name to have the given value.
 *  Taken from http://www.quirksmode.org/js/cookies.html
 */
Cookies.set = function(name, value, days) {
    if (days && days > 0) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
};

// This function is called when a "stateful" checkbox's checked state
// changes, and stores that state in a cookie to be restored later.
Cookies.statefulCheckboxChange = function(element, cookieName, expiration) {
    if (!expiration) {
        expiration = 999;   // default 999 days
    }
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    Cookies.set(cookieName, element.checked ? "true" : "false", expiration);
};

// This function is called when a "stateful" checkbox's checked state
// changes, and stores that state in a cookie to be restored later.
Cookies.statefulRadioButtonChange = function(element, cookieName, expiration) {
    if (!expiration) {
        expiration = 999;   // default 999 days
    }
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    var radios = document.getElementsByName(element.name);
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].cookieName) {
            Cookies.set(radios[i].cookieName, "false", expiration);
        }
    }
    Cookies.set(cookieName, element.checked ? "true" : "false", expiration);
};

// This function is called when a "stateful" select box's selected element
// changes, and stores that value in a cookie to be restored later.
Cookies.statefulSelectChange = function(element, cookieName, expiration) {
    if (!expiration) {
        expiration = 999;   // default 999 days
    }
    element = $(element);
    if (!cookieName) {
        cookieName = element.id;
    }
    if (!cookieName) {
        return;
    }
    Cookies.set(cookieName, element.value, expiration);
};
