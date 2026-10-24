const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let n=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=o.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&o.set(i,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const o=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new n(o,e,i)},r=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,m=globalThis,p=m.trustedTypes,g=p?p.emptyScript:"",f=m.reactiveElementPolyfillSupport,_=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!a(e,t),y={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&l(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const s=o?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const e=this.properties,t=[...d(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,o)=>{if(t)i.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=t.cssText,i.appendChild(o)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=o;const s=n.fromAttribute(t,e.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(void 0!==e){const s=this.constructor;if(!1===o&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??b)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[_("elementProperties")]=new Map,v[_("finalized")]=new Map,f?.({ReactiveElement:v}),(m.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,$=x.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+M,C=`<${E}>`,z=document,N=()=>z.createComment(""),W=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,F="[ \t\n\f\r]",L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,T=/>/g,O=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,I=/"/g,B=/^(?:script|style|textarea|title)$/i,H=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),K=H(1),U=H(2),j=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),V=new WeakMap,Z=z.createTreeWalker(z,129);function G(e,t){if(!P(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,o=[];let n,s=2===t?"<svg>":3===t?"<math>":"",r=L;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===L?"!--"===l[1]?r=D:void 0!==l[1]?r=T:void 0!==l[2]?(B.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=O):void 0!==l[3]&&(r=O):r===O?">"===l[0]?(r=n??L,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?O:'"'===l[3]?I:R):r===I||r===R?r=O:r===D||r===T?r=L:(r=O,n=void 0);const h=r===O&&e[t+1].startsWith("/>")?" ":"";s+=r===L?i+C:c>=0?(o.push(a),i.slice(0,c)+A+i.slice(c)+M+h):i+M+(-2===c?t:h)}return[G(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,s=0;const r=e.length-1,a=this.parts,[l,c]=Q(e,t);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=Z.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(A)){const t=c[s++],i=o.getAttribute(e).split(M),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?ie:"?"===r[1]?oe:"@"===r[1]?ne:te}),o.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:n}),o.removeAttribute(e));if(B.test(o.tagName)){const e=o.textContent.split(M),t=e.length-1;if(t>0){o.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],N()),Z.nextNode(),a.push({type:2,index:++n});o.append(e[t],N())}}}else if(8===o.nodeType)if(o.data===E)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(M,e+1));)a.push({type:7,index:n}),e+=M.length-1}n++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,o){if(t===j)return t;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=W(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(t=Y(e,n._$AS(e,t.values),n,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??z).importNode(t,!0);Z.currentNode=o;let n=Z.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new ee(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new se(n,this,e)),this._$AV.push(t),a=i[++r]}s!==a?.index&&(n=Z.nextNode(),s++)}return Z.currentNode=z,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),W(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>P(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&W(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new J(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new ee(this.O(N()),this.O(N()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,o){const n=this.strings;let s=!1;if(void 0===n)e=Y(this,e,t,0),s=!W(e)||e!==this._$AH&&e!==j,s&&(this._$AH=e);else{const o=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=Y(this,o[i+r],t,r),a===j&&(a=this._$AH[r]),s||=!W(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class oe extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class ne extends te{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??q)===j)return;const i=this._$AH,o=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==q&&(i===q||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const re={I:ee},ae=x.litHtmlPolyfillSupport;ae?.(J,ee),(x.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;let ce=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let n=o._$litPart$;if(void 0===n){const e=i?.renderBefore??null;o._$litPart$=n=new ee(t.insertBefore(N(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=Number.NaN;class ue{constructor(){this.ts=new Float64Array(32),this.vs=new Float64Array(32),this.count=0}get length(){return this.count}oldest(){return this.count>0?this.ts[0]:void 0}push(e,t){if(!Number.isFinite(e))return;const i=null!==t&&Number.isFinite(t)?t:he;if(0===this.count||e>this.ts[this.count-1])return void this.insertAt(this.count,e,i);const o=this.lowerBound(e);o<this.count&&this.ts[o]===e?this.vs[o]=i:this.insertAt(o,e,i)}mean(e,t){if(0===this.count||t<=e)return null;let i=this.upperBound(e),o=i>0?this.vs[i-1]:he,n=e,s=0,r=0;for(;i<this.count&&this.ts[i]<=t;i++){const e=this.ts[i];Number.isNaN(o)||(s+=o*(e-n),r+=e-n),o=this.vs[i],n=e}return Number.isNaN(o)||(s+=o*(t-n),r+=t-n),r>0?s/r:null}has(e){const t=this.lowerBound(e);return t<this.count&&this.ts[t]===e}removeGap(e){const t=this.lowerBound(e);t>=this.count||this.ts[t]!==e||!Number.isNaN(this.vs[t])||(this.ts.copyWithin(t,t+1,this.count),this.vs.copyWithin(t,t+1,this.count),this.count--)}prune(e){const t=this.upperBound(e)-1;t>0&&this.dropOldest(t)}insertAt(e,t,i){let o=e;if(this.count===this.ts.length)if(this.count<512)this.grow();else{if(0===o)return;this.dropOldest(1),o--}o<this.count&&(this.ts.copyWithin(o+1,o,this.count),this.vs.copyWithin(o+1,o,this.count)),this.ts[o]=t,this.vs[o]=i,this.count++}grow(){const e=Math.min(512,2*this.ts.length),t=new Float64Array(e),i=new Float64Array(e);t.set(this.ts.subarray(0,this.count)),i.set(this.vs.subarray(0,this.count)),this.ts=t,this.vs=i}dropOldest(e){this.ts.copyWithin(0,e,this.count),this.vs.copyWithin(0,e,this.count),this.count-=e}lowerBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<e?t=o+1:i=o}return t}upperBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<=e?t=o+1:i=o}return t}}class me{constructor(e){this.series=new Map,this.gaps=[],this.windowMs=Number.isFinite(e)&&e>0?e:0}push(e,t,i){let o=this.series.get(e);void 0===o&&(o=new ue,this.series.set(e,o)),o.push(t,i)}markGap(e,t=e){if(!Number.isFinite(e))return;const i=new Map;for(const[t,o]of this.series){const n=o.has(e)?e+1:e;o.push(n,null),i.set(t,n)}this.gaps.push({t:e,markedAt:t,at:i})}healGaps(e,t){const i=new Set(t),o=[];for(const t of this.gaps)if(t.markedAt>e)o.push(t);else{for(const[e,o]of t.at)i.has(e)&&(this.series.get(e)?.removeGap(o),t.at.delete(e));t.at.size>0&&o.push(t)}this.gaps=o}mean(e,t,i){const o=this.series.get(e);return void 0===o?null:o.mean(i-t,i)}status(e){const t=e-this.windowMs;let i,o=this.series.size>0;for(const e of this.series.values()){const n=e.oldest();void 0!==n?((void 0===i||n>i)&&(i=n),n>t&&(o=!1)):o=!1}return void 0===i?{complete:!1}:{complete:o,since:i}}prune(e){const t=e-this.windowMs;for(const e of this.series.values())e.prune(t);this.gaps=this.gaps.filter(e=>e.t>=t)}sampleCount(e){return this.series.get(e)?.length??0}}function pe(e){if("string"!=typeof e)return null;const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}function ge(e){if(null===e||"object"!=typeof e)return null;const{s:t,lu:i}=e;return"number"==typeof i&&Number.isFinite(i)?{t:Math.round(1e3*i),v:pe(t)}:null}const fe=new Set(["unavailable","unknown",""]);function _e(e,t){if(void 0===e)return;const i=e.trim().toLowerCase();return fe.has(i)?void 0:0===t.length?"on"===i:!t.includes(i)}function we(e){if(void 0===e||""===e.trim())return;const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(100,t)):void 0}class be{constructor(){this.plugged=new Map,this.known=new Map,this.asked=new Set}observe(e,t){for(const i of t){const t=i.charge;if(!t)continue;const o=e.states[t.soc],n=we(o?.state);if(void 0!==n){const e=Date.parse(o?.last_updated||o?.last_changed||"");this.known.set(t.soc,{value:n,t:Number.isFinite(e)?e:Date.now()})}if(t.plugged){const i=_e(e.states[t.plugged]?.state,t.unplugged);void 0!==i&&this.plugged.set(t.plugged,i)}}}state(e,t){const i=!!t.plugged&&(this.plugged.get(t.plugged)??!1),o=we(e.states[t.soc]?.state);if(void 0!==o)return{soc:o,stale:!1,plugged:i};const n=this.known.get(t.soc);return n?{soc:n.value,stale:!0,since:n.t,plugged:i}:{stale:!1,plugged:i}}missing(e,t){const i=[];for(const o of t){const t=o.charge?.soc;!t||i.includes(t)||this.asked.has(t)||this.known.has(t)||void 0===we(e.states[t]?.state)&&i.push(t)}return i}async prefill(e,t,i=5e3){if(0===t.length)return;for(const e of t)this.asked.add(e);const o=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(o-864e6).toISOString(),end_time:new Date(o).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0});let s;n.catch(()=>{});const r=new Promise((e,t)=>{s=setTimeout(()=>t(new Error("EnerLens: charge history timed out")),i)});let a;try{a=await Promise.race([n,r])}finally{void 0!==s&&clearTimeout(s)}if(null!==a&&"object"==typeof a)for(const e of t){const t=a[e];if(!Array.isArray(t))continue;let i;for(const e of t){const t="string"==typeof e.s?we(e.s):void 0,o="number"==typeof e.lc?e.lc:e.lu;if(void 0===t||"number"!=typeof o)continue;const n=1e3*o;(!i||n>i.t)&&(i={value:t,t:n})}i&&!this.known.has(e)&&this.known.set(e,i)}}}const ye={solar:"var(--energy-solar-color, #ff9800)",house:"var(--primary-color)",grid_import:"var(--energy-grid-consumption-color, #488fc2)",grid_export:"var(--energy-grid-return-color, #8353d1)",battery_charge:"var(--energy-battery-in-color, #f06292)",battery_discharge:"var(--energy-battery-out-color, #4db6ac)",rest:"#7d7d7d"},ve=Object.freeze([{at:0,color:"#e53935"},{at:50,color:"#fdd835"},{at:100,color:"#43a047"}]),xe=Object.freeze(["#7e57c2","#26a69a","#ec407a","#8d6e63","#5c6bc0","#ffca28","#66bb6a","#78909c","#ab47bc","#29b6f6"]),ke=/^#([\da-f])([\da-f])([\da-f])$/i,$e=/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,Se=/^rgba?\(([^)]*)\)$/i;function Ae(e){const t=e.trim(),i=ke.exec(t);if(i){const[,e,t,o]=i;return{r:Number.parseInt(e+e,16),g:Number.parseInt(t+t,16),b:Number.parseInt(o+o,16),a:1}}const o=$e.exec(t);if(o){const[,e,t,i]=o;return{r:Number.parseInt(e,16),g:Number.parseInt(t,16),b:Number.parseInt(i,16),a:1}}const n=Se.exec(t);if(n){const e=n[1].replace(/\//g," ").split(/[\s,]+/).filter(Boolean).map(Number);return e.length<3||e.some(e=>!Number.isFinite(e))?null:{r:e[0],g:e[1],b:e[2],a:e.length>3?e[3]:1}}return null}function Me(e,t,i){if(0===t.length)return"";const o=[...t].sort((e,t)=>e.at-t.at);if(1===o.length||!Number.isFinite(e))return o[0].color;let n=0;for(;n<o.length-2&&o[n+1].at<=e;)n++;const s=o[n],r=o[n+1],a=r.at-s.at,l=0===a?0:Math.min(1,Math.max(0,(e-s.at)/a));if(l<=0)return s.color;if(l>=1)return r.color;const c=Ae(i?i(s.color):s.color),d=Ae(i?i(r.color):r.color);return c&&d?function({r:e,g:t,b:i,a:o}){const n=e=>Math.min(255,Math.max(0,Math.round(e))),s=`${n(e)}, ${n(t)}, ${n(i)}`;return o>=1?`rgb(${s})`:`rgba(${s}, ${o})`}(function(e,t,i){return{r:e.r+(t.r-e.r)*i,g:e.g+(t.g-e.g)*i,b:e.b+(t.b-e.b)*i,a:e.a+(t.a-e.a)*i}}(c,d,l)):l<.5?s.color:r.color}function Ee(e){const t=/^var\((--[^,)]+)/.exec(e.trim());if(!t||"undefined"==typeof getComputedStyle)return e;return getComputedStyle(document.documentElement).getPropertyValue(t[1]).trim()||e}function Ce(e,t){const i=e.trim();if(""===i)return null;const o=(t?Ae(t(i)):null)??Ae(i);if(o){const e=e=>Math.min(255,Math.max(0,Math.round(e))).toString(16).padStart(2,"0");return`#${e(o.r)}${e(o.g)}${e(o.b)}`}const n=function(e){const t=/^var\(\s*--[^,)]+,([\s\S]+)\)$/.exec(e.trim()),i=t?.[1].trim();return i||null}(i);return n?Ce(n,t):null}function ze(e,t=0){const i=Ae(e);if(!i)return{h:t,s:0,v:0};const o=i.r/255,n=i.g/255,s=i.b/255,r=Math.max(o,n,s),a=r-Math.min(o,n,s);let l=t;return a>0&&(l=r===o?(n-s)/a%6*60:r===n?60*((s-o)/a+2):60*((o-n)/a+4)),{h:(l+360)%360,s:0===r?0:a/r,v:r}}function Ne({h:e,s:t,v:i}){const o=(e%360+360)%360,n=Math.min(1,Math.max(0,t)),s=Math.min(1,Math.max(0,i)),r=s*n,a=r*(1-Math.abs(o/60%2-1)),l=s-r,c=Math.floor(o/60)%6,[d,h,u]=[[r,a,0],[a,r,0],[0,r,a],[0,a,r],[a,0,r],[r,0,a]][c],m=e=>Math.round(255*(e+l)).toString(16).padStart(2,"0");return`#${m(d)}${m(h)}${m(u)}`}function We({h:e,s:t,v:i}){const o=i*(1-t/2),n=Math.min(o,1-o);return{h:e,s:0===n?0:(i-o)/n,l:o}}function Pe({h:e,s:t,l:i}){const o=i+t*Math.min(i,1-i);return{h:e,s:0===o?0:2*(1-i/o),v:o}}const Fe={en:{node:{solar:"Solar",grid:"Grid",house:"House",battery:"Battery",grid_import:"Grid · import",grid_export:"Grid · export",battery_charging:"Battery · charging",battery_discharging:"Battery · discharging",derived_suffix:"· calculated",derived_alone:"calculated",no_grid:"no grid"},list:{rest:"Other",title:"Consumers",show_all:"Show every consumer, even without power",filter_on:"Show active consumers only",charge:"State of charge {value}",charge_stale:"State of charge {value} · as of {time}",charge_unknown:"State of charge unknown"},view:{now:"Now",average:"Ø {minutes} min",off_in_period:"Averages only apply to the kW view",since:"since {time}",chip:"View: {mode}, next: {next}"},energy:{today:"Today","24h":"24 h",week:"Week","7d":"7 days",month:"Month","30d":"30 days",from:"{period} from {date}",chip:"Energy: {mode}, next: {next}",filled:"{percent} of the time filled in from neighbouring values",since:"Statistics only from {date}",none:"No statistics",rest:"Includes filled-in, later or missing consumer values",late:"Statistics only from {date}; the period counts from then",no_statistics:"Energy mode: not every main sensor (solar, grid, battery, house) has long-term statistics; the card stays with power.",fixed:"Energy: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} must be a mapping.",string:"{field} must be a non-empty text.",boolean:"{field} must be true or false.",number:"{field} must be a number.",integer:"{field} must be a whole number.",list:"{field} must be a list.",non_empty:"{field} must not be empty.",enum:"{field} must be one of: {allowed}.",min:"{field} must be at least {min}.",range:"{field} must be between {min} and {max}.",positive:"{field} must be greater than 0.",missing_entities:"{field} is missing: at least three of the four balance quantities must be configured as sensors.",mixed_form:"{field}: use either an entity id, the entity/invert form, the two-entity form or derived - not a mixture.",two_derived:"Only one balance quantity may be derived; {field} would be the second one.",soc_without_battery:"{field} has no effect without entities.battery and is ignored.",soc_stops:"{field} needs at least two stops in ascending order, the first at 0 and the last at 100.",soc_stop_entry:"{field} needs a numeric at value and a colour.",consumer_entity:"{field} has no entity and is skipped.",duplicate_consumer:"{field}: entity {entity} is listed more than once; the later entry is skipped.",unknown_key:"Unknown option {field} - ignored.",order_fixed:"{first} must be less than {second} - {second} was raised to {value}.",clamped:"{field} must be between {min} and {max} - {value} is used.",grid_status_no_outage:"{field} needs an entity and at least one outage state - without them the grid status is ignored.",empty_choice:"{field}: an empty list counts as not set; the default applies.",energy_derived:"{field}: the energy mode does not work with a derived grid or battery; it stays off.",charge_no_soc:"{field} has no soc entity and is ignored.",charge_no_plugged:"{field}: show plugged needs a plugged entity - shown while charging instead.",extra_no_entity:"{field} has no entity and is ignored.",not_for_node:"{field} does not exist for this node and is ignored.",rounded:"{field}: whole numbers only - rounded to {value}.",order_used:"{field}: to keep the order, the card uses {value}.",clamped_min:"{field} must be at least {min} - {value} is used."}},editor:{title:"Title",entities:"Main entities",solar:"Solar power",grid:"Grid power",house:"House consumption",battery:"Battery power",battery_soc:"State of charge",consumers:"Consumers",entity:"Entity",name:"Name",color:"Colour",display:"Display",max_consumers:"Maximum consumers",min_consumer_w:"Minimum power (W)",update_interval_s:"Update interval (seconds)",rest_label:"Label for the remainder",list_enabled:"Show list",list_always_below:"List always below",ring_enabled:"Show ring",ring_animation:"Ring animation",ring_overtake:"Overtake",ring_fade:"Cross-fade colours",ring_jump:"Jump",view:"View",default_mode:"Start value",mode_current:"Current",mode_short:"Short average",mode_long:"Long average",avg_short_minutes:"Short window (minutes)",avg_long_minutes:"Long window (minutes)",energy_periods:"Available values",energy_today:"Today",energy_24h:"24 h",energy_week:"Week",energy_7d:"7 days",energy_month:"Month",energy_30d:"30 days",flow:"Flows",inactive_lines:"Lines without flow",lines_show:"Show",lines_dim:"Dim",lines_hide:"Hide",animation:"Motion",anim_auto:"Follow system setting",anim_on:"Always",anim_off:"Off",design:"Look of the dots",design_none:"Plain dots",dot_size:"Dot size",line_width:"Line width",invert:"Flip sign",source_entity:"One entity",source_split_grid:"Two entities (import / export)",source_split_battery:"Two entities (discharge / charge)",source_derived:"Derived from the other quantities",source_none:"No battery",grid_import:"Import",grid_export:"Export",battery_discharge:"Discharge",battery_charge:"Charge",colors:"Colours",icons:"Icons",color_solar:"Solar",color_house:"House",color_grid_import:"Grid · import",color_grid_export:"Grid · export",color_battery_charge:"Battery · charging",color_battery_discharge:"Battery · discharging",color_rest:"Remainder",color_reset:"Reset to default",color_default:"Default",color_css:"CSS",color_pick:"Pick a colour",color_hue:"Hue",color_sv:"Saturation and brightness",color_hex:"Hex value",color_mode:"Notation",color_used:"Used in this card",colors_consumers:"Consumers",colors_soc:"State of charge",yaml_only:"Only editable in YAML - the values there are not in a form this editor can show.",color_at:"At percent",color_remove:"Remove stop",color_add_stop:"Add stop",min_w:"Minimum power (W)",icon:"Icon",peak_w:"System peak power (W)",flow_fine:"Fine-tune the motion",slow_below_w:"Speed up from (W)",more_dots_above_w:"More dots from (W)",max_dots_at_w:"All dots from (W)",max_dots:"Maximum dots",slow_s:"Resting pace (seconds per lap)",fast_s:"Full speed (seconds per lap)",full_speed_w:"Full speed from (W)",power_unit:"Show power in",power_kw:"Kilowatts (kW)",power_w:"Watts (W), whole numbers",power_decimals:"Decimals (kW)",grid_status_section:"Grid outage (optional)",grid_status:"Grid status entity",grid_status_outage:"States that mean: no grid",grid_status_ok:"States that mean: grid is there",appearance:"Card appearance",appearance_auto:"Follow the theme",appearance_light:"Light",appearance_dark:"Dark",rest:"Remainder",dot_color:"Colour of the dots",colors_dots:"Dots",dot_color_follow:"Dots in the colour of their line",power_auto:"Automatic",power_digits:"Significant digits",consumer_add:"Add consumer",consumer_new:"New consumer",consumer_remove:"Remove consumer",charge:"State of charge",charge_show_charging:"While charging",charge_show_plugged:"While plugged in",charge_show_always:"Always",consumer_soc:"State of charge entity (%)",consumer_show:"Show in the list",consumer_plugged:"Plugged in",consumer_unplugged:"Not plugged in when",consumer_up:"Move up",consumer_down:"Move down",nodes:"Labels & extra values",node_show_name:"Show name",node_show_state:"Show state word",node_inside_entity:"Extra value in the circle",node_inside_position:"Position in the circle",node_inside_decimals:"Digits",node_inside_size:"Size",node_inside_weight:"Font weight",node_label_entity:"Extra value with the label",node_label_prefix:"Prefix",node_label_decimals:"Digits",node_label_size:"Size",node_label_weight:"Font weight",position_above:"above the icon",position_below:"below the value",decimals_ha:"As in Home Assistant",decimals_0:"0 decimals",decimals_1:"1 decimal",decimals_2:"2 decimals",decimals_3:"3 decimals",decimals_sig2:"2 significant digits",decimals_sig3:"3 significant digits",decimals_sig4:"4 significant digits",weight_normal:"normal",weight_medium:"medium",weight_bold:"bold",colors_extras:"Extra values",color_extra_inside:"{node} · in the circle",color_extra_label:"{node} · with the label",colors_hint:"Colours are set further down, in the group “Colours”.",group_smoothing:"Smoothing",group_energy:"Power/energy",group_scope:"List scope",modes:"Available values",scope:"Available values",default_energy:"Start value",default_scope:"Start value",energy_power:"Power",scope_filtered:"Filtered",scope_full:"Complete",quick_buttons:"Quick buttons",note_min:"At least {min}.",note_max:"At most {max}.",note_integer:"Whole numbers only.",note_order:"The order is wrong.",note_order_avg_short_minutes:"The short window must be shorter than the long one.",note_order_avg_long_minutes:"The long window must be longer than the short one.",note_order_fast_s:"The fast cycle must be shorter than the slow one.",note_order_slow_s:"The slow cycle must be longer than the fast one.",note_order_min_w:"Must lie below the thresholds for the dots.",note_order_slow_below_w:"The thresholds must grow from top to bottom.",note_order_more_dots_above_w:"The thresholds must grow from top to bottom.",note_order_max_dots_at_w:"The thresholds must grow from top to bottom.",note_order_full_speed_w:"Must be above the threshold for slow dots."},editor_help:{min_consumer_w:"Consumers below this power are hidden and counted towards the remainder. Default: 10 W.",max_consumers:"Only the strongest consumers are listed; the rest are counted together. Empty = all (default).",update_interval_s:"How often the list reorders. The figures themselves update immediately. Default: 5 seconds.",rest_label:'Name for the part that is not measured individually. Default: "Other".',design:"How the travelling dots look. “Plain dots” is a circle and nothing else; the others give it a lighter core and, depending on the design, a glow. Speed and the number of dots follow the power, not the design. Default: plain dots.",dot_size:"100 % is the size of the dots on a card with large nodes. Smaller cards - the list beside the cross, a phone - take somewhat smaller dots on their own. Default: 100 %.",line_width:"100 % is 3 px for the connections and 2 px for the lines to the list on a card with large nodes. Smaller cards take somewhat thinner lines on their own. Default: 100 %.",avg_short_minutes:"Window for the short average. Default: 2.",avg_long_minutes:"Window for the long average. Default: 15.",energy_periods:"What the quick button offers: power, and energy over a period worked out from the statistics of the power sensors. Several ticked: each tap steps on. One ticked: fixed, no button. Default: power, today, 24 h, week – but only when solar, grid, battery and house have statistics, otherwise power alone. Grid and battery with two sensors show both directions; with one signed sensor the grid shows its balance and the battery no figure.",energy_periods_locked:"Not available with a derived grid or battery.",inactive_lines:'Connections with nothing flowing on them. "Hide" calms the picture at night. Default: show.',animation:'"Follow system setting" respects the device\'s reduce-motion preference - that lives in the operating system, not in Home Assistant. Default: follow system setting.',ring_animation:"How the ring follows a reordered list. “Overtake”: every segment travels to its new place, one moving forward passes on an inner lane. “Cross-fade colours”: the places stay, their colours blend into the new order. “Jump”: no motion, new values show at once. With Motion off the ring always jumps. Default: overtake.",battery_soc:"State of charge in percent. Never averaged.",color:"Any CSS value, e.g. #7e57c2 or var(--primary-color). Empty = automatic.",solar:"Positive = production. If the sensor reports production as negative, flip the sign.",grid:"Positive = import from the grid, negative = export. If your sensor has it the other way round, flip the sign.",house:'Total consumption of the house. Without a sensor of its own, choose "Derived".',battery:"Positive = discharging, negative = charging (Home Assistant's convention). If your sensor has it the other way round, flip the sign.",grid_import:"Import only, as a magnitude ≥ 0.",grid_export:"Export only, as a magnitude ≥ 0.",battery_discharge:"Discharging only, as a magnitude ≥ 0.",battery_charge:"Charging from all sources, as a magnitude ≥ 0.",derived:"Calculated from the other three quantities so the balance adds up. Only one quantity can be derived.",min_w:"From this power on a connection counts as active: dots move, grid and battery show their state. Below it everything is neutral. Default: 10 W.",icon_battery:"Empty = icon follows the state of charge.",peak_w:"One value for the whole motion: at this power the most dots run at their fastest. The three thresholds below derive from it (1/12, 1/3, 1/1) while they are empty. Default 6000 W.",flow_fine:"Only needed when the peak power alone does not do. A set value overrides the one derived from the peak. If the order is wrong, the card raises the second value and says so in the browser console.",slow_below_w:"Below this a single dot runs at resting pace. From here on it gets faster. Default: peak / 12.",more_dots_above_w:"From here on more dots join, independent of the speed. Default: peak / 3.",max_dots_at_w:"From here on as many dots as allowed. In between: more and more dots. Default: peak.",slow_s:"One lap when little is flowing. Default 5.",fast_s:"One lap when a lot is flowing. Default 1.8.",max_dots:"How many dots a connection carries at most. Default 5.",full_speed_w:"From here on the dot runs as fast as it gets. In between: one dot, getting faster. Default: same as “More dots from”.",power_unit:"Kilowatts, watts or automatic. “Automatic” picks per value: whole watts below 1000 W, kilowatts above - otherwise a 30 W consumer reads as “0.0 kW”. Default: kilowatts.",power_decimals:"Kilowatts only; watts are always whole numbers. Default 2.",grid_status:"Only if your installation reports an outage - many do not. Without it the card shows no outage; everything else works.",grid_status_outage:"Required. Every integration names its states differently, so nothing is guessed here. Enter the raw state, not the label Home Assistant shows: an enum sensor displays a translated name, so “Not detected” may really be `not_detected`. Picking from the list avoids the question.",grid_status_ok:"Optional. Left empty, the entity's own options minus the outage states count as \\u201cgrid is there\\u201d; anything else, including unavailable, leaves the last state standing.",appearance:"Shows this one card light or dark – whatever the theme says, and without touching the rest of the dashboard. It also settles which of its two value sets a flow design takes. “Follow the theme” reads the ground, which works nearly always – but not for themes that paint no card background of their own. Light and dark use Home Assistant's default colours, not those of a custom theme.",icon_rest:"Empty = a plain dot.",dot_color:"Empty = each dot carries the colour of its flow, which is what shows where the energy comes from. A colour here applies to every dot on the card; the lines keep theirs.",power_digits:"How much the number says, not how many places follow the point. With 3: 1.23 kW · 12.3 kW · 123 kW. A decimal place means something different at 1.23 kW than at 123 kW; this keeps what the figure tells constant. Watts are always whole. Default: 3.",consumers_list:"Unfold to edit, drag by the handle to sort. The colour is under “Colours”.",consumer_min_w:"Overrides the global minimum power - say 50 W for a heat pump, so its standby does not count as a consumer.",consumer_soc:"For a wallbox, the car’s state of charge from the car’s own integration. Shown as a ring around the icon; while nothing charges it stands in the row instead of the power.",consumer_show:"“While plugged in” keeps the row in the list as long as the car is plugged in - full and at 0 W too.",consumer_plugged:"An on/off sensor (on = plugged in) or a status sensor of the wallbox.",consumer_unplugged:"The status sensor’s states that mean “not plugged in”; all others count as plugged in.",node_show_state:"Without the state word only the colour tells export from import, charging from discharging.",node_inside_entity:"Any entity. The circle only has room for a number and its unit. Always shows the current state, also in the average views.",node_label_entity:"Any entity, right next to the circle. Always shows the current state, also in the average views.",node_label_prefix:'Free text in front of the value, e.g. "Self-sufficiency".',node_inside_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_label_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_inside_size:"In percent of the node value.",node_label_size:"In percent of the label (12 px).",node_inside_position:"Above the icon the value sits where the battery shows its charge, and tapping it opens its own history. Below the value, tapping opens the node's entity.",modes:"What the quick button offers: now, the short and the long average. Several ticked: each tap steps on. One ticked: fixed, no button. Default: all three.",modes_locked:"Averages exist for power only. Tick “Power” under “Quick button power/energy” to set the smoothing. Until then the card always shows the current reading.",scope:"What the quick button offers: the filtered consumer list or every consumer. Several ticked: each tap switches. One ticked: fixed, no button. Default: both.",default_mode:"What the card starts with, unless the browser remembers something else. Default: now.",default_energy:"What the card starts with, unless the browser remembers something else. Default: power.",default_scope:"What the card starts with, unless the browser remembers something else. Default: filtered.",list_enabled:"Default: on when consumers are set.",ring_enabled:"Default: on when consumers are set.",list_always_below:"Keeps the list under the cross even when there is room beside it. Default: off.",quick_buttons:"The buttons in the card's header. For each, what it offers: several values – each tap steps on; one value – fixed, no button."},outage:{banner:"Island mode — no grid",label:"Grid status"},example:{banner:"Example values — pick your sensors in the editor"}},de:{node:{solar:"PV",grid:"Netz",house:"Haus",battery:"Batterie",grid_import:"Netz · Bezug",grid_export:"Netz · Einspeisung",battery_charging:"Batterie · lädt",battery_discharging:"Batterie · entlädt",derived_suffix:"· berechnet",derived_alone:"berechnet",no_grid:"kein Netz"},list:{rest:"Rest",title:"Verbraucher",show_all:"Alle Verbraucher anzeigen, auch ohne Leistung",filter_on:"Nur aktive Verbraucher anzeigen",charge:"Ladestand {value}",charge_stale:"Ladestand {value} · Stand {time}",charge_unknown:"Ladestand unbekannt"},view:{now:"Jetzt",average:"Ø {minutes} min",off_in_period:"Mittelwerte gibt es nur in der kW-Ansicht",since:"seit {time}",chip:"Ansicht: {mode}, weiter zu {next}"},energy:{today:"Heute","24h":"24 h",week:"Woche","7d":"7 Tage",month:"Monat","30d":"30 Tage",from:"{period} ab {date}",chip:"Energie: {mode}, weiter zu {next}",filled:"{percent} der Zeit aus Nachbarwerten ergänzt",since:"Statistik erst ab {date}",none:"Keine Statistik",rest:"Enthält ergänzte, spätere oder fehlende Verbraucherwerte",late:"Statistik erst ab {date}, der Zeitraum zählt ab dann",no_statistics:"Energie-Modus: Nicht alle Hauptsensoren (PV, Netz, Batterie, Haus) haben eine Langzeitstatistik; die Karte bleibt bei der Leistung.",fixed:"Energie: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} muss ein Objekt sein.",string:"{field} muss ein nicht leerer Text sein.",boolean:"{field} muss true oder false sein.",number:"{field} muss eine Zahl sein.",integer:"{field} muss eine ganze Zahl sein.",list:"{field} muss eine Liste sein.",non_empty:"{field} darf nicht leer sein.",enum:"{field} muss einer dieser Werte sein: {allowed}.",min:"{field} muss mindestens {min} sein.",range:"{field} muss zwischen {min} und {max} liegen.",positive:"{field} muss größer als 0 sein.",missing_entities:"{field} fehlt: mindestens drei der vier Bilanzgrößen müssen als Sensor angegeben sein.",mixed_form:"{field}: entweder Entitäts-ID, die entity/invert-Form, die Zwei-Entitäten-Form oder derived - keine Mischform.",two_derived:"Nur eine Bilanzgröße darf abgeleitet werden; {field} wäre die zweite.",soc_without_battery:"{field} ist ohne entities.battery wirkungslos und wird ignoriert.",soc_stops:"{field} braucht mindestens zwei Stützstellen in aufsteigender Reihenfolge, die erste bei 0, die letzte bei 100.",soc_stop_entry:"{field} braucht einen numerischen at-Wert und eine Farbe.",consumer_entity:"{field} hat keine entity und wird übersprungen.",duplicate_consumer:"{field}: die Entität {entity} ist mehrfach angegeben; der weitere Eintrag wird übersprungen.",unknown_key:"Unbekannte Option {field} - wird ignoriert.",order_fixed:"{first} muss kleiner als {second} sein — {second} wurde auf {value} angehoben.",clamped:"{field} muss zwischen {min} und {max} liegen — es wird {value} verwendet.",grid_status_no_outage:"{field} braucht eine Entität und mindestens einen Ausfall-Zustand — ohne beides wird der Netzstatus ignoriert.",empty_choice:"{field}: Eine leere Liste gilt als nicht gesetzt; es gilt der Standard.",energy_derived:"{field}: Der Energie-Modus geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie; er bleibt aus.",charge_no_soc:"{field} hat keine soc-Entität und wird ignoriert.",charge_no_plugged:"{field}: show plugged braucht eine plugged-Entität - stattdessen wie beim Laden.",extra_no_entity:"{field} hat keine entity und wird ignoriert.",not_for_node:"{field} gibt es bei diesem Knoten nicht und wird ignoriert.",rounded:"{field}: nur ganze Zahlen – gerundet auf {value}.",order_used:"{field}: Wegen der Reihenfolge rechnet die Karte mit {value}.",clamped_min:"{field} muss mindestens {min} sein – verwendet wird {value}."}},editor:{title:"Titel",entities:"Basis-Entitäten",solar:"PV-Leistung",grid:"Netzleistung",house:"Hausverbrauch",battery:"Batterieleistung",battery_soc:"Ladezustand",consumers:"Verbraucher",entity:"Entität",name:"Name",color:"Farbe",display:"Darstellung",max_consumers:"Höchstzahl Verbraucher",min_consumer_w:"Mindestleistung (W)",update_interval_s:"Takt (Sekunden)",rest_label:"Bezeichnung für den Rest",list_enabled:"Liste anzeigen",list_always_below:"Liste immer unten",ring_enabled:"Ring anzeigen",ring_animation:"Ring-Animation",ring_overtake:"Überholen",ring_fade:"Farben überblenden",ring_jump:"Springen",view:"Ansicht",default_mode:"Startwert",mode_current:"Aktuell",mode_short:"Kurzer Mittelwert",mode_long:"Langer Mittelwert",avg_short_minutes:"Kurzes Fenster (Minuten)",avg_long_minutes:"Langes Fenster (Minuten)",energy_periods:"Verfügbare Werte",energy_today:"Heute",energy_24h:"24 h",energy_week:"Woche",energy_7d:"7 Tage",energy_month:"Monat",energy_30d:"30 Tage",flow:"Flüsse",inactive_lines:"Linien ohne Fluss",lines_show:"Anzeigen",lines_dim:"Abschwächen",lines_hide:"Ausblenden",animation:"Bewegung",anim_auto:"Systemeinstellung folgen",anim_on:"Immer",anim_off:"Aus",design:"Aussehen der Punkte",design_none:"Einfache Punkte",dot_size:"Punktgröße",line_width:"Liniendicke",invert:"Vorzeichen umdrehen",source_entity:"Eine Entität",source_split_grid:"Zwei Entitäten (Bezug / Einspeisung)",source_split_battery:"Zwei Entitäten (Entladen / Laden)",source_derived:"Abgeleitet aus den anderen Größen",source_none:"Keine Batterie",grid_import:"Bezug",grid_export:"Einspeisung",battery_discharge:"Entladen",battery_charge:"Laden",colors:"Farben",icons:"Icons",color_solar:"PV",color_house:"Haus",color_grid_import:"Netz · Bezug",color_grid_export:"Netz · Einspeisung",color_battery_charge:"Batterie · lädt",color_battery_discharge:"Batterie · entlädt",color_rest:"Rest",color_reset:"Auf Standard zurücksetzen",color_default:"Standard",color_css:"CSS",color_pick:"Farbe wählen",color_hue:"Farbton",color_sv:"Sättigung und Helligkeit",color_hex:"Hex-Wert",color_mode:"Schreibweise",color_used:"In dieser Karte verwendet",colors_consumers:"Verbraucher",colors_soc:"Ladestand",yaml_only:"Nur im YAML bearbeitbar – die Werte dort haben eine Form, die dieser Editor nicht anzeigen kann.",color_at:"Bei Prozent",color_remove:"Stufe entfernen",color_add_stop:"Stufe hinzufügen",min_w:"Mindestleistung (W)",icon:"Icon",peak_w:"Höchstleistung der Anlage (W)",flow_fine:"Feineinstellung der Bewegung",slow_below_w:"Beschleunigung ab (W)",more_dots_above_w:"Mehr Punkte ab (W)",max_dots_at_w:"Alle Punkte ab (W)",max_dots:"Höchstzahl Punkte",slow_s:"Ruhe-Tempo (Sekunden pro Runde)",fast_s:"Höchsttempo (Sekunden pro Runde)",full_speed_w:"Höchsttempo ab (W)",power_unit:"Leistung anzeigen in",power_kw:"Kilowatt (kW)",power_w:"Watt (W), ganze Zahlen",power_decimals:"Nachkommastellen (kW)",grid_status_section:"Netzausfall (optional)",grid_status:"Entität für den Netzstatus",grid_status_outage:"Zustände, die „kein Netz“ bedeuten",grid_status_ok:"Zustände, die „Netz liegt an“ bedeuten",appearance:"Erscheinungsbild der Karte",appearance_auto:"Wie das Theme",appearance_light:"Hell",appearance_dark:"Dunkel",rest:"Rest",dot_color:"Farbe der Punkte",colors_dots:"Punkte",dot_color_follow:"Punkte in der Farbe ihrer Linie",power_auto:"Automatisch",power_digits:"Relevante Stellen",consumer_add:"Verbraucher hinzufügen",consumer_new:"Neuer Verbraucher",consumer_remove:"Verbraucher entfernen",charge:"Ladestand",charge_show_charging:"Beim Laden",charge_show_plugged:"Wenn angesteckt",charge_show_always:"Immer",consumer_soc:"Ladestand-Entität (%)",consumer_show:"In der Liste zeigen",consumer_plugged:"Angesteckt",consumer_unplugged:"Nicht angesteckt bei",consumer_up:"Nach oben",consumer_down:"Nach unten",nodes:"Beschriftung & Zusatzwerte",node_show_name:"Name anzeigen",node_show_state:"Zustandswort anzeigen",node_inside_entity:"Zusatzwert im Kreis",node_inside_position:"Lage im Kreis",node_inside_decimals:"Stellen",node_inside_size:"Größe",node_inside_weight:"Schriftstärke",node_label_entity:"Zusatzwert beim Text",node_label_prefix:"Vorsatz",node_label_decimals:"Stellen",node_label_size:"Größe",node_label_weight:"Schriftstärke",position_above:"über dem Icon",position_below:"unter dem Wert",decimals_ha:"Wie in Home Assistant",decimals_0:"0 Nachkommastellen",decimals_1:"1 Nachkommastelle",decimals_2:"2 Nachkommastellen",decimals_3:"3 Nachkommastellen",decimals_sig2:"2 signifikante Stellen",decimals_sig3:"3 signifikante Stellen",decimals_sig4:"4 signifikante Stellen",weight_normal:"normal",weight_medium:"mittel",weight_bold:"fett",colors_extras:"Zusatzwerte",color_extra_inside:"{node} · im Kreis",color_extra_label:"{node} · beim Text",colors_hint:"Die Farben stellst du weiter unten in der Gruppe „Farben“ ein.",group_smoothing:"Glättung",group_energy:"Leistung/Energie",group_scope:"Listenumfang",modes:"Verfügbare Werte",scope:"Verfügbare Werte",default_energy:"Startwert",default_scope:"Startwert",energy_power:"Leistung",scope_filtered:"Gefiltert",scope_full:"Vollständig",quick_buttons:"Quick-Buttons",note_min:"Mindestens {min}.",note_max:"Höchstens {max}.",note_integer:"Nur ganze Zahlen.",note_order:"Die Reihenfolge stimmt nicht.",note_order_avg_short_minutes:"Das kurze Fenster muss kürzer sein als das lange.",note_order_avg_long_minutes:"Das lange Fenster muss länger sein als das kurze.",note_order_fast_s:"Die schnelle Umlaufzeit muss kürzer sein als die langsame.",note_order_slow_s:"Die langsame Umlaufzeit muss länger sein als die schnelle.",note_order_min_w:"Muss unter den Schwellen für die Punkte liegen.",note_order_slow_below_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_more_dots_above_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_max_dots_at_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_full_speed_w:"Muss größer sein als die Schwelle für langsame Punkte."},editor_help:{min_consumer_w:"Verbraucher unterhalb dieser Leistung werden ausgeblendet und zählen zum Rest. Standard: 10 W.",max_consumers:"Nur die stärksten Verbraucher erscheinen; alle weiteren zählen zum Rest. Leer = alle (Standard).",update_interval_s:"Wie oft die Liste neu sortiert wird. Die Werte selbst ändern sich sofort. Standard: 5 Sekunden.",rest_label:"Name für den nicht einzeln gemessenen Anteil. Standard: „Rest“.",design:"Wie die laufenden Punkte aussehen. „Einfache Punkte“ ist ein Kreis ohne alles; die übrigen geben ihm einen hellen Kern und je nach Design ein Glühen. Tempo und Anzahl der Punkte hängen an der Leistung, nicht am Design. Standard: Einfache Punkte.",dot_size:"100 % ist die Größe der Punkte auf einer Karte mit großen Knoten. Kleinere Karten – Liste neben dem Kreuz, Handy – nehmen von sich aus etwas kleinere Punkte. Standard: 100 %.",line_width:"100 % sind 3 px für die Verbindungen und 2 px für die Linien zur Liste, auf einer Karte mit großen Knoten. Kleinere Karten nehmen von sich aus etwas dünnere Linien. Standard: 100 %.",avg_short_minutes:"Zeitraum für den kurzen Mittelwert. Standard: 2.",avg_long_minutes:"Zeitraum für den langen Mittelwert. Standard: 15.",energy_periods:"Was der Quick-Button anbietet: die Leistung und Energie über einen Zeitraum, berechnet aus der Statistik der Leistungssensoren. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: Leistung, Heute, 24 h, Woche – aber nur, wenn PV, Netz, Batterie und Haus eine Statistik haben, sonst nur Leistung. Netz und Batterie mit zwei Sensoren zeigen beide Richtungen; mit einem Sensor mit Vorzeichen zeigt das Netz den Saldo, die Batterie keine Zahl.",energy_periods_locked:"Geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie.",inactive_lines:"Verbindungen, auf denen gerade nichts fließt. „Ausblenden“ beruhigt das Bild nachts. Standard: Anzeigen.",animation:"„Systemeinstellung folgen“ richtet sich nach „Bewegung reduzieren“ des Geräts — das steht im Betriebssystem, nicht in Home Assistant. Standard: Systemeinstellung folgen.",ring_animation:"Wie der Ring einer umsortierten Liste folgt. „Überholen“: Jedes Segment wandert an seinen neuen Platz, wer nach vorn rückt, überholt auf einer inneren Bahn. „Farben überblenden“: Die Plätze bleiben, ihre Farben blenden in die neue Reihenfolge über. „Springen“: keine Bewegung, neue Werte sind sofort da. Bei Bewegung „Aus“ springt der Ring immer. Standard: Überholen.",battery_soc:"Ladezustand in Prozent. Wird nie gemittelt.",color:"Beliebiger CSS-Wert, z. B. #7e57c2 oder var(--primary-color). Leer = automatisch.",solar:"Positive Werte = Erzeugung. Meldet der Sensor die Erzeugung negativ, Vorzeichen umdrehen.",grid:"Positiv = Bezug aus dem Netz, negativ = Einspeisung. Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",house:"Gesamtverbrauch des Hauses. Ohne eigenen Sensor „Abgeleitet“ wählen.",battery:"Positiv = Entladen, negativ = Laden (Konvention von Home Assistant). Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",grid_import:"Nur der Bezug, als Betrag ≥ 0.",grid_export:"Nur die Einspeisung, als Betrag ≥ 0.",battery_discharge:"Nur das Entladen, als Betrag ≥ 0.",battery_charge:"Nur das Laden aus allen Quellen, als Betrag ≥ 0.",derived:"Wird aus den drei anderen Größen berechnet, damit die Bilanz aufgeht. Nur eine Größe kann abgeleitet sein.",min_w:"Ab dieser Leistung gilt eine Verbindung als aktiv: Punkte laufen, Netz und Batterie zeigen ihren Zustand. Darunter ist alles neutral. Standard: 10 W.",icon_battery:"Leer = Icon folgt dem Ladezustand.",peak_w:"Ein Wert für die ganze Bewegung: Bei dieser Leistung laufen die meisten Punkte am schnellsten. Die drei Schwellen der Feineinstellung ergeben sich daraus (1/12, 1/3, 1/1), solange sie leer sind. Standard 6000 W.",flow_fine:"Nur nötig, wenn die Höchstleistung allein nicht reicht. Ein gesetzter Wert hat Vorrang vor der Ableitung aus der Höchstleistung. Stimmt die Reihenfolge nicht, hebt die Karte den zweiten Wert an und meldet es in der Browser-Konsole.",slow_below_w:"Darunter läuft ein einzelner Punkt im Ruhe-Tempo. Ab hier wird er schneller. Standard: Höchstleistung / 12.",more_dots_above_w:"Ab hier kommen weitere Punkte dazu, unabhängig vom Tempo. Standard: Höchstleistung / 3.",max_dots_at_w:"Ab hier laufen so viele Punkte wie erlaubt. Dazwischen: immer mehr Punkte. Standard: Höchstleistung.",slow_s:"Zeit für eine Runde, wenn wenig fließt. Standard 5.",fast_s:"Zeit für eine Runde, wenn viel fließt. Standard 1,8.",max_dots:"Wie viele Punkte auf einer Verbindung höchstens laufen. Standard 5.",full_speed_w:"Ab hier läuft der Punkt so schnell wie möglich. Dazwischen: ein Punkt, der schneller wird. Standard: wie „Mehr Punkte ab“.",power_unit:"Kilowatt, Watt oder automatisch. „Automatisch“ wählt je Wert: unter 1000 W ganze Watt, darüber Kilowatt — sonst steht ein Verbraucher mit 30 W als „0,0 kW“ da. Standard: Kilowatt.",power_decimals:"Nur bei Kilowatt; Watt werden immer als ganze Zahl gezeigt. Standard 2.",grid_status:"Nur wenn deine Anlage einen Netzausfall meldet — viele tun es nicht. Ohne diese Angabe zeigt die Karte keinen Ausfall an; alles andere funktioniert.",grid_status_outage:"Pflichtangabe. Jede Integration benennt ihre Zustände anders, hier wird nichts geraten. Trage den Rohwert ein, nicht die Anzeige von Home Assistant: Ein Aufzählungssensor zeigt einen übersetzten Namen, aus „Nicht erkannt“ wird also `not_detected`. Wer aus der Liste auswählt, umgeht die Frage.",grid_status_ok:"Optional. Leer gelassen gelten die eigenen Optionen der Entität ohne die Ausfall-Zustände als „Netz liegt an“; alles andere, auch unavailable, lässt den letzten Zustand stehen.",appearance:"Zeigt diese eine Karte hell oder dunkel – unabhängig vom Theme und ohne den Rest des Dashboards zu verändern. Es legt zugleich fest, welchen der beiden Wertesätze ein Fluss-Design nimmt. „Wie das Theme“ liest den Untergrund aus; das klappt fast immer, aber nicht bei Themes ohne eigenen Kartenhintergrund. Hell und Dunkel verwenden die Standardfarben von Home Assistant, nicht die eines eigenen Themes.",icon_rest:"Leer = ein schlichter Punkt.",dot_color:"Leer = jeder Punkt hat die Farbe seines Flusses und zeigt damit, woher die Energie kommt. Eine Farbe hier gilt für alle Punkte der Karte; die Linien behalten ihre.",power_digits:"Wie viele Ziffern die Zahl aussagt — nicht wie viele hinter dem Komma stehen. Mit 3: 1,23 kW · 12,3 kW · 123 kW. Eine Nachkommastelle bedeutet bei 1,23 kW etwas anderes als bei 123 kW; die Aussagekraft bleibt so gleich. Watt sind immer ganz. Standard: 3.",consumers_list:"Aufklappen zum Bearbeiten, am Griff ziehen zum Sortieren. Die Farbe steht unter „Farben“.",consumer_min_w:"Überschreibt die globale Mindestleistung – etwa 50 W für eine Wärmepumpe, damit ihr Standby nicht als Verbraucher zählt.",consumer_soc:"Für eine Wallbox der Ladestand des Autos, aus dessen eigener Integration. Erscheint als Ring um das Icon; lädt nichts, steht er statt der Leistung in der Zeile.",consumer_show:"„Wenn angesteckt“ hält die Zeile in der Liste, solange das Auto angesteckt ist – auch voll und bei 0 W.",consumer_plugged:"Ein Ein/Aus-Sensor (an = angesteckt) oder ein Status-Sensor der Wallbox.",consumer_unplugged:"Die Zustände des Status-Sensors, die „nicht angesteckt“ bedeuten; alle anderen gelten als angesteckt.",node_show_state:"Ohne Zustandswort zeigt nur noch die Farbe, ob eingespeist oder bezogen, geladen oder entladen wird.",node_inside_entity:"Eine beliebige Entität. Im Kreis ist nur Platz für Zahl und Einheit. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_entity:"Eine beliebige Entität, direkt am Kreis. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_prefix:"Freier Text vor dem Wert, z. B. „Autarkie“.",node_inside_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_label_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_inside_size:"In Prozent des Knotenwerts.",node_label_size:"In Prozent der Beschriftung (12 px).",node_inside_position:"Über dem Icon steht der Wert dort, wo die Batterie ihren Ladezustand zeigt, und Antippen öffnet seine eigene Historie. Unter dem Wert öffnet Antippen die Entität des Knotens.",modes:"Was der Quick-Button anbietet: Jetzt, kurzer und langer Mittelwert. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: alle drei.",modes_locked:"Mittelwerte gibt es nur für die Leistung. Hake unter „Quick-Button Leistung/Energie“ „Leistung“ an, dann lässt sich die Glättung einstellen. Bis dahin zeigt die Karte immer den Augenblickswert.",scope:"Was der Quick-Button anbietet: die gefilterte Verbraucherliste oder alle Verbraucher. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide.",default_mode:"Womit die Karte startet, solange sich der Browser nichts anderes gemerkt hat. Standard: Jetzt.",default_energy:"Womit die Karte startet, solange sich der Browser nichts anderes gemerkt hat. Standard: Leistung.",default_scope:"Womit die Karte startet, solange sich der Browser nichts anderes gemerkt hat. Standard: Gefiltert.",list_enabled:"Standard: an, wenn Verbraucher eingetragen sind.",ring_enabled:"Standard: an, wenn Verbraucher eingetragen sind.",list_always_below:"Die Liste bleibt unter dem Kreuz, auch wenn daneben Platz wäre. Standard: aus.",quick_buttons:"Die Knöpfe im Kopf der Karte. Je Knopf, was er anbietet: mehrere Werte – jeder Tipp schaltet weiter; ein Wert – fest, ohne Knopf."},outage:{banner:"Inselbetrieb — kein Netz",label:"Netzstatus"},example:{banner:"Beispielwerte — wähle deine Sensoren im Editor"}}};function Le(e){const t="undefined"!=typeof document?document.documentElement?.lang:void 0;return(e?.language||t||"en").split("-")[0].toLowerCase()}function De(e,t){let i=e;for(const e of t.split(".")){if("object"!=typeof i||null===i)return;i=i[e]}return"string"==typeof i?i:void 0}function Te(e,t,i){const o=Le(t),n=De(Fe[o],e)??De(Fe.en,e)??e;return i?n.replace(/\{(\w+)\}/g,(e,t)=>t in i?String(i[t]):e):n}const Oe=new Set(["unavailable","unknown","none",""]),Re=e=>e.trim().toLowerCase();function Ie(e,t,i,o){switch(function(e,t,i){if(void 0===e)return"hold";const o=Re(e);return Oe.has(o)?"hold":t.outage.includes(o)?"outage":t.ok.length>0?t.ok.includes(o)?"ok":"hold":i&&i.length>0?i.some(e=>Re(e)===o)?"ok":"hold":"ok"}(t,i,o)){case"outage":return!0;case"ok":return!1;default:return e}}function Be(e,t){const i=e.states[t]?.attributes.options;if(Array.isArray(i))return i.filter(e=>"string"==typeof e)}function He(e,t){console.warn(Te("error.config.grid_status_no_outage",t,{field:e}))}class Ke extends Error{constructor(e,t){super(e),this.field=t,this.name="ConfigError"}}const Ue=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],je={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home"},qe=["current","avg_short","avg_long"],Ve=["power","today","24h","week","7d","month","30d"],Ze=["power","today","24h","week"],Ge=["filtered","full"],Qe=["auto","on","off"],Je=["show","dim","hide"],Ye=["overtake","fade","jump"],Xe=["auto","light","dark"],et=new Set(["type","title","entities","consumers","min_consumer_w","max_consumers","update_interval_s","list","ring","view","flow","colors","icons","power","appearance","nodes","memory_id"]),tt=new Set(["view_layout","layout_options","grid_options","visibility","card_mod"]),it={positive:"import",negative:"export"},ot={positive:"discharge",negative:"charge"};function nt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function st(e,t,i,o){return new Ke(Te(e,i,{field:t,...o}),t)}function rt(e,t,i){if(!nt(e))throw st("error.config.object",t,i);return e}function at(e,t,i){if("string"!=typeof e||""===e.trim())throw st("error.config.string",t,i);return e}const lt=e=>null==e||"string"==typeof e&&""===e.trim();function ct(e,t,i){if(!lt(e))return at(e,t,i)}function dt(e,t,i){return lt(e)?{}:rt(e,t,i)}function ht(e,t,i,o){if(lt(e))return i;if("boolean"!=typeof e)throw st("error.config.boolean",t,o);return e}function ut(e,t,i,o){if(lt(e))return i;if("number"!=typeof e||!Number.isFinite(e))throw st("error.config.number",t,o);return e}function mt(e,t,i,o){const n=ut(e,t,i,o);if(!Number.isInteger(n))throw st("error.config.integer",t,o);return n}let pt;const gt={min_consumer_w:{min:0},max_consumers:{min:1,integer:!0},update_interval_s:{min:1},"view.avg_short_minutes":{min:1,max:120,integer:!0},"view.avg_long_minutes":{min:2,max:240,integer:!0},"flow.min_w":{min:0},"flow.peak_w":{min:1},"flow.slow_below_w":{min:0},"flow.more_dots_above_w":{min:0},"flow.max_dots_at_w":{min:0},"flow.full_speed_w":{min:0},"flow.max_dots":{min:2,max:10,integer:!0},"flow.slow_s":{min:.1},"flow.fast_s":{min:.1},"flow.dot_size":{min:40,max:150},"flow.line_width":{min:30,max:150},"consumers.min_w":{min:0},"nodes.size":{min:60,max:150}};function ft(e,t,i,o,n=gt[t]){let s=ut(e,t,i,o);n.integer&&!Number.isInteger(s)&&(s=Math.round(s),console.warn(Te("error.config.rounded",o,{field:t,value:s})),pt?.push({field:t,used:s,reason:"integer"}));const{min:r,max:a}=n;if(s<r||void 0!==a&&s>a){const e=s<r?"min":"max";s=s<r?r:a,console.warn(void 0===a?Te("error.config.clamped_min",o,{field:t,min:r,value:s}):Te("error.config.clamped",o,{field:t,min:r,max:a,value:s})),pt?.push({field:t,used:s,reason:e})}return s}function _t(e,t){const i=e.flatMap((e,t)=>e.set?[t]:[]),o=i.map(t=>e[t].value).sort((e,t)=>e-t),n=e.map(e=>e.value);i.forEach((e,t)=>{n[e]=o[t]});for(let t=n.length-1;t>0;t--){if(!e[t].set||e[t-1].set||n[t]>=n[t-1]+e[t].gap)continue;const i=gt[e[t-1].field]?.min??Number.NEGATIVE_INFINITY;n[t]-e[t].gap>=i&&(n[t-1]=n[t]-e[t].gap)}for(let t=1;t<n.length;t++)n[t]<n[t-1]+e[t].gap&&(n[t]=n[t-1]+e[t].gap);const s=e.map((e,t)=>n[t]!==e.value);return e.forEach((e,i)=>{s[i]&&console.warn(Te("error.config.order_used",t,{field:e.field,value:n[i]}))}),s.some(Boolean)&&e.forEach((e,t)=>{(e.set||s[t])&&pt?.push({field:e.field,used:n[t],reason:"order"})}),n}function wt(e,t,i,o,n){if(e<t||e>i)throw st("error.config.range",o,n,{min:t,max:i});return e}function bt(e,t,i,o,n){if(lt(e))return o;if("string"!=typeof e||!t.includes(e))throw st("error.config.enum",i,n,{allowed:t.join(", ")});return e}function yt(e,t,i,o){if(lt(e))return;if(!Array.isArray(e))throw st("error.config.list",i,o);for(const n of e)bt(n,t,i,t[0],o);const n=t.filter(t=>e.includes(t));if(0!==n.length)return n;console.warn(Te("error.config.empty_choice",o,{field:i}))}function vt(e,t,i,o){if(lt(e))return{kind:"absent"};if("string"==typeof e)return"derived"===e?{kind:"derived"}:{kind:"single",entity:e,invert:!1};if(!nt(e))throw st("error.config.mixed_form",t,o);const n=Object.keys(e),s="entity"in e,r=void 0!==i&&(i.positive in e||i.negative in e);if(s&&r)throw st("error.config.mixed_form",t,o);if(s){if(n.some(e=>"entity"!==e&&"invert"!==e))throw st("error.config.mixed_form",t,o);const i=e.entity;if("string"!=typeof i||""===i.trim())throw st("error.config.mixed_form",t,o);const s=e.invert;if(!lt(s)&&"boolean"!=typeof s)throw st("error.config.boolean",`${t}.invert`,o);return{kind:"single",entity:i,invert:!0===s}}if(i&&r){if(n.some(e=>e!==i.positive&&e!==i.negative))throw st("error.config.mixed_form",t,o);const s=e[i.positive],r=e[i.negative];if("string"!=typeof s||""===s.trim()||"string"!=typeof r||""===r.trim())throw st("error.config.mixed_form",t,o);return{kind:"split",positive:s,negative:r}}throw st("error.config.mixed_form",t,o)}function xt(e,t,i){if(lt(e))return[];if(!Array.isArray(e))throw st("error.config.list",t,i);const o=[];for(const n of e){if(lt(n))continue;if("string"!=typeof n)throw st("error.config.string",t,i);const e=Re(n);""===e||o.includes(e)||o.push(e)}return o}function kt(e,t,i){if("absent"===e.kind)throw st("error.config.missing_entities",t,i)}const $t=["solar_inside","solar_label","grid_inside","grid_label","house_inside","house_label","battery_label"];function St(e,t){const i=Object.fromEntries($t.map(e=>[e,"var(--secondary-text-color)"]));if(!nt(e))return i;for(const o of $t){const n=ct(e[o],`colors.${o}`,t);n&&(i[o]=n)}return lt(e.battery_inside)||console.warn(Te("error.config.not_for_node",t,{field:"colors.battery_inside"})),i}function At(e,t){const i={...ye,socStops:ve.map(e=>({...e})),consumerPalette:[...xe]},o=dt(e,"colors",t);for(const e of Ue){const n=ct(o[e],`colors.${e}`,t);n&&(i[e]=n)}return lt(o.soc_stops)||(i.socStops=function(e,t){const i="colors.soc_stops";if(!Array.isArray(e))throw st("error.config.list",i,t);if(e.length<2)throw st("error.config.soc_stops",i,t);const o=[];for(let n=0;n<e.length;n++){const s=e[n];if(!nt(s)||"number"!=typeof s.at||!Number.isFinite(s.at)||"string"!=typeof s.color||""===s.color.trim())throw st("error.config.soc_stop_entry",`${i}[${n}]`,t,{index:n});o.push({at:s.at,color:s.color})}for(let e=1;e<o.length;e++)if(o[e].at<o[e-1].at)throw st("error.config.soc_stops",i,t);if(0!==o[0].at)throw st("error.config.soc_stops",i,t);if(100!==o[o.length-1].at)throw st("error.config.soc_stops",i,t);return o}(o.soc_stops,t)),lt(o.consumer_palette)||(i.consumerPalette=function(e,t){const i="colors.consumer_palette";if(!Array.isArray(e))throw st("error.config.list",i,t);if(0===e.length)throw st("error.config.non_empty",i,t);return e.map((e,o)=>at(e,`${i}[${o}]`,t))}(o.consumer_palette,t)),i}const Mt=["kW","W","auto"];function Et(e,t){const i=dt(e,"power",t);return{unit:bt(i.unit,Mt,"power.unit","kW",t),decimals:wt(mt(i.decimals,"power.decimals",2,t),1,3,"power.decimals",t),digits:wt(mt(i.digits,"power.digits",3,t),2,4,"power.digits",t)}}function Ct(e,t){const i={...je},o=dt(e,"icons",t);for(const e of["solar","grid","house","battery","rest"]){const n=ct(o[e],`icons.${e}`,t);n&&(i[e]=n)}return i}const zt=["charging","plugged","always"];function Nt(e,t,i){if(lt(e))return;const o=rt(e,t,i),n=ct(o.soc,`${t}.soc`,i);if(!n)return void console.warn(Te("error.config.charge_no_soc",i,{field:t}));let s=bt(o.show,zt,`${t}.show`,"charging",i);const r=ct(o.plugged,`${t}.plugged`,i);return"plugged"!==s||r||(console.warn(Te("error.config.charge_no_plugged",i,{field:t})),s="charging"),{soc:n,show:s,plugged:r,unplugged:/^(binary_sensor|input_boolean)\./.test(r??"")?[]:xt(o.unplugged,`${t}.unplugged`,i)}}const Wt=["solar","grid","house","battery"],Pt=["above","below"],Ft=["normal","medium","bold"],Lt=["ha","sig2","sig3","sig4"],Dt=new Set(["show_name","show_state","inside","label"]),Tt={inside:new Set(["entity","position","decimals","size","weight"]),label:new Set(["entity","prefix","decimals","size","weight"])};function Ot(e,t,i){if(lt(e))return"ha";if("string"==typeof e&&Lt.includes(e))return e;const o="string"==typeof e&&/^\d$/.test(e)?Number(e):e;if(0===o||1===o||2===o||3===o)return o;throw st("error.config.enum",t,i,{allowed:"ha, 0, 1, 2, 3, sig2, sig3, sig4"})}function Rt(e,t,i,o){for(const n of Object.keys(e))t.has(n)||console.warn(Te("error.config.unknown_key",o,{field:`${i}.${n}`}))}function It(e,t,i,o){if(lt(e))return;const n=rt(e,i,o);Rt(n,Tt[t],i,o);const s="string"==typeof n.entity?n.entity.trim():"";if(!s)return void console.warn(Te("error.config.extra_no_entity",o,{field:i}));const r={entity:s,decimals:Ot(n.decimals,`${i}.decimals`,o),size:ft(n.size,`${i}.size`,100,o,gt["nodes.size"]),weight:bt(n.weight,Ft,`${i}.weight`,"normal",o)};if("inside"===t)return{...r,position:bt(n.position,Pt,`${i}.position`,"above",o)};if(!lt(n.prefix)&&"string"!=typeof n.prefix)throw st("error.config.string",`${i}.prefix`,o);const a="string"==typeof n.prefix?n.prefix.trim():"";return{...r,prefix:a||void 0}}function Bt(e,t){const i=Object.fromEntries(Wt.map(e=>[e,{showName:!0,showState:!0}]));if(lt(e))return i;const o=rt(e,"nodes",t);Rt(o,new Set(Wt),"nodes",t);for(const e of Wt){if(lt(o[e]))continue;const n=`nodes.${e}`,s=rt(o[e],n,t);Rt(s,Dt,n,t);const r=i[e];r.showName=ht(s.show_name,`${n}.show_name`,!0,t);const a=ht(s.show_state,`${n}.show_state`,!0,t);"grid"===e||"battery"===e?r.showState=a:lt(s.show_state)||console.warn(Te("error.config.not_for_node",t,{field:`${n}.show_state`})),"battery"!==e?r.inside=It(s.inside,"inside",`${n}.inside`,t):lt(s.inside)||console.warn(Te("error.config.not_for_node",t,{field:`${n}.inside`})),r.label=It(s.label,"label",`${n}.label`,t)}return i}function Ht(e,t,i){pt=i;const o=console.warn;i&&(console.warn=()=>{});try{return function(e,t){const i=rt(e,"config",t);if(function(e,t){for(const i of Object.keys(e))et.has(i)||tt.has(i)||console.warn(Te("error.config.unknown_key",t,{field:i}))}(i,t),lt(i.entities))throw st("error.config.missing_entities","entities",t);const o=rt(i.entities,"entities",t),n=vt(o.solar,"entities.solar",void 0,t),s=vt(o.grid,"entities.grid",it,t),r=vt(o.battery,"entities.battery",ot,t),a=vt(o.house,"entities.house",void 0,t),l="absent"===a.kind?{kind:"derived"}:a;kt(n,"entities.solar",t),kt(s,"entities.grid",t);const c=[["entities.solar",n],["entities.grid",s],["entities.battery",r],["entities.house",l]].filter(([,e])=>"derived"===e.kind).map(([e])=>e);if(c.length>1)throw st("error.config.two_derived",c[1],t);let d;d=ct(o.battery_soc,"entities.battery_soc",t),void 0!==d&&"absent"===r.kind&&(console.warn(Te("error.config.soc_without_battery",t,{field:"entities.battery_soc"})),d=void 0);const h=function(e,t,i){if(lt(e))return;if("string"==typeof e)return void He(t,i);const o=rt(e,t,i),n=at(o.entity,`${t}.entity`,i),s=xt(o.outage,`${t}.outage`,i),r=xt(o.ok,`${t}.ok`,i);if(0!==s.length)return{entity:n,outage:s,ok:r};He(t,i)}(o.grid_status,"entities.grid_status",t),u=At(i.colors,t),m=function(e,t,i){if(lt(e))return[];if(!Array.isArray(e))throw st("error.config.list","consumers",i);const o=new Set,n=[];for(let s=0;s<e.length;s++){const r=e[s],a=`consumers[${s}]`;if(!nt(r)||"string"!=typeof r.entity||""===r.entity.trim()){console.warn(Te("error.config.consumer_entity",i,{field:a,index:s}));continue}const l=r.entity;o.has(l)?console.warn(Te("error.config.duplicate_consumer",i,{field:a,entity:l})):(o.add(l),n.push({key:l,entity:l,name:ct(r.name,`${a}.name`,i),color:ct(r.color,`${a}.color`,i)??t[s%t.length],icon:ct(r.icon,`${a}.icon`,i),minW:lt(r.min_w)?void 0:ft(r.min_w,`${a}.min_w`,0,i,gt["consumers.min_w"]),charge:Nt(r.charge,`${a}.charge`,i)}))}return n}(i.consumers,u.consumerPalette,t),p=ft(i.min_consumer_w,"min_consumer_w",10,t),g=lt(i.max_consumers)?Number.POSITIVE_INFINITY:ft(i.max_consumers,"max_consumers",1,t),f=ft(i.update_interval_s,"update_interval_s",5,t),_=dt(i.list,"list",t),w=dt(i.ring,"ring",t),b=m.length>0,y=dt(i.view,"view",t),[v,x]=_t([{field:"view.avg_short_minutes",value:ft(y.avg_short_minutes,"view.avg_short_minutes",2,t),set:!lt(y.avg_short_minutes),gap:0},{field:"view.avg_long_minutes",value:ft(y.avg_long_minutes,"view.avg_long_minutes",15,t),set:!lt(y.avg_long_minutes),gap:1}],t),k=dt(i.flow,"flow",t),$=ft(k.min_w,"flow.min_w",10,t),S=ft(k.peak_w,"flow.peak_w",6e3,t),A=ft(k.max_dots,"flow.max_dots",5,t),M=[["flow.min_w",$,k.min_w,0],["flow.slow_below_w",S/12,k.slow_below_w,0],["flow.more_dots_above_w",S/3,k.more_dots_above_w,1],["flow.max_dots_at_w",S,k.max_dots_at_w,1]].map(([e,i,o,n])=>({field:e,value:"flow.min_w"===e?$:ft(o,e,i,t),set:!lt(o),gap:n})),[E,C,z,N]=_t(M,t),[W,P]=_t([{field:"flow.fast_s",value:ft(k.fast_s,"flow.fast_s",1.8,t),set:!lt(k.fast_s),gap:0},{field:"flow.slow_s",value:ft(k.slow_s,"flow.slow_s",5,t),set:!lt(k.slow_s),gap:1}],t);let F=z;lt(k.full_speed_w)||(F=ft(k.full_speed_w,"flow.full_speed_w",z,t),F<=C&&(F=C+1,console.warn(Te("error.config.order_used",t,{field:"flow.full_speed_w",value:F})),pt?.push({field:"flow.full_speed_w",used:F,reason:"order"})));const L=function(e,t,i,o,n){const s=!ht(e.show_selector,"view.show_selector",!0,n),r=bt(e.default_mode,qe,"view.default_mode","current",n),a=bt(e.default_energy,Ve,"view.default_energy","power",n),l=bt(t.default_scope,Ge,"list.default_scope","filtered",n);let c=yt(e.modes,qe,"view.modes",n)??(s?[r]:[...qe]);const d="view.energy_periods";let h=yt(e.energy_periods,Ve,d,n);const u=void 0===h&&!s;h??=s?[a]:[...Ze],!h.some(e=>"power"!==e)||"derived"!==i.kind&&"derived"!==o.kind||(console.warn(Te("error.config.energy_derived",n,{field:d})),h=["power"]);const m=h.includes("power");m||(c=["current"]);const p=yt(t.scope,Ge,"list.scope",n)??(s?[l]:[...Ge]);return{modes:c,defaultMode:c.includes(r)?r:c[0],power:m,energyPeriods:h.filter(e=>"power"!==e),energyDefault:u&&h.length>1,defaultEnergy:h.includes(a)?a:h[0],scope:p,defaultScope:p.includes(l)?l:p[0]}}(y,_,s,r,t);return{title:ct(i.title,"title",t),memoryId:"number"==typeof i.memory_id?String(i.memory_id):ct(i.memory_id,"memory_id",t),sources:{solar:n,grid:s,battery:r,house:l,batterySoc:d},gridStatus:h,consumers:m,minConsumerW:p,maxConsumers:g,updateIntervalS:f,list:{enabled:ht(_.enabled,"list.enabled",b,t),restLabel:ct(_.rest_label,"list.rest_label",t),title:ct(_.title,"list.title",t),alwaysBelow:ht(_.always_below,"list.always_below",!1,t),scope:L.scope,defaultScope:L.defaultScope},ring:{enabled:ht(w.enabled,"ring.enabled",b,t),animation:bt(w.animation,Ye,"ring.animation","overtake",t)},view:{modes:L.modes,defaultMode:L.defaultMode,avgShortMinutes:v,avgLongMinutes:x,remember:ht(y.remember,"view.remember",!0,t),power:L.power,energyPeriods:L.energyPeriods,energyDefault:L.energyDefault,defaultEnergy:L.defaultEnergy},flow:{minW:E,slowBelowW:C,fullSpeedW:F,moreDotsAboveW:z,maxDotsAtW:N,maxDots:A,slowS:P,fastS:W,animation:bt(k.animation,Qe,"flow.animation","auto",t),design:"string"==typeof k.design&&k.design.trim()?k.design.trim():"none",dotColor:"string"==typeof k.dot_color&&k.dot_color.trim()?k.dot_color.trim():void 0,dotSize:ft(k.dot_size,"flow.dot_size",100,t),lineWidth:ft(k.line_width,"flow.line_width",100,t),inactiveLines:bt(k.inactive_lines,Je,"flow.inactive_lines","show",t)},appearance:bt(i.appearance,Xe,"appearance","auto",t),colors:u,icons:Ct(i.icons,t),nodes:Bt(i.nodes,t),extraColors:St(i.colors,t),power:Et(i.power,t),...void 0===i.card_mod?{}:{card_mod:i.card_mod}}}(e,t)}finally{pt=void 0,console.warn=o}}function Kt(){const e="abcdefghijklmnopqrstuvwxyz0123456789";return[...crypto.getRandomValues(new Uint8Array(8))].map(t=>e[t%36]).join("")}function Ut(e){const t=[],i=e=>{if(Array.isArray(e))for(const t of e)i(t);else if(nt(e)){"string"==typeof e.type&&t.push(e);for(const t of["sections","cards","card"])i(e[t])}};return i(e),t}function jt(e){return"number"==typeof e?String(e):"string"==typeof e&&e.trim()?e:void 0}const qt="enerlens-card",Vt="enerlens-card-editor",Zt="EnerLens Card",Gt={solar:"sensor.solar_power",grid:"sensor.grid_power"},Qt={solar:3200,grid:450},Jt={solar_battery:"battery_charge",solar_grid:"grid_export",battery_grid:"grid_export",grid_battery:"grid_import",solar_house:"solar",battery_house:"battery_discharge",grid_house:"grid_import"},Yt=Object.keys(Jt);function Xt(e,t,i,o,n,s){let r=e,a=t,l=i,c=o,d=n,h=s;const u={},m=(e,t)=>(t>0&&(u[e]=t),t),p=m("solar_battery",Math.min(r,d));r-=p,d-=p;const g=m("solar_grid",Math.min(r,l));r-=g,l-=g;const f=m("battery_grid",Math.min(c,l));c-=f,l-=f;const _=m("grid_battery",Math.min(a,d));a-=_,d-=_;const w=m("solar_house",Math.min(r,h));r-=w,h-=w;const b=m("battery_house",Math.min(c,h));return c-=b,h-=b,m("grid_house",Math.min(a,h)),u}function ei(e,t){const{minW:i,slowBelowW:o,fullSpeedW:n,moreDotsAboveW:s,maxDotsAtW:r,maxDots:a,slowS:l,fastS:c}=t.flow;if(!Number.isFinite(e)||e<i)return null;let d=l;if(e>=n)d=c;else if(e>o){d=l-(e-o)/(n-o)*(l-c)}let h=1;if(e>=s){const t=(e-s)/(r-s);h=Math.min(a,2+Math.floor(t*(a-2)))}return{count:h,durationS:d}}function ti(e,t){const i=[];for(const o of Yt){const n=e[o];if(void 0===n)continue;const s=ei(n,t);s&&i.push({connection:o,w:n,count:s.count,durationS:s.durationS,colorKey:Jt[o]})}return i}function ii(e){const t=e.charge;if(t)return{entity:t.entity,soc:t.soc,stale:t.stale,since:t.since}}function oi(e,t){return e.w>=e.threshold||null!==ei(e.w,t)}function ni(e,t){const i=e.filter(e=>oi(e,t)),o=i.reduce((e,t)=>e+t.w,0);return i.map(e=>({key:e.key,share:o>0?e.w/o:0,color:e.color,entity:e.entity,isRest:e.isRest}))}function si(e,t,i=!1){const o=function(e,t,i){const o=[],n=[],s=[];for(const r of e.consumers){const e=r.charge,a=void 0!==e&&("always"===e.show||"plugged"===e.show&&e.plugged);if(!r.reading.available&&void 0!==t.energy?.consumers[r.entity]){s.push({key:r.key,name:r.name,w:0,color:r.color,entity:r.entity,icon:r.icon,threshold:r.minW??t.minConsumerW,isRest:!1,powerUnknown:!0});continue}if(!r.reading.available&&!a)continue;const l=r.reading.available?r.reading.w:0,c=r.minW??t.minConsumerW;if(!i&&!a&&l<c)continue;const d={key:r.key,name:r.name,w:l,color:r.color,entity:r.entity,icon:r.icon,threshold:c,isRest:!1,charge:ii(r),powerUnknown:!r.reading.available||void 0};(a?n:o).push(d)}const r=ri(o).slice(0,i?Number.POSITIVE_INFINITY:t.maxConsumers).concat(n),a=r.slice();if(e.house.available){const i=e.house.w-r.reduce((e,t)=>e+t.w,0);i>=t.minConsumerW&&a.push({key:"__rest__",name:t.list.restLabel??"",w:i,color:t.colors.rest,icon:t.icons.rest,threshold:t.minConsumerW,isRest:!0})}return ri(a).concat(s)}(e,t,i);return{entries:o,segments:ni(o,t)}}function ri(e){return e.sort((e,t)=>t.w-e.w)}const ai="none";let li=function(e){for(const t of e){const e=t.spur;"number"!=typeof t.shape?.bias&&"number"==typeof e?.bias&&(t.shape.bias=e.bias),"number"!=typeof t.shape?.bias&&(t.shape.bias=0),"number"!=typeof t.shape?.caps&&(t.shape.caps=0);for(const e of[t.dark,t.light])"number"!=typeof e?.line&&(e.line=80)}return e}([{id:"kugeln",name:"Kugeln",name_en:"Orbs",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:0,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:0,glowStrength:45,line:80}},{id:"partylicht",name:"Partylicht",name_en:"Party Light",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:2,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:1,glowStrength:45,line:80}},{id:"leuchtpunkte",name:"Leuchtpunkte",name_en:"Glowing Dots",shape:{caps:5,bias:95},dark:{dot:9,core:20,coreLight:100,glow:2,glowStrength:80,line:80},light:{dot:8,core:20,coreLight:75,glow:2,glowStrength:45,line:80}},{id:"electron",name:"Electron",shape:{caps:5,bias:70},dark:{dot:10,core:40,coreLight:100,glow:0,glowStrength:80,line:80},light:{dot:10,core:40,coreLight:100,glow:0,glowStrength:10,line:80}},{id:"proton",name:"Proton",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:2,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:100,glow:2,glowStrength:30,line:80}},{id:"neutrino",name:"Neutrino",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:0,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:85,glow:0,glowStrength:30,line:80}}]);function ci(e){if(e&&e!==ai)return li.find(t=>t.id===e)}function di(e,t){const i=e.name_en?.trim();return i?"de"===Le(t)?e.name:i:e.name}const hi=36e5,ui=3e5,mi=864e5,pi=["solar","import","export","discharge","charge","house"],gi=new Set(["solar","import","discharge"]),fi={solar:0,import:0,export:0,discharge:0,charge:0,house:0};function _i(e,t){const i=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(e),o=e=>Number(i.find(t=>t.type===e)?.value??0);return Date.UTC(o("year"),o("month")-1,o("day"),o("hour"),o("minute"),o("second"))-1e3*Math.floor(e/1e3)}function wi(e,t,i,o){const n=Date.UTC(e,t,i),s=n-_i(n,o);return n-_i(s,o)}const bi={"24h":24,"7d":168,"30d":720};function yi(e,t,i,o){const n=bi[e];if(void 0!==n){const i="30d"===e?hi:ui;return Math.ceil((t-n*hi)/i)*i}const s=new Date(t+_i(t,i)),r=s.getUTCFullYear(),a=s.getUTCMonth(),l=s.getUTCDate();if("month"===e)return wi(r,a,1,i);if("week"===e){return wi(r,a,l-(s.getUTCDay()-o+7)%7,i)}return wi(r,a,l,i)}function vi(e){const t=new Map;for(const i of e??[])null!==i.mean&&Number.isFinite(i.mean)&&t.set(i.start,i.mean);return t}class xi{constructor(e,t,i){this.hourly=vi(e),this.fiveMin=vi(t),this.first=Math.min(...this.hourly.keys(),...this.fiveMin.keys(),i??Number.POSITIVE_INFINITY)}get exists(){return Number.isFinite(this.first)}at(e){if(e.hourly){const t=this.hourly.get(e.start);return void 0===t?void 0:{w:t,filled:!1}}const t=this.fiveMin.get(e.start);if(void 0!==t)return{w:t,filled:!1};const i=this.hourly.get(Math.floor(e.start/hi)*hi);return void 0===i?void 0:{w:i,filled:!0}}before(e){const t=Math.floor(e.start/hi)*hi-hi;return e.hourly?this.hourly.get(e.start-hi):this.fiveMin.get(e.start-ui)??this.hourly.get(t)}neighbour(e,t){const i=e.hourly?this.hourly:this.fiveMin,o=e=>this.hourly.get(Math.floor(e/hi)*hi),n=i.get(e.start-mi)??(e.hourly?void 0:o(e.start-mi));if(void 0!==n)return n;if(e.start+mi>=t)return 0;return i.get(e.start+mi)??(e.hourly?void 0:o(e.start+mi))??0}}function ki(e,t){let i=0,o=0;for(const n of pi)n!==e&&(gi.has(n)?i+=t[n]:o+=t[n]);return gi.has(e)?o-i:i-o}function $i(e){const t=new Map,i=i=>{let o=t.get(i);return o||(o=new xi(e.hourly[i],e.fiveMin[i],e.since?.[i]),t.set(i,o)),o},o=pi.filter(t=>void 0!==e.roles[t]),n=["solar","house"].find(t=>void 0===e.roles[t]),s=o.filter(t=>i(e.roles[t]).exists),r=s.length===o.length;let a=Number.NEGATIVE_INFINITY,l=Number.NEGATIVE_INFINITY;for(const t of[...o.map(t=>i(e.roles[t])),...e.consumers.map(i)]){for(const e of t.hourly.keys())l=Math.max(l,e+hi);for(const e of t.fiveMin.keys())a=Math.max(a,e+ui)}a=Math.max(a,l);const c=Math.max(e.from,Math.min(e.to,a)),d=Math.max(e.from,...s.map(t=>i(e.roles[t]).first)),h=Math.min(d,c),u=c-h,m=function(e,t,i){const o=[];let n=e;for(;n<t;)if(n%hi===0&&n+hi<=Math.min(t,i))o.push({start:n,end:n+hi,hourly:!0}),n+=hi;else{const e=Math.min(t,(Math.floor(n/ui)+1)*ui);o.push({start:n,end:e,hourly:!1}),n=e}return o}(h,c,l),p={...fi},g={...fi},f={};let _;for(const t of m){const o=(t.end-t.start)/hi,a={...fi},l=new Set,d=[];for(const o of s){const n=i(e.roles[o]),s=n.at(t);s?(a[o]=s.w,s.filled&&l.add(o)):"solar"===o&&(_??n.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?a.solar=0:d.push(o)}if(1===d.length&&!n&&r)a[d[0]]=Math.max(0,ki(d[0],a)),l.add(d[0]);else for(const o of d)a[o]=i(e.roles[o]).neighbour(t,c),l.add(o);let h=0;n&&(h=ki(n,a),a[n]=Math.max(0,h),l.size>0&&l.add(n)),_=a.solar;for(const e of pi)p[e]+=(e===n?h:a[e])*o,l.has(e)&&(g[e]+=t.end-t.start);if(r){const e=Xt(a.solar,a.import,a.export,a.discharge,a.charge,a.house);for(const[t,i]of Object.entries(e))f[t]=(f[t]??0)+i*o}}const w={};for(const e of pi){const t=e===n?r:s.includes(e);w[e]=t?{wh:p[e],filledShare:u>0?g[e]/u:0}:null}const b={};for(const t of e.consumers)b[t]=Si(i(t),m,h,c);return{from:h,to:c,lateStart:h>e.from,main:w,consumers:b,flows:f}}function Si(e,t,i,o){if(!e.exists)return null;let n=0,s=0,r=0;for(const i of t){if(i.start<e.first)continue;const t=e.at(i),a=t?t.w:e.neighbour(i,o);t&&!t.filled||(s+=i.end-i.start),n+=a*(i.end-i.start)/hi,r+=i.end-i.start}const a={wh:n,filledShare:r>0?s/r:0};return e.first>i&&(a.since=e.first),a}const Ai=36e5,Mi=24*Ai,Ei="#positive",Ci="#negative";function zi(e){const t={},i=new Set,o=new Map,n=(e,o)=>{"single"===o.kind&&(t[e]=o.entity,o.invert&&i.add(o.entity))},{solar:s,grid:r,battery:a,house:l}=e.sources;n("solar",s),n("house",l);const c=(e,n,s)=>{if("split"===s.kind)t[e]=s.positive,t[n]=s.negative;else if("single"===s.kind){const r={positive:s.entity+Ei,negative:s.entity+Ci};o.set(s.entity,r),t[e]=r.positive,t[n]=r.negative,s.invert&&i.add(s.entity)}};return c("import","export",r),c("discharge","charge",a),{roles:t,inverted:i,signed:o}}function Ni(e,t){const i=Object.values(e.roles).map(e=>e.endsWith(Ei)||e.endsWith(Ci)?e.slice(0,e.lastIndexOf("#")):e);return[...new Set([...i,...t.consumers.map(e=>e.entity)])]}function Wi(e){return[...Ni(zi(e),{...e,consumers:[]})].sort()}const Pi=new Map;function Fi(e,t){const i={...e};for(const[o,n]of t){const t=e[o];t&&(i[n.positive]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(e.mean,0)})),i[n.negative]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(-e.mean,0)})))}return i}function Li(e,t,i){const o={};if(!e||"object"!=typeof e)return o;const n=e;for(const e of t){const t=n[e];if(!Array.isArray(t))continue;const s=i.has(e)?-1:1;o[e]=t.flatMap(e=>{const t=e,i="number"==typeof t.start?t.start:Date.parse(String(t.start)),o="number"==typeof t.mean?s*t.mean:null;return Number.isFinite(i)?[{start:i,mean:o}]:[]})}return o}async function Di(e,t,i,o,n,s){let r;const a=new Promise((e,i)=>{r=setTimeout(()=>i(new Error(`EnerLens: statistics (${t}) did not answer within ${n} ms`)),n)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),...void 0!==s?{end_time:new Date(s).toISOString()}:{},statistic_ids:o,period:t,types:["mean"],units:{power:"W"}}),a])}finally{void 0!==r&&clearTimeout(r)}}function Ti(e,t){return function(e){return void 0!==bi[e]}(e)?0:t}function Oi(e){const t=e.locale?.first_weekday,i=t?["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(t):-1;if(i>=0)return i;try{const t=new Intl.Locale(e.locale?.language??e.language??"en"),i=(t.getWeekInfo?.()??t.weekInfo)?.firstDay;if(i)return i%7}catch{}return 1}function Ri(e){const t=Intl.DateTimeFormat().resolvedOptions().timeZone;return"local"===e.locale?.time_zone?t:e.config?.time_zone??t}function Ii(e,t){const i={};for(const[o,n]of Object.entries(e)){const e=Math.min(...n.map(e=>e.start));e<t&&(i[o]=e)}return i}async function Bi(e,t,i,o=Date.now(),n=1e4){const s=zi(t),{roles:r,inverted:a,signed:l}=s,c=Ni(s,t),d=yi(i,o,Ri(e),Oi(e)),h=Math.floor(o/Ai)*Ai,u=Math.ceil(d/Ai)*Ai,m=d<u&&d<h-Mi,[p,g,f,_]=await Promise.all([Di(e,"hour",d-Mi,c,n),Di(e,"5minute",h-Mi,c,n),Di(e,"day",d-32*Mi,c,n),m?Di(e,"5minute",d,c,n,u):Promise.resolve({})]),w=Li(g,c,a);for(const[e,t]of Object.entries(Li(_,c,a)))w[e]=[...t,...w[e]??[]];const b=$i({from:d,to:o,roles:r,consumers:t.consumers.map(e=>e.entity),hourly:Fi(Li(p,c,a),l),fiveMin:Fi(w,l),pvZeroBelowW:t.flow.minW,since:Ii(Fi(Li(f,c,a),l),d-Mi)});return function(e,t,i,o,n,s,r=e.from,a=new Map){const l=Math.max((e.to-e.from)/Ai,1/12),c=new Map;for(const[t,n]of Object.entries(i)){const i=e.main[t]?.wh;c.set(n,void 0===i?null:o.has(n)?-i:i)}for(const[t,i]of Object.entries(e.consumers))c.set(t,i?.wh??null);for(const[e,t]of a){const i=c.get(t.positive),n=c.get(t.negative),s=null==i||null==n?null:i-n;c.set(e,null===s?null:o.has(e)?-s:s)}const d=e=>{const t=(i=e)<=.02?0:i<=.1?1:2;var i;return{tier:t,note:t>0?Te("energy.filled",n,{percent:Hi(e,n)}):""}},h={};for(const t of Object.keys(e.main)){const i=e.main[t];h[t]=i?d(i.filledShare):{tier:0,note:""}}const u={};let m=h.house?.tier??0;for(const[t,i]of Object.entries(e.consumers)){let e;e=i?void 0!==i.since?{tier:2,note:Te("energy.since",n,{date:Ki(i.since,n)})}:d(i.filledShare):{tier:2,note:Te("energy.none",n)},u[t]=e,m=Math.max(m,e.tier),e.tier}const p={tier:m,note:m>0?Te("energy.rest",n):""},g=!0===i.discharge?.endsWith(Ei),f={},_=Object.keys(i).every(t=>null!==e.main[t]);if(i.import?.endsWith(Ei)&&_){const t=t=>Math.max(0,(e.main[t]?.wh??0)/l),i=t("import")-t("export");Object.assign(f,Xt(t("solar"),Math.max(i,0),Math.max(-i,0),g?0:t("discharge"),g?0:t("charge"),t("house")))}else if(!i.import?.endsWith(Ei))for(const[t,i]of Object.entries(e.flows))g&&t.includes("battery")||(f[t]=i/l);return{period:t,from:e.from,to:e.to,lateStart:e.lateStart,hours:l,meanW:e=>{const t=c.get(e);return null==t?null:t/l},flowsW:f,marks:{roles:h,consumers:u,rest:p},fetchedAt:s,start:r}}(b,i,r,a,e,o,Ti(i,d),l)}function Hi(e,t){return new Intl.NumberFormat(t.locale?.language??t.language,{style:"percent",maximumFractionDigits:0}).format(Math.max(e,.01))}function Ki(e,t,i=!1){return new Intl.DateTimeFormat(t.locale?.language??t.language,{timeZone:Ri(t),day:"numeric",month:"numeric",...i?{hour:"2-digit",minute:"2-digit"}:{}}).format(e)}function Ui(e,t,i,o="kW"){if(!e)return"W"===o?"Watt":"kW";const n=Te(`energy.${e}`,i);return t?.lateStart&&t.period===e?Te("energy.from",i,{period:n,date:Ki(t.from,i,"today"===e||"24h"===e)}):n}const ji=Object.freeze({mW:.001,W:1,kW:1e3,MW:1e6,GW:1e9,TW:1e12}),qi={solar:{kind:"absent"},grid:{kind:"absent"},battery:{kind:"absent"},house:{kind:"absent"}},Vi=new Set;function Zi(e,t){Vi.has(e)||(Vi.add(e),console.warn(`[enerlens-card] ${t}`))}function Gi(e){if("string"!=typeof e||""===e.trim())return null;const t=Number(e);return Number.isFinite(t)?t:null}function Qi(e,t){const i=e?.states?.[t];if(!i)return null;const o=Gi(i.state);if(null===o)return null;const n=i.attributes?.unit_of_measurement;if("string"==typeof n&&""!==n){const e=ji[n];return"number"==typeof e?o*e:(Zi(`${t}|unit`,`${t}: unknown power unit "${n}", value ignored`),null)}return"power"===i.attributes?.device_class?(Zi(`${t}|assume-w`,`${t}: no unit_of_measurement, assuming W`),o):(Zi(`${t}|no-unit`,`${t}: neither unit_of_measurement nor device_class "power", value ignored`),null)}function Ji(e){const t=Math.max(0,e),i=Math.max(0,-e);return{positive:t,negative:i,net:t-i}}function Yi(e,t){if("single"===e.kind){const i=t(e.entity);return null===i?null:Ji(e.invert?-i:i)}if("split"===e.kind){const i=t(e.positive),o=t(e.negative);if(null===i||null===o)return null;const n=Math.max(0,i),s=Math.max(0,o);return{positive:n,negative:s,net:n-s}}return null}function Xi(e){return"single"===e.kind?{positive:e.entity,negative:e.entity}:"split"===e.kind?{positive:e.positive,negative:e.negative}:{}}function eo(e,t,i){return null===e?{available:!1,entity:t,derived:i}:{available:!0,w:e,entity:t,derived:i}}function to(e,t,i){return null===e?{available:!1,entityPositive:t.positive,entityNegative:t.negative,derived:i}:{available:!0,positive:e.positive,negative:e.negative,net:e.net,entityPositive:t.positive,entityNegative:t.negative,derived:i}}function io(e,t){if(!t)return{available:!1,derived:!1};const i=e?.states?.[t];return eo(i?Gi(i.state):null,t,!1)}function oo(e,t,i){return no(e,t,t=>Qi(e,t),i)}function no(e,t,i,o){const n=e=>{try{const t=i(e);return"number"==typeof t&&Number.isFinite(t)?t:null}catch{return null}},s=t?.sources??qi,{solar:r,grid:a,battery:l,house:c}=s,d="derived"===c.kind||"absent"===c.kind,h="absent"===l.kind,u=Yi(r,n),m=Yi(a,n),p=h?null:Yi(l,n),g=d?null:Yi(c,n),f=u?.net??null,_=m?.net??null,w=g?.net??null,b=h?0:p?.net??null,y=(e,t,i,o)=>null===e||null===t||null===i?null:o(e,t,i),v=d?y(f,_,b,(e,t,i)=>Math.max(0,e+t+i)):null,x="derived"===r.kind?y(w,_,b,(e,t,i)=>Math.max(0,e-t-i)):null,k="derived"===a.kind?y(w,f,b,(e,t,i)=>e-t-i):null,$="derived"===l.kind?y(w,f,_,(e,t,i)=>e-t-i):null,S="derived"===r.kind?eo(x,void 0,!0):eo(u?.net??null,Xi(r).positive,!1),A=d?eo(v,void 0,!0):eo(g?.net??null,Xi(c).positive,!1),M="derived"===a.kind?to(null===k?null:Ji(k),{},!0):to(m,Xi(a),!1);let E=null;"derived"===l.kind?E=to(null===$?null:Ji($),{},!0):h||(E=to(p,Xi(l),!1));const C=(t?.consumers??[]).map(t=>{const i=e?.states?.[t.entity],s=i?.attributes?.friendly_name;return{key:t.key,entity:t.entity,name:t.name??s??t.entity,color:t.color,minW:t.minW,icon:t.icon,reading:eo(n(t.entity),t.entity,!1),charge:t.charge&&o?{...o(t.charge),entity:t.charge.soc,show:t.charge.show}:void 0}});return{solar:S,grid:M,battery:E,soc:io(e,s.batterySoc),house:A,consumers:C}}const so={unit:"kW",decimals:2,digits:3},ro=new Set(["cs","de","fi","fr","sk","sv"]);function ao(e){return(e??"").split("-")[0].toLowerCase()}function lo(e,t){const i=e=>Math.max(t-1-Math.floor(Math.log10(e)),0),o=Math.abs(e);if(!(o>0))return Math.max(t-1,0);const n=i(o),s=Number(o.toFixed(n));return s>0?Math.min(n,i(s)):n}function co(e,t,i=so){if(void 0!==i.energyHours)return function(e,t){const i=new Intl.NumberFormat(uo(t),{minimumFractionDigits:1,maximumFractionDigits:1,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}),o=e/1e3;return o>0&&o<.05?`< ${i.format(.1)} kWh`:`${i.format(ho(o,1)?0:o)} kWh`}(e*i.energyHours,t);const o="auto"===i.unit?function(e){return Math.round(Math.abs(e))<1e3?"W":"kW"}(e):i.unit,n="W"===o?0:"auto"===i.unit?lo(e/1e3,i.digits):i.decimals,s="W"===o?e:e/1e3;return`${new Intl.NumberFormat(uo(t),{minimumFractionDigits:n,maximumFractionDigits:n,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(ho(s,n)?0:s)} ${o}`}function ho(e,t){return 0===Number(e.toFixed(t))}function uo(e){switch(e?.locale?.number_format){case"comma_decimal":return["en-US","en"];case"decimal_comma":return["de","es","it"];case"space_comma":return["fr","sv","cs"];case"quote_decimal":return["de-CH"];case"none":return"en-US";case"system":return;default:return e?.locale?.language}}function mo(e,t){if(!e)return"—";const i=Number(e.state);if(""===e.state.trim()||!Number.isFinite(i))return"—";if(t?.formatEntityState)return t.formatEntityState(e);const o=t?.entities?.[e.entity_id]?.display_precision,n="number"==typeof o?o:e.state.split(".")[1]?.length??0,s=new Intl.NumberFormat(uo(t),{minimumFractionDigits:n,maximumFractionDigits:n,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(i),r=ao(t?.locale?.language??t?.language);return`${s}${ro.has(r)?" ":""}%`}function po(e,t){const i=new Intl.NumberFormat(uo(t),{maximumFractionDigits:0}).format(Math.round(e)),o=ao(t?.locale?.language??t?.language);return`${i}${ro.has(o)?" ":""}%`}function go(e,t,i=Date.now()){const o=new Date(e),n=o.toLocaleTimeString(uo(t),{hour:"2-digit",minute:"2-digit"});if(o.toDateString()===new Date(i).toDateString())return n;return`${o.toLocaleDateString(uo(t),{day:"numeric",month:"numeric"})} ${n}`}const fo=new Set(["monetary","duration","timestamp","date"]);function _o(e,t){return"°"===e?"":"%"===e?ro.has(ao(t?.locale?.language??t?.language))?" ":"":" "}function wo(e,t,i){if(!e||"unavailable"===e.state||"unknown"===e.state)return Te("state.unavailable",t);const o=e.attributes.unit_of_measurement,n=Number(e.state),s=(Boolean(o)||Boolean(e.attributes.state_class))&&""!==e.state.trim()&&Number.isFinite(n),r=fo.has(String(e.attributes.device_class??""));if("ha"===i||!s||r)return t?.formatEntityState?t.formatEntityState(e):o?`${e.state}${_o(o,t)}${o}`:e.state;const a="number"==typeof i?0:Number(i.slice(3)),l="number"==typeof i?i:lo(n,a),c=l>20?lo(0,a):l,d=new Intl.NumberFormat(uo(t),{minimumFractionDigits:c,maximumFractionDigits:c,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(ho(n,c)?0:n);return o?`${d}${_o(o,t)}${o}`:d}const bo=400,yo=400,vo=200,xo=200,ko=56,$o={solar:{x:vo,y:58},grid:{x:58,y:xo},house:{x:342,y:xo},battery:{x:vo,y:342}},So={solar_house:"M200,114 C200,168 232,200 286,200",solar_grid:"M200,114 C200,168 168,200 114,200",solar_battery:"M200,114 L200,286",grid_house:"M114,200 L286,200",grid_battery:"M114,200 C168,200 200,232 200,286",battery_grid:"M114,200 C168,200 200,232 200,286",battery_house:"M200,286 C200,232 232,200 286,200"},Ao=["solar_house","solar_grid","solar_battery","grid_house","grid_battery","battery_house"];function Mo(e){return"M-400,-400H800V800H-400Z"+Object.values($o).map(({x:t,y:i})=>Eo(t,i,e)).join("")}function Eo(e,t,i){const o=e=>Number(e.toFixed(3)),n=`A${o(i)},${o(i)} 0 1 0`;return`M${o(e-i)},${o(t)}${n} ${o(e+i)},${o(t)}${n} ${o(e-i)},${o(t)}Z`}const Co=2,zo=e=>(...t)=>({_$litDirective$:e,values:t});let No=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Wo}=re,Po=e=>e,Fo=()=>document.createComment(""),Lo=(e,t,i)=>{const o=e._$AA.parentNode,n=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=o.insertBefore(Fo(),n),s=o.insertBefore(Fo(),n);i=new Wo(t,s,e,e.options)}else{const t=i._$AB.nextSibling,s=i._$AM,r=s!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==s._$AU&&i._$AP(t)}if(t!==n||r){let e=i._$AA;for(;e!==t;){const t=Po(e).nextSibling;Po(o).insertBefore(e,n),e=t}}}return i},Do=(e,t,i=e)=>(e._$AI(t,i),e),To={},Oo=(e,t=To)=>e._$AH=t,Ro=e=>{e._$AR(),e._$AA.remove()},Io=(e,t,i)=>{const o=new Map;for(let n=t;n<=i;n++)o.set(e[n],n);return o},Bo=zo(class extends No{constructor(e){if(super(e),e.type!==Co)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let o;void 0===i?i=t:void 0!==t&&(o=t);const n=[],s=[];let r=0;for(const t of e)n[r]=o?o(t,r):r,s[r]=i(t,r),r++;return{values:s,keys:n}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,o]){const n=(e=>e._$AH)(e),{values:s,keys:r}=this.dt(t,i,o);if(!Array.isArray(n))return this.ut=r,s;const a=this.ut??=[],l=[];let c,d,h=0,u=n.length-1,m=0,p=s.length-1;for(;h<=u&&m<=p;)if(null===n[h])h++;else if(null===n[u])u--;else if(a[h]===r[m])l[m]=Do(n[h],s[m]),h++,m++;else if(a[u]===r[p])l[p]=Do(n[u],s[p]),u--,p--;else if(a[h]===r[p])l[p]=Do(n[h],s[p]),Lo(e,l[p+1],n[h]),h++,p--;else if(a[u]===r[m])l[m]=Do(n[u],s[m]),Lo(e,n[h],n[u]),u--,m++;else if(void 0===c&&(c=Io(r,m,p),d=Io(a,h,u)),c.has(a[h]))if(c.has(a[u])){const t=d.get(r[m]),i=void 0!==t?n[t]:null;if(null===i){const t=Lo(e,n[h]);Do(t,s[m]),l[m]=t}else l[m]=Do(i,s[m]),Lo(e,n[h],i),n[t]=null;m++}else Ro(n[u]),u--;else Ro(n[h]),h++;for(;m<=p;){const t=Lo(e,l[p+1]);Do(t,s[m]),l[m++]=t}for(;h<=u;){const e=n[h++];null!==e&&Ro(e)}return this.ut=r,Oo(e,l),j}}),Ho=.0085;function Ko(e,t,i,o="overtake",n=!1){const s=e.filter(e=>e.share>0);if(!t||0===s.length)return q;const{r:r,strokeWidth:a}=function(e){const t=100/Math.max(1,e- -11)*11;return{r:50-t/2,strokeWidth:t}}(i),l=2*Math.PI*r,c=l*Ho,d=.014*l,h=s.length>1?s.length*c:0,u=l-h,m=s.map(e=>e.share*u);let p=0;for(const[e,t]of m.entries())t>0&&t<d&&(p+=d-t,m[e]=d);if(p>0){const e=m.indexOf(Math.max(...m));m[e]=Math.max(d,m[e]-p)}let g=0;const f=s.map((e,t)=>{const i={segment:e,index:t,length:m[t],offset:g};return g+=i.length+(s.length>1?c:0),i}),_="fade"===o;return _||f.sort((e,t)=>e.segment.key<t.segment.key?-1:e.segment.key>t.segment.key?1:0),K`<svg class="ring ${_&&n?"fade":""}" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${Bo(f,e=>_?`slot-${e.index}`:e.segment.key,e=>U`<circle
        class="ring-seg"
        data-key=${e.segment.key}
        data-index=${e.index}
        r=${r.toFixed(2)}
        cx="50"
        cy="50"
        stroke-width=${a.toFixed(2)}
        stroke=${e.segment.color}
        data-length=${e.length.toFixed(2)}
        data-offset=${e.offset.toFixed(2)}
        data-circ=${l.toFixed(2)}
      ></circle>`)}</g>
  </svg>`}const Uo=15.8,jo={now:()=>performance.now(),frame:e=>requestAnimationFrame(()=>e()),cancel:e=>cancelAnimationFrame(e)};class qo{constructor(e=("function"==typeof requestAnimationFrame?jo:void 0)){this.clock=e,this.drawn=new WeakMap,this.shownAt=new WeakMap,this.shown=[],this.lane=.8,this.last=0}update(e,t,i){const o=[...e.querySelectorAll("svg.ring circle.ring-seg")].map(e=>({el:e,index:Number(e.dataset.index),len:Number(e.dataset.length),off:Number(e.dataset.offset),circ:Number(e.dataset.circ)})).sort((e,t)=>e.index-t.index);this.lane=function(e){const t=e/2,i=(t-5.5-2)/(t+5.5);return Math.min(.85,Math.max(.6,i))}(i);const n=o.filter(e=>this.drawn.has(e.el)),s=[...n].sort((e,t)=>(this.shownAt.get(e.el)??0)-(this.shownAt.get(t.el)??0)),r=new Map(s.map((e,t)=>[e.el,t])),a=new Map(n.map((e,t)=>[e.el,t]));for(const e of o)this.shownAt.set(e.el,e.index);this.shown=o.map(e=>e.el);const l=n.some(e=>this.drawn.get(e.el)?.circ!==e.circ);if(!t||!this.clock||0===n.length||l){for(const e of o)this.drawn.set(e.el,{len:Vo(e.len),off:Vo(e.off),circ:e.circ});return void this.halt()}for(const[e,t]of o.entries()){const i=this.drawn.get(t.el);if(!i){this.drawn.set(t.el,this.born(o,e));continue}i.len.to=t.len,i.off.to=t.off;const s=r.get(t.el)??0,l=a.get(t.el)??0,c=n.filter(e=>(r.get(e.el)??0)<s&&(a.get(e.el)??0)>l).map(e=>e.el),d=(i.dive?.passing??[]).filter(e=>a.has(e)&&(a.get(e)??0)>l&&!c.includes(e));if(c.length+d.length>0){const e=i.dive?.scale??{x:1,v:-(1-this.lane)*Uo,to:this.lane};e.to=this.lane,i.dive={passing:[...c,...d],scale:e}}else i.dive&&(i.dive.passing=[])}this.draw();this.shown.some(e=>{const t=this.drawn.get(e);return!(void 0===t||Go(t.len)&&Go(t.off)&&void 0===t.dive)})&&this.run()}born(e,t){const i=e[t],o=t>0?this.drawn.get(e[t-1].el):void 0;let n,s=!1;for(let i=1;i<e.length&&!n;i++)n=this.drawn.get(e[(t+i)%e.length].el),s=t+i>=e.length;const r=o?o.off.x+o.len.x:0,a=n?(s?i.circ:0)+n.off.x-r:0,l=o?Math.min(i.circ*Ho,Math.max(0,a)):0,c=o?o.off.v+o.len.v:0,d=n?n.off.v:c,h=o?.dive?{passing:[...o.dive.passing],scale:{...o.dive.scale}}:void 0;return{len:{x:0,v:d-c,to:i.len},off:{x:r+l,v:c,to:i.off},circ:i.circ,dive:h}}stop(){for(const e of this.shown){const t=this.drawn.get(e);t&&Zo(t)}this.halt()}halt(){void 0!==this.pending&&this.clock?.cancel(this.pending),this.pending=void 0;for(const e of this.shown){const t=this.drawn.get(e);t&&(t.dive=void 0)}this.draw()}run(){void 0===this.pending&&this.clock&&(this.last=this.clock.now(),this.pending=this.clock.frame(()=>this.frame()))}frame(){if(this.pending=void 0,!this.clock)return;const e=this.clock.now(),t=Math.min(.25,Math.max(0,(e-this.last)/1e3));this.last=e;let i=!1;for(const e of this.shown){const o=this.drawn.get(e);o&&(Qo(o.len,t),Qo(o.off,t),Go(o.len)&&Go(o.off)||(i=!0))}if(!i)for(const e of this.shown){const t=this.drawn.get(e);t&&Object.assign(t,{len:Vo(t.len.to),off:Vo(t.off.to)})}for(const e of this.shown){const o=this.drawn.get(e);o?.dive&&this.dip(e,o,o.dive,t),o?.dive&&(i=!0)}this.draw(),i&&(this.pending=this.clock.frame(()=>this.frame()))}dip(e,t,i,o){const n=t.circ*Ho,s=t.off.x+t.len.x;i.passing=i.passing.filter(t=>{const i=this.shown.includes(t)?this.drawn.get(t):void 0;return void 0!==i&&t!==e&&s+n/2>i.off.x}),i.scale.to=i.passing.length>0?this.lane:1,Qo(i.scale,o,Uo),0===i.passing.length&&Go(i.scale,.001,Uo)&&(t.dive=void 0)}draw(){for(const e of this.shown){const t=this.drawn.get(e);if(!t)continue;const i=Math.max(0,Math.min(t.circ,t.len.x)),o=`${i.toFixed(2)} ${(t.circ-i).toFixed(2)}`,n=(-t.off.x).toFixed(2),s=t.dive?t.dive.scale.x.toFixed(3):"",r=`${o}|${n}|${s}`;r!==t.written&&(t.written=r,e.setAttribute("stroke-dasharray",o),e.setAttribute("stroke-dashoffset",n),s?e.setAttribute("transform",`translate(50 50) scale(${s}) translate(-50 -50)`):e.removeAttribute("transform"))}}}function Vo(e){return{x:e,v:0,to:e}}function Zo(e){e.len=Vo(e.len.to),e.off=Vo(e.off.to),e.dive=void 0}function Go(e,t=.05,i=3.16){return Math.abs(e.x-e.to)<t&&Math.abs(e.v)<t*i}function Qo(e,t,i=3.16){const o=e.x-e.to,n=e.v+i*o,s=Math.exp(-i*t);e.x=e.to+(o+n*t)*s,e.v=(e.v-i*n*t)*s}function Jo(e,t){return e.available?e.net>=t?"positive":e.net<=-t?"negative":"none":"none"}function Yo(e,t){if(!e.derived)return"negative"===Jo(e,t)?e.entityNegative??e.entityPositive:e.entityPositive??e.entityNegative}function Xo(e,t){e.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}const en="mdi:white-balance-sunny",tn="mdi:transmission-tower",on="mdi:home";function nn(e,t){if(t)return t;if(!e.available)return"mdi:battery";const i=10*Math.round(e.w/10);return i<=0?"mdi:battery-outline":i>=100?"mdi:battery":`mdi:battery-${i}`}function sn(e){return e&&e.tier>0?`warn${e.tier}`:""}function rn(e,t,i,o){return!e||!e.available||Math.abs(e.net)<o.flow.minW?"var(--el-line)":o.colors[e.net>0?t:i]}function an(e,t,i){return e.available?co(e.w,t,i.power):Te("state.unavailable",t)}const ln={normal:400,medium:500,bold:700};function cn(e,t,i){return`color:${t};font-size:calc(var(${i}) * ${e.size/100});font-weight:${ln[e.weight]}`}function dn(e,t,i){const o=e.nodes[t],n=o.label,s=(o.showName?15:0)+(i&&o.showState?15:0)+("derived"===e.sources[t].kind?15:0);return n?s+24+(0===s?8:0):s}function hn(e,t,i,o){const n=t.nodes[e.key],[s,...r]=e.label.split(" · "),a=n.showState?r.join(" · "):"",l=n.showName||!0===e.outage,c=e.derived?Te(l?"node.derived_suffix":"node.derived_alone",i):"",d=n.label,h=void 0!==t.energy;let u="";if(d){const n=d.prefix??"",s=wo(i.states[d.entity],i,d.decimals),r=t.extraColors[`${e.key}_label`],a=n?`${n} ${s}`:s;u=K`<button
      class="extra-label extra"
      style=${cn(d,r,"--el-label-size")+(h?";visibility:hidden":"")}
      tabindex=${h?"-1":"0"}
      aria-hidden=${h?"true":"false"}
      title=${a}
      aria-label=${a}
      @click=${o(d.entity)}
    >${n?K`<span class="extra-prefix">${n}</span> `:""}<span class="extra-value"
        >${s}</span
      ></button>`}if(!(l||a||c||d))return"";const m=K`${l?K`<span class="label-name">${s}</span>`:""}${a?K`<span class="label-state">${a}</span>`:""}${c?K`<span class="label-state derived">${c}</span>`:""}`;return K`<div class="label">${"solar"===e.key?K`${m}${u}`:K`${u}${m}`}</div>`}function un(e,t,i,o=!1){const n=[];n.push({key:"solar",icon:t.icons.solar??en,color:e.solar.available&&e.solar.w>0?t.colors.solar:"var(--el-line)",label:Te("node.solar",i),derived:e.solar.derived,value:an(e.solar,i,t),available:e.solar.available,entity:e.solar.derived?void 0:e.solar.entity});const s=e.grid,r=Jo(s,t.flow.minW),a=o&&void 0!==t.gridStatus;n.push({key:"grid",icon:t.icons.grid??tn,color:a?"var(--el-error)":rn(s,"grid_import","grid_export",t),label:Te(a||"none"===r?"node.grid":"positive"===r?"node.grid_import":"node.grid_export",i),derived:s.derived,value:a?Te("node.no_grid",i):s.available?co(Math.abs(s.net),i,t.power):Te("state.unavailable",i),available:a||s.available,outage:a,entity:a?t.gridStatus?.entity:Yo(s,t.flow.minW)}),n.push({key:"house",icon:t.icons.house??on,color:t.colors.house,label:Te("node.house",i),derived:e.house.derived,value:an(e.house,i,t),available:e.house.available,entity:e.house.derived?void 0:e.house.entity});const l=e.battery;if(l){const o=Jo(l,t.flow.minW),s=t.sources.batterySoc,r=s?i.states[s]:void 0;n.push({key:"battery",icon:nn(e.soc,t.icons.battery),color:rn(l,"battery_discharge","battery_charge",t),label:Te("positive"===o?"node.battery_discharging":"negative"===o?"node.battery_charging":"node.battery",i),derived:l.derived,value:l.available?co(Math.abs(l.net),i,t.power):Te("state.unavailable",i),available:l.available,socValue:e.soc.available?mo(r,i):void 0,socPercent:e.soc.available?Math.max(0,Math.min(100,e.soc.w)):void 0,socFillColor:e.soc.available?Me(e.soc.w,t.colors.socStops,Ee):void 0,entity:Yo(l,t.flow.minW),socEntity:s})}return t.energy&&function(e,t,i,o){const n=i.energy?.roles??{},s=Te("state.unavailable",o),r=(e,t,r,a,l)=>({arrow:e,color:i.colors[t],text:null===r?s:co(r,o,i.power),entity:l,mark:n[a]}),a=(e,t,o,n)=>Math.max(e,t)<i.flow.minW?"var(--el-line)":i.colors[e>=t?o:n];for(const s of e){if("solar"===s.key&&(s.mark=n.solar),"house"===s.key&&(s.mark=n.house),"grid"===s.key){const e=t.grid,l=e.available?e.positive:null,c=e.available?e.negative:null;if(s.label=Te("node.grid",o),s.crossed=s.outage,s.outage=!1,s.icon=i.icons.grid??tn,s.color=a(l??0,c??0,"grid_import","grid_export"),"single"===i.sources.grid.kind){const t=e.available?e.net:null,i=(t??0)<0,o=r(i?"←":"→",i?"grid_export":"grid_import",null===t?null:Math.abs(t),i?"export":"import",e.entityPositive??e.entityNegative);o.mark=pn(n.import,n.export),s.figures={lower:o},s.entity=o.entity,s.value=o.text;continue}s.figures={upper:r("→","grid_import",l,"import",e.entityPositive),lower:r("←","grid_export",c,"export",e.entityNegative)},s.entity=e.entityNegative,s.value=s.figures.lower.text}if("battery"===s.key&&t.battery){const e=t.battery,n=e.available?e.positive:null,l=e.available?e.negative:null;if(s.label=Te("node.battery",o),s.color=a(n??0,l??0,"battery_discharge","battery_charge"),s.socValue=void 0,s.socPercent=void 0,s.socEntity=void 0,s.icon=i.icons.battery??"mdi:battery","single"===i.sources.battery.kind){s.noFigure=!0,s.value="",s.entity=e.entityPositive??e.entityNegative;continue}s.figures={upper:r("↑","battery_discharge",n,"discharge",e.entityPositive),lower:r("↓","battery_charge",l,"charge",e.entityNegative)},s.entity=e.entityNegative,s.value=s.figures.lower.text}}}(n,e,t,i),n}const mn={"→":{box:"0 0 18 12",d:"M1.5 6 H16 M12 2.2 L16 6 L12 9.8",vertical:!1},"←":{box:"0 0 18 12",d:"M16.5 6 H2 M6 2.2 L2 6 L6 9.8",vertical:!1},"↓":{box:"0 0 12 18",d:"M6 1.5 V16 M2.2 12 L6 16 L9.8 12",vertical:!0},"↑":{box:"0 0 12 18",d:"M6 16.5 V2 M2.2 6 L6 2 L9.8 6",vertical:!0}};function pn(e,t){return e?t&&t.tier>e.tier?t:e:t}function gn(e){const t=mn[e.arrow]??mn["→"];return K`<div class="value figure ${sn(e.mark)}" title=${e.mark?.note??""}>
    <svg
      class="arrow ${t.vertical?"vertical":""}"
      data-arrow=${e.arrow}
      viewBox=${t.box}
      aria-hidden="true"
      style="color:${e.color}"
    >
      ${U`<path d=${t.d}></path>`}
    </svg>
    ${e.text}
  </div>`}function fn(e,t,i,o){return t.nodes[e.key].inside?.position!==o||e.figures?"":function(e,t,i){const o=t.nodes[e.key].inside;if(!o)return K``;const n=t.extraColors[`${e.key}_inside`];return K`<div class="extra-inside extra" style=${cn(o,n,"--el-value-size")}>${wo(i.states[o.entity],i,o.decimals)}</div>`}(e,t,i)}const _n=new Set(["solar_battery","grid_battery","battery_house","battery_grid"]);function wn(e,t,i,o,n=[],s=123,r=!1,a=!1,l=56,c=!1){const d=un(e,t,i,r),h=e.battery?Ao:Ao.filter(e=>!_n.has(e)),u=[..."hide"===t.flow.inactiveLines?h.filter(e=>o.has(e)):h].sort((e,t)=>Number(o.has(e))-Number(o.has(t)));return K`
    <div class="cross ${null===e.battery?"no-battery":""}">
      <div class="plot">
        <svg viewBox="0 0 ${bo} ${yo}" aria-hidden="true">
          ${c?U`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${Mo(l)}></path>
            </clipPath>
          </defs>`:q}
          <g clip-path=${c?"url(#el-holes)":q}>
          ${u.map(e=>U`<path
                class="link ${o.has(e)?"active":`inactive-${t.flow.inactiveLines}`}"
                style=${o.has(e)?`stroke:${o.get(e)}`:""}
                d=${So[e]}
              ></path>`)}
            <g class="dots"></g>
          </g>
        </svg>
        ${d.map(e=>{const o=function(e){const t=$o[e];return{left:100*t.x/bo+"%",top:100*t.y/yo+"%"}}(e.key),r=e=>t=>{e&&Xo(t.currentTarget,e)};return K`
          <div
            class="node ${e.key} ${"house"===e.key&&n.length>0?"has-ring":""} ${e.outage?"outage":""} ${t.energy?"in-period":""}"
            style="left:${o.left};top:${o.top};border-color:${"house"===e.key&&n.length>0?"transparent":e.color}"
          >
            ${"house"===e.key?Ko(n,n.length>0,s,t.ring.animation,a):""}
            ${void 0!==e.socPercent?K`<div class="fill-clip">
                    <div
                      class="fill"
                      style="height:${e.socPercent}%;background:${e.socFillColor}"
                    ></div>
                  </div>`:""}
            ${e.socValue?K`<div class="value">${e.socValue}</div>`:""}
            ${e.figures?.upper?gn(e.figures.upper):""}
            ${fn(e,t,i,"above")}
            ${e.outage||e.crossed?K`<div class="icon-cross">
                    <ha-icon
                      .icon=${e.icon}
                      style="color:${e.crossed?"var(--el-error)":e.color}"
                    ></ha-icon>
                    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
                      <path d="M3,3 L21,21"></path>
                      <path d="M21,3 L3,21"></path>
                    </svg>
                  </div>`:K`<ha-icon .icon=${e.icon} style="color:${e.color}"></ha-icon>`}
            ${e.noFigure?"":e.figures?gn(e.figures.lower):K`<div
                    class="value ${e.available?"":"unavailable"} ${sn(e.mark)}"
                    title=${e.mark?.note??""}
                  >${e.value}</div>`}
            ${fn(e,t,i,"below")}
            ${"solar"===e.key?hn(e,t,i,r):""}
            ${function(e,t,i,o){const n=t.nodes[e.key],s=n.label?"-2px":"-22px",r="solar"===e.key?s:"-22px",a="solar"===e.key?"-22px":s,l="above"!==n.inside?.position||t.energy?void 0:n.inside,c=e.figures?.upper?.entity?{entity:e.figures.upper.entity,text:e.figures.upper.text}:e.socEntity?{entity:e.socEntity,text:e.socValue??""}:l?{entity:l.entity,text:wo(i.states[l.entity],i,l.decimals)}:void 0;if(c){const t="height:max(44px, calc(50% + 2px))";return K`
      <button
        class="hit upper"
        style=${"solar"===e.key&&n.label?`top:${r};bottom:auto;${t};z-index:3`:`top:${r}`}
        aria-label=${`${e.label} ${c.text}`}
        @click=${o(c.entity)}
      ></button>
      <button
        class="hit lower"
        style=${"solar"!==e.key&&n.label?`top:auto;bottom:${a};${t}`:`bottom:${a}`}
        aria-label=${e.value?`${e.label} ${e.value}`:e.label}
        @click=${o(e.entity)}
        ?disabled=${!e.entity}
      ></button>
    `}return e.entity?K`<button
    class="hit"
    style="top:${r};bottom:${a}"
    aria-label=${e.value?`${e.label} ${e.value}`:e.label}
    @click=${o(e.entity)}
  ></button>`:""}(e,t,i,r)}
            ${"solar"===e.key?"":hn(e,t,i,r)}
          </div>
          `})}
      </div>
    </div>
  `}function bn(e,t){const i=function(e){const t=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(t){const e=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1],i=Number.parseInt(e,16);return[i>>16&255,i>>8&255,255&i]}const i=e.match(/^rgba?\(([^)]+)\)/i);if(!i)return;const o=i[1].split(/[,\s/]+/).map(Number);return o.length<3||o.slice(0,3).some(e=>!Number.isFinite(e))?void 0:[o[0],o[1],o[2]]}(e);if(!i)return e;return`rgb(${i.map(e=>Math.round(e+(255-e)*t)).join(",")})`}function yn(e){const t=e.dot/2,i=[{r:t,colour:e.colour,opacity:1,forward:0}],o=Math.floor(e.caps);if(o<=0||e.core<=0||e.coreLight<=0)return i;const n=1-.15**(1/o);for(let s=1;s<=o;s++){const r=s/o,a=1-r*(1-e.core);i.push({r:t*a,colour:bn(e.mixFrom??e.colour,e.coreLight*r),opacity:n,forward:e.bias*t*(1-a)})}return i}const vn=[3,8],xn=[[0,.55],[.3,.42],[.62,.12],[1,0]];function kn(e,t,i,o){if(1!==e||t<=0)return"";const n=t/60;return vn.map(e=>`drop-shadow(0 0 ${(e*n*o).toFixed(1)}px ${i})`).join(" ")}function $n(e){const t=e/60;return xn.map(([e,i])=>[e,Math.min(i*t,1)])}function Sn(e){const t=e.match(/rgba?\(([^)]+)\)/i);if(!t)return;const i=t[1].split(/[,\s/]+/).map(Number);if(i.length<3||i.slice(0,3).some(e=>!Number.isFinite(e)))return;if(i.length>=4&&Number.isFinite(i[3])&&i[3]<.1)return;const[o,n,s]=i;return(.2126*o+.7152*n+.0722*s)/255}function An(e,t){return"dark"===t||"light"!==t&&function(e){if("function"!=typeof getComputedStyle)return!0;const t=getComputedStyle(e),i=Sn(t.backgroundColor);if(void 0!==i)return i<.5;const o=Sn(t.color);return void 0===o||o>.5}(e)}function Mn(e,t){if("function"!=typeof getComputedStyle||"undefined"==typeof document)return t;const i=document.createElement("span");if(i.style.display="none",i.style.color=t,""===i.style.color)return t;e.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o&&!o.includes("var(")?o:void 0}const En="http://www.w3.org/2000/svg",Cn=400;function zn(e,t){return 1===t?e:e.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi,e=>String(Number((Number(e)/t).toFixed(2))))}const Nn="http://www.w3.org/2000/svg",Wn=5e3;class Pn{constructor(e,t){this.container=e,this.technique=t,this.links=new Map,this.paused=!1,this.scale=1,this.dark=!0,this.pathZoom=1,this.dotScale=1}setScale(e){!Number.isFinite(e)||e<=0||e===this.scale||(this.scale=e,this.repaint())}setDotScale(e){!Number.isFinite(e)||e<=0||e===this.dotScale||(this.dotScale=e,this.repaint())}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const[e,t]of this.links)for(const i of t.dots)i.el.style.offsetPath=this.offsetPath(e)}}setDesign(e,t){e===this.design&&t===this.dark||(this.design=e,this.dark=t,this.repaint())}update(e,t,i){const o=new Set;for(const n of e){o.add(n.connection);const e=this.links.get(n.connection)??this.createLink(n),s=t.flow.dotColor??t.colors[n.colorKey],r=e.colour!==s;e.colour=s,r&&(e.mixFrom="");const a=e.mixFrom?void 0:Mn(this.container,s);a&&(e.mixFrom=a);const l=r||void 0!==a,c=this.phaseOf(e.dots[0]);for(;e.dots.length>n.count;){const t=e.dots.pop();t?.animation?.cancel(),t?.el.remove()}for(;e.dots.length<n.count;)e.dots.push(this.createDot(e,n,e.dots.length,n.count,i,c));const d=5/Math.max(n.durationS,.01);for(const[t,o]of e.dots.entries())l&&this.paint(e,o),this.canAnimate(o,i)?(o.animation?o.animation.playbackRate=d:o.animation=this.startAnimation(e,o,t,n.count,c),this.setPhase(o.animation,t,n.count,c)):(o.animation?.cancel(),o.animation=void 0,o.el.style.offsetDistance=100*t/n.count+"%");l&&this.applyGlow(e),e.durationS=n.durationS,e.colorKey=n.colorKey,e.count=n.count}for(const[e,t]of this.links)if(!o.has(e)){for(const e of t.dots)e.animation?.cancel(),e.el.remove();t.group.remove(),this.links.delete(e)}}pause(){if(!this.paused){this.paused=!0;for(const e of this.links.values())for(const t of e.dots)t.animation?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.links.values())for(const t of e.dots)t.animation?.play()}}destroy(){for(const e of this.links.values()){for(const t of e.dots)t.animation?.cancel(),t.el.remove();e.group.remove()}this.links.clear(),this.defs?.remove(),this.defs=void 0}ground(){if(this.design)return this.dark?this.design.dark:this.design.light}repaint(){for(const e of this.links.values()){for(const t of e.dots)this.paint(e,t);this.applyGlow(e)}}createLink(e){const t=document.createElementNS(Nn,"g");this.container.appendChild(t);const i={group:t,dots:[],durationS:e.durationS,colorKey:e.colorKey,colour:"",mixFrom:"",count:0};return this.links.set(e.connection,i),i}canAnimate(e,t){return"waapi"===this.technique&&t&&"function"==typeof e.el.animate}offsetPath(e){return`path("${zn(So[e],this.pathZoom)}")`}phaseOf(e){const t=e?.animation?.currentTime;return"number"!=typeof t?0:(t%Wn+Wn)%Wn/Wn}setPhase(e,t,i,o){e.currentTime=(o+t/i)%1*Wn}createDot(e,t,i,o,n,s=0){const r=document.createElementNS(Nn,"g");r.setAttribute("class","dot"),r.style.offsetPath=this.offsetPath(t.connection),r.style.offsetRotate="auto",r.style.offsetDistance=(s+i/o)%1*100+"%",e.group.appendChild(r);const a={el:r};return this.paint(e,a),this.canAnimate(a,n)&&(a.animation=this.startAnimation(e,a,i,o,s)),a}startAnimation(e,t,i,o,n=0){const s=t.el.animate([{offsetDistance:"0%"},{offsetDistance:"100%"}],{duration:Wn,iterations:Number.POSITIVE_INFINITY,easing:"linear"});return s.playbackRate=5/Math.max(e.durationS,.01),this.setPhase(s,i,o,n),this.paused&&s.pause(),s}paint(e,t){for(;t.el.firstChild;)t.el.removeChild(t.el.firstChild);const i=this.ground(),o=e.colour,n=(i?.dot??10)/2/this.scale*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const e=document.createElementNS(Nn,"circle");e.setAttribute("r",(3.4*n).toFixed(2)),e.setAttribute("fill",`url(#${this.haloGradient(o,i)})`),t.el.appendChild(e)}for(const s of yn({dot:2*n,caps:this.design?.shape.caps??0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:o,mixFrom:e.mixFrom||o})){const e=document.createElementNS(Nn,"circle");e.setAttribute("cx",s.forward.toFixed(2)),e.setAttribute("r",s.r.toFixed(2)),e.setAttribute("fill",s.colour),s.opacity<1&&e.setAttribute("fill-opacity",s.opacity.toFixed(3)),t.el.appendChild(e)}}applyGlow(e){const t=this.ground();e.group.style.filter=t?kn(t.glow,t.glowStrength,e.colour,this.dotScale/this.scale):""}haloGradient(e,t){const i=`el-halo-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Nn,"defs"),this.container.appendChild(this.defs)),!this.defs.querySelector(`#${CSS.escape(i)}`)){const o=document.createElementNS(Nn,"radialGradient");o.setAttribute("id",i);for(const[i,n]of $n(t.glowStrength)){const t=document.createElementNS(Nn,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(n)),o.appendChild(t)}this.defs.appendChild(o)}return i}}const Fn="http://www.w3.org/2000/svg",Ln=5e3;class Dn{constructor(e){this.svg=e,this.lines=new Map,this.paused=!1,this.dotRadius=5,this.dark=!0,this.pathZoom=1,this.dotScale=1}setDesign(e,t){if(e!==this.design||t!==this.dark){this.design=e,this.dark=t;for(const e of this.lines.values())e.paintKey=void 0}}setDotColor(e){if(e!==this.dotColor){this.dotColor=e;for(const e of this.lines.values())e.paintKey=void 0}}setPathZoom(e){this.pathZoom=e}ground(){return this.dark?this.design?.dark:this.design?.light}update(e,t,i,o,n){this.svg.setAttribute("viewBox",`0 0 ${i.width} ${i.height}`),this.svg.setAttribute("width",String(i.width)),this.svg.setAttribute("height",String(i.height));const s=this.holeClip(n,i),r=s!==this.clip;this.clip=s;const a=new Set;for(const i of e){a.add(i.key);const e=this.pathFor(t,i),n=!this.lines.has(i.key),l=this.lines.get(i.key)??this.createLine(i.key);if(l.path.setAttribute("d",e),r||n)for(const e of[l.path,l.group])s?e.setAttribute("clip-path",s):e.removeAttribute("clip-path");l.path.setAttribute("class","fan-line"+(i.inactive?` inactive-${i.inactive}`:"")),l.path.style.stroke=i.inactive?"":i.color;const c=i.inactive?void 0:this.ground(),d=i.fade??1;for(l.path.style.opacity=c?String(c.line/100*d):"",l.path.style.setProperty("--el-fade",String(d)),l.group.style.opacity=d<1?String(d):"";l.dots.length>i.count;)l.dots.pop()?.remove(),l.animations.pop()?.cancel();for(;l.dots.length<i.count;)l.dots.push(this.createDot(l,i.key));const h=this.dotColor??i.color,u=[h,this.dotRadius,this.dotScale,c?this.design?.id:"",this.dark].join("|"),m=l.paintKey!==u;l.paintKey=u,m&&(l.mixFrom=void 0);const p=void 0===l.mixFrom?Mn(this.svg,h):void 0;p&&(l.mixFrom=p);const g=m||void 0!==p,f=l.mixFrom??h;g&&this.applyGlow(l,h,c);const _=l.count!==i.count,w=zn(e,this.pathZoom),b=5/Math.max(i.durationS,.01);for(const[e,t]of l.dots.entries()){if(!g&&t.firstChild||this.paintDot(t,h,c,f),t.style.offsetPath=`path("${w}")`,t.style.offsetRotate="auto",!o||"function"!=typeof t.animate){l.animations[e]?.cancel(),l.animations[e]=void 0,t.style.offsetDistance=100*e/i.count+"%";continue}let n=l.animations[e];n||(n=t.animate([{offsetDistance:"0%"},{offsetDistance:"100%"}],{duration:Ln,iterations:Number.POSITIVE_INFINITY,easing:"linear"}),l.animations[e]=n,this.paused&&n.pause()),n.playbackRate=b,!_&&l.animations[e]||(n.currentTime=Ln*e/i.count)}l.count=i.count}for(const[e,t]of this.lines)if(!a.has(e)){for(const e of t.animations)e?.cancel();for(const e of t.dots)e.remove();t.group.remove(),t.path.remove(),this.lines.delete(e)}}pathFor(e,t){const i=t.x-e.x,o=Math.min(160,Math.max(40,.6*i)),n=e.x+Math.min(o,i),s=o/2,r=e=>e.toFixed(1);return`M${r(e.x)},${r(e.y)} C${r(e.x+s)},${r(e.y)} ${r(n-s)},${r(t.y)} ${r(n)},${r(t.y)} L${r(t.x)},${r(t.y)}`}createLine(e){const t=document.createElementNS(Fn,"path");t.setAttribute("class","fan-line"),t.setAttribute("fill","none"),t.dataset.key=e,this.svg.appendChild(t);const i=document.createElementNS(Fn,"g");this.svg.appendChild(i);const o={path:t,group:i,dots:[],animations:[],count:0};return this.lines.set(e,o),o}holeClip(e,t){if(!(e&&e.r>0))return;this.defs||(this.defs=document.createElementNS(Fn,"defs"),this.svg.appendChild(this.defs));let i=this.defs.querySelector("#el-fan-hole path");if(!i){const e=document.createElementNS(Fn,"clipPath");e.setAttribute("id","el-fan-hole"),e.setAttribute("clipPathUnits","userSpaceOnUse"),i=document.createElementNS(Fn,"path"),i.setAttribute("clip-rule","evenodd"),e.appendChild(i),this.defs.appendChild(e)}const{width:o,height:n}=t,s=`M${-o},${-n}H${2*o}V${2*n}H${-o}Z${Eo(e.x,e.y,e.r)}`;return i.getAttribute("d")!==s&&i.setAttribute("d",s),"url(#el-fan-hole)"}haloGradient(e,t){const i=`fan-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Fn,"defs"),this.svg.appendChild(this.defs)),!this.defs.querySelector(`#${i}`)){const o=document.createElementNS(Fn,"radialGradient");o.setAttribute("id",i);for(const[i,n]of $n(t.glowStrength)){const t=document.createElementNS(Fn,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(n)),o.appendChild(t)}this.defs.appendChild(o)}return i}applyGlow(e,t,i){e.group.style.filter=i?kn(i.glow,i.glowStrength,t,this.dotScale):""}paintDot(e,t,i,o){for(;e.firstChild;)e.removeChild(e.firstChild);const n=(i?i.dot/2:this.dotRadius)*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const o=document.createElementNS(Fn,"circle");o.setAttribute("r",(3.4*n).toFixed(2)),o.setAttribute("fill",`url(#${this.haloGradient(t,i)})`),e.appendChild(o)}for(const s of yn({dot:2*n,caps:i?this.design?.shape.caps??0:0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:t,mixFrom:o})){const t=document.createElementNS(Fn,"circle");t.setAttribute("cx",s.forward.toFixed(2)),t.setAttribute("r",s.r.toFixed(2)),t.setAttribute("fill",s.colour),s.opacity<1&&t.setAttribute("fill-opacity",s.opacity.toFixed(3)),e.appendChild(t)}}createDot(e,t){const i=document.createElementNS(Fn,"g");return i.setAttribute("class","fan-dot"),i.dataset.key=t,e.group.appendChild(i),i}setDotRadius(e){this.dotRadius=e}setDotScale(e){Number.isFinite(e)&&e>0&&(this.dotScale=e)}pause(){if(!this.paused){this.paused=!0;for(const e of this.lines.values())for(const t of e.animations)t?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.lines.values())for(const t of e.animations)t?.play()}}destroy(){for(const e of this.lines.values()){for(const t of e.animations)t?.cancel();for(const t of e.dots)t.remove();e.group.remove(),e.path.remove()}this.lines.clear(),this.defs?.remove(),this.defs=void 0,this.clip=void 0}}function Tn(e,t,i){if("current"===e)return Te("view.now",i);return Te("view.average",i,{minutes:"avg_short"===e?t.view.avgShortMinutes:t.view.avgLongMinutes})}function On(e,t,i,o,n,s,r,a,l){const c=e.view.modes.length>1,d=void 0!==a&&e.consumers.length>0&&e.list.scope.length>1,h=void 0!==l&&(l.waiting||l.labels.length>1),u=!0===l?.inPeriod,m=u?h?q:K`<div class="mode-note ${l?.late?"late":""}" title=${l?.title??""}>
          ${Te("energy.fixed",t,{period:l?.active??""})}
        </div>`:c||"current"===o?q:K`<div class="mode-note">${Tn(o,e,t)}</div>`;if(!(i||c||h||d||m!==q))return q;const p=Te(r?"list.filter_on":"list.show_all",t),g=d?K`<button
        class="filter-toggle ${r?"on":""}"
        aria-pressed=${r?"true":"false"}
        aria-label=${p}
        title=${p}
        @click=${a}
      >
        <ha-icon .icon=${r?"mdi:filter-off-outline":"mdi:filter-outline"}></ha-icon>
      </button>`:q;return K`
    <div class="header">
      ${i?K`<div class="title">${i}</div>`:K`<span></span>`}
      <div class="controls">
        ${c?function(e,t,i,o,n,s=!1){const r=e.view.modes,a=r[(r.indexOf(i)+1)%r.length],l=s?Te("view.off_in_period",t):Te("view.chip",t,{mode:Tn(i,e,t),next:Tn(a,e,t)});return K`<button
    class="mode-chip view-chip"
    aria-disabled=${s?"true":"false"}
    aria-label=${l}
    title=${s?l:o?Te("view.since",t,{time:o}):""}
    @click=${()=>{s||n(a)}}
  >
    ${r.map(o=>K`<span class="mode-label ${o===i?"active":""}" aria-hidden="true"
        >${Tn(o,e,t)}</span
      >`)}
  </button>`}(e,t,o,n,s,u):q}
        ${m}
        ${h&&l?function(e){const t=e.labels.includes(e.active)?e.labels:[...e.labels,e.active];return e.waiting?K`<button class="mode-chip energy-chip waiting" aria-hidden="true" tabindex="-1">
      ${t.map(t=>K`<span class="mode-label ${t===e.active?"active":""}">${t}</span>`)}
    </button>`:K`<button
    class="mode-chip energy-chip ${e.late?"late":""}"
    aria-label=${e.ariaLabel}
    title=${e.title}
    @click=${e.onCycle}
  >
    ${t.map(t=>K`<span class="mode-label ${t===e.active?"active":""}" aria-hidden="true"
        >${t}</span
      >`)}
  </button>`}(l):q}
        ${g}
      </div>
    </div>
  `}function Rn(e,t){return e.isRest?e.name||Te("list.rest",t):e.name}function In(e,t,i,o,n){return t.list.enabled?K`
    <div class="list ${n?"stacked":""}" style="--el-row-h:${s=e.entries.length,s<=4?40:s<=7?34:28}px">
      ${t.list.title?K`<p class="list-title">${t.list.title}</p>`:q}
      <div class="rows">
        ${n?function(e){return K`<ha-icon
    class="origin-icon"
    aria-hidden="true"
    .icon=${e.icons.house??on}
    style="color:${e.colors.house}"
  ></ha-icon>`}(t):q}
        ${Bo(e.entries,e=>e.key,e=>{const s=e.charge,r=function(e,t){return!t.energy&&void 0!==e.charge?.soc&&(e.powerUnknown||e.w<t.flow.minW)}(e,t),a=r&&void 0!==s?.soc?po(s.soc,i):e.powerUnknown?"—":co(e.w,i,t.power),l=s?function(e,t){if(void 0===e.soc)return Te("list.charge_unknown",t);const i=po(e.soc,t);return e.stale&&void 0!==e.since?Te("list.charge_stale",t,{value:i,time:go(e.since,t)}):Te("list.charge",t,{value:i})}(s,i):"",c=t.energy?e.isRest?t.energy.rest:t.energy.consumers[e.entity??""]:void 0,d=c&&c.tier>0?`warn${c.tier}`:"",h=t=>s?K`<button
                  class="soc-hit ${t}"
                  title=${l}
                  aria-label=${`${Rn(e,i)}: ${l}`}
                  @click=${e=>o(s.entity,e)}
                ></button>`:q;return K`
            <div
              class="row ${e.isRest?"rest":""} ${s?"charge":""} ${s?.stale?"stale":""}"
              data-key=${e.key}
            >
              ${n?K`<span class="lane" aria-hidden="true"></span>`:q}
              ${s?K`<span class="swatch ${e.icon?"icon":"dot"}" style="color:${e.color}"
                      >${function(e){const t=11.2,i=2*Math.PI*t,o=void 0===e?0:i*Math.max(0,Math.min(100,e))/100;return K`<svg class="charge-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="track" cx="12" cy="12" r=${t}></circle>
    ${o>0?U`<circle
          class="fill"
          cx="12"
          cy="12"
          r=${t}
          stroke-dasharray=${`${o.toFixed(2)} ${i.toFixed(2)}`}
          transform="rotate(-90 12 12)"
        ></circle>`:q}
  </svg>`}(s.soc)}${e.icon?K`<ha-icon .icon=${e.icon}></ha-icon>`:q}${h("mark")}</span
                    >`:e.icon?K`<ha-icon class="swatch icon" .icon=${e.icon} style="color:${e.color}"></ha-icon>`:K`<span class="swatch dot" style="color:${e.color}"></span>`}
              <span class="name">${Rn(e,i)}</span>
              <span class="row-value ${r?"soc":""} ${d}" title=${c?.note??""}
                >${a}${r?h("value"):q}</span
              >
              ${e.entity?K`<button
                    class="row-hit"
                    title=${c?.note??""}
                    aria-label=${`${Rn(e,i)} ${e.powerUnknown?"—":co(e.w,i,t.power)}`}
                    @click=${t=>o(e.entity,t)}
                  ></button>`:q}
            </div>
          `})}
      </div>
    </div>
  `:q;var s}class Bn{constructor(){this.positions=new Map,this.targets=new Map}static top(e,t){return e.getBoundingClientRect().top-t.getBoundingClientRect().top}capture(e){if(this.positions.clear(),this.blockTop=void 0,!e)return;const t=e.querySelector(".rows");t&&(this.blockTop=Bn.top(t,e));for(const t of e.querySelectorAll(".row")){const i=t.dataset.key;i&&this.positions.set(i,Bn.top(t,e))}}play(e,t){if(!e)return;const i=t&&"function"==typeof Element.prototype.animate,o=new Set,n=e.querySelector(".rows"),s=n&&void 0!==this.blockTop?this.blockTop-Bn.top(n,e):0,r=e.querySelector(".row")?.getBoundingClientRect().height||28,a=this.positions.size>0?s:Math.max(-r,Math.min(r,s));for(const t of e.querySelectorAll(".row")){const n=t.dataset.key;if(!n)continue;o.add(n);const s=this.positions.get(n),r=Bn.top(t,e),l=Bn.runningGlide(t);if(l&&this.targets.get(n)===r)continue;if(this.targets.set(n,r),void 0===s){if(i){t.animate([{opacity:0,transform:`translateY(${a}px)`},{opacity:1,transform:`translateY(${.45*a}px)`,offset:.33},{opacity:1,transform:"none"}],{duration:600,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=Hn}continue}const c=s-r;if(!c||!i)continue;l?.cancel();t.animate([{transform:`translateY(${c}px)`},{transform:"none"}],{duration:600,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=Hn}for(const e of[...this.targets.keys()])o.has(e)||this.targets.delete(e);this.positions.clear()}static runningGlide(e){if("function"==typeof e.getAnimations)return e.getAnimations().find(e=>e.id===Hn&&"running"===e.playState)}}const Hn="enerlens-glide";function Kn(e,t){const i=function(e){return!Number.isFinite(e)||e<=0?1:Math.sqrt(Math.min(e,1))}(e),o=e=>Math.round(1e3*e)/1e3;return{dot:o(t.dotSize/100*i),line:o(t.lineWidth/100*i)}}const Un=s`
  :host {
    /* One size for all four nodes (REQ K-14): 2 × NODE_R viewBox units at the
       measured scale, plus 11 px so the ring inside the house keeps its stroke
       at small sizes; never below 70 px, where the figure stops being legible. */
    --el-node-size: max(70px, calc(112px * var(--el-scale, 1) + 11px));
    --el-value-size: clamp(12px, calc(13px * var(--el-scale, 1)), 15px);
    /* 12 px matches power-flow-card-plus, whose labels this sits next to on
       many dashboards. Fixed rather than scaled: the original does not scale
       either, and text below a circle has no reason to shrink with it. */
    --el-label-size: 12px;
    --el-list-size: 12px;
    --el-line: var(--divider-color, rgba(127, 127, 127, 0.3));
    /* Grid outage (REQ NS-4, NS-5). A theme that defines --error-color wins;
       only the fallback differs per scheme, because the default dark red
       disappears on a dark ground. */
    --el-error: var(--error-color, #db4437);
    /* Energy figures with gaps filled in (REQ EM-11): a muted grey-blue for a
       few, amber for many. Red stays the outage's. Not HA's --warning-color:
       as text on white it has too little contrast (ENT-18). */
    --el-warn1: #5a7896;
    --el-warn2: #b26a00;
    /*
     * The charge level fills the battery node with its colour at this opacity.
     * Alpha always blends towards the ground, and that does not behave the
     * same on both: on white the green comes out a pale tint that reads as
     * green at once, on near-black a murky olive that reads as "slightly less
     * black". Measured on the green of a full battery, 22 % over white gives a
     * colourfulness of 30, over the dark card only 28 - while the text on top
     * of it has contrast to spare. So the dark ground gets more of the colour.
     * Measured on the fill of a battery at 94 %, rgb(89,167,69): 22 % over the
     * dark card gives a colourfulness of 19 against 22 over white, and at 60 %
     * it is 57 - with the text on top at contrast 4.5, exactly the floor the
     * guidelines set. This is the end of the road: anything brighter buys
     * colour by making the figures on the fill harder to read, and would have
     * to come from lightening the fill colour itself instead.
     */
    --el-soc-alpha: 0.22;
    display: block;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --el-error: var(--error-color, #f2645a);
      --el-warn1: #93abc4;
      --el-warn2: #ffb300;
      --el-soc-alpha: 0.6;
    }
  }

  /**
   * A ground of the card's own (REQ P-12).
   *
   * Set on :host, so it reaches this card and nothing else - the dashboard
   * around it keeps the theme it has. What is overridden are the few Home
   * Assistant variables the card actually paints with; the flow colours are
   * left alone, because they name a source and have to stay recognisable on
   * either ground.
   *
   * The values are Home Assistant's own defaults for the two schemes, not a
   * palette of ours: a card that forces dark should look like a dark HA card.
   * A custom theme's idea of dark cannot be read from CSS, so this gives the
   * default one - which is the honest limit of forcing it.
   */
  :host([data-appearance="dark"]),
  :host([data-appearance="light"]) {
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
    /* The card never set a colour of its own - it inherited the page's, which
       is the theme's. Forced onto the other ground that would be dark text on
       a dark card for everything that does not name a variable. */
    color: var(--primary-text-color);
  }

  :host([data-appearance="dark"]) {
    color-scheme: dark;
    --ha-card-background: #1d1e21;
    --card-background-color: #1d1e21;
    --secondary-background-color: #282a2e;
    --primary-text-color: #e3e3e3;
    --secondary-text-color: #9b9b9b;
    --ha-card-header-color: #e3e3e3;
    --divider-color: rgba(225, 225, 225, 0.12);
    --ha-card-border-color: rgba(225, 225, 225, 0.12);
    --el-error: var(--error-color, #f2645a);
    --el-warn1: #93abc4;
    --el-warn2: #ffb300;
    --el-soc-alpha: 0.6;
  }

  :host([data-appearance="light"]) {
    color-scheme: light;
    --ha-card-background: #ffffff;
    --card-background-color: #ffffff;
    --secondary-background-color: #f2f4f7;
    --primary-text-color: #212121;
    --secondary-text-color: #727272;
    --ha-card-header-color: #212121;
    --divider-color: rgba(0, 0, 0, 0.12);
    --ha-card-border-color: rgba(0, 0, 0, 0.12);
    --el-error: var(--error-color, #db4437);
    --el-warn1: #5a7896;
    --el-warn2: #b26a00;
    --el-soc-alpha: 0.22;
  }

  /* Only rendered while the grid is gone, so it costs no height otherwise. */
  .outage-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    /* The header has no bottom padding and the body only 4 px of top padding,
       so without a top margin the strip touches the mode chips. */
    margin: 10px 16px 6px;
    padding: 6px 10px;
    border-radius: 9px;
    background: var(--el-error);
    /* HA's on-primary colour: white in both schemes, and it stays readable on
       the lightened dark-mode red, which white on its own would not. */
    color: var(--text-primary-color, #fff);
    font-size: 13px;
    font-weight: 600;
  }

  /* Same strip as the outage one, in neutral colours: a note, not an alarm. */
  .example-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 16px 6px;
    padding: 6px 10px;
    border-radius: 9px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    color: var(--primary-text-color);
    font-size: 13px;
  }

  .example-banner ha-icon,
  .outage-banner ha-icon {
    --mdc-icon-size: 18px;
    display: flex;
  }

  ha-card {
    /* Labels sit outside the drawing, so nothing may be clipped. */
    overflow: visible;
  }

  /* Overlay for the fan: spans the whole card body so it can reach from the
     house node into the list. Never takes clicks - the rows underneath do. */
  svg.fan {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .fan-line {
    /* 2 px at full node size, like the connections (K-12, sizing.ts). */
    stroke-width: calc(2px * var(--el-line-k, 1));
    /* --el-fade: a row still fading in brings its line along. */
    opacity: calc(0.45 * var(--el-fade, 1));
    fill: none;
  }

  /* A row with nothing flowing keeps its line in the neutral shade of the
     inactive connections; "dim" fades it further (L-13, P-9). */
  .fan-line.inactive-show,
  .fan-line.inactive-dim {
    stroke: var(--el-line);
  }

  .fan-line.inactive-dim {
    opacity: calc(0.2 * var(--el-fade, 1));
  }

  /* Title left, mode chips right. Below about 400 px the chips drop onto their
     own line rather than squeezing the title (REQ V-2). */
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 12px;
    padding: 12px 16px 0;
  }

  .title {
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -0.012em;
    color: var(--ha-card-header-color, var(--primary-text-color));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Mode chips and the list filter share one row at the right of the header. */
  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
  }

  /* A round chip: same height and border as the mode chip beside it. */
  .filter-toggle {
    font: inherit;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    background: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 18px;
  }

  .filter-toggle.on {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .filter-toggle:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* One chip for the view mode (REQ V-2, issue #20). All labels share one
     grid cell, so the chip keeps the width of the longest one. */
  .mode-chip {
    font: inherit;
    font-size: 12px;
    line-height: 1;
    /* 36 px so the chip stays reachable on a phone (REQ I-3). */
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    /* Blue in every mode, "Jetzt" included (Markus, 19.10.2026): the chip
       always shows a chosen view, the label says which. */
    border: 1px solid var(--primary-color);
    background: none;
    color: var(--primary-color);
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    display: inline-grid;
    align-items: center;
    justify-items: center;
  }

  .mode-label {
    grid-area: 1 / 1;
    visibility: hidden;
    white-space: nowrap;
  }

  .mode-label.active {
    visibility: visible;
  }

  /* Energy mode (REQ EM-5, EM-6, EM-11). An inside field keeps its room
     unseen, so switching to a period never moves anything. */
  .node.in-period .extra-inside {
    visibility: hidden;
  }

  /* Two figures and an arrow each take the width one figure had: a month's
     "↓ 228,8 kWh" touched the rim of a phone-sized node at full size. */
  .node .value.figure {
    display: flex;
    align-items: center;
    gap: 0.2em;
    font-size: calc(var(--el-value-size) * 0.85);
    white-space: nowrap;
  }

  .node .value.figure .arrow {
    width: 1.2em;
    height: 0.8em;
    flex: none;
    align-self: center;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .node .value.figure .arrow.vertical {
    width: 0.8em;
    height: 1.2em;
    /* Taller than the line: let it hang over rather than push the line apart. */
    margin-block: -0.2em;
  }

  .node .value.warn1,
  .row-value.warn1,
  .row.rest .row-value.warn1 {
    color: var(--el-warn1);
  }

  .node .value.warn2,
  .row-value.warn2,
  .row.rest .row-value.warn2 {
    color: var(--el-warn2);
  }

  /* Counted from a late start (REQ EM-9): amber, like a figure with gaps. */
  .energy-chip.late,
  .mode-note.late {
    border-color: var(--el-warn2);
    color: var(--el-warn2);
  }

  /* Averages have no meaning for a period's energy (EM-2). */
  /* Room for the quick button while the statistics are checked (QB-8). */
  .energy-chip.waiting {
    visibility: hidden;
  }
  .mode-chip[aria-disabled="true"] {
    border-color: var(--divider-color, rgba(127, 127, 127, 0.3));
    color: var(--disabled-text-color, var(--secondary-text-color));
    opacity: 0.6;
    cursor: default;
  }

  .mode-chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Shown when the selector is hidden but a mean is active (REQ V-3). */
  .mode-note {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }


  .body {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 20px;
    padding: 4px 16px 16px;
  }

  /* Beside the cross the battery label is the lowest thing on the card, and it
     hangs 15 px below the cross box - the 16 px of padding left one pixel of
     air, so the text sat on the card's edge. Stacked, the list is last and
     needs no extra room. */
  .body:not(.stacked) {
    padding-bottom: 26px;
  }

  /* Flex bases decide when the list wraps below the cross. Home Assistant caps
     a section column at roughly 500 px, leaving ~460 px of content - so the two
     bases plus the gap have to stay under that, or the list never sits beside
     the cross in a sections view (REQ L-1). */
  .body.stacked .cross {
    max-width: 400px;
  }

  /* Without a list the cross is the card. Left at its "beside the list" size
     it sat small and pushed against the left edge, which reads as a mistake -
     so it gets the same room and the same middle it has with the list below
     it (REQ L-1). */
  .body.no-list {
    justify-content: center;
  }
  .body.no-list .cross {
    max-width: 400px;
  }

  .cross {
    /* The cross comes first: it takes free width until its cap, only then does
       the list widen. Beside the list the cap is 320 px but never more than
       52 % of the card, so the list keeps enough of the other half for the fan
       lines to run a straight stretch (L-13). It never goes below 225 px - if
       that does not fit next to the list, the list wraps below, and the cross
       alone in its row may grow to the full 400 px again. */
    flex: 99 0 225px;
    min-width: 225px;
    max-width: min(320px, 52%);
    /* Room for the labels, which reach beyond the drawing, and for the large
       nodes, which overhang the viewBox by a few units. Above PV and below the
       battery it follows the configured label lines (REQ Z-8, cross.ts). */
    padding: var(--el-pad-top, 26px) 8px var(--el-pad-bottom, 28px);
  }

  /* Positioning context for the nodes: exactly the area the SVG covers. */
  .plot {
    position: relative;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Segments animate their length and position, so a consumer's slice grows or
     shrinks into place rather than snapping (REQ R-4). */
  /* The ring stands in for the border and is centred on it: its box reaches
     the 2 px border plus half the 11 px stroke beyond the padding edge, so the
     stroke's middle lies on the contour (K-14). Below the icon and figure
     (z-index), above the node's background. */
  .node .ring {
    position: absolute;
    left: -7.5px;
    top: -7.5px;
    /* Explicit size, not derived from the insets: an SVG is a replaced element,
       and WebKit gives an absolutely positioned one its intrinsic 300 x 150
       instead of stretching it between left and right - the ring then sat off
       to the lower right and too large on iOS while Chromium looked fine. */
    width: calc(100% + 15px);
    height: calc(100% + 15px);
    z-index: 0;
    pointer-events: none;
    overflow: visible;
  }

  .ring-seg {
    fill: none;
    /* stroke-width is set per render in viewBox units (ringGeometry). */
    stroke-linecap: butt;
    /* Not animated in CSS: RingAnimator moves the segments, all from one progress,
       so their gaps cannot drift apart (R-4). */
  }

  /* ring.animation: fade - a place takes on its new consumer's colour over the
     ring's glide (RING_GLIDE_MS), ease-out like the spring that moves it. Only
     the colour: geometry stays with RingAnimator. The class is only there while
     the card moves (P-7), so it may outrank the reduced-motion rule below -
     flow.animation: on means the ring moves under reduced motion too. */
  .ring.fade .ring-seg {
    transition: stroke 1.5s ease-out !important;
  }

  .link {
    fill: none;
    stroke: var(--el-line);
    /* 3 px at full node size, grown with the card and the configured
       line_width - --el-line-k comes from sizing.ts (K-12). */
    stroke-width: calc(3px * var(--el-line-k, 1) / var(--el-scale, 1));
    stroke-linecap: round;
  }

  /* Dimmed so the dots stand out - but not so far that the hue disappears.
     At 0.55 the colour washed out to grey on a dark background, where the line
     blends into the card instead of the page. */
  /* Connections without flow, per flow.inactive_lines (REQ P-9). "hide" never
     reaches the stylesheet - those paths are not rendered at all. */
  .link.inactive-dim {
    opacity: 0.25;
  }

  .link.active {
    /* A design may dim the line so its spur has something to stand out
       against; without one this is the 0.8 of P-5. */
    opacity: var(--el-link-opacity, 0.8);
  }

  /* No CSS radius here: dots.ts sets the r attribute from the measured scale.
     The CSS geometry property with calc() is unreliable in WebKit and would
     leave the dots tiny or invisible on iOS (REQ K-12). */

  /* One node: icon, value, label - a fixed-size box centred on its coordinate. */
  .node {
    position: absolute;
    transform: translate(-50%, -50%);
    width: var(--el-node-size);
    height: var(--el-node-size);
    border-radius: 50%;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 2px solid var(--el-line);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    /* Not for the eye: when card-mod or a theme changes the fill after the
       card has drawn, the end of this transition tells the card to measure
       whether the lines now show through (REQ K-16). On an outline that is
       never drawn, following the fill - a transition on the fill itself would
       let the measurement read the old colour while it runs. */
    outline: 0 none;
    outline-color: var(--ha-card-background, var(--card-background-color, #fff));
    transition: outline-color 1ms;
  }

  /* Fill level rises from the bottom with the state of charge (REQ K-5).
     The clip is what makes it read as a filled circle: without it the
     rectangle juts out past the rim and looks like a plinth. The node itself
     cannot clip, because the label sits outside it. */
  .node .fill-clip {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
  }

  .node .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: var(--el-soc-alpha, 0.22);
    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Two tap targets on the battery: charge above, power below. Rectangles that
     reach past the circle, because the visible shape is too small for 44 px on
     a phone (REQ I-2, I-3, ENT-5). */
  .hit {
    position: absolute;
    /* Above icon and figure, which sit at z-index 1 to clear the ring. Without
       this a tap in the middle of a node landed on the figure, not the button
       - the node "mostly" did not open its history. */
    z-index: 2;
    left: 50%;
    transform: translateX(-50%);
    width: max(44px, 100%);
    min-height: 44px;
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    cursor: pointer;
    border-radius: 8px;
  }

  .hit.upper {
    bottom: 50%;
    top: -22px;
  }

  .hit.lower {
    top: 50%;
    bottom: -22px;
  }

  .hit:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .node > ha-icon,
  .node > .value {
    position: relative;
    z-index: 1;
  }

  .node ha-icon {
    --mdc-icon-size: calc(var(--el-node-size) * 0.3);
    display: flex;
    color: var(--el-line);
  }

  .node .value {
    font-size: var(--el-value-size);
    font-weight: 500;
    line-height: 1.1;
    /* Numbers stay in the theme text colour - the state colours would not reach
       the required contrast as text (REQ C-5, ENT-18). */
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .node .value.unavailable {
    color: var(--secondary-text-color);
  }

  /* Grid outage: dashed contour, and figure plus label in the error colour.
     The exception to C-5 (figures stay in the text colour) is deliberate -
     here the colour is the message, not decoration (REQ NS-4). */
  .node.outage {
    border-style: dashed;
  }

  .node.outage .value,
  .node.outage .label {
    color: var(--el-error);
  }

  /* A big X over the symbol. Explicit width/height on the SVG, because WebKit
     gives an absolutely positioned one an intrinsic 300 × 150 otherwise - the
     same trap the consumer ring fell into. 116 % lets the arms overhang the
     glyph slightly while staying clear of the figure below. */
  .node .icon-cross {
    position: relative;
    display: flex;
    z-index: 1;
  }

  .node .icon-cross svg {
    position: absolute;
    left: -8%;
    top: -8%;
    width: 116%;
    height: 116%;
    overflow: visible;
    fill: none;
    stroke: var(--el-error);
    stroke-width: 2.6;
    stroke-linecap: round;
  }

  /* Label sits outside the circle: above for solar, below for the others. */
  /* Two lines instead of one long one, and never wider than about one and a
     half circles - otherwise the text reaches into the neighbouring node. */
  .label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: var(--el-label-size);
    line-height: 1.25;
    /* Primary text, like the figures - grey labels looked like a second font
       next to the state word. */
    color: var(--primary-text-color);
    text-align: center;
    /* Wide enough for the longest state word ("Einspeisung"). Words are never
       broken apart - a hyphen-less split reads as gibberish. Long consumer
       names are cut with an ellipsis instead. */
    max-width: min(150px, calc(var(--el-node-size) * 2));
    overflow-wrap: normal;
  }

  .label-state {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-name {
    white-space: nowrap;
  }

  /* 10 px clears the house ring, which reaches 5.5 px beyond the contour; the
     same distance everywhere keeps the labels of one row aligned. */
  .node.solar .label {
    bottom: calc(100% + 10px);
  }

  .node:not(.solar) .label {
    top: calc(100% + 10px);
  }

  .label .derived {
    opacity: 0.7;
  }

  /* Extra values (REQ Z-2, Z-3). Colour, size and weight come inline per field;
     figures line up like the node values. */
  .extra {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .node > .extra-inside {
    position: relative;
    z-index: 1;
    line-height: 1.1;
  }

  /* The prefix gives way first, the value only when it is too long on its own -
     a timestamp or a text sensor can be any length (REQ Z-3). A target of its
     own, at least 24 px either way (REQ Z-7, I-3). */
  .extra-label {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    margin: 0;
    border: 0;
    background: none;
    font-family: inherit;
    line-height: 1.25;
    cursor: pointer;
    border-radius: 6px;
  }

  .extra-label:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 1px;
  }

  /* Under grid and house a label must not run into the battery circle, past the
     card's edge or into the fan lines beside the house (REQ Z-3, Z-8). The room
     on either side of the node's centre: s px per viewBox unit, the nodes 58
     units from the plot's edge and 142 from the battery's centre. A label
     wider than the narrower side leans towards the wider one instead of being
     cut - centred while it fits, never past either limit. */
  .node.grid .label {
    --el-room-l: calc(58px * var(--el-scale, 1) + 16px);
    --el-room-r: calc(142px * var(--el-scale, 1) - var(--el-node-size) / 2 - 8px);
  }

  .node.house .label {
    --el-room-l: calc(142px * var(--el-scale, 1) - var(--el-node-size) / 2 - 8px);
    --el-room-r: calc(58px * var(--el-scale, 1) + 8px);
  }

  /* Without a battery there is no circle below the middle: the two labels may
     reach to the middle between grid and house, with 8 px between them. */
  .cross.no-battery .node.grid .label {
    --el-room-r: calc(142px * var(--el-scale, 1) - 4px);
  }

  .cross.no-battery .node.house .label {
    --el-room-l: calc(142px * var(--el-scale, 1) - 4px);
  }

  .node.grid .label,
  .node.house .label {
    max-width: min(150px, calc(var(--el-node-size) * 2), calc(var(--el-room-l) + var(--el-room-r)));
    transform: translateX(
      min(max(-50%, calc(-1 * var(--el-room-l))), calc(var(--el-room-r) - 100%))
    );
  }

  .extra-prefix {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-inline-end: 0.3em;
  }

  /* The prefix shrinks to nothing, its gap does not: leave the value room for it. */
  .extra-prefix + .extra-value {
    max-width: calc(100% - 0.3em);
  }

  .extra-value {
    flex: 0 0 auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Beside the house node on a wide card, underneath it on a narrow one.
     The flex basis is the switch: below roughly 500 px of content the list
     wraps to its own line (REQ L-1). */
  .list {
    flex: 1 1 150px;
    min-width: 145px;
    align-self: center;
    /*
     * The mark grows with the room a row has (REQ L-9, L-15). A short list
     * spaces its rows 40 px apart and an 18 px icon looked lost in that; a
     * long one is down to 28 px and has none to spare. Tied to the pitch it
     * follows by itself, and the bounds keep both ends honest: never smaller
     * than the 18 px it always was - a long list must not get worse - and
     * never so large that it outgrows the row it sits in. At 40 px pitch this
     * gives 24 px, at 34 px about 20 px, at 28 px the old 18 px.
     */
    --el-swatch: clamp(18px, calc(var(--el-row-h, 34px) * 0.6), 26px);
  }

  /* Level with the house when the room above and below the cross differs (REQ L-1, Z-8). */
  .body:not(.stacked) .list {
    margin-top: var(--el-list-mt, 0px);
    margin-bottom: var(--el-list-mb, 0px);
  }


  /* Beside the cross the rows are only as wide as the longest name and the
     widest figure need, and sit at the list's right edge - everything between
     the house and the rows is line, which is what makes the movement readable
     (L-13). The list itself takes what the cross leaves over (grow 1 against
     99), so on a narrow card the cross keeps its size and the names get the
     ellipsis. Wrapped below the cross the list keeps its flex basis, so a wider
     card can bring it back up. */
  .list:not(.stacked) {
    flex: 1 1 145px;
    max-width: 55%;
  }

  .list:not(.stacked) .rows {
    width: max-content;
    max-width: 100%;
    margin-left: auto;
  }

  .list-title {
    margin: 0 0 2px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  /* No rules between rows: the swatches group the list well enough and
     separators only add height. Rows are 34 px, but the tap target below
     stretches past them to keep 44 px of reachable height (REQ I-3, L-9). */
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    /* Set per list from the row count, see rowHeight() in render/list.ts. */
    min-height: var(--el-row-h, 34px);
    font-size: var(--el-list-size);
    font-variant-numeric: tabular-nums;
  }

  /* One slot of the same width whether it holds the dot or an icon, so lanes
     and names line up across rows that differ (seen on the reference
     dashboard). */
  .row .swatch {
    flex: none;
    width: var(--el-swatch);
    height: var(--el-swatch);
    display: flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: var(--el-swatch);
  }

  /* The plain colour mark of a row without an icon. A share of the slot, so it
     keeps its proportion to the icons it stands among. */
  .row .swatch.dot::after {
    content: "";
    width: calc(var(--el-swatch) * 0.56);
    height: calc(var(--el-swatch) * 0.56);
    border-radius: 50%;
    background: currentColor;
  }

  /* A state of charge on the row (REQ L-15): a thin ring around the mark.
     Track faint, fill in the row colour; a value that is only the last known
     one turns both grey. */
  .row.charge .swatch {
    position: relative;
  }

  /* The icon keeps the size of every other row's icon; the ring is added
     around it, beyond the slot, so it keeps clear of the icon (Markus,
     04.10.2026). The row's height is not touched. */
  .charge-ring {
    position: absolute;
    inset: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    overflow: visible;
    pointer-events: none;
  }

  .charge-ring circle {
    fill: none;
    stroke: currentColor;
    stroke-width: 1;
  }

  .charge-ring .track {
    opacity: 0.22;
  }

  .charge-ring .fill {
    stroke-linecap: round;
  }

  .row.stale .charge-ring,
  .row.stale .row-value.soc {
    color: var(--secondary-text-color);
  }

  .row.stale .row-value.soc {
    font-weight: 400;
  }

  /* The mark and a charge in the value column open the charge's history,
     the rest of the row the power's (REQ L-15). Above the row target, as tall
     as it is, and at least 36 px wide so a thumb finds the mark. */
  .row .row-value {
    position: relative;
  }

  .soc-hit {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: var(--el-row-h, 34px);
    min-width: 36px;
    width: calc(100% + 8px);
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  .soc-hit:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
    border-radius: 4px;
  }

  /* The runway the fan lines cross in the stacked layout. It draws nothing:
     the lines and their dots live on the overlay, so they can converge on one
     point instead of running as a parallel bar per row (REQ L-13). Its only
     job is to hold the column open - wide enough for the bundle to spread. */
  .lane {
    flex: none;
    /* Fallback for browsers without subgrid; with subgrid the column takes
       whatever the mark, name and value leave over. */
    width: clamp(56px, 20%, 120px);
    height: 3px;
  }

  .row .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
  }

  /* Stacked below the cross the list has the whole card width. The rows become
     a grid with shared columns: runway | mark | name | value. The mark sits
     directly in front of the name so the two read as one label, and the runway
     takes everything that is left - on a phone three times what a fixed width
     would give it. Browsers without subgrid keep the flex rows. */
  @supports (grid-template-columns: subgrid) {
    .list.stacked .rows {
      display: grid;
      /* The longest name decides: its column is as wide as it needs, the value
         column as wide as the widest figure, and the lane takes the rest. */
      grid-template-columns:
        minmax(56px, 1fr)
        var(--el-swatch)
        minmax(0, max-content)
        max-content;
      column-gap: 6px;
    }

    .list.stacked .row {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: center;
    }

    .list.stacked .lane {
      width: auto;
    }
  }

  /* Stacked, the lines gather left of the block; the icon marks that point as
     the house they come from. Absolute, so it stays out of the row grid, and
     only in this layout - beside the cross the house node itself is the
     starting point. */
  .list.stacked .rows {
    position: relative;
  }

  .list.stacked {
    /* The house at the gathering point is the same house as in the cross, so
       it carries the same icon size (K-14). It was a fixed 22 px, which held
       on a phone and shrank against the node as the card grew - on a wide card
       the two were visibly different houses. The 6 px is the gap the lines
       need between the icon and where they start. */
    --el-origin-size: calc(var(--el-node-size) * 0.3);
    padding-left: calc(var(--el-origin-size) + 6px);
    /* The node labels hang below the cross box - a two-line one ("Batterie /
       lädt") reached into the first row. Measured overhang was 14 px, so the
       8 px row gap of .body is not enough on its own. */
    margin-top: 12px;
  }

  .origin-icon {
    position: absolute;
    left: calc((var(--el-origin-size, 22px) + 6px) * -1);
    top: 50%;
    transform: translateY(-50%);
    --mdc-icon-size: var(--el-origin-size, 22px);
    display: flex;
    pointer-events: none;
  }

  /* Beside the cross there is no runway - the fan comes from the house node. */
  .list:not(.stacked) .lane {
    display: none;
  }

  /* "List always below" (REQ L-14): the wrap is forced instead of left to the
     width. The switch deliberately does not set the stacked flag - that flag
     is measured (_checkStacked in enerlens-card.ts), and a second source for
     it would drift apart from the flex bases above, exactly what the
     measurement exists to avoid. Giving the list a whole line is enough: the
     measurement then sees the wrapped layout, and everything that hangs off
     it - the .stacked class, the row grid, the fan lines - follows by itself.
     Needs the basis in both states, so the list does not climb back up once
     .stacked drops the rule above. */
  .body.force-below .list {
    flex-basis: 100%;
    max-width: none;
  }

  .row .row-value {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* The rest entry is a computed figure, not a measurement - kept quieter. */
  .row.rest .name,
  .row.rest .row-value {
    color: var(--secondary-text-color);
  }

  /* Covers the row and reaches 5 px beyond it top and bottom, so a 34 px row
     still offers a 44 px target. Neighbouring targets touch rather than
     overlap, so a tap never hits the wrong row. */
  .row-hit {
    position: absolute;
    inset: -5px 0;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  .row-hit:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
    /* 1 ms is no motion; without it a fill made see-through late would show
       the lines in the circles until the next beat (REQ K-16). */
    .node {
      transition: outline-color 1ms !important;
    }
  }
`,jn="view-mode",qn="show-all",Vn="energy-period",Zn=3e5;function Gn(e,t){try{localStorage.setItem(e,t)}catch{}}function Qn(e){try{return localStorage.getItem(e)}catch{return null}}function Jn(e){const t=Number.parseFloat(getComputedStyle(e).opacity);return Number.isNaN(t)?1:t}function Yn(e,t){if(!e||!t)return e===t;const i=(e,t)=>e.length===t.length&&e.every((e,i)=>e===t[i]);return e.entity===t.entity&&i(e.outage,t.outage)&&i(e.ok,t.ok)}const Xn=Object.fromEntries(Object.keys(Gt).map(e=>[Gt[e],{entity_id:Gt[e],state:String(Qt[e]),attributes:{unit_of_measurement:"W",device_class:"power"},last_changed:"",last_updated:""}])),es=new Set,ts=e=>"object"==typeof e&&null!==e,is=e=>!0===e.preview;function os(e){const t=[];let i=e;for(;i;)t.unshift(i),i=i.parentNode??(i instanceof ShadowRoot?i.host:null);return t}function ns(e,t){const i=os(e),o=os(t);let n=0;for(;n<i.length&&n<o.length&&i[n]===o[n];)n++;return n>=i.length||n>=o.length?i.length-o.length:i[n]instanceof ShadowRoot?-1:o[n]instanceof ShadowRoot?1:i[n].compareDocumentPosition(o[n])&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}class ss extends ce{constructor(){super(...arguments),this._entityIds=[],this._chargeIds=[],this._extraIds=[],this._charge=new be,this._chargeOf=e=>this._charge.state(this._hass,e),this._rows=new Bn,this._lastEntries=new Map,this._mode="current",this._designsPickedUp=!1,this._ring=new qo,this._technique="static",this._visible=!0,this._stacked=!1,this._settled=!1,this._showAll=!1,this._scale=1,this._plotScale=1,this._holeR=ko,this._seeThrough=!1,this._outagePrefilled=!1,this._energyPeriod=null,this._energyChosen=!1,this._energyViews=new Map,this._energyKey="",this._energyAsked=new Map,this._statsKey="",this._statsRemembered=!1,this._statsRetryAt=0,this._rememberPending=!1,this._onVisibility=()=>{this._syncPlayState(),"hidden"===document.visibilityState?this._pause(Date.now()):this._resume()},this._onMotionChange=()=>this.requestUpdate(),this._onTransitionEnd=e=>{const{propertyName:t,target:i}=e;if("outline-color"!==t||!(i instanceof HTMLElement))return;const o=i.classList.contains("node")?i.closest(".plot"):null;o&&this._measureHoles(o)},this._pathZoom=1,this._onWindowResize=()=>this._measurePathZoom(),this._example=!1,this._onMoreInfo=e=>{this._example&&e.stopPropagation()}}get _period(){if(!this._energyPeriod||this._example)return null;const e=!1!==this._config?.view.power;return this.preview&&!this._energyChosen&&e?null:this._energyPeriod}_energyOffer(e){const t=e.view,i=t.energyDefault&&!0!==this._statsOk?[]:t.energyPeriods;return[...t.power?[null]:[],...i]}_statsWaiting(e){return e.view.energyDefault&&void 0===this._statsOk&&!this._example}_startEnergy(e,t){const i=this._energyOffer(e),o="power"===e.view.defaultEnergy?null:e.view.defaultEnergy;let n=i.includes(o)?o:i[0]??null;if(t&&e.view.remember&&i.length>1){const e=Qn(this._memKey(Vn)),t=i.find(t=>(t??"kw")===e);void 0!==t&&(n=t)}this._energyPeriod=n}_applyRemembered(){const e=this._config;if(e?.view.remember){if(e.view.modes.length>1){const t=e.view.modes.find(e=>e===Qn(this._memKey(jn)));t&&(this._mode=t)}if(e.list.scope.length>1){const t=Qn(this._memKey(qn));"1"===t&&(this._showAll=e.list.scope.includes("full")),"0"===t&&(this._showAll=!e.list.scope.includes("filtered"))}this._startEnergy(e,!0),this._hass&&(this._tickModel=this._modelForMode(this._hass,e))}}_memKey(e){const t=this._config?.memoryId;if(!t)return`enerlens-${e}`;const i=location.pathname.replace(/^\/+|\/+$/g,"");let o=0;return is(this)||(o=this._rankInDashboard(t)??this._rankOnPage(t)),`enerlens:${i}:${t}${o>0?`#${o+1}`:""}:${e}`}_rankInDashboard(e){let t,i;for(const e of os(this).reverse()){const o=e;void 0===t&&"hui-card"===o.localName&&o.config&&(t=o.config),!i&&ts(o.lovelace?.config)&&(i=o.lovelace.config)}if(void 0!==t&&i&&Array.isArray(i.views))for(const o of i.views){const i=Ut(o),n=i.indexOf(t);if(-1!==n)return i.slice(0,n).filter(t=>jt(t.memory_id)===e).length}}_rankOnPage(e){const t=[...es].filter(t=>t.isConnected&&!is(t)&&t._config?.memoryId===e).sort(ns);return Math.max(0,t.indexOf(this))}_checkStatistics(){const e=this._config,t=this._realHass;if(!e?.view.energyDefault||!t||this._example)return;const i=Wi(e).join(","),o=this._statsRetryAt>0&&Date.now()>=this._statsRetryAt;(i!==this._statsKey||o)&&(this._statsKey=i,this._statsRetryAt=0,o||(this._statsOk=void 0),function(e,t){const i=Wi(t),o=i.join(","),n=Pi.get(o);if(n)return n;const s=(async()=>{if(0===i.length||"function"!=typeof e.callWS)return!1;const t=await e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:i});if(!Array.isArray(t))return!1;const o=new Set(t.filter(e=>"object"==typeof e&&null!==e).filter(e=>(1===e.mean_type||!0===e.has_mean)&&"power"===e.unit_class).map(e=>e.statistic_id));return i.every(e=>o.has(e))})().catch(e=>{Pi.delete(o),console.warn(e)});return Pi.set(o,s),s}(t,e).then(e=>{this._statsKey===i&&(void 0===e&&(this._statsRetryAt=Date.now()+3e4),this._statsOk=e??!1,!1===e&&console.warn(Te("energy.no_statistics",t)),e&&this._config&&(this._startEnergy(this._config,!this._statsRemembered),this._statsRemembered=!0),this.requestUpdate())}))}_shownConfig(){const e=this._config,t=this._period;return t?function(e,t){const i=t?.hours??1,o=1/i;return{...e,power:{...e.power,energyHours:i},minConsumerW:e.minConsumerW*o,consumers:e.consumers.map(e=>void 0===e.minW?e:{...e,minW:e.minW*o}),energy:t?.marks??{roles:{},consumers:{},rest:{tier:0,note:""}}}}(e,this._energyViews.get(t)):e}_flowsOf(e){const t=this._period;return t?this._energyViews.get(t)?.flowsW??{}:function(e){return Xt(e.solar.available?e.solar.w:0,e.grid.available?e.grid.positive:0,e.grid.available?e.grid.negative:0,e.battery?.available?e.battery.positive:0,e.battery?.available?e.battery.negative:0,e.house.available?e.house.w:0)}(e)}_cycleEnergy(){const e=this._hass;if(!this._config)return;const t=this._energyOffer(this._config),i=void 0!==this._energyPending?this._energyPending:this._period,o=t[(t.indexOf(i)+1)%t.length];if(null===o||void 0!==e&&this._fresh(o,e,Date.now()))return this._energyPending=void 0,void this._showEnergy(o);this._energyPending=o,this.requestUpdate(),this._ensureEnergy(o,!0)}_showEnergy(e){this._energyPeriod=e,this._energyChosen=!0;const t=this.preview;this._config?.view.remember&&!t&&Gn(this._memKey(Vn),e??"kw"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}_fresh(e,t,i){const o=this._energyViews.get(e);return void 0!==o&&o.start===Ti(e,yi(e,i,Ri(t),Oi(t)))}_ensureEnergy(e,t=!1){const i=e??this._period,o=this._hass,n=this._config;if(!i||!o||!n)return;const s=Date.now(),r=Ti(i,yi(i,s,Ri(o),Oi(o))),a=this._energyAsked.get(i);if(a?.open)return;if(!t&&a&&a.start===r&&s-a.at<Zn)return;const l={at:s,start:r,open:!0};this._energyAsked.set(i,l);const c=this._energyKey;Bi(o,n,i,s).then(e=>{if(l.open=!1,c===this._energyKey){if(this._energyViews.set(i,e),this._energyPending===i)return this._energyPending=void 0,void this._showEnergy(i);this._hass&&this._config&&this._period===i&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}}).catch(e=>{console.warn(e),l.open=!1,c===this._energyKey&&(this._energyAsked.get(i)===l&&(l.at=s-Zn+3e4),this._energyPending===i&&(this._energyPending=void 0,this.requestUpdate()))})}_energyChip(e,t){if(this._example)return;const i=this._statsWaiting(t),o=i?[...t.view.power?[null]:[],...t.view.energyPeriods]:this._energyOffer(t),n=void 0!==this._energyPending?this._energyPending:this._period;if(o.length<2&&null===n&&!i)return;const s=n?this._energyViews.get(n):void 0,r=o[(o.indexOf(n)+1)%o.length],a=t.power.unit,l=Ui(n,s,e,a),c=null!==n&&!0===s?.lateStart;return{labels:o.map(t=>Ui(t,void 0,e,a)),active:l,ariaLabel:Te("energy.chip",e,{mode:l,next:Ui(r,void 0,e,a)}),inPeriod:null!==n,late:c,waiting:i,title:c&&s?Te("energy.late",e,{date:Ki(s.from,e,!0)}):"",onCycle:()=>this._cycleEnergy()}}get _nodePx(){return Math.max(70,112*this._scale+11)}_toggleShowAll(){this._showAll=!this._showAll,this._config?.view.remember&&!is(this)&&Gn(this._memKey(qn),this._showAll?"1":"0"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config))}_pause(e){this._pausedAt??=e}_resume(){const e=this._pausedAt;if(void 0===e||!this.isConnected||"hidden"===document.visibilityState)return;if(!1===this._realHass?.connected)return;this._pausedAt=void 0;const t=Date.now();this._lastTick=t,!this._config||t-e<=1e3*this._config.updateIntervalS||(this._buffer?.markGap(e,t),this._historyFor=void 0,this._hass&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}set hass(e){this._realHass=e,!1===e.connected?this._pause(Date.now()):this._resume();const t=this._example,i=this._withExample(e),o=this._hass;this._hass=i,this._config&&(this._checkStatistics(),o&&t===this._example&&!this._shownChanged(o,i)||(this._config.gridStatus&&(this._outage=function(e,t,i){const o=e.states[t.entity]?.state;return Ie(i,o,t,Be(e,t.entity))}(i,this._config.gridStatus,this._outage)),this._observeCharge(i),this._model=oo(i,this._config,this._chargeOf),this._tickModel??=this._model,this._example||this._recordSamples(i),this.requestUpdate("hass",o)))}_withExample(e){const t=[...this._entityIds,...this._extraIds,...this._chargeIds],i=Object.values(Gt);return this._example=this._entityIds.length>0&&t.every(e=>i.includes(e))&&!t.some(t=>e?.states?.[t]||e?.entities?.[t]),this._example?{...e,states:{...e.states,...Xn}}:e}get hass(){return this._hass}_shownChanged(e,t){const i=[...this._entityIds,...this._chargeIds,...this._extraIds];return!!i.some(i=>e.states[i]!==t.states[i])||(e.language!==t.language||e.locale!==t.locale||e.formatEntityState!==t.formatEntityState||e.themes!==t.themes||e.connected!==t.connected||e.entities!==t.entities&&i.some(i=>e.entities?.[i]?.display_precision!==t.entities?.[i]?.display_precision))}_observeCharge(e){this._config&&0!==this._chargeIds.length&&this._charge.observe(e,this._config.consumers)}_ensureLookups(){const e=this._hass;if(!e||!this._config)return;if(this._example||this.preview)return;if(this._config.gridStatus&&!this._outagePrefilled&&(this._outagePrefilled=!0,this._prefillOutage()),0===this._chargeIds.length)return;const t=this._charge.missing(e,this._config.consumers);0!==t.length&&this._charge.prefill(e,t).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=oo(this._hass,this._config,this._chargeOf),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()})}setConfig(e){const t=this._config;this._config=Ht(e,this._hass),this._rawConfig=e,this._entityIds=function(e){const t=[],i=e=>{e&&!t.includes(e)&&t.push(e)};for(const t of[e.sources.solar,e.sources.grid,e.sources.battery,e.sources.house])"single"===t.kind?i(t.entity):"split"===t.kind&&(i(t.positive),i(t.negative));i(e.sources.batterySoc),i(e.gridStatus?.entity);for(const t of e.consumers)i(t.entity);return t}(this._config),this._chargeIds=function(e){const t=[];for(const i of e.consumers){const e=i.charge;if(e)for(const i of[e.soc,e.plugged])i&&!t.includes(i)&&t.push(i)}return t}(this._config),this._extraIds=function(e){const t=[];for(const i of Wt){if("battery"===i&&"absent"===e.sources.battery.kind)continue;const{inside:o,label:n}=e.nodes[i];for(const e of[o?.entity,n?.entity])e&&!t.includes(e)&&t.push(e)}return t}(this._config),this._realHass&&(this._hass=this._withExample(this._realHass));const i=this._config.view;t&&t.view.avgLongMinutes===i.avgLongMinutes||(this._buffer=new me(6e4*i.avgLongMinutes)),t||(this._rememberPending=!0),t&&t.view.defaultMode===i.defaultMode&&i.modes.includes(this._mode)||(this._mode=i.defaultMode);const o=this._config.list,n=this._showAll?"full":"filtered";t&&t.list.defaultScope===o.defaultScope&&o.scope.includes(n)||(this._showAll="full"===o.defaultScope);const s=function(e){const{roles:t,inverted:i}=zi(e);return JSON.stringify([t,[...i],e.consumers.map(e=>e.entity),e.flow.minW])}(this._config);s!==this._energyKey&&(this._energyKey=s,this._energyViews.clear(),this._energyAsked.clear(),this._energyPending=void 0),Wi(this._config).join(",")===this._statsKey&&i.energyDefault||(this._statsKey="",this._statsOk=void 0,this._statsRetryAt=0);const r=this._energyOffer(this._config);t&&t.view.defaultEnergy===i.defaultEnergy&&r.includes(this._energyPeriod)||this._startEnergy(this._config,!1),void 0===this._energyPending||r.includes(this._energyPending)||(this._energyPending=void 0),this._checkStatistics(),this.requestUpdate(),t&&Yn(t.gridStatus,this._config.gridStatus)||(this._outage=void 0,this._outagePrefilled=!1),this._hass&&(this._observeCharge(this._hass),this._model=oo(this._hass,this._config,this._chargeOf),this._tickModel=this._model),t&&t.updateIntervalS===this._config.updateIntervalS||this._restartTick()}connectedCallback(){super.connectedCallback(),es.add(this),this._resizeObserver=new ResizeObserver(()=>{this._measure(),this._measurePathZoom()}),this._resizeObserver.observe(this),window.addEventListener("resize",this._onWindowResize),this._technique=function(){const e="undefined"!=typeof CSS&&CSS.supports?.("offset-path",'path("M 0 0 L 1 1")'),t="undefined"!=typeof Element&&"animate"in Element.prototype;return e&&t?"waapi":"static"}(),this._intersectionObserver=new IntersectionObserver(e=>{this._visible=e.some(e=>e.isIntersecting),this._syncPlayState()}),this._intersectionObserver.observe(this),this._pickUpLiveDesigns(),document.addEventListener("visibilitychange",this._onVisibility),this.renderRoot.addEventListener("transitionend",this._onTransitionEnd),this._resume(),this._motionQuery=window.matchMedia?.("(prefers-reduced-motion: reduce)"),this._motionQuery?.addEventListener?.("change",this._onMotionChange),this._restartTick()}_restartTick(){this._tickTimer&&clearInterval(this._tickTimer);const e=this._config?.updateIntervalS??5;this._lastTick=Date.now(),this._tickTimer=setInterval(()=>{const t=Date.now(),i=this._lastTick??t;this._lastTick=t,t-i>2*e*1e3&&(this._pause(i),this._resume()),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this._updateSince(),this.requestUpdate())},1e3*e)}get _dotsMove(){return this._animationsWanted&&"waapi"===this._technique}get _animationsWanted(){const e=this._config?.flow.animation??"auto";return"off"!==e&&("on"===e||!this._motionQuery?.matches)}_recordSamples(e){if(!this._config||!this._buffer)return;const t=Date.now();for(const i of this._entityIds){const o=e.states[i];o&&this._buffer.push(i,Date.parse(o.last_changed)||t,Qi(e,i))}this._buffer.prune(t)}_modelForMode(e,t){const i=this._period;if(i){const o=this._energyViews.get(i);return no(e,t,e=>o?.meanW(e)??null,this._chargeOf)}if("current"===this._mode||!this._buffer||this._example)return oo(e,t,this._chargeOf);const o=6e4*("avg_short"===this._mode?t.view.avgShortMinutes:t.view.avgLongMinutes),n=Date.now(),s=this._buffer;return no(e,t,e=>s.mean(e,o,n),this._chargeOf)}_ensureHistory(e=!1){const t=this._buffer;t&&"current"!==this._mode&&this._hass&&this._config&&(e||this._historyFor!==t)&&(this._example||this.preview||(this._historyFor=t,this._prefill(t)))}async _prefill(e){const t=this._hass,i=this._config;if(!t||!i)return;const o=Date.now();try{const n=await async function(e,t,i,o=5e3){const n={};if(0===t.length)return n;const s=Date.now(),r=s-6e4*i,a=e.callWS({type:"history/history_during_period",start_time:new Date(r).toISOString(),end_time:new Date(s).toISOString(),entity_ids:t,minimal_response:!0,no_attributes:!0});let l;const c=new Promise((e,n)=>{l=setTimeout(()=>{n(new Error(`EnerLens: history/history_during_period did not answer within ${o} ms (${t.length} entities, ${i} min) - falling back to live buffering`))},o)});let d;try{d=await Promise.race([a,c])}finally{void 0!==l&&clearTimeout(l)}if(null===d||"object"!=typeof d)return n;const h=d;for(const e of t){const t=h[e];if(!Array.isArray(t))continue;const i=[];for(const e of t){const t=ge(e);null!==t&&i.push(t)}i.sort((e,t)=>e.t-t.t),n[e]=i}return n}(t,this._entityIds,i.view.avgLongMinutes);if(e!==this._buffer)return;for(const[i,o]of Object.entries(n)){const n=t.states[i]?.attributes.unit_of_measurement;for(const t of o)e.push(i,t.t,this._toWatts(t.v,n))}e.healGaps(o,Object.entries(n).filter(([,e])=>e.length>0).map(([e])=>e)),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this._updateSince()}catch{this._updateSince()}finally{this.requestUpdate()}}async _prefillOutage(){const e=this._config?.gridStatus;if(this._hass&&e)try{const t=await async function(e,t,i=10,o=5e3){const n=Date.now(),s=e.callWS({type:"history/history_during_period",start_time:new Date(n-864e5*i).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0});let r;const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error(`EnerLens: grid status history timed out after ${o} ms`)),o)});let l;try{l=await Promise.race([s,a])}finally{void 0!==r&&clearTimeout(r)}if(null===l||"object"!=typeof l)return;const c=l[t];if(!Array.isArray(c))return;const d=e=>{const t=e.lu;return"number"==typeof t?t:0};for(const e of[...c].sort((e,t)=>d(t)-d(e))){const t=e.s;if("string"==typeof t&&!Oe.has(Re(t)))return t}}(this._hass,e.entity);void 0===this._outage&&Yn(this._config?.gridStatus,e)&&(this._outage=Ie(void 0,t,e,Be(this._hass,e.entity)))}catch{}finally{this.requestUpdate()}}_toWatts(e,t){if(null===e)return null;return e*("kW"===t?1e3:"MW"===t?1e6:"mW"===t?.001:1)}_updateSince(){if(!this._buffer||"current"===this._mode)return void(this._since=void 0);const e=this._buffer.status(Date.now());this._since=e.complete||!e.since?void 0:new Date(e.since).toLocaleTimeString(this._hass?.locale.language??"de",{hour:"2-digit",minute:"2-digit"})}_setMode(e){e!==this._mode&&(this._mode=e,this._config?.view.remember&&!is(this)&&Gn(this._memKey(jn),e),this._ensureHistory(!0),this._updateSince(),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}_measure(){const e=this.renderRoot?.querySelector(".plot"),t=e?.getBoundingClientRect().width??0;if(t>0){const i=t/bo;this._plotScale=i,this.style.setProperty("--el-scale",String(i)),this._dots?.setScale(i),Math.abs(i-this._scale)>.005&&(this._scale=i),this._measureHoles(e)}return this._checkStacked()}_measureHoles(e){const t=e.querySelector(".node");if(!t)return;const i=getComputedStyle(t),o=function(e){const t=e.trim().toLowerCase();if("transparent"===t)return!0;const i=t.match(/\/\s*([\d.]+)(%?)\s*\)$/),o=t.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%?)\s*\)$/),n=i??o;if(!n)return!1;const s=Number(n[1])/(n[2]?100:1);return Number.isFinite(s)&&s<1}(i.backgroundColor);if(o!==this._seeThrough&&(this._seeThrough=o),!o)return;const n=Number.parseFloat(getComputedStyle(e).width),s=(Number.parseFloat(i.width)/2-Number.parseFloat(i.borderTopWidth||"0"))*bo/n;s>0&&Number.isFinite(s)&&!(Math.abs(s-this._holeR)<.005)&&(this._holeR=s,e.querySelector("path.holes")?.setAttribute("d",Mo(s)))}_measurePathZoom(){if("waapi"!==this._technique||"undefined"==typeof navigator||!/^Apple/.test(navigator.vendor??""))return;const e=this.renderRoot?.querySelector(".plot svg"),t=e?function(e){const t=(e=0,t=0)=>{const i=document.createElementNS(En,"circle");return i.setAttribute("cx",String(e)),i.setAttribute("cy",String(t)),i.setAttribute("r","1"),i},i=document.createElementNS(En,"g");i.style.offsetPath='path("M400,400 L400,401")',i.style.offsetRotate="0deg",i.style.offsetDistance="0%",i.appendChild(t());const o=t(Cn,Cn),n=t(),s=t(200,200),r=document.createElementNS(En,"g");r.style.visibility="hidden",r.style.pointerEvents="none",r.append(i,o,n,s),e.appendChild(r);try{const e=e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2,w:t.width}},t=e(n),r=e(o),a=e(i);if(!(r.w>0))return;const l=r.x-t.x,c=r.y-t.y,d=a.x-t.x,h=a.y-t.y,u=l*l+c*c;if(!(u>0))return;const m=e(s);if(Math.hypot(m.x-(t.x+r.x)/2,m.y-(t.y+r.y)/2)>.002*Math.sqrt(u))return;const p=(d*l+h*c)/u;if(!(p>.1&&p<10)||Math.abs(d*c-h*l)/u>.01*p)return;return Math.abs(p-1)<.002?1:p}finally{r.remove()}}(e):void 0;void 0===t||Math.abs(t-this._pathZoom)<.002||(this._pathZoom=t,this._dots?.setPathZoom(t),this._fan?.setPathZoom(t),this._drawFan())}_checkStacked(){const e=this.renderRoot?.querySelector(".cross"),t=this.renderRoot?.querySelector(".list");if(!e||!t)return!1;const i=t.offsetTop>=e.offsetTop+e.offsetHeight/2;return i!==this._stacked&&(this._stacked=i,this.requestUpdate(),!0)}_updateFan(){if(this._drawFan(),this._fanFollow&&cancelAnimationFrame(this._fanFollow),"function"!=typeof requestAnimationFrame)return;const e=performance.now(),t=()=>{this._drawFan(),this._fanFollow=performance.now()-e<650?requestAnimationFrame(t):void 0};this._fanFollow=requestAnimationFrame(t)}_drawFan(){const e=this.renderRoot?.querySelector("svg.fan");if(!e||!this._config)return;this._fan||(this._fan=new Dn(e),this._fan.setPathZoom(this._pathZoom)),this._fan.setDesign(ci(this._config.flow.design),An(this,this._config.appearance)),this._fan.setDotColor(this._config.flow.dotColor);const t=this.renderRoot.querySelector(".body"),i=this.renderRoot.querySelector(".node.house"),o=this.renderRoot.querySelector(".rows"),n=this.renderRoot.querySelectorAll(".row");if(!t||!i||!o||0===n.length)return void this._fan.destroy();const s=t.getBoundingClientRect(),r=this._stacked?o.getBoundingClientRect():i.getBoundingClientRect(),a=this._stacked?{x:r.left-s.left,y:r.top+r.height/2-s.top}:{x:r.right-s.left,y:r.top+r.height/2-s.top},l=this._lastEntries,c=[...n].map(e=>{const t=e.dataset.key,i=t?l.get(t):void 0;if(!i)return null;const o=ei(i.w,this._shownConfig()),n=!oi(i,this._shownConfig()),r=this._config?.flow.inactiveLines??"show";if(n&&"hide"===r)return null;const a=(this._stacked?e.querySelector(".swatch")??e:e).getBoundingClientRect(),c=e.getBoundingClientRect(),d=e.querySelector(".charge-ring");return{key:t,x:(d?Math.min(a.left,d.getBoundingClientRect().left):a.left)-s.left,y:c.top+c.height/2-s.top,color:i.color,count:this._dotsMove?o?.count??0:0,durationS:o?.durationS??1,inactive:n&&"hide"!==r?r:void 0,fade:Jn(e)}}).filter(e=>null!==e);let d;if(this._fan.setDotRadius(5),this._fan.setDotScale(Kn(this._plotScale,this._config.flow).dot),!this._stacked&&this._seeThrough){const e=Number.parseFloat(getComputedStyle(i).borderTopWidth)||0,t=r.width/(i.offsetWidth||r.width);d={x:a.x-r.width/2,y:a.y,r:r.width/2-e*t}}this._fan.update(c,a,{width:s.width,height:s.height},this._animationsWanted,d)}_pickUpLiveDesigns(){this._designsPickedUp||(this._designsPickedUp=!0,Promise.resolve().then(()=>this.requestUpdate()))}_warnUnknownDesign(e){const t=this._config?.flow.design;!e&&t&&"none"!==t&&this._warnedDesign!==t&&(this._warnedDesign=t,console.warn(`${Zt}: flow design "${t}" is not in this build - drawing plain dots.`))}_syncPlayState(){const e="undefined"!=typeof document&&document.hidden;this._visible&&!e?(this._dots?.resume(),this._fan?.resume()):(this._dots?.pause(),this._fan?.pause(),this._ring.stop())}willUpdate(){this._rememberPending&&this.isConnected&&(this._rememberPending=!1,this._applyRemembered()),this._rows.capture(this.renderRoot?.querySelector(".body")??null)}updated(){this._ensureHistory(),this._ensureLookups(),this._ensureEnergy(),this._rows.play(this.renderRoot.querySelector(".body"),this._animationsWanted&&this._settled);const e=this._animationsWanted&&"jump"!==this._config?.ring.animation&&this._visible&&!("undefined"!=typeof document&&document.hidden);if(this._ring.update(this.renderRoot,e,this._nodePx),!this._hass||!this._config)return;const t=this.renderRoot.querySelector("g.dots");if(!t)return;const i=this.renderRoot.querySelector(".plot"),o=i?.getBoundingClientRect().width??0,n=ci(this._config.flow.design);this._warnUnknownDesign(void 0!==n);const s=An(this,this._config.appearance);"auto"===this._config.appearance?this.removeAttribute("data-appearance"):this.setAttribute("data-appearance",this._config.appearance),o>0&&(this._plotScale=o/bo);const r=Kn(this._plotScale,this._config.flow);this.style.setProperty("--el-line-k",r.line.toFixed(4)),this._dots||(this._dots=new Pn(t,this._technique),o>0&&this._dots.setScale(o/bo),this._dots.setPathZoom(this._pathZoom),this._measurePathZoom()),this._dots.setDesign(n,s),this._dots.setDotScale(r.dot);const a=this._tickModel??this._model??oo(this._hass,this._config,this._chargeOf),l=this._dotsMove?ti(this._flowsOf(a),this._shownConfig()):[];this._dots.update(l,this._config,this._animationsWanted);const c=s?n?.dark:n?.light;c?this.style.setProperty("--el-link-opacity",String(c.line/100)):this.style.removeProperty("--el-link-opacity"),this._updateFan(),this._syncPlayState(),this._measure()||(this._settled=!0)}disconnectedCallback(){super.disconnectedCallback(),es.delete(this),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._intersectionObserver?.disconnect(),this._intersectionObserver=void 0,document.removeEventListener("visibilitychange",this._onVisibility),this.renderRoot.removeEventListener("transitionend",this._onTransitionEnd),this._pause(Date.now()),window.removeEventListener("resize",this._onWindowResize),this._motionQuery?.removeEventListener?.("change",this._onMotionChange),this._motionQuery=void 0,this._dots?.destroy(),this._dots=void 0,this._fanFollow&&cancelAnimationFrame(this._fanFollow),this._fanFollow=void 0,this._fan?.destroy(),this._fan=void 0,this._ring.stop(),this._tickTimer&&clearInterval(this._tickTimer),this._tickTimer=void 0}getCardSize(){return 7}getGridOptions(){return{columns:12,min_columns:12,rows:"auto"}}static async getConfigElement(){return await Promise.resolve().then(function(){return _r}),document.createElement(Vt)}static getStubConfig(){return{memory_id:Kt(),entities:{...Gt},icons:{rest:"mdi:cloud-question"}}}render(){if(!this._hass||!this._config)return q;const e=this._modelForMode(this._hass,this._config),t=this._tickModel??e,i=this._shownConfig(),o=function(e,t,i){const o=new Map,n=new Map;for(const e of t.consumers)e.reading.available&&o.set(e.key,e.reading.w),e.charge&&n.set(e.key,ii(e));const s=e.entries.map(e=>e.isRest?e:{...e,w:o.get(e.key)??(e.powerUnknown?0:e.w),powerUnknown:o.has(e.key)?void 0:e.powerUnknown,charge:n.has(e.key)?n.get(e.key):e.charge}),r=s.filter(e=>!e.isRest).reduce((e,t)=>e+t.w,0),a=s.findIndex(e=>e.isRest);if(a>=0){const e=t.house.available?t.house.w-r:s[a].w;s[a]={...s[a],w:Math.max(0,e)}}return{entries:s,segments:ni(s,i)}}(si(t,i,this._showAll),e,i),n=ti(this._flowsOf(t),i),s=new Map(n.map(e=>[e.connection,this._config?.colors[e.colorKey]??""]));this._lastEntries=new Map(o.entries.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));return K`
      <ha-card translate="no" @hass-more-info=${this._onMoreInfo}>
        ${On(this._config,this._hass,this._rawConfig?.title,this._mode,this._since,e=>this._setMode(e),this._showAll,()=>this._toggleShowAll(),this._energyChip(this._hass,this._config))}
        ${!0===this._outage?(r=this._hass,K`<div class="outage-banner" role="status">
    <ha-icon icon="mdi:flash-off"></ha-icon>
    <span>${Te("outage.banner",r)}</span>
  </div>`):q}
        ${this._example?function(e){return K`<div class="example-banner" role="status">
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <span>${Te("example.banner",e)}</span>
  </div>`}(this._hass):q}
        <div
          class="body ${this._stacked?"stacked":""} ${this._config.list.alwaysBelow?"force-below":""} ${this._config.list.enabled?"":"no-list"}"
          style=${function(e,t){const i=Math.max(8,26+dn(e,"solar",!1)-15),o=t?Math.max(8,28+dn(e,"battery",!0)-30):28,n=i-26-(o-28);return`--el-pad-top:${i}px;--el-pad-bottom:${o}px;--el-list-mt:${Math.max(0,n)}px;--el-list-mb:${Math.max(0,-n)}px`}(this._config,null!==e.battery)}
        >
          <svg class="fan" aria-hidden="true"></svg>
          ${wn(e,i,this._hass,s,this._config.ring.enabled?o.segments:[],this._nodePx,!0===this._outage,this._animationsWanted,this._holeR,this._seeThrough)}
          ${In(o,i,this._hass,(e,t)=>Xo(t.currentTarget,e),this._stacked)}
        </div>
      </ha-card>
    `;var r}}ss.styles=Un,ss.properties={hass:{attribute:!1,noAccessor:!0},_model:{state:!0},_showAll:{state:!0},_outage:{state:!0},_scale:{state:!0},_seeThrough:{state:!0}},customElements.get(qt)||customElements.define(qt,ss);const rs=window;rs.customCards=rs.customCards||[],rs.customCards.some(e=>e.type===qt)||rs.customCards.push({type:qt,name:Zt,description:"Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",preview:!0,documentationURL:"https://github.com/wawersich/enerlens-card"}),console.info(`%c ${qt.toUpperCase()} %c 0.11.0 · 9db6a7c+ `,"color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const as=zo(class extends No{constructor(){super(...arguments),this.key=q}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(Oo(e),this.key=t),i}}),ls=[{domain:"sensor",device_class:"power"},{domain:"sensor",unit_of_measurement:["W","kW","mW","MW"]}],cs=[{domain:"sensor",device_class:"battery"},{domain:"sensor",unit_of_measurement:"%"}],ds=["solar","grid","house","battery"],hs="consumers_slot";function us(e){const t=e.split(".")[0];return"binary_sensor"===t||"input_boolean"===t}const ms=[{domain:"binary_sensor"},{domain:"input_boolean"},{domain:"sensor"},{domain:"input_select"}];const ps=[...ds,"rest"],gs={solar:["entity","derived"],grid:["entity","split","derived"],house:["entity","derived"],battery:["none","entity","split","derived"]},fs={grid:["grid_import","grid_export"],battery:["battery_discharge","battery_charge"]},_s={grid:["import","export"],battery:["discharge","charge"]},ws=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],bs="var(--primary-text-color)";function ys(e,t){if("derived"===t)return"derived";if("string"==typeof t&&!(e=>null==e||"string"==typeof e&&""===e.trim())(t))return"entity";if(Os(t)&&"entity"in t)return"entity";const i=_s[e];return Os(t)&&i&&(i[0]in t||i[1]in t)?"split":"house"===e?"derived":"battery"===e?"none":"entity"}function vs(e,t,i){const o=ys(e,t);if(i[`${e}_source`]=o,"string"==typeof t)return void("entity"===o&&(i[e]=t));const n=t;if(!Os(n))return;const s=e=>"string"==typeof e?e:void 0;if("entity"===o)return i[e]=s(n.entity),void(i[`${e}_invert`]=!0===n.invert);const r=fs[e],a=_s[e];"split"===o&&r&&a&&(i[r[0]]=s(n[a[0]]),i[r[1]]=s(n[a[1]]))}const xs=["inside","label"],ks=(e,t)=>"label"===t||"battery"!==e,$s=e=>"grid"===e||"battery"===e;function Ss(e,t){return Os(e)?Object.fromEntries(Object.entries(e).filter(([e])=>!t.includes(e))):{}}const As={inside:["entity","position","decimals","size","weight"],label:["entity","prefix","decimals","size","weight"]},Ms=["show_name","show_state","inside","label"];function Es(e,t,i,o){const n=`node_${t}_${i}_`,s=e[`${n}entity`];if(!Ns(s))return;const r=e[`${n}decimals`],a=e[`${n}prefix`],l=e[`${n}weight`];return Rs({...Ss(o,As[i]),entity:s,..."inside"===i?{position:"below"===e[`${n}position`]?"below":void 0}:{prefix:Ns(a)?a:void 0},decimals:Ns(r)&&"ha"!==r?/^\d$/.test(r)?Number(r):r:void 0,size:Ls(e[`${n}size`]),weight:Ns(l)&&"normal"!==l?l:void 0})}function Cs(e,t){const i={};for(const o of ds)for(const n of xs){if(!ks(o,n))continue;const s=("battery"!==o||t)&&Ns(e[`node_${o}_${n}_entity`]);i[`${o}_${n}`]=s?e[`color_${o}_${n}`]:void 0}return i.battery_inside=void 0,i}function zs(e){const t=e.entities??{},i=t.grid_status,o="object"==typeof i&&null!==i?i:void 0,n={title:e.title,battery_soc:t.battery_soc,grid_status:"string"==typeof i?i:o?.entity,grid_status_outage:o?.outage,grid_status_ok:o?.ok,consumers:e.consumers,max_consumers:e.max_consumers,min_consumer_w:e.min_consumer_w,update_interval_s:e.update_interval_s,rest_label:e.list?.rest_label,appearance:e.appearance,list_enabled:e.list?.enabled,list_always_below:e.list?.always_below,ring_enabled:e.ring?.enabled,ring_animation:e.ring?.animation,power_unit:e.power?.unit,power_decimals:e.power?.decimals,power_digits:e.power?.digits,modes:Is(e.view?.modes),default_mode:e.view?.default_mode,avg_short_minutes:e.view?.avg_short_minutes,avg_long_minutes:e.view?.avg_long_minutes,energy_periods:Is(e.view?.energy_periods),default_energy:e.view?.default_energy,scope:Is(e.list?.scope),default_scope:e.list?.default_scope,inactive_lines:e.flow?.inactive_lines,animation:e.flow?.animation,design:e.flow?.design,dot_color:e.flow?.dot_color,dot_size:e.flow?.dot_size??100,line_width:e.flow?.line_width??100,min_w:e.flow?.min_w,peak_w:e.flow?.peak_w,slow_below_w:e.flow?.slow_below_w,full_speed_w:e.flow?.full_speed_w,more_dots_above_w:e.flow?.more_dots_above_w,max_dots_at_w:e.flow?.max_dots_at_w,max_dots:e.flow?.max_dots,slow_s:e.flow?.slow_s,fast_s:e.flow?.fast_s};for(const e of ds)vs(e,t[e],n);const s=e.colors??{};for(const e of ws)n[`color_${e}`]=s[e];n.soc_stops=s.soc_stops,function(e,t){const i=e.colors??{};for(const o of ds){const n=e.nodes?.[o]??{},s=`node_${o}_`;t[`${s}show_name`]=!1!==n.show_name,$s(o)&&(t[`${s}show_state`]=!1!==n.show_state);for(const e of xs){if(!ks(o,e))continue;const r=Os(n[e])?n[e]:{},a=`${s}${e}_`;t[`${a}entity`]=r.entity,"inside"===e?t[`${a}position`]=r.position??"above":t[`${a}prefix`]=r.prefix,t[`${a}decimals`]=void 0===r.decimals||null===r.decimals||""===r.decimals?"ha":String(r.decimals),t[`${a}size`]=r.size??100,t[`${a}weight`]=r.weight??"normal",t[`color_${o}_${e}`]=i[`${o}_${e}`]}}}(e,n);const r=e.icons??{};for(const e of ps)n[`icon_${e}`]=r[e];return n}const Ns=e=>"string"==typeof e&&""!==e.trim();function Ws(e,t){switch(t[`${e}_source`]??ys(e,void 0)){case"none":return;case"derived":return"house"===e?void 0:"derived";case"entity":{const i=t[e];if(!Ns(i))return;return!0===t[`${e}_invert`]?{entity:i,invert:!0}:i}case"split":{const i=fs[e],o=_s[e];if(!i||!o)return;const n=t[i[0]],s=t[i[1]];if(!Ns(n)||!Ns(s))return;return{[o[0]]:n,[o[1]]:s}}}}const Ps=e=>null===e||""===e?void 0:e;function Fs(e){return"number"==typeof e&&Number.isFinite(e)?e:void 0}function Ls(e){const t=Fs(e);return 100===t?void 0:t}function Ds(e){if(!Array.isArray(e))return;const t=e.filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function Ts(e){if(!Os(e))return;const t=e=>Ns(e)?e:void 0,i="plugged"===e.show?t(e.plugged):void 0,o=Rs({soc:t(e.soc),show:t(e.show),plugged:i,unplugged:i&&!us(i)?Ds(e.unplugged):void 0});return o&&Ns(o.soc)?o:void 0}const Os=e=>"object"==typeof e&&null!==e&&!Array.isArray(e);function Rs(e){const t={};for(const[i,o]of Object.entries(e))null!=o&&""!==o&&(t[i]=o);return Object.keys(t).length?t:void 0}function Is(e){return Array.isArray(e)?e.filter(e=>"string"==typeof e):void 0}function Bs(e,t){if(!Array.isArray(e))return;const i=t.filter(t=>e.includes(t));return i.length>0?i:void 0}function Hs(e,t,i){if("string"!=typeof e)return;const o=Bs(t,i);return void 0===o||o.includes(e)?e:void 0}function Ks(e){return"derived"!==e.grid_source&&"derived"!==e.battery_source}const Us=["inactive_lines","animation","design","dot_color","dot_size","line_width","min_w","peak_w","slow_below_w","full_speed_w","more_dots_above_w","max_dots_at_w","max_dots","slow_s","fast_s"],js=["modes","default_mode","avg_short_minutes","avg_long_minutes","energy_periods","default_energy"],qs=["current","avg_short","avg_long"],Vs=["power","today","24h","week","7d","month","30d"],Zs=["filtered","full"],Gs={modes:qs,energy_periods:Vs,scope:Zs},Qs=["power","today","24h","week"],Js=["title","max_consumers","min_consumer_w","update_interval_s","appearance"];function Ys(e){if(Js.includes(e)||"consumers"===e)return e;if("battery_soc"===e)return"entities.battery_soc";if(e.startsWith("grid_status"))return"entities.grid_status";for(const t of ds){if(e===t||e===`${t}_source`||e===`${t}_invert`||(fs[t]??[]).includes(e))return`entities.${t}`}return"rest_label"===e||e.startsWith("list_")||"scope"===e||"default_scope"===e?"list":e.startsWith("ring_")?"ring":e.startsWith("power_")?"power":js.includes(e)?"view":Us.includes(e)?"flow":e.startsWith("color_")||"soc_stops"===e?"colors":e.startsWith("node_")?"nodes":e.startsWith("icon_")?"icons":void 0}const Xs={"entities.battery_soc":["entities.battery"],nodes:["entities.battery"],colors:["entities.battery","nodes"]};function er(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,i)=>er(e,t[i]));if(Os(e)&&Os(t)){return[...new Set([...Object.keys(e),...Object.keys(t)])].every(i=>er(e[i],t[i]))}return!1}function tr(e){if(null!==e&&("string"!=typeof e||""!==e.trim())){if(Array.isArray(e)){const t=e.map(tr).filter(e=>void 0!==e);return t.length?t:void 0}if(Os(e)){const t={};for(const[i,o]of Object.entries(e)){const e=tr(o);void 0!==e&&(t[i]=e)}return Object.keys(t).length?t:void 0}return e}}const ir=e=>Os(e)?e:{};function or(e,t){const i=e,o=function(e,t){const i=new Set;for(const o of new Set([...Object.keys(e),...Object.keys(t)])){const n=Ys(o);n&&!er(e[o],t[o])&&i.add(n)}for(const[e,t]of Object.entries(Xs))t.some(e=>i.has(e))&&i.add(e);return i}(i,zs(t)),n=t,s=ir(t.entities),r=(e,t,i)=>o.has(e)?t():tr(i),a={...s};for(const e of ds)a[e]=r(`entities.${e}`,()=>Ws(e,i),s[e]);const l=void 0!==a.battery;a.battery_soc=r("entities.battery_soc",()=>l?Ps(e.battery_soc):void 0,s.battery_soc),a.grid_status=r("entities.grid_status",()=>{const t=Ps(e.grid_status);return t?Rs({entity:t,outage:Ds(e.grid_status_outage),ok:Ds(e.grid_status_ok)}):void 0},s.grid_status);const c=[...ds,"battery_soc","grid_status"].map(e=>`entities.${e}`),d=Os(t.entities)||c.some(e=>o.has(e))?Rs(a):tr(t.entities);return{...t,type:t.type,title:r("title",()=>Ps(e.title),n.title),entities:d,consumers:r("consumers",()=>function(e){if(!Array.isArray(e))return;const t=new Set,i=[];for(const o of e){if(!Os(o))continue;const e=Rs({...o,charge:Ts(o.charge)}),n=e?.entity;e&&"string"==typeof n&&!t.has(n)&&(t.add(n),i.push(e))}return i.length?i:void 0}(e.consumers),n.consumers),max_consumers:r("max_consumers",()=>Fs(e.max_consumers),n.max_consumers),min_consumer_w:r("min_consumer_w",()=>Fs(e.min_consumer_w),n.min_consumer_w),update_interval_s:r("update_interval_s",()=>Fs(e.update_interval_s),n.update_interval_s),appearance:r("appearance",()=>Ps(e.appearance),n.appearance),list:r("list",()=>Rs({...Ss(n.list,["enabled","rest_label","always_below","scope","default_scope"]),enabled:e.list_enabled,rest_label:e.rest_label,always_below:e.list_always_below,scope:Bs(e.scope,Zs),default_scope:Hs(e.default_scope,e.scope,Zs)}),n.list),ring:r("ring",()=>Rs({...Ss(n.ring,["enabled","animation"]),enabled:e.ring_enabled,animation:Ps(e.ring_animation)}),n.ring),power:r("power",()=>Rs({...Ss(n.power,["unit","decimals","digits"]),unit:Ps(e.power_unit),decimals:Fs(e.power_decimals),digits:Fs(e.power_digits)}),n.power),view:r("view",()=>Rs({...Ss(n.view,["modes","default_mode","avg_short_minutes","avg_long_minutes","show_selector","energy_periods","default_energy"]),modes:Bs(e.modes,qs),default_mode:Hs(e.default_mode,e.modes,qs),avg_short_minutes:Fs(e.avg_short_minutes),avg_long_minutes:Fs(e.avg_long_minutes),energy_periods:Bs(e.energy_periods,Vs),default_energy:Hs(e.default_energy,e.energy_periods,Vs)}),n.view),flow:r("flow",()=>Rs({...ir(t.flow),inactive_lines:e.inactive_lines,animation:e.animation,design:e.design,dot_color:Ps(e.dot_color),dot_size:Ls(e.dot_size),line_width:Ls(e.line_width),min_w:Fs(e.min_w),peak_w:Fs(e.peak_w),slow_below_w:Fs(e.slow_below_w),full_speed_w:Fs(e.full_speed_w),more_dots_above_w:Fs(e.more_dots_above_w),max_dots_at_w:Fs(e.max_dots_at_w),max_dots:Fs(e.max_dots),slow_s:Fs(e.slow_s),fast_s:Fs(e.fast_s)}),n.flow),colors:r("colors",()=>Rs({...ir(t.colors),...Object.fromEntries(ws.map(e=>[e,i[`color_${e}`]])),...void 0!==i.soc_stops?{soc_stops:i.soc_stops}:{},...Cs(i,l)}),n.colors),nodes:r("nodes",()=>function(e,t,i){const o=Ss(i,ds);for(const n of ds){if("battery"===n&&!t)continue;const s=`node_${n}_`,r=Os(i)?i[n]:void 0,a=Os(r)?r:{},l=Rs({...Ss(a,Ms),show_name:!1!==e[`${s}show_name`]&&void 0,show_state:(!$s(n)||!1!==e[`${s}show_state`])&&void 0,inside:ks(n,"inside")?Es(e,n,"inside",a.inside):void 0,label:Es(e,n,"label",a.label)});l&&(o[n]=l)}return Rs(o)}(i,l,t.nodes),n.nodes),icons:r("icons",()=>Rs({...Ss(n.icons,ps),...Object.fromEntries(ps.map(e=>[e,i[`icon_${e}`]]))}),n.icons)}}function nr(e){return{select:{mode:"dropdown",options:["ha","0","1","2","3","sig2","sig3","sig4"].map(t=>({value:t,label:e(`decimals_${t}`)}))}}}function sr(e){return{select:{mode:"dropdown",options:["normal","medium","bold"].map(t=>({value:t,label:e(`weight_${t}`)}))}}}const rr={name:"colors_hint",type:"constant"};function ar(e){const{min:t,max:i}=gt[e];return void 0===i?{min:t}:{min:t,max:i}}const lr=new Set(Object.keys(gt).map(e=>cr(e)).filter(e=>void 0!==e));function cr(e){return e.startsWith("view.")||e.startsWith("flow.")?e.slice(5):e.startsWith("power.")?e.replace(".","_"):e.includes(".")||e.includes("[")?void 0:e}function dr(e){const t=e.schema;return t?t.flatMap(dr):"string"==typeof e.name?[e.name]:[]}const hr={current:"mode_current",avg_short:"mode_short",avg_long:"mode_long"};function ur(e){const t=Ks(e)?Bs(e.energy_periods,Vs)??Qs:["power"];return{modes:Bs(e.modes,qs)??qs,energy_periods:t,scope:Bs(e.scope,Zs)??Zs}}function mr(e,t,i){return t.map(t=>({value:t,label:i(t),...1===e.length&&e[0]===t?{disabled:!0}:{}}))}function pr(e,t,i,o){return t.length<2?[]:[{name:e,disabled:o,selector:{select:{mode:"dropdown",options:t.map(e=>({value:e,label:i(e)}))}}}]}function gr(e,t){const i=t=>Te(`editor.${t}`,e),o=ur(t),n=o.energy_periods.includes("power"),s=Array.isArray(t.consumers)&&t.consumers.length>0,r=ds.filter(e=>"derived"===t[`${e}_source`]),a=ds.map(o=>{const n=function(e,t,i,o){const n=t[`${e}_source`]??ys(e,void 0),s=gs[e].filter(e=>"derived"!==e||!i||"derived"===n).map(t=>({value:t,label:o("split"===t?`source_split_${e}`:`source_${t}`)})),r=[{name:`${e}_source`,selector:{select:{mode:"dropdown",options:s}}}];if("entity"===n)r.push({type:"grid",name:"",schema:[{name:e,selector:{entity:{filter:ls}}},{name:`${e}_invert`,selector:{boolean:{}}}]});else if("split"===n)for(const t of fs[e]??[])r.push({name:t,selector:{entity:{filter:ls}}});return r}(o,t,r.some(e=>e!==o),i);return"battery"===o&&"none"!==t.battery_source&&n.push({name:"battery_soc",selector:{entity:{filter:cs}}}),{name:`entities_${o}`,type:"expandable",flatten:!0,title:Te(`node.${o}`,e),schema:n}}),l="string"==typeof t.grid_status?t.grid_status:void 0,c=l?e.states?.[l]?.attributes.options:void 0,d={select:{multiple:!0,custom_value:!0,mode:"list",options:(Array.isArray(c)?c:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e}))}};return[{name:"title",selector:{text:{}}},{name:"entities",type:"expandable",flatten:!0,title:i("entities"),schema:[...a,rr]},{name:"nodes",type:"expandable",flatten:!0,title:i("nodes"),schema:[...ds.filter(e=>"battery"!==e||"none"!==t.battery_source).map(o=>function(e,t,i,o){const n=`node_${e}_`,s=[{name:`${n}show_name`,selector:{boolean:{}}}];$s(e)&&s.push({name:`${n}show_state`,selector:{boolean:{}}});for(const i of xs){if(!ks(e,i))continue;const r=`${n}${i}_`;s.push({name:`${r}entity`,selector:{entity:{}}}),Ns(t[`${r}entity`])&&("inside"===i?s.push({name:`${r}position`,selector:{select:{mode:"dropdown",options:[{value:"above",label:o("position_above")},{value:"below",label:o("position_below")}]}}}):s.push({name:`${r}prefix`,selector:{text:{}}}),s.push({name:`${r}decimals`,selector:nr(o)},{name:`${r}size`,selector:{number:{min:60,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:`${r}weight`,selector:sr(o)}))}return{name:`node_${e}`,type:"expandable",flatten:!0,title:Te(`node.${e}`,i),schema:s}}(o,t,e,i)),rr]},{name:hs,type:"constant"},{name:"grid_status",type:"expandable",flatten:!0,title:i("grid_status_section"),schema:[{name:"grid_status",selector:{entity:{}}},{name:"grid_status_outage",selector:d},{name:"grid_status_ok",selector:d}]},{name:"display",type:"expandable",flatten:!0,title:i("display"),schema:[{name:"appearance",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("appearance_auto")},{value:"light",label:i("appearance_light")},{value:"dark",label:i("appearance_dark")}]}}},{name:"list_enabled",selector:{boolean:{}}},{name:"list_always_below",selector:{boolean:{}}},{name:"ring_enabled",selector:{boolean:{}}},{name:"ring_animation",selector:{select:{mode:"dropdown",options:[{value:"overtake",label:i("ring_overtake")},{value:"fade",label:i("ring_fade")},{value:"jump",label:i("ring_jump")}]}}},{name:"max_consumers",selector:{number:{...ar("max_consumers"),mode:"box"}}},{name:"min_consumer_w",selector:{number:{...ar("min_consumer_w"),mode:"box"}}},{name:"rest_label",selector:{text:{}}},{name:"power_unit",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("power_auto")},{value:"kW",label:i("power_kw")},{value:"W",label:i("power_w")}]}}},..."auto"===t.power_unit?[{name:"power_digits",selector:{select:{mode:"dropdown",options:[{value:2,label:"2"},{value:3,label:"3"},{value:4,label:"4"}]}}}]:[],..."W"===t.power_unit||"auto"===t.power_unit?[]:[{name:"power_decimals",selector:{select:{mode:"dropdown",options:[{value:1,label:"1"},{value:2,label:"2"},{value:3,label:"3"}]}}}],{name:"update_interval_s",selector:{number:{...ar("update_interval_s"),mode:"box"}}}]},(()=>{const r=[{name:"modes",disabled:!n,selector:{select:{multiple:!0,mode:"list",options:mr(o.modes,qs,e=>i(hr[e]))}}},...pr("default_mode",o.modes,e=>i(hr[e]),!n),{name:"avg_short_minutes",disabled:!n,selector:{number:{...ar("view.avg_short_minutes"),mode:"box"}}},{name:"avg_long_minutes",disabled:!n,selector:{number:{...ar("view.avg_long_minutes"),mode:"box"}}}],a=[{name:"energy_periods",disabled:!Ks(t),selector:{select:{multiple:!0,mode:"list",options:mr(o.energy_periods,Vs,e=>i(`energy_${e}`))}}},...pr("default_energy",o.energy_periods,e=>i(`energy_${e}`),!Ks(t))],l=s?[{name:"scope",selector:{select:{multiple:!0,mode:"list",options:mr(o.scope,Zs,e=>i(`scope_${e}`))}}},...pr("default_scope",o.scope,e=>i(`scope_${e}`),!1)]:[];return{name:"quick_buttons",type:"expandable",flatten:!0,title:i("quick_buttons"),schema:[...r,...a,...l],parts:[{title:i("group_smoothing"),notice:n?void 0:Te("editor_help.modes_locked",e),schema:r},{title:i("group_energy"),schema:a},...s?[{title:i("group_scope"),schema:l}]:[]]}})(),{name:"flow",type:"expandable",flatten:!0,title:i("flow"),schema:[{name:"min_w",selector:{number:{...ar("flow.min_w"),mode:"box"}}},{name:"peak_w",selector:{number:{...ar("flow.peak_w"),mode:"box"}}},{name:"inactive_lines",selector:{select:{mode:"dropdown",options:[{value:"show",label:i("lines_show")},{value:"dim",label:i("lines_dim")},{value:"hide",label:i("lines_hide")}]}}},{name:"animation",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("anim_auto")},{value:"on",label:i("anim_on")},{value:"off",label:i("anim_off")}]}}},{name:"design",selector:{select:{mode:"dropdown",options:[{value:ai,label:i("design_none")},...li.map(t=>({value:t.id,label:di(t,e)}))]}}},{name:"dot_size",selector:{number:{...ar("flow.dot_size"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"line_width",selector:{number:{...ar("flow.line_width"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"flow_fine",type:"expandable",flatten:!0,title:i("flow_fine"),schema:[{name:"slow_below_w",selector:{number:{...ar("flow.slow_below_w"),mode:"box"}}},{name:"full_speed_w",selector:{number:{...ar("flow.full_speed_w"),mode:"box"}}},{name:"more_dots_above_w",selector:{number:{...ar("flow.more_dots_above_w"),mode:"box"}}},{name:"max_dots_at_w",selector:{number:{...ar("flow.max_dots_at_w"),mode:"box"}}},{name:"max_dots",selector:{number:{...ar("flow.max_dots"),mode:"box"}}},{name:"slow_s",selector:{number:{...ar("flow.slow_s"),step:.1,mode:"box"}}},{name:"fast_s",selector:{number:{...ar("flow.fast_s"),step:.1,mode:"box"}}}]}]},{name:"icons",type:"expandable",flatten:!0,title:i("icons"),schema:ps.map(e=>({name:`icon_${e}`,selector:{icon:{}}}))}]}class fr extends ce{constructor(){super(...arguments),this._openColors=new Set,this._pickerMode="hex",this._consumerKeys=[],this._nextConsumerKey=0,this._openConsumers=new Set,this._builtSections=new Set,this._builtConsumers=new Set,this._label=e=>{const t=e.name,i=/^node_(?:solar|grid|house|battery)_(.+)$/.exec(t);return i?Te(`editor.node_${i[1]}`,this.hass):"grid_status"===t?Te("editor.grid_status",this.hass):t.endsWith("_source")?Te(`editor.${t.replace(/_source$/,"")}`,this.hass):t.endsWith("_invert")?Te("editor.invert",this.hass):t.startsWith("icon_")?Te(`editor.${t.slice(5)}`,this.hass):ds.includes(t)?Te("editor.entity",this.hass):Te(`editor.${t}`,this.hass)},this._helper=e=>{if("grid_status"===e.name)return"";const t=this._flat??{};if("energy_periods"===e.name&&!Ks(t))return Te("editor_help.energy_periods_locked",this.hass);let i=`editor_help.${e.name.replace(/^node_(?:solar|grid|house|battery)_/,"node_")}`;if(e.name.startsWith("color_")&&(i="editor_help.color"),e.name.endsWith("_source")){if("derived"!==(this._flat??{})[e.name])return"";i="editor_help.derived"}const o=Te(i,this.hass);return o===i?"":o},this._probe=e=>{const t=this.shadowRoot;if(!t||"undefined"==typeof getComputedStyle)return"";const i=document.createElement("span");if(i.style.display="none",i.style.color=e,""===i.style.color)return"";t.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o},this._hexTyped=e=>{const t=e.target,i=Ce(t.value);i&&this._picker?(this._picker={id:this._picker.id,hsv:ze(i,this._picker.hsv.h)},this._applyColor(this._picker.id,i)):this._picker&&(t.value=Ne(this._picker.hsv))},this._addStop=()=>{const e=this._socStops();if(!e)return;const t=e.length-1;let i=50,o=t,n=-1;for(let s=1;s<=t;s++){const t=e[s].at-e[s-1].at;t>n&&(n=t,o=s,i=Math.round((e[s].at+e[s-1].at)/2))}const s=[...e];s.splice(o,0,{at:i,color:e[o].color}),this._writeStops(s)},this._notes=new Map,this._consumerLabel=e=>{const t=`editor.consumer_${e.name}`,i=Te(t,this.hass);return i===t?Te(`editor.${e.name}`,this.hass):i},this._consumerHelper=e=>{const t=`editor_help.consumer_${e.name}`,i=Te(t,this.hass);return i===t?"":i},this._addConsumer=()=>{const e=[...this._consumerRows(),{}],t=[...this._keysFor(e.length-1),this._nextConsumerKey++];this._openConsumers=new Set([...this._openConsumers,t[t.length-1]]),this._builtConsumers=new Set([...this._builtConsumers,t[t.length-1]]),this._writeConsumers(e,t)},this._moveConsumer=e=>{e.stopPropagation(),this._moveTo(e.detail.oldIndex,e.detail.newIndex)}}setConfig(e){this._config=e,void 0!==this._flat&&JSON.stringify(e)===this._emitted||(this._flat=zs(e),this._consumerKeys=[],this._openConsumers=new Set),queueMicrotask(()=>this._fixOnOpen(e))}connectedCallback(){super.connectedCallback();const e=this._config;e&&queueMicrotask(()=>this._fixOnOpen(e))}_fixOnOpen(e){if(this._config!==e||this._fixedFor===e||!this.isConnected)return;this._fixedFor=e;let t=function(e){const t=e.view;if(!Os(t)||!1!==t.show_selector)return;let i;try{i=Ht(e)}catch{return}const{show_selector:o,...n}=t,s={...e,view:{...n,modes:i.view.modes,energy_periods:Bs(n.energy_periods,Vs)??(i.view.power?["power"]:i.view.energyPeriods)}};return i.consumers.length>0&&(s.list={...e.list??{},scope:i.list.scope}),s}(e);const i=jt(e.memory_id);if((void 0===i||this._twiceInDashboard(i))&&(t={...t??e,memory_id:Kt()}),!t)return;const o=t;this._config=o,this._fixedFor=o,this._flat=zs(o),this._emitted=JSON.stringify(o),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:o},bubbles:!0,composed:!0})),this.requestUpdate()}_twiceInDashboard(e){let t=this;for(;t;){const i=t.lovelace?.config;if(i){return Ut(i.views).filter(t=>jt(t.memory_id)===e).length>1}t=t.parentNode??(t instanceof ShadowRoot?t.host:null)}return!1}_shownFlat(){const e=this._flat??{};return this._shown?.from!==e&&(this._shown={from:e,data:{...e,...ur(e)}}),this._shown.data}_valueChanged(e){const t={...e.detail.value},i=this._flat??{},o=ur(i);for(const e of["modes","energy_periods","scope"]){!(void 0!==Bs(i[e],Gs[e]))&&er(t[e],o[e])&&(t[e]=void 0)}this._emit(t)}_emit(e){if(!this._config)return;this._flat=e;const t=or(e,this._config);this._emitted=JSON.stringify(t),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_setColor(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t;this._emit({...this._flat,[`color_${e}`]:i})}_renderColors(){return K`
      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">${(e=>Te(`editor.${e}`,this.hass))("colors")}</div>
        <div class="colors">
          ${this._picker?K`<div
                  class="scrim"
                  @pointerdown=${e=>{e.stopPropagation(),this._picker=void 0}}
                ></div>`:""}
          <p class="hint">${Te("editor_help.color",this.hass)}</p>
          ${ws.map(e=>this._renderNodeColor(e))}
          ${this._renderExtraColors()}
          ${this._renderDotColor()} ${this._renderConsumerColors()} ${this._renderSocStops()}
        </div>
      </ha-expansion-panel>
    `}_renderExtraColors(){const e=this._flat??{},t=[];for(const i of ds)if("battery"!==i||"none"!==e.battery_source)for(const o of xs){if(!ks(i,o)||!Ns(e[`node_${i}_${o}_entity`]))continue;const n=`color_${i}_${o}`,s=e[n],r=Te(`editor.color_extra_${o}`,this.hass,{node:Te(`node.${i}`,this.hass)});t.push(this._colorRow({id:`flat:${n}`,label:r,name:r,value:"string"==typeof s?s:"",preset:"var(--secondary-text-color)"}))}return t.length?K`${this._group(Te("editor.colors_extras",this.hass))}${t}`:""}_group(e){return K`<p class="group">${e}</p>`}_renderNodeColor(e){const t=this._flat?.[`color_${e}`],i=Te(`editor.color_${e}`,this.hass);return this._colorRow({id:`node:${e}`,label:i,name:i,value:"string"==typeof t?t:"",preset:ye[e]})}_renderDotColor(){const e=this._flat?.dot_color,t="string"==typeof e&&""!==e.trim(),i=Te("editor.dot_color",this.hass);return K`
      ${this._group(Te("editor.colors_dots",this.hass))}
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!t}
          @change=${i=>{const o=i.target.checked;o&&t&&(this._lastDotColor=e),this._setFlat("dot_color",o?"":this._lastDotColor??bs)}}
        />
        <span>${Te("editor.dot_color_follow",this.hass)}</span>
      </label>
      ${t?this._colorRow({id:"flat:dot_color",label:i,name:i,value:e,preset:bs}):q}
    `}_renderConsumerColors(){const e=this._flat?.consumers,t=(Array.isArray(e)?e:[]).filter(e=>Os(e));if(0===t.length)return K``;const i=xe;return K`
      ${this._group(Te("editor.colors_consumers",this.hass))}
      ${t.map((e,t)=>{const o="string"==typeof e.name&&e.name.trim()||("string"==typeof e.entity?e.entity:`#${t+1}`);return this._colorRow({id:`consumer:${t}`,label:o,name:o,value:"string"==typeof e.color?e.color:"",preset:i[t%i.length]})})}
    `}_renderSocStops(){const e=this._socStops();if(!e)return K`
        ${this._group(Te("editor.colors_soc",this.hass))}
        <p class="hint">${Te("editor.yaml_only",this.hass)}</p>
      `;const t=e.length-1;return K`
      ${this._group(Te("editor.colors_soc",this.hass))}
      ${e.map((e,i)=>{const o=0===i||i===t;return this._colorRow({id:`stop:${i}`,label:`${e.at} %`,name:K`
            <span class="at">
              ${o?K`<span class="fixed">${e.at}</span>`:K`<input
                      class="percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      .value=${String(e.at)}
                      aria-label=${Te("editor.color_at",this.hass)}
                      @change=${e=>this._setStopAt(i,Number(e.target.value))}
                    />`}
              <span class="unit">%</span>
            </span>
          `,value:e.color,preset:e.color,trail:o?void 0:K`<button
                class="reset"
                title=${Te("editor.color_remove",this.hass)}
                aria-label=${Te("editor.color_remove",this.hass)}
                @click=${()=>this._removeStop(i)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>`})})}
      <button class="add" @click=${this._addStop}>
        <ha-icon icon="mdi:plus"></ha-icon>${Te("editor.color_add_stop",this.hass)}
      </button>
    `}_colorRow(e){const{id:t,label:i,name:o,value:n,preset:s,trail:r}=e,a=this._openColors.has(t),l=this._picker?.id===t,c=`color-field-${t.replace(":","-")}`,d=l?Ne(this._picker.hsv):Ce(n||s,this._probe)??"#888888";return K`
      <div class="color ${a?"open":""} ${l?"picking":""}">
        <div class="head">
          <button
            class="swatch"
            data-key=${t}
            style="background:${d}"
            aria-label=${`${i} - ${Te("editor.color_pick",this.hass)}`}
            aria-haspopup="dialog"
            aria-expanded=${l?"true":"false"}
            @click=${()=>this._togglePicker(t,d)}
          ></button>
          <span class="name">${o}</span>
          <span class="css">${n||Te("editor.color_default",this.hass)}</span>
          <button
            class="more"
            aria-expanded=${a?"true":"false"}
            aria-controls=${c}
            @click=${()=>this._toggleColor(t)}
          >
            ${Te("editor.color_css",this.hass)} ${a?"▴":"▾"}
          </button>
          ${r??""}
        </div>
        ${l?this._renderPicker(d):""}
        <div class="body" id=${c} ?hidden=${!a}>
          <ha-textfield
            .label=${i}
            .value=${n}
            .placeholder=${s}
            @input=${e=>this._applyColor(t,e.target.value)}
          ></ha-textfield>
          <button
            class="reset"
            ?disabled=${""===n}
            title=${Te("editor.color_reset",this.hass)}
            aria-label=${Te("editor.color_reset",this.hass)}
            @click=${()=>this._applyColor(t,"")}
          >
            <ha-icon icon="mdi:backup-restore"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPicker(e){const{h:t,s:i,v:o}=this._picker.hsv;return K`
      <div
        class="picker"
        role="dialog"
        aria-label=${Te("editor.color_pick",this.hass)}
        @keydown=${this._pickerKeydown}
      >
        <div
          class="sv"
          tabindex="0"
          role="group"
          aria-label=${Te("editor.color_sv",this.hass)}
          style="--hue:${t}"
          @pointerdown=${e=>this._drag(e,"sv")}
        >
          <span class="knob" style="left:${100*i}%;top:${100*(1-o)}%"></span>
        </div>
        <div
          class="hue"
          tabindex="0"
          role="slider"
          aria-label=${Te("editor.color_hue",this.hass)}
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow=${Math.round(t)}
          @pointerdown=${e=>this._drag(e,"hue")}
        >
          <span class="knob" style="left:${t/360*100}%"></span>
        </div>
        <div class="foot">
          <span class="chip" style="background:${e}"></span>
          ${"hex"===this._pickerMode?K`<input
                  class="hex"
                  type="text"
                  spellcheck="false"
                  .value=${e}
                  aria-label=${Te("editor.color_hex",this.hass)}
                  @change=${this._hexTyped}
                />`:K`<code class="reading">${e}</code>`}
          <div class="modes" role="group" aria-label=${Te("editor.color_mode",this.hass)}>
            ${["hex","rgb","hsl"].map(e=>K`<button
                class="mode"
                aria-pressed=${this._pickerMode===e?"true":"false"}
                @click=${()=>{this._pickerMode=e}}
              >
                ${e.toUpperCase()}
              </button>`)}
          </div>
        </div>
        ${"hex"===this._pickerMode?"":this._renderChannels()}
        ${this._renderInUse()}
      </div>
    `}_renderChannels(){const e=this._picker.hsv,t="rgb"===this._pickerMode,i=We(e),o=t?(()=>{const t=/^#(..)(..)(..)$/.exec(Ne(e)),[i,o,n]=t?[1,2,3].map(e=>Number.parseInt(t[e],16)):[0,0,0];return[{key:"r",label:"R",value:i,max:255},{key:"g",label:"G",value:o,max:255},{key:"b",label:"B",value:n,max:255}]})():[{key:"h",label:"H",value:Math.round(i.h),max:360},{key:"s",label:"S",value:Math.round(100*i.s),max:100},{key:"l",label:"L",value:Math.round(100*i.l),max:100}];return K`
      <div class="channels">
        ${o.map(e=>K`
            <label class="channel">
              <span class="tag">${e.label}</span>
              <input
                class="range"
                type="range"
                min="0"
                max=${e.max}
                step="1"
                .value=${String(e.value)}
                @input=${t=>this._setChannel(e.key,Number(t.target.value),!1)}
                @change=${t=>this._setChannel(e.key,Number(t.target.value),!0)}
              />
              <input
                class="number"
                type="number"
                min="0"
                max=${e.max}
                step="1"
                .value=${String(e.value)}
                @change=${t=>this._setChannel(e.key,Number(t.target.value),!0)}
              />
            </label>
          `)}
      </div>
    `}_setChannel(e,t,i){if(!this._picker||!Number.isFinite(t))return;const o=this._picker.hsv;let n;if("r"===e||"g"===e||"b"===e){const i=/^#(..)(..)(..)$/.exec(Ne(o)),s=i?[1,2,3].map(e=>Number.parseInt(i[e],16)):[0,0,0];s["rgb".indexOf(e)]=Math.min(255,Math.max(0,Math.round(t)));const r=`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`;n=ze(r,o.h)}else{const i=We(o),s=Math.max(0,t);"h"===e&&(i.h=Math.min(360,s)%360),"s"===e&&(i.s=Math.min(100,s)/100),"l"===e&&(i.l=Math.min(100,s)/100),n={...Pe(i),h:i.h}}this._picker={id:this._picker.id,hsv:n},i&&this._commitPicker()}_renderInUse(){const e=this._coloursInUse();return 0===e.length?K``:K`
      <div class="used">
        <span class="cap">${Te("editor.color_used",this.hass)}</span>
        <div class="chips">
          ${e.map(e=>K`<button
              class="chip"
              style="background:${e.hex}"
              title=${e.value}
              aria-label=${e.value}
              @click=${()=>this._takeColour(e.value,e.hex)}
            ></button>`)}
        </div>
      </div>
    `}_coloursInUse(){const e=this._flat??{},t=[],i=new Set,o=e=>{if("string"!=typeof e||""===e.trim())return;const o=Ce(e,this._probe);o&&!i.has(o)&&(i.add(o),t.push({value:e,hex:o}))};for(const t of ws)o(e[`color_${t}`]??ye[t]);(Array.isArray(e.consumers)?e.consumers:[]).forEach((e,t)=>{Os(e)&&o(e.color??xe[t%xe.length])});for(const e of this._socStops()??[])o(e.color);return t}_takeColour(e,t){this._picker&&(this._picker={id:this._picker.id,hsv:ze(t,this._picker.hsv.h)},this._applyColor(this._picker.id,e))}_applyColor(e,t){const i=e.indexOf(":"),o=e.slice(0,i),n=e.slice(i+1);"flat"===o?this._setFlat(n,t):"node"===o?this._setColor(n,t):"consumer"===o?this._setConsumerColor(Number(n),t):"stop"===o&&this._setStopColor(Number(n),t)}_setFlat(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t;this._emit({...this._flat,[e]:i})}_setConsumerColor(e,t){if(!this._flat)return;const i=this._flat,o=Array.isArray(i.consumers)?[...i.consumers]:[];if(!Os(o[e]))return;const{color:n,...s}=o[e];o[e]=""===t.trim()?s:{...s,color:t},this._emit({...i,consumers:o})}_socStops(){const e=this._flat?.soc_stops;if(null==e||""===e)return ve.map(e=>({...e}));return Array.isArray(e)&&e.length>=2&&e.every(e=>Os(e)&&"number"==typeof e.at&&Number.isFinite(e.at)&&Ns(e.color))?e:void 0}_writeStops(e){this._flat&&this._emit({...this._flat,soc_stops:e})}_setStopColor(e,t){const i=this._socStops();""!==t.trim()&&i&&this._writeStops(i.map((i,o)=>o===e?{...i,color:t}:i))}_setStopAt(e,t){const i=this._socStops();if(!i||!Number.isFinite(t)||e<=0||e>=i.length-1)return;const o=i[e-1].at,n=i[e+1].at,s=Math.min(n,Math.max(o,Math.round(t)));this._writeStops(i.map((t,i)=>i===e?{...t,at:s}:t))}_removeStop(e){const t=this._socStops();!t||t.length<=2||0===e||e===t.length-1||this._writeStops(t.filter((t,i)=>i!==e))}_togglePicker(e,t){this._picker?.id!==e?this._picker={id:e,hsv:ze(t,this._picker?.hsv.h??0)}:this._picker=void 0}_drag(e,t){const i=e.currentTarget;e.preventDefault(),e.stopPropagation(),i.setPointerCapture?.(e.pointerId);const o=e=>{if(!this._picker)return;const o=i.getBoundingClientRect(),n=o.width?Math.min(1,Math.max(0,(e.clientX-o.left)/o.width)):0,s=o.height?Math.min(1,Math.max(0,(e.clientY-o.top)/o.height)):0,r=this._picker.hsv;this._picker={id:this._picker.id,hsv:"hue"===t?{h:360*n,s:r.s||1,v:r.v||1}:{...r,s:n,v:1-s}}},n=()=>{i.removeEventListener("pointermove",o),i.removeEventListener("pointerup",n),i.removeEventListener("pointercancel",n),this._commitPicker()};i.addEventListener("pointermove",o),i.addEventListener("pointerup",n),i.addEventListener("pointercancel",n),o(e)}_pickerKeydown(e){if("Escape"===e.key)return this._picker=void 0,void e.stopPropagation();if(!this._picker)return;const t=e.target.classList.contains("hue"),i=e.shiftKey?10:1,o={...this._picker.hsv};switch(e.key){case"ArrowLeft":t?o.h-=i:o.s-=i/100;break;case"ArrowRight":t?o.h+=i:o.s+=i/100;break;case"ArrowUp":if(t)return;o.v+=i/100;break;case"ArrowDown":if(t)return;o.v-=i/100;break;default:return}e.preventDefault(),e.stopPropagation(),this._picker={id:this._picker.id,hsv:{h:(o.h%360+360)%360,s:Math.min(1,Math.max(0,t?o.s||1:o.s)),v:Math.min(1,Math.max(0,t?o.v||1:o.v))}},this._commitPicker()}_commitPicker(){this._picker&&this._applyColor(this._picker.id,Ne(this._picker.hsv))}_toggleColor(e){const t=new Set(this._openColors);t.delete(e)||t.add(e),this._openColors=t}render(){if(!this.hass||!this._config||!this._flat)return q;this._notesFor!==this._config&&(this._notesFor=this._config,this._notes=this._notesOf(this._config));const e=gr(this.hass,this._flat),t=e.findIndex(e=>e.name===hs),i=-1===t?e:e.slice(0,t),o=-1===t?[]:e.slice(t+1),n=o.findIndex(e=>"icons"===e.name),s=-1===n?o.length:n;return K`${this._renderPieces(i)}${this._renderConsumers()}${this._renderPieces(o.slice(0,s))}${this._renderColors()}${this._renderPieces(o.slice(s))}`}_notesOf(e){const t=[];try{Ht(e,this.hass,t)}catch{}const i=t.filter((e,i)=>t.findIndex(t=>t.field===e.field)===i);return new Map(i.flatMap(e=>{const t=cr(e.field);if(!t)return[];const{min:i,max:o}=gt[e.field.replace(/\[\d+\]/,"")]??{min:0},n="order"===e.reason?`editor.note_order_${t}`:`editor.note_${e.reason}`,s=Te(n,this.hass,{min:i,max:o??""});return[[t,s===n?Te("editor.note_order",this.hass):s]]}))}_form(e){const t=[];let i=[];for(const o of e){i.push(o);const e=dr(o);if(!e.some(e=>lr.has(e)))continue;const n=e.filter(e=>this._notes.has(e));t.push(this._haForm(i));for(const e of n)t.push(K`<p class="field-note" role="note">${this._notes.get(e)}</p>`);i=[]}return(i.length>0||0===t.length)&&t.push(this._haForm(i)),K`${t}`}_haForm(e){return K`
      <ha-form
        .hass=${this.hass}
        .data=${this._shownFlat()}
        .schema=${e}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_renderPieces(e){const t=[];let i=[];for(const o of e)"expandable"===o.type?(i.length&&t.push(this._form(i)),i=[],t.push(this._renderSection(o))):i.push(o);return i.length&&t.push(this._form(i)),t}_renderParts(e){const t=e.parts??[e],i=e=>K`
      ${e.notice?K`<p class="section-notice" role="note">${e.notice}</p>`:q}
      ${as(function(e){const t=[],i=e=>{if(Array.isArray(e))for(const o of e){o.disabled&&t.push(String(o.name));const e=o.selector?.select;for(const i of e?.options??[])i.disabled&&t.push(`${o.name}=${i.value}`);i(o.schema)}};return i(e),t.join(",")}(e.schema),this._form(e.schema))}
    `;return t[0]===e?[i(e)]:t.map(e=>K`<fieldset class="part">
        <legend class="part-title">${e.title}</legend>
        ${i(e)}
      </fieldset>`)}_renderSection(e){const t=String(e.name),i=this._builtSections.has(t),o=Te(`editor_help.${t}`,this.hass),n=o===`editor_help.${t}`?"":o;return K`
      <ha-expansion-panel
        outlined
        class="section"
        data-section=${t}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&!i&&(this._builtSections=new Set([...this._builtSections,t]))}}
      >
        <div slot="header" role="heading" aria-level="3">${e.title}</div>
        <div class="section-content">
          ${n?K`<p class="section-description">${n}</p>`:q}
          ${i?this._renderParts(e):q}
        </div>
      </ha-expansion-panel>
    `}_consumerRows(){const e=this._flat?.consumers;return Array.isArray(e)?e:[]}_keysFor(e){for(;this._consumerKeys.length<e;)this._consumerKeys.push(this._nextConsumerKey++);return this._consumerKeys.length>e&&(this._consumerKeys.length=e),this._consumerKeys}_writeConsumers(e,t){this._flat&&(this._consumerKeys=t,this._emit({...this._flat,consumers:e}))}_renderConsumers(){const e=e=>Te(`editor.${e}`,this.hass),t=this._consumerRows(),i=this._keysFor(t.length),o=t.map((e,t)=>({row:e,index:t,key:i[t]}));return K`
      <ha-expansion-panel outlined class="consumers-panel">
        <div slot="header" role="heading" aria-level="3">${e("consumers")}</div>
        <div class="consumers">
          <p class="hint">${Te("editor_help.consumers_list",this.hass)}</p>
          <ha-sortable handle-selector=".handle" @item-moved=${this._moveConsumer}>
            <div class="consumer-list">
              ${Bo(o,e=>e.key,e=>this._renderConsumer(e.row,e.index,e.key))}
            </div>
          </ha-sortable>
          <button class="add-consumer" type="button" @click=${this._addConsumer}>
            <ha-icon icon="mdi:plus"></ha-icon>${e("consumer_add")}
          </button>
          <p class="hint">${e("colors_hint")}</p>
        </div>
      </ha-expansion-panel>
    `}_renderConsumer(e,t,i){const o=e=>Te(`editor.${e}`,this.hass),n=Os(e)?e:{},s="string"==typeof n.entity?n.entity:"",r=this.hass?.states?.[s]?.attributes?.friendly_name,a="string"==typeof n.name&&n.name.trim()||"string"==typeof r&&r||s||o("consumer_new"),l=Os(n.charge)?n.charge:void 0,c=Ns(l?.soc),d=xe,h="string"==typeof n.color&&""!==n.color.trim()?n.color:d[t%d.length];return K`
      <ha-expansion-panel
        outlined
        class="consumer"
        .expanded=${this._openConsumers.has(i)}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&(this._builtConsumers.has(i)||(this._builtConsumers=new Set([...this._builtConsumers,i])))}}
        @expanded-changed=${e=>{if(e.target!==e.currentTarget)return;const t=new Set(this._openConsumers);e.detail.expanded?t.add(i):t.delete(i),this._openConsumers=t}}
      >
        <div slot="header" class="consumer-head">
          ${customElements.get("ha-sortable")?K`<ha-icon
                  class="handle"
                  icon="mdi:drag"
                  @click=${e=>e.stopPropagation()}
                  @keydown=${e=>e.stopPropagation()}
                ></ha-icon>`:K`<span class="move">
                  ${[-1,1].map(e=>K`<button
                      type="button"
                      aria-label=${o(e<0?"consumer_up":"consumer_down")}
                      ?disabled=${t+e<0||t+e>=this._consumerRows().length}
                      @click=${i=>{i.stopPropagation(),this._moveTo(t,t+e)}}
                      @keydown=${e=>e.stopPropagation()}
                    >
                      <ha-icon icon=${e<0?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>
                    </button>`)}
                </span>`}
          <ha-icon
            class="consumer-icon"
            icon=${"string"==typeof n.icon&&n.icon?n.icon:"mdi:flash"}
            style="color:${h}"
          ></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">${a}</span>
            ${s?K`<small>${s}</small>`:q}
          </span>
          ${c?K`<span class="badge"><ha-icon icon="mdi:battery-charging-70"></ha-icon>${o("charge")}</span>`:q}
          <button
            class="remove"
            type="button"
            aria-label=${o("consumer_remove")}
            title=${o("consumer_remove")}
            @click=${e=>{e.stopPropagation(),this._removeConsumer(t)}}
            @keydown=${e=>{e.stopPropagation()}}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${this._builtConsumers.has(i)?K`<ha-form
                .hass=${this.hass}
                .data=${n}
                .schema=${function(e,t){const i=t=>Te(`editor.${t}`,e),o=Os(t.charge)?t.charge:{},n="string"==typeof o.plugged?o.plugged:"",s=us(n),r=e.states?.[n]?.attributes?.options,a=(Array.isArray(r)?r:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e})),l=[{name:"soc",selector:{entity:{filter:cs}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"charging",label:i("charge_show_charging")},{value:"plugged",label:i("charge_show_plugged")},{value:"always",label:i("charge_show_always")}]}}}];return"plugged"===o.show&&(l.push({name:"plugged",selector:{entity:{filter:ms}}}),n&&!s&&l.push({name:"unplugged",selector:{select:{multiple:!0,custom_value:!0,mode:"list",options:a}}})),[{name:"entity",required:!0,selector:{entity:{filter:ls}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"min_w",selector:{number:{...ar("consumers.min_w"),mode:"box"}}},{name:"charge",type:"expandable",title:i("charge"),schema:l}]}(this.hass,n)}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._consumerHelper}
                @value-changed=${e=>{e.stopPropagation(),this._setConsumer(t,e.detail.value)}}
              ></ha-form>`:q}
      </ha-expansion-panel>
    `}_setConsumer(e,t){const i=[...this._consumerRows()];i[e]=t,this._writeConsumers(i,[...this._consumerKeys])}_removeConsumer(e){const t=[...this._consumerRows()],i=[...this._consumerKeys];t.splice(e,1),i.splice(e,1),this._writeConsumers(t,i)}_moveTo(e,t){const i=[...this._consumerRows()],o=[...this._consumerKeys];e===t||e>=i.length||(i.splice(t,0,...i.splice(e,1)),o.splice(t,0,...o.splice(e,1)),this._writeConsumers(i,o))}}fr.properties={hass:{attribute:!1},_config:{state:!0},_flat:{state:!0},_openColors:{state:!0},_picker:{state:!0},_pickerMode:{state:!0},_openConsumers:{state:!0},_builtSections:{state:!0},_builtConsumers:{state:!0}},fr.styles=s`
    /*
     * One gap between the panels, whoever draws them.
     *
     * The colours cannot live in the schema - ha-form has no row with a swatch
     * (C-1) - so the editor is three pieces: a form, the colours panel, a
     * second form for the icons. ha-form spaces its own rows and stops at the
     * last one, so the two seams between the pieces had no gap at all while
     * every other panel had one. 24 px is what ha-form puts between its rows.
     */
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    ha-form {
      display: block;
    }

    /* A top-level group, drawn as ha-form-expandable draws its own. */
    .section {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-border-radius-md);
      --ha-card-border-radius: var(--ha-border-radius-md);
    }

    .section-content {
      padding: 12px;
    }

    .section-description {
      margin: 0 0 24px;
    }

    .part {
      margin: 0 0 16px;
      padding: 4px 12px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 12px;
      min-width: 0;
    }

    .part:last-child {
      margin-bottom: 0;
    }

    .part-title {
      padding: 0 6px;
      font-size: 1.05em;
      font-weight: 500;
      color: var(--primary-color);
    }

    .field-note {
      margin: -8px 0 16px;
      padding: 0 16px;
      font-size: 0.9em;
      color: var(--error-color, #db4437);
    }

    .section-notice {
      margin: 0 0 16px;
      color: var(--error-color, #db4437);
    }

    /* The consumers (REQ E-4): one unfoldable entry each, its form inside. */
    .consumers {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0 4px;
    }

    .consumer-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .consumer {
      --expansion-panel-summary-padding: 0 8px 0 4px;
      --expansion-panel-content-padding: 4px 12px 12px;
    }

    .consumer-head {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      width: 100%;
    }

    .handle {
      cursor: grab;
      color: var(--secondary-text-color);
      padding: 4px;
    }

    .consumer-icon {
      flex: none;
    }

    .consumer-title {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }

    .consumer-name,
    .consumer-title small {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .consumer-title small {
      color: var(--secondary-text-color);
    }

    .badge {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8em;
      padding: 2px 8px;
      border-radius: 10px;
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      --mdc-icon-size: 14px;
    }

    .move {
      display: flex;
      flex-direction: column;
    }

    .move button {
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: flex;
      --mdc-icon-size: 18px;
    }

    .move button:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .remove,
    .add-consumer {
      background: none;
      border: 0;
      cursor: pointer;
      color: var(--secondary-text-color);
      font: inherit;
    }

    .remove {
      flex: none;
      padding: 6px;
      border-radius: 50%;
      display: flex;
    }

    .add-consumer {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 18px;
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      font-weight: 500;
    }

    .remove:focus-visible,
    .add-consumer:focus-visible {
      outline: 2px solid var(--primary-color);
    }

    .colors {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 0 4px;
    }

    /* A plain checkbox, because this one is not a form field but a choice
       about whether the field below it exists at all. */
    .switch {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 6px;
      cursor: pointer;
      font-size: 0.95em;
    }

    .switch input {
      accent-color: var(--primary-color);
      width: 18px;
      height: 18px;
      margin: 0;
    }

    .hint {
      margin: 0 0 4px;
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }

    /* Name and colour first; the CSS field folds out under them. Seven text
       fields at once are a wall - and most of them are never touched. */
    /* Which of the three kinds of colour follows. */
    .group {
      margin: 14px 0 2px;
      color: var(--secondary-text-color);
      font-size: 0.8em;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .at {
      display: inline-flex;
      align-items: baseline;
      gap: 2px;
      font-variant-numeric: tabular-nums;
    }

    .at .percent {
      width: 3.4em;
      padding: 2px 4px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font: inherit;
      font-variant-numeric: tabular-nums;
    }

    .at .fixed {
      display: inline-block;
      width: 3.4em;
      padding: 2px 4px;
      color: var(--secondary-text-color);
    }

    .at .unit {
      color: var(--secondary-text-color);
    }

    .add {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 6px 10px 6px 6px;
      border: none;
      border-radius: 16px;
      background: none;
      color: var(--primary-color);
      font: inherit;
      font-size: 0.9em;
      cursor: pointer;
    }

    .add:hover {
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
    }

    .add ha-icon {
      --mdc-icon-size: 18px;
    }

    .color {
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      padding-bottom: 6px;
    }

    .color:last-child {
      border-bottom: none;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .head .name {
      flex: 1;
      min-width: 0;
    }

    /* What is set, in the notation it was written in - so a theme variable is
       readable without folding the row out. */
    .head .css {
      max-width: 42%;
      color: var(--secondary-text-color);
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.8em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .more {
      flex: none;
      padding: 4px 2px;
      border: none;
      background: none;
      color: var(--primary-color);
      font: inherit;
      font-size: 0.8em;
      font-family: var(--code-font-family, ui-monospace, monospace);
      cursor: pointer;
      white-space: nowrap;
    }

    .body {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0 2px 40px;
    }

    /* Wins over the display above, which the UA rule alone would not. */
    .body[hidden] {
      display: none;
    }

    .body ha-textfield {
      flex: 1;
      min-width: 0;
    }

    /* The swatch is a button now: it opens the wheel below, in this shadow root,
       where the surrounding dialog can see what is going on. */
    .swatch {
      flex: none;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 7px;
      cursor: pointer;
    }

    .scrim {
      position: fixed;
      inset: 0;
      z-index: 1;
    }

    /* Only the row being picked is lifted over the scrim. */
    .color.picking {
      position: relative;
      z-index: 2;
    }

    .picker {
      margin: 8px 0 2px;
      padding: 10px;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 10px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      box-shadow: var(--ha-card-box-shadow, 0 4px 14px rgba(0, 0, 0, 0.22));
      display: flex;
      flex-direction: column;
      gap: 10px;
      touch-action: none;
    }

    .picker .sv {
      position: relative;
      height: 128px;
      border-radius: 7px;
      cursor: crosshair;
      background:
        linear-gradient(to top, #000, transparent),
        linear-gradient(to right, #fff, hsl(var(--hue) 100% 50%));
    }

    .picker .hue {
      position: relative;
      height: 15px;
      border-radius: 8px;
      cursor: ew-resize;
      background: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
    }

    .picker .knob {
      position: absolute;
      width: 13px;
      height: 13px;
      margin: -7px 0 0 -7px;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }

    .picker .hue .knob {
      top: 50%;
    }

    .picker :is(.sv, .hue):focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .picker .foot {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .picker .foot .chip {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1px solid var(--divider-color, #c8c8c8);
    }

    .picker .foot .hex {
      flex: 1;
      min-width: 0;
      padding: 4px 6px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.85em;
    }

    .picker .foot .hex:focus {
      outline: none;
      border-bottom-color: var(--primary-color);
    }

    .picker .foot .reading {
      flex: 1;
      min-width: 0;
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }

    .modes {
      flex: none;
      display: flex;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 6px;
      overflow: hidden;
    }

    .mode {
      padding: 3px 7px;
      border: none;
      background: none;
      color: var(--secondary-text-color);
      font: inherit;
      font-size: 0.7em;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    .mode[aria-pressed="true"] {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .channels {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .channel {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .channel .tag {
      flex: none;
      width: 1.2em;
      color: var(--secondary-text-color);
      font-size: 0.85em;
      text-align: center;
    }

    .channel .range {
      flex: 1;
      min-width: 0;
      accent-color: var(--primary-color);
    }

    .channel .number {
      flex: none;
      width: 3.6em;
      padding: 2px 4px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
    }

    .used .cap {
      display: block;
      margin-bottom: 5px;
      color: var(--secondary-text-color);
      font-size: 0.75em;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .used .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      /* Five rows of 22 px chips plus their gaps - beyond that it scrolls,
         so the popup cannot grow past the dialog. */
      max-height: 140px;
      overflow-y: auto;
    }

    .used .chip {
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 6px;
      cursor: pointer;
    }

    .used .chip:hover {
      transform: scale(1.12);
    }

    .reset {
      flex: none;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    .reset:hover:not([disabled]) {
      background: var(--divider-color, rgba(0, 0, 0, 0.1));
    }

    .reset[disabled] {
      opacity: 0.3;
      cursor: default;
    }
  `,customElements.get(Vt)||customElements.define(Vt,fr);var _r=Object.freeze({__proto__:null,fieldOwner:Ys});export{Ke as ConfigError};
