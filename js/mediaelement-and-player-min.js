/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Creates a JavaScript object that mimics HTML5 MediaElement API
* for browsers that don't understand HTML5 or can't play the provided codec
* Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
*
* Copyright 2010-2014, John Dyer (http://j.hn)
* License: MIT
*
*/
var mejs = mejs || {};
mejs.version = "2.14.2";
mejs.meIndex = 0;
mejs.plugins = {
    silverlight: [{
        version: [3, 0],
        types: ["video/mp4", "video/m4v", "video/mov", "video/wmv", "audio/wma", "audio/m4a", "audio/mp3", "audio/wav", "audio/mpeg"]
    }
    ],
    flash: [{
        version: [9, 0, 124],
        types: ["video/mp4", "video/m4v", "video/mov", "video/flv", "video/rtmp", "video/x-flv", "audio/flv", "audio/x-flv", "audio/mp3", "audio/m4a", "audio/mpeg", "video/youtube", "video/x-youtube"]
    }
    ],
    youtube: [{
        version: null,
        types: ["video/youtube", "video/x-youtube", "audio/youtube", "audio/x-youtube"]
    }
    ],
    vimeo: [{
        version: null,
        types: ["video/vimeo",
        "video/x-vimeo"]
    }
    ]
};
mejs.Utility = {
    encodeUrl: function(a) {
        return encodeURIComponent(a)
    },
    escapeHTML: function(a) {
        return a.toString().split("&").join("&amp;").split("<").join("&lt;").split('"').join("&quot;")
    },
    absolutizeUrl: function(a) {
        var b = document.createElement("div");
        b.innerHTML = '<a href="' + this.escapeHTML(a) + '">x</a>';
        return b.firstChild.href
    },
    getScriptPath: function(a) {
        for (var b = 0, c, d = "", e = "", g, f, i = document.getElementsByTagName("script"), k = i.length, h = a.length; b < k; b++) {
            g = i[b].src;
            c = g.lastIndexOf("/");
            if (c>-1) {
                f = g.substring(c +
                1);
                g = g.substring(0, c + 1)
            } else {
                f = g;
                g = ""
            }
            for (c = 0; c < h; c++) {
                e = a[c];
                e = f.indexOf(e);
                if (e>-1) {
                    d = g;
                    break
                }
            }
            if (d !== "")
                break
        }
        return d
    },
    secondsToTimeCode: function(a, b, c, d) {
        if (typeof c == "undefined")
            c = false;
        else if (typeof d == "undefined")
            d = 25;
        var e = Math.floor(a / 3600)%24, g = Math.floor(a / 60)%60, f = Math.floor(a%60);
        a = Math.floor((a%1 * d).toFixed(3));
        return (b || e > 0 ? (e < 10 ? "0" + e : e) + ":" : "") + (g < 10 ? "0" + g : g) + ":" + (f < 10 ? "0" + f : f) + (c ? ":" + (a < 10 ? "0" + a : a) : "")
    },
    timeCodeToSeconds: function(a, b, c, d) {
        if (typeof c == "undefined")
            c = false;
        else if (typeof d ==
        "undefined")
            d = 25;
        a = a.split(":");
        b = parseInt(a[0], 10);
        var e = parseInt(a[1], 10), g = parseInt(a[2], 10), f = 0, i = 0;
        if (c)
            f = parseInt(a[3]) / d;
        return i = b * 3600 + e * 60 + g + f
    },
    convertSMPTEtoSeconds: function(a) {
        if (typeof a != "string")
            return false;
        a = a.replace(",", ".");
        var b = 0, c = a.indexOf(".")!=-1 ? a.split(".")[1].length: 0, d = 1;
        a = a.split(":").reverse();
        for (var e = 0; e < a.length; e++) {
            d = 1;
            if (e > 0)
                d = Math.pow(60, e);
            b += Number(a[e]) * d
        }
        return Number(b.toFixed(c))
    },
    removeSwf: function(a) {
        var b = document.getElementById(a);
        if (b && /object|embed/i.test(b.nodeName))
            if (mejs.MediaFeatures.isIE) {
                b.style.display =
                "none";
                (function() {
                    b.readyState == 4 ? mejs.Utility.removeObjectInIE(a) : setTimeout(arguments.callee, 10)
                })()
            } else 
                b.parentNode.removeChild(b)
    },
    removeObjectInIE: function(a) {
        if (a = document.getElementById(a)) {
            for (var b in a)
                if (typeof a[b] == "function")
                    a[b] = null;
            a.parentNode.removeChild(a)
        }
    }
};
mejs.PluginDetector = {
    hasPluginVersion: function(a, b) {
        var c = this.plugins[a];
        b[1] = b[1] || 0;
        b[2] = b[2] || 0;
        return c[0] > b[0] || c[0] == b[0] && c[1] > b[1] || c[0] == b[0] && c[1] == b[1] && c[2] >= b[2] ? true : false
    },
    nav: window.navigator,
    ua: window.navigator.userAgent.toLowerCase(),
    plugins: [],
    addPlugin: function(a, b, c, d, e) {
        this.plugins[a] = this.detectPlugin(b, c, d, e)
    },
    detectPlugin: function(a, b, c, d) {
        var e = [0, 0, 0], g;
        if (typeof this.nav.plugins != "undefined" && typeof this.nav.plugins[a] == "object") {
            if ((c = this.nav.plugins[a].description) &&
            !(typeof this.nav.mimeTypes != "undefined" && this.nav.mimeTypes[b]&&!this.nav.mimeTypes[b].enabledPlugin)) {
                e = c.replace(a, "").replace(/^\s+/, "").replace(/\sr/gi, ".").split(".");
                for (a = 0; a < e.length; a++)
                    e[a] = parseInt(e[a].match(/\d+/), 10)
                }
        } else if (typeof window.ActiveXObject != "undefined")
            try {
                if (g = new ActiveXObject(c))
                    e = d(g)
        } catch (f) {}
        return e
    }
};
mejs.PluginDetector.addPlugin("flash", "Shockwave Flash", "application/x-shockwave-flash", "ShockwaveFlash.ShockwaveFlash", function(a) {
    var b = [];
    if (a = a.GetVariable("$version")) {
        a = a.split(" ")[1].split(",");
        b = [parseInt(a[0], 10), parseInt(a[1], 10), parseInt(a[2], 10)]
    }
    return b
});
mejs.PluginDetector.addPlugin("silverlight", "Silverlight Plug-In", "application/x-silverlight-2", "AgControl.AgControl", function(a) {
    var b = [0, 0, 0, 0], c = function(d, e, g, f) {
        for (; d.isVersionSupported(e[0] + "." + e[1] + "." + e[2] + "." + e[3]);)
            e[g] += f;
        e[g] -= f
    };
    c(a, b, 0, 1);
    c(a, b, 1, 1);
    c(a, b, 2, 1E4);
    c(a, b, 2, 1E3);
    c(a, b, 2, 100);
    c(a, b, 2, 10);
    c(a, b, 2, 1);
    c(a, b, 3, 1);
    return b
});
mejs.MediaFeatures = {
    init: function() {
        var a = this, b = document, c = mejs.PluginDetector.nav, d = mejs.PluginDetector.ua.toLowerCase(), e, g = ["source", "track", "audio", "video"];
        a.isiPad = d.match(/ipad/i) !== null;
        a.isiPhone = d.match(/iphone/i) !== null;
        a.isiOS = a.isiPhone || a.isiPad;
        a.isAndroid = d.match(/android/i) !== null;
        a.isBustedAndroid = d.match(/android 2\.[12]/) !== null;
        a.isBustedNativeHTTPS = location.protocol === "https:" && (d.match(/android [12]\./) !== null || d.match(/macintosh.* version.* safari/) !== null);
        a.isIE = c.appName.toLowerCase().indexOf("microsoft") !=
        -1 || c.appName.toLowerCase().match(/trident/gi) !== null;
        a.isChrome = d.match(/chrome/gi) !== null;
        a.isFirefox = d.match(/firefox/gi) !== null;
        a.isWebkit = d.match(/webkit/gi) !== null;
        a.isGecko = d.match(/gecko/gi) !== null&&!a.isWebkit&&!a.isIE;
        a.isOpera = d.match(/opera/gi) !== null;
        a.hasTouch = "ontouchstart"in window;
        a.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
        for (c = 0; c < g.length; c++)
            e = document.createElement(g[c]);
        a.supportsMediaTag = typeof e.canPlayType !==
        "undefined" || a.isBustedAndroid;
        try {
            e.canPlayType("video/mp4")
        } catch (f) {
            a.supportsMediaTag = false
        }
        a.hasSemiNativeFullScreen = typeof e.webkitEnterFullscreen !== "undefined";
        a.hasNativeFullscreen = typeof e.requestFullscreen !== "undefined";
        a.hasWebkitNativeFullScreen = typeof e.webkitRequestFullScreen !== "undefined";
        a.hasMozNativeFullScreen = typeof e.mozRequestFullScreen !== "undefined";
        a.hasMsNativeFullScreen = typeof e.msRequestFullscreen !== "undefined";
        a.hasTrueNativeFullScreen = a.hasWebkitNativeFullScreen || a.hasMozNativeFullScreen ||
        a.hasMsNativeFullScreen;
        a.nativeFullScreenEnabled = a.hasTrueNativeFullScreen;
        if (a.hasMozNativeFullScreen)
            a.nativeFullScreenEnabled = document.mozFullScreenEnabled;
        else if (a.hasMsNativeFullScreen)
            a.nativeFullScreenEnabled = document.msFullscreenEnabled;
        if (a.isChrome)
            a.hasSemiNativeFullScreen = false;
        if (a.hasTrueNativeFullScreen) {
            a.fullScreenEventName = "";
            if (a.hasWebkitNativeFullScreen)
                a.fullScreenEventName = "webkitfullscreenchange";
            else if (a.hasMozNativeFullScreen)
                a.fullScreenEventName = "mozfullscreenchange";
            else if (a.hasMsNativeFullScreen)
                a.fullScreenEventName = "MSFullscreenChange";
            a.isFullScreen = function() {
                if (e.mozRequestFullScreen)
                    return b.mozFullScreen;
                else if (e.webkitRequestFullScreen)
                    return b.webkitIsFullScreen;
                else if (e.hasMsNativeFullScreen)
                    return b.msFullscreenElement !== null
            };
            a.requestFullScreen = function(i) {
                if (a.hasWebkitNativeFullScreen)
                    i.webkitRequestFullScreen();
                else if (a.hasMozNativeFullScreen)
                    i.mozRequestFullScreen();
                else 
                    a.hasMsNativeFullScreen && i.msRequestFullscreen()
            };
            a.cancelFullScreen =
            function() {
                if (a.hasWebkitNativeFullScreen)
                    document.webkitCancelFullScreen();
                else if (a.hasMozNativeFullScreen)
                    document.mozCancelFullScreen();
                else 
                    a.hasMsNativeFullScreen && document.msExitFullscreen()
            }
        }
        if (a.hasSemiNativeFullScreen && d.match(/mac os x 10_5/i)) {
            a.hasNativeFullScreen = false;
            a.hasSemiNativeFullScreen = false
        }
    }
};
mejs.MediaFeatures.init();
mejs.HtmlMediaElement = {
    pluginType: "native",
    isFullScreen: false,
    setCurrentTime: function(a) {
        this.currentTime = a
    },
    setMuted: function(a) {
        this.muted = a
    },
    setVolume: function(a) {
        this.volume = a
    },
    stop: function() {
        this.pause()
    },
    setSrc: function(a) {
        for (var b = this.getElementsByTagName("source"); b.length > 0;)
            this.removeChild(b[0]);
        if (typeof a == "string")
            this.src = a;
        else {
            var c;
            for (b = 0; b < a.length; b++) {
                c = a[b];
                if (this.canPlayType(c.type)) {
                    this.src = c.src;
                    break
                }
            }
        }
    },
    setVideoSize: function(a, b) {
        this.width = a;
        this.height = b
    }
};
mejs.PluginMediaElement = function(a, b, c) {
    this.id = a;
    this.pluginType = b;
    this.src = c;
    this.events = {};
    this.attributes = {}
};
mejs.PluginMediaElement.prototype = {
    pluginElement: null,
    pluginType: "",
    isFullScreen: false,
    playbackRate: -1,
    defaultPlaybackRate: -1,
    seekable: [],
    played: [],
    paused: true,
    ended: false,
    seeking: false,
    duration: 0,
    error: null,
    tagName: "",
    muted: false,
    volume: 1,
    currentTime: 0,
    play: function() {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType == "vimeo" ? this.pluginApi.playVideo() : this.pluginApi.playMedia();
            this.paused = false
        }
    },
    load: function() {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType ==
            "vimeo" || this.pluginApi.loadMedia();
            this.paused = false
        }
    },
    pause: function() {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType == "vimeo" ? this.pluginApi.pauseVideo() : this.pluginApi.pauseMedia();
            this.paused = true
        }
    },
    stop: function() {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType == "vimeo" ? this.pluginApi.stopVideo() : this.pluginApi.stopMedia();
            this.paused = true
        }
    },
    canPlayType: function(a) {
        var b, c, d, e = mejs.plugins[this.pluginType];
        for (b = 0; b < e.length; b++) {
            d = e[b];
            if (mejs.PluginDetector.hasPluginVersion(this.pluginType,
            d.version))
                for (c = 0; c < d.types.length; c++)
                    if (a == d.types[c])
                        return "probably"
        }
        return ""
    },
    positionFullscreenButton: function(a, b, c) {
        this.pluginApi != null && this.pluginApi.positionFullscreenButton && this.pluginApi.positionFullscreenButton(Math.floor(a), Math.floor(b), c)
    },
    hideFullscreenButton: function() {
        this.pluginApi != null && this.pluginApi.hideFullscreenButton && this.pluginApi.hideFullscreenButton()
    },
    setSrc: function(a) {
        if (typeof a == "string") {
            this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(a));
            this.src = mejs.Utility.absolutizeUrl(a)
        } else {
            var b,
            c;
            for (b = 0; b < a.length; b++) {
                c = a[b];
                if (this.canPlayType(c.type)) {
                    this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(c.src));
                    this.src = mejs.Utility.absolutizeUrl(a);
                    break
                }
            }
        }
    },
    setCurrentTime: function(a) {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType == "vimeo" ? this.pluginApi.seekTo(a) : this.pluginApi.setCurrentTime(a);
            this.currentTime = a
        }
    },
    setVolume: function(a) {
        if (this.pluginApi != null) {
            this.pluginType == "youtube" || this.pluginType == "vimeo" ? this.pluginApi.setVolume(a * 100) : this.pluginApi.setVolume(a);
            this.volume = a
        }
    },
    setMuted: function(a) {
        if (this.pluginApi != null) {
            if (this.pluginType == "youtube" || this.pluginType == "vimeo") {
                a ? this.pluginApi.mute() : this.pluginApi.unMute();
                this.muted = a;
                this.dispatchEvent("volumechange")
            } else 
                this.pluginApi.setMuted(a);
            this.muted = a
        }
    },
    setVideoSize: function(a, b) {
        if (this.pluginElement.style) {
            this.pluginElement.style.width = a + "px";
            this.pluginElement.style.height = b + "px"
        }
        this.pluginApi != null && this.pluginApi.setVideoSize && this.pluginApi.setVideoSize(a, b)
    },
    setFullscreen: function(a) {
        this.pluginApi !=
        null && this.pluginApi.setFullscreen && this.pluginApi.setFullscreen(a)
    },
    enterFullScreen: function() {
        this.pluginApi != null && this.pluginApi.setFullscreen && this.setFullscreen(true)
    },
    exitFullScreen: function() {
        this.pluginApi != null && this.pluginApi.setFullscreen && this.setFullscreen(false)
    },
    addEventListener: function(a, b) {
        this.events[a] = this.events[a] || [];
        this.events[a].push(b)
    },
    removeEventListener: function(a, b) {
        if (!a) {
            this.events = {};
            return true
        }
        var c = this.events[a];
        if (!c)
            return true;
        if (!b) {
            this.events[a] = [];
            return true
        }
        for (var d =
        0; d < c.length; d++)
            if (c[d] === b) {
                this.events[a].splice(d, 1);
                return true
            }
        return false
    },
    dispatchEvent: function(a) {
        var b, c, d = this.events[a];
        if (d) {
            c = Array.prototype.slice.call(arguments, 1);
            for (b = 0; b < d.length; b++)
                d[b].apply(null, c)
        }
    },
    hasAttribute: function(a) {
        return a in this.attributes
    },
    removeAttribute: function(a) {
        delete this.attributes[a]
    },
    getAttribute: function(a) {
        if (this.hasAttribute(a))
            return this.attributes[a];
        return ""
    },
    setAttribute: function(a, b) {
        this.attributes[a] = b
    },
    remove: function() {
        mejs.Utility.removeSwf(this.pluginElement.id);
        mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id)
    }
};
mejs.MediaPluginBridge = {
    pluginMediaElements: {},
    htmlMediaElements: {},
    registerPluginElement: function(a, b, c) {
        this.pluginMediaElements[a] = b;
        this.htmlMediaElements[a] = c
    },
    unregisterPluginElement: function(a) {
        delete this.pluginMediaElements[a];
        delete this.htmlMediaElements[a]
    },
    initPlugin: function(a) {
        var b = this.pluginMediaElements[a], c = this.htmlMediaElements[a];
        if (b) {
            switch (b.pluginType) {
            case "flash":
                b.pluginElement = b.pluginApi = document.getElementById(a);
                break;
            case "silverlight":
                b.pluginElement = document.getElementById(b.id);
                b.pluginApi = b.pluginElement.Content.MediaElementJS
            }
            b.pluginApi != null && b.success && b.success(b, c)
        }
    },
    fireEvent: function(a, b, c) {
        var d, e;
        if (a = this.pluginMediaElements[a]) {
            b = {
                type: b,
                target: a
            };
            for (d in c) {
                a[d] = c[d];
                b[d] = c[d]
            }
            e = c.bufferedTime || 0;
            b.target.buffered = b.buffered = {
                start: function() {
                    return 0
                },
                end: function() {
                    return e
                },
                length: 1
            };
            a.dispatchEvent(b.type, b)
        }
    }
};
mejs.MediaElementDefaults = {
    mode: "auto",
    plugins: ["flash", "silverlight", "youtube", "vimeo"],
    enablePluginDebug: false,
    httpsBasicAuthSite: false,
    type: "",
    pluginPath: mejs.Utility.getScriptPath(["mediaelement.js", "mediaelement.min.js", "mediaelement-and-player.js", "mediaelement-and-player.min.js"]),
    flashName: "flashmediaelement.swf",
    flashStreamer: "",
    enablePluginSmoothing: false,
    enablePseudoStreaming: false,
    pseudoStreamingStartQueryParam: "start",
    silverlightName: "silverlightmediaelement.xap",
    defaultVideoWidth: 480,
    defaultVideoHeight: 270,
    pluginWidth: -1,
    pluginHeight: -1,
    pluginVars: [],
    timerRate: 250,
    startVolume: 0.8,
    success: function() {},
    error: function() {}
};
mejs.MediaElement = function(a, b) {
    return mejs.HtmlMediaElementShim.create(a, b)
};
mejs.HtmlMediaElementShim = {
    create: function(a, b) {
        var c = mejs.MediaElementDefaults, d = typeof a == "string" ? document.getElementById(a): a, e = d.tagName.toLowerCase(), g = e === "audio" || e === "video", f = g ? d.getAttribute("src"): d.getAttribute("href");
        e = d.getAttribute("poster");
        var i = d.getAttribute("autoplay"), k = d.getAttribute("preload"), h = d.getAttribute("controls"), j;
        for (j in b)
            c[j] = b[j];
        f = typeof f == "undefined" || f === null || f == "" ? null : f;
        e = typeof e == "undefined" || e === null ? "" : e;
        k = typeof k == "undefined" || k === null || k === "false" ?
        "none" : k;
        i=!(typeof i == "undefined" || i === null || i === "false");
        h=!(typeof h == "undefined" || h === null || h === "false");
        j = this.determinePlayback(d, c, mejs.MediaFeatures.supportsMediaTag, g, f);
        j.url = j.url !== null ? mejs.Utility.absolutizeUrl(j.url) : "";
        if (j.method == "native") {
            if (mejs.MediaFeatures.isBustedAndroid) {
                d.src = j.url;
                d.addEventListener("click", function() {
                    d.play()
                }, false)
            }
            return this.updateNative(j, c, i, k)
        } else if (j.method !== "")
            return this.createPlugin(j, c, e, i, k, h);
        else {
            this.createErrorMessage(j, c, e);
            return this
        }
    },
    determinePlayback: function(a, b, c, d, e) {
        var g = [], f, i, k, h = {
            method: "",
            url: "",
            htmlMediaElement: a,
            isVideo: a.tagName.toLowerCase() != "audio"
        }, j;
        if (typeof b.type != "undefined" && b.type !== "")
            if (typeof b.type == "string")
                g.push({
                    type: b.type,
                    url: e
                });
            else 
                for (f = 0; f < b.type.length; f++)
                    g.push({
                        type: b.type[f],
                        url: e
                    });
        else if (e !== null) {
            k = this.formatType(e, a.getAttribute("type"));
            g.push({
                type: k,
                url: e
            })
        } else 
            for (f = 0; f < a.childNodes.length; f++) {
                i = a.childNodes[f];
                if (i.nodeType == 1 && i.tagName.toLowerCase() == "source") {
                    e = i.getAttribute("src");
                    k = this.formatType(e, i.getAttribute("type"));
                    i = i.getAttribute("media");
                    if (!i ||!window.matchMedia || window.matchMedia && window.matchMedia(i).matches)
                        g.push({
                            type: k,
                            url: e
                        })
                    }
            }
        if (!d && g.length > 0 && g[0].url !== null && this.getTypeFromFile(g[0].url).indexOf("audio")>-1)
            h.isVideo = false;
        if (mejs.MediaFeatures.isBustedAndroid)
            a.canPlayType = function(m) {
                return m.match(/video\/(mp4|m4v)/gi) !== null ? "maybe" : ""
            };
        if (c && (b.mode === "auto" || b.mode === "auto_plugin" || b.mode === "native")&&!(mejs.MediaFeatures.isBustedNativeHTTPS &&
        b.httpsBasicAuthSite === true)) {
            if (!d) {
                f = document.createElement(h.isVideo ? "video" : "audio");
                a.parentNode.insertBefore(f, a);
                a.style.display = "none";
                h.htmlMediaElement = a = f
            }
            for (f = 0; f < g.length; f++)
                if (a.canPlayType(g[f].type).replace(/no/, "") !== "" || a.canPlayType(g[f].type.replace(/mp3/, "mpeg")).replace(/no/, "") !== "" || a.canPlayType(g[f].type.replace(/m4a/, "mp4")).replace(/no/, "") !== "") {
                    h.method = "native";
                    h.url = g[f].url;
                    break
                }
            if (h.method === "native") {
                if (h.url !== null)
                    a.src = h.url;
                if (b.mode !== "auto_plugin")
                    return h
            }
        }
        if (b.mode ===
        "auto" || b.mode === "auto_plugin" || b.mode === "shim")
            for (f = 0; f < g.length; f++) {
                k = g[f].type;
                for (a = 0; a < b.plugins.length; a++) {
                    e = b.plugins[a];
                    i = mejs.plugins[e];
                    for (c = 0; c < i.length; c++) {
                        j = i[c];
                        if (j.version == null || mejs.PluginDetector.hasPluginVersion(e, j.version))
                            for (d = 0; d < j.types.length; d++)
                                if (k == j.types[d]) {
                                    h.method = e;
                                    h.url = g[f].url;
                                    return h
                                }
                    }
                }
            }
        if (b.mode === "auto_plugin" && h.method === "native")
            return h;
        if (h.method === "" && g.length > 0)
            h.url = g[0].url;
        return h
    },
    formatType: function(a, b) {
        return a&&!b ? this.getTypeFromFile(a) :
        b&&~b.indexOf(";") ? b.substr(0, b.indexOf(";")) : b
    },
    getTypeFromFile: function(a) {
        a = a.split("?")[0];
        a = a.substring(a.lastIndexOf(".") + 1).toLowerCase();
        return (/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(a) ? "video" : "audio") + "/" + this.getTypeFromExtension(a)
    },
    getTypeFromExtension: function(a) {
        switch (a) {
        case "mp4":
        case "m4v":
        case "m4a":
            return "mp4";
        case "webm":
        case "webma":
        case "webmv":
            return "webm";
        case "ogg":
        case "oga":
        case "ogv":
            return "ogg";
        default:
            return a
        }
    },
    createErrorMessage: function(a, b, c) {
        var d =
        a.htmlMediaElement, e = document.createElement("div");
        e.className = "me-cannotplay";
        try {
            e.style.width = d.width + "px";
            e.style.height = d.height + "px"
        } catch (g) {}
        e.innerHTML = b.customError ? b.customError : c !== "" ? '<a href="' + a.url + '"><img src="' + c + '" width="100%" height="100%" /></a>' : '<a href="' + a.url + '"><span>' + mejs.i18n.t("Download File") + "</span></a>";
        d.parentNode.insertBefore(e, d);
        d.style.display = "none";
        b.error(d)
    },
    createPlugin: function(a, b, c, d, e, g) {
        c = a.htmlMediaElement;
        var f = 1, i = 1, k = "me_" + a.method + "_" + mejs.meIndex++,
        h = new mejs.PluginMediaElement(k, a.method, a.url), j = document.createElement("div"), m;
        h.tagName = c.tagName;
        for (m = 0; m < c.attributes.length; m++) {
            var q = c.attributes[m];
            q.specified == true && h.setAttribute(q.name, q.value)
        }
        for (m = c.parentNode; m !== null && m.tagName.toLowerCase() !== "body" && m.parentNode != null;) {
            if (m.parentNode.tagName.toLowerCase() === "p") {
                m.parentNode.parentNode.insertBefore(m, m.parentNode);
                break
            }
            m = m.parentNode
        }
        if (a.isVideo) {
            f = b.pluginWidth > 0 ? b.pluginWidth : b.videoWidth > 0 ? b.videoWidth : c.getAttribute("width") !==
            null ? c.getAttribute("width") : b.defaultVideoWidth;
            i = b.pluginHeight > 0 ? b.pluginHeight : b.videoHeight > 0 ? b.videoHeight : c.getAttribute("height") !== null ? c.getAttribute("height") : b.defaultVideoHeight;
            f = mejs.Utility.encodeUrl(f);
            i = mejs.Utility.encodeUrl(i)
        } else if (b.enablePluginDebug) {
            f = 320;
            i = 240
        }
        h.success = b.success;
        mejs.MediaPluginBridge.registerPluginElement(k, h, c);
        j.className = "me-plugin";
        j.id = k + "_container";
        a.isVideo ? c.parentNode.insertBefore(j, c) : document.body.insertBefore(j, document.body.childNodes[0]);
        d = ["id=" + k, "isvideo=" + (a.isVideo ? "true" : "false"), "autoplay=" + (d ? "true" : "false"), "preload=" + e, "width=" + f, "startvolume=" + b.startVolume, "timerrate=" + b.timerRate, "flashstreamer=" + b.flashStreamer, "height=" + i, "pseudostreamstart=" + b.pseudoStreamingStartQueryParam];
        if (a.url !== null)
            a.method == "flash" ? d.push("file=" + mejs.Utility.encodeUrl(a.url)) : d.push("file=" + a.url);
        b.enablePluginDebug && d.push("debug=true");
        b.enablePluginSmoothing && d.push("smoothing=true");
        b.enablePseudoStreaming && d.push("pseudostreaming=true");
        g && d.push("controls=true");
        if (b.pluginVars)
            d = d.concat(b.pluginVars);
        switch (a.method) {
        case "silverlight":
            j.innerHTML = '<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="' + k + '" name="' + k + '" width="' + f + '" height="' + i + '" class="mejs-shim"><param name="initParams" value="' + d.join(",") + '" /><param name="windowless" value="true" /><param name="background" value="black" /><param name="minRuntimeVersion" value="3.0.0.0" /><param name="autoUpgrade" value="true" /><param name="source" value="' +
            b.pluginPath + b.silverlightName + '" /></object>';
            break;
        case "flash":
            if (mejs.MediaFeatures.isIE) {
                a = document.createElement("div");
                j.appendChild(a);
                a.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="' + k + '" width="' + f + '" height="' + i + '" class="mejs-shim"><param name="movie" value="' + b.pluginPath + b.flashName + "?x=" + new Date + '" /><param name="flashvars" value="' + d.join("&amp;") + '" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /><param name="scale" value="default" /></object>'
            } else 
                j.innerHTML =
                '<embed id="' + k + '" name="' + k + '" play="true" loop="false" quality="high" bgcolor="#000000" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" src="' + b.pluginPath + b.flashName + '" flashvars="' + d.join("&") + '" width="' + f + '" height="' + i + '" scale="default"class="mejs-shim"></embed>';
            break;
        case "youtube":
            if (a.url.lastIndexOf("youtu.be")!=-1) {
                a = a.url.substr(a.url.lastIndexOf("/") + 1);
                if (a.indexOf("?") !=
                -1)
                    a = a.substr(0, a.indexOf("?"))
                } else 
                    a = a.url.substr(a.url.lastIndexOf("=") + 1);
            youtubeSettings = {
                container: j,
                containerId: j.id,
                pluginMediaElement: h,
                pluginId: k,
                videoId: a,
                height: i,
                width: f
            };
            mejs.PluginDetector.hasPluginVersion("flash", [10, 0, 0]) ? mejs.YouTubeApi.createFlash(youtubeSettings) : mejs.YouTubeApi.enqueueIframe(youtubeSettings);
            break;
        case "vimeo":
            b = k + "_player";
            h.vimeoid = a.url.substr(a.url.lastIndexOf("/") + 1);
            j.innerHTML = '<iframe src="//player.vimeo.com/video/' + h.vimeoid + "?api=1&portrait=0&byline=0&title=0&player_id=" +
            b + '" width="' + f + '" height="' + i + '" frameborder="0" class="mejs-shim" id="' + b + '"></iframe>';
            if (typeof $f == "function") {
                var l = $f(j.childNodes[0]);
                l.addEvent("ready", function() {
                    function o(n, p, r, s) {
                        n = {
                            type: r,
                            target: p
                        };
                        if (r == "timeupdate") {
                            p.currentTime = n.currentTime = s.seconds;
                            p.duration = n.duration = s.duration
                        }
                        p.dispatchEvent(n.type, n)
                    }
                    l.playVideo = function() {
                        l.api("play")
                    };
                    l.pauseVideo = function() {
                        l.api("pause")
                    };
                    l.seekTo = function(n) {
                        l.api("seekTo", n)
                    };
                    l.addEvent("play", function() {
                        o(l, h, "play");
                        o(l, h, "playing")
                    });
                    l.addEvent("pause", function() {
                        o(l, h, "pause")
                    });
                    l.addEvent("finish", function() {
                        o(l, h, "ended")
                    });
                    l.addEvent("playProgress", function(n) {
                        o(l, h, "timeupdate", n)
                    });
                    h.pluginApi = l;
                    mejs.MediaPluginBridge.initPlugin(k)
                })
            } else 
                console.warn("You need to include froogaloop for vimeo to work")
        }
        c.style.display = "none";
        c.removeAttribute("autoplay");
        return h
    },
    updateNative: function(a, b) {
        var c = a.htmlMediaElement, d;
        for (d in mejs.HtmlMediaElement)
            c[d] = mejs.HtmlMediaElement[d];
        b.success(c, c);
        return c
    }
};
mejs.YouTubeApi = {
    isIframeStarted: false,
    isIframeLoaded: false,
    loadIframeApi: function() {
        if (!this.isIframeStarted) {
            var a = document.createElement("script");
            a.src = "//www.youtube.com/player_api";
            var b = document.getElementsByTagName("script")[0];
            b.parentNode.insertBefore(a, b);
            this.isIframeStarted = true
        }
    },
    iframeQueue: [],
    enqueueIframe: function(a) {
        if (this.isLoaded)
            this.createIframe(a);
        else {
            this.loadIframeApi();
            this.iframeQueue.push(a)
        }
    },
    createIframe: function(a) {
        var b = a.pluginMediaElement, c = new YT.Player(a.containerId,
        {
            height: a.height,
            width: a.width,
            videoId: a.videoId,
            playerVars: {
                controls: 0
            },
            events: {
                onReady: function() {
                    a.pluginMediaElement.pluginApi = c;
                    mejs.MediaPluginBridge.initPlugin(a.pluginId);
                    setInterval(function() {
                        mejs.YouTubeApi.createEvent(c, b, "timeupdate")
                    }, 250)
                },
                onStateChange: function(d) {
                    mejs.YouTubeApi.handleStateChange(d.data, c, b)
                }
            }
        })
    },
    createEvent: function(a, b, c) {
        c = {
            type: c,
            target: b
        };
        if (a && a.getDuration) {
            b.currentTime = c.currentTime = a.getCurrentTime();
            b.duration = c.duration = a.getDuration();
            c.paused = b.paused;
            c.ended = b.ended;
            c.muted = a.isMuted();
            c.volume = a.getVolume() / 100;
            c.bytesTotal = a.getVideoBytesTotal();
            c.bufferedBytes = a.getVideoBytesLoaded();
            var d = c.bufferedBytes / c.bytesTotal * c.duration;
            c.target.buffered = c.buffered = {
                start: function() {
                    return 0
                },
                end: function() {
                    return d
                },
                length: 1
            }
        }
        b.dispatchEvent(c.type, c)
    },
    iFrameReady: function() {
        for (this.isIframeLoaded = this.isLoaded = true; this.iframeQueue.length > 0;)
            this.createIframe(this.iframeQueue.pop())
    },
    flashPlayers: {},
    createFlash: function(a) {
        this.flashPlayers[a.pluginId] =
        a;
        var b, c = "//www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=" + a.pluginId + "&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0";
        if (mejs.MediaFeatures.isIE) {
            b = document.createElement("div");
            a.container.appendChild(b);
            b.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="' + a.pluginId + '" width="' + a.width + '" height="' + a.height + '" class="mejs-shim"><param name="movie" value="' +
            c + '" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'
        } else 
            a.container.innerHTML = '<object type="application/x-shockwave-flash" id="' + a.pluginId + '" data="' + c + '" width="' + a.width + '" height="' + a.height + '" style="visibility: visible; " class="mejs-shim"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"></object>'
    },
    flashReady: function(a) {
        var b = this.flashPlayers[a], c =
        document.getElementById(a), d = b.pluginMediaElement;
        d.pluginApi = d.pluginElement = c;
        mejs.MediaPluginBridge.initPlugin(a);
        c.cueVideoById(b.videoId);
        a = b.containerId + "_callback";
        window[a] = function(e) {
            mejs.YouTubeApi.handleStateChange(e, c, d)
        };
        c.addEventListener("onStateChange", a);
        setInterval(function() {
            mejs.YouTubeApi.createEvent(c, d, "timeupdate")
        }, 250)
    },
    handleStateChange: function(a, b, c) {
        switch (a) {
        case -1:
            c.paused = true;
            c.ended = true;
            mejs.YouTubeApi.createEvent(b, c, "loadedmetadata");
            break;
        case 0:
            c.paused = false;
            c.ended = true;
            mejs.YouTubeApi.createEvent(b, c, "ended");
            break;
        case 1:
            c.paused = false;
            c.ended = false;
            mejs.YouTubeApi.createEvent(b, c, "play");
            mejs.YouTubeApi.createEvent(b, c, "playing");
            break;
        case 2:
            c.paused = true;
            c.ended = false;
            mejs.YouTubeApi.createEvent(b, c, "pause");
            break;
        case 3:
            mejs.YouTubeApi.createEvent(b, c, "progress")
        }
    }
};
function onYouTubePlayerAPIReady() {
    mejs.YouTubeApi.iFrameReady()
}
function onYouTubePlayerReady(a) {
    mejs.YouTubeApi.flashReady(a)
}
window.mejs = mejs;
window.MediaElement = mejs.MediaElement;
(function(a, b) {
    var c = {
        locale: {
            language: "",
            strings: {}
        },
        methods: {}
    };
    c.getLanguage = function() {
        return (c.locale.language || window.navigator.userLanguage || window.navigator.language).substr(0, 2).toLowerCase()
    };
    if (typeof mejsL10n != "undefined")
        c.locale.language = mejsL10n.language;
    c.methods.checkPlain = function(d) {
        var e, g, f = {
            "&": "&amp;",
            '"': "&quot;",
            "<": "&lt;",
            ">": "&gt;"
        };
        d = String(d);
        for (e in f)
            if (f.hasOwnProperty(e)) {
                g = RegExp(e, "g");
                d = d.replace(g, f[e])
            }
        return d
    };
    c.methods.t = function(d, e) {
        if (c.locale.strings &&
        c.locale.strings[e.context] && c.locale.strings[e.context][d])
            d = c.locale.strings[e.context][d];
        return c.methods.checkPlain(d)
    };
    c.t = function(d, e) {
        if (typeof d === "string" && d.length > 0) {
            var g = c.getLanguage();
            e = e || {
                context: g
            };
            return c.methods.t(d, e)
        } else 
            throw {
                name: "InvalidArgumentException",
                message: "First argument is either not a string or empty."
            };
    };
    b.i18n = c
})(document, mejs);
(function(a) {
    if (typeof mejsL10n != "undefined")
        a[mejsL10n.language] = mejsL10n.strings
})(mejs.i18n.locale.strings);
(function(a) {
    if (typeof a.de === "undefined")
        a.de = {
            Fullscreen: "Vollbild",
            "Go Fullscreen": "Vollbild an",
            "Turn off Fullscreen": "Vollbild aus",
            Close: "Schlie\u00dfen"
        }
})(mejs.i18n.locale.strings);
(function(a) {
    if (typeof a.zh === "undefined")
        a.zh = {
            Fullscreen: "\u5168\u87a2\u5e55",
            "Go Fullscreen": "\u5168\u5c4f\u6a21\u5f0f",
            "Turn off Fullscreen": "\u9000\u51fa\u5168\u5c4f\u6a21\u5f0f",
            Close: "\u95dc\u9589"
        }
})(mejs.i18n.locale.strings);

