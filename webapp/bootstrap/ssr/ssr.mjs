import { jsx } from "react/jsx-runtime";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
import { r as resolvePageComponent } from "./assets/vendor-koWuargk.mjs";
function t(t3, e2) {
  for (var n2 = 0; n2 < e2.length; n2++) {
    var r2 = e2[n2];
    r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(t3, u(r2.key), r2);
  }
}
function e(e2, n2, r2) {
  return n2 && t(e2.prototype, n2), Object.defineProperty(e2, "prototype", { writable: false }), e2;
}
function n() {
  return n = Object.assign ? Object.assign.bind() : function(t3) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var n2 = arguments[e2];
      for (var r2 in n2) ({}).hasOwnProperty.call(n2, r2) && (t3[r2] = n2[r2]);
    }
    return t3;
  }, n.apply(null, arguments);
}
function r(t3) {
  return r = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t4) {
    return t4.__proto__ || Object.getPrototypeOf(t4);
  }, r(t3);
}
function o() {
  try {
    var t3 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t4) {
  }
  return (o = function() {
    return !!t3;
  })();
}
function i(t3, e2) {
  return i = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t4, e3) {
    return t4.__proto__ = e3, t4;
  }, i(t3, e2);
}
function u(t3) {
  var e2 = (function(t4) {
    if ("object" != typeof t4 || !t4) return t4;
    var e3 = t4[Symbol.toPrimitive];
    if (void 0 !== e3) {
      var n2 = e3.call(t4, "string");
      if ("object" != typeof n2) return n2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t4);
  })(t3);
  return "symbol" == typeof e2 ? e2 : e2 + "";
}
function f(t3) {
  var e2 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
  return f = function(t4) {
    if (null === t4 || !(function(t5) {
      try {
        return -1 !== Function.toString.call(t5).indexOf("[native code]");
      } catch (e3) {
        return "function" == typeof t5;
      }
    })(t4)) return t4;
    if ("function" != typeof t4) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== e2) {
      if (e2.has(t4)) return e2.get(t4);
      e2.set(t4, n2);
    }
    function n2() {
      return (function(t5, e3, n3) {
        if (o()) return Reflect.construct.apply(null, arguments);
        var r2 = [null];
        r2.push.apply(r2, e3);
        var u2 = new (t5.bind.apply(t5, r2))();
        return n3 && i(u2, n3.prototype), u2;
      })(t4, arguments, r(this).constructor);
    }
    return n2.prototype = Object.create(t4.prototype, { constructor: { value: n2, enumerable: false, writable: true, configurable: true } }), i(n2, t4);
  }, f(t3);
}
const c = String.prototype.replace, a = /%20/g, l = { RFC1738: function(t3) {
  return c.call(t3, a, "+");
}, RFC3986: function(t3) {
  return String(t3);
} };
var s = "RFC3986";
const p = Object.prototype.hasOwnProperty, y = Array.isArray, d = (function() {
  const t3 = [];
  for (let e2 = 0; e2 < 256; ++e2) t3.push("%" + ((e2 < 16 ? "0" : "") + e2.toString(16)).toUpperCase());
  return t3;
})(), b = function t2(e2, n2, r2) {
  if (!n2) return e2;
  if ("object" != typeof n2) {
    if (y(e2)) e2.push(n2);
    else {
      if (!e2 || "object" != typeof e2) return [e2, n2];
      (r2 && (r2.plainObjects || r2.allowPrototypes) || !p.call(Object.prototype, n2)) && (e2[n2] = true);
    }
    return e2;
  }
  if (!e2 || "object" != typeof e2) return [e2].concat(n2);
  let o2 = e2;
  return y(e2) && !y(n2) && (o2 = (function(t3, e3) {
    const n3 = e3 && e3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
    for (let e4 = 0; e4 < t3.length; ++e4) void 0 !== t3[e4] && (n3[e4] = t3[e4]);
    return n3;
  })(e2, r2)), y(e2) && y(n2) ? (n2.forEach(function(n3, o3) {
    if (p.call(e2, o3)) {
      const i2 = e2[o3];
      i2 && "object" == typeof i2 && n3 && "object" == typeof n3 ? e2[o3] = t2(i2, n3, r2) : e2.push(n3);
    } else e2[o3] = n3;
  }), e2) : Object.keys(n2).reduce(function(e3, o3) {
    const i2 = n2[o3];
    return e3[o3] = p.call(e3, o3) ? t2(e3[o3], i2, r2) : i2, e3;
  }, o2);
}, h = 1024, v = function(t3, e2) {
  return [].concat(t3, e2);
}, m = function(t3, e2) {
  if (y(t3)) {
    const n2 = [];
    for (let r2 = 0; r2 < t3.length; r2 += 1) n2.push(e2(t3[r2]));
    return n2;
  }
  return e2(t3);
}, g = Object.prototype.hasOwnProperty, w = { brackets: function(t3) {
  return t3 + "[]";
}, comma: "comma", indices: function(t3, e2) {
  return t3 + "[" + e2 + "]";
}, repeat: function(t3) {
  return t3;
} }, j = Array.isArray, E = Array.prototype.push, O = function(t3, e2) {
  E.apply(t3, j(e2) ? e2 : [e2]);
}, T = Date.prototype.toISOString, R = { addQueryPrefix: false, allowDots: false, allowEmptyArrays: false, arrayFormat: "indices", charset: "utf-8", charsetSentinel: false, delimiter: "&", encode: true, encodeDotInKeys: false, encoder: function(t3, e2, n2, r2, o2) {
  if (0 === t3.length) return t3;
  let i2 = t3;
  if ("symbol" == typeof t3 ? i2 = Symbol.prototype.toString.call(t3) : "string" != typeof t3 && (i2 = String(t3)), "iso-8859-1" === n2) return escape(i2).replace(/%u[0-9a-f]{4}/gi, function(t4) {
    return "%26%23" + parseInt(t4.slice(2), 16) + "%3B";
  });
  let u2 = "";
  for (let t4 = 0; t4 < i2.length; t4 += h) {
    const e3 = i2.length >= h ? i2.slice(t4, t4 + h) : i2, n3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      let r3 = e3.charCodeAt(t5);
      45 === r3 || 46 === r3 || 95 === r3 || 126 === r3 || r3 >= 48 && r3 <= 57 || r3 >= 65 && r3 <= 90 || r3 >= 97 && r3 <= 122 || "RFC1738" === o2 && (40 === r3 || 41 === r3) ? n3[n3.length] = e3.charAt(t5) : r3 < 128 ? n3[n3.length] = d[r3] : r3 < 2048 ? n3[n3.length] = d[192 | r3 >> 6] + d[128 | 63 & r3] : r3 < 55296 || r3 >= 57344 ? n3[n3.length] = d[224 | r3 >> 12] + d[128 | r3 >> 6 & 63] + d[128 | 63 & r3] : (t5 += 1, r3 = 65536 + ((1023 & r3) << 10 | 1023 & e3.charCodeAt(t5)), n3[n3.length] = d[240 | r3 >> 18] + d[128 | r3 >> 12 & 63] + d[128 | r3 >> 6 & 63] + d[128 | 63 & r3]);
    }
    u2 += n3.join("");
  }
  return u2;
}, encodeValuesOnly: false, format: s, formatter: l[s], indices: false, serializeDate: function(t3) {
  return T.call(t3);
}, skipNulls: false, strictNullHandling: false }, k = {}, S = function(t3, e2, n2, r2, o2, i2, u2, f2, c2, a2, l2, s2, p2, y2, d2, b2, h2, v2) {
  let g2 = t3, w2 = v2, E2 = 0, T2 = false;
  for (; void 0 !== (w2 = w2.get(k)) && !T2; ) {
    const e3 = w2.get(t3);
    if (E2 += 1, void 0 !== e3) {
      if (e3 === E2) throw new RangeError("Cyclic object value");
      T2 = true;
    }
    void 0 === w2.get(k) && (E2 = 0);
  }
  if ("function" == typeof a2 ? g2 = a2(e2, g2) : g2 instanceof Date ? g2 = p2(g2) : "comma" === n2 && j(g2) && (g2 = m(g2, function(t4) {
    return t4 instanceof Date ? p2(t4) : t4;
  })), null === g2) {
    if (i2) return c2 && !b2 ? c2(e2, R.encoder, h2, "key", y2) : e2;
    g2 = "";
  }
  if ("string" == typeof (I2 = g2) || "number" == typeof I2 || "boolean" == typeof I2 || "symbol" == typeof I2 || "bigint" == typeof I2 || (function(t4) {
    return !(!t4 || "object" != typeof t4 || !(t4.constructor && t4.constructor.isBuffer && t4.constructor.isBuffer(t4)));
  })(g2)) return c2 ? [d2(b2 ? e2 : c2(e2, R.encoder, h2, "key", y2)) + "=" + d2(c2(g2, R.encoder, h2, "value", y2))] : [d2(e2) + "=" + d2(String(g2))];
  var I2;
  const A2 = [];
  if (void 0 === g2) return A2;
  let D2;
  if ("comma" === n2 && j(g2)) b2 && c2 && (g2 = m(g2, c2)), D2 = [{ value: g2.length > 0 ? g2.join(",") || null : void 0 }];
  else if (j(a2)) D2 = a2;
  else {
    const t4 = Object.keys(g2);
    D2 = l2 ? t4.sort(l2) : t4;
  }
  const $2 = f2 ? e2.replace(/\./g, "%2E") : e2, N2 = r2 && j(g2) && 1 === g2.length ? $2 + "[]" : $2;
  if (o2 && j(g2) && 0 === g2.length) return N2 + "[]";
  for (let e3 = 0; e3 < D2.length; ++e3) {
    const m2 = D2[e3], w3 = "object" == typeof m2 && void 0 !== m2.value ? m2.value : g2[m2];
    if (u2 && null === w3) continue;
    const T3 = s2 && f2 ? m2.replace(/\./g, "%2E") : m2, R2 = j(g2) ? "function" == typeof n2 ? n2(N2, T3) : N2 : N2 + (s2 ? "." + T3 : "[" + T3 + "]");
    v2.set(t3, E2);
    const I3 = /* @__PURE__ */ new WeakMap();
    I3.set(k, v2), O(A2, S(w3, R2, n2, r2, o2, i2, u2, f2, "comma" === n2 && b2 && j(g2) ? null : c2, a2, l2, s2, p2, y2, d2, b2, h2, I3));
  }
  return A2;
}, I = Object.prototype.hasOwnProperty, A = Array.isArray, D = { allowDots: false, allowEmptyArrays: false, allowPrototypes: false, allowSparse: false, arrayLimit: 20, charset: "utf-8", charsetSentinel: false, comma: false, decodeDotInKeys: false, decoder: function(t3, e2, n2) {
  const r2 = t3.replace(/\+/g, " ");
  if ("iso-8859-1" === n2) return r2.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(r2);
  } catch (t4) {
    return r2;
  }
}, delimiter: "&", depth: 5, duplicates: "combine", ignoreQueryPrefix: false, interpretNumericEntities: false, parameterLimit: 1e3, parseArrays: true, plainObjects: false, strictNullHandling: false }, $ = function(t3) {
  return t3.replace(/&#(\d+);/g, function(t4, e2) {
    return String.fromCharCode(parseInt(e2, 10));
  });
}, N = function(t3, e2) {
  return t3 && "string" == typeof t3 && e2.comma && t3.indexOf(",") > -1 ? t3.split(",") : t3;
}, x = function(t3, e2, n2, r2) {
  if (!t3) return;
  const o2 = n2.allowDots ? t3.replace(/\.([^.[]+)/g, "[$1]") : t3, i2 = /(\[[^[\]]*])/g;
  let u2 = n2.depth > 0 && /(\[[^[\]]*])/.exec(o2);
  const f2 = u2 ? o2.slice(0, u2.index) : o2, c2 = [];
  if (f2) {
    if (!n2.plainObjects && I.call(Object.prototype, f2) && !n2.allowPrototypes) return;
    c2.push(f2);
  }
  let a2 = 0;
  for (; n2.depth > 0 && null !== (u2 = i2.exec(o2)) && a2 < n2.depth; ) {
    if (a2 += 1, !n2.plainObjects && I.call(Object.prototype, u2[1].slice(1, -1)) && !n2.allowPrototypes) return;
    c2.push(u2[1]);
  }
  return u2 && c2.push("[" + o2.slice(u2.index) + "]"), (function(t4, e3, n3, r3) {
    let o3 = r3 ? e3 : N(e3, n3);
    for (let e4 = t4.length - 1; e4 >= 0; --e4) {
      let r4;
      const i3 = t4[e4];
      if ("[]" === i3 && n3.parseArrays) r4 = n3.allowEmptyArrays && "" === o3 ? [] : [].concat(o3);
      else {
        r4 = n3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        const t5 = "[" === i3.charAt(0) && "]" === i3.charAt(i3.length - 1) ? i3.slice(1, -1) : i3, e5 = n3.decodeDotInKeys ? t5.replace(/%2E/g, ".") : t5, u3 = parseInt(e5, 10);
        n3.parseArrays || "" !== e5 ? !isNaN(u3) && i3 !== e5 && String(u3) === e5 && u3 >= 0 && n3.parseArrays && u3 <= n3.arrayLimit ? (r4 = [], r4[u3] = o3) : "__proto__" !== e5 && (r4[e5] = o3) : r4 = { 0: o3 };
      }
      o3 = r4;
    }
    return o3;
  })(c2, e2, n2, r2);
};
function C(t3, e2) {
  const n2 = /* @__PURE__ */ (function(t4) {
    return D;
  })();
  if ("" === t3 || null == t3) return n2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const r2 = "string" == typeof t3 ? (function(t4, e3) {
    const n3 = { __proto__: null }, r3 = (e3.ignoreQueryPrefix ? t4.replace(/^\?/, "") : t4).split(e3.delimiter, Infinity === e3.parameterLimit ? void 0 : e3.parameterLimit);
    let o3, i3 = -1, u2 = e3.charset;
    if (e3.charsetSentinel) for (o3 = 0; o3 < r3.length; ++o3) 0 === r3[o3].indexOf("utf8=") && ("utf8=%E2%9C%93" === r3[o3] ? u2 = "utf-8" : "utf8=%26%2310003%3B" === r3[o3] && (u2 = "iso-8859-1"), i3 = o3, o3 = r3.length);
    for (o3 = 0; o3 < r3.length; ++o3) {
      if (o3 === i3) continue;
      const t5 = r3[o3], f2 = t5.indexOf("]="), c2 = -1 === f2 ? t5.indexOf("=") : f2 + 1;
      let a2, l2;
      -1 === c2 ? (a2 = e3.decoder(t5, D.decoder, u2, "key"), l2 = e3.strictNullHandling ? null : "") : (a2 = e3.decoder(t5.slice(0, c2), D.decoder, u2, "key"), l2 = m(N(t5.slice(c2 + 1), e3), function(t6) {
        return e3.decoder(t6, D.decoder, u2, "value");
      })), l2 && e3.interpretNumericEntities && "iso-8859-1" === u2 && (l2 = $(l2)), t5.indexOf("[]=") > -1 && (l2 = A(l2) ? [l2] : l2);
      const s2 = I.call(n3, a2);
      s2 && "combine" === e3.duplicates ? n3[a2] = v(n3[a2], l2) : s2 && "last" !== e3.duplicates || (n3[a2] = l2);
    }
    return n3;
  })(t3, n2) : t3;
  let o2 = n2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const i2 = Object.keys(r2);
  for (let e3 = 0; e3 < i2.length; ++e3) {
    const u2 = i2[e3], f2 = x(u2, r2[u2], n2, "string" == typeof t3);
    o2 = b(o2, f2, n2);
  }
  return true === n2.allowSparse ? o2 : (function(t4) {
    const e3 = [{ obj: { o: t4 }, prop: "o" }], n3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      const r3 = e3[t5], o3 = r3.obj[r3.prop], i3 = Object.keys(o3);
      for (let t6 = 0; t6 < i3.length; ++t6) {
        const r4 = i3[t6], u2 = o3[r4];
        "object" == typeof u2 && null !== u2 && -1 === n3.indexOf(u2) && (e3.push({ obj: o3, prop: r4 }), n3.push(u2));
      }
    }
    return (function(t5) {
      for (; t5.length > 1; ) {
        const e4 = t5.pop(), n4 = e4.obj[e4.prop];
        if (y(n4)) {
          const t6 = [];
          for (let e5 = 0; e5 < n4.length; ++e5) void 0 !== n4[e5] && t6.push(n4[e5]);
          e4.obj[e4.prop] = t6;
        }
      }
    })(e3), t4;
  })(o2);
}
var P = /* @__PURE__ */ (function() {
  function t3(t4, e2, n3) {
    var r2, o2;
    this.name = t4, this.definition = e2, this.bindings = null != (r2 = e2.bindings) ? r2 : {}, this.wheres = null != (o2 = e2.wheres) ? o2 : {}, this.config = n3;
  }
  var n2 = t3.prototype;
  return n2.matchesUrl = function(t4) {
    var e2, n3 = this;
    if (!this.definition.methods.includes("GET")) return false;
    var r2 = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, function(t5, e3, r3, o3) {
      var i3, u3 = "(?<" + r3 + ">" + ((null == (i3 = n3.wheres[r3]) ? void 0 : i3.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+") + ")";
      return o3 ? "(" + e3 + u3 + ")?" : "" + e3 + u3;
    }).replace(/^\w+:\/\//, ""), o2 = t4.replace(/^\w+:\/\//, "").split("?"), i2 = o2[0], u2 = o2[1], f2 = null != (e2 = new RegExp("^" + r2 + "/?$").exec(i2)) ? e2 : new RegExp("^" + r2 + "/?$").exec(decodeURI(i2));
    if (f2) {
      for (var c2 in f2.groups) f2.groups[c2] = "string" == typeof f2.groups[c2] ? decodeURIComponent(f2.groups[c2]) : f2.groups[c2];
      return { params: f2.groups, query: C(u2) };
    }
    return false;
  }, n2.compile = function(t4) {
    var e2 = this;
    return this.parameterSegments.length ? this.template.replace(/{([^}?]+)(\??)}/g, function(n3, r2, o2) {
      var i2, u2;
      if (!o2 && [null, void 0].includes(t4[r2])) throw new Error("Ziggy error: '" + r2 + "' parameter is required for route '" + e2.name + "'.");
      if (e2.wheres[r2] && !new RegExp("^" + (o2 ? "(" + e2.wheres[r2] + ")?" : e2.wheres[r2]) + "$").test(null != (u2 = t4[r2]) ? u2 : "")) throw new Error("Ziggy error: '" + r2 + "' parameter '" + t4[r2] + "' does not match required format '" + e2.wheres[r2] + "' for route '" + e2.name + "'.");
      return encodeURI(null != (i2 = t4[r2]) ? i2 : "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "") : this.template;
  }, e(t3, [{ key: "template", get: function() {
    var t4 = (this.origin + "/" + this.definition.uri).replace(/\/+$/, "");
    return "" === t4 ? "/" : t4;
  } }, { key: "origin", get: function() {
    return this.config.absolute ? this.definition.domain ? "" + this.config.url.match(/^\w+:\/\//)[0] + this.definition.domain + (this.config.port ? ":" + this.config.port : "") : this.config.url : "";
  } }, { key: "parameterSegments", get: function() {
    var t4, e2;
    return null != (t4 = null == (e2 = this.template.match(/{[^}?]+\??}/g)) ? void 0 : e2.map(function(t5) {
      return { name: t5.replace(/{|\??}/g, ""), required: !/\?}$/.test(t5) };
    })) ? t4 : [];
  } }]);
})(), Z = /* @__PURE__ */ (function(t3) {
  function r2(e2, r3, o3, i2) {
    var u3;
    if (void 0 === o3 && (o3 = true), (u3 = t3.call(this) || this).t = null != i2 ? i2 : "undefined" != typeof Ziggy ? Ziggy : null == globalThis ? void 0 : globalThis.Ziggy, !u3.t && "undefined" != typeof document && document.getElementById("ziggy-routes-json") && (globalThis.Ziggy = JSON.parse(document.getElementById("ziggy-routes-json").textContent), u3.t = globalThis.Ziggy), u3.t = n({}, u3.t, { absolute: o3 }), e2) {
      if (!u3.t.routes[e2]) throw new Error("Ziggy error: route '" + e2 + "' is not in the route list.");
      u3.i = new P(e2, u3.t.routes[e2], u3.t), u3.u = u3.l(r3);
    }
    return u3;
  }
  var o2, u2;
  u2 = t3, (o2 = r2).prototype = Object.create(u2.prototype), o2.prototype.constructor = o2, i(o2, u2);
  var f2 = r2.prototype;
  return f2.toString = function() {
    var t4 = this, e2 = Object.keys(this.u).filter(function(e3) {
      return !t4.i.parameterSegments.some(function(t5) {
        return t5.name === e3;
      });
    }).filter(function(t5) {
      return "_query" !== t5;
    }).reduce(function(e3, r3) {
      var o3;
      return n({}, e3, ((o3 = {})[r3] = t4.u[r3], o3));
    }, {});
    return this.i.compile(this.u) + (function(t5, e3) {
      let n2 = t5;
      const r3 = (function(t6) {
        if (!t6) return R;
        if (void 0 !== t6.allowEmptyArrays && "boolean" != typeof t6.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        if (void 0 !== t6.encodeDotInKeys && "boolean" != typeof t6.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        if (null != t6.encoder && "function" != typeof t6.encoder) throw new TypeError("Encoder has to be a function.");
        const e4 = t6.charset || R.charset;
        if (void 0 !== t6.charset && "utf-8" !== t6.charset && "iso-8859-1" !== t6.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        let n3 = s;
        if (void 0 !== t6.format) {
          if (!g.call(l, t6.format)) throw new TypeError("Unknown format option provided.");
          n3 = t6.format;
        }
        const r4 = l[n3];
        let o4, i3 = R.filter;
        if (("function" == typeof t6.filter || j(t6.filter)) && (i3 = t6.filter), o4 = t6.arrayFormat in w ? t6.arrayFormat : "indices" in t6 ? t6.indices ? "indices" : "repeat" : R.arrayFormat, "commaRoundTrip" in t6 && "boolean" != typeof t6.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        return { addQueryPrefix: "boolean" == typeof t6.addQueryPrefix ? t6.addQueryPrefix : R.addQueryPrefix, allowDots: void 0 === t6.allowDots ? true === t6.encodeDotInKeys || R.allowDots : !!t6.allowDots, allowEmptyArrays: "boolean" == typeof t6.allowEmptyArrays ? !!t6.allowEmptyArrays : R.allowEmptyArrays, arrayFormat: o4, charset: e4, charsetSentinel: "boolean" == typeof t6.charsetSentinel ? t6.charsetSentinel : R.charsetSentinel, commaRoundTrip: t6.commaRoundTrip, delimiter: void 0 === t6.delimiter ? R.delimiter : t6.delimiter, encode: "boolean" == typeof t6.encode ? t6.encode : R.encode, encodeDotInKeys: "boolean" == typeof t6.encodeDotInKeys ? t6.encodeDotInKeys : R.encodeDotInKeys, encoder: "function" == typeof t6.encoder ? t6.encoder : R.encoder, encodeValuesOnly: "boolean" == typeof t6.encodeValuesOnly ? t6.encodeValuesOnly : R.encodeValuesOnly, filter: i3, format: n3, formatter: r4, serializeDate: "function" == typeof t6.serializeDate ? t6.serializeDate : R.serializeDate, skipNulls: "boolean" == typeof t6.skipNulls ? t6.skipNulls : R.skipNulls, sort: "function" == typeof t6.sort ? t6.sort : null, strictNullHandling: "boolean" == typeof t6.strictNullHandling ? t6.strictNullHandling : R.strictNullHandling };
      })(e3);
      let o3, i2;
      "function" == typeof r3.filter ? (i2 = r3.filter, n2 = i2("", n2)) : j(r3.filter) && (i2 = r3.filter, o3 = i2);
      const u3 = [];
      if ("object" != typeof n2 || null === n2) return "";
      const f3 = w[r3.arrayFormat], c2 = "comma" === f3 && r3.commaRoundTrip;
      o3 || (o3 = Object.keys(n2)), r3.sort && o3.sort(r3.sort);
      const a2 = /* @__PURE__ */ new WeakMap();
      for (let t6 = 0; t6 < o3.length; ++t6) {
        const e4 = o3[t6];
        r3.skipNulls && null === n2[e4] || O(u3, S(n2[e4], e4, f3, c2, r3.allowEmptyArrays, r3.strictNullHandling, r3.skipNulls, r3.encodeDotInKeys, r3.encode ? r3.encoder : null, r3.filter, r3.sort, r3.allowDots, r3.serializeDate, r3.format, r3.formatter, r3.encodeValuesOnly, r3.charset, a2));
      }
      const p2 = u3.join(r3.delimiter);
      let y2 = true === r3.addQueryPrefix ? "?" : "";
      return r3.charsetSentinel && (y2 += "iso-8859-1" === r3.charset ? "utf8=%26%2310003%3B&" : "utf8=%E2%9C%93&"), p2.length > 0 ? y2 + p2 : "";
    })(n({}, e2, this.u._query), { addQueryPrefix: true, arrayFormat: "indices", encodeValuesOnly: true, skipNulls: true, encoder: function(t5, e3) {
      return "boolean" == typeof t5 ? Number(t5) : e3(t5);
    } });
  }, f2.p = function(t4) {
    var e2 = this;
    t4 ? this.t.absolute && t4.startsWith("/") && (t4 = this.h().host + t4) : t4 = this.v();
    var r3 = {}, o3 = Object.entries(this.t.routes).find(function(n2) {
      return r3 = new P(n2[0], n2[1], e2.t).matchesUrl(t4);
    }) || [void 0, void 0];
    return n({ name: o3[0] }, r3, { route: o3[1] });
  }, f2.v = function() {
    var t4 = this.h(), e2 = t4.pathname, n2 = t4.search;
    return (this.t.absolute ? t4.host + e2 : e2.replace(this.t.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + n2;
  }, f2.current = function(t4, e2) {
    var r3 = this.p(), o3 = r3.name, i2 = r3.params, u3 = r3.query, f3 = r3.route;
    if (!t4) return o3;
    var c2 = new RegExp("^" + t4.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$").test(o3);
    if ([null, void 0].includes(e2) || !c2) return c2;
    var a2 = new P(o3, f3, this.t);
    e2 = this.l(e2, a2);
    var l2 = n({}, i2, u3);
    if (Object.values(e2).every(function(t5) {
      return !t5;
    }) && !Object.values(l2).some(function(t5) {
      return void 0 !== t5;
    })) return true;
    var s2 = function(t5, e3) {
      return Object.entries(t5).every(function(t6) {
        var n2 = t6[0], r4 = t6[1];
        return Array.isArray(r4) && Array.isArray(e3[n2]) ? r4.every(function(t7) {
          return e3[n2].includes(t7) || e3[n2].includes(decodeURIComponent(t7));
        }) : "object" == typeof r4 && "object" == typeof e3[n2] && null !== r4 && null !== e3[n2] ? s2(r4, e3[n2]) : e3[n2] == r4 || e3[n2] == decodeURIComponent(r4);
      });
    };
    return s2(e2, l2);
  }, f2.h = function() {
    var t4, e2, n2, r3, o3, i2, u3 = "undefined" != typeof window ? window.location : {}, f3 = u3.host, c2 = u3.pathname, a2 = u3.search;
    return { host: null != (t4 = null == (e2 = this.t.location) ? void 0 : e2.host) ? t4 : void 0 === f3 ? "" : f3, pathname: null != (n2 = null == (r3 = this.t.location) ? void 0 : r3.pathname) ? n2 : void 0 === c2 ? "" : c2, search: null != (o3 = null == (i2 = this.t.location) ? void 0 : i2.search) ? o3 : void 0 === a2 ? "" : a2 };
  }, f2.has = function(t4) {
    return this.t.routes.hasOwnProperty(t4);
  }, f2.l = function(t4, e2) {
    var r3 = this;
    void 0 === t4 && (t4 = {}), void 0 === e2 && (e2 = this.i), null != t4 || (t4 = {}), t4 = ["string", "number"].includes(typeof t4) ? [t4] : t4;
    var o3 = e2.parameterSegments.filter(function(t5) {
      return !r3.t.defaults[t5.name];
    });
    if (Array.isArray(t4)) t4 = t4.reduce(function(t5, e3, r4) {
      var i3, u3;
      return n({}, t5, o3[r4] ? ((i3 = {})[o3[r4].name] = e3, i3) : "object" == typeof e3 ? e3 : ((u3 = {})[e3] = "", u3));
    }, {});
    else if (1 === o3.length && !t4[o3[0].name] && (t4.hasOwnProperty(Object.values(e2.bindings)[0]) || t4.hasOwnProperty("id"))) {
      var i2;
      (i2 = {})[o3[0].name] = t4, t4 = i2;
    }
    return n({}, this.m(e2), this.j(t4, e2));
  }, f2.m = function(t4) {
    var e2 = this;
    return t4.parameterSegments.filter(function(t5) {
      return e2.t.defaults[t5.name];
    }).reduce(function(t5, r3, o3) {
      var i2, u3 = r3.name;
      return n({}, t5, ((i2 = {})[u3] = e2.t.defaults[u3], i2));
    }, {});
  }, f2.j = function(t4, e2) {
    var r3 = e2.bindings, o3 = e2.parameterSegments;
    return Object.entries(t4).reduce(function(t5, e3) {
      var i2, u3, f3 = e3[0], c2 = e3[1];
      if (!c2 || "object" != typeof c2 || Array.isArray(c2) || !o3.some(function(t6) {
        return t6.name === f3;
      })) return n({}, t5, ((u3 = {})[f3] = c2, u3));
      if (!c2.hasOwnProperty(r3[f3])) {
        if (!c2.hasOwnProperty("id")) throw new Error("Ziggy error: object passed as '" + f3 + "' parameter is missing route model binding key '" + r3[f3] + "'.");
        r3[f3] = "id";
      }
      return n({}, t5, ((i2 = {})[f3] = c2[r3[f3]], i2));
    }, {});
  }, f2.valueOf = function() {
    return this.toString();
  }, e(r2, [{ key: "params", get: function() {
    var t4 = this.p();
    return n({}, t4.params, t4.query);
  } }, { key: "routeParams", get: function() {
    return this.p().params;
  } }, { key: "queryParams", get: function() {
    return this.p().query;
  } }]);
})(/* @__PURE__ */ f(String));
function _(t3, e2, n2, r2) {
  var o2 = new Z(t3, e2, n2, r2);
  return t3 ? o2.toString() : o2;
}
const appName = "Linea di gioco";
function titleCallback(title) {
  return `${title} - ${appName}`;
}
function resolvePage(name) {
  return resolvePageComponent(
    `./Pages/${name}.jsx`,
    /* @__PURE__ */ Object.assign({ "./Pages/Admin/Categories.jsx": () => import("./assets/Categories-CBHHh3n1.mjs"), "./Pages/Admin/Dashboard.jsx": () => import("./assets/Dashboard-Bwq-TpYB.mjs"), "./Pages/Admin/Media.jsx": () => import("./assets/Media-CG0HmQDV.mjs"), "./Pages/Admin/Pages.jsx": () => import("./assets/Pages-D2UhrYDE.mjs"), "./Pages/Admin/Posts.jsx": () => import("./assets/Posts-CheGpotj.mjs"), "./Pages/Admin/Settings.jsx": () => import("./assets/Settings-C_YcJe9v.mjs"), "./Pages/Admin/Tensions.jsx": () => import("./assets/Tensions-DkXyp3Db.mjs"), "./Pages/Admin/Users.jsx": () => import("./assets/Users-BYcnES6P.mjs"), "./Pages/Auth/ConfirmPassword.jsx": () => import("./assets/ConfirmPassword-BmQwph0C.mjs"), "./Pages/Auth/ForgotPassword.jsx": () => import("./assets/ForgotPassword-CPd-8fXz.mjs"), "./Pages/Auth/Login.jsx": () => import("./assets/Login-DMxr9fEv.mjs"), "./Pages/Auth/Register.jsx": () => import("./assets/Register-CQ0JFRg2.mjs"), "./Pages/Auth/ResetPassword.jsx": () => import("./assets/ResetPassword-8SarpTMm.mjs"), "./Pages/Auth/VerifyEmail.jsx": () => import("./assets/VerifyEmail-ChTwwVN1.mjs"), "./Pages/Blog/About.jsx": () => import("./assets/About-D_9TaxKk.mjs"), "./Pages/Blog/Articles/Index.jsx": () => import("./assets/Index-CNSf--oV.mjs"), "./Pages/Blog/Articles/Show.jsx": () => import("./assets/Show-ClAXV20k.mjs"), "./Pages/Blog/Contact.jsx": () => import("./assets/Contact-BDO8qiOI.mjs"), "./Pages/Blog/Newsletter.jsx": () => import("./assets/Newsletter-DSbN3JtA.mjs"), "./Pages/Legal/CookiePolicy.jsx": () => import("./assets/CookiePolicy-D4mb5r3B.mjs"), "./Pages/Legal/PrivacyPolicy.jsx": () => import("./assets/PrivacyPolicy-BfbWFOxq.mjs"), "./Pages/Profile/Edit.jsx": () => import("./assets/Edit-JBwqH-br.mjs"), "./Pages/Profile/Partials/DeleteUserForm.jsx": () => import("./assets/DeleteUserForm-Uhkww5qD.mjs"), "./Pages/Profile/Partials/UpdatePasswordForm.jsx": () => import("./assets/UpdatePasswordForm-DrpJAyAX.mjs"), "./Pages/Profile/Partials/UpdateProfileInformationForm.jsx": () => import("./assets/UpdateProfileInformationForm-DwngIx5O.mjs"), "./Pages/Welcome.jsx": () => import("./assets/Welcome-D-E9_4ud.mjs") })
  );
}
function buildZiggyConfig(pageProps = {}) {
  const ziggy = pageProps.ziggy || {};
  return {
    ...ziggy,
    location: ziggy.location ? new URL(ziggy.location) : void 0
  };
}
function installRoute(pageProps = {}) {
  const ziggy = buildZiggyConfig(pageProps);
  globalThis.route = (name, params, absolute, config = ziggy) => _(name, params, absolute, config);
  globalThis.Ziggy = ziggy;
}
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: titleCallback,
    resolve: resolvePage,
    setup({ App, props }) {
      installRoute(props.initialPage.props);
      return /* @__PURE__ */ jsx(App, { ...props });
    }
  })
);
