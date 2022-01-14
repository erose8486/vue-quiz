var script = {
	data() {
		return {
			question: "",
			answer: "",
			options: "",
			score: 0,
			questionNumber: 1,
			total: 10,
			loading: false,
			startScreen: true,
			gameOver: false,
			subject: "",
			mode: "",
			guessed: false,
			token: ""
		};
	},
	computed: {
		status: function () {
			return (this.questionNumber / this.total) * 100 + "%";
		},
		image: function(){
			if(this.score/this.total<0.4){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Sad_Face_Emoji_grande.png?v=1571606037"
			}else if(this.score/this.total<0.6){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_grande.png?v=1571606037"
			}else if(this.score/this.total<0.9){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Slightly_Smiling_Face_Emoji_87fdae9b-b2af-4619-a37f-e484c5e2e7a4_large.png?v=1571606036"
			}else {
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Happy_Emoji_Icon_5c9b7b25-b215-4457-922d-fef519a08b06_large.png?v=1571606090"
			}
		}
	},
	methods: {
		startGame: function(){
			if(this.mode&&this.subject){
				this.loading=true;
				this.getQuestion();
				this.startScreen = false;
			}
		},
		checkAnswer: function (selected, index) {
			if (!this.guessed) {
				if (this.answer == selected) {
					this.score++;
				} else {
					$("i#" + index).html("x");
				}
				$("i.correct").html("🗸");
				this.guessed = true;
				$("#btns").show();
			}
		},
		nextQuestion: function () {
			this.loading = true;
			this.getQuestion();
			$("#btns").hide();
			$("i").html("");
			this.questionNumber++;
			this.guessed = false;
		},
		finish: function () {
			this.gameOver = true;
		},
		reset: function(){
			this.gameOver= false;
			this.startScreen = true;
			this.guessed= false;
			this.score = 0;
			this.questionNumber = 1;
		},
		getQuestion: function () {
			var reset = this.questionNumber==this.total ? "command=reset&":"";
			var self = this;
			//books:10,history:23
			fetch("https://opentdb.com/api.php?" + reset + "amount=1&type=multiple&category="+self.subject+"&difficulty="+ self.mode+"&token="+self.token)
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						alert("Server returned " + response.status + " : " + response.statusText);
					}
				})
				.then((response) => {
					self.question = response.results[0].question;
					self.answer = response.results[0].correct_answer;
					self.options = response.results[0].incorrect_answers;
					self.options.push(response.results[0].correct_answer);
					self.shuffle(self.options);
					self.loading = false;
				});
		},
		shuffle: function (array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		}
	},
	created: function () {
		var self = this;
		fetch("https://opentdb.com/api_token.php?command=request")
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					alert("Server returned " + response.status + " : " + response.statusText);
				}
			})
			.then((response) => {
				self.token = response.token;
			});
	}
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { id: "app" } }, [
    _c("div", { class: { loaded: !_vm.loading }, attrs: { id: "overlay" } }),
    _vm._v(" "),
    _vm.gameOver
      ? _c("div", { staticStyle: { "text-align": "center" } }, [
          _c("h3", [_vm._v("GAME OVER!")]),
          _vm._v(" "),
          _c("h3", [
            _vm._v("SCORE: " + _vm._s(_vm.score) + " / " + _vm._s(_vm.total))
          ]),
          _vm._v(" "),
          _vm.score / _vm.total < 0.4
            ? _c("h4", [_vm._v("Not too great")])
            : _vm.score / _vm.total < 0.6
            ? _c("h4", [_vm._v("OK")])
            : _vm.score / _vm.total < 0.9
            ? _c("h4", [_vm._v("Nice!")])
            : _c("h4", [_vm._v("Amazing!!")]),
          _vm._v(" "),
          _c("img", { attrs: { src: _vm.image, width: "200/" } }),
          _c("br"),
          _vm._v(" "),
          _c(
            "button",
            { staticClass: "btn-purple", on: { click: _vm.reset } },
            [_vm._v("New Game")]
          )
        ])
      : _vm.startScreen
      ? _c(
          "div",
          { staticStyle: { display: "flex" }, attrs: { id: "start-screen" } },
          [
            _c("div", [
              _c("h4", [_vm._v("Select a subject ")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.subject,
                    expression: "subject"
                  }
                ],
                attrs: { type: "radio", id: "g", name: "subject", value: "9" },
                domProps: { checked: _vm._q(_vm.subject, "9") },
                on: {
                  change: function($event) {
                    _vm.subject = "9";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "g" } }, [_vm._v("General")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.subject,
                    expression: "subject"
                  }
                ],
                attrs: { type: "radio", id: "b", name: "subject", value: "10" },
                domProps: { checked: _vm._q(_vm.subject, "10") },
                on: {
                  change: function($event) {
                    _vm.subject = "10";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "b" } }, [_vm._v("Books")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.subject,
                    expression: "subject"
                  }
                ],
                attrs: { type: "radio", id: "h", name: "subject", value: "23" },
                domProps: { checked: _vm._q(_vm.subject, "23") },
                on: {
                  change: function($event) {
                    _vm.subject = "23";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "h" } }, [_vm._v("History")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.subject,
                    expression: "subject"
                  }
                ],
                attrs: { type: "radio", id: "c", name: "subject", value: "18" },
                domProps: { checked: _vm._q(_vm.subject, "18") },
                on: {
                  change: function($event) {
                    _vm.subject = "18";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "c" } }, [_vm._v("Computers")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.subject,
                    expression: "subject"
                  }
                ],
                attrs: { type: "radio", id: "a", name: "subject", value: "27" },
                domProps: { checked: _vm._q(_vm.subject, "27") },
                on: {
                  change: function($event) {
                    _vm.subject = "27";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "a" } }, [_vm._v("Animals")])
            ]),
            _c("div", { staticStyle: { width: "20px" } }),
            _c("div", [
              _c("h4", [_vm._v("Select a Difficulty")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.mode,
                    expression: "mode"
                  }
                ],
                attrs: { type: "radio", id: "e", name: "mode", value: "easy" },
                domProps: { checked: _vm._q(_vm.mode, "easy") },
                on: {
                  change: function($event) {
                    _vm.mode = "easy";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "e" } }, [_vm._v("Easy")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.mode,
                    expression: "mode"
                  }
                ],
                attrs: {
                  type: "radio",
                  id: "m",
                  name: "mode",
                  value: "medium"
                },
                domProps: { checked: _vm._q(_vm.mode, "medium") },
                on: {
                  change: function($event) {
                    _vm.mode = "medium";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "m" } }, [_vm._v("Medium")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.mode,
                    expression: "mode"
                  }
                ],
                attrs: { type: "radio", id: "ha", name: "mode", value: "hard" },
                domProps: { checked: _vm._q(_vm.mode, "hard") },
                on: {
                  change: function($event) {
                    _vm.mode = "hard";
                  }
                }
              }),
              _vm._v(" "),
              _c("label", { attrs: { for: "ha" } }, [_vm._v("Hard")])
            ]),
            _vm._v(" "),
            _c(
              "button",
              { staticClass: "btn-purple", on: { click: _vm.startGame } },
              [_vm._v("Start")]
            )
          ]
        )
      : _c("div", [
          _c("div", { staticClass: "loader" }, [
            _c("div", { staticClass: "status", style: { width: _vm.status } })
          ]),
          _vm._v(" "),
          _c("h4", {
            staticClass: "question",
            staticStyle: { "text-align": "center" },
            domProps: { innerHTML: _vm._s(_vm.question) }
          }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "options" },
            _vm._l(_vm.options, function(opt, index) {
              return _c("div", [
                _c("i", {
                  class: { correct: opt == _vm.answer },
                  attrs: { id: index }
                }),
                _vm._v(" "),
                _c("button", {
                  domProps: { innerHTML: _vm._s(opt) },
                  on: {
                    click: function($event) {
                      return _vm.checkAnswer(opt, index)
                    }
                  }
                })
              ])
            }),
            0
          ),
          _vm._v(" "),
          _c(
            "span",
            { staticStyle: { display: "none" }, attrs: { id: "btns" } },
            [
              _vm.questionNumber < _vm.total
                ? _c("button", { on: { click: _vm.nextQuestion } }, [
                    _vm._v("\n\t\t\t\tNEXT "),
                    _c("i", { staticClass: "fa fa-arrow-right" })
                  ])
                : _c("button", { on: { click: _vm.finish } }, [
                    _vm._v("DONE "),
                    _c("i", { staticClass: "fa fa-check" })
                  ])
            ]
          )
        ])
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-57f007c4_0", { source: "\n#app {\n\tfont-size: 1.5em;\n\tfont-family: Avenir, Helvetica, Arial, sans-serif;\n\tmargin: 30px auto;\n\tpadding: 10px;\n\tmax-width: 600px;\n}\n#overlay {\n\tposition: absolute;\n\ttop: 0px;\n\tleft: 0px;\n\tbackground-color: rgba(0, 0, 0, 0.6);\n\twidth: 100%;\n\theight: 100%;\n\tz-index: 2;\n}\n#overlay:after {\n\tposition: absolute;\n\tleft: 45%;\n\ttop: 45%;\n\ttransform: translateX(-50%), translateY(-50%);\n\tfont-style: normal;\n\tfont-weight: 900;\n\tcolor: white;\n\tfont-size: 3em;\n\tfont-family: \"Font Awesome 5 Free\";\n\tcontent: \"\\f1ce\";\n\tanimation: spin 2000ms infinite linear;\n}\n#overlay.loaded {\n\tdisplay: none;\n}\n#start-screen input{\n\topacity: 0\n}\n#start-screen label{\n\tdisplay:block;\n\tposition:relative;\n\tbackground-color: lightgrey;\n\tpadding:5px 20px;\n\tborder-radius:4px;\n\tmargin:0;\n}\n#start-screen input:checked + label{\n\tfont-weight: bold;\n\ttext-decoration: underline;\n}\n#start-screen input:checked + label:after{\n\tposition: absolute;\n\ttop:10px;\n\tleft:3px;\n\tdisplay:inline-block;\n\tcontent: \"\";\n\twidth: 13px;\n\theight:13px;\n\tborder: 2px solid #c183e2;\n\tborder-radius: 50%;\n\tbackground-color: rgba(136, 34, 190, 1);\n}\n.loader {\n\tbox-sizing: border-box;\n\tbackground-color: lightgrey;\n\theight: 30px;\n\tborder-radius: 5px;\n\twidth: 100%;\n\tpadding: 4px;\n}\n.loader .status {\n\tbox-sizing: border-box;\n\tbackground-color: green;\n\tborder-radius: 3px 0 0 3px;\n\theight: 100%;\n\ttransition: 1s;\n}\n.options {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n}\n.options div {\n\tbox-sizing: border-box;\n\twidth: 50%;\n\tpadding: 10px;\n\tposition: relative;\n}\n.options div button {\n\tfont-size: inherit;\n\tbackground: linear-gradient(\n\t\t0deg,\n\t\trgba(136, 34, 190, 1) 0%,\n\t\trgba(189, 147, 255, 1) 60%,\n\t\trgba(212, 184, 255, 1) 84%,\n\t\trgba(255, 255, 255, 1) 100%\n\t);\n\tcolor: #4c0066;\n\tfont-weight: bold;\n\twidth: 100%;\n\tmin-height: 100px;\n\tborder-radius: 5px;\n\tborder: none;\n}\n.options div button:hover {\n\tbackground: linear-gradient(\n\t\t0deg,\n\t\trgba(136, 34, 190, 1) 0%,\n\t\trgba(189, 147, 255, 1) 82%,\n\t\trgba(212, 184, 255, 1) 100%,\n\t\trgba(255, 255, 255, 1) 100%\n\t);\n}\n.options div button:focus {\n\toutline: none;\n\tbox-shadow: 0 0 15px 5px rgba(212, 184, 255, 1);\n}\n.options div i:empty {\n\tdisplay: none;\n}\n.options div i {\n\tposition: absolute;\n\ttop: 18px;\n\tright: 18px;\n\twidth: 1.25em;\n\theight: 1.25em;\n\tborder-radius: 50%;\n\tfont-size: 0.75em;\n\ttext-align: center;\n\tvertical-align: center;\n\tbackground-color: #8a0000;\n\tcolor: white;\n}\n.options div i.correct {\n\tbackground-color: green;\n}\n#btns button, .btn-purple{\n\tfloat: right;\n\tmargin: 10px;\n\tfont-size: 1em;\n\tpadding: 4px 6px;\n\tbackground-color: white;\n\tborder: 3px solid #4c0066;\n\tborder-radius: 10px;\n\tcolor: #4c0066;\n\tfont-weight: bold;\n\tcursor: pointer;\n}\n#btns button:hover, .btn-purple:hover {\n\tbackground-color: #faebff;\n}\n@keyframes spin {\nfrom {\n\t\ttransform: rotate(0deg);\n}\nto {\n\t\ttransform: rotate(360deg);\n}\n}\n", map: {"version":3,"sources":["/tmp/codepen/vuejs/src/pen.vue"],"names":[],"mappings":";AAkLA;CACA,gBAAA;CACA,iDAAA;CACA,iBAAA;CACA,aAAA;CACA,gBAAA;AACA;AACA;CACA,kBAAA;CACA,QAAA;CACA,SAAA;CACA,oCAAA;CACA,WAAA;CACA,YAAA;CACA,UAAA;AACA;AACA;CACA,kBAAA;CACA,SAAA;CACA,QAAA;CACA,6CAAA;CACA,kBAAA;CACA,gBAAA;CACA,YAAA;CACA,cAAA;CACA,kCAAA;CACA,gBAAA;CACA,sCAAA;AACA;AACA;CACA,aAAA;AACA;AACA;CACA;AACA;AACA;CACA,aAAA;CACA,iBAAA;CACA,2BAAA;CACA,gBAAA;CACA,iBAAA;CACA,QAAA;AACA;AACA;CACA,iBAAA;CACA,0BAAA;AACA;AACA;CACA,kBAAA;CACA,QAAA;CACA,QAAA;CACA,oBAAA;CACA,WAAA;CACA,WAAA;CACA,WAAA;CACA,yBAAA;CACA,kBAAA;CACA,uCAAA;AACA;AACA;CACA,sBAAA;CACA,2BAAA;CACA,YAAA;CACA,kBAAA;CACA,WAAA;CACA,YAAA;AACA;AACA;CACA,sBAAA;CACA,uBAAA;CACA,0BAAA;CACA,YAAA;CACA,cAAA;AACA;AACA;CACA,aAAA;CACA,eAAA;AACA;AACA;CACA,sBAAA;CACA,UAAA;CACA,aAAA;CACA,kBAAA;AACA;AACA;CACA,kBAAA;CACA;;;;;;EAMA;CACA,cAAA;CACA,iBAAA;CACA,WAAA;CACA,iBAAA;CACA,kBAAA;CACA,YAAA;AACA;AACA;CACA;;;;;;EAMA;AACA;AACA;CACA,aAAA;CACA,+CAAA;AACA;AACA;CACA,aAAA;AACA;AACA;CACA,kBAAA;CACA,SAAA;CACA,WAAA;CACA,aAAA;CACA,cAAA;CACA,kBAAA;CACA,iBAAA;CACA,kBAAA;CACA,sBAAA;CACA,yBAAA;CACA,YAAA;AACA;AACA;CACA,uBAAA;AACA;AACA;CACA,YAAA;CACA,YAAA;CACA,cAAA;CACA,gBAAA;CACA,uBAAA;CACA,yBAAA;CACA,mBAAA;CACA,cAAA;CACA,iBAAA;CACA,eAAA;AACA;AACA;CACA,yBAAA;AACA;AACA;AACA;EACA,uBAAA;AACA;AACA;EACA,yBAAA;AACA;AACA","file":"pen.vue","sourcesContent":["<template>\n\t<div id=\"app\">\n\t\t<div id=\"overlay\" :class=\"{ loaded: !loading }\"></div>\n\t\t<div v-if=\"gameOver\" style=\"text-align: center;\">\n\t\t\t<h3>GAME OVER!</h3>\n\t\t\t<h3>SCORE: {{ score }} / {{ total }}</h3>\n\t\t\t<h4  v-if=\"score/total<0.4\">Not too great</h4>\n\t\t\t<h4  v-else-if=\"score/total<0.6\">OK</h4>\n\t\t\t<h4  v-else-if=\"score/total<0.9\">Nice!</h4>\n\t\t\t<h4  v-else>Amazing!!</h4>\n\t\t\t<img :src=\"image\" width=200/><br>\n\t\t\t<button class=\"btn-purple\" @click=\"reset\">New Game</button>\n\t\t</div>\n\t\t<div v-else-if=\"startScreen\" id=\"start-screen\" style=\"display:flex\">\n\t\t\t<div>\n\t\t\t<h4>Select a subject </h4>\n\t\t\t<input type=\"radio\" id=\"g\" name=\"subject\" value=\"9\" v-model=\"subject\">\n\t\t\t\t<label for=\"g\">General</label>\n\t\t\t<input type=\"radio\" id=\"b\" name=\"subject\" value=\"10\" v-model=\"subject\">\n\t\t\t\t<label for=\"b\">Books</label>\n\t\t\t<input type=\"radio\" id=\"h\" name=\"subject\" value=\"23\" v-model=\"subject\">\n\t\t\t\t<label for=\"h\">History</label>\n\t\t\t<input type=\"radio\" id=\"c\" name=\"subject\" value=\"18\" v-model=\"subject\">\n\t\t\t\t<label for=\"c\">Computers</label>\n\t\t\t<input type=\"radio\" id=\"a\" name=\"subject\" value=\"27\" v-model=\"subject\">\n\t\t\t\t<label for=\"a\">Animals</label>\n\t\t\t</div><div style=\"width:20px\"></div><div>\n\t\t\t<h4>Select a Difficulty</h4>\n\t\t\t<input type=\"radio\" id=\"e\" name=\"mode\" value=\"easy\" v-model=\"mode\">\n\t\t\t<label for=\"e\">Easy</label>\n\t\t\t<input type=\"radio\" id=\"m\" name=\"mode\" value=\"medium\" v-model=\"mode\">\n\t\t\t<label for=\"m\">Medium</label>\n\t\t\t<input type=\"radio\" id=\"ha\" name=\"mode\" value=\"hard\" v-model=\"mode\">\n\t\t\t<label for=\"ha\">Hard</label>\n\t\t\t</div>\n\t\t\t<button class=\"btn-purple\" @click=\"startGame\">Start</button>\n\t\t</div>\n\t\t<div v-else>\n\t\t\t<div class=\"loader\">\n\t\t\t\t<div class=\"status\" v-bind:style=\"{ width: status }\"></div>\n\t\t\t</div>\n\t\t\t<h4 class=\"question\" v-html=\"question\" style=\"text-align:center\"></h4>\n\t\t\t<div class=\"options\">\n\t\t\t\t<div v-for=\"(opt, index) in options\">\n\t\t\t\t\t<i :id=\"index\" :class=\"{ correct: opt == answer }\"></i>\n\t\t\t\t\t<button @click=\"checkAnswer(opt, index)\" v-html=\"opt\"></button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<span id=\"btns\" style=\"display: none;\">\n\t\t\t\t<button v-if=\"questionNumber < total\" @click=\"nextQuestion\">\n\t\t\t\t\tNEXT <i class=\"fa fa-arrow-right\"></i>\n\t\t\t\t</button>\n\t\t\t\t<button v-else @click=\"finish\">DONE <i class=\"fa fa-check\"></i></button>\n\t\t\t</span>\n\t\t</div>\n\t</div>\n</template>\n\n<script>\nexport default {\n\tdata() {\n\t\treturn {\n\t\t\tquestion: \"\",\n\t\t\tanswer: \"\",\n\t\t\toptions: \"\",\n\t\t\tscore: 0,\n\t\t\tquestionNumber: 1,\n\t\t\ttotal: 10,\n\t\t\tloading: false,\n\t\t\tstartScreen: true,\n\t\t\tgameOver: false,\n\t\t\tsubject: \"\",\n\t\t\tmode: \"\",\n\t\t\tguessed: false,\n\t\t\ttoken: \"\"\n\t\t};\n\t},\n\tcomputed: {\n\t\tstatus: function () {\n\t\t\treturn (this.questionNumber / this.total) * 100 + \"%\";\n\t\t},\n\t\timage: function(){\n\t\t\tif(this.score/this.total<0.4){\n\t\t\t\treturn \"https://cdn.shopify.com/s/files/1/1061/1924/products/Sad_Face_Emoji_grande.png?v=1571606037\"\n\t\t\t}else if(this.score/this.total<0.6){\n\t\t\t\treturn \"https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_grande.png?v=1571606037\"\n\t\t\t}else if(this.score/this.total<0.9){\n\t\t\t\treturn \"https://cdn.shopify.com/s/files/1/1061/1924/products/Slightly_Smiling_Face_Emoji_87fdae9b-b2af-4619-a37f-e484c5e2e7a4_large.png?v=1571606036\"\n\t\t\t}else{\n\t\t\t\treturn \"https://cdn.shopify.com/s/files/1/1061/1924/products/Happy_Emoji_Icon_5c9b7b25-b215-4457-922d-fef519a08b06_large.png?v=1571606090\"\n\t\t\t}\n\t\t}\n\t},\n\tmethods: {\n\t\tstartGame: function(){\n\t\t\tif(this.mode&&this.subject){\n\t\t\t\tthis.loading=true;\n\t\t\t\tthis.getQuestion();\n\t\t\t\tthis.startScreen = false;\n\t\t\t}\n\t\t},\n\t\tcheckAnswer: function (selected, index) {\n\t\t\tif (!this.guessed) {\n\t\t\t\tif (this.answer == selected) {\n\t\t\t\t\tthis.score++;\n\t\t\t\t} else {\n\t\t\t\t\t$(\"i#\" + index).html(\"x\");\n\t\t\t\t}\n\t\t\t\t$(\"i.correct\").html(\"🗸\");\n\t\t\t\tthis.guessed = true;\n\t\t\t\t$(\"#btns\").show();\n\t\t\t}\n\t\t},\n\t\tnextQuestion: function () {\n\t\t\tthis.loading = true;\n\t\t\tthis.getQuestion();\n\t\t\t$(\"#btns\").hide();\n\t\t\t$(\"i\").html(\"\");\n\t\t\tthis.questionNumber++;\n\t\t\tthis.guessed = false;\n\t\t},\n\t\tfinish: function () {\n\t\t\tthis.gameOver = true;\n\t\t},\n\t\treset: function(){\n\t\t\tthis.gameOver= false;\n\t\t\tthis.startScreen = true;\n\t\t\tthis.guessed= false;\n\t\t\tthis.score = 0;\n\t\t\tthis.questionNumber = 1;\n\t\t},\n\t\tgetQuestion: function () {\n\t\t\tvar reset = this.questionNumber==this.total ? \"command=reset&\":\"\"\n\t\t\tvar self = this;\n\t\t\t//books:10,history:23\n\t\t\tfetch(\"https://opentdb.com/api.php?\" + reset + \"amount=1&type=multiple&category=\"+self.subject+\"&difficulty=\"+ self.mode+\"&token=\"+self.token)\n\t\t\t\t.then((response) => {\n\t\t\t\t\tif (response.ok) {\n\t\t\t\t\t\treturn response.json();\n\t\t\t\t\t} else {\n\t\t\t\t\t\talert(\"Server returned \" + response.status + \" : \" + response.statusText);\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t\t.then((response) => {\n\t\t\t\t\tself.question = response.results[0].question;\n\t\t\t\t\tself.answer = response.results[0].correct_answer;\n\t\t\t\t\tself.options = response.results[0].incorrect_answers;\n\t\t\t\t\tself.options.push(response.results[0].correct_answer);\n\t\t\t\t\tself.shuffle(self.options);\n\t\t\t\t\tself.loading = false;\n\t\t\t\t});\n\t\t},\n\t\tshuffle: function (array) {\n\t\t\tfor (let i = array.length - 1; i > 0; i--) {\n\t\t\t\tconst j = Math.floor(Math.random() * (i + 1));\n\t\t\t\t[array[i], array[j]] = [array[j], array[i]];\n\t\t\t}\n\t\t}\n\t},\n\tcreated: function () {\n\t\tvar self = this;\n\t\tfetch(\"https://opentdb.com/api_token.php?command=request\")\n\t\t\t.then((response) => {\n\t\t\t\tif (response.ok) {\n\t\t\t\t\treturn response.json();\n\t\t\t\t} else {\n\t\t\t\t\talert(\"Server returned \" + response.status + \" : \" + response.statusText);\n\t\t\t\t}\n\t\t\t})\n\t\t\t.then((response) => {\n\t\t\t\tself.token = response.token;\n\t\t\t})\n\t}\n};\n</script>\n\n<!-- Use preprocessors via the lang attribute! e.g. <style lang=\"scss\"> -->\n<style>\n#app {\n\tfont-size: 1.5em;\n\tfont-family: Avenir, Helvetica, Arial, sans-serif;\n\tmargin: 30px auto;\n\tpadding: 10px;\n\tmax-width: 600px;\n}\n#overlay {\n\tposition: absolute;\n\ttop: 0px;\n\tleft: 0px;\n\tbackground-color: rgba(0, 0, 0, 0.6);\n\twidth: 100%;\n\theight: 100%;\n\tz-index: 2;\n}\n#overlay:after {\n\tposition: absolute;\n\tleft: 45%;\n\ttop: 45%;\n\ttransform: translateX(-50%), translateY(-50%);\n\tfont-style: normal;\n\tfont-weight: 900;\n\tcolor: white;\n\tfont-size: 3em;\n\tfont-family: \"Font Awesome 5 Free\";\n\tcontent: \"\\f1ce\";\n\tanimation: spin 2000ms infinite linear;\n}\n#overlay.loaded {\n\tdisplay: none;\n}\n#start-screen input{\n\topacity: 0\n}\n#start-screen label{\n\tdisplay:block;\n\tposition:relative;\n\tbackground-color: lightgrey;\n\tpadding:5px 20px;\n\tborder-radius:4px;\n\tmargin:0;\n}\n#start-screen input:checked + label{\n\tfont-weight: bold;\n\ttext-decoration: underline;\n}\n#start-screen input:checked + label:after{\n\tposition: absolute;\n\ttop:10px;\n\tleft:3px;\n\tdisplay:inline-block;\n\tcontent: \"\";\n\twidth: 13px;\n\theight:13px;\n\tborder: 2px solid #c183e2;\n\tborder-radius: 50%;\n\tbackground-color: rgba(136, 34, 190, 1);\n}\n.loader {\n\tbox-sizing: border-box;\n\tbackground-color: lightgrey;\n\theight: 30px;\n\tborder-radius: 5px;\n\twidth: 100%;\n\tpadding: 4px;\n}\n.loader .status {\n\tbox-sizing: border-box;\n\tbackground-color: green;\n\tborder-radius: 3px 0 0 3px;\n\theight: 100%;\n\ttransition: 1s;\n}\n.options {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n}\n.options div {\n\tbox-sizing: border-box;\n\twidth: 50%;\n\tpadding: 10px;\n\tposition: relative;\n}\n.options div button {\n\tfont-size: inherit;\n\tbackground: linear-gradient(\n\t\t0deg,\n\t\trgba(136, 34, 190, 1) 0%,\n\t\trgba(189, 147, 255, 1) 60%,\n\t\trgba(212, 184, 255, 1) 84%,\n\t\trgba(255, 255, 255, 1) 100%\n\t);\n\tcolor: #4c0066;\n\tfont-weight: bold;\n\twidth: 100%;\n\tmin-height: 100px;\n\tborder-radius: 5px;\n\tborder: none;\n}\n.options div button:hover {\n\tbackground: linear-gradient(\n\t\t0deg,\n\t\trgba(136, 34, 190, 1) 0%,\n\t\trgba(189, 147, 255, 1) 82%,\n\t\trgba(212, 184, 255, 1) 100%,\n\t\trgba(255, 255, 255, 1) 100%\n\t);\n}\n.options div button:focus {\n\toutline: none;\n\tbox-shadow: 0 0 15px 5px rgba(212, 184, 255, 1);\n}\n.options div i:empty {\n\tdisplay: none;\n}\n.options div i {\n\tposition: absolute;\n\ttop: 18px;\n\tright: 18px;\n\twidth: 1.25em;\n\theight: 1.25em;\n\tborder-radius: 50%;\n\tfont-size: 0.75em;\n\ttext-align: center;\n\tvertical-align: center;\n\tbackground-color: #8a0000;\n\tcolor: white;\n}\n.options div i.correct {\n\tbackground-color: green;\n}\n#btns button, .btn-purple{\n\tfloat: right;\n\tmargin: 10px;\n\tfont-size: 1em;\n\tpadding: 4px 6px;\n\tbackground-color: white;\n\tborder: 3px solid #4c0066;\n\tborder-radius: 10px;\n\tcolor: #4c0066;\n\tfont-weight: bold;\n\tcursor: pointer;\n}\n#btns button:hover, .btn-purple:hover {\n\tbackground-color: #faebff;\n}\n@keyframes spin {\n\tfrom {\n\t\ttransform: rotate(0deg);\n\t}\n\tto {\n\t\ttransform: rotate(360deg);\n\t}\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

export default __vue_component__;