/*!
 * MediaElementPlayer
 * http://mediaelementjs.com/
 *
 * Creates a controller bar for HTML5 <video> add <audio> tags
 * using jQuery and MediaElement.js (HTML5 Flash/Silverlight wrapper)
 *
 * Copyright 2010-2013, John Dyer (http://j.hn/)
 * License: MIT
 *
 */
if (typeof jQuery != "undefined")
    mejs.$ = jQuery;
else if (typeof ender != "undefined")
    mejs.$ = ender;
(function(f) {
    mejs.MepDefaults = {
        poster: "",
        showPosterWhenEnded: false,
        defaultVideoWidth: 480,
        defaultVideoHeight: 270,
        videoWidth: -1,
        videoHeight: -1,
        defaultAudioWidth: 400,
        defaultAudioHeight: 30,
        defaultSeekBackwardInterval: function(a) {
            return a.duration * 0.05
        },
        defaultSeekForwardInterval: function(a) {
            return a.duration * 0.05
        },
        audioWidth: -1,
        audioHeight: -1,
        startVolume: 0.8,
        loop: false,
        autoRewind: true,
        enableAutosize: true,
        alwaysShowHours: false,
        showTimecodeFrameCount: false,
        framesPerSecond: 25,
        autosizeProgress: true,
        alwaysShowControls: false,
        hideVideoControlsOnLoad: false,
        clickToPlayPause: true,
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false,
        features: ["playpause", "current", "progress", "duration", "tracks", "volume", "fullscreen"],
        isVideo: true,
        enableKeyboard: true,
        pauseOtherPlayers: true,
        keyActions: [{
            keys: [32, 179],
            action: function(a, b) {
                b.paused || b.ended ? a.play() : a.pause()
            }
        }, {
            keys: [38],
            action: function(a, b) {
                b.setVolume(Math.min(b.volume + 0.1, 1))
            }
        }, {
            keys: [40],
            action: function(a, b) {
                b.setVolume(Math.max(b.volume -
                0.1, 0))
            }
        }, {
            keys: [37, 227],
            action: function(a, b) {
                if (!isNaN(b.duration) && b.duration > 0) {
                    if (a.isVideo) {
                        a.showControls();
                        a.startControlsTimer()
                    }
                    var c = Math.max(b.currentTime - a.options.defaultSeekBackwardInterval(b), 0);
                    b.setCurrentTime(c)
                }
            }
        }, {
            keys: [39, 228],
            action: function(a, b) {
                if (!isNaN(b.duration) && b.duration > 0) {
                    if (a.isVideo) {
                        a.showControls();
                        a.startControlsTimer()
                    }
                    var c = Math.min(b.currentTime + a.options.defaultSeekForwardInterval(b), b.duration);
                    b.setCurrentTime(c)
                }
            }
        }, {
            keys: [70],
            action: function(a) {
                if (typeof a.enterFullScreen !=
                "undefined")
                    a.isFullScreen ? a.exitFullScreen() : a.enterFullScreen()
            }
        }
        ]
    };
    mejs.mepIndex = 0;
    mejs.players = {};
    mejs.MediaElementPlayer = function(a, b) {
        if (!(this instanceof mejs.MediaElementPlayer))
            return new mejs.MediaElementPlayer(a, b);
        this.$media = this.$node = f(a);
        this.node = this.media = this.$media[0];
        if (typeof this.node.player != "undefined")
            return this.node.player;
        else 
            this.node.player = this;
        if (typeof b == "undefined")
            b = this.$node.data("mejsoptions");
        this.options = f.extend({}, mejs.MepDefaults, b);
        this.id = "mep_" + mejs.mepIndex++;
        mejs.players[this.id] = this;
        this.init();
        return this
    };
    mejs.MediaElementPlayer.prototype = {
        hasFocus: false,
        controlsAreVisible: true,
        init: function() {
            var a = this, b = mejs.MediaFeatures, c = f.extend(true, {}, a.options, {
                success: function(d, g) {
                    a.meReady(d, g)
                },
                error: function(d) {
                    a.handleError(d)
                }
            }), e = a.media.tagName.toLowerCase();
            a.isDynamic = e !== "audio" && e !== "video";
            a.isVideo = a.isDynamic ? a.options.isVideo : e !== "audio" && a.options.isVideo;
            if (b.isiPad && a.options.iPadUseNativeControls || b.isiPhone && a.options.iPhoneUseNativeControls) {
                a.$media.attr("controls",
                "controls");
                b.isiPad && a.media.getAttribute("autoplay") !== null && a.play()
            } else if (!(b.isAndroid && a.options.AndroidUseNativeControls)) {
                a.$media.removeAttr("controls");
                a.container = f('<div id="' + a.id + '" class="mejs-container ' + (mejs.MediaFeatures.svg ? "svg" : "no-svg") + '"><div class="mejs-inner"><div class="mejs-mediaelement"></div><div class="mejs-layers"></div><div class="mejs-controls"></div><div class="mejs-clear"></div></div></div>').addClass(a.$media[0].className).insertBefore(a.$media);
                a.container.addClass((b.isAndroid ?
                "mejs-android " : "") + (b.isiOS ? "mejs-ios " : "") + (b.isiPad ? "mejs-ipad " : "") + (b.isiPhone ? "mejs-iphone " : "") + (a.isVideo ? "mejs-video " : "mejs-audio "));
                if (b.isiOS) {
                    b = a.$media.clone();
                    a.container.find(".mejs-mediaelement").append(b);
                    a.$media.remove();
                    a.$node = a.$media = b;
                    a.node = a.media = b[0]
                } else 
                    a.container.find(".mejs-mediaelement").append(a.$media);
                    a.controls = a.container.find(".mejs-controls");
                    a.layers = a.container.find(".mejs-layers");
                    b = a.isVideo ? "video" : "audio";
                    e = b.substring(0, 1).toUpperCase() + b.substring(1);
                    a.width = a.options[b + "Width"] > 0 || a.options[b + "Width"].toString().indexOf("%")>-1 ? a.options[b + "Width"] : a.media.style.width !== "" && a.media.style.width !== null ? a.media.style.width : a.media.getAttribute("width") !== null ? a.$media.attr("width") : a.options["default" + e + "Width"];
                    a.height = a.options[b + "Height"] > 0 || a.options[b + "Height"].toString().indexOf("%")>-1 ? a.options[b + "Height"] : a.media.style.height !== "" && a.media.style.height !== null ? a.media.style.height : a.$media[0].getAttribute("height") !== null ? a.$media.attr("height") :
                    a.options["default" + e + "Height"];
                    a.setPlayerSize(a.width, a.height);
                    c.pluginWidth = a.width;
                    c.pluginHeight = a.height
            }
            mejs.MediaElement(a.$media[0], c);
            typeof a.container != "undefined" && a.controlsAreVisible && a.container.trigger("controlsshown")
        },
        showControls: function(a) {
            var b = this;
            a = typeof a == "undefined" || a;
            if (!b.controlsAreVisible) {
                if (a) {
                    b.controls.css("visibility", "visible").stop(true, true).fadeIn(200, function() {
                        b.controlsAreVisible = true;
                        b.container.trigger("controlsshown")
                    });
                    b.container.find(".mejs-control").css("visibility",
                    "visible").stop(true, true).fadeIn(200, function() {
                        b.controlsAreVisible = true
                    })
                } else {
                    b.controls.css("visibility", "visible").css("display", "block");
                    b.container.find(".mejs-control").css("visibility", "visible").css("display", "block");
                    b.controlsAreVisible = true;
                    b.container.trigger("controlsshown")
                }
                b.setControlsSize()
            }
        },
        hideControls: function(a) {
            var b = this;
            a = typeof a == "undefined" || a;
            if (!(!b.controlsAreVisible || b.options.alwaysShowControls))
                if (a) {
                    b.controls.stop(true, true).fadeOut(200, function() {
                        f(this).css("visibility",
                        "hidden").css("display", "block");
                        b.controlsAreVisible = false;
                        b.container.trigger("controlshidden")
                    });
                    b.container.find(".mejs-control").stop(true, true).fadeOut(200, function() {
                        f(this).css("visibility", "hidden").css("display", "block")
                    })
                } else {
                    b.controls.css("visibility", "hidden").css("display", "block");
                    b.container.find(".mejs-control").css("visibility", "hidden").css("display", "block");
                    b.controlsAreVisible = false;
                    b.container.trigger("controlshidden")
                }
        },
        controlsTimer: null,
        startControlsTimer: function(a) {
            var b =
            this;
            a = typeof a != "undefined" ? a : 1500;
            b.killControlsTimer("start");
            b.controlsTimer = setTimeout(function() {
                b.hideControls();
                b.killControlsTimer("hide")
            }, a)
        },
        killControlsTimer: function() {
            if (this.controlsTimer !== null) {
                clearTimeout(this.controlsTimer);
                delete this.controlsTimer;
                this.controlsTimer = null
            }
        },
        controlsEnabled: true,
        disableControls: function() {
            this.killControlsTimer();
            this.hideControls(false);
            this.controlsEnabled = false
        },
        enableControls: function() {
            this.showControls(false);
            this.controlsEnabled = true
        },
        meReady: function(a, b) {
            var c = this, e = mejs.MediaFeatures, d = b.getAttribute("autoplay");
            d=!(typeof d == "undefined" || d === null || d === "false");
            var g;
            if (!c.created) {
                c.created = true;
                c.media = a;
                c.domNode = b;
                if (!(e.isAndroid && c.options.AndroidUseNativeControls)&&!(e.isiPad && c.options.iPadUseNativeControls)&&!(e.isiPhone && c.options.iPhoneUseNativeControls)) {
                    c.buildposter(c, c.controls, c.layers, c.media);
                    c.buildkeyboard(c, c.controls, c.layers, c.media);
                    c.buildoverlays(c, c.controls, c.layers, c.media);
                    c.findTracks();
                    for (g in c.options.features) {
                        e =
                        c.options.features[g];
                        if (c["build" + e])
                            try {
                                c["build" + e](c, c.controls, c.layers, c.media)
                            } catch (k) {}
                    }
                    c.container.trigger("controlsready");
                    c.setPlayerSize(c.width, c.height);
                    c.setControlsSize();
                    if (c.isVideo) {
                        if (mejs.MediaFeatures.hasTouch)
                            c.$media.bind("touchstart", function() {
                                if (c.controlsAreVisible)
                                    c.hideControls(false);
                                else 
                                    c.controlsEnabled && c.showControls(false)
                                });
                        else {
                            c.clickToPlayPauseCallback = function() {
                                if (c.options.clickToPlayPause)
                                    c.media.paused ? c.play() : c.pause()
                            };
                            c.media.addEventListener("click",
                            c.clickToPlayPauseCallback, false);
                            c.container.bind("mouseenter mouseover", function() {
                                if (c.controlsEnabled)
                                    if (!c.options.alwaysShowControls) {
                                        c.killControlsTimer("enter");
                                        c.showControls();
                                        c.startControlsTimer(2500)
                                    }
                            }).bind("mousemove", function() {
                                if (c.controlsEnabled) {
                                    c.controlsAreVisible || c.showControls();
                                    c.options.alwaysShowControls || c.startControlsTimer(2500)
                                }
                            }).bind("mouseleave", function() {
                                c.controlsEnabled&&!c.media.paused&&!c.options.alwaysShowControls && c.startControlsTimer(1E3)
                            })
                        }
                        c.options.hideVideoControlsOnLoad &&
                        c.hideControls(false);
                        d&&!c.options.alwaysShowControls && c.hideControls();
                        c.options.enableAutosize && c.media.addEventListener("loadedmetadata", function(j) {
                            if (c.options.videoHeight <= 0 && c.domNode.getAttribute("height") === null&&!isNaN(j.target.videoHeight)) {
                                c.setPlayerSize(j.target.videoWidth, j.target.videoHeight);
                                c.setControlsSize();
                                c.media.setVideoSize(j.target.videoWidth, j.target.videoHeight)
                            }
                        }, false)
                    }
                    a.addEventListener("play", function() {
                        for (var j in mejs.players) {
                            var m = mejs.players[j];
                            m.id != c.id &&
                            c.options.pauseOtherPlayers&&!m.paused&&!m.ended && m.pause();
                            m.hasFocus = false
                        }
                        c.hasFocus = true
                    }, false);
                    c.media.addEventListener("ended", function() {
                        if (c.options.autoRewind)
                            try {
                                c.media.setCurrentTime(0)
                        } catch (j) {}
                        c.media.pause();
                        c.setProgressRail && c.setProgressRail();
                        c.setCurrentRail && c.setCurrentRail();
                        if (c.options.loop)
                            c.play();
                        else 
                            !c.options.alwaysShowControls && c.controlsEnabled && c.showControls()
                    }, false);
                    c.media.addEventListener("loadedmetadata", function() {
                        c.updateDuration && c.updateDuration();
                        c.updateCurrent &&
                        c.updateCurrent();
                        if (!c.isFullScreen) {
                            c.setPlayerSize(c.width, c.height);
                            c.setControlsSize()
                        }
                    }, false);
                    setTimeout(function() {
                        c.setPlayerSize(c.width, c.height);
                        c.setControlsSize()
                    }, 50);
                    c.globalBind("resize", function() {
                        c.isFullScreen || mejs.MediaFeatures.hasTrueNativeFullScreen && document.webkitIsFullScreen || c.setPlayerSize(c.width, c.height);
                        c.setControlsSize()
                    });
                    c.media.pluginType == "youtube" && c.container.find(".mejs-overlay-play").hide()
                }
                d && a.pluginType == "native" && c.play();
                if (c.options.success)typeof c.options.success ==
                "string" ? window[c.options.success](c.media, c.domNode, c): c.options.success(c.media, c.domNode, c)
                }
        }, handleError: function(a) {
            this.controls.hide();
            this.options.error && this.options.error(a)
        }, setPlayerSize: function(a, b) {
            if (typeof a != "undefined")
                this.width = a;
            if (typeof b != "undefined")
                this.height = b;
            if (this.height.toString().indexOf("%") > 0 || this.$node.css("max-width") === "100%" || parseInt(this.$node.css("max-width").replace(/px/, ""), 10) / this.$node.offsetParent().width() === 1 || this.$node[0].currentStyle && this.$node[0].currentStyle.maxWidth ===
            "100%") {
                var c = this.isVideo ? this.media.videoWidth && this.media.videoWidth > 0 ? this.media.videoWidth: this.options.defaultVideoWidth: this.options.defaultAudioWidth, e = this.isVideo ? this.media.videoHeight && this.media.videoHeight > 0 ? this.media.videoHeight: this.options.defaultVideoHeight: this.options.defaultAudioHeight, d = this.container.parent().closest(":visible").width();
                c = this.isVideo ||!this.options.autosizeProgress ? parseInt(d * e / c, 10) : e;
                if (isNaN(c))
                    c = this.container.parent().closest(":visible").height();
                if (this.container.parent()[0].tagName.toLowerCase() ===
                "body") {
                    d = f(window).width();
                    c = f(window).height()
                }
                if (c != 0 && d != 0) {
                    this.container.width(d).height(c);
                    this.$media.add(this.container.find(".mejs-shim")).width("100%").height("100%");
                    this.isVideo && this.media.setVideoSize && this.media.setVideoSize(d, c);
                    this.layers.children(".mejs-layer").width("100%").height("100%")
                }
            } else {
                this.container.width(this.width).height(this.height);
                this.layers.children(".mejs-layer").width(this.width).height(this.height)
            }
            d = this.layers.find(".mejs-overlay-play");
            c = d.find(".mejs-overlay-button");
            d.height(this.container.height() - this.controls.height());
            c.css("margin-top", "-" + (c.height() / 2 - this.controls.height() / 2).toString() + "px")
        }, setControlsSize: function() {
            var a = 0, b = 0, c = this.controls.find(".mejs-time-rail"), e = this.controls.find(".mejs-time-total");
            this.controls.find(".mejs-time-current");
            this.controls.find(".mejs-time-loaded");
            var d = c.siblings(), g = d.last(), k = null;
            if (!(!this.container.is(":visible") ||!c.length ||!c.is(":visible"))) {
                if (this.options&&!this.options.autosizeProgress)
                    b = parseInt(c.css("width"));
                if (b === 0 ||!b) {
                    d.each(function() {
                        var j = f(this);
                        if (j.css("position") != "absolute" && j.is(":visible"))
                            a += f(this).outerWidth(true)
                    });
                    b = this.controls.width() - a - (c.outerWidth(true) - c.width())
                }
                do {
                    c.width(b);
                    e.width(b - (e.outerWidth(true) - e.width()));
                    if (g.css("position") != "absolute") {
                        k = g.position();
                        b--
                    }
                }
                while (k != null && k.top > 0 && b > 0);
                this.setProgressRail && this.setProgressRail();
                this.setCurrentRail && this.setCurrentRail()
            }
        }, buildposter: function(a, b, c, e) {
            var d = f('<div class="mejs-poster mejs-layer"></div>').appendTo(c);
            b = a.$media.attr("poster");
            if (a.options.poster !== "")
                b = a.options.poster;
            b !== "" && b != null ? this.setPoster(b) : d.hide();
            e.addEventListener("play", function() {
                d.hide()
            }, false);
            a.options.showPosterWhenEnded && a.options.autoRewind && e.addEventListener("ended", function() {
                d.show()
            }, false)
        }, setPoster: function(a) {
            var b = this.container.find(".mejs-poster"), c = b.find("img");
            if (c.length == 0)
                c = f('<img width="100%" height="100%" />').appendTo(b);
            c.attr("src", a);
            b.css({
                "background-image": "url(" + a + ")"
            })
        }, buildoverlays: function(a,
        b, c, e) {
            var d = this;
            if (a.isVideo) {
                var g = f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-loading"><span></span></div></div>').hide().appendTo(c), k = f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-error"></div></div>').hide().appendTo(c), j = f('<div class="mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button"></div></div>').appendTo(c).bind("click touchstart", function() {
                    d.options.clickToPlayPause && e.paused && e.play()
                });
                e.addEventListener("play", function() {
                    j.hide();
                    g.hide();
                    b.find(".mejs-time-buffering").hide();
                    k.hide()
                }, false);
                e.addEventListener("playing", function() {
                    j.hide();
                    g.hide();
                    b.find(".mejs-time-buffering").hide();
                    k.hide()
                }, false);
                e.addEventListener("seeking", function() {
                    g.show();
                    b.find(".mejs-time-buffering").show()
                }, false);
                e.addEventListener("seeked", function() {
                    g.hide();
                    b.find(".mejs-time-buffering").hide()
                }, false);
                e.addEventListener("pause", function() {
                    mejs.MediaFeatures.isiPhone || j.show()
                }, false);
                e.addEventListener("waiting", function() {
                    g.show();
                    b.find(".mejs-time-buffering").show()
                },
                false);
                e.addEventListener("loadeddata", function() {
                    g.show();
                    b.find(".mejs-time-buffering").show()
                }, false);
                e.addEventListener("canplay", function() {
                    g.hide();
                    b.find(".mejs-time-buffering").hide()
                }, false);
                e.addEventListener("error", function() {
                    g.hide();
                    b.find(".mejs-time-buffering").hide();
                    k.show();
                    k.find("mejs-overlay-error").html("Error loading this resource")
                }, false)
            }
        }, buildkeyboard: function(a, b, c, e) {
            this.globalBind("keydown", function(d) {
                if (a.hasFocus && a.options.enableKeyboard)
                    for (var g = 0, k = a.options.keyActions.length; g <
                    k; g++)
                        for (var j = a.options.keyActions[g], m = 0, q = j.keys.length; m < q; m++)
                            if (d.keyCode == j.keys[m]) {
                                d.preventDefault();
                                j.action(a, e, d.keyCode);
                                return false
                            }
                return true
            });
            this.globalBind("click", function(d) {
                a.hasFocus = f(d.target).closest(".mejs-container").length != 0
            })
        }, findTracks: function() {
            var a = this, b = a.$media.find("track");
            a.tracks = [];
            b.each(function(c, e) {
                e = f(e);
                a.tracks.push({
                    srclang: e.attr("srclang") ? e.attr("srclang").toLowerCase(): "",
                    src: e.attr("src"),
                    kind: e.attr("kind"),
                    label: e.attr("label") || "",
                    entries: [],
                    isLoaded: false
                })
            })
        }, changeSkin: function(a) {
            this.container[0].className = "mejs-container " + a;
            this.setPlayerSize(this.width, this.height);
            this.setControlsSize()
        }, play: function() {
            this.load();
            this.media.play()
        }, pause: function() {
            try {
                this.media.pause()
            } catch (a) {}
        }, load: function() {
            this.isLoaded || this.media.load();
            this.isLoaded = true
        }, setMuted: function(a) {
            this.media.setMuted(a)
        }, setCurrentTime: function(a) {
            this.media.setCurrentTime(a)
        }, getCurrentTime: function() {
            return this.media.currentTime
        }, setVolume: function(a) {
            this.media.setVolume(a)
        },
        getVolume: function() {
            return this.media.volume
        }, setSrc: function(a) {
            this.media.setSrc(a)
        }, remove: function() {
            var a, b;
            for (a in this.options.features) {
                b = this.options.features[a];
                if (this["clean" + b])
                    try {
                        this["clean" + b](this)
                    } catch (c) {}
            }
            if (this.isDynamic)
                this.$node.insertBefore(this.container);
            else {
                this.$media.prop("controls", true);
                this.$node.clone().show().insertBefore(this.container);
                this.$node.remove()
            }
            this.media.pluginType !== "native" && this.media.remove();
            delete mejs.players[this.id];
            typeof this.container ==
            "object" && this.container.remove();
            this.globalUnbind();
            delete this.node.player
        }
    };
    (function() {
        function a(c,
        e) {
            var d = {
                d: [],
                w: []
            };
            f.each((c || "").split(" "), function(g, k) {
                var j = k + "." + e;
                if (j.indexOf(".") === 0) {
                    d.d.push(j);
                    d.w.push(j)
                } else 
                    d[b.test(k) ? "w": "d"].push(j)
            });
            d.d = d.d.join(" ");
            d.w = d.w.join(" ");
            return d
        }
        var b = /^((after|before)print|(before)?unload|hashchange|message|o(ff|n)line|page(hide|show)|popstate|resize|storage)\b/; mejs.MediaElementPlayer.prototype.globalBind = function(c, e, d) {
            c = a(c, this.id);
            c.d && f(document).bind(c.d, e, d);
            c.w && f(window).bind(c.w, e, d)
        };
        mejs.MediaElementPlayer.prototype.globalUnbind = function(c, e) {
            c = a(c, this.id);
            c.d && f(document).unbind(c.d, e);
            c.w && f(window).unbind(c.w, e)
        }
    })();
    if (typeof jQuery != "undefined")
        jQuery.fn.mediaelementplayer = function(a) {
            a === false ? this.each(function() {
                var b = jQuery(this).data("mediaelementplayer");
                b && b.remove();
                jQuery(this).removeData("mediaelementplayer")
            }) : this.each(function() {
                jQuery(this).data("mediaelementplayer", new mejs.MediaElementPlayer(this,
                a))
            });
            return this
        };
    f(document).ready(function() {
        f(".mejs-player").mediaelementplayer()
    });
    window.MediaElementPlayer = mejs.MediaElementPlayer
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        playpauseText: mejs.i18n.t("Play/Pause")
    });
    f.extend(MediaElementPlayer.prototype, {
        buildplaypause: function(a, b, c, e) {
            var d = f('<div class="mejs-button mejs-playpause-button mejs-play" ><button type="button" aria-controls="' + this.id + '" title="' + this.options.playpauseText + '" aria-label="' + this.options.playpauseText + '"></button></div>').appendTo(b).click(function(g) {
                g.preventDefault();
                e.paused ? e.play() : e.pause();
                return false
            });
            e.addEventListener("play", function() {
                d.removeClass("mejs-play").addClass("mejs-pause")
            },
            false);
            e.addEventListener("playing", function() {
                d.removeClass("mejs-play").addClass("mejs-pause")
            }, false);
            e.addEventListener("pause", function() {
                d.removeClass("mejs-pause").addClass("mejs-play")
            }, false);
            e.addEventListener("paused", function() {
                d.removeClass("mejs-pause").addClass("mejs-play")
            }, false)
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        stopText: "Stop"
    });
    f.extend(MediaElementPlayer.prototype, {
        buildstop: function(a, b, c, e) {
            f('<div class="mejs-button mejs-stop-button mejs-stop"><button type="button" aria-controls="' + this.id + '" title="' + this.options.stopText + '" aria-label="' + this.options.stopText + '"></button></div>').appendTo(b).click(function() {
                e.paused || e.pause();
                if (e.currentTime > 0) {
                    e.setCurrentTime(0);
                    e.pause();
                    b.find(".mejs-time-current").width("0px");
                    b.find(".mejs-time-handle").css("left",
                    "0px");
                    b.find(".mejs-time-float-current").html(mejs.Utility.secondsToTimeCode(0));
                    b.find(".mejs-currenttime").html(mejs.Utility.secondsToTimeCode(0));
                    c.find(".mejs-poster").show()
                }
            })
        }
    })
})(mejs.$);
(function(f) {
    f.extend(MediaElementPlayer.prototype, {
        buildprogress: function(a, b, c, e) {
            f('<div class="mejs-time-rail"><span class="mejs-time-total"><span class="mejs-time-buffering"></span><span class="mejs-time-loaded"></span><span class="mejs-time-current"></span><span class="mejs-time-handle"></span><span class="mejs-time-float"><span class="mejs-time-float-current">00:00</span><span class="mejs-time-float-corner"></span></span></span></div>').appendTo(b);
            b.find(".mejs-time-buffering").hide();
            var d =
            this, g = b.find(".mejs-time-total");
            c = b.find(".mejs-time-loaded");
            var k = b.find(".mejs-time-current"), j = b.find(".mejs-time-handle"), m = b.find(".mejs-time-float"), q = b.find(".mejs-time-float-current"), p = function(h) {
                h = h.originalEvent.changedTouches ? h.originalEvent.changedTouches[0].pageX : h.pageX;
                var l = g.offset(), r = g.outerWidth(true), n = 0, o = n = 0;
                if (e.duration) {
                    if (h < l.left)
                        h = l.left;
                    else if (h > r + l.left)
                        h = r + l.left;
                    o = h - l.left;
                    n = o / r;
                    n = n <= 0.02 ? 0 : n * e.duration;
                    t && n !== e.currentTime && e.setCurrentTime(n);
                    if (!mejs.MediaFeatures.hasTouch) {
                        m.css("left",
                        o);
                        q.html(mejs.Utility.secondsToTimeCode(n));
                        m.show()
                    }
                }
            }, t = false;
            g.bind("mousedown touchstart", function(h) {
                if (h.which === 1 || h.which === 0) {
                    t = true;
                    p(h);
                    d.globalBind("mousemove.dur touchmove.dur", function(l) {
                        p(l)
                    });
                    d.globalBind("mouseup.dur touchend.dur", function() {
                        t = false;
                        m.hide();
                        d.globalUnbind(".dur")
                    });
                    return false
                }
            }).bind("mouseenter", function() {
                d.globalBind("mousemove.dur", function(h) {
                    p(h)
                });
                mejs.MediaFeatures.hasTouch || m.show()
            }).bind("mouseleave", function() {
                if (!t) {
                    d.globalUnbind(".dur");
                    m.hide()
                }
            });
            e.addEventListener("progress", function(h) {
                a.setProgressRail(h);
                a.setCurrentRail(h)
            }, false);
            e.addEventListener("timeupdate", function(h) {
                a.setProgressRail(h);
                a.setCurrentRail(h)
            }, false);
            d.loaded = c;
            d.total = g;
            d.current = k;
            d.handle = j
        },
        setProgressRail: function(a) {
            var b = a != undefined ? a.target: this.media, c = null;
            if (b && b.buffered && b.buffered.length > 0 && b.buffered.end && b.duration)
                c = b.buffered.end(0) / b.duration;
            else if (b && b.bytesTotal != undefined && b.bytesTotal > 0 && b.bufferedBytes != undefined)
                c = b.bufferedBytes / b.bytesTotal;
            else if (a && a.lengthComputable && a.total != 0)
                c = a.loaded / a.total;
            if (c !== null) {
                c = Math.min(1, Math.max(0, c));
                this.loaded && this.total && this.loaded.width(this.total.width() * c)
            }
        },
        setCurrentRail: function() {
            if (this.media.currentTime != undefined && this.media.duration)
                if (this.total && this.handle) {
                    var a = Math.round(this.total.width() * this.media.currentTime / this.media.duration), b = a - Math.round(this.handle.outerWidth(true) / 2);
                    this.current.width(a);
                    this.handle.css("left", b)
                }
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        duration: -1,
        timeAndDurationSeparator: "<span> | </span>"
    });
    f.extend(MediaElementPlayer.prototype, {
        buildcurrent: function(a, b, c, e) {
            f('<div class="mejs-time"><span class="mejs-currenttime">' + (a.options.alwaysShowHours ? "00:" : "") + (a.options.showTimecodeFrameCount ? "00:00:00" : "00:00") + "</span></div>").appendTo(b);
            this.currenttime = this.controls.find(".mejs-currenttime");
            e.addEventListener("timeupdate", function() {
                a.updateCurrent()
            }, false)
        },
        buildduration: function(a, b,
        c, e) {
            if (b.children().last().find(".mejs-currenttime").length > 0)
                f(this.options.timeAndDurationSeparator + '<span class="mejs-duration">' + (this.options.duration > 0 ? mejs.Utility.secondsToTimeCode(this.options.duration, this.options.alwaysShowHours || this.media.duration > 3600, this.options.showTimecodeFrameCount, this.options.framesPerSecond || 25) : (a.options.alwaysShowHours ? "00:" : "") + (a.options.showTimecodeFrameCount ? "00:00:00" : "00:00")) + "</span>").appendTo(b.find(".mejs-time"));
            else {
                b.find(".mejs-currenttime").parent().addClass("mejs-currenttime-container");
                f('<div class="mejs-time mejs-duration-container"><span class="mejs-duration">' + (this.options.duration > 0 ? mejs.Utility.secondsToTimeCode(this.options.duration, this.options.alwaysShowHours || this.media.duration > 3600, this.options.showTimecodeFrameCount, this.options.framesPerSecond || 25) : (a.options.alwaysShowHours ? "00:" : "") + (a.options.showTimecodeFrameCount ? "00:00:00" : "00:00")) + "</span></div>").appendTo(b)
            }
            this.durationD = this.controls.find(".mejs-duration");
            e.addEventListener("timeupdate", function() {
                a.updateDuration()
            },
            false)
        },
        updateCurrent: function() {
            if (this.currenttime)
                this.currenttime.html(mejs.Utility.secondsToTimeCode(this.media.currentTime, this.options.alwaysShowHours || this.media.duration > 3600, this.options.showTimecodeFrameCount, this.options.framesPerSecond || 25))
        },
        updateDuration: function() {
            this.container.toggleClass("mejs-long-video", this.media.duration > 3600);
            if (this.durationD && (this.options.duration > 0 || this.media.duration))
                this.durationD.html(mejs.Utility.secondsToTimeCode(this.options.duration > 0 ? this.options.duration :
                this.media.duration, this.options.alwaysShowHours, this.options.showTimecodeFrameCount, this.options.framesPerSecond || 25))
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        muteText: mejs.i18n.t("Mute Toggle"),
        hideVolumeOnTouchDevices: true,
        audioVolume: "horizontal",
        videoVolume: "vertical"
    });
    f.extend(MediaElementPlayer.prototype, {
        buildvolume: function(a, b, c, e) {
            if (!((mejs.MediaFeatures.isAndroid || mejs.MediaFeatures.isiOS) && this.options.hideVolumeOnTouchDevices)) {
                var d = this, g = d.isVideo ? d.options.videoVolume: d.options.audioVolume, k = g == "horizontal" ? f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="' +
                d.id + '" title="' + d.options.muteText + '" aria-label="' + d.options.muteText + '"></button></div><div class="mejs-horizontal-volume-slider"><div class="mejs-horizontal-volume-total"></div><div class="mejs-horizontal-volume-current"></div><div class="mejs-horizontal-volume-handle"></div></div>').appendTo(b): f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="' + d.id + '" title="' + d.options.muteText + '" aria-label="' + d.options.muteText + '"></button><div class="mejs-volume-slider"><div class="mejs-volume-total"></div><div class="mejs-volume-current"></div><div class="mejs-volume-handle"></div></div></div>').appendTo(b),
                j = d.container.find(".mejs-volume-slider, .mejs-horizontal-volume-slider"), m = d.container.find(".mejs-volume-total, .mejs-horizontal-volume-total"), q = d.container.find(".mejs-volume-current, .mejs-horizontal-volume-current"), p = d.container.find(".mejs-volume-handle, .mejs-horizontal-volume-handle"), t = function(n, o) {
                    if (!j.is(":visible") && typeof o == "undefined") {
                        j.show();
                        t(n, true);
                        j.hide()
                    } else {
                        n = Math.max(0, n);
                        n = Math.min(n, 1);
                        n == 0 ? k.removeClass("mejs-mute").addClass("mejs-unmute") : k.removeClass("mejs-unmute").addClass("mejs-mute");
                        if (g == "vertical") {
                            var s = m.height(), u = m.position(), v = s - s * n;
                            p.css("top", Math.round(u.top + v - p.height() / 2));
                            q.height(s - v);
                            q.css("top", u.top + v)
                        } else {
                            s = m.width();
                            u = m.position();
                            s = s * n;
                            p.css("left", Math.round(u.left + s - p.width() / 2));
                            q.width(Math.round(s))
                        }
                    }
                }, h = function(n) {
                    var o = null, s = m.offset();
                    if (g == "vertical") {
                        o = m.height();
                        parseInt(m.css("top").replace(/px/, ""), 10);
                        o = (o - (n.pageY - s.top)) / o;
                        if (s.top == 0 || s.left == 0)
                            return 
                    } else {
                        o = m.width();
                        o = (n.pageX - s.left) / o
                    }
                    o = Math.max(0, o);
                    o = Math.min(o, 1);
                    t(o);
                    o == 0 ? e.setMuted(true) :
                    e.setMuted(false);
                    e.setVolume(o)
                }, l = false, r = false;
                k.hover(function() {
                    j.show();
                    r = true
                }, function() {
                    r = false;
                    !l && g == "vertical" && j.hide()
                });
                j.bind("mouseover", function() {
                    r = true
                }).bind("mousedown", function(n) {
                    h(n);
                    d.globalBind("mousemove.vol", function(o) {
                        h(o)
                    });
                    d.globalBind("mouseup.vol", function() {
                        l = false;
                        d.globalUnbind(".vol");
                        !r && g == "vertical" && j.hide()
                    });
                    l = true;
                    return false
                });
                k.find("button").click(function() {
                    e.setMuted(!e.muted)
                });
                e.addEventListener("volumechange", function() {
                    if (!l)
                        if (e.muted) {
                            t(0);
                            k.removeClass("mejs-mute").addClass("mejs-unmute")
                        } else {
                            t(e.volume);
                            k.removeClass("mejs-unmute").addClass("mejs-mute")
                        }
                }, false);
                if (d.container.is(":visible")) {
                    t(a.options.startVolume);
                    a.options.startVolume === 0 && e.setMuted(true);
                    e.pluginType === "native" && e.setVolume(a.options.startVolume)
                }
            }
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        usePluginFullScreen: true,
        newWindowCallback: function() {
            return ""
        },
        fullscreenText: mejs.i18n.t("Fullscreen")
    });
    f.extend(MediaElementPlayer.prototype, {
        isFullScreen: false,
        isNativeFullScreen: false,
        isInIframe: false,
        buildfullscreen: function(a, b, c, e) {
            if (a.isVideo) {
                a.isInIframe = window.location != window.parent.location;
                if (mejs.MediaFeatures.hasTrueNativeFullScreen) {
                    c = function() {
                        if (a.isFullScreen)
                            if (mejs.MediaFeatures.isFullScreen()) {
                                a.isNativeFullScreen = true;
                                a.setControlsSize()
                            } else {
                                a.isNativeFullScreen =
                                false;
                                a.exitFullScreen()
                            }
                    };
                    mejs.MediaFeatures.hasMozNativeFullScreen ? a.globalBind(mejs.MediaFeatures.fullScreenEventName, c) : a.container.bind(mejs.MediaFeatures.fullScreenEventName, c)
                }
                var d = this, g = f('<div class="mejs-button mejs-fullscreen-button"><button type="button" aria-controls="' + d.id + '" title="' + d.options.fullscreenText + '" aria-label="' + d.options.fullscreenText + '"></button></div>').appendTo(b);
                if (d.media.pluginType === "native" ||!d.options.usePluginFullScreen&&!mejs.MediaFeatures.isFirefox)
                    g.click(function() {
                        mejs.MediaFeatures.hasTrueNativeFullScreen &&
                        mejs.MediaFeatures.isFullScreen() || a.isFullScreen ? a.exitFullScreen() : a.enterFullScreen()
                    });
                else {
                    var k = null;
                    if (function() {
                        var h = document.createElement("x"), l = document.documentElement, r = window.getComputedStyle;
                        if (!("pointerEvents"in h.style))
                            return false;
                        h.style.pointerEvents = "auto";
                        h.style.pointerEvents = "x";
                        l.appendChild(h);
                        r = r && r(h, "").pointerEvents === "auto";
                        l.removeChild(h);
                        return !!r
                    }()&&!mejs.MediaFeatures.isOpera) {
                        var j = false, m = function() {
                            if (j) {
                                for (var h in q)
                                    q[h].hide();
                                g.css("pointer-events",
                                "");
                                d.controls.css("pointer-events", "");
                                d.media.removeEventListener("click", d.clickToPlayPauseCallback);
                                j = false
                            }
                        }, q = {};
                        b = ["top", "left", "right", "bottom"];
                        var p, t = function() {
                            var h = g.offset().left - d.container.offset().left, l = g.offset().top - d.container.offset().top, r = g.outerWidth(true), n = g.outerHeight(true), o = d.container.width(), s = d.container.height();
                            for (p in q)
                                q[p].css({
                                    position: "absolute",
                                    top: 0,
                                    left: 0
                                });
                            q.top.width(o).height(l);
                            q.left.width(h).height(n).css({
                                top: l
                            });
                            q.right.width(o - h - r).height(n).css({
                                top: l,
                                left: h + r
                            });
                            q.bottom.width(o).height(s - n - l).css({
                                top: l + n
                            })
                        };
                        d.globalBind("resize", function() {
                            t()
                        });
                        p = 0;
                        for (c = b.length; p < c; p++)
                            q[b[p]] = f('<div class="mejs-fullscreen-hover" />').appendTo(d.container).mouseover(m).hide();
                        g.on("mouseover", function() {
                            if (!d.isFullScreen) {
                                var h = g.offset(), l = a.container.offset();
                                e.positionFullscreenButton(h.left - l.left, h.top - l.top, false);
                                g.css("pointer-events", "none");
                                d.controls.css("pointer-events", "none");
                                d.media.addEventListener("click", d.clickToPlayPauseCallback);
                                for (p in q)
                                    q[p].show();
                                t();
                                j = true
                            }
                        });
                        e.addEventListener("fullscreenchange", function() {
                            d.isFullScreen=!d.isFullScreen;
                            d.isFullScreen ? d.media.removeEventListener("click", d.clickToPlayPauseCallback) : d.media.addEventListener("click", d.clickToPlayPauseCallback);
                            m()
                        });
                        d.globalBind("mousemove", function(h) {
                            if (j) {
                                var l = g.offset();
                                if (h.pageY < l.top || h.pageY > l.top + g.outerHeight(true) || h.pageX < l.left || h.pageX > l.left + g.outerWidth(true)) {
                                    g.css("pointer-events", "");
                                    d.controls.css("pointer-events", "");
                                    j = false
                                }
                            }
                        })
                    } else 
                        g.on("mouseover",
                        function() {
                            if (k !== null) {
                                clearTimeout(k);
                                delete k
                            }
                            var h = g.offset(), l = a.container.offset();
                            e.positionFullscreenButton(h.left - l.left, h.top - l.top, true)
                        }).on("mouseout", function() {
                            if (k !== null) {
                                clearTimeout(k);
                                delete k
                            }
                            k = setTimeout(function() {
                                e.hideFullscreenButton()
                            }, 1500)
                        })
                    }
                a.fullscreenBtn = g;
                d.globalBind("keydown", function(h) {
                    if ((mejs.MediaFeatures.hasTrueNativeFullScreen && mejs.MediaFeatures.isFullScreen() || d.isFullScreen) && h.keyCode == 27)
                        a.exitFullScreen()
                })
            }
        },
        cleanfullscreen: function(a) {
            a.exitFullScreen()
        },
        containerSizeTimeout: null,
        enterFullScreen: function() {
            var a = this;
            if (!(a.media.pluginType !== "native" && (mejs.MediaFeatures.isFirefox || a.options.usePluginFullScreen))) {
                f(document.documentElement).addClass("mejs-fullscreen");
                normalHeight = a.container.height();
                normalWidth = a.container.width();
                if (a.media.pluginType === "native")
                    if (mejs.MediaFeatures.hasTrueNativeFullScreen) {
                        mejs.MediaFeatures.requestFullScreen(a.container[0]);
                        a.isInIframe && setTimeout(function c() {
                            if (a.isNativeFullScreen) {
                                var e = (window.devicePixelRatio ||
                                1) * f(window).width(), d = screen.width;
                                Math.abs(d - e) > d * 0.0020 ? a.exitFullScreen() : setTimeout(c, 500)
                            }
                        }, 500)
                    } else if (mejs.MediaFeatures.hasSemiNativeFullScreen) {
                        a.media.webkitEnterFullscreen();
                        return 
                    }
                if (a.isInIframe) {
                    var b = a.options.newWindowCallback(this);
                    if (b !== "")
                        if (mejs.MediaFeatures.hasTrueNativeFullScreen)
                            setTimeout(function() {
                                if (!a.isNativeFullScreen) {
                                    a.pause();
                                    window.open(b, a.id, "top=0,left=0,width=" + screen.availWidth + ",height=" + screen.availHeight + ",resizable=yes,scrollbars=no,status=no,toolbar=no")
                                }
                            },
                            250);
                        else {
                            a.pause();
                            window.open(b, a.id, "top=0,left=0,width=" + screen.availWidth + ",height=" + screen.availHeight + ",resizable=yes,scrollbars=no,status=no,toolbar=no");
                            return 
                        }
                }
                a.container.addClass("mejs-container-fullscreen").width("100%").height("100%");
                a.containerSizeTimeout = setTimeout(function() {
                    a.container.css({
                        width: "100%",
                        height: "100%"
                    });
                    a.setControlsSize()
                }, 500);
                if (a.media.pluginType === "native")
                    a.$media.width("100%").height("100%");
                else {
                    a.container.find(".mejs-shim").width("100%").height("100%");
                    a.media.setVideoSize(f(window).width(), f(window).height())
                }
                a.layers.children("div").width("100%").height("100%");
                a.fullscreenBtn && a.fullscreenBtn.removeClass("mejs-fullscreen").addClass("mejs-unfullscreen");
                a.setControlsSize();
                a.isFullScreen = true
            }
        },
        exitFullScreen: function() {
            clearTimeout(this.containerSizeTimeout);
            if (this.media.pluginType !== "native" && mejs.MediaFeatures.isFirefox)
                this.media.setFullscreen(false);
            else {
                if (mejs.MediaFeatures.hasTrueNativeFullScreen && (mejs.MediaFeatures.isFullScreen() ||
                this.isFullScreen))
                    mejs.MediaFeatures.cancelFullScreen();
                f(document.documentElement).removeClass("mejs-fullscreen");
                this.container.removeClass("mejs-container-fullscreen").width(normalWidth).height(normalHeight);
                if (this.media.pluginType === "native")
                    this.$media.width(normalWidth).height(normalHeight);
                else {
                    this.container.find(".mejs-shim").width(normalWidth).height(normalHeight);
                    this.media.setVideoSize(normalWidth, normalHeight)
                }
                this.layers.children("div").width(normalWidth).height(normalHeight);
                this.fullscreenBtn.removeClass("mejs-unfullscreen").addClass("mejs-fullscreen");
                this.setControlsSize();
                this.isFullScreen = false
            }
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        startLanguage: "",
        tracksText: mejs.i18n.t("Captions/Subtitles"),
        hideCaptionsButtonWhenEmpty: true,
        toggleCaptionsButtonWhenOnlyOne: false,
        slidesSelector: ""
    });
    f.extend(MediaElementPlayer.prototype, {
        hasChapters: false,
        buildtracks: function(a, b, c, e) {
            if (a.tracks.length != 0) {
                var d;
                if (this.domNode.textTracks)
                    for (d = this.domNode.textTracks.length-1; d >= 0; d--)
                        this.domNode.textTracks[d].mode = "hidden";
                a.chapters = f('<div class="mejs-chapters mejs-layer"></div>').prependTo(c).hide();
                a.captions =
                f('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position mejs-captions-position-hover"><span class="mejs-captions-text"></span></div></div>').prependTo(c).hide();
                a.captionsText = a.captions.find(".mejs-captions-text");
                a.captionsButton = f('<div class="mejs-button mejs-captions-button"><button type="button" aria-controls="' + this.id + '" title="' + this.options.tracksText + '" aria-label="' + this.options.tracksText + '"></button><div class="mejs-captions-selector"><ul><li><input type="radio" name="' +
                a.id + '_captions" id="' + a.id + '_captions_none" value="none" checked="checked" /><label for="' + a.id + '_captions_none">' + mejs.i18n.t("None") + "</label></li></ul></div></div>").appendTo(b);
                for (d = b = 0; d < a.tracks.length; d++)
                    a.tracks[d].kind == "subtitles" && b++;
                this.options.toggleCaptionsButtonWhenOnlyOne && b == 1 ? a.captionsButton.on("click", function() {
                    a.setTrack(a.selectedTrack == null ? a.tracks[0].srclang : "none")
                }) : a.captionsButton.hover(function() {
                    f(this).find(".mejs-captions-selector").css("visibility", "visible")
                },
                function() {
                    f(this).find(".mejs-captions-selector").css("visibility", "hidden")
                }).on("click", "input[type=radio]", function() {
                    lang = this.value;
                    a.setTrack(lang)
                });
                a.options.alwaysShowControls ? a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover") : a.container.bind("controlsshown", function() {
                    a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover")
                }).bind("controlshidden", function() {
                    e.paused || a.container.find(".mejs-captions-position").removeClass("mejs-captions-position-hover")
                });
                a.trackToLoad =- 1;
                a.selectedTrack = null;
                a.isLoadingTrack = false;
                for (d = 0; d < a.tracks.length; d++)
                    a.tracks[d].kind == "subtitles" && a.addTrackButton(a.tracks[d].srclang, a.tracks[d].label);
                a.loadNextTrack();
                e.addEventListener("timeupdate", function() {
                    a.displayCaptions()
                }, false);
                if (a.options.slidesSelector != "") {
                    a.slidesContainer = f(a.options.slidesSelector);
                    e.addEventListener("timeupdate", function() {
                        a.displaySlides()
                    }, false)
                }
                e.addEventListener("loadedmetadata", function() {
                    a.displayChapters()
                }, false);
                a.container.hover(function() {
                    if (a.hasChapters) {
                        a.chapters.css("visibility",
                        "visible");
                        a.chapters.fadeIn(200).height(a.chapters.find(".mejs-chapter").outerHeight())
                    }
                }, function() {
                    a.hasChapters&&!e.paused && a.chapters.fadeOut(200, function() {
                        f(this).css("visibility", "hidden");
                        f(this).css("display", "block")
                    })
                });
                a.node.getAttribute("autoplay") !== null && a.chapters.css("visibility", "hidden")
            }
        },
        setTrack: function(a) {
            var b;
            if (a == "none") {
                this.selectedTrack = null;
                this.captionsButton.removeClass("mejs-captions-enabled")
            } else 
                for (b = 0; b < this.tracks.length; b++)
                    if (this.tracks[b].srclang == a) {
                        this.selectedTrack ==
                        null && this.captionsButton.addClass("mejs-captions-enabled");
                        this.selectedTrack = this.tracks[b];
                        this.captions.attr("lang", this.selectedTrack.srclang);
                        this.displayCaptions();
                        break
                    }
        },
        loadNextTrack: function() {
            this.trackToLoad++;
            if (this.trackToLoad < this.tracks.length) {
                this.isLoadingTrack = true;
                this.loadTrack(this.trackToLoad)
            } else {
                this.isLoadingTrack = false;
                this.checkForTracks()
            }
        },
        loadTrack: function(a) {
            var b = this, c = b.tracks[a];
            f.ajax({
                url: c.src,
                dataType: "text",
                success: function(e) {
                    c.entries = typeof e == "string" &&
                    /<tt\s+xml/ig.exec(e) ? mejs.TrackFormatParser.dfxp.parse(e) : mejs.TrackFormatParser.webvvt.parse(e);
                    c.isLoaded = true;
                    b.enableTrackButton(c.srclang, c.label);
                    b.loadNextTrack();
                    c.kind == "chapters" && b.media.addEventListener("play", function() {
                        b.media.duration > 0 && b.displayChapters(c)
                    }, false);
                    c.kind == "slides" && b.setupSlides(c)
                },
                error: function() {
                    b.loadNextTrack()
                }
            })
        },
        enableTrackButton: function(a, b) {
            if (b === "")
                b = mejs.language.codes[a] || a;
            this.captionsButton.find("input[value=" + a + "]").prop("disabled", false).siblings("label").html(b);
            this.options.startLanguage == a && f("#" + this.id + "_captions_" + a).click();
            this.adjustLanguageBox()
        },
        addTrackButton: function(a, b) {
            if (b === "")
                b = mejs.language.codes[a] || a;
            this.captionsButton.find("ul").append(f('<li><input type="radio" name="' + this.id + '_captions" id="' + this.id + "_captions_" + a + '" value="' + a + '" disabled="disabled" /><label for="' + this.id + "_captions_" + a + '">' + b + " (loading)</label></li>"));
            this.adjustLanguageBox();
            this.container.find(".mejs-captions-translations option[value=" + a + "]").remove()
        },
        adjustLanguageBox: function() {
            this.captionsButton.find(".mejs-captions-selector").height(this.captionsButton.find(".mejs-captions-selector ul").outerHeight(true) + this.captionsButton.find(".mejs-captions-translations").outerHeight(true))
        },
        checkForTracks: function() {
            var a = false;
            if (this.options.hideCaptionsButtonWhenEmpty) {
                for (i = 0; i < this.tracks.length; i++)
                    if (this.tracks[i].kind == "subtitles") {
                        a = true;
                        break
                    }
                if (!a) {
                    this.captionsButton.hide();
                    this.setControlsSize()
                }
            }
        },
        displayCaptions: function() {
            if (typeof this.tracks !=
            "undefined") {
                var a, b = this.selectedTrack;
                if (b != null && b.isLoaded)
                    for (a = 0; a < b.entries.times.length; a++)
                        if (this.media.currentTime >= b.entries.times[a].start && this.media.currentTime <= b.entries.times[a].stop) {
                            this.captionsText.html(b.entries.text[a]);
                            this.captions.show().height(0);
                            return 
                        }
                this.captions.hide()
            }
        },
        setupSlides: function(a) {
            this.slides = a;
            this.slides.entries.imgs = [this.slides.entries.text.length];
            this.showSlide(0)
        },
        showSlide: function(a) {
            if (!(typeof this.tracks == "undefined" || typeof this.slidesContainer ==
            "undefined")) {
                var b = this, c = b.slides.entries.text[a], e = b.slides.entries.imgs[a];
                if (typeof e == "undefined" || typeof e.fadeIn == "undefined")
                    b.slides.entries.imgs[a] = e = f('<img src="' + c + '">').on("load", function() {
                        e.appendTo(b.slidesContainer).hide().fadeIn().siblings(":visible").fadeOut()
                    });
                else 
                    !e.is(":visible")&&!e.is(":animated") && e.fadeIn().siblings(":visible").fadeOut()
            }
        },
        displaySlides: function() {
            if (typeof this.slides != "undefined") {
                var a = this.slides, b;
                for (b = 0; b < a.entries.times.length; b++)
                    if (this.media.currentTime >=
                    a.entries.times[b].start && this.media.currentTime <= a.entries.times[b].stop) {
                        this.showSlide(b);
                        break
                    }
            }
        },
        displayChapters: function() {
            var a;
            for (a = 0; a < this.tracks.length; a++)
                if (this.tracks[a].kind == "chapters" && this.tracks[a].isLoaded) {
                    this.drawChapters(this.tracks[a]);
                    this.hasChapters = true;
                    break
                }
        },
        drawChapters: function(a) {
            var b = this, c, e, d = e = 0;
            b.chapters.empty();
            for (c = 0; c < a.entries.times.length; c++) {
                e = a.entries.times[c].stop - a.entries.times[c].start;
                e = Math.floor(e / b.media.duration * 100);
                if (e + d > 100 || c == a.entries.times.length -
                1 && e + d < 100)
                    e = 100 - d;
                b.chapters.append(f('<div class="mejs-chapter" rel="' + a.entries.times[c].start + '" style="left: ' + d.toString() + "%;width: " + e.toString() + '%;"><div class="mejs-chapter-block' + (c == a.entries.times.length-1 ? " mejs-chapter-block-last" : "") + '"><span class="ch-title">' + a.entries.text[c] + '</span><span class="ch-time">' + mejs.Utility.secondsToTimeCode(a.entries.times[c].start) + "&ndash;" + mejs.Utility.secondsToTimeCode(a.entries.times[c].stop) + "</span></div></div>"));
                d += e
            }
            b.chapters.find("div.mejs-chapter").click(function() {
                b.media.setCurrentTime(parseFloat(f(this).attr("rel")));
                b.media.paused && b.media.play()
            });
            b.chapters.show()
        }
    });
    mejs.language = {
        codes: {
            af: "Afrikaans",
            sq: "Albanian",
            ar: "Arabic",
            be: "Belarusian",
            bg: "Bulgarian",
            ca: "Catalan",
            zh: "Chinese",
            "zh-cn": "Chinese Simplified",
            "zh-tw": "Chinese Traditional",
            hr: "Croatian",
            cs: "Czech",
            da: "Danish",
            nl: "Dutch",
            en: "English",
            et: "Estonian",
            tl: "Filipino",
            fi: "Finnish",
            fr: "French",
            gl: "Galician",
            de: "German",
            el: "Greek",
            ht: "Haitian Creole",
            iw: "Hebrew",
            hi: "Hindi",
            hu: "Hungarian",
            is: "Icelandic",
            id: "Indonesian",
            ga: "Irish",
            it: "Italian",
            ja: "Japanese",
            ko: "Korean",
            lv: "Latvian",
            lt: "Lithuanian",
            mk: "Macedonian",
            ms: "Malay",
            mt: "Maltese",
            no: "Norwegian",
            fa: "Persian",
            pl: "Polish",
            pt: "Portuguese",
            ro: "Romanian",
            ru: "Russian",
            sr: "Serbian",
            sk: "Slovak",
            sl: "Slovenian",
            es: "Spanish",
            sw: "Swahili",
            sv: "Swedish",
            tl: "Tagalog",
            th: "Thai",
            tr: "Turkish",
            uk: "Ukrainian",
            vi: "Vietnamese",
            cy: "Welsh",
            yi: "Yiddish"
        }
    };
    mejs.TrackFormatParser = {
        webvvt: {
            pattern_identifier: /^([a-zA-z]+-)?[0-9]+$/,
            pattern_timecode: /^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,
            parse: function(a) {
                var b = 0;
                a = mejs.TrackFormatParser.split2(a, /\r?\n/);
                for (var c = {
                    text: [],
                    times: []
                }, e, d; b < a.length; b++)
                    if (this.pattern_identifier.exec(a[b])) {
                        b++;
                        if ((e = this.pattern_timecode.exec(a[b])) && b < a.length) {
                            b++;
                            d = a[b];
                            for (b++; a[b] !== "" && b < a.length;) {
                                d = d + "\n" + a[b];
                                b++
                            }
                            d = f.trim(d).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
                            c.text.push(d);
                            c.times.push({
                                start: mejs.Utility.convertSMPTEtoSeconds(e[1]) == 0 ? 0.2: mejs.Utility.convertSMPTEtoSeconds(e[1]),
                                stop: mejs.Utility.convertSMPTEtoSeconds(e[3]),
                                settings: e[5]
                            })
                        }
                    }
                return c
            }
        },
        dfxp: {
            parse: function(a) {
                a = f(a).filter("tt");
                var b = 0;
                b = a.children("div").eq(0);
                var c = b.find("p");
                b = a.find("#" + b.attr("style"));
                var e, d;
                a = {
                    text: [],
                    times: []
                };
                if (b.length) {
                    d = b.removeAttr("id").get(0).attributes;
                    if (d.length) {
                        e = {};
                        for (b = 0; b < d.length; b++)
                            e[d[b].name.split(":")[1]] = d[b].value
                    }
                }
                for (b = 0; b < c.length; b++) {
                    var g;
                    d = {
                        start: null,
                        stop: null,
                        style: null
                    };
                    if (c.eq(b).attr("begin"))
                        d.start = mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("begin"));
                    if (!d.start && c.eq(b-1).attr("end"))
                        d.start = mejs.Utility.convertSMPTEtoSeconds(c.eq(b-1).attr("end"));
                    if (c.eq(b).attr("end"))
                        d.stop = mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("end"));
                    if (!d.stop && c.eq(b + 1).attr("begin"))
                        d.stop = mejs.Utility.convertSMPTEtoSeconds(c.eq(b + 1).attr("begin"));
                    if (e) {
                        g = "";
                        for (var k in e)
                            g += k + ":" + e[k] + ";"
                    }
                    if (g)
                        d.style = g;
                    if (d.start == 0)
                        d.start = 0.2;
                    a.times.push(d);
                    d = f.trim(c.eq(b).html()).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
                    "<a href='$1' target='_blank'>$1</a>");
                    a.text.push(d);
                    if (a.times.start == 0)
                        a.times.start = 2
                }
                return a
            }
        },
        split2: function(a, b) {
            return a.split(b)
        }
    };
    if ("x\n\ny".split(/\n/gi).length != 3)
        mejs.TrackFormatParser.split2 = function(a, b) {
            var c = [], e = "", d;
            for (d = 0; d < a.length; d++) {
                e += a.substring(d, d + 1);
                if (b.test(e)) {
                    c.push(e.replace(b, ""));
                    e = ""
                }
            }
            c.push(e);
            return c
        }
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        contextMenuItems: [{
            render: function(a) {
                if (typeof a.enterFullScreen == "undefined")
                    return null;
                return a.isFullScreen ? mejs.i18n.t("Turn off Fullscreen") : mejs.i18n.t("Go Fullscreen")
            },
            click: function(a) {
                a.isFullScreen ? a.exitFullScreen() : a.enterFullScreen()
            }
        }, {
            render: function(a) {
                return a.media.muted ? mejs.i18n.t("Unmute") : mejs.i18n.t("Mute")
            },
            click: function(a) {
                a.media.muted ? a.setMuted(false) : a.setMuted(true)
            }
        }, {
            isSeparator: true
        }, {
            render: function() {
                return mejs.i18n.t("Download Video")
            },
            click: function(a) {
                window.location.href = a.media.currentSrc
            }
        }
        ]
    });
    f.extend(MediaElementPlayer.prototype, {
        buildcontextmenu: function(a) {
            a.contextMenu = f('<div class="mejs-contextmenu"></div>').appendTo(f("body")).hide();
            a.container.bind("contextmenu", function(b) {
                if (a.isContextMenuEnabled) {
                    b.preventDefault();
                    a.renderContextMenu(b.clientX-1, b.clientY-1);
                    return false
                }
            });
            a.container.bind("click", function() {
                a.contextMenu.hide()
            });
            a.contextMenu.bind("mouseleave", function() {
                a.startContextMenuTimer()
            })
        },
        cleancontextmenu: function(a) {
            a.contextMenu.remove()
        },
        isContextMenuEnabled: true,
        enableContextMenu: function() {
            this.isContextMenuEnabled = true
        },
        disableContextMenu: function() {
            this.isContextMenuEnabled = false
        },
        contextMenuTimeout: null,
        startContextMenuTimer: function() {
            var a = this;
            a.killContextMenuTimer();
            a.contextMenuTimer = setTimeout(function() {
                a.hideContextMenu();
                a.killContextMenuTimer()
            }, 750)
        },
        killContextMenuTimer: function() {
            var a = this.contextMenuTimer;
            if (a != null) {
                clearTimeout(a);
                delete a
            }
        },
        hideContextMenu: function() {
            this.contextMenu.hide()
        },
        renderContextMenu: function(a,
        b) {
            for (var c = this, e = "", d = c.options.contextMenuItems, g = 0, k = d.length; g < k; g++)
                if (d[g].isSeparator)
                    e += '<div class="mejs-contextmenu-separator"></div>';
                else {
                    var j = d[g].render(c);
                    if (j != null)
                        e += '<div class="mejs-contextmenu-item" data-itemindex="' + g + '" id="element-' + Math.random() * 1E6 + '">' + j + "</div>"
                }
            c.contextMenu.empty().append(f(e)).css({
                top: b,
                left: a
            }).show();
            c.contextMenu.find(".mejs-contextmenu-item").each(function() {
                var m = f(this), q = parseInt(m.data("itemindex"), 10), p = c.options.contextMenuItems[q];
                typeof p.show !=
                "undefined" && p.show(m, c);
                m.click(function() {
                    typeof p.click != "undefined" && p.click(c);
                    c.contextMenu.hide()
                })
            });
            setTimeout(function() {
                c.killControlsTimer("rev3")
            }, 100)
        }
    })
})(mejs.$);
(function(f) {
    f.extend(mejs.MepDefaults, {
        postrollCloseText: mejs.i18n.t("Close")
    });
    f.extend(MediaElementPlayer.prototype, {
        buildpostroll: function(a, b, c) {
            var e = this.container.find('link[rel="postroll"]').attr("href");
            if (typeof e !== "undefined") {
                a.postroll = f('<div class="mejs-postroll-layer mejs-layer"><a class="mejs-postroll-close" onclick="$(this).parent().hide();return false;">' + this.options.postrollCloseText + '</a><div class="mejs-postroll-layer-content"></div></div>').prependTo(c).hide();
                this.media.addEventListener("ended",
                function() {
                    f.ajax({
                        dataType: "html",
                        url: e,
                        success: function(d) {
                            c.find(".mejs-postroll-layer-content").html(d)
                        }
                    });
                    a.postroll.show()
                }, false)
            }
        }
    })
})(mejs.$);


