const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let n=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=o.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&o.set(i,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const o=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new n(o,e,i)},r=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,p=globalThis,m=p.trustedTypes,f=m?m.emptyScript:"",g=p.reactiveElementPolyfillSupport,_=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!a(e,t),b={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=b){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&l(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const s=o?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??b}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const e=this.properties,t=[...d(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,o)=>{if(t)i.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=t.cssText,i.appendChild(o)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=o;const s=n.fromAttribute(t,e.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(void 0!==e){const s=this.constructor;if(!1===o&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??y)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[_("elementProperties")]=new Map,v[_("finalized")]=new Map,g?.({ReactiveElement:v}),(p.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,$=x.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+M,C=`<${E}>`,z=document,W=()=>z.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,F="[ \t\n\f\r]",L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,O=/>/g,T=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,q=/"/g,I=/^(?:script|style|textarea|title)$/i,B=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=B(1),H=B(2),K=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),U=new WeakMap,Z=z.createTreeWalker(z,129);function Q(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const G=(e,t)=>{const i=e.length-1,o=[];let n,s=2===t?"<svg>":3===t?"<math>":"",r=L;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===L?"!--"===l[1]?r=R:void 0!==l[1]?r=O:void 0!==l[2]?(I.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=T):void 0!==l[3]&&(r=T):r===T?">"===l[0]?(r=n??L,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?T:'"'===l[3]?q:D):r===q||r===D?r=T:r===R||r===O?r=L:(r=T,n=void 0);const h=r===T&&e[t+1].startsWith("/>")?" ":"";s+=r===L?i+C:c>=0?(o.push(a),i.slice(0,c)+A+i.slice(c)+M+h):i+M+(-2===c?t:h)}return[Q(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,s=0;const r=e.length-1,a=this.parts,[l,c]=G(e,t);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=Z.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(A)){const t=c[s++],i=o.getAttribute(e).split(M),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?ie:"?"===r[1]?oe:"@"===r[1]?ne:te}),o.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:n}),o.removeAttribute(e));if(I.test(o.tagName)){const e=o.textContent.split(M),t=e.length-1;if(t>0){o.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],W()),Z.nextNode(),a.push({type:2,index:++n});o.append(e[t],W())}}}else if(8===o.nodeType)if(o.data===E)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(M,e+1));)a.push({type:7,index:n}),e+=M.length-1}n++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,o){if(t===K)return t;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=P(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(t=Y(e,n._$AS(e,t.values),n,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??z).importNode(t,!0);Z.currentNode=o;let n=Z.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new ee(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new se(n,this,e)),this._$AV.push(t),a=i[++r]}s!==a?.index&&(n=Z.nextNode(),s++)}return Z.currentNode=z,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),P(e)?e===j||null==e||""===e?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==K&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=U.get(e.strings);return void 0===t&&U.set(e.strings,t=new J(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new ee(this.O(W()),this.O(W()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}_$AI(e,t=this,i,o){const n=this.strings;let s=!1;if(void 0===n)e=Y(this,e,t,0),s=!P(e)||e!==this._$AH&&e!==K,s&&(this._$AH=e);else{const o=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=Y(this,o[i+r],t,r),a===K&&(a=this._$AH[r]),s||=!P(a)||a!==this._$AH[r],a===j?e=j:e!==j&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}}class oe extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}}class ne extends te{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??j)===K)return;const i=this._$AH,o=e===j&&i!==j||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==j&&(i===j||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const re={I:ee},ae=x.litHtmlPolyfillSupport;ae?.(J,ee),(x.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;let ce=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let n=o._$litPart$;if(void 0===n){const e=i?.renderBefore??null;o._$litPart$=n=new ee(t.insertBefore(W(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=Number.NaN;class ue{constructor(){this.ts=new Float64Array(32),this.vs=new Float64Array(32),this.count=0}get length(){return this.count}oldest(){return this.count>0?this.ts[0]:void 0}push(e,t){if(!Number.isFinite(e))return;const i=null!==t&&Number.isFinite(t)?t:he;if(0===this.count||e>this.ts[this.count-1])return void this.insertAt(this.count,e,i);const o=this.lowerBound(e);o<this.count&&this.ts[o]===e?this.vs[o]=i:this.insertAt(o,e,i)}mean(e,t){if(0===this.count||t<=e)return null;let i=this.upperBound(e),o=i>0?this.vs[i-1]:he,n=e,s=0,r=0;for(;i<this.count&&this.ts[i]<=t;i++){const e=this.ts[i];Number.isNaN(o)||(s+=o*(e-n),r+=e-n),o=this.vs[i],n=e}return Number.isNaN(o)||(s+=o*(t-n),r+=t-n),r>0?s/r:null}has(e){const t=this.lowerBound(e);return t<this.count&&this.ts[t]===e}removeGap(e){const t=this.lowerBound(e);t>=this.count||this.ts[t]!==e||!Number.isNaN(this.vs[t])||(this.ts.copyWithin(t,t+1,this.count),this.vs.copyWithin(t,t+1,this.count),this.count--)}prune(e){const t=this.upperBound(e)-1;t>0&&this.dropOldest(t)}insertAt(e,t,i){let o=e;if(this.count===this.ts.length)if(this.count<512)this.grow();else{if(0===o)return;this.dropOldest(1),o--}o<this.count&&(this.ts.copyWithin(o+1,o,this.count),this.vs.copyWithin(o+1,o,this.count)),this.ts[o]=t,this.vs[o]=i,this.count++}grow(){const e=Math.min(512,2*this.ts.length),t=new Float64Array(e),i=new Float64Array(e);t.set(this.ts.subarray(0,this.count)),i.set(this.vs.subarray(0,this.count)),this.ts=t,this.vs=i}dropOldest(e){this.ts.copyWithin(0,e,this.count),this.vs.copyWithin(0,e,this.count),this.count-=e}lowerBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<e?t=o+1:i=o}return t}upperBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<=e?t=o+1:i=o}return t}}class pe{constructor(e){this.series=new Map,this.gaps=[],this.windowMs=Number.isFinite(e)&&e>0?e:0}push(e,t,i){let o=this.series.get(e);void 0===o&&(o=new ue,this.series.set(e,o)),o.push(t,i)}markGap(e,t=e){if(!Number.isFinite(e))return;const i=new Map;for(const[t,o]of this.series){const n=o.has(e)?e+1:e;o.push(n,null),i.set(t,n)}this.gaps.push({t:e,markedAt:t,at:i})}healGaps(e,t){const i=new Set(t),o=[];for(const t of this.gaps)if(t.markedAt>e)o.push(t);else{for(const[e,o]of t.at)i.has(e)&&(this.series.get(e)?.removeGap(o),t.at.delete(e));t.at.size>0&&o.push(t)}this.gaps=o}mean(e,t,i){const o=this.series.get(e);return void 0===o?null:o.mean(i-t,i)}status(e){const t=e-this.windowMs;let i,o=this.series.size>0;for(const e of this.series.values()){const n=e.oldest();void 0!==n?((void 0===i||n>i)&&(i=n),n>t&&(o=!1)):o=!1}return void 0===i?{complete:!1}:{complete:o,since:i}}prune(e){const t=e-this.windowMs;for(const e of this.series.values())e.prune(t);this.gaps=this.gaps.filter(e=>e.t>=t)}sampleCount(e){return this.series.get(e)?.length??0}}function me(e){if("string"!=typeof e)return null;const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}function fe(e){if(null===e||"object"!=typeof e)return null;const{s:t,lu:i}=e;return"number"==typeof i&&Number.isFinite(i)?{t:Math.round(1e3*i),v:me(t)}:null}async function ge(e,t,i,o=5e3){const n={};if(0===t.length)return n;const s=Date.now(),r=s-6e4*i,a=e.callWS({type:"history/history_during_period",start_time:new Date(r).toISOString(),end_time:new Date(s).toISOString(),entity_ids:t,minimal_response:!0,no_attributes:!0});let l;const c=new Promise((e,n)=>{l=setTimeout(()=>{n(new Error(`EnerLens: history/history_during_period did not answer within ${o} ms (${t.length} entities, ${i} min) - falling back to live buffering`))},o)});let d;try{d=await Promise.race([a,c])}finally{void 0!==l&&clearTimeout(l)}if(null===d||"object"!=typeof d)return n;const h=d;for(const e of t){const t=h[e];if(!Array.isArray(t))continue;const i=[];for(const e of t){const t=fe(e);null!==t&&i.push(t)}i.sort((e,t)=>e.t-t.t),n[e]=i}return n}function _e(e){if(void 0===e||""===e.trim())return;const t=Number(e);return Number.isFinite(t)?t:void 0}function we(e){const t=new Set;for(const i of e)for(const e of Object.values(i.indicators?.slots??{}))t.add(e.entity);return[...t]}class ye{constructor(){this.known=new Map,this.asked=new Set}observe(e,t){for(const i of we(t)){const t=e.states[i],o=_e(t?.state);if(void 0!==o){const e=Date.parse(t?.last_updated||t?.last_changed||""),n=t?.attributes?.unit_of_measurement;this.known.set(i,{value:o,t:Number.isFinite(e)?e:Date.now(),unit:"string"==typeof n?n:void 0})}}}state(e,t){const i=e.states[t],o=_e(i?.state),n=i?.attributes?.unit_of_measurement;if(void 0!==o)return{value:o,stale:!1,unit:"string"==typeof n?n:void 0};const s=this.known.get(t);return s?{value:s.value,stale:!0,since:s.t,unit:s.unit}:{stale:!1}}missing(e,t){return we(t).filter(t=>!this.asked.has(t)&&!this.known.has(t)&&void 0===_e(e.states[t]?.state))}async prefill(e,t,i=5e3){if(0===t.length)return;for(const e of t)this.asked.add(e);const o=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(o-864e6).toISOString(),end_time:new Date(o).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0});let s;n.catch(()=>{});const r=new Promise((e,t)=>{s=setTimeout(()=>t(new Error("EnerLens: charge history timed out")),i)});let a;try{a=await Promise.race([n,r])}finally{void 0!==s&&clearTimeout(s)}if(null!==a&&"object"==typeof a)for(const e of t){const t=a[e];if(!Array.isArray(t))continue;let i;for(const e of t){const t="string"==typeof e.s?_e(e.s):void 0,o="number"==typeof e.lc?e.lc:e.lu;if(void 0===t||"number"!=typeof o)continue;const n=1e3*o;(!i||n>i.t)&&(i={value:t,t:n})}i&&!this.known.has(e)&&this.known.set(e,i)}}}const be={solar:"var(--energy-solar-color, #ff9800)",house:"var(--primary-color)",grid_import:"var(--energy-grid-consumption-color, #488fc2)",grid_export:"var(--energy-grid-return-color, #8353d1)",battery_charge:"var(--energy-battery-in-color, #f06292)",battery_discharge:"var(--energy-battery-out-color, #4db6ac)",rest:"#7d7d7d"},ve=Object.freeze([{at:0,color:"#e53935"},{at:50,color:"#fdd835"},{at:100,color:"#43a047"}]),xe=Object.freeze(["#7e57c2","#26a69a","#ec407a","#8d6e63","#5c6bc0","#ffca28","#66bb6a","#78909c","#ab47bc","#29b6f6"]),ke=/^#([\da-f])([\da-f])([\da-f])$/i,$e=/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,Se=/^rgba?\(([^)]*)\)$/i;function Ae(e){const t=e.trim(),i=ke.exec(t);if(i){const[,e,t,o]=i;return{r:Number.parseInt(e+e,16),g:Number.parseInt(t+t,16),b:Number.parseInt(o+o,16),a:1}}const o=$e.exec(t);if(o){const[,e,t,i]=o;return{r:Number.parseInt(e,16),g:Number.parseInt(t,16),b:Number.parseInt(i,16),a:1}}const n=Se.exec(t);if(n){const e=n[1].replace(/\//g," ").split(/[\s,]+/).filter(Boolean).map(Number);return e.length<3||e.some(e=>!Number.isFinite(e))?null:{r:e[0],g:e[1],b:e[2],a:e.length>3?e[3]:1}}return null}function Me(e,t,i){if(0===t.length)return"";const o=[...t].sort((e,t)=>e.at-t.at);if(1===o.length||!Number.isFinite(e))return o[0].color;let n=0;for(;n<o.length-2&&o[n+1].at<=e;)n++;const s=o[n],r=o[n+1],a=r.at-s.at,l=0===a?0:Math.min(1,Math.max(0,(e-s.at)/a));if(l<=0)return s.color;if(l>=1)return r.color;const c=Ae(i?i(s.color):s.color),d=Ae(i?i(r.color):r.color);return c&&d?function({r:e,g:t,b:i,a:o}){const n=e=>Math.min(255,Math.max(0,Math.round(e))),s=`${n(e)}, ${n(t)}, ${n(i)}`;return o>=1?`rgb(${s})`:`rgba(${s}, ${o})`}(function(e,t,i){return{r:e.r+(t.r-e.r)*i,g:e.g+(t.g-e.g)*i,b:e.b+(t.b-e.b)*i,a:e.a+(t.a-e.a)*i}}(c,d,l)):l<.5?s.color:r.color}function Ee(e){const t=/^var\((--[^,)]+)/.exec(e.trim());if(!t||"undefined"==typeof getComputedStyle)return e;return getComputedStyle(document.documentElement).getPropertyValue(t[1]).trim()||e}function Ce(e,t){const i=e.trim();if(""===i)return null;const o=(t?Ae(t(i)):null)??Ae(i);if(o){const e=e=>Math.min(255,Math.max(0,Math.round(e))).toString(16).padStart(2,"0");return`#${e(o.r)}${e(o.g)}${e(o.b)}`}const n=function(e){const t=/^var\(\s*--[^,)]+,([\s\S]+)\)$/.exec(e.trim()),i=t?.[1].trim();return i||null}(i);return n?Ce(n,t):null}function ze(e,t=0){const i=Ae(e);if(!i)return{h:t,s:0,v:0};const o=i.r/255,n=i.g/255,s=i.b/255,r=Math.max(o,n,s),a=r-Math.min(o,n,s);let l=t;return a>0&&(l=r===o?(n-s)/a%6*60:r===n?60*((s-o)/a+2):60*((o-n)/a+4)),{h:(l+360)%360,s:0===r?0:a/r,v:r}}function We({h:e,s:t,v:i}){const o=(e%360+360)%360,n=Math.min(1,Math.max(0,t)),s=Math.min(1,Math.max(0,i)),r=s*n,a=r*(1-Math.abs(o/60%2-1)),l=s-r,c=Math.floor(o/60)%6,[d,h,u]=[[r,a,0],[a,r,0],[0,r,a],[0,a,r],[a,0,r],[r,0,a]][c],p=e=>Math.round(255*(e+l)).toString(16).padStart(2,"0");return`#${p(d)}${p(h)}${p(u)}`}function Pe({h:e,s:t,v:i}){const o=i*(1-t/2),n=Math.min(o,1-o);return{h:e,s:0===n?0:(i-o)/n,l:o}}function Ne({h:e,s:t,l:i}){const o=i+t*Math.min(i,1-i);return{h:e,s:0===o?0:2*(1-i/o),v:o}}function Fe(e,t){return"direction"===e.colors.arrows?e.colors[t]:"grid_import"===t||"battery_discharge"===t?"var(--error-color, #db4437)":"var(--success-color, #43a047)"}const Le={en:{node:{solar:"Solar",grid:"Grid",house:"House",battery:"Battery",grid_import:"Grid · import",grid_export:"Grid · export",battery_charging:"Battery · charging",battery_discharging:"Battery · discharging",derived_suffix:"· calculated",derived_alone:"calculated",partial:"without {names}",no_grid:"no grid"},list:{rest:"Other",title:"Consumers",show_all:"Show every consumer, even without power",filter_on:"Show active consumers only",charge_label:"State of charge",charge:"{label} {value}",charge_stale:"{label} {value} · as of {time}",charge_unknown:"{label} unknown",indicator_now:"{text} · now"},view:{now:"Now",average:"Ø {minutes} min",off_in_period:"Averages only apply to the kW view",since:"since {time}",chip:"View: {mode}, next: {next}"},energy:{today:"Today","24h":"24 h",week:"Week","7d":"7 days",month:"Month","30d":"30 days",from:"{period} from {date}",chip:"Energy: {mode}, next: {next}",filled:"{percent} of the time filled in from neighbouring values",since:"Statistics only from {date}",none:"No statistics",rest:"Includes filled-in, later or missing consumer values",late:"Statistics only from {date}; the period counts from then",no_statistics:"Energy mode: not every main sensor (solar, grid, battery, house) has long-term statistics; the card stays with power.",fixed:"Energy: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} must be a mapping.",string:"{field} must be a non-empty text.",boolean:"{field} must be true or false.",number:"{field} must be a number.",list:"{field} must be a list.",non_empty:"{field} must not be empty.",enum:"{field} must be one of: {allowed}.",min:"{field} must be at least {min}.",positive:"{field} must be greater than 0.",missing_entities:"{field} is missing: at least three of the four balance quantities must be configured as sensors.",mixed_form:"{field}: use either an entity id, the entity/invert form, the two-entity form or derived - not a mixture.",two_derived:"Only one balance quantity may be derived; {field} would be the second one.",soc_without_battery:"{field} has no effect without entities.battery and is ignored.",soc_stops:"{field} needs at least two stops in ascending order, the first at 0 and the last at 100.",soc_stop_entry:"{field} needs a numeric at value and a colour.",consumer_entity:"{field} has no entity and is skipped.",duplicate_consumer:"{field}: entity {entity} is listed more than once; the later entry is skipped.",solar_house:'{field}: only "excluded" (not part of the house value) is allowed; the value is ignored.',pv_scale:'{field}: "% kWp" needs kwp on every source, "100%" at least two sources; the card uses what is possible.',unknown_key:"Unknown option {field} - ignored.",order_fixed:"{first} must be less than {second} - {second} was raised to {value}.",clamped:"{field} must be between {min} and {max} - {value} is used.",grid_status_no_outage:"{field} needs an entity and at least one outage state - without them the grid status is ignored.",empty_choice:"{field}: an empty list counts as not set; the default applies.",energy_derived:"{field}: the energy mode does not work with a derived grid or battery; it stays off.",charge_no_soc:"{field} has no soc entity and is ignored.",charge_no_plugged:"{field}: show plugged needs a plugged entity - listed by power instead.",condition_incomplete:"{field} needs an entity, an operator and a value - shown by power until then.",condition_number:"{field}: {operator} compares with exactly one number - the condition is never met.",unknown_type:"{field}: unknown type - the entry is skipped.",rest_twice:"{field}: a further rest entry - only the first one is used.",rest_not_here:"{field} does not apply to the rest and is ignored.",rest_both:"{field} and the rest entry both set this - the entry is used.",show_twice:"{field}: show and charge.show are both set - show is used, charge.show ignored.",extra_no_entity:"{field} has no entity and is ignored.",not_for_node:"{field} does not exist for this node and is ignored.",rounded:"{field}: whole numbers only - rounded to {value}.",order_used:"{field}: to keep the order, the card uses {value}.",clamped_min:"{field} must be at least {min} - {value} is used.",unknown_value:"{field}: unknown value, allowed are {allowed} - the card uses the default.",indicator_no_entity:"{field} has no entity and is ignored.",idle_value_missing:"{field}: idle_value {slot} is not configured - the value column shows the power.",indicators_twice:"{field}: indicators and charge are both set - indicators is used, charge ignored."}},editor:{title:"Title",entities:"Main entities",solar:"Solar power",grid:"Grid power",house:"House consumption",battery:"Battery power",battery_soc:"State of charge",consumers:"Consumers",entity:"Entity",name:"Name",color:"Colour",display:"Display",max_consumers:"Maximum consumers",min_consumer_w:"Minimum power (W)",update_interval_s:"Update interval (seconds)",rest_label:"Label for the remainder",list_enabled:"Show list",list_always_below:"List always below",ring_enabled:"Show consumer ring",ring_animation:"Consumer ring animation",ring_overtake:"Overtake",ring_fade:"Cross-fade colours",ring_jump:"Jump",view:"View",mode_current:"Current",mode_short:"Short average",mode_long:"Long average",avg_short_minutes:"Short window (minutes)",avg_long_minutes:"Long window (minutes)",energy_periods:"Available values",energy_today:"Today",energy_24h:"24 h",energy_week:"Week",energy_7d:"7 days",energy_month:"Month",energy_30d:"30 days",flow:"Flows",inactive_lines:"Lines without flow",lines_show:"Show",lines_dim:"Dim",lines_hide:"Hide",animation:"Motion",anim_auto:"Follow system setting",anim_on:"Always",anim_off:"Off",design:"Look of the dots",design_none:"Plain dots",dot_size:"Dot size",line_width:"Line width",invert:"Flip sign",source_entity:"One entity",source_split_grid:"Two entities (import / export)",source_split_battery:"Two entities (discharge / charge)",source_derived:"Derived from the other quantities",source_none:"No battery",grid_import:"Import",grid_export:"Export",battery_discharge:"Discharge",battery_charge:"Charge",colors:"Colours",icons:"Icons",color_solar:"Solar",color_house:"House",color_grid_import:"Grid · import",color_grid_export:"Grid · export",color_battery_charge:"Battery · charging",color_battery_discharge:"Battery · discharging",color_rest:"Remainder",color_reset:"Reset to default",color_default:"Default",color_css:"CSS",color_pick:"Pick a colour",color_hue:"Hue",color_sv:"Saturation and brightness",color_hex:"Hex value",color_mode:"Notation",color_used:"Used in this card",colors_consumers:"Consumers",colors_soc:"State of charge",yaml_only:"Only editable in YAML - the values there are not in a form this editor can show.",color_at:"At percent",color_remove:"Remove stop",color_add_stop:"Add stop",min_w:"Minimum power (W)",icon:"Icon",peak_w:"System peak power (W)",flow_fine:"Fine-tune the motion",slow_below_w:"Speed up from (W)",more_dots_above_w:"More dots from (W)",max_dots_at_w:"All dots from (W)",max_dots:"Maximum dots",slow_s:"Resting pace (seconds per lap)",fast_s:"Full speed (seconds per lap)",full_speed_w:"Full speed from (W)",power_unit:"Show power in",power_kw:"Kilowatts (kW)",power_w:"Watts (W), whole numbers",power_decimals:"Decimals (kW)",grid_status_section:"Grid outage (optional)",grid_status:"Grid status entity",grid_status_outage:"States that mean: no grid",grid_status_ok:"States that mean: grid is there",layout:"Arrangement",layout_cross:"Cross",layout_square_right:"Square · solar right",layout_square_left:"Square · solar left",layout_triangle:"Triangle · house centre",layout_triangle_battery:"Triangle · battery centre",flow_lines:"Line form",lines_curved:"Curved",lines_straight:"Straight",appearance:"Card appearance",appearance_auto:"Follow the theme",appearance_light:"Light",appearance_dark:"Dark",rest:"Remainder",dot_color:"Colour of the dots",colors_dots:"Dots",dot_color_follow:"Dots in the colour of their line",colors_arrows:"Arrows",arrow_colors_red_green:"Arrows red/green: import and discharge red, export and charge green (otherwise in their direction's colour) - in energy mode and the detail window",power_auto:"Automatic",power_digits:"Significant digits",consumer_add:"Add consumer",consumer_new:"New consumer",consumer_remove:"Remove consumer",charge:"State of charge",consumer_show:"Show in the list",consumer_up:"Move up",consumer_down:"Move down",nodes:"Main entities: labels & extra values",node_show_name:"Show name",node_show_state:"Show state word",node_inside_entity:"Extra value in the circle",node_inside_position:"Position in the circle",node_inside_decimals:"Digits",node_inside_size:"Size",node_inside_weight:"Font weight",node_label_entity:"Extra value with the label",node_label_prefix:"Prefix",node_label_decimals:"Digits",node_label_size:"Size",node_label_weight:"Font weight",position_above:"above the icon",position_below:"below the value",decimals_ha:"As in Home Assistant",decimals_0:"0 decimals",decimals_1:"1 decimal",decimals_2:"2 decimals",decimals_3:"3 decimals",decimals_sig2:"2 significant digits",decimals_sig3:"3 significant digits",decimals_sig4:"4 significant digits",weight_normal:"normal",weight_medium:"medium",weight_bold:"bold",colors_extras:"Extra values",color_extra_inside:"{node} · in the circle",color_extra_label:"{node} · with the label",colors_hint:"Colours are set further down, in the group “Colours”.",group_smoothing:"Smoothing",group_energy:"Power/energy",group_scope:"List scope",modes:"Available values",scope:"Available values",energy_power:"Power",scope_filtered:"Filtered",scope_full:"Complete",quick_buttons:"Quick buttons",note_min:"At least {min}.",note_max:"At most {max}.",note_integer:"Whole numbers only.",note_order:"The order is wrong.",note_order_avg_short_minutes:"The short window must be shorter than the long one.",note_order_avg_long_minutes:"The long window must be longer than the short one.",note_order_fast_s:"The fast cycle must be shorter than the slow one.",note_order_slow_s:"The slow cycle must be longer than the fast one.",note_order_min_w:"Must lie below the thresholds for the dots.",note_order_slow_below_w:"The thresholds must grow from top to bottom.",note_order_more_dots_above_w:"The thresholds must grow from top to bottom.",note_order_max_dots_at_w:"The thresholds must grow from top to bottom.",note_order_full_speed_w:"Must be above the threshold for slow dots.",source_sources:"Several sources (one per inverter)",solar_sources:"PV sources",source_add:"Add source",source_remove:"Remove source",pv_source_entity:"Entity",pv_source_name:"Name",pv_source_kwp:"Peak power (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Not part of the house value",list_solar:"PV rows in the list",ring_solar:"Show PV ring",group_pv_scale:"PV scale",pv_scales:"Values offered",pv_scale_share:"100%",pv_scale_peak:"% kWp",group_quick_style:"All quick buttons",quick_style:"Style",quick_style_segment:"Segment buttons",quick_style_segment_compact:"Segment buttons, compact",quick_style_single:"Single buttons",expanded_modes:"Expand",expanded_energy_periods:"Expand",expanded_pv_scales:"Expand",expanded_scope:"Expand",consumer_position:"Position in the list",position_sorted:"By power",position_top:"Top",position_bottom:"Bottom",show_power:"By power (default)",show_always:"Always",show_condition:"Condition",condition_entity:"Sensor",condition_operator:"Operator",condition_values:"Value(s)",condition_number:"Value",consumer_display:"Display",highlight_bold:"Bold",highlight_band:"Colour band",operator_0:"equal to",operator_1:"not equal to",operator_2:"greater than",operator_3:"less than",operator_4:"at least",operator_5:"at most",indicators:"Indicators",indicator_ring:"Ring",indicator_bar_top:"Bar at the top",indicator_bar_bottom:"Bar at the bottom",indicator_fill:"Fill",indicator_entity:"Entity",indicator_label_ring:"Label",indicator_label_other:"Label",indicator_min:"Min",indicator_max:"Max",idle_value:"Show without power",idle_power:"Power",in_energy:"Show in the energy mode too",highlight:"Highlight",incomplete:"{name}: not completely chosen yet.",held:"{message} The preview shows the last valid state; nothing is written until this is completed.",rest_entry:"Rest – what the listed consumers do not explain",entry_ignored:"Skipped by the card (only one rest entry counts, unknown types none)."},editor_help:{min_consumer_w:"Consumers below this power are hidden and counted towards the remainder. Default: 10 W.",max_consumers:"Only the strongest consumers are listed; the rest are counted together. Empty = all (default).",update_interval_s:"How often the list reorders. The figures themselves update immediately. Default: 5 seconds.",rest_label:'Name for the part that is not measured individually. Default: "Other".',design:"How the travelling dots look. “Plain dots” is a circle and nothing else; the others give it a lighter core and, depending on the design, a glow. Speed and the number of dots follow the power, not the design. Default: plain dots.",dot_size:"100 % is the size of the dots on a card with large nodes. Smaller cards - the list beside the drawing, a phone - take somewhat smaller dots on their own. Default: 100 %.",line_width:"100 % is 3 px for the connections and 2 px for the lines to the list on a card with large nodes. Smaller cards take somewhat thinner lines on their own. Default: 100 %.",avg_short_minutes:"Window for the short average. Default: 2.",avg_long_minutes:"Window for the long average. Default: 15.",energy_periods:"What the quick button offers: power, and energy over a period worked out from the statistics of the power sensors. Several ticked: each tap steps on. One ticked: fixed, no button. Default: power, today, 24 h, week – but only when solar, grid, battery and house have statistics, otherwise power alone. Grid and battery with two sensors show both directions; with one signed sensor the grid shows its balance and the battery no figure.",energy_periods_locked:"Not available with a derived grid or battery.",inactive_lines:'Connections with nothing flowing on them. "Hide" calms the picture at night. Default: show.',animation:'"Follow system setting" respects the device\'s reduce-motion preference - that lives in the operating system, not in Home Assistant. Default: follow system setting.',ring_animation:"How the consumer ring follows a reordered list. “Overtake”: every segment travels to its new place, one moving forward passes on an inner lane. “Cross-fade colours”: the places stay, their colours blend into the new order. “Jump”: no motion, new values show at once. With Motion off the ring always jumps. Default: overtake.",battery_soc:"State of charge in percent. Never averaged.",color:"Any CSS value, e.g. #7e57c2 or var(--primary-color). Empty = automatic.",solar:"Positive = production. If the sensor reports production as negative, flip the sign.",grid:"Positive = import from the grid, negative = export. If your sensor has it the other way round, flip the sign.",house:'Total consumption of the house. Without a sensor of its own, choose "Derived".',battery:"Positive = discharging, negative = charging (Home Assistant's convention). If your sensor has it the other way round, flip the sign.",grid_import:"Import only, as a magnitude ≥ 0.",grid_export:"Export only, as a magnitude ≥ 0.",battery_discharge:"Discharging only, as a magnitude ≥ 0.",battery_charge:"Charging from all sources, as a magnitude ≥ 0.",derived:"Calculated from the other three quantities so the balance adds up. Only one quantity can be derived.",min_w:"From this power on a connection counts as active: dots move, grid and battery show their state. Below it everything is neutral. Default: 10 W.",icon_battery:"Empty = icon follows the state of charge.",peak_w:"One value for the whole motion: at this power the most dots run at their fastest. The three thresholds below derive from it (1/12, 1/3, 1/1) while they are empty. Default 6000 W.",flow_fine:"Only needed when the peak power alone does not do. A set value overrides the one derived from the peak. If the order is wrong, the card raises the second value and says so in the browser console.",slow_below_w:"Below this a single dot runs at resting pace. From here on it gets faster. Default: peak / 12.",more_dots_above_w:"From here on more dots join, independent of the speed. Default: peak / 3.",max_dots_at_w:"From here on as many dots as allowed. In between: more and more dots. Default: peak.",slow_s:"One lap when little is flowing. Default 5.",fast_s:"One lap when a lot is flowing. Default 1.8.",max_dots:"How many dots a connection carries at most. Default 5.",full_speed_w:"From here on the dot runs as fast as it gets. In between: one dot, getting faster. Default: same as “More dots from”.",power_unit:"Kilowatts, watts or automatic. “Automatic” picks per value: whole watts below 1000 W, kilowatts above - otherwise a 30 W consumer reads as “0.0 kW”. Default: kilowatts.",power_decimals:"Kilowatts only; watts are always whole numbers. Default 2.",grid_status:"Only if your installation reports an outage - many do not. Without it the card shows no outage; everything else works.",grid_status_outage:"Required. Every integration names its states differently, so nothing is guessed here. Enter the raw state, not the label Home Assistant shows: an enum sensor displays a translated name, so “Not detected” may really be `not_detected`. Picking from the list avoids the question.",grid_status_ok:"Optional. Left empty, the entity's own options minus the outage states count as \\u201cgrid is there\\u201d; anything else, including unavailable, leaves the last state standing.",layout:"Where the four nodes stand. With Square · solar left the PV rows stand left of the drawing and the consumers right of it; on a card too narrow for that, both lists go below. Default: Cross.",flow_lines:"How the connections between the nodes run. Default: curved for the cross, straight for the other arrangements.",appearance:"Shows this one card light or dark – whatever the theme says, and without touching the rest of the dashboard. It also settles which of its two value sets a flow design takes. “Follow the theme” reads the ground, which works nearly always – but not for themes that paint no card background of their own. Light and dark use Home Assistant's default colours, not those of a custom theme.",icon_rest:"Empty = a plain dot.",dot_color:"Empty = each dot carries the colour of its flow, which is what shows where the energy comes from. A colour here applies to every dot on the card; the lines keep theirs.",power_digits:"How much the number says, not how many places follow the point. With 3: 1.23 kW · 12.3 kW · 123 kW. A decimal place means something different at 1.23 kW than at 123 kW; this keeps what the figure tells constant. Watts are always whole. Default: 3.",consumers_list:"Unfold to edit, drag by the handle to sort. The colour is under “Colours”.",consumer_min_w:"Overrides the global minimum power - say 50 W for a heat pump, so its standby does not count as a consumer.",consumer_show:"From its minimum power a consumer is always listed. 'Always' or a condition keep it there as well, even at 0 W - a wallbox while the car is plugged in, say. Held rows count towards the maximum number of consumers.",node_show_state:"Without the state word only the colour tells export from import, charging from discharging.",node_inside_entity:"Any entity. The circle only has room for a number and its unit. Always shows the current state, also in the average views.",node_label_entity:"Any entity, right next to the circle. Always shows the current state, also in the average views.",node_label_prefix:'Free text in front of the value, e.g. "Self-sufficiency".',node_inside_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_label_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_inside_size:"In percent of the node value.",node_label_size:"In percent of the label (12 px).",node_inside_position:"Above the icon the value sits where the battery shows its charge, and tapping it opens its own history. Below the value, tapping opens the node's entity.",modes:"What the quick button offers: now, the short and the long average. Several ticked: each tap steps on. One ticked: fixed, no button. Default: all three.",modes_locked:"Averages exist for power only. Tick “Power” under “Quick button power/energy” to set the smoothing. Until then the card always shows the current reading.",scope:"What the quick button offers: the filtered consumer list or every consumer. Several ticked: each tap switches. One ticked: fixed, no button. Default: both.",list_enabled:"Default: on when consumers are set.",ring_enabled:"Ring of the consumers at the house. Default: on when consumers are set.",list_always_below:"Keeps the list under the drawing even when there is room beside it. Default: off.",quick_buttons:"The buttons in the card's header. For each, what it offers: several values – each tap steps on; one value – fixed, no button.",solar_sources:"Every inverter or string with a sensor of its own; the PV is their sum. A source's colour can be set in YAML (color), otherwise orange tones.",pv_source_kwp:'Needed on every source for the "% kWp" scale. Default: none.',pv_source_excluded:"For sources feeding in past the inverter (balcony plant): their power is added to the measured house value. Default: off.",list_solar:"Shows each source as a row above the consumers, with a fan of its own. Default: off.",ring_solar:"Ring of the sources at the PV node. Default: on.",pv_scales:'What the quick button offers: "100%" - the ring shows each source\'s share and is always full; "% kWp" - the power relative to peak power. Several ticked: each tap switches. One ticked: fixed, no button. Default: both, as far as possible.',pv_scale_peak_locked:'"% kWp" needs the peak power (kWp) of every source. Enter it under "PV sources" to choose this scale.',pv_scale_share_locked:'"100%" needs at least two sources - with one the ring would always be full.',quick_style:'How the quick buttons look. "Segment buttons, compact" also makes the cycling buttons flatter; "Single buttons" shows with expanded quick buttons. Default: segment buttons.',expanded_modes:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_energy_periods:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_pv_scales:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_scope:"Filtered and Complete as two buttons instead of one filter button. Default: off.",consumer_position:"Top/bottom gives a consumer a fixed position in the list. With several consumers at the top/bottom, the order of the consumer list here in the editor decides as well.",condition_values:"One or more states; = means 'is one of them', ≠ 'is none of them'. Numbers are compared as numbers.",condition_number:"One number, in the sensor's unit.",consumers_held_limit:"{held} consumers are shown always or by a condition, the maximum is {limit}. No other consumer appears then.",indicator_label_ring:"Empty: State of charge. Shown in the tooltip and the detail window.",indicator_label_other:"Empty: the entity's name. Shown in the tooltip and the detail window.",indicator_min:"Empty = 0. The value at an empty display.",indicator_max:"Empty = 100. The value at a full display.",idle_value:"What is shown as the value while the consumer is below its minimum power, that is, while it is off. With power, that is, while it is on, the power is always shown there. Useful for a wallbox, say: while it is not charging, the car's state of charge is shown instead of the power.",in_energy:"In the energy mode ring, bars and fill then show the value of now; the value column keeps showing kWh.",rest_min_w:"Below this the rest leaves the list. Empty: the consumers' minimum power. A high value hides power nothing accounts for; the filter button does not lift it.",rest_position:"Only with top/bottom: then its place in this list counts, also among pinned consumers. Otherwise the rest is sorted in by power.",rest_show:'"Always": the rest stays below its minimum power too. Negative, or without a house value, it shows "—". It does not count towards the maximum number of consumers.'},outage:{banner:"Island mode — no grid",label:"Grid status"},example:{banner:"Example values — pick your sensors in the editor"},pv_scale:{share:"100%",peak:"% kWp",share_title:"PV: share of each source, the ring is always full",peak_title:"PV: power relative to peak power",peak_period_title:"PV: mean power over the period relative to peak power",chip:"PV scale: {mode}, next: {next}"},detail:{import:"Import",export:"Export",discharge:"Discharge",charge:"Charge",soc:"State of charge",periods:"Period",open:"{name}: open history","48h":"48 h",mean:"Five-minute mean",aggregation:"5-minute mean · band: lowest to highest reading"}},de:{node:{solar:"PV",grid:"Netz",house:"Haus",battery:"Batterie",grid_import:"Netz · Bezug",grid_export:"Netz · Einspeisung",battery_charging:"Batterie · lädt",battery_discharging:"Batterie · entlädt",derived_suffix:"· berechnet",derived_alone:"berechnet",partial:"ohne {names}",no_grid:"kein Netz"},list:{rest:"Rest",title:"Verbraucher",show_all:"Alle Verbraucher anzeigen, auch ohne Leistung",filter_on:"Nur aktive Verbraucher anzeigen",charge_label:"Ladestand",charge:"{label} {value}",charge_stale:"{label} {value} · Stand {time}",charge_unknown:"{label} unbekannt",indicator_now:"{text} · jetzt"},view:{now:"Jetzt",average:"Ø {minutes} min",off_in_period:"Mittelwerte gibt es nur in der kW-Ansicht",since:"seit {time}",chip:"Ansicht: {mode}, weiter zu {next}"},energy:{today:"Heute","24h":"24 h",week:"Woche","7d":"7 Tage",month:"Monat","30d":"30 Tage",from:"{period} ab {date}",chip:"Energie: {mode}, weiter zu {next}",filled:"{percent} der Zeit aus Nachbarwerten ergänzt",since:"Statistik erst ab {date}",none:"Keine Statistik",rest:"Enthält ergänzte, spätere oder fehlende Verbraucherwerte",late:"Statistik erst ab {date}, der Zeitraum zählt ab dann",no_statistics:"Energie-Modus: Nicht alle Hauptsensoren (PV, Netz, Batterie, Haus) haben eine Langzeitstatistik; die Karte bleibt bei der Leistung.",fixed:"Energie: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} muss ein Objekt sein.",string:"{field} muss ein nicht leerer Text sein.",boolean:"{field} muss true oder false sein.",number:"{field} muss eine Zahl sein.",list:"{field} muss eine Liste sein.",non_empty:"{field} darf nicht leer sein.",enum:"{field} muss einer dieser Werte sein: {allowed}.",min:"{field} muss mindestens {min} sein.",positive:"{field} muss größer als 0 sein.",missing_entities:"{field} fehlt: mindestens drei der vier Bilanzgrößen müssen als Sensor angegeben sein.",mixed_form:"{field}: entweder Entitäts-ID, die entity/invert-Form, die Zwei-Entitäten-Form oder derived - keine Mischform.",two_derived:"Nur eine Bilanzgröße darf abgeleitet werden; {field} wäre die zweite.",soc_without_battery:"{field} ist ohne entities.battery wirkungslos und wird ignoriert.",soc_stops:"{field} braucht mindestens zwei Stützstellen in aufsteigender Reihenfolge, die erste bei 0, die letzte bei 100.",soc_stop_entry:"{field} braucht einen numerischen at-Wert und eine Farbe.",consumer_entity:"{field} hat keine entity und wird übersprungen.",duplicate_consumer:"{field}: die Entität {entity} ist mehrfach angegeben; der weitere Eintrag wird übersprungen.",solar_house:"{field}: erlaubt ist nur „excluded“ (nicht im Hauswert enthalten); der Wert wird ignoriert.",pv_scale:"{field}: „% kWp“ braucht kWp an jeder Quelle, „100 %“ mindestens zwei Quellen; die Karte nimmt, was möglich ist.",unknown_key:"Unbekannte Option {field} - wird ignoriert.",order_fixed:"{first} muss kleiner als {second} sein — {second} wurde auf {value} angehoben.",clamped:"{field} muss zwischen {min} und {max} liegen — es wird {value} verwendet.",grid_status_no_outage:"{field} braucht eine Entität und mindestens einen Ausfall-Zustand — ohne beides wird der Netzstatus ignoriert.",empty_choice:"{field}: Eine leere Liste gilt als nicht gesetzt; es gilt der Standard.",energy_derived:"{field}: Der Energie-Modus geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie; er bleibt aus.",charge_no_soc:"{field} hat keine soc-Entität und wird ignoriert.",charge_no_plugged:"{field}: show plugged braucht eine plugged-Entität - stattdessen nach Leistung.",condition_incomplete:"{field} braucht Entität, Operator und Wert - bis dahin wie nach Leistung.",condition_number:"{field}: {operator} vergleicht mit genau einer Zahl - die Bedingung ist nie erfüllt.",unknown_type:"{field}: unbekannter Typ – der Eintrag wird übersprungen.",rest_twice:"{field}: ein weiterer Rest-Eintrag – nur der erste gilt.",rest_not_here:"{field} gibt es beim Rest nicht und wird ignoriert.",rest_both:"{field} und der Rest-Eintrag setzen beide diesen Wert – der Eintrag gilt.",show_twice:"{field}: show und charge.show sind beide gesetzt - show gilt, charge.show wird ignoriert.",extra_no_entity:"{field} hat keine entity und wird ignoriert.",not_for_node:"{field} gibt es bei diesem Knoten nicht und wird ignoriert.",rounded:"{field}: nur ganze Zahlen – gerundet auf {value}.",order_used:"{field}: Wegen der Reihenfolge rechnet die Karte mit {value}.",clamped_min:"{field} muss mindestens {min} sein – verwendet wird {value}.",unknown_value:"{field}: unbekannter Wert, erlaubt sind {allowed} – die Karte nimmt den Standard.",indicator_no_entity:"{field} hat keine Entität und wird ignoriert.",idle_value_missing:"{field}: idle_value {slot} ist nicht eingerichtet - die Wertspalte zeigt die Leistung.",indicators_twice:"{field}: indicators und charge sind beide gesetzt - indicators gilt, charge wird ignoriert."}},editor:{title:"Titel",entities:"Basis-Entitäten",solar:"PV-Leistung",grid:"Netzleistung",house:"Hausverbrauch",battery:"Batterieleistung",battery_soc:"Ladezustand",consumers:"Verbraucher",entity:"Entität",name:"Name",color:"Farbe",display:"Darstellung",max_consumers:"Höchstzahl Verbraucher",min_consumer_w:"Mindestleistung (W)",update_interval_s:"Takt (Sekunden)",rest_label:"Bezeichnung für den Rest",list_enabled:"Liste anzeigen",list_always_below:"Liste immer unten",ring_enabled:"Verbraucher-Ring anzeigen",ring_animation:"Animation des Verbraucher-Rings",ring_overtake:"Überholen",ring_fade:"Farben überblenden",ring_jump:"Springen",view:"Ansicht",mode_current:"Aktuell",mode_short:"Kurzer Mittelwert",mode_long:"Langer Mittelwert",avg_short_minutes:"Kurzes Fenster (Minuten)",avg_long_minutes:"Langes Fenster (Minuten)",energy_periods:"Verfügbare Werte",energy_today:"Heute",energy_24h:"24 h",energy_week:"Woche",energy_7d:"7 Tage",energy_month:"Monat",energy_30d:"30 Tage",flow:"Flüsse",inactive_lines:"Linien ohne Fluss",lines_show:"Anzeigen",lines_dim:"Abschwächen",lines_hide:"Ausblenden",animation:"Bewegung",anim_auto:"Systemeinstellung folgen",anim_on:"Immer",anim_off:"Aus",design:"Aussehen der Punkte",design_none:"Einfache Punkte",dot_size:"Punktgröße",line_width:"Liniendicke",invert:"Vorzeichen umdrehen",source_entity:"Eine Entität",source_split_grid:"Zwei Entitäten (Bezug / Einspeisung)",source_split_battery:"Zwei Entitäten (Entladen / Laden)",source_derived:"Abgeleitet aus den anderen Größen",source_none:"Keine Batterie",grid_import:"Bezug",grid_export:"Einspeisung",battery_discharge:"Entladen",battery_charge:"Laden",colors:"Farben",icons:"Icons",color_solar:"PV",color_house:"Haus",color_grid_import:"Netz · Bezug",color_grid_export:"Netz · Einspeisung",color_battery_charge:"Batterie · lädt",color_battery_discharge:"Batterie · entlädt",color_rest:"Rest",color_reset:"Auf Standard zurücksetzen",color_default:"Standard",color_css:"CSS",color_pick:"Farbe wählen",color_hue:"Farbton",color_sv:"Sättigung und Helligkeit",color_hex:"Hex-Wert",color_mode:"Schreibweise",color_used:"In dieser Karte verwendet",colors_consumers:"Verbraucher",colors_soc:"Ladestand",yaml_only:"Nur im YAML bearbeitbar – die Werte dort haben eine Form, die dieser Editor nicht anzeigen kann.",color_at:"Bei Prozent",color_remove:"Stufe entfernen",color_add_stop:"Stufe hinzufügen",min_w:"Mindestleistung (W)",icon:"Icon",peak_w:"Höchstleistung der Anlage (W)",flow_fine:"Feineinstellung der Bewegung",slow_below_w:"Beschleunigung ab (W)",more_dots_above_w:"Mehr Punkte ab (W)",max_dots_at_w:"Alle Punkte ab (W)",max_dots:"Höchstzahl Punkte",slow_s:"Ruhe-Tempo (Sekunden pro Runde)",fast_s:"Höchsttempo (Sekunden pro Runde)",full_speed_w:"Höchsttempo ab (W)",power_unit:"Leistung anzeigen in",power_kw:"Kilowatt (kW)",power_w:"Watt (W), ganze Zahlen",power_decimals:"Nachkommastellen (kW)",grid_status_section:"Netzausfall (optional)",grid_status:"Entität für den Netzstatus",grid_status_outage:"Zustände, die „kein Netz“ bedeuten",grid_status_ok:"Zustände, die „Netz liegt an“ bedeuten",layout:"Anordnung",layout_cross:"Kreuz",layout_square_right:"Quadrat · PV rechts",layout_square_left:"Quadrat · PV links",layout_triangle:"Dreieck · Haus Mitte",layout_triangle_battery:"Dreieck · Batterie Mitte",flow_lines:"Linienform",lines_curved:"Geschwungen",lines_straight:"Gerade",appearance:"Erscheinungsbild der Karte",appearance_auto:"Wie das Theme",appearance_light:"Hell",appearance_dark:"Dunkel",rest:"Rest",dot_color:"Farbe der Punkte",colors_dots:"Punkte",dot_color_follow:"Punkte in der Farbe ihrer Linie",colors_arrows:"Pfeile",arrow_colors_red_green:"Pfeile rot/grün: Bezug und Entladen rot, Einspeisung und Laden grün (sonst in der Farbe ihrer Richtung) – im Energie-Modus und im Detailfenster",power_auto:"Automatisch",power_digits:"Relevante Stellen",consumer_add:"Verbraucher hinzufügen",consumer_new:"Neuer Verbraucher",consumer_remove:"Verbraucher entfernen",charge:"Ladestand",consumer_show:"In der Liste zeigen",consumer_up:"Nach oben",consumer_down:"Nach unten",nodes:"Basis-Entitäten: Beschriftung & Zusatzwerte",node_show_name:"Name anzeigen",node_show_state:"Zustandswort anzeigen",node_inside_entity:"Zusatzwert im Kreis",node_inside_position:"Lage im Kreis",node_inside_decimals:"Stellen",node_inside_size:"Größe",node_inside_weight:"Schriftstärke",node_label_entity:"Zusatzwert beim Text",node_label_prefix:"Vorsatz",node_label_decimals:"Stellen",node_label_size:"Größe",node_label_weight:"Schriftstärke",position_above:"über dem Icon",position_below:"unter dem Wert",decimals_ha:"Wie in Home Assistant",decimals_0:"0 Nachkommastellen",decimals_1:"1 Nachkommastelle",decimals_2:"2 Nachkommastellen",decimals_3:"3 Nachkommastellen",decimals_sig2:"2 signifikante Stellen",decimals_sig3:"3 signifikante Stellen",decimals_sig4:"4 signifikante Stellen",weight_normal:"normal",weight_medium:"mittel",weight_bold:"fett",colors_extras:"Zusatzwerte",color_extra_inside:"{node} · im Kreis",color_extra_label:"{node} · beim Text",colors_hint:"Die Farben stellst du weiter unten in der Gruppe „Farben“ ein.",group_smoothing:"Glättung",group_energy:"Leistung/Energie",group_scope:"Listenumfang",modes:"Verfügbare Werte",scope:"Verfügbare Werte",energy_power:"Leistung",scope_filtered:"Gefiltert",scope_full:"Vollständig",quick_buttons:"Quick-Buttons",note_min:"Mindestens {min}.",note_max:"Höchstens {max}.",note_integer:"Nur ganze Zahlen.",note_order:"Die Reihenfolge stimmt nicht.",note_order_avg_short_minutes:"Das kurze Fenster muss kürzer sein als das lange.",note_order_avg_long_minutes:"Das lange Fenster muss länger sein als das kurze.",note_order_fast_s:"Die schnelle Umlaufzeit muss kürzer sein als die langsame.",note_order_slow_s:"Die langsame Umlaufzeit muss länger sein als die schnelle.",note_order_min_w:"Muss unter den Schwellen für die Punkte liegen.",note_order_slow_below_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_more_dots_above_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_max_dots_at_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_full_speed_w:"Muss größer sein als die Schwelle für langsame Punkte.",source_sources:"Mehrere Quellen (je Wechselrichter)",solar_sources:"PV-Quellen",source_add:"Quelle hinzufügen",source_remove:"Quelle entfernen",pv_source_entity:"Entität",pv_source_name:"Name",pv_source_kwp:"Spitzenleistung (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Nicht im Hauswert enthalten",list_solar:"PV-Zeilen in der Liste",ring_solar:"PV-Ring anzeigen",group_pv_scale:"PV-Skala",pv_scales:"Verfügbare Werte",pv_scale_share:"100 %",pv_scale_peak:"% kWp",group_quick_style:"Alle Quick-Buttons",quick_style:"Darstellung",quick_style_segment:"Segment-Buttons",quick_style_segment_compact:"Segment-Buttons kompakt",quick_style_single:"Einzel-Buttons",expanded_modes:"Aufklappen",expanded_energy_periods:"Aufklappen",expanded_pv_scales:"Aufklappen",expanded_scope:"Aufklappen",consumer_position:"Position in der Liste",position_sorted:"Nach Leistung",position_top:"Oben",position_bottom:"Unten",show_power:"Nach Leistung (Standard)",show_always:"Immer",show_condition:"Bedingung",condition_entity:"Sensor",condition_operator:"Operator",condition_values:"Wert(e)",condition_number:"Wert",consumer_display:"Darstellung",highlight_bold:"Fett",highlight_band:"Farbband",operator_0:"gleich",operator_1:"ungleich",operator_2:"größer als",operator_3:"kleiner als",operator_4:"größer oder gleich",operator_5:"kleiner oder gleich",indicators:"Zusatzanzeigen",indicator_ring:"Ring",indicator_bar_top:"Balken oben",indicator_bar_bottom:"Balken unten",indicator_fill:"Füllung",indicator_entity:"Entität",indicator_label_ring:"Bezeichnung",indicator_label_other:"Bezeichnung",indicator_min:"Min",indicator_max:"Max",idle_value:"Ohne Leistung zeigen",idle_power:"Leistung",in_energy:"Auch im Energie-Modus zeigen",highlight:"Hervorheben",incomplete:"{name}: noch nicht vollständig ausgewählt.",held:"{message} Die Vorschau zeigt den letzten gültigen Stand; geschrieben wird erst, wenn das ergänzt ist.",rest_entry:"Rest – was die gezeigten Verbraucher nicht erklären",entry_ignored:"Wird von der Karte übersprungen (nur ein Rest-Eintrag zählt, unbekannte Typen gar nicht)."},editor_help:{min_consumer_w:"Verbraucher unterhalb dieser Leistung werden ausgeblendet und zählen zum Rest. Standard: 10 W.",max_consumers:"Nur die stärksten Verbraucher erscheinen; alle weiteren zählen zum Rest. Leer = alle (Standard).",update_interval_s:"Wie oft die Liste neu sortiert wird. Die Werte selbst ändern sich sofort. Standard: 5 Sekunden.",rest_label:"Name für den nicht einzeln gemessenen Anteil. Standard: „Rest“.",design:"Wie die laufenden Punkte aussehen. „Einfache Punkte“ ist ein Kreis ohne alles; die übrigen geben ihm einen hellen Kern und je nach Design ein Glühen. Tempo und Anzahl der Punkte hängen an der Leistung, nicht am Design. Standard: Einfache Punkte.",dot_size:"100 % ist die Größe der Punkte auf einer Karte mit großen Knoten. Kleinere Karten – Liste neben der Zeichnung, Handy – nehmen von sich aus etwas kleinere Punkte. Standard: 100 %.",line_width:"100 % sind 3 px für die Verbindungen und 2 px für die Linien zur Liste, auf einer Karte mit großen Knoten. Kleinere Karten nehmen von sich aus etwas dünnere Linien. Standard: 100 %.",avg_short_minutes:"Zeitraum für den kurzen Mittelwert. Standard: 2.",avg_long_minutes:"Zeitraum für den langen Mittelwert. Standard: 15.",energy_periods:"Was der Quick-Button anbietet: die Leistung und Energie über einen Zeitraum, berechnet aus der Statistik der Leistungssensoren. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: Leistung, Heute, 24 h, Woche – aber nur, wenn PV, Netz, Batterie und Haus eine Statistik haben, sonst nur Leistung. Netz und Batterie mit zwei Sensoren zeigen beide Richtungen; mit einem Sensor mit Vorzeichen zeigt das Netz den Saldo, die Batterie keine Zahl.",energy_periods_locked:"Geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie.",inactive_lines:"Verbindungen, auf denen gerade nichts fließt. „Ausblenden“ beruhigt das Bild nachts. Standard: Anzeigen.",animation:"„Systemeinstellung folgen“ richtet sich nach „Bewegung reduzieren“ des Geräts — das steht im Betriebssystem, nicht in Home Assistant. Standard: Systemeinstellung folgen.",ring_animation:"Wie der Verbraucher-Ring einer umsortierten Liste folgt. „Überholen“: Jedes Segment wandert an seinen neuen Platz, wer nach vorn rückt, überholt auf einer inneren Bahn. „Farben überblenden“: Die Plätze bleiben, ihre Farben blenden in die neue Reihenfolge über. „Springen“: keine Bewegung, neue Werte sind sofort da. Bei Bewegung „Aus“ springt der Ring immer. Standard: Überholen.",battery_soc:"Ladezustand in Prozent. Wird nie gemittelt.",color:"Beliebiger CSS-Wert, z. B. #7e57c2 oder var(--primary-color). Leer = automatisch.",solar:"Positive Werte = Erzeugung. Meldet der Sensor die Erzeugung negativ, Vorzeichen umdrehen.",grid:"Positiv = Bezug aus dem Netz, negativ = Einspeisung. Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",house:"Gesamtverbrauch des Hauses. Ohne eigenen Sensor „Abgeleitet“ wählen.",battery:"Positiv = Entladen, negativ = Laden (Konvention von Home Assistant). Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",grid_import:"Nur der Bezug, als Betrag ≥ 0.",grid_export:"Nur die Einspeisung, als Betrag ≥ 0.",battery_discharge:"Nur das Entladen, als Betrag ≥ 0.",battery_charge:"Nur das Laden aus allen Quellen, als Betrag ≥ 0.",derived:"Wird aus den drei anderen Größen berechnet, damit die Bilanz aufgeht. Nur eine Größe kann abgeleitet sein.",min_w:"Ab dieser Leistung gilt eine Verbindung als aktiv: Punkte laufen, Netz und Batterie zeigen ihren Zustand. Darunter ist alles neutral. Standard: 10 W.",icon_battery:"Leer = Icon folgt dem Ladezustand.",peak_w:"Ein Wert für die ganze Bewegung: Bei dieser Leistung laufen die meisten Punkte am schnellsten. Die drei Schwellen der Feineinstellung ergeben sich daraus (1/12, 1/3, 1/1), solange sie leer sind. Standard 6000 W.",flow_fine:"Nur nötig, wenn die Höchstleistung allein nicht reicht. Ein gesetzter Wert hat Vorrang vor der Ableitung aus der Höchstleistung. Stimmt die Reihenfolge nicht, hebt die Karte den zweiten Wert an und meldet es in der Browser-Konsole.",slow_below_w:"Darunter läuft ein einzelner Punkt im Ruhe-Tempo. Ab hier wird er schneller. Standard: Höchstleistung / 12.",more_dots_above_w:"Ab hier kommen weitere Punkte dazu, unabhängig vom Tempo. Standard: Höchstleistung / 3.",max_dots_at_w:"Ab hier laufen so viele Punkte wie erlaubt. Dazwischen: immer mehr Punkte. Standard: Höchstleistung.",slow_s:"Zeit für eine Runde, wenn wenig fließt. Standard 5.",fast_s:"Zeit für eine Runde, wenn viel fließt. Standard 1,8.",max_dots:"Wie viele Punkte auf einer Verbindung höchstens laufen. Standard 5.",full_speed_w:"Ab hier läuft der Punkt so schnell wie möglich. Dazwischen: ein Punkt, der schneller wird. Standard: wie „Mehr Punkte ab“.",power_unit:"Kilowatt, Watt oder automatisch. „Automatisch“ wählt je Wert: unter 1000 W ganze Watt, darüber Kilowatt — sonst steht ein Verbraucher mit 30 W als „0,0 kW“ da. Standard: Kilowatt.",power_decimals:"Nur bei Kilowatt; Watt werden immer als ganze Zahl gezeigt. Standard 2.",grid_status:"Nur wenn deine Anlage einen Netzausfall meldet — viele tun es nicht. Ohne diese Angabe zeigt die Karte keinen Ausfall an; alles andere funktioniert.",grid_status_outage:"Pflichtangabe. Jede Integration benennt ihre Zustände anders, hier wird nichts geraten. Trage den Rohwert ein, nicht die Anzeige von Home Assistant: Ein Aufzählungssensor zeigt einen übersetzten Namen, aus „Nicht erkannt“ wird also `not_detected`. Wer aus der Liste auswählt, umgeht die Frage.",grid_status_ok:"Optional. Leer gelassen gelten die eigenen Optionen der Entität ohne die Ausfall-Zustände als „Netz liegt an“; alles andere, auch unavailable, lässt den letzten Zustand stehen.",layout:"Wo die vier Knoten stehen. Beim Quadrat · PV links stehen die PV-Zeilen links der Zeichnung, die Verbraucher rechts; ist die Karte dafür zu schmal, stehen beide Listen darunter. Standard: Kreuz.",flow_lines:"Wie die Verbindungen zwischen den Knoten laufen. Standard: geschwungen beim Kreuz, gerade bei den anderen Anordnungen.",appearance:"Zeigt diese eine Karte hell oder dunkel – unabhängig vom Theme und ohne den Rest des Dashboards zu verändern. Es legt zugleich fest, welchen der beiden Wertesätze ein Fluss-Design nimmt. „Wie das Theme“ liest den Untergrund aus; das klappt fast immer, aber nicht bei Themes ohne eigenen Kartenhintergrund. Hell und Dunkel verwenden die Standardfarben von Home Assistant, nicht die eines eigenen Themes.",icon_rest:"Leer = ein schlichter Punkt.",dot_color:"Leer = jeder Punkt hat die Farbe seines Flusses und zeigt damit, woher die Energie kommt. Eine Farbe hier gilt für alle Punkte der Karte; die Linien behalten ihre.",power_digits:"Wie viele Ziffern die Zahl aussagt — nicht wie viele hinter dem Komma stehen. Mit 3: 1,23 kW · 12,3 kW · 123 kW. Eine Nachkommastelle bedeutet bei 1,23 kW etwas anderes als bei 123 kW; die Aussagekraft bleibt so gleich. Watt sind immer ganz. Standard: 3.",consumers_list:"Aufklappen zum Bearbeiten, am Griff ziehen zum Sortieren. Die Farbe steht unter „Farben“.",consumer_min_w:"Überschreibt die globale Mindestleistung – etwa 50 W für eine Wärmepumpe, damit ihr Standby nicht als Verbraucher zählt.",consumer_show:"Ab der Mindestleistung steht ein Verbraucher immer in der Liste. „Immer“ oder eine Bedingung halten ihn zusätzlich, auch bei 0 W – etwa die Wallbox, solange das Auto angesteckt ist. Gehaltene Zeilen zählen zur Höchstzahl Verbraucher.",node_show_state:"Ohne Zustandswort zeigt nur noch die Farbe, ob eingespeist oder bezogen, geladen oder entladen wird.",node_inside_entity:"Eine beliebige Entität. Im Kreis ist nur Platz für Zahl und Einheit. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_entity:"Eine beliebige Entität, direkt am Kreis. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_prefix:"Freier Text vor dem Wert, z. B. „Autarkie“.",node_inside_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_label_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_inside_size:"In Prozent des Knotenwerts.",node_label_size:"In Prozent der Beschriftung (12 px).",node_inside_position:"Über dem Icon steht der Wert dort, wo die Batterie ihren Ladezustand zeigt, und Antippen öffnet seine eigene Historie. Unter dem Wert öffnet Antippen die Entität des Knotens.",modes:"Was der Quick-Button anbietet: Jetzt, kurzer und langer Mittelwert. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: alle drei.",modes_locked:"Mittelwerte gibt es nur für die Leistung. Hake unter „Quick-Button Leistung/Energie“ „Leistung“ an, dann lässt sich die Glättung einstellen. Bis dahin zeigt die Karte immer den Augenblickswert.",scope:"Was der Quick-Button anbietet: die gefilterte Verbraucherliste oder alle Verbraucher. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide.",list_enabled:"Standard: an, wenn Verbraucher eingetragen sind.",ring_enabled:"Ring der Verbraucher am Haus. Standard: an, wenn Verbraucher eingetragen sind.",list_always_below:"Die Liste bleibt unter der Zeichnung, auch wenn daneben Platz wäre. Standard: aus.",quick_buttons:"Die Knöpfe im Kopf der Karte. Je Knopf, was er anbietet: mehrere Werte – jeder Tipp schaltet weiter; ein Wert – fest, ohne Knopf.",solar_sources:"Jeder Wechselrichter oder String mit eigenem Sensor; die PV ist ihre Summe. Die Farbe einer Quelle lässt sich im YAML setzen (color), sonst Orange-Töne.",pv_source_kwp:"Für die Skala „% kWp“ an jeder Quelle nötig. Ohne Angabe: keine.",pv_source_excluded:"Für Quellen, die am Wechselrichter vorbei einspeisen (Balkonkraftwerk): Ihre Leistung wird zum gemessenen Hauswert addiert. Standard: aus.",list_solar:"Zeigt jede Quelle als Zeile über den Verbrauchern, mit eigenem Fächer. Standard: aus.",ring_solar:"Ring der Quellen am PV-Knoten. Standard: an.",pv_scales:"Was der Quick-Button anbietet: „100 %“ – der Ring zeigt den Anteil jeder Quelle und ist immer voll; „% kWp“ – die Leistung im Verhältnis zur Spitzenleistung. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide, soweit möglich.",pv_scale_peak_locked:"„% kWp“ braucht die Spitzenleistung (kWp) an jeder Quelle. Trage sie unter „PV-Quellen“ ein, dann lässt sich die Skala wählen.",pv_scale_share_locked:"„100 %“ braucht mindestens zwei Quellen – mit einer wäre der Ring immer voll.",quick_style:"Wie die Quick-Buttons aussehen. „Segment-Buttons kompakt“ macht auch die Buttons zum Durchschalten flacher; „Einzel-Buttons“ wirkt bei aufgeklappten Quick-Buttons. Standard: Segment-Buttons.",expanded_modes:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_energy_periods:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_pv_scales:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_scope:"Gefiltert und Vollständig als zwei Buttons statt eines Filter-Knopfs. Standard: aus.",consumer_position:"Mit oben/unten kann man einem Verbraucher in der Liste eine feste Position zuordnen. Bei mehreren Verbrauchern mit oben/unten entscheidet zusätzlich die Reihenfolge der Verbraucherliste hier im Editor.",condition_values:"Einer oder mehrere Zustände; = heißt „ist einer davon“, ≠ „ist keiner davon“. Zahlen werden als Zahlen verglichen.",condition_number:"Eine Zahl in der Einheit des Sensors.",consumers_held_limit:"{held} Verbraucher sind immer oder per Bedingung sichtbar, die Höchstzahl ist {limit}. Andere Verbraucher erscheinen dann nicht.",indicator_label_ring:"Leer: Ladestand. Steht im Tooltip und im Detailfenster.",indicator_label_other:"Leer: der Name der Entität. Steht im Tooltip und im Detailfenster.",indicator_min:"Leer = 0. Wert bei leerer Anzeige.",indicator_max:"Leer = 100. Wert bei voller Anzeige.",idle_value:"Was als Wert angezeigt wird, solange der Verbraucher unter seiner Mindestleistung liegt, also aus ist. Mit Leistung, also wenn er an ist, steht dort immer die Leistung. Sinnvoll etwa bei einer Wallbox: Wird nicht geladen, steht statt der Leistung der Ladestand des Autos da.",in_energy:"Im Energie-Modus zeigen Ring, Balken und Füllung dann den aktuellen Wert; die Wertspalte zeigt weiter kWh.",rest_min_w:"Darunter verschwindet der Rest aus der Liste. Leer: die Mindestleistung der Verbraucher. Ein hoher Wert blendet nicht zugeordnete Leistung aus; der Filter-Knopf hebt ihn nicht auf.",rest_position:"Wirkt nur mit oben/unten: dann zählt der Platz in dieser Liste, auch gegenüber angepinnten Verbrauchern. Sonst wird der Rest nach Leistung einsortiert.",rest_show:"„Immer“: Der Rest bleibt auch unter seiner Mindestleistung stehen. Ist er negativ oder fehlt der Hauswert, steht dort „—“. Er zählt nicht zur Höchstzahl der Verbraucher."},outage:{banner:"Inselbetrieb — kein Netz",label:"Netzstatus"},example:{banner:"Beispielwerte — wähle deine Sensoren im Editor"},pv_scale:{share:"100 %",peak:"% kWp",share_title:"PV: Anteil jeder Quelle, der Ring ist immer voll",peak_title:"PV: Leistung im Verhältnis zur Spitzenleistung",peak_period_title:"PV: mittlere Leistung im Zeitraum im Verhältnis zur Spitzenleistung",chip:"PV-Skala: {mode}, weiter: {next}"},detail:{import:"Bezug",export:"Einspeisung",discharge:"Entladen",charge:"Laden",soc:"Ladestand",periods:"Zeitraum",open:"{name}: Verlauf öffnen","48h":"48 h",mean:"5-Minuten-Mittel",aggregation:"5-Minuten-Mittel · Fläche: kleinster bis größter Wert"}}};function Re(e){const t="undefined"!=typeof document?document.documentElement?.lang:void 0;return(e?.language||t||"en").split("-")[0].toLowerCase()}function Oe(e,t){let i=e;for(const e of t.split(".")){if("object"!=typeof i||null===i)return;i=i[e]}return"string"==typeof i?i:void 0}function Te(e,t,i){const o=Re(t),n=Oe(Le[o],e)??Oe(Le.en,e)??e;return i?n.replace(/\{(\w+)\}/g,(e,t)=>t in i?String(i[t]):e):n}const De=new Set(["unavailable","unknown","none",""]),qe=e=>e.trim().toLowerCase();function Ie(e,t,i,o){switch(function(e,t,i){if(void 0===e)return"hold";const o=qe(e);return De.has(o)?"hold":t.outage.includes(o)?"outage":t.ok.length>0?t.ok.includes(o)?"ok":"hold":i&&i.length>0?i.some(e=>qe(e)===o)?"ok":"hold":"ok"}(t,i,o)){case"outage":return!0;case"ok":return!1;default:return e}}function Be(e,t){const i=e.states[t]?.attributes.options;if(Array.isArray(i))return i.filter(e=>"string"==typeof e)}function Ve(e,t){console.warn(Te("error.config.grid_status_no_outage",t,{field:e}))}const He=["ring","bar_top","bar_bottom","fill"];class Ke extends Error{constructor(e,t){super(e),this.field=t,this.name="ConfigError"}}const je="__rest__",Ue=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],Ze={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home"},Qe=["current","avg_short","avg_long"],Ge=["power","today","24h","week","7d","month","30d"],Je=["power","today","24h","week"],Ye=["filtered","full"],Xe=["share","peak"],et=["auto","on","off"],tt=["show","dim","hide"],it=["overtake","fade","jump"],ot=["auto","light","dark"],nt=new Set(["type","title","entities","consumers","min_consumer_w","max_consumers","update_interval_s","list","ring","view","flow","colors","icons","power","appearance","nodes","memory_id","layout"]),st=new Set(["view_layout","layout_options","grid_options","visibility","card_mod"]),rt={positive:"import",negative:"export"},at={positive:"discharge",negative:"charge"};function lt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function ct(e,t,i,o){return new Ke(Te(e,i,{field:t,...o}),t)}function dt(e,t,i){if(!lt(e))throw ct("error.config.object",t,i);return e}function ht(e,t,i){if("string"!=typeof e||""===e.trim())throw ct("error.config.string",t,i);return e}const ut=e=>null==e||"string"==typeof e&&""===e.trim();function pt(e,t,i){if(!ut(e))return ht(e,t,i)}function mt(e,t,i){return ut(e)?{}:dt(e,t,i)}function ft(e,t,i,o){if(ut(e))return i;if("boolean"!=typeof e)throw ct("error.config.boolean",t,o);return e}function gt(e,t,i,o){if(ut(e))return i;if("number"!=typeof e||!Number.isFinite(e))throw ct("error.config.number",t,o);return e}let _t;const wt={min_consumer_w:{min:0},max_consumers:{min:1,integer:!0},update_interval_s:{min:1},"view.avg_short_minutes":{min:1,max:120,integer:!0},"view.avg_long_minutes":{min:2,max:240,integer:!0},"flow.min_w":{min:0},"flow.peak_w":{min:1},"flow.slow_below_w":{min:0},"flow.more_dots_above_w":{min:0},"flow.max_dots_at_w":{min:0},"flow.full_speed_w":{min:0},"flow.max_dots":{min:2,max:10,integer:!0},"flow.slow_s":{min:.1},"flow.fast_s":{min:.1},"flow.dot_size":{min:40,max:150},"flow.line_width":{min:30,max:150},"consumers.min_w":{min:0},"entities.solar.kwp":{min:.01,max:1e4},"nodes.size":{min:60,max:150},"power.decimals":{min:1,max:3,integer:!0},"power.digits":{min:2,max:4,integer:!0}};function yt(e,t,i,o,n=wt[t]){let s=gt(e,t,i,o);n.integer&&!Number.isInteger(s)&&(s=Math.round(s),console.warn(Te("error.config.rounded",o,{field:t,value:s})),_t?.push({field:t,used:s,reason:"integer"}));const{min:r,max:a}=n;if(s<r||void 0!==a&&s>a){const e=s<r?"min":"max";s=s<r?r:a,console.warn(void 0===a?Te("error.config.clamped_min",o,{field:t,min:r,value:s}):Te("error.config.clamped",o,{field:t,min:r,max:a,value:s})),_t?.push({field:t,used:s,reason:e})}return s}function bt(e,t){const i=e.flatMap((e,t)=>e.set?[t]:[]),o=i.map(t=>e[t].value).sort((e,t)=>e-t),n=e.map(e=>e.value);i.forEach((e,t)=>{n[e]=o[t]});for(let t=n.length-1;t>0;t--){if(!e[t].set||e[t-1].set||n[t]>=n[t-1]+e[t].gap)continue;const i=wt[e[t-1].field]?.min??Number.NEGATIVE_INFINITY;n[t]-e[t].gap>=i&&(n[t-1]=n[t]-e[t].gap)}for(let t=1;t<n.length;t++)n[t]<n[t-1]+e[t].gap&&(n[t]=n[t-1]+e[t].gap);const s=e.map((e,t)=>n[t]!==e.value);return e.forEach((e,i)=>{s[i]&&console.warn(Te("error.config.order_used",t,{field:e.field,value:n[i]}))}),s.some(Boolean)&&e.forEach((e,t)=>{(e.set||s[t])&&_t?.push({field:e.field,used:n[t],reason:"order"})}),n}function vt(e,t,i,o,n){if(ut(e))return o;if("string"!=typeof e||!t.includes(e))throw ct("error.config.enum",i,n,{allowed:t.join(", ")});return e}function xt(e,t,i,o,n){return ut(e)?o:"string"==typeof e&&t.includes(e)?e:(console.warn(Te("error.config.unknown_value",n,{field:i,allowed:t.join(", ")})),o)}const kt=["cross","square_right","square_left","triangle","triangle_battery"],$t=["curved","straight"],St=["segment","segment_compact","single"],At=["modes","energy_periods","pv_scales","scope"];function Mt(e,t){if(ut(e))return[];const i=Array.isArray(e)?e:[e],o=[];for(const e of i)"string"==typeof e&&At.includes(e)?o.includes(e)||o.push(e):console.warn(Te("error.config.unknown_value",t,{field:"view.expanded",allowed:At.join(", ")}));return o}function Et(e,t,i,o){if(ut(e))return;if(!Array.isArray(e))throw ct("error.config.list",i,o);for(const n of e)vt(n,t,i,t[0],o);const n=t.filter(t=>e.includes(t));if(0!==n.length)return n;console.warn(Te("error.config.empty_choice",o,{field:i}))}function Ct(e,t,i,o){if(ut(e))return{kind:"absent"};if("string"==typeof e)return"derived"===e?{kind:"derived"}:{kind:"single",entity:e,invert:!1};if(!lt(e))throw ct("error.config.mixed_form",t,o);const n=Object.keys(e),s="entity"in e,r=void 0!==i&&(i.positive in e||i.negative in e);if(s&&r)throw ct("error.config.mixed_form",t,o);if(s){if(n.some(e=>"entity"!==e&&"invert"!==e))throw ct("error.config.mixed_form",t,o);const i=e.entity;if("string"!=typeof i||""===i.trim())throw ct("error.config.mixed_form",t,o);const s=e.invert;if(!ut(s)&&"boolean"!=typeof s)throw ct("error.config.boolean",`${t}.invert`,o);return{kind:"single",entity:i,invert:!0===s}}if(i&&r){if(n.some(e=>e!==i.positive&&e!==i.negative))throw ct("error.config.mixed_form",t,o);const s=e[i.positive],r=e[i.negative];if("string"!=typeof s||""===s.trim()||"string"!=typeof r||""===r.trim())throw ct("error.config.mixed_form",t,o);return{kind:"split",positive:s,negative:r}}throw ct("error.config.mixed_form",t,o)}function zt(e,t,i){if(ut(e))return[];if(!Array.isArray(e))throw ct("error.config.list",t,i);const o=[];for(const n of e){if(ut(n))continue;if("string"!=typeof n)throw ct("error.config.string",t,i);const e=qe(n);""===e||o.includes(e)||o.push(e)}return o}const Wt=Object.freeze(["#e65100","#ffc107","#ff9800","#ffd54f","#f4511e","#ffb74d"]);function Pt(e,t,i){if("absent"===e.kind)throw ct("error.config.missing_entities",t,i)}const Nt=["solar_inside","solar_label","grid_inside","grid_label","house_inside","house_label","battery_label"];function Ft(e,t){const i=Object.fromEntries(Nt.map(e=>[e,"var(--secondary-text-color)"]));if(!lt(e))return i;for(const o of Nt){const n=pt(e[o],`colors.${o}`,t);n&&(i[o]=n)}return ut(e.battery_inside)||console.warn(Te("error.config.not_for_node",t,{field:"colors.battery_inside"})),i}const Lt=["red_green","direction"];function Rt(e,t){const i={...be,socStops:ve.map(e=>({...e})),consumerPalette:[...xe],arrows:"red_green"},o=mt(e,"colors",t);for(const e of Ue){const n=pt(o[e],`colors.${e}`,t);n&&(i[e]=n)}return i.arrows=xt(o.arrows,Lt,"colors.arrows","red_green",t),ut(o.soc_stops)||(i.socStops=function(e,t){const i="colors.soc_stops";if(!Array.isArray(e))throw ct("error.config.list",i,t);if(e.length<2)throw ct("error.config.soc_stops",i,t);const o=[];for(let n=0;n<e.length;n++){const s=e[n];if(!lt(s)||"number"!=typeof s.at||!Number.isFinite(s.at)||"string"!=typeof s.color||""===s.color.trim())throw ct("error.config.soc_stop_entry",`${i}[${n}]`,t,{index:n});o.push({at:s.at,color:s.color})}for(let e=1;e<o.length;e++)if(o[e].at<o[e-1].at)throw ct("error.config.soc_stops",i,t);if(0!==o[0].at)throw ct("error.config.soc_stops",i,t);if(100!==o[o.length-1].at)throw ct("error.config.soc_stops",i,t);return o}(o.soc_stops,t)),ut(o.consumer_palette)||(i.consumerPalette=function(e,t){const i="colors.consumer_palette";if(!Array.isArray(e))throw ct("error.config.list",i,t);if(0===e.length)throw ct("error.config.non_empty",i,t);return e.map((e,o)=>ht(e,`${i}[${o}]`,t))}(o.consumer_palette,t)),i}const Ot=["kW","W","auto"];function Tt(e,t){const i=mt(e,"power",t);return{unit:vt(i.unit,Ot,"power.unit","kW",t),decimals:yt(i.decimals,"power.decimals",2,t),digits:yt(i.digits,"power.digits",3,t)}}const Dt=["charging","plugged","always"];const qt=/^(binary_sensor|input_boolean)\./,It=["power",...He];function Bt(e,t,i,o){if(ut(e))return;const n=dt(e,i,o),s=pt(n.entity,`${i}.entity`,o);if(s)return{entity:s,min:gt(n.min,`${i}.min`,0,o),max:gt(n.max,`${i}.max`,100,o),label:pt(n.label,`${i}.label`,o),color:"fill"===t?void 0:pt(n.color,`${i}.color`,o)};console.warn(Te("error.config.indicator_no_entity",o,{field:i}))}function Vt(e,t,i){if(ut(e))return;const o=dt(e,t,i),n={};for(const e of He){const s=Bt(o[e],e,`${t}.${e}`,i);s&&(n[e]=s)}let s=vt(o.idle_value,It,`${t}.idle_value`,"power",i);return"power"===s||n[s]||(console.warn(Te("error.config.idle_value_missing",i,{field:t,slot:s})),s="power"),0!==Object.keys(n).length?{slots:n,idleValue:s,inEnergy:ft(o.in_energy,`${t}.in_energy`,!1,i)}:void 0}const Ht=["top","bottom"],Kt=["always","condition"],jt=["=","!=",">","<",">=","<="];function Ut(e){return!0===e?"on":!1===e?"off":"number"==typeof e&&Number.isFinite(e)?String(e):"string"==typeof e&&""!==e.trim()?qe(e):void 0}const Zt=["solar","grid","house","battery"],Qt=["above","below"],Gt=["normal","medium","bold"],Jt=["ha","sig2","sig3","sig4"],Yt=new Set(["show_name","show_state","inside","label"]),Xt={inside:new Set(["entity","position","decimals","size","weight"]),label:new Set(["entity","prefix","decimals","size","weight"])};function ei(e,t,i){if(ut(e))return"ha";if("string"==typeof e&&Jt.includes(e))return e;const o="string"==typeof e&&/^\d$/.test(e)?Number(e):e;if(0===o||1===o||2===o||3===o)return o;throw ct("error.config.enum",t,i,{allowed:"ha, 0, 1, 2, 3, sig2, sig3, sig4"})}function ti(e,t,i,o){for(const n of Object.keys(e))t.has(n)||console.warn(Te("error.config.unknown_key",o,{field:`${i}.${n}`}))}function ii(e,t,i,o){if(ut(e))return;const n=dt(e,i,o);ti(n,Xt[t],i,o);const s="string"==typeof n.entity?n.entity.trim():"";if(!s)return void console.warn(Te("error.config.extra_no_entity",o,{field:i}));const r={entity:s,decimals:ei(n.decimals,`${i}.decimals`,o),size:yt(n.size,`${i}.size`,100,o,wt["nodes.size"]),weight:vt(n.weight,Gt,`${i}.weight`,"normal",o)};if("inside"===t)return{...r,position:vt(n.position,Qt,`${i}.position`,"above",o)};if(!ut(n.prefix)&&"string"!=typeof n.prefix)throw ct("error.config.string",`${i}.prefix`,o);const a="string"==typeof n.prefix?n.prefix.trim():"";return{...r,prefix:a||void 0}}function oi(e,t){const i=Object.fromEntries(Zt.map(e=>[e,{showName:!0,showState:!0}]));if(ut(e))return i;const o=dt(e,"nodes",t);ti(o,new Set(Zt),"nodes",t);for(const e of Zt){if(ut(o[e]))continue;const n=`nodes.${e}`,s=dt(o[e],n,t);ti(s,Yt,n,t);const r=i[e];r.showName=ft(s.show_name,`${n}.show_name`,!0,t);const a=ft(s.show_state,`${n}.show_state`,!0,t);"grid"===e||"battery"===e?r.showState=a:ut(s.show_state)||console.warn(Te("error.config.not_for_node",t,{field:`${n}.show_state`})),"battery"!==e?r.inside=ii(s.inside,"inside",`${n}.inside`,t):ut(s.inside)||console.warn(Te("error.config.not_for_node",t,{field:`${n}.inside`})),r.label=ii(s.label,"label",`${n}.label`,t)}return i}function ni(e,t,i){if(ut(e))return;const o=dt(e,t,i),n=ft(o.bold,`${t}.bold`,!1,i),s=ft(o.band,`${t}.band`,!1,i);return n||s?{bold:n,band:s}:void 0}function si(e,t,i){const{charge:o,hold:n,old:s}=function(e,t,i,o=!1){if(ut(e))return{old:!1};const n=dt(e,t,i),s=pt(n.soc,`${t}.soc`,i);if(!s)return console.warn(Te("error.config.charge_no_soc",i,{field:t})),{old:!1};const r={slots:{ring:{entity:s,min:0,max:100,label:pt(n.label,`${t}.label`,i),percent:!0}},idleValue:"ring",inEnergy:!0},a=!ut(n.show)||!ut(n.plugged)||!ut(n.unplugged);if(o)return{charge:r,old:a};const l=vt(n.show,Dt,`${t}.show`,"charging",i),c=pt(n.plugged,`${t}.plugged`,i);if("always"===l)return{charge:r,hold:{kind:"always"},old:a};if("plugged"!==l)return{charge:r,old:a};if(!c)return console.warn(Te("error.config.charge_no_plugged",i,{field:t})),{charge:r,old:a};const d=qt.test(c)?[]:zt(n.unplugged,`${t}.unplugged`,i);return{charge:r,hold:d.length>0?{kind:"condition",entity:c,operator:"!=",values:d}:{kind:"condition",entity:c,operator:"=",values:["on"]},old:a}}(e.charge,`${t}.charge`,i,!ut(e.show)),r=function(e,t,i){if(ut(e.show))return;if("always"===vt(e.show,Kt,`${t}.show`,"always",i))return{kind:"always"};const o=`${t}.condition`,n=ut(e.condition)?{}:dt(e.condition,o,i),s=pt(n.entity,`${o}.entity`,i),r=ut(n.operator)?void 0:vt(n.operator,jt,`${o}.operator`,"=",i),a=(Array.isArray(n.value)?n.value:[n.value]).filter(e=>!ut(e));if(!s||!r||0===a.length)return void console.warn(Te("error.config.condition_incomplete",i,{field:o}));if("="===r||"!="===r){const e=[];for(const t of a){const i=Ut(t);void 0===i||e.includes(i)||e.push(i)}return 0===e.length?void console.warn(Te("error.config.condition_incomplete",i,{field:o})):{kind:"condition",entity:s,operator:r,values:e}}const l="number"==typeof n.value?n.value:Number(n.value);return Array.isArray(n.value)||"boolean"==typeof n.value||!Number.isFinite(l)?(console.warn(Te("error.config.condition_number",i,{field:o,operator:r})),{kind:"condition",entity:s,operator:r,invalid:!0}):{kind:"condition",entity:s,operator:r,limit:l}}(e,t,i);!ut(e.show)&&s&&console.warn(Te("error.config.show_twice",i,{field:t}));const a=Vt(e.indicators,`${t}.indicators`,i);return!ut(e.indicators)&&o&&console.warn(Te("error.config.indicators_twice",i,{field:t})),{indicators:ut(e.indicators)?o:a,highlight:ni(e.highlight,`${t}.highlight`,i),hold:ut(e.show)?n:r,position:ut(e.position)?void 0:vt(e.position,Ht,`${t}.position`,"top",i)}}function ri(e,t,i,o,n){return void 0===e?t:(o&&console.warn(Te("error.config.rest_both",n,{field:i})),e)}const ai={entities:new Set(["solar","grid","battery","house","battery_soc","grid_status"]),list:new Set(["enabled","title","rest_label","always_below","scope","default_scope","solar"]),ring:new Set(["enabled","animation","solar"]),view:new Set(["default_mode","avg_short_minutes","avg_long_minutes","show_selector","remember","modes","energy_periods","default_energy","pv_scales","default_pv_scale","expanded","quick_style"]),flow:new Set(["min_w","peak_w","slow_below_w","full_speed_w","more_dots_above_w","max_dots_at_w","max_dots","slow_s","fast_s","animation","inactive_lines","design","dot_color","dot_size","line_width","lines"]),colors:new Set([...Ue,...Nt,"battery_inside","arrows","soc_stops","consumer_palette"]),icons:new Set(["solar","grid","house","battery","rest"]),power:new Set(["unit","decimals","digits"])};function li(e,t,i){_t=i;const o=console.warn;i&&(console.warn=()=>{});try{return function(e,t){const i=dt(e,"config",t);if(function(e,t){for(const i of Object.keys(e))nt.has(i)||st.has(i)||console.warn(Te("error.config.unknown_key",t,{field:i}));for(const[i,o]of Object.entries(ai))lt(e[i])&&ti(e[i],o,i,t)}(i,t),ut(i.entities))throw ct("error.config.missing_entities","entities",t);const o=dt(i.entities,"entities",t),n=Array.isArray(o.solar)?function(e,t){const i=new Set,o=[];return e.forEach((e,n)=>{const s=`entities.solar[${n}]`,r="string"==typeof e?{entity:e}:e;if(!lt(r)||"string"!=typeof r.entity||""===r.entity.trim())return void console.warn(Te("error.config.consumer_entity",t,{field:s,index:n}));const a=r.entity.trim();if("derived"===a)throw ct("error.config.mixed_form",s,t);if(i.has(a))return void console.warn(Te("error.config.duplicate_consumer",t,{field:s,entity:a}));i.add(a);const l=r.invert;if(!ut(l)&&"boolean"!=typeof l)throw ct("error.config.boolean",`${s}.invert`,t);const c=pt(r.house,`${s}.house`,t);void 0!==c&&"excluded"!==c&&console.warn(Te("error.config.solar_house",t,{field:`${s}.house`})),o.push({key:a,entity:a,name:pt(r.name,`${s}.name`,t),kwp:ut(r.kwp)?void 0:yt(r.kwp,`${s}.kwp`,1,t,wt["entities.solar.kwp"]),icon:pt(r.icon,`${s}.icon`,t),color:pt(r.color,`${s}.color`,t)??Wt[n%Wt.length],invert:!0===l,excluded:"excluded"===c})}),o}(o.solar,t):[],s=Array.isArray(o.solar)?n.length>0?{kind:"sum"}:{kind:"absent"}:Ct(o.solar,"entities.solar",void 0,t),r=Ct(o.grid,"entities.grid",rt,t),a=Ct(o.battery,"entities.battery",at,t),l=Ct(o.house,"entities.house",void 0,t),c="absent"===l.kind?{kind:"derived"}:l;Pt(s,"entities.solar",t),Pt(r,"entities.grid",t);const d=[["entities.solar",s],["entities.grid",r],["entities.battery",a],["entities.house",c]].filter(([,e])=>"derived"===e.kind).map(([e])=>e);if(d.length>1)throw ct("error.config.two_derived",d[1],t);let h;h=pt(o.battery_soc,"entities.battery_soc",t),void 0!==h&&"absent"===a.kind&&(console.warn(Te("error.config.soc_without_battery",t,{field:"entities.battery_soc"})),h=void 0);const u=function(e,t,i){if(ut(e))return;if("string"==typeof e)return void Ve(t,i);const o=dt(e,t,i),n=ht(o.entity,`${t}.entity`,i),s=zt(o.outage,`${t}.outage`,i),r=zt(o.ok,`${t}.ok`,i);if(0!==s.length)return{entity:n,outage:s,ok:r};Ve(t,i)}(o.grid_status,"entities.grid_status",t),p=Rt(i.colors,t),{consumers:m,rest:f}=function(e,t,i){if(ut(e))return{consumers:[]};if(!Array.isArray(e))throw ct("error.config.list","consumers",i);const o=new Set,n=[];let s,r=0;for(let a=0;a<e.length;a++){const l=e[a],c=`consumers[${a}]`;if(lt(l)&&!ut(l.type)){if("rest"!==l.type){console.warn(Te("error.config.unknown_type",i,{field:`${c}.type`}));continue}r++,s?console.warn(Te("error.config.rest_twice",i,{field:c})):s={entry:l,field:c,after:n.length};continue}if(!lt(l)||"string"!=typeof l.entity||""===l.entity.trim()){console.warn(Te("error.config.consumer_entity",i,{field:c,index:a}));continue}const d=l.entity;o.has(d)?console.warn(Te("error.config.duplicate_consumer",i,{field:c,entity:d})):(o.add(d),n.push({key:d,entity:d,name:pt(l.name,`${c}.name`,i),color:pt(l.color,`${c}.color`,i)??t[(a-r)%t.length],icon:pt(l.icon,`${c}.icon`,i),minW:ut(l.min_w)?void 0:yt(l.min_w,`${c}.min_w`,0,i,wt["consumers.min_w"]),...si(l,c,i)}))}return{consumers:n,rest:s}}(i.consumers,p.consumerPalette,t),g=function(e,t){if(!e)return{rest:{always:!1}};const{entry:i,field:o}=e,n=e=>console.warn(Te("error.config.rest_not_here",t,{field:`${o}.${e}`}));ut(i.entity)||n("entity"),ut(i.charge)||n("charge");let s=!1;ut(i.show)||(s="always"===vt(i.show,Kt,`${o}.show`,"always",t),s||n("show")),ut(i.condition)||n("condition");let r=i.indicators;if(lt(r)&&!ut(r.idle_value)){n("indicators.idle_value");const{idle_value:e,...t}=r;r=t}return{rest:{minW:ut(i.min_w)?void 0:yt(i.min_w,`${o}.min_w`,0,t,wt["consumers.min_w"]),position:ut(i.position)?void 0:vt(i.position,Ht,`${o}.position`,"top",t),always:s,highlight:ni(i.highlight,`${o}.highlight`,t),indicators:Vt(r,`${o}.indicators`,t),order:e.after-.5},name:pt(i.name,`${o}.name`,t),icon:pt(i.icon,`${o}.icon`,t),color:pt(i.color,`${o}.color`,t)}}(f,t),_=lt(i.colors)?i.colors:{},w=lt(i.icons)?i.icons:{};p.rest=ri(g.color,p.rest,"colors.rest",!ut(_.rest),t)??p.rest;const y=function(e,t){const i={...Ze},o=mt(e,"icons",t);for(const e of["solar","grid","house","battery","rest"]){const n=pt(o[e],`icons.${e}`,t);n&&(i[e]=n)}return i}(i.icons,t),b=ri(g.icon,y.rest,"icons.rest",!ut(w.rest),t);b&&(y.rest=b);const v=yt(i.min_consumer_w,"min_consumer_w",10,t),x=ut(i.max_consumers)?Number.POSITIVE_INFINITY:yt(i.max_consumers,"max_consumers",1,t),k=yt(i.update_interval_s,"update_interval_s",5,t),$=mt(i.list,"list",t),S=mt(i.ring,"ring",t),A=m.length>0,M=mt(i.view,"view",t),[E,C]=bt([{field:"view.avg_short_minutes",value:yt(M.avg_short_minutes,"view.avg_short_minutes",2,t),set:!ut(M.avg_short_minutes),gap:0},{field:"view.avg_long_minutes",value:yt(M.avg_long_minutes,"view.avg_long_minutes",15,t),set:!ut(M.avg_long_minutes),gap:1}],t),z=mt(i.flow,"flow",t),W=yt(z.min_w,"flow.min_w",10,t),P=yt(z.peak_w,"flow.peak_w",6e3,t),N=yt(z.max_dots,"flow.max_dots",5,t),F=[["flow.min_w",W,z.min_w,0],["flow.slow_below_w",P/12,z.slow_below_w,0],["flow.more_dots_above_w",P/3,z.more_dots_above_w,1],["flow.max_dots_at_w",P,z.max_dots_at_w,1]].map(([e,i,o,n])=>({field:e,value:"flow.min_w"===e?W:yt(o,e,i,t),set:!ut(o),gap:n})),[L,R,O,T]=bt(F,t),[D,q]=bt([{field:"flow.fast_s",value:yt(z.fast_s,"flow.fast_s",1.8,t),set:!ut(z.fast_s),gap:0},{field:"flow.slow_s",value:yt(z.slow_s,"flow.slow_s",5,t),set:!ut(z.slow_s),gap:1}],t);let I=O;ut(z.full_speed_w)||(I=yt(z.full_speed_w,"flow.full_speed_w",O,t),I<=R&&(I=R+1,console.warn(Te("error.config.order_used",t,{field:"flow.full_speed_w",value:I})),_t?.push({field:"flow.full_speed_w",used:I,reason:"order"})));const B=xt(i.layout,kt,"layout","cross",t),V=function(e,t,i,o,n,s){const r=!ft(e.show_selector,"view.show_selector",!0,s),a=vt(e.default_mode,Qe,"view.default_mode","current",s),l=vt(e.default_energy,Ge,"view.default_energy","power",s),c=vt(t.default_scope,Ye,"list.default_scope","filtered",s);let d=Et(e.modes,Qe,"view.modes",s)??(r?[a]:[...Qe]);const h="view.energy_periods";let u=Et(e.energy_periods,Ge,h,s);const p=void 0===u&&!r;u??=r?[l]:[...Je],!u.some(e=>"power"!==e)||"derived"!==i.kind&&"derived"!==o.kind||(console.warn(Te("error.config.energy_derived",s,{field:h})),u=["power"]);const m=u.includes("power");m||(d=["current"]);const f=Et(t.scope,Ye,"list.scope",s)??(r?[c]:[...Ye]),g=vt(e.default_pv_scale,Xe,"view.default_pv_scale","share",s),_=n.sources,w=Xe.filter(e=>"share"===e?_.length>1:_.length>0&&_.every(e=>void 0!==e.kwp)),y=Et(e.pv_scales,Xe,"view.pv_scales",s)??(r?[g]:[...Xe]);let b=n.ring?y.filter(e=>w.includes(e)):[];return n.ring&&0===b.length&&w.length>0&&(console.warn(Te("error.config.pv_scale",s,{field:"view.pv_scales"})),b=[w[0]]),{modes:d,defaultMode:d.includes(a)?a:d[0],power:m,energyPeriods:u.filter(e=>"power"!==e),energyDefault:p&&u.length>1,defaultEnergy:u.includes(l)?l:u[0],scope:f,defaultScope:f.includes(c)?c:f[0],pvScales:b,defaultPvScale:b.includes(g)?g:b[0]??"share"}}(M,$,r,a,{sources:n,ring:ft(S.solar,"ring.solar",!0,t)},t);return{layout:B,title:pt(i.title,"title",t),memoryId:"number"==typeof i.memory_id?String(i.memory_id):pt(i.memory_id,"memory_id",t),sources:{solar:s,grid:r,battery:a,house:c,batterySoc:h},gridStatus:u,solarSources:n,consumers:m,rest:g.rest,minConsumerW:v,maxConsumers:x,updateIntervalS:k,list:{enabled:ft($.enabled,"list.enabled",A,t),restLabel:ri(g.name,pt($.rest_label,"list.rest_label",t),"list.rest_label",!ut($.rest_label),t),title:pt($.title,"list.title",t),alwaysBelow:ft($.always_below,"list.always_below",!1,t),solar:ft($.solar,"list.solar",!1,t),scope:V.scope,defaultScope:V.defaultScope},ring:{enabled:ft(S.enabled,"ring.enabled",A,t),animation:vt(S.animation,it,"ring.animation","overtake",t),solar:ft(S.solar,"ring.solar",!0,t)},view:{modes:V.modes,defaultMode:V.defaultMode,avgShortMinutes:E,avgLongMinutes:C,remember:ft(M.remember,"view.remember",!0,t),power:V.power,energyPeriods:V.energyPeriods,energyDefault:V.energyDefault,defaultEnergy:V.defaultEnergy,pvScales:V.pvScales,defaultPvScale:V.defaultPvScale,quickStyle:xt(M.quick_style,St,"view.quick_style","segment",t),expanded:Mt(M.expanded,t)},flow:{minW:L,slowBelowW:R,fullSpeedW:I,moreDotsAboveW:O,maxDotsAtW:T,maxDots:N,slowS:q,fastS:D,animation:vt(z.animation,et,"flow.animation","auto",t),design:"string"==typeof z.design&&z.design.trim()?z.design.trim():"none",dotColor:"string"==typeof z.dot_color&&z.dot_color.trim()?z.dot_color.trim():void 0,dotSize:yt(z.dot_size,"flow.dot_size",100,t),lineWidth:yt(z.line_width,"flow.line_width",100,t),lines:xt(z.lines,$t,"flow.lines","cross"===B?"curved":"straight",t),inactiveLines:vt(z.inactive_lines,tt,"flow.inactive_lines","show",t)},appearance:vt(i.appearance,ot,"appearance","auto",t),colors:p,icons:y,nodes:oi(i.nodes,t),extraColors:Ft(i.colors,t),power:Tt(i.power,t),...void 0===i.card_mod?{}:{card_mod:i.card_mod}}}(e,t)}finally{_t=void 0,console.warn=o}}function ci(){const e="abcdefghijklmnopqrstuvwxyz0123456789";return[...crypto.getRandomValues(new Uint8Array(8))].map(t=>e[t%36]).join("")}function di(e){const t=[],i=e=>{if(Array.isArray(e))for(const t of e)i(t);else if(lt(e)){"string"==typeof e.type&&t.push(e);for(const t of["sections","cards","card"])i(e[t])}};return i(e),t}function hi(e){return"number"==typeof e?String(e):"string"==typeof e&&e.trim()?e:void 0}const ui="enerlens-card",pi="enerlens-card-editor",mi="enerlens-card-detail",fi="EnerLens Card",gi={solar:"sensor.solar_power",grid:"sensor.grid_power"},_i={solar:3200,grid:450},wi={solar_battery:"battery_charge",solar_grid:"grid_export",battery_grid:"grid_export",grid_battery:"grid_import",solar_house:"solar",battery_house:"battery_discharge",grid_house:"grid_import"},yi=Object.keys(wi);function bi(e,t,i,o,n,s){let r=e,a=t,l=i,c=o,d=n,h=s;const u={},p=(e,t)=>(t>0&&(u[e]=t),t),m=p("solar_battery",Math.min(r,d));r-=m,d-=m;const f=p("solar_grid",Math.min(r,l));r-=f,l-=f;const g=p("battery_grid",Math.min(c,l));c-=g,l-=g;const _=p("grid_battery",Math.min(a,d));a-=_,d-=_;const w=p("solar_house",Math.min(r,h));r-=w,h-=w;const y=p("battery_house",Math.min(c,h));return c-=y,h-=y,p("grid_house",Math.min(a,h)),u}function vi(e,t){const{minW:i,slowBelowW:o,fullSpeedW:n,moreDotsAboveW:s,maxDotsAtW:r,maxDots:a,slowS:l,fastS:c}=t.flow;if(!Number.isFinite(e)||e<i)return null;let d=l;if(e>=n)d=c;else if(e>o){d=l-(e-o)/(n-o)*(l-c)}let h=1;if(e>=s){const t=(e-s)/(r-s);h=Math.min(a,2+Math.floor(t*(a-2)))}return{count:h,durationS:d}}function xi(e,t){const i=[];for(const o of yi){const n=e[o];if(void 0===n)continue;const s=vi(n,t);s&&i.push({connection:o,w:n,count:s.count,durationS:s.durationS,colorKey:wi[o]})}return i}function ki(e,t,i){const o=[],n=[],s=[],r=new Map,a=new Map;e.consumers.forEach((e,t)=>{r.set(e.key,t),e.position&&a.set(e.key,e.position)}),r.set(je,t.rest?.order??e.consumers.length),t.rest?.position&&a.set(je,t.rest.position);for(const r of e.consumers){if(!r.reading.available&&void 0!==t.energy?.consumers[r.entity]){s.push({key:r.key,name:r.name,w:0,color:r.color,entity:r.entity,icon:r.icon,threshold:r.minW??t.minConsumerW,isRest:!1,powerUnknown:!0,highlight:r.highlight,indicators:r.indicators});continue}const e=!0===r.held;if(!r.reading.available&&!e)continue;const a=r.reading.available?r.reading.w:0,l=r.minW??t.minConsumerW;if(!i&&!e&&a<l)continue;const c={key:r.key,name:r.name,w:a,color:r.color,entity:r.entity,icon:r.icon,threshold:l,isRest:!1,indicators:r.indicators,idle:$i(r,a,l,t)||void 0,powerUnknown:!r.reading.available||void 0,highlight:r.highlight};(e?n:o).push(c)}const l=i?Number.POSITIVE_INFINITY:Math.max(0,t.maxConsumers-n.length),c=n.concat(Mi(o).slice(0,l)),d=function(e,t,i){const o=t.rest?.minW??t.minConsumerW,n=e.house.available?e.house.w-i.reduce((e,t)=>e+t.w,0):void 0,s=void 0!==n&&n>=o;if(!s&&!t.rest?.always)return;const r=void 0!==n&&n>=0;return{key:je,name:t.list.restLabel??"",w:r?n:0,color:t.colors.rest,icon:t.icons.rest,threshold:o,isRest:!0,powerUnknown:!r||void 0,highlight:t.rest?.highlight,indicators:e.rest?.indicators}}(e,t,c);d&&c.push(d);const h=[],u=[],p=[];for(const e of c){const t=a.get(e.key);("top"===t?u:"bottom"===t?p:h).push(e)}const m=(e,t)=>(r.get(e.key)??0)-(r.get(t.key)??0),f=s.filter(e=>!a.has(e.key));for(const e of s){const t=a.get(e.key);"top"===t?u.push(e):"bottom"===t&&p.push(e)}return u.sort(m).concat(Mi(h),p.sort(m),f)}function $i(e,t,i,o){const n=e.indicators;return!(!n||"power"===n.idleValue||o.energy)&&(!e.reading.available||t<i)}function Si(e,t){return(!e.isRest||!e.powerUnknown)&&(e.w>=e.threshold||null!==vi(e.w,t))}function Ai(e,t){const i=e.filter(e=>Si(e,t)),o=i.reduce((e,t)=>e+t.w,0);return i.map(e=>({key:e.key,share:o>0?e.w/o:0,color:e.color,entity:e.entity,isRest:e.isRest}))}function Mi(e){return e.sort((e,t)=>t.w-e.w)}const Ei="none";let Ci=function(e){for(const t of e){const e=t.spur;"number"!=typeof t.shape?.bias&&"number"==typeof e?.bias&&(t.shape.bias=e.bias),"number"!=typeof t.shape?.bias&&(t.shape.bias=0),"number"!=typeof t.shape?.caps&&(t.shape.caps=0);for(const e of[t.dark,t.light])"number"!=typeof e?.line&&(e.line=80)}return e}([{id:"kugeln",name:"Kugeln",name_en:"Orbs",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:0,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:0,glowStrength:45,line:80}},{id:"partylicht",name:"Partylicht",name_en:"Party Light",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:2,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:1,glowStrength:45,line:80}},{id:"leuchtpunkte",name:"Leuchtpunkte",name_en:"Glowing Dots",shape:{caps:5,bias:95},dark:{dot:9,core:20,coreLight:100,glow:2,glowStrength:80,line:80},light:{dot:8,core:20,coreLight:75,glow:2,glowStrength:45,line:80}},{id:"electron",name:"Electron",shape:{caps:5,bias:70},dark:{dot:10,core:40,coreLight:100,glow:0,glowStrength:80,line:80},light:{dot:10,core:40,coreLight:100,glow:0,glowStrength:10,line:80}},{id:"proton",name:"Proton",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:2,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:100,glow:2,glowStrength:30,line:80}},{id:"neutrino",name:"Neutrino",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:0,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:85,glow:0,glowStrength:30,line:80}}]);function zi(e){if(e&&e!==Ei)return Ci.find(t=>t.id===e)}function Wi(e,t){const i=e.name_en?.trim();return i?"de"===Re(t)?e.name:i:e.name}const Pi=36e5,Ni=3e5,Fi=864e5,Li=["solar","import","export","discharge","charge","house"],Ri=new Set(["solar","import","discharge"]),Oi={solar:0,import:0,export:0,discharge:0,charge:0,house:0},Ti=new Map;function Di(e,t){let i=Ti.get(t);i||(i=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),Ti.set(t,i));const o=i.formatToParts(e),n=e=>Number(o.find(t=>t.type===e)?.value??0);return Date.UTC(n("year"),n("month")-1,n("day"),n("hour"),n("minute"),n("second"))-1e3*Math.floor(e/1e3)}function qi(e,t,i,o){const n=Date.UTC(e,t,i),s=n-Di(n,o);return n-Di(s,o)}const Ii={"24h":24,"7d":168,"30d":720};function Bi(e){return void 0!==Ii[e]}function Vi(e,t,i,o){const n=Ii[e];if(void 0!==n){const i="30d"===e?Pi:Ni;return Math.ceil((t-n*Pi)/i)*i}const s=new Date(t+Di(t,i)),r=s.getUTCFullYear(),a=s.getUTCMonth(),l=s.getUTCDate();if("month"===e)return qi(r,a,1,i);if("week"===e){return qi(r,a,l-(s.getUTCDay()-o+7)%7,i)}return qi(r,a,l,i)}function Hi(e,t,i){const o=Di(e,i);if("hour"===t)return e-((e+o)%Pi+Pi)%Pi;const n=new Date(e+o);return qi(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),i)}function Ki(e,t,i,o){if(Bi(e))return i;const n=new Date(t+Di(t,o)),s=n.getUTCFullYear(),r=n.getUTCMonth(),a=n.getUTCDate();return"month"===e?qi(s,r+1,1,o):qi(s,r,a+("week"===e?7:1),o)}function ji(e){return e<=.02?0:e<=.1?1:2}function Ui(e){const t=new Map;for(const i of e??[])null!==i.mean&&Number.isFinite(i.mean)&&t.set(i.start,i.mean);return t}class Zi{constructor(e,t,i){this.hourly=Ui(e),this.fiveMin=Ui(t),this.first=Math.min(...this.hourly.keys(),...this.fiveMin.keys(),i??Number.POSITIVE_INFINITY)}get exists(){return Number.isFinite(this.first)}at(e){if(e.hourly){const t=this.hourly.get(e.start);return void 0===t?void 0:{w:t,filled:!1}}const t=this.fiveMin.get(e.start);if(void 0!==t)return{w:t,filled:!1};const i=this.hourly.get(Math.floor(e.start/Pi)*Pi);return void 0===i?void 0:{w:i,filled:!0}}before(e){const t=Math.floor(e.start/Pi)*Pi-Pi;return e.hourly?this.hourly.get(e.start-Pi):this.fiveMin.get(e.start-Ni)??this.hourly.get(t)}neighbour(e,t){const i=e.hourly?this.hourly:this.fiveMin,o=e=>this.hourly.get(Math.floor(e/Pi)*Pi),n=i.get(e.start-Fi)??(e.hourly?void 0:o(e.start-Fi));if(void 0!==n)return n;if(e.start+Fi>=t)return 0;return i.get(e.start+Fi)??(e.hourly?void 0:o(e.start+Fi))??0}}function Qi(e,t){let i=0,o=0;for(const n of Li)n!==e&&(Ri.has(n)?i+=t[n]:o+=t[n]);return Ri.has(e)?o-i:i-o}class Gi{constructor(){this.own=new Map}add(e,t,i,o){const n=this.own.get(e)??{wh:0,filled:0,ms:0};n.wh+=t,n.ms+=i,o&&(n.filled+=i),this.own.set(e,n)}bars(){return[...this.own.entries()].sort((e,t)=>e[0]-t[0]).map(([e,t])=>({start:e,wh:t.wh,filledShare:t.ms>0?t.filled/t.ms:0}))}}function Ji(e){const t=new Map,i=i=>{let o=t.get(i);return o||(o=new Zi(e.hourly[i],e.fiveMin[i],e.since?.[i]),t.set(i,o)),o},o=Li.filter(t=>void 0!==e.roles[t]),n=["solar","house"].find(t=>void 0===e.roles[t]),s=e.solarSources?.length?e.solarSources.map(e=>({id:e,s:i(e)})):void 0,r=s?.filter(e=>e.s.exists)??[],a=o.filter(t=>"solar"===t&&s?r.length>0:i(e.roles[t]).exists),l=a.length===o.length;let c=Number.NEGATIVE_INFINITY,d=Number.NEGATIVE_INFINITY;const h=o.flatMap(t=>"solar"===t&&s?s.map(e=>e.s):[i(e.roles[t])]);for(const t of[...h,...e.consumers.map(i)]){for(const e of t.hourly.keys())d=Math.max(d,e+Pi);for(const e of t.fiveMin.keys())c=Math.max(c,e+Ni)}c=Math.max(c,d);const u=Math.max(e.from,Math.min(e.to,c)),p=Math.max(e.from,...a.map(t=>"solar"===t&&s?Math.min(...r.map(e=>e.s.first)):i(e.roles[t]).first)),m=Math.min(p,u),f=u-m,g=function(e,t,i){const o=[];let n=e;for(;n<t;)if(n%Pi===0&&n+Pi<=Math.min(t,i))o.push({start:n,end:n+Pi,hourly:!0}),n+=Pi;else{const e=Math.min(t,(Math.floor(n/Ni)+1)*Ni);o.push({start:n,end:e,hourly:!1}),n=e}return o}(m,u,d),_={...Oi},w={...Oi},y=new Map,b=new Map,v={};let x;const k=new Map(r.map(e=>[e.id,{wh:0,filledMs:0,counted:0,last:void 0}]));for(const t of g){const o=(t.end-t.start)/Pi,c={...Oi},d=new Set,h=[];let p=0;for(const n of a){if("solar"===n&&s){let i=0;for(const{id:n,s:s}of r){if(t.start<s.first)continue;const r=k.get(n),a=s.at(t);let l,c=!1;if(a?(l=a.w,c=a.filled):(r.last??s.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?l=0:(l=s.neighbour(t,u),c=!0),r.last=l,e.houseExcluded?.includes(n)&&(p+=l),r.wh+=l*o,r.counted+=t.end-t.start,e.bucketOf){const i=b.get(n)??new Gi;b.set(n,i),i.add(e.bucketOf(t.start),l*o,t.end-t.start,c)}c&&(r.filledMs+=t.end-t.start,d.add("solar")),i+=l}c.solar=i;continue}const a=i(e.roles[n]),l=a.at(t);l?(c[n]=l.w,l.filled&&d.add(n)):"solar"===n&&(x??a.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?c.solar=0:h.push(n)}if(1===h.length&&!n&&l){const e=Qi(h[0],c);c[h[0]]=Math.max(0,"house"===h[0]?e-p:e),d.add(h[0])}else for(const o of h)c[o]=i(e.roles[o]).neighbour(t,u),d.add(o);let m=0;n&&(m=Qi(n,c),c[n]=Math.max(0,m),d.size>0&&d.add(n)),x=c.solar;for(const i of Li){const s=(i===n?m:c[i])*o;if(_[i]+=s,d.has(i)&&(w[i]+=t.end-t.start),e.bucketOf){const o=y.get(i)??new Gi;y.set(i,o),o.add(e.bucketOf(t.start),s,t.end-t.start,d.has(i))}}if(l){const e=bi(c.solar,c.import,c.export,c.discharge,c.charge,c.house);for(const[t,i]of Object.entries(e))v[t]=(v[t]??0)+i*o}}const $={};for(const e of Li){const t=e===n?l:a.includes(e);$[e]=t?{wh:_[e],filledShare:f>0?w[e]/f:0}:null}const S={},A=new Map,M=e.bucketOf;for(const t of e.consumers){const e=M?{buckets:new Gi,of:M}:void 0;S[t]=Yi(i(t),g,m,u,e),e&&S[t]&&A.set(t,e.buckets)}const E=s?Object.fromEntries(s.map(({id:e,s:t})=>{const i=k.get(e);if(!i)return[e,null];const o={wh:i.wh,filledShare:i.counted>0?i.filledMs/i.counted:0};return t.first>m&&(o.since=t.first),[e,o]})):void 0;let C,z;if(e.bucketOf){C={};for(const e of Li)$[e]&&(C[e]=y.get(e)?.bars()??[]);z={};for(const[e,t]of[...b,...A])z[e]=t.bars()}return{from:m,to:u,lateStart:m>e.from,main:$,consumers:S,sources:E,flows:v,bars:C,entityBars:z}}function Yi(e,t,i,o,n){if(!e.exists)return null;let s=0,r=0,a=0;for(const i of t){if(i.start<e.first)continue;const t=e.at(i),l=t?t.w:e.neighbour(i,o);t&&!t.filled||(r+=i.end-i.start),s+=l*(i.end-i.start)/Pi,a+=i.end-i.start,n?.buckets.add(n.of(i.start),l*(i.end-i.start)/Pi,i.end-i.start,!t||t.filled)}const l={wh:s,filledShare:a>0?r/a:0};return e.first>i&&(l.since=e.first),l}const Xi=36e5,eo=864e5;const to="#positive",io="#negative",oo="#pv-sum";function no(e){const t={},i=new Set,o=new Map,n=(e,o)=>{"single"===o.kind&&(t[e]=o.entity,o.invert&&i.add(o.entity))},{solar:s,grid:r,battery:a,house:l}=e.sources;if(n("solar",s),"sum"===s.kind){t.solar=oo;for(const t of e.solarSources)t.invert&&i.add(t.entity)}n("house",l);const c=(e,n,s)=>{if("split"===s.kind)t[e]=s.positive,t[n]=s.negative;else if("single"===s.kind){const r={positive:s.entity+to,negative:s.entity+io};o.set(s.entity,r),t[e]=r.positive,t[n]=r.negative,s.invert&&i.add(s.entity)}};return c("import","export",r),c("discharge","charge",a),{roles:t,inverted:i,signed:o}}function so(e,t){const i=Object.values(e.roles).filter(e=>e!==oo).map(e=>e.endsWith(to)||e.endsWith(io)?e.slice(0,e.lastIndexOf("#")):e),o="sum"===t.sources.solar.kind?t.solarSources.map(e=>e.entity):[];return[...new Set([...i,...o,...t.consumers.map(e=>e.entity)])]}function ro(e){return[...so(no(e),{...e,consumers:[]})].sort()}const ao=new Map;function lo(e,t){const i={...e};for(const[o,n]of t){const t=e[o];t&&(i[n.positive]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(e.mean,0)})),i[n.negative]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(-e.mean,0)})))}return i}function co(e,t,i){const o={};if(!e||"object"!=typeof e)return o;const n=e;for(const e of t){const t=n[e];if(!Array.isArray(t))continue;const s=i.has(e)?-1:1;o[e]=t.flatMap(e=>{const t=e,i="number"==typeof t.start?t.start:Date.parse(String(t.start)),o="number"==typeof t.mean?s*t.mean:null;return Number.isFinite(i)?[{start:i,mean:o}]:[]})}return o}async function ho(e,t,i,o,n,s){let r;const a=new Promise((e,i)=>{r=setTimeout(()=>i(new Error(`EnerLens: statistics (${t}) did not answer within ${n} ms`)),n)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),...void 0!==s?{end_time:new Date(s).toISOString()}:{},statistic_ids:o,period:t,types:["mean"],units:{power:"W"}}),a])}finally{void 0!==r&&clearTimeout(r)}}function uo(e,t){return Bi(e)?0:t}function po(e){const t=e.locale?.first_weekday,i=t?["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(t):-1;if(i>=0)return i;try{const t=new Intl.Locale(e.locale?.language??e.language??"en"),i=(t.getWeekInfo?.()??t.weekInfo)?.firstDay;if(i)return i%7}catch{}return 1}function mo(e){const t=Intl.DateTimeFormat().resolvedOptions().timeZone;return"local"===e.locale?.time_zone?t:e.config?.time_zone??t}function fo(e,t){const i={};for(const[o,n]of Object.entries(e)){const e=Math.min(...n.map(e=>e.start));e<t&&(i[o]=e)}return i}async function go(e,t,i,o=Date.now(),n=1e4){const s=no(t),{roles:r,inverted:a,signed:l}=s,c=so(s,t),d=Vi(i,o,mo(e),po(e)),h=Math.floor(o/Xi)*Xi,u=Math.ceil(d/Xi)*Xi,p=d<u&&d<h-eo,[m,f,g,_]=await Promise.all([ho(e,"hour",d-eo,c,n),ho(e,"5minute",h-eo,c,n),ho(e,"day",d-32*eo,c,n),p?ho(e,"5minute",d,c,n,u):Promise.resolve({})]),w=co(f,c,a);for(const[e,t]of Object.entries(co(_,c,a)))w[e]=[...t,...w[e]??[]];const y=mo(e),b=function(e){return"today"===e||"24h"===e?"hour":"day"}(i),v=Ji({bucketOf:e=>Hi(e,b,y),from:d,to:o,roles:r,consumers:t.consumers.map(e=>e.entity),hourly:lo(co(m,c,a),l),fiveMin:lo(w,l),pvZeroBelowW:t.flow.minW,since:fo(lo(co(g,c,a),l),d-eo),solarSources:r.solar===oo?t.solarSources.map(e=>e.entity):void 0,houseExcluded:t.solarSources.filter(e=>e.excluded).map(e=>e.entity)}),x=function(e,t,i,o,n,s,r=e.from,a=new Map){const l=Math.max((e.to-e.from)/Xi,1/12),c=new Map;for(const[t,n]of Object.entries(i)){const i=e.main[t]?.wh;c.set(n,void 0===i?null:o.has(n)?-i:i)}for(const[t,i]of Object.entries(e.consumers))c.set(t,i?.wh??null);for(const[t,i]of Object.entries(e.sources??{})){const e=i?.wh;c.set(t,void 0===e?null:o.has(t)?-e:e)}for(const[e,t]of a){const i=c.get(t.positive),n=c.get(t.negative),s=null==i||null==n?null:i-n;c.set(e,null===s?null:o.has(e)?-s:s)}const d=e=>{const t=ji(e);return{tier:t,note:t>0?Te("energy.filled",n,{percent:_o(e,n)}):""}},h={};for(const t of Object.keys(e.main)){const i=e.main[t];h[t]=i?d(i.filledShare):{tier:0,note:""}}const u={};let p=h.house?.tier??0;for(const[t,i]of Object.entries(e.consumers)){let e;e=i?void 0!==i.since?{tier:2,note:Te("energy.since",n,{date:wo(i.since,n)})}:d(i.filledShare):{tier:2,note:Te("energy.none",n)},u[t]=e,p=Math.max(p,e.tier),e.tier}if(e.sources){let t={tier:0,note:""};for(const[i,o]of Object.entries(e.sources)){let e;e=o?void 0!==o.since?{tier:2,note:Te("energy.since",n,{date:wo(o.since,n)})}:d(o.filledShare):{tier:2,note:Te("energy.none",n)},u[i]=e,e.tier>t.tier&&(t=e)}h.solar=t}const m={tier:p,note:p>0?Te("energy.rest",n):""},f=!0===i.discharge?.endsWith(to),g={},_=Object.keys(i).every(t=>null!==e.main[t]);if(i.import?.endsWith(to)&&_){const t=t=>Math.max(0,(e.main[t]?.wh??0)/l),i=t("import")-t("export");Object.assign(g,bi(t("solar"),Math.max(i,0),Math.max(-i,0),f?0:t("discharge"),f?0:t("charge"),t("house")))}else if(!i.import?.endsWith(to))for(const[t,i]of Object.entries(e.flows))f&&t.includes("battery")||(g[t]=i/l);return{period:t,from:e.from,to:e.to,lateStart:e.lateStart,hours:l,meanW:e=>{const t=c.get(e);return null==t?null:t/l},flowsW:g,marks:{roles:h,consumers:u,rest:m},fetchedAt:s,start:r}}(v,i,r,a,e,o,uo(i,d),l);return x.detail={step:b,bars:v.bars??{},entityBars:v.entityBars??{},axisFrom:Hi(d,b,y),axisTo:Ki(i,d,o,y)},x}function _o(e,t){return new Intl.NumberFormat(t.locale?.language??t.language,{style:"percent",maximumFractionDigits:0}).format(Math.max(e,.01))}function wo(e,t,i=!1){return new Intl.DateTimeFormat(t.locale?.language??t.language,{timeZone:mo(t),day:"numeric",month:"numeric",...i?{hour:"2-digit",minute:"2-digit"}:{}}).format(e)}function yo(e,t,i,o="kW"){if(!e)return"W"===o?"Watt":"kW";const n=Te(`energy.${e}`,i);return t?.lateStart&&t.period===e?Te("energy.from",i,{period:n,date:wo(t.from,i,"today"===e||"24h"===e)}):n}const bo={unit:"kW",decimals:2,digits:3},vo=new Set(["cs","de","fi","fr","sk","sv"]);function xo(e){return(e??"").split("-")[0].toLowerCase()}function ko(e,t){const i=e=>Math.max(t-1-Math.floor(Math.log10(e)),0),o=Math.abs(e);if(!(o>0))return Math.max(t-1,0);const n=i(o),s=Number(o.toFixed(n));return s>0?Math.min(n,i(s)):n}function $o(e,t,i=bo){if(void 0!==i.energyHours)return So(e*i.energyHours,t);const o="auto"===i.unit?function(e){return Math.round(Math.abs(e))<1e3?"W":"kW"}(e):i.unit,n="W"===o?0:"auto"===i.unit?ko(e/1e3,i.digits):i.decimals,s="W"===o?e:e/1e3;return`${new Intl.NumberFormat(Mo(t),{minimumFractionDigits:n,maximumFractionDigits:n,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(Ao(s,n)?0:s)} ${o}`}function So(e,t){const i=new Intl.NumberFormat(Mo(t),{minimumFractionDigits:1,maximumFractionDigits:1,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}),o=e/1e3;return o>0&&o<.05?`< ${i.format(.1)} kWh`:`${i.format(Ao(o,1)?0:o)} kWh`}function Ao(e,t){return 0===Number(e.toFixed(t))}function Mo(e){switch(e?.locale?.number_format){case"comma_decimal":return["en-US","en"];case"decimal_comma":return["de","es","it"];case"space_comma":return["fr","sv","cs"];case"quote_decimal":return["de-CH"];case"none":return"en-US";case"system":return;default:return e?.locale?.language}}function Eo(e,t){if(!e)return"—";const i=Number(e.state);if(""===e.state.trim()||!Number.isFinite(i))return"—";if(t?.formatEntityState)return t.formatEntityState(e);const o=t?.entities?.[e.entity_id]?.display_precision,n="number"==typeof o?o:e.state.split(".")[1]?.length??0,s=new Intl.NumberFormat(Mo(t),{minimumFractionDigits:n,maximumFractionDigits:n,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(i),r=xo(t?.locale?.language??t?.language);return`${s}${vo.has(r)?" ":""}%`}function Co(e,t,i=Date.now()){const o=new Date(e),n=o.toLocaleTimeString(Mo(t),{hour:"2-digit",minute:"2-digit"});if(o.toDateString()===new Date(i).toDateString())return n;return`${o.toLocaleDateString(Mo(t),{day:"numeric",month:"numeric"})} ${n}`}const zo=new Set(["monetary","duration","timestamp","date"]);function Wo(e,t){return"°"===e?"":"%"===e?vo.has(xo(t?.locale?.language??t?.language))?" ":"":" "}function Po(e,t,i){if(!e||"unavailable"===e.state||"unknown"===e.state)return Te("state.unavailable",t);const o=e.attributes.unit_of_measurement,n=Number(e.state),s=(Boolean(o)||Boolean(e.attributes.state_class))&&""!==e.state.trim()&&Number.isFinite(n),r=zo.has(String(e.attributes.device_class??""));if("ha"===i||!s||r)return t?.formatEntityState?t.formatEntityState(e):o?`${e.state}${Wo(o,t)}${o}`:e.state;const a="number"==typeof i?0:Number(i.slice(3)),l="number"==typeof i?i:ko(n,a),c=l>20?ko(0,a):l,d=new Intl.NumberFormat(Mo(t),{minimumFractionDigits:c,maximumFractionDigits:c,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(Ao(n,c)?0:n);return o?`${d}${Wo(o,t)}${o}`:d}const No=400,Fo=200,Lo=200,Ro=56,Oo={solar:{x:Fo,y:58},grid:{x:58,y:Lo},house:{x:342,y:Lo},battery:{x:Fo,y:342}},To={solar_house:"M200,114 C200,168 232,200 286,200",solar_grid:"M200,114 C200,168 168,200 114,200",solar_battery:"M200,114 L200,286",grid_house:"M114,200 L286,200",grid_battery:"M114,200 C168,200 200,232 200,286",battery_grid:"M114,200 C168,200 200,232 200,286",battery_house:"M200,286 C200,232 232,200 286,200"},Do=["solar_house","solar_grid","solar_battery","grid_house","grid_battery","battery_house"];function qo(e,t,i){const o=e=>Number(e.toFixed(3)),n=`A${o(i)},${o(i)} 0 1 0`;return`M${o(e-i)},${o(t)}${n} ${o(e+i)},${o(t)}${n} ${o(e-i)},${o(t)}Z`}const Io=e=>e.toFixed(2);function Bo(e,t){const i=Math.hypot(t.x-e.x,t.y-e.y)||1;return{x:e.x+(t.x-e.x)/i*Ro,y:e.y+(t.y-e.y)/i*Ro}}function Vo(e,t){const i=Math.SQRT1_2,o=e.x-Fo,n=e.y-Lo;return{x:Fo+o*i-t*n*i,y:Lo+t*o*i+n*i}}function Ho(e,t){return e.replace(/(-?[\d.]+),(-?[\d.]+)/g,(e,i,o)=>{const n=Vo({x:Number(i),y:Number(o)},t);return`${Io(n.x)},${Io(n.y)}`})}const Ko=new Map;function jo(e,t,i){const o=`${e}|${t}|${i}`,n=Ko.get(o);if(n)return n;let s={...Oo},r=400;const a="triangle"===e||"triangle_battery"===e,l="triangle_battery"===e&&i,c=l?"battery":"house";if("square_right"===e||"square_left"===e){const t="square_right"===e?1:-1;s={solar:Vo(Oo.solar,t),grid:Vo(Oo.grid,t),house:Vo(Oo.house,t),battery:Vo(Oo.battery,t)}}else a&&(r=i?560:350,s={solar:{x:305,y:70},house:{x:305,y:l?490:280},battery:{x:305,y:l?280:490},grid:{x:95,y:280}});const d=(e,t)=>function(e,t){const i=Bo(e,t),o=Bo(t,e);return`M${Io(i.x)},${Io(i.y)} L${Io(o.x)},${Io(o.y)}`}(s[e],s[t]);let h;if("cross"===e&&"curved"===t)h={...To};else if("square_right"!==e&&"square_left"!==e||"curved"!==t){const e=a&&"curved"===t,i=e&&!l?Zo(s,"grid","battery",c):d("grid","battery");h={solar_house:l?Uo(s,"house"):d("solar","house"),solar_grid:e?Zo(s,"solar","grid",c):d("solar","grid"),solar_battery:a&&!l?Uo(s,"battery"):d("solar","battery"),grid_house:e&&l?Zo(s,"grid","house",c):d("grid","house"),grid_battery:i,battery_grid:i,battery_house:d("battery","house")}}else{const t="square_right"===e?1:-1;h=Object.fromEntries(Object.entries(To).map(([e,i])=>[e,Ho(i,t)]))}const u=r/2,p=Object.fromEntries(Object.keys(s).map(e=>[e,a?"solar"===e:s[e].y<u-1])),m={layout:e,viewW:No,viewH:r,nodePos:s,paths:h,labelAbove:p,ground:a?c:null};return Ko.set(o,m),m}function Uo(e,t){const i=(e,t,i)=>({x:e.x+-.6*i,y:e.y+.8*t*i}),o=i(e.solar,1,Ro),n=i(e.solar,1,216),s=i(e[t],-1,216),r=i(e[t],-1,Ro);return`M${Io(o.x)},${Io(o.y)} C${Io(n.x)},${Io(n.y)} ${Io(s.x)},${Io(s.y)} ${Io(r.x)},${Io(r.y)}`}function Zo(e,t,i,o){const n=e[t],s=e[i],r=e[o],a=(n.x+s.x)/2,l=(n.y+s.y)/2,c=Math.hypot(a-r.x,l-r.y)||1,d={x:a+(a-r.x)/c*90,y:l+(l-r.y)/c*90},h=Bo(n,d),u=Bo(s,d);return`M${Io(h.x)},${Io(h.y)} Q${Io(d.x)},${Io(d.y)} ${Io(u.x)},${Io(u.y)}`}function Qo(e,t){return`M${-e.viewW},${-e.viewH}H${2*e.viewW}V${2*e.viewH}H${-e.viewW}Z`+Object.values(e.nodePos).map(({x:e,y:i})=>qo(e,i,t)).join("")}const Go=2,Jo=e=>(...t)=>({_$litDirective$:e,values:t});let Yo=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Xo}=re,en=e=>e,tn=()=>document.createComment(""),on=(e,t,i)=>{const o=e._$AA.parentNode,n=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=o.insertBefore(tn(),n),s=o.insertBefore(tn(),n);i=new Xo(t,s,e,e.options)}else{const t=i._$AB.nextSibling,s=i._$AM,r=s!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==s._$AU&&i._$AP(t)}if(t!==n||r){let e=i._$AA;for(;e!==t;){const t=en(e).nextSibling;en(o).insertBefore(e,n),e=t}}}return i},nn=(e,t,i=e)=>(e._$AI(t,i),e),sn={},rn=(e,t=sn)=>e._$AH=t,an=e=>{e._$AR(),e._$AA.remove()},ln=(e,t,i)=>{const o=new Map;for(let n=t;n<=i;n++)o.set(e[n],n);return o},cn=Jo(class extends Yo{constructor(e){if(super(e),e.type!==Go)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let o;void 0===i?i=t:void 0!==t&&(o=t);const n=[],s=[];let r=0;for(const t of e)n[r]=o?o(t,r):r,s[r]=i(t,r),r++;return{values:s,keys:n}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,o]){const n=(e=>e._$AH)(e),{values:s,keys:r}=this.dt(t,i,o);if(!Array.isArray(n))return this.ut=r,s;const a=this.ut??=[],l=[];let c,d,h=0,u=n.length-1,p=0,m=s.length-1;for(;h<=u&&p<=m;)if(null===n[h])h++;else if(null===n[u])u--;else if(a[h]===r[p])l[p]=nn(n[h],s[p]),h++,p++;else if(a[u]===r[m])l[m]=nn(n[u],s[m]),u--,m--;else if(a[h]===r[m])l[m]=nn(n[h],s[m]),on(e,l[m+1],n[h]),h++,m--;else if(a[u]===r[p])l[p]=nn(n[u],s[p]),on(e,n[h],n[u]),u--,p++;else if(void 0===c&&(c=ln(r,p,m),d=ln(a,h,u)),c.has(a[h]))if(c.has(a[u])){const t=d.get(r[p]),i=void 0!==t?n[t]:null;if(null===i){const t=on(e,n[h]);nn(t,s[p]),l[p]=t}else l[p]=nn(i,s[p]),on(e,n[h],i),n[t]=null;p++}else an(n[u]),u--;else an(n[h]),h++;for(;p<=m;){const t=on(e,l[m+1]);nn(t,s[p]),l[p++]=t}for(;h<=u;){const e=n[h++];null!==e&&an(e)}return this.ut=r,rn(e,l),K}});function dn(e,t,i,o="overtake",n=!1,s="share"){const r=e.filter(e=>e.share>0);if(!t||0===r.length)return j;const{r:a,strokeWidth:l}=function(e){const t=100/Math.max(1,e- -11)*11;return{r:50-t/2,strokeWidth:t}}(i),c=2*Math.PI*a,d="peak"===s,h=d?0:.0085*c,u=.014*c,p=r.length>1?r.length*h:0,m=c-p,f=r.map(e=>e.share*m);let g=0;for(const[e,t]of f.entries())t>0&&t<u&&(g+=u-t,f[e]=u);if(g>0){const e=f.indexOf(Math.max(...f));f[e]=Math.max(u,f[e]-g)}const _=d?f.reduce((e,t,i)=>r[i].isRest?e:e+t,0):0;let w=d?-_/2:0;const y=r.map((e,t)=>{const i={segment:e,index:t,length:f[t],offset:w};return w+=i.length+(r.length>1?h:0),i}),b="fade"===o;return b||y.sort((e,t)=>e.segment.key<t.segment.key?-1:e.segment.key>t.segment.key?1:0),V`<svg class="ring ${b&&n?"fade":""}" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${cn(y,e=>b?d&&e.segment.isRest?`fade-${e.segment.key}`:`slot-${e.index}`:e.segment.key,e=>H`<circle
        class="ring-seg"
        data-key=${e.segment.key}
        data-index=${e.index}
        r=${a.toFixed(2)}
        cx="50"
        cy="50"
        stroke-width=${l.toFixed(2)}
        stroke=${e.segment.color}
        data-length=${e.length.toFixed(2)}
        data-offset=${e.offset.toFixed(2)}
        data-circ=${c.toFixed(2)}
        data-gap=${(r.length>1?h:0).toFixed(2)}
      ></circle>`)}</g>
  </svg>`}const hn=15.8,un={now:()=>performance.now(),frame:e=>requestAnimationFrame(()=>e()),cancel:e=>cancelAnimationFrame(e)};class pn{constructor(e=("function"==typeof requestAnimationFrame?un:void 0)){this.clock=e,this.drawn=new WeakMap,this.shownAt=new WeakMap,this.shown=[],this.lane=.8,this.last=0}update(e,t,i){const o=[...e.querySelectorAll("svg.ring circle.ring-seg")].map(e=>({el:e,index:Number(e.dataset.index),len:Number(e.dataset.length),off:Number(e.dataset.offset),circ:Number(e.dataset.circ),gap:Number(e.dataset.gap??0)})).sort((e,t)=>e.index-t.index);this.lane=function(e){const t=e/2,i=(t-5.5-2)/(t+5.5);return Math.min(.85,Math.max(.6,i))}(i);const n=o.filter(e=>this.drawn.has(e.el)),s=[...n].sort((e,t)=>(this.shownAt.get(e.el)??0)-(this.shownAt.get(t.el)??0)),r=new Map(s.map((e,t)=>[e.el,t])),a=new Map(n.map((e,t)=>[e.el,t]));for(const e of o)this.shownAt.set(e.el,e.index);this.shown=o.map(e=>e.el);const l=n.some(e=>this.drawn.get(e.el)?.circ!==e.circ);if(!t||!this.clock||0===n.length||l){for(const e of o)this.drawn.set(e.el,{len:mn(e.len),off:mn(e.off),circ:e.circ,gap:e.gap});return void this.halt()}for(const[e,t]of o.entries()){const i=this.drawn.get(t.el);if(!i){this.drawn.set(t.el,this.born(o,e));continue}i.len.to=t.len,i.off.to=t.off,i.gap=t.gap;const s=r.get(t.el)??0,l=a.get(t.el)??0,c=n.filter(e=>(r.get(e.el)??0)<s&&(a.get(e.el)??0)>l).map(e=>e.el),d=(i.dive?.passing??[]).filter(e=>a.has(e)&&(a.get(e)??0)>l&&!c.includes(e));if(c.length+d.length>0){const e=i.dive?.scale??{x:1,v:-(1-this.lane)*hn,to:this.lane};e.to=this.lane,i.dive={passing:[...c,...d],scale:e}}else i.dive&&(i.dive.passing=[])}this.draw();this.shown.some(e=>{const t=this.drawn.get(e);return!(void 0===t||gn(t.len)&&gn(t.off)&&void 0===t.dive)})&&this.run()}born(e,t){const i=e[t],o=t>0?this.drawn.get(e[t-1].el):void 0;let n,s=!1;for(let i=1;i<e.length&&!n;i++)n=this.drawn.get(e[(t+i)%e.length].el),s=t+i>=e.length;const r=o?o.off.x+o.len.x:0,a=n?(s?i.circ:0)+n.off.x-r:0,l=o?Math.min(i.gap,Math.max(0,a)):0,c=o?o.off.v+o.len.v:0,d=n?n.off.v:c,h=o?.dive?{passing:[...o.dive.passing],scale:{...o.dive.scale}}:void 0;return{len:{x:0,v:d-c,to:i.len},off:{x:r+l,v:c,to:i.off},circ:i.circ,gap:i.gap,dive:h}}stop(){for(const e of this.shown){const t=this.drawn.get(e);t&&fn(t)}this.halt()}halt(){void 0!==this.pending&&this.clock?.cancel(this.pending),this.pending=void 0;for(const e of this.shown){const t=this.drawn.get(e);t&&(t.dive=void 0)}this.draw()}run(){void 0===this.pending&&this.clock&&(this.last=this.clock.now(),this.pending=this.clock.frame(()=>this.frame()))}frame(){if(this.pending=void 0,!this.clock)return;const e=this.clock.now(),t=Math.min(.25,Math.max(0,(e-this.last)/1e3));this.last=e;let i=!1;for(const e of this.shown){const o=this.drawn.get(e);o&&(_n(o.len,t),_n(o.off,t),gn(o.len)&&gn(o.off)||(i=!0))}if(!i)for(const e of this.shown){const t=this.drawn.get(e);t&&Object.assign(t,{len:mn(t.len.to),off:mn(t.off.to)}),t?.dive&&(t.dive.passing=[])}for(const e of this.shown){const o=this.drawn.get(e);o?.dive&&this.dip(e,o,o.dive,t),o?.dive&&(i=!0)}this.draw(),i&&(this.pending=this.clock.frame(()=>this.frame()))}dip(e,t,i,o){const n=t.off.x+t.len.x;i.passing=i.passing.filter(i=>{const o=this.shown.includes(i)?this.drawn.get(i):void 0;return void 0!==o&&i!==e&&n+t.gap/2-.4>o.off.x}),i.scale.to=i.passing.length>0?this.lane:1,_n(i.scale,o,hn),0===i.passing.length&&gn(i.scale,.001,hn)&&(t.dive=void 0)}draw(){for(const e of this.shown){const t=this.drawn.get(e);if(!t)continue;const i=Math.max(0,Math.min(t.circ,t.len.x)),o=`${i.toFixed(2)} ${(t.circ-i).toFixed(2)}`,n=(-t.off.x).toFixed(2),s=t.dive?t.dive.scale.x.toFixed(3):"",r=`${o}|${n}|${s}`;r!==t.written&&(t.written=r,e.setAttribute("stroke-dasharray",o),e.setAttribute("stroke-dashoffset",n),s?e.setAttribute("transform",`translate(50 50) scale(${s}) translate(-50 -50)`):e.removeAttribute("transform"))}}}function mn(e){return{x:e,v:0,to:e}}function fn(e){e.len=mn(e.len.to),e.off=mn(e.off.to),e.dive=void 0}function gn(e,t=.05,i=3.16){return Math.abs(e.x-e.to)<t&&Math.abs(e.v)<t*i}function _n(e,t,i=3.16){const o=e.x-e.to,n=e.v+i*o,s=Math.exp(-i*t);e.x=e.to+(o+n*t)*s,e.v=(e.v-i*n*t)*s}function wn(e,t){return e.available?e.net>=t?"positive":e.net<=-t?"negative":"none":"none"}function yn(e,t){if(!e.derived)return"negative"===wn(e,t)?e.entityNegative??e.entityPositive:e.entityPositive??e.entityNegative}function bn(e,t){e.dispatchEvent(new CustomEvent("enerlens-detail",{detail:t,bubbles:!0,composed:!0}))}function vn(e,t){e.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}const xn={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home",battery:"mdi:battery"};function kn(e,t){if(t)return t;if(!e.available)return"mdi:battery";const i=10*Math.round(e.w/10);return i<=0?"mdi:battery-outline":i>=100?"mdi:battery":`mdi:battery-${i}`}function $n(e,t,i){if(e&&!t.energy)return Te("node.partial",i,{names:e.join(", ")})}function Sn(e){return e&&e.tier>0?`warn${e.tier}`:""}function An(e,t,i,o){return!e||!e.available||Math.abs(e.net)<o.flow.minW?"var(--el-line)":o.colors[e.net>0?t:i]}function Mn(e,t,i){return e.available?$o(e.w,t,i.power):Te("state.unavailable",t)}const En={normal:400,medium:500,bold:700};function Cn(e,t,i){return`color:${t};font-size:calc(var(${i}) * ${e.size/100});font-weight:${En[e.weight]}`}function zn(e,t,i){const o=e.nodes[t],n=o.label,s=(o.showName?15:0)+(i&&o.showState?15:0)+("derived"===e.sources[t].kind?15:0);return n?s+24+(0===s?8:0):s}function Wn(e,t,i,o,n="solar"===e.key){const s=t.nodes[e.key],[r,...a]=e.label.split(" · "),l=s.showState?a.join(" · "):"",c=s.showName||!0===e.outage,d=e.derived?Te(c?"node.derived_suffix":"node.derived_alone",i):"",h=s.label,u=void 0!==t.energy;let p="";if(h){const n=h.prefix??"",s=Po(i.states[h.entity],i,h.decimals),r=t.extraColors[`${e.key}_label`],a=n?`${n} ${s}`:s;p=V`<button
      class="extra-label extra"
      style=${Cn(h,r,"--el-label-size")+(u?";visibility:hidden":"")}
      tabindex=${u?"-1":"0"}
      aria-hidden=${u?"true":"false"}
      title=${a}
      aria-label=${a}
      @click=${o(h.entity)}
    >${n?V`<span class="extra-prefix">${n}</span> `:""}<span class="extra-value"
        >${s}</span
      ></button>`}if(!(c||l||d||h))return"";const m=V`${c?V`<span class="label-name">${r}</span>`:""}${l?V`<span class="label-state">${l}</span>`:""}${d?V`<span class="label-state derived">${d}</span>`:""}`;return V`<div class="label">${n?V`${m}${p}`:V`${p}${m}`}</div>`}function Pn(e,t,i,o=!1){const n=[];n.push({key:"solar",icon:t.icons.solar??xn.solar,color:e.solar.available&&e.solar.w>0?t.colors.solar:"var(--el-line)",label:Te("node.solar",i),derived:e.solar.derived,value:Mn(e.solar,i,t),available:e.solar.available,entity:e.solar.derived?void 0:e.solar.entity??(1===t.solarSources.length?t.solarSources[0].entity:void 0),detail:e.solar.derived?void 0:"solar",partial:$n(e.solar.missing,t,i)});const s=e.grid,r=wn(s,t.flow.minW),a=o&&void 0!==t.gridStatus;n.push({key:"grid",icon:t.icons.grid??xn.grid,color:a?"var(--el-error)":An(s,"grid_import","grid_export",t),label:Te(a||"none"===r?"node.grid":"positive"===r?"node.grid_import":"node.grid_export",i),derived:s.derived,value:a?Te("node.no_grid",i):s.available?$o(Math.abs(s.net),i,t.power):Te("state.unavailable",i),available:a||s.available,outage:a,partial:$n(s.missing,t,i),entity:a?t.gridStatus?.entity:yn(s,t.flow.minW),detail:a||s.derived?void 0:"grid"}),n.push({key:"house",icon:t.icons.house??xn.house,color:t.colors.house,label:Te("node.house",i),derived:e.house.derived,value:Mn(e.house,i,t),available:e.house.available,entity:e.house.derived?void 0:e.house.entity,partial:$n(e.house.missing,t,i),detail:e.house.derived?void 0:"house"});const l=e.battery;if(l){const o=wn(l,t.flow.minW),s=t.sources.batterySoc,r=s?i.states[s]:void 0;n.push({key:"battery",icon:kn(e.soc,t.icons.battery),color:An(l,"battery_discharge","battery_charge",t),label:Te("positive"===o?"node.battery_discharging":"negative"===o?"node.battery_charging":"node.battery",i),derived:l.derived,value:l.available?$o(Math.abs(l.net),i,t.power):Te("state.unavailable",i),available:l.available,socValue:e.soc.available?Eo(r,i):void 0,socPercent:e.soc.available?Math.max(0,Math.min(100,e.soc.w)):void 0,socFillColor:e.soc.available?Me(e.soc.w,t.colors.socStops,Ee):void 0,entity:yn(l,t.flow.minW),detail:l.derived?void 0:"battery",socEntity:s,partial:$n(l.missing,t,i)})}return t.energy&&function(e,t,i,o){const n=i.energy?.roles??{},s=Fn(i.layout),r=Te("state.unavailable",o),a=(e,t,s,a,l)=>({arrow:e,color:Fe(i,t),text:null===s?r:$o(s,o,i.power),entity:l,mark:n[a]}),l=(e,t,o,n)=>Math.max(e,t)<i.flow.minW?"var(--el-line)":i.colors[e>=t?o:n];for(const r of e){if("solar"===r.key&&(r.mark=n.solar),"house"===r.key&&(r.mark=n.house),"grid"===r.key){const e=t.grid,c=e.available?e.positive:null,d=e.available?e.negative:null;if(r.label=Te("node.grid",o),r.crossed=r.outage,r.outage=!1,r.icon=i.icons.grid??xn.grid,r.color=l(c??0,d??0,"grid_import","grid_export"),"single"===i.sources.grid.kind){const t=e.available?e.net:null,i=(t??0)<0,o=a(i?s.export:s.import,i?"grid_export":"grid_import",null===t?null:Math.abs(t),i?"export":"import",e.entityPositive??e.entityNegative);o.mark=Ln(n.import,n.export),r.detail="grid",r.figures={lower:o},r.entity=o.entity,r.value=o.text;continue}r.detail="grid",r.figures={upper:a(s.import,"grid_import",c,"import",e.entityPositive),lower:a(s.export,"grid_export",d,"export",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}if("battery"===r.key&&t.battery){const e=t.battery,n=e.available?e.positive:null,c=e.available?e.negative:null;if(r.label=Te("node.battery",o),r.color=l(n??0,c??0,"battery_discharge","battery_charge"),r.socValue=void 0,r.socPercent=void 0,r.socEntity=void 0,r.icon=i.icons.battery??"mdi:battery","single"===i.sources.battery.kind){r.noFigure=!0,r.value="",r.entity=e.entityPositive??e.entityNegative;continue}r.detail="battery",r.figures={upper:a(s.discharge,"battery_discharge",n,"discharge",e.entityPositive),lower:a(s.charge,"battery_charge",c,"charge",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}}}(n,e,t,i),n}const Nn={"→":{box:"0 0 18 12",d:"M1.5 6 H16 M12 2.2 L16 6 L12 9.8",shape:"wide"},"←":{box:"0 0 18 12",d:"M16.5 6 H2 M6 2.2 L2 6 L6 9.8",shape:"wide"},"↓":{box:"0 0 12 18",d:"M6 1.5 V16 M2.2 12 L6 16 L9.8 12",shape:"tall"},"↑":{box:"0 0 12 18",d:"M6 16.5 V2 M2.2 6 L6 2 L9.8 6",shape:"tall"},"↘":{box:"0 0 16 16",d:"M2 2 L14 14 M14 7.5 V14 H7.5",shape:"square"},"↖":{box:"0 0 16 16",d:"M14 14 L2 2 M2 8.5 V2 H8.5",shape:"square"},"↗":{box:"0 0 16 16",d:"M2 14 L14 2 M7.5 2 H14 V8.5",shape:"square"},"↙":{box:"0 0 16 16",d:"M14 2 L2 14 M2 7.5 V14 H8.5",shape:"square"}};function Fn(e){switch(e){case"square_right":return{import:"↘",export:"↖",discharge:"↗",charge:"↙"};case"square_left":return{import:"↗",export:"↙",discharge:"↖",charge:"↘"};default:return{import:"→",export:"←",discharge:"↑",charge:"↓"}}}function Ln(e,t){return e?t&&t.tier>e.tier?t:e:t}function Rn(e){const t=Nn[e.arrow]??Nn["→"];return V`<div class="value figure ${Sn(e.mark)}" title=${e.mark?.note??""}>
    <svg
      class="arrow ${"tall"===t.shape?"vertical":"square"===t.shape?"diagonal":""}"
      data-arrow=${e.arrow}
      viewBox=${t.box}
      aria-hidden="true"
      style="color:${e.color}"
    >
      ${H`<path d=${t.d}></path>`}
    </svg>
    ${e.text}
  </div>`}function On(e,t,i,o){return t.nodes[e.key].inside?.position!==o||e.figures?"":function(e,t,i){const o=t.nodes[e.key].inside;if(!o)return V``;const n=t.extraColors[`${e.key}_inside`];return V`<div class="extra-inside extra" style=${Cn(o,n,"--el-value-size")}>${Po(i.states[o.entity],i,o.decimals)}</div>`}(e,t,i)}const Tn=new Set(["solar_battery","grid_battery","battery_house","battery_grid"]);function Dn(e,t,i,o,n=[],s=123,r=!1,a=!1,l=56,c=!1,d){const h=Pn(e,t,i,r),u=jo(t.layout,t.flow.lines,null!==e.battery),p=e.battery?Do:Do.filter(e=>!Tn.has(e)),m=[..."hide"===t.flow.inactiveLines?p.filter(e=>o.has(e)):p].sort((e,t)=>Number(o.has(e))-Number(o.has(t)));return V`
    <div class="cross ${null===e.battery?"no-battery":""}">
      <div class="plot">
        <svg viewBox="0 0 ${u.viewW} ${u.viewH}" aria-hidden="true">
          ${c?H`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${Qo(u,l)}></path>
            </clipPath>
          </defs>`:j}
          <g clip-path=${c?"url(#el-holes)":j}>
          ${m.map(e=>H`<path
                class="link ${o.has(e)?"active":`inactive-${t.flow.inactiveLines}`}"
                style=${o.has(e)?`stroke:${o.get(e)}`:""}
                d=${u.paths[e]}
              ></path>`)}
            <g class="dots"></g>
          </g>
        </svg>
        ${h.map(e=>{const o=function(e,t){const i=e.nodePos[t];return{left:100*i.x/e.viewW+"%",top:100*i.y/e.viewH+"%"}}(u,e.key),r=u.labelAbove[e.key],l=(e,t)=>i=>{t?bn(i.currentTarget,{node:t,entity:e}):e&&vn(i.currentTarget,e)},c=("house"===e.key?n:"solar"===e.key?d?.segments??[]:[]).some(e=>e.share>0);return V`
          <div
            class="node ${e.key} ${c?"has-ring":""} ${r?"label-above":""} ${u.ground===e.key?"label-ground":""} ${e.outage?"outage":""} ${t.energy?"in-period":""}"
            style="left:${o.left};top:${o.top};border-color:${c?"transparent":e.color}"
          >
            ${"house"===e.key?dn(n,n.length>0,s,t.ring.animation,a):""}
            ${"solar"===e.key&&d?dn(d.segments,!0,s,t.ring.animation,a,d.layout):""}
            ${void 0!==e.socPercent?V`<div class="fill-clip">
                    <div
                      class="fill"
                      style="height:${e.socPercent}%;background:${e.socFillColor}"
                    ></div>
                  </div>`:""}
            ${e.socValue?V`<div class="value">${e.socValue}</div>`:""}
            ${e.figures?.upper?Rn(e.figures.upper):""}
            ${On(e,t,i,"above")}
            ${e.outage||e.crossed?V`<div class="icon-cross">
                    <ha-icon
                      .icon=${e.icon}
                      style="color:${e.crossed?"var(--el-error)":e.color}"
                    ></ha-icon>
                    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
                      <path d="M3,3 L21,21"></path>
                      <path d="M21,3 L3,21"></path>
                    </svg>
                  </div>`:V`<ha-icon .icon=${e.icon} style="color:${e.color}"></ha-icon>`}
            ${e.noFigure?"":e.figures?Rn(e.figures.lower):V`<div
                    class="value ${e.available?"":"unavailable"} ${Sn(e.mark)} ${e.partial?"warn2":""}"
                    title=${e.partial??e.mark?.note??""}
                  >${e.value}</div>`}
            ${On(e,t,i,"below")}
            ${r?Wn(e,t,i,l,r):""}
            ${function(e,t,i,o,n="solar"===e.key){const s=t.nodes[e.key],r=s.label?"-2px":"-22px",a=n?r:"-22px",l=n?"-22px":r,c="above"!==s.inside?.position||t.energy?void 0:s.inside,d=e.figures?.upper?.entity?{entity:e.figures.upper.entity,text:e.figures.upper.text}:e.socEntity&&"battery"!==e.detail?{entity:e.socEntity,text:e.socValue??""}:c?{entity:c.entity,text:Po(i.states[c.entity],i,c.decimals)}:void 0;if(d){const t="height:max(44px, calc(50% + 2px))";return V`
      <button
        class="hit upper"
        style=${c&&s.label?`top:${a};bottom:auto;${t};z-index:3`:`top:${a}`}
        aria-label=${`${e.label} ${d.text}`}
        @click=${o(d.entity,e.figures?.upper?e.detail:void 0)}
      ></button>
      <button
        class="hit lower"
        style=${!n&&s.label?`top:auto;bottom:${l};${t}`:`bottom:${l}`}
        aria-label=${e.value?`${e.label} ${e.value}`:e.label}
        @click=${o(e.entity,e.detail)}
        ?disabled=${!e.entity&&!e.detail}
      ></button>
    `}if(!e.entity&&!e.detail)return"";const h=e.socValue?`, ${e.socValue}`:"";return V`<button
    class="hit"
    style="top:${a};bottom:${l}"
    aria-label=${e.value?`${e.label} ${e.value}${h}`:`${e.label}${h}`}
    @click=${o(e.entity,e.detail)}
  ></button>`}(e,t,i,l,r)}
            ${r?"":Wn(e,t,i,l,r)}
          </div>
          `})}
      </div>
    </div>
  `}function qn(e,t,i){if("current"===e)return Te("view.now",i);return Te("view.average",i,{minutes:"avg_short"===e?t.view.avgShortMinutes:t.view.avgLongMinutes})}function In(e,t,i){return"ArrowRight"===e||"ArrowDown"===e?(t+1)%i:"ArrowLeft"===e||"ArrowUp"===e?(t-1+i)%i:"Home"===e?0:"End"===e?i-1:-1}function Bn(e,t,i,o,n,s=!1,r=""){const a=e=>{s||e===o||n(e)};return V`<div
    class="quick-group ${s?"off":""}"
    role="radiogroup"
    data-quick=${e}
    aria-label=${t}
    aria-disabled=${s?"true":"false"}
    title=${s?r:""}
  >
    ${i.map((e,t)=>V`<button
        class="quick-option ${t===o?"selected":""} ${e.late?"late":""}"
        role="radio"
        aria-checked=${t===o?"true":"false"}
        tabindex=${t===(o<0?0:o)?0:-1}
        aria-label=${e.aria}
        title=${s?r:e.title??""}
        @click=${()=>a(t)}
        @keydown=${e=>((e,t)=>{const o=In(e.key,t,i.length);if(o<0)return;if(e.preventDefault(),s)return;const n=e.currentTarget.parentElement;a(o),setTimeout(()=>n?.querySelectorAll('[role="radio"]')[o]?.focus(),0)})(e,t)}
      >
        ${e.label}
      </button>`)}
  </div>`}function Vn(e,t,i,o,n,s,r,a,l,c){const d=e.view.modes.length>1,h=void 0!==a&&e.consumers.length>0&&e.list.scope.length>1,u=void 0!==l&&(l.waiting||l.labels.length>1),p=!0===l?.inPeriod,m=p?u?j:V`<div class="mode-note ${l?.late?"late":""}" title=${l?.title??""}>
          ${Te("energy.fixed",t,{period:l?.active??""})}
        </div>`:d||"current"===o?j:V`<div class="mode-note">${qn(o,e,t)}</div>`,f=u&&!(e.view.expanded.includes("energy_periods")&&l?.waiting);if(!(i||d||f||c||h||m!==j))return j;const g=new Set(e.view.expanded),_=e=>Te(`editor.${e}`,t),w=Te(r?"list.filter_on":"list.show_all",t),y=h?g.has("scope")?Bn("scope",_("group_scope"),[{label:V`<ha-icon .icon=${"mdi:filter-outline"}></ha-icon>`,aria:Te("editor.scope_filtered",t),title:Te("editor.scope_filtered",t)},{label:V`<ha-icon .icon=${"mdi:filter-off-outline"}></ha-icon>`,aria:Te("editor.scope_full",t),title:Te("editor.scope_full",t)}],r?1:0,()=>a?.()):V`<button
        class="filter-toggle ${r?"on":""}"
        aria-pressed=${r?"true":"false"}
        aria-label=${w}
        title=${w}
        @click=${a}
      >
        <ha-icon .icon=${r?"mdi:filter-off-outline":"mdi:filter-outline"}></ha-icon>
      </button>`:j,b=e.view.modes,v=d?g.has("modes")?Bn("modes",_("group_smoothing"),b.map(i=>({label:qn(i,e,t),aria:qn(i,e,t),title:i===o&&n?Te("view.since",t,{time:n}):""})),b.indexOf(o),e=>s(b[e]),p,Te("view.off_in_period",t)):function(e,t,i,o,n,s=!1){const r=e.view.modes,a=r[(r.indexOf(i)+1)%r.length],l=s?Te("view.off_in_period",t):Te("view.chip",t,{mode:qn(i,e,t),next:qn(a,e,t)});return V`<button
    class="mode-chip view-chip"
    aria-disabled=${s?"true":"false"}
    aria-label=${l}
    title=${s?l:o?Te("view.since",t,{time:o}):""}
    @click=${()=>{s||n(a)}}
  >
    ${r.map(o=>V`<span class="mode-label ${o===i?"active":""}" aria-hidden="true"
        >${qn(o,e,t)}</span
      >`)}
  </button>`}(e,t,o,n,s,p):j,x=u&&l?g.has("energy_periods")?l.waiting?j:Bn("energy_periods",_("group_energy"),l.options.map(e=>({label:e.label,aria:e.label,title:e.title,late:e.late})),l.selected,l.onSelect):function(e){const t=e.labels.includes(e.active)?e.labels:[...e.labels,e.active];return e.waiting?V`<button class="mode-chip energy-chip waiting" aria-hidden="true" tabindex="-1">
      ${t.map(t=>V`<span class="mode-label ${t===e.active?"active":""}">${t}</span>`)}
    </button>`:V`<button
    class="mode-chip energy-chip ${e.late?"late":""}"
    aria-label=${e.ariaLabel}
    title=${e.title}
    @click=${e.onCycle}
  >
    ${t.map(t=>V`<span class="mode-label ${t===e.active?"active":""}" aria-hidden="true"
        >${t}</span
      >`)}
  </button>`}(l):j,k=c?g.has("pv_scales")?Bn("pv_scales",_("group_pv_scale"),c.labels.map((e,t)=>({label:e,aria:e,title:c.titles[t]})),c.selected,c.onSelect):V`<button
    class="mode-chip energy-chip pv-scale-chip"
    aria-label=${($=c).ariaLabel}
    title=${$.title}
    @click=${$.onCycle}
  >
    ${$.labels.map(e=>V`<span class="mode-label ${e===$.active?"active":""}" aria-hidden="true"
        >${e}</span
      >`)}
  </button>`:j;var $;return V`
    <div class="header">
      ${i?V`<div class="title">${i}</div>`:V`<span></span>`}
      <div class="controls qs-${e.view.quickStyle.replace("_","-")}">
        ${v}
        ${m}
        ${x}
        ${k}
        ${y}
      </div>
    </div>
  `}const Hn="enerlens-card-gone",Kn="ha-chart-base",jn=5e3,Un=36e5,Zn={today:0,"24h":24,"48h":48,"7d":168},Qn={today:"energy.today","24h":"energy.24h","48h":"detail.48h","7d":"energy.7d"};function Gn(e,t,i,o=[]){if(e.startsWith("consumer:")){const o=t.consumers.find(t=>`consumer:${t.key}`===e),n=o?i?.states?.[o.entity]?.attributes?.friendly_name:void 0,s=o?.name??n??o?.entity??"";return o?{title:s,layout:"single",series:[{entity:o.entity,name:s,color:o.color,sign:1,role:"house"}],extras:Jn(o.indicators,i)}:{title:s,series:[],layout:"single",extras:[]}}if(e.startsWith("source:")){const o=t.solarSources.find(t=>`source:${t.key}`===e),n=o?.name??(o?i?.states?.[o.entity]?.attributes?.friendly_name:void 0)??o?.entity??"";return o?{title:n,layout:"single",series:[{entity:o.entity,name:n,color:o.color,sign:1,role:"solar",invert:o.invert}]}:{title:n,series:[],layout:"single"}}const n=Te(`node.${e}`,i),s={title:n,series:[],layout:"mirrored"};if("solar"===e){const e=t.solarSources,o=t.sources.solar;if("single"===o.kind||"sum"===o.kind&&1===e.length){const i="single"===o.kind?void 0:e[0];return{title:n,layout:"single",series:[{entity:"single"===o.kind?o.entity:i?.entity??"",name:n,color:i?.color??t.colors.solar,sign:1,role:"solar",invert:"single"===o.kind?o.invert:i?.invert,roles:["solar"]}]}}return"sum"!==o.kind||e.length<2?s:{title:n,layout:"stacked",series:e.map(e=>({entity:e.entity,name:e.name??i?.states?.[e.entity]?.attributes?.friendly_name??e.entity,color:e.color,sign:1,role:"solar"})),parts:e.map(e=>({entity:e.entity,invert:e.invert,quiet:!0}))}}if("rest"===e){const e=t.sources.house,n=t.list.restLabel||Te("list.rest",i),s=Jn(t.rest?.indicators,i);if("single"!==e.kind)return{title:n,series:[],layout:"total",extras:s};const r=t.solarSources.filter(e=>e.excluded);return{title:n,layout:"total",extras:s,series:[{entity:e.entity,name:n,color:"var(--secondary-text-color)",sign:1,role:"house"}],parts:[{entity:e.entity,invert:e.invert,quiet:!1},...r.map(e=>({entity:e.entity,invert:e.invert,quiet:!0})),...o.map(e=>({entity:e,invert:!1,quiet:!0,minus:!0}))]}}if("house"===e){const e=t.sources.house,i=t.solarSources.filter(e=>e.excluded);return"single"!==e.kind?s:0===i.length?{title:n,layout:"single",series:[{entity:e.entity,name:n,color:t.colors.house,sign:1,role:"house",invert:e.invert,roles:["house"]}]}:{title:n,layout:"total",series:[{entity:e.entity,name:n,color:t.colors.house,sign:1,role:"house"}],parts:[{entity:e.entity,invert:e.invert,quiet:!1},...i.map(e=>({entity:e.entity,invert:e.invert,quiet:!0}))]}}const r="grid"===e?t.sources.grid:t.sources.battery,a=Fn(t.layout);if("single"===r.kind){const i="grid"===e,o=i?"grid_import":"battery_discharge",s=i?"grid_export":"battery_charge";return{title:n,layout:"single",series:[{entity:r.entity,name:n,color:t.colors[o],downColor:t.colors[s],sign:1,role:i?"import":"discharge",invert:r.invert,roles:i?["import","export"]:["discharge","charge"],arrows:i?{up:a.import,down:a.export,upColor:Fe(t,o),downColor:Fe(t,s)}:void 0,noFigure:!i}],extras:Xn(i?void 0:t.sources.batterySoc)}}if("split"!==r.kind)return s;const[l,c]="grid"===e?["import","export"]:["discharge","charge"],d=(o,n,s)=>{const r="grid"===e?`grid_${o}`:`battery_${o}`;return{entity:n,name:Te(`detail.${o}`,i),color:t.colors[r],arrow:a[o],arrowColor:Fe(t,r),sign:s,role:o}};return{title:n,layout:"mirrored",series:[d(l,r.positive,1),d(c,r.negative,-1)],extras:Xn("battery"===e?t.sources.batterySoc:void 0)}}function Jn(e,t){return Object.entries(e?.slots??{}).map(([i,o])=>({entity:o.entity,label:o.label??("ring"===i?void 0:t?.states?.[o.entity]?.attributes?.friendly_name??o.entity),percent:!0===o.percent||0===o.min&&100===o.max&&"%"===es(t,o.entity),inEnergy:e?.inEnergy??!1}))}function Yn(e,t){return(e.extras??[]).filter(e=>!t||!1!==e.inEnergy)}function Xn(e){return e?[{entity:e,percent:!0}]:[]}function es(e,t){const i=e?.states?.[t]?.attributes?.unit_of_measurement;return"string"==typeof i?i:void 0}async function ts(e,t,i,o,n="hour"){const s=function(e,t,i,o){const n=e.map(e=>[Math.max(e.t,t),null===e.v?null:o(e.v)]),s=n.at(-1);return s&&s[0]<i&&n.push([i,s[1]]),n}((await ge(e,[t],Math.ceil((o-i)/6e4),2e4))[t]??[],i,o,e=>e),r=s[0]?.[0]??o;if(r-i<=Un)return{line:s,band:[]};const a=await e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),end_time:new Date(r).toISOString(),statistic_ids:[t],period:n,types:["min","max"]}),l=(a?.[t]??[]).filter(e=>null!==e.min&&null!==e.max&&e.start<r).map(e=>({start:e.start,min:e.min,max:e.max}));return{line:s,band:l}}function is(e){return V`${e.map((e,t)=>0===t?V`${e}`:V`<br />${e}`)}`}function os(e,t){if(!t)return;let i=0,o=!1;for(const n of e){const e=t.meanW(n.entity);if(null===e){if(n.quiet)continue;return null}n.minus||(o=!0);const s=n.invert?-e:e;i+=n.minus?-s:s}return o?i:null}function ns(e,t,i){const o=i?.meanW(e);return null==o?o:t?.find(t=>t.entity===e)?.invert?-o:o}class ss extends ce{constructor(){super(...arguments),this._open=!1,this._period=null,this._power=!1,this._range="24h",this._busy=!1,this._ticket=0,this._shown=[],this._loaded=!1,this._extraCharts=[],this._onCardGone=e=>{e.detail===this._params?.card&&this.closeDialog()},this._renew=!1,this._renewed=new Set}async showDialog(e){clearInterval(this._timer),this._params=e,this._open=!0,this._view=void 0,this._chart=void 0,this._extraCharts=[],this._drawn=void 0,this._busy=!1,this._giveWayTo=void 0,this._loaded=!1,window.addEventListener(Hn,this._onCardGone);const t=e.card.detailState();this._period=t?.period??null,this._power=null===this._period,this._range="24h",this._load(),this._timer=setInterval(()=>{this._load()},3e5),await this.updateComplete}closeDialog(){return this._open=!1,customElements.get("ha-adaptive-dialog")||this._closed(),!0}_closed(){const e=this._params;if(!e)return;const t=e.origin;window.removeEventListener(Hn,this._onCardGone),clearInterval(this._timer),this._timer=void 0,this._ticket++,this._params=void 0,this._open=!1,this.dispatchEvent(new CustomEvent("dialog-closed",{detail:{dialog:mi},bubbles:!0,composed:!0}));const i=this._giveWayTo;this._giveWayTo=void 0,i?vn(e.card,i):t?.focus()}get _hass(){return this.hass??this._params?.card.hass}async _chartReady(){const e=Kn;if(customElements.get(e))return!0;let t;this._pullChart().catch(e=>console.warn(e));try{return await Promise.race([customElements.whenDefined(e).then(()=>!0),new Promise(e=>{t=setTimeout(()=>e(!1),jn)})])}finally{clearTimeout(t)}}async _pullChart(){const e=await(window.loadCardHelpers?.()),t=this._params,i=t?.card.detailState(),o=t?.entity??(t&&i?Gn(t.node,i.config).series[0]?.entity:void 0);if(!e||!o)return;const n=e.createCardElement({type:"statistics-graph",entities:[o],days_to_show:1});n.hass=this._hass,n.style.display="none",this.renderRoot.appendChild(n),await customElements.whenDefined("ha-chart-base"),n.remove()}_giveWay(){const e=this._params;e&&(this._giveWayTo=e.entity,this.closeDialog())}async _load(e=!1){const t=this._params,i=this._hass,o=t?.card.detailState();if(!t||!i||!o)return;const n=++this._ticket,s=()=>n===this._ticket;e&&(this._busy=!0);try{const e=!this._power&&this._period,n=this._powerRange(i);this._shown=o.shown??[];const r=Gn(t.node,o.config,i,this._shown),a=e?t.card.detailEnergy(e):async function(e,t,i,o){if(0===t.length)return{};let n;const s=new Promise((e,t)=>{n=setTimeout(()=>t(new Error("EnerLens: five-minute statistics did not answer")),2e4)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),end_time:new Date(o).toISOString(),statistic_ids:t,period:"5minute",types:["mean","min","max"],units:{power:"W"}}),s])??{}}finally{clearTimeout(n)}}(i,(r.parts??r.series).map(e=>e.entity),n.from,Date.now());a.catch(()=>{});const l=await this._chartReady();if(!s())return;if(!l)return void this._giveWay();let c,d="hour";const h={period:this._period,range:this._range};if(e){const e=await a;if(!s())return;if(!this._loaded&&"single"===r.layout&&null===e.meanW(r.series[0]?.entity??""))return void this._giveWay();this._view=e,this._drawEnergy(e);const t=e.detail;if(t){const e=("hour"===t.step?Un:24*Un)/2;c={from:t.axisFrom,to:t.axisTo,min:t.axisFrom-e,max:t.axisTo+e},d=t.step}else 0===r.series.length&&(c={from:e.from,to:e.to,min:e.from,max:e.to})}else{const e=await a;if(!s())return;if(!this._loaded&&"single"===r.layout&&!e[r.series[0]?.entity??""]?.length)return void this._giveWay();h.power={range:n,rows:e},this._drawPower(n,e),c={...n,min:n.from,max:n.to}}const u=Yn(r,Boolean(e));if(c&&u.length>0){const e=Math.min(c.to,Date.now()),t=await Promise.allSettled(u.map(t=>ts(i,t.entity,c.from,e,d)));if(!s())return;h.extras=t.map(e=>"fulfilled"===e.status?{data:e.value,min:c.min,max:c.max}:void 0),t.forEach((e,t)=>{"fulfilled"===e.status?this._drawSoc(t,e.value,c.min,c.max):console.warn(e.reason)})}this._drawn=h,this._loaded=!0,this._renew=!1,this._renewed.clear()}catch(e){console.warn(e),s()&&!this._loaded?this._giveWay():s()&&this._drawn&&(this._period=this._drawn.period,this._range=this._drawn.range,this._renew=!1,this._renewed.clear())}finally{s()&&(this._busy=!1)}}_pick(e){e!==this._period&&(this._period=e,this._renew=!0,this._renewed.clear(),this._load(!0))}_pickRange(e){e!==this._range&&(this._range=e,this._renew=!0,this._renewed.clear(),this._load(!0))}_powerRange(e){const t=Date.now();if("today"!==this._range)return{from:t-Zn[this._range]*Un,to:t};const i=mo(e),o=Vi("today",t,i,po(e));return{from:o,to:Ki("today",o,t,i)}}_drawPower(e,t){const i=this._params,o=this._hass,n=i?.card.detailState();if(!i||!o||!n)return;const s=Gn(i.node,n.config,o,this._shown);if("total"===s.layout&&s.parts)return void this._drawTotal(s,s.parts,e,t);if("stacked"===s.layout&&s.parts)return void this._drawStacked(s,s.parts,e,t);const r=s.series,a=n.config.power,l="mirrored"===s.layout,c=e=>`${!l&&e<0?"−":""}${$o(Math.abs(e),o,a)}`,d=r.flatMap(e=>{const i=(t[e.entity]??[]).map(t=>e.invert?{...t,mean:null===t.mean?null:-t.mean,min:null===t.max?null:-t.max,max:null===t.min?null:-t.min}:t),o=this._paint(e.color),n=t=>0===t?0:e.sign*t,s=t=>null===t.min||null===t.max?null:e.sign>0?t.min:n(t.max),r={stack:`band-${e.role}`,stackStrategy:"all",showSymbol:!1};return[{...r,name:`${e.role}-low`,type:"line",lineStyle:{opacity:0},data:i.map(e=>[e.start,s(e)])},{...r,name:`${e.role}-span`,type:"line",lineStyle:{opacity:0},areaStyle:{color:o,opacity:.2},data:i.map(e=>[e.start,null===e.min||null===e.max?null:e.max-e.min])},{id:e.entity,name:e.name,type:"line",showSymbol:!1,lineStyle:{width:1.5},itemStyle:{color:o},data:i.map(e=>[e.start,null===e.mean?null:n(e.mean)])}]}),h=this._chartFor("_chart","power");h.options={xAxis:{type:"time",min:e.from,max:e.to},yAxis:{type:"value",axisLabel:{formatter:c}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,formatter:e=>{const t=Array.isArray(e)?e:[e],i=e=>t.find(t=>t.seriesName===e)?.value[1],o=r.map(e=>{const t=i(e.name),o=i(`${e.role}-low`),n=i(`${e.role}-span`);if(null==t)return`${e.name}: —`;if(null==o||null==n)return`${e.name}: ${c(t)}`;const[s,r]=l?[Math.abs(o),Math.abs(o+n)].sort((e,t)=>e-t):[o,o+n];return`${e.name}: ${c(t)} (${c(s)} – ${c(r)})`});return is([t[0]?.axisValueLabel??"",...o])}}},h.data=d,this.requestUpdate()}_drawStacked(e,t,i,o){const n=this._hass,s=this._params?.card.detailState();if(!n||!s)return;const r=t.map(e=>new Map((o[e.entity]??[]).map(e=>[e.start,e.mean]))),a=[...new Set(r.flatMap(e=>[...e.keys()]))].sort((e,t)=>e-t),l=t.map((e,t)=>a.map(i=>{const o=r[t].get(i);return null==o?0:e.invert?-o:o})),c=e=>`${e<0?"−":""}${$o(Math.abs(e),n,s.config.power)}`,d=this._paint("var(--secondary-text-color)"),h=this._chartFor("_chart","power");h.options={xAxis:{type:"time",min:i.from,max:i.to},yAxis:{type:"value",axisLabel:{formatter:c}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?c(e):"—"}},h.data=[...e.series.map((e,t)=>{const i=this._paint(e.color);return{id:e.entity,name:e.name,type:"line",stack:"pv",showSymbol:!1,lineStyle:{width:0},itemStyle:{color:i},areaStyle:{color:i,opacity:.85},data:a.map((e,i)=>[e,l[t][i]])}}),{id:"sum",name:e.title,type:"line",showSymbol:!1,z:10,lineStyle:{width:.8,color:d},itemStyle:{color:d},data:a.map((e,t)=>[e,l.reduce((e,i)=>e+i[t],0)])}],this.requestUpdate()}_drawTotal(e,t,i,o){const n=this._hass,s=this._params?.card.detailState(),r=e.series[0];if(!n||!s||!r)return;const a=t.map(e=>new Map((o[e.entity]??[]).map(e=>[e.start,e.mean]))),l=[...new Set(a.flatMap(e=>[...e.keys()]))].sort((e,t)=>e-t),c=l.map(e=>{let i=0;for(const[o,n]of t.entries()){const t=a[o].get(e);if(null==t){if(n.quiet)continue;return[e,null]}const s=n.invert?-t:t;i+=n.minus?-s:s}return[e,i]}),d=e=>`${e<0?"−":""}${$o(Math.abs(e),n,s.config.power)}`,h=this._paint(r.color),u=this._chartFor("_chart","power");u.options={xAxis:{type:"time",min:i.from,max:i.to},yAxis:{type:"value",axisLabel:{formatter:d}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?d(e):"—"}},u.data=[{id:r.entity,name:r.name,type:"line",showSymbol:!1,lineStyle:{width:1.5},itemStyle:{color:h},data:c}],this.requestUpdate()}_drawSoc(e,t,i,o){const n=this._hass;if(!n)return;const s=this._params,r=s?.card.detailState(),a=s&&r?Gn(s.node,r.config,n,this._shown):void 0,l=a?Yn(a,!this._power)[e]:void 0;if(!l)return;const c=l.label||Te("detail.soc",n),d=this._paint("var(--secondary-text-color)"),h=this._paint("var(--divider-color)"),u=l.percent?"%":es(n,l.entity),p=new Intl.NumberFormat(Mo(n),{maximumFractionDigits:1}),m=e=>l.percent?`${Math.round(e)} %`:`${p.format(e)}${u?` ${u}`:""}`,f=[];t.band.length>0&&f.push({name:"min",type:"line",stack:"band",step:"end",showSymbol:!1,lineStyle:{opacity:0},data:t.band.map(e=>[e.start,e.min])},{name:"max",type:"line",stack:"band",step:"end",showSymbol:!1,lineStyle:{opacity:0},areaStyle:{color:d,opacity:.25},data:t.band.map(e=>[e.start,e.max-e.min])}),f.push({name:c,type:"line",step:"end",showSymbol:!1,lineStyle:{width:1.5,color:d},itemStyle:{color:d},areaStyle:{color:h,opacity:.6},data:t.line});const g=this._extraChart(e);g.height="160px",g.options={xAxis:{type:"time",min:i,max:o},yAxis:l.percent?{type:"value",min:0,max:100,interval:50,axisLabel:{formatter:m}}:{type:"value",scale:!0,splitNumber:2,axisLabel:{formatter:m}},legend:{show:!1},grid:{left:this._power?64:48,right:16,top:12,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,formatter:e=>{const t=Array.isArray(e)?e:[e],i=t.find(e=>"min"===e.seriesName)?.value[1],o=t.find(e=>"max"===e.seriesName)?.value[1],n=t.find(e=>e.seriesName===c)?.value[1],s=null!=n?m(n):null!=i&&null!=o?`${m(i)} – ${m(i+o)}`:"—";return is([t[0]?.axisValueLabel??"",`${c}: ${s}`])}}},g.data=f,this.requestUpdate()}_extraChart(e){const t=`_extra${e}`;this._renew&&!this._renewed.has(t)&&(this._renewed.add(t),this._extraCharts[e]=void 0);const i=this._extraCharts[e]??document.createElement(Kn);return i.className="chart soc",i.hass=this._hass,this._extraCharts[e]=i,i}_chartFor(e,t){this._renew&&!this._renewed.has(e)&&(this._renewed.add(e),this[e]=void 0);const i=this[e]??document.createElement(Kn);return i.className=`chart ${t}`,i.hass=this._hass,i.height="300px",this[e]=i,i}_paint(e){const t=document.createElement("span");t.style.color=e,this.renderRoot.appendChild(t);const i=getComputedStyle(t).color;return t.remove(),i&&!i.includes("var(")?i:Ce(e)??e}_drawEnergy(e){const t=this._params,i=this._hass,o=t?.card.detailState(),n=e.detail;if(!(t&&i&&o&&n))return;const s=mo(i),r=Gn(t.node,o.config,i,this._shown),a=r.series,l=[];for(let e=n.axisFrom;e<n.axisTo;)l.push(e),e="hour"===n.step?e+Un:Hi(e+36*Un,"day",s);const c=a.map(e=>{const t=new Map((e=>{if(e.roles){const[t,i]=e.roles,o=new Map((n.bars[t]??[]).map(e=>[e.start,{...e}]));for(const e of i?n.bars[i]??[]:[]){const t=o.get(e.start);o.set(e.start,{start:e.start,wh:(t?.wh??0)-e.wh,filledShare:Math.max(t?.filledShare??0,e.filledShare)})}return[...o.values()]}if("stacked"===r.layout||"single"===r.layout)return n.entityBars[e.entity]??[];if("total"!==r.layout||!r.parts)return n.bars[e.role]??[];const t=new Map;let i;for(const o of r.parts){const s=o.entity===e.entity?n.bars[e.role]:n.entityBars[o.entity];if(!s&&!o.quiet)return[];const r=s??[];o.quiet||(i=new Set(r.map(e=>e.start)));for(const e of r){const i=t.get(e.start);t.set(e.start,{start:e.start,wh:(i?.wh??0)+(o.minus?-e.wh:e.wh),filledShare:Math.max(i?.filledShare??0,e.filledShare)})}}return[...t.values()].filter(e=>!i||i.has(e.start))})(e).map(e=>[e.start,e]));return{id:e.entity,name:e.name,type:"bar",stack:"pair",barMaxWidth:28,itemStyle:{color:this._paint(e.color),borderRadius:2},data:l.map((i,o)=>{const s=t.get(i),a=i+((l[o+1]??n.axisTo)-i)/2;if(!s)return[a,null];const c="mirrored"===r.layout?Math.max(0,s.wh):s.wh,d=[a,e.sign*c/1e3],h=e.downColor&&c<0?{color:this._paint(e.downColor)}:{},u=ji(s.filledShare)>0?{opacity:.45}:{};return Object.keys(h).length||Object.keys(u).length?{value:d,itemStyle:{...h,...u}}:d})}}),d=new Intl.NumberFormat(Mo(i),{maximumFractionDigits:1}),h="mirrored"===r.layout,u=this._chartFor("_chart","energy");u.options={xAxis:{type:"time",min:n.axisFrom,max:n.axisTo},yAxis:{type:"value",name:"kWh",axisLabel:{formatter:e=>d.format(h?Math.abs(e):e)}},legend:{show:!1},grid:{left:48,right:16,top:32,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?`${!h&&e<0?"−":""}${So(1e3*Math.abs(e),i)}`:""}},u.data=c,this.requestUpdate()}updated(e){if(!e.has("hass"))return;const t=this.hass?.themes?.darkMode,i=this._dark;if(this._dark=t,void 0===i||i===t||!this._drawn)return;const o=this._drawn;o.power?this._drawPower(o.power.range,o.power.rows):this._view&&this._drawEnergy(this._view),o.extras?.forEach((e,t)=>{e&&this._drawSoc(t,e.data,e.min,e.max)})}shouldUpdate(e){return e.has("_params")||e.has("_open")||void 0!==this._params}_chips(e,t,i,o){const n=this._hass;if(e.length<2)return j;const s=Math.max(0,null===t?0:e.indexOf(t));return V`<div class="chips" role="radiogroup" aria-label=${Te("detail.periods",n)}>
      ${e.map((n,r)=>V`<button
          class="chip"
          role="radio"
          aria-checked=${n===t?"true":"false"}
          tabindex=${r===s?0:-1}
          @click=${()=>o(n)}
          @keydown=${t=>((t,i)=>{const n=In(t.key,i,e.length);if(n<0)return;t.preventDefault();const s=t.currentTarget.parentElement;o(e[n]),setTimeout(()=>s?.querySelectorAll('[role="radio"]')[n]?.focus(),0)})(t,r)}
        >${i(n)}</button>`)}
    </div>`}_renderContent(e){const t=this._params,i=this._hass;if(!t||!i)return j;const o=this._power?void 0:this._view,n=Gn(t.node,e.config,i,this._shown),s=n.series,r=o?.marks.roles,a=Yn(n,!this._power),l=e=>t=>vn(t.currentTarget,e);return V`
      ${this._power?this._chips(Object.keys(Zn),this._range,e=>Te(Qn[e],i),e=>this._pickRange(e)):this._chips(e.periods,this._period,e=>Te(`energy.${e}`,i),e=>this._pick(e))}
      <div class="sums ${this._busy?"busy":""}">
        ${"stacked"===n.layout&&n.parts?V`<span class="sum total ${r?.solar&&r.solar.tier>0?`warn${r.solar.tier}`:""}"
                title=${r?.solar?.note??""}
                >${n.title}${o?V` <b>${function(e,t,i){return null==e?"—":So(Math.max(0,e*t.hours),i)}(os(n.parts,o),o,i)}</b>`:j}</span
              >`:j}
        ${s.map(e=>{const s="total"===n.layout&&n.parts?os(n.parts,o):"stacked"===n.layout?ns(e.entity,n.parts,o):e.invert?ns(e.entity,[{entity:e.entity,invert:!0,quiet:!0}],o):o?.meanW(e.entity),a=e.arrows&&!this._power&&o&&null!=s?s<0?{text:e.arrows.down,color:e.arrows.downColor}:{text:e.arrows.up,color:e.arrows.upColor}:void 0,c=this._power||e.noFigure?void 0:o&&null!=s?e.arrows?So(Math.abs(s*o.hours),i):e.roles?So(s*o.hours,i):"single"===n.layout?`${s<0?"−":""}${So(Math.abs(s*o.hours),i)}`:So(Math.max(0,s*o.hours),i):"—",d=e.roles?[r?.[e.roles[0]],e.roles[1]?r?.[e.roles[1]]:void 0].reduce((e,t)=>t&&(!e||t.tier>e.tier)?t:e,void 0):"stacked"===n.layout||"single"===n.layout?o?.marks.consumers[e.entity]:"rest"===t.node?o?.marks.rest:r?.[e.role];return"total"===n.layout?V`<span
              class="sum total ${d&&d.tier>0?`warn${d.tier}`:""}"
              title=${d?.note??""}
              >${e.name}${c?V` <b>${c}</b>`:j}</span
            >`:V`<button
            class="sum ${d&&d.tier>0?`warn${d.tier}`:""}"
            title=${d?.note??""}
            aria-label=${Te("detail.open",i,{name:c?`${e.name} ${c}`:e.name})}
            @click=${l(e.entity)}
          >${a?V`<span style="color:${a.color}">${a.text}</span> `:e.arrow?V`<span style="color:${e.arrowColor}">${e.arrow}</span> `:"stacked"===n.layout?V`<span class="swatch" style="background:${e.color}"></span>`:j}${e.name}${c?V` <b>${c}</b>`:j}</button>`})}
      </div>
      ${this._power&&s.length>0?V`<div class="note">${Te("mirrored"===n.layout||"single"===n.layout?"detail.aggregation":"detail.mean",i)}</div>`:j}
      ${o?.lateStart?V`<div class="late">
            ${Te("energy.late",i,{date:wo(o.from,i,"hour"===o.detail?.step)})}
          </div>`:j}
      <div class="charts ${this._busy?"busy":""}">
        ${0===s.length?j:this._chart??V`<div class="loading" role="progressbar" aria-busy="true"></div>`}
        ${a.map((e,t)=>{const o=this._extraCharts[t],n=e.label||Te("detail.soc",i);return o?V`<button
                class="sum soc-name"
                aria-label=${Te("detail.open",i,{name:n})}
                @click=${l(e.entity)}
              >${n}</button>
              ${o}`:j})}
      </div>
    `}render(){if(!this._params)return V``;const e=this._hass,t=this._params.card.detailState(),i=t?Gn(this._params.node,t.config,e,this._shown).title:Te(`node.${this._params.node}`,e);return V`
      <ha-adaptive-dialog
        .hass=${e}
        .open=${this._open}
        .headerTitle=${i}
        width="medium"
        flexcontent
        @closed=${this._closed}
      >
        <span slot="headerTitle" id="title">${i}</span>
        <div class="content">${t?this._renderContent(t):j}</div>
      </ha-adaptive-dialog>
    `}}ss.properties={hass:{attribute:!1},_params:{state:!0},_open:{state:!0},_period:{state:!0},_range:{state:!0},_view:{state:!0},_busy:{state:!0}},ss.styles=s`
    ha-adaptive-dialog {
      /* Room for a day of hourly bars (DF-3); a phone gets the sheet. */
      --ha-dialog-width-md: 760px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font: inherit;
      font-size: 13px;
      min-height: 32px;
      padding: 0 12px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .chip[aria-checked="true"] {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }
    .sums {
      display: flex;
      flex-wrap: wrap;
      column-gap: 20px;
    }
    .sum {
      font: inherit;
      font-size: 15px;
      background: none;
      border: none;
      padding: 4px 0;
      color: var(--primary-text-color);
      cursor: pointer;
      /* Arrow, name and figure stay together on a narrow screen (DF-11). */
      white-space: nowrap;
    }
    .sum b {
      font-weight: 500;
    }
    .sum.total {
      cursor: default;
    }
    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      margin-right: 6px;
    }
    .sum.warn1 b {
      color: var(--el-warn1, #6b8aa6);
    }
    .sum.warn2 b,
    .late {
      color: var(--el-warn2, #c77c02);
    }
    .late {
      font-size: 13px;
    }
    .note {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    /* As big as the header's entries: it is a link like them (Markus 27.10.2026). */
    .soc-name {
      align-self: flex-start;
    }
    .charts {
      display: flex;
      flex-direction: column;
      min-height: 300px;
      transition: opacity 0.15s 0.15s;
    }
    .charts.busy,
    .sums.busy {
      opacity: 0.5;
    }
    .sums {
      transition: opacity 0.15s 0.15s;
    }
    .chart {
      display: block;
    }
    .loading {
      width: 32px;
      height: 32px;
      margin: 120px auto;
      border-radius: 50%;
      border: 3px solid var(--divider-color);
      border-top-color: var(--primary-color);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,customElements.get(mi)||customElements.define(mi,ss);const rs=new Set(["unavailable","unknown",""]);function as(e){return/^[-+]?(\d+\.?\d*|\.\d+)$/.test(e)?Number(e):void 0}function ls(e,t){if(void 0===e)return;const i=qe(e);if(rs.has(i))return;if(t.invalid)return!1;if("="===t.operator||"!="===t.operator){const e=as(i),o=(t.values??[]).some(t=>{const o=as(t);return void 0!==e&&void 0!==o?e===o:t===i});return"="===t.operator?o:!o}const o=as(i),n=t.limit;if(void 0===o||void 0===n)return!1;switch(t.operator){case">":return o>n;case"<":return o<n;case">=":return o>=n;default:return o<=n}}class cs{constructor(){this.answers=new Map}static keyOf(e,t){return JSON.stringify([e.key,t.entity,t.operator,t.values,t.limit])}observe(e,t){for(const i of t){const t=i.hold;if("condition"!==t?.kind)continue;const o=ls(e.states[t.entity]?.state,t);void 0!==o&&this.answers.set(cs.keyOf(i,t),o)}}held(e,t){const i=e.hold;return!!i&&("always"===i.kind||!t&&(this.answers.get(cs.keyOf(e,i))??!1))}}const ds=Object.freeze({mW:.001,W:1,kW:1e3,MW:1e6,GW:1e9,TW:1e12}),hs={solar:{kind:"absent"},grid:{kind:"absent"},battery:{kind:"absent"},house:{kind:"absent"}},us=new Set;function ps(e,t){us.has(e)||(us.add(e),console.warn(`[enerlens-card] ${t}`))}function ms(e){if("string"!=typeof e||""===e.trim())return null;const t=Number(e);return Number.isFinite(t)?t:null}function fs(e,t){const i=e?.states?.[t];if(!i)return null;const o=ms(i.state);if(null===o)return null;const n=i.attributes?.unit_of_measurement;if("string"==typeof n&&""!==n){const e=ds[n];return"number"==typeof e?o*e:(ps(`${t}|unit`,`${t}: unknown power unit "${n}", value ignored`),null)}return"power"===i.attributes?.device_class?(ps(`${t}|assume-w`,`${t}: no unit_of_measurement, assuming W`),o):(ps(`${t}|no-unit`,`${t}: neither unit_of_measurement nor device_class "power", value ignored`),null)}function gs(e){const t=Math.max(0,e),i=Math.max(0,-e);return{positive:t,negative:i,net:t-i}}function _s(e,t){if("single"===e.kind){const i=t(e.entity);return null===i?null:gs(e.invert?-i:i)}if("split"===e.kind){const i=t(e.positive),o=t(e.negative);if(null===i||null===o)return null;const n=Math.max(0,i),s=Math.max(0,o);return{positive:n,negative:s,net:n-s}}return null}function ws(e){return"single"===e.kind?{positive:e.entity,negative:e.entity}:"split"===e.kind?{positive:e.positive,negative:e.negative}:{}}function ys(e,t,i){return null===e?{available:!1,entity:t,derived:i}:{available:!0,w:e,entity:t,derived:i}}function bs(e,t,i){return null===e?{available:!1,entityPositive:t.positive,entityNegative:t.negative,derived:i}:{available:!0,positive:e.positive,negative:e.negative,net:e.net,entityPositive:t.positive,entityNegative:t.negative,derived:i}}function vs(e,t){if(!t)return{available:!1,derived:!1};const i=e?.states?.[t];return ys(i?ms(i.state):null,t,!1)}function xs(e,t,i,o,n){return $s(e,t,t=>fs(e,t),i,o,n)}function ks(e,t){const i={};for(const[o,n]of Object.entries(e.slots))i[o]={...n,...t(n.entity)};return{slots:i,idleValue:e.idleValue,inEnergy:e.inEnergy}}function $s(e,t,i,o,n,s){const r=e=>{try{const t=i(e);return"number"==typeof t&&Number.isFinite(t)?t:null}catch{return null}},a=t?.sources??hs,{solar:l,grid:c,battery:d,house:h}=a,u="derived"===h.kind||"absent"===h.kind,p="absent"===d.kind,m=(t?.solarSources??[]).map(t=>{const i=r(t.entity);return{key:t.key,entity:t.entity,name:t.name??e?.states?.[t.entity]?.attributes?.friendly_name??t.entity,color:t.color,icon:t.icon,kwp:t.kwp,excluded:t.excluded,reading:ys(null===i?null:t.invert?-i:i,t.entity,!1)}}),f="sum"===l.kind?function(e,t,i){const o=t?.flow?.minW??0;let n=0,s=!1;const r=[];for(const t of e){if(t.reading.available){n+=t.reading.w,s=!0;continue}const e=i?.get(t.entity);void 0!==e&&(e>=o?r.push(t.name):s=!0)}return s?{value:gs(n),missing:r.length>0?r:void 0}:{value:null}}(m,t,n):void 0,g=f?.missing,_=f?f.value:_s(l,r),w=_s(c,r),y=p?null:_s(d,r),b=u?null:_s(h,r),v=u?[]:m.filter(e=>e.excluded),x=v.length>0,k=b&&x?gs(b.net+v.reduce((e,t)=>e+(t.reading.available?t.reading.w:0),0)):b,$=_?.net??null,S=w?.net??null,A=k?.net??null,M=p?0:y?.net??null,E=(e,t,i,o)=>null===e||null===t||null===i?null:o(e,t,i),C=u?E($,S,M,(e,t,i)=>Math.max(0,e+t+i)):null,z="derived"===l.kind?E(A,S,M,(e,t,i)=>Math.max(0,e-t-i)):null,W="derived"===c.kind?E(A,$,M,(e,t,i)=>e-t-i):null,P="derived"===d.kind?E(A,$,S,(e,t,i)=>e-t-i):null,N=e=>g?{...e,missing:g}:e,F="derived"===l.kind?ys(z,void 0,!0):N(ys(_?.net??null,ws(l).positive,!1)),L=u?N(ys(C,void 0,!0)):ys(k?.net??null,ws(h).positive,!1),R=x?{...L,corrected:!0}:L,O="derived"===c.kind?N(bs(null===W?null:gs(W),{},!0)):bs(w,ws(c),!1);let T=null;"derived"===d.kind?T=N(bs(null===P?null:gs(P),{},!0)):p||(T=bs(y,ws(d),!1));const D=(t?.consumers??[]).map(t=>{const i=e?.states?.[t.entity],n=i?.attributes?.friendly_name;return{key:t.key,entity:t.entity,name:t.name??n??t.entity,color:t.color,minW:t.minW,icon:t.icon,reading:ys(r(t.entity),t.entity,!1),indicators:t.indicators&&o?ks(t.indicators,o):void 0,held:s?.(t)??"always"===t.hold?.kind,position:t.position,highlight:t.highlight}}),q=t?.rest?.indicators;return{solar:F,solarSources:m,grid:O,battery:T,soc:vs(e,a.batterySoc),house:R,consumers:D,rest:q&&o?{indicators:ks(q,o)}:void 0}}function Ss(e,t){const i=function(e){const t=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(t){const e=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1],i=Number.parseInt(e,16);return[i>>16&255,i>>8&255,255&i]}const i=e.match(/^rgba?\(([^)]+)\)/i);if(!i)return;const o=i[1].split(/[,\s/]+/).map(Number);return o.length<3||o.slice(0,3).some(e=>!Number.isFinite(e))?void 0:[o[0],o[1],o[2]]}(e);if(!i)return e;return`rgb(${i.map(e=>Math.round(e+(255-e)*t)).join(",")})`}function As(e){const t=e.dot/2,i=[{r:t,colour:e.colour,opacity:1,forward:0}],o=Math.floor(e.caps);if(o<=0||e.core<=0||e.coreLight<=0)return i;const n=1-.15**(1/o);for(let s=1;s<=o;s++){const r=s/o,a=1-r*(1-e.core);i.push({r:t*a,colour:Ss(e.mixFrom??e.colour,e.coreLight*r),opacity:n,forward:e.bias*t*(1-a)})}return i}const Ms=[3,8],Es=[[0,.55],[.3,.42],[.62,.12],[1,0]];function Cs(e,t,i,o){if(1!==e||t<=0)return"";const n=t/60;return Ms.map(e=>`drop-shadow(0 0 ${(e*n*o).toFixed(1)}px ${i})`).join(" ")}function zs(e){const t=e/60;return Es.map(([e,i])=>[e,Math.min(i*t,1)])}function Ws(e){const t=e.match(/rgba?\(([^)]+)\)/i);if(!t)return;const i=t[1].split(/[,\s/]+/).map(Number);if(i.length<3||i.slice(0,3).some(e=>!Number.isFinite(e)))return;if(i.length>=4&&Number.isFinite(i[3])&&i[3]<.1)return;const[o,n,s]=i;return(.2126*o+.7152*n+.0722*s)/255}function Ps(e,t){return"dark"===t||"light"!==t&&function(e){if("function"!=typeof getComputedStyle)return!0;const t=getComputedStyle(e),i=Ws(t.backgroundColor);if(void 0!==i)return i<.5;const o=Ws(t.color);return void 0===o||o>.5}(e)}function Ns(e,t){if("function"!=typeof getComputedStyle||"undefined"==typeof document)return t;const i=document.createElement("span");if(i.style.display="none",i.style.color=t,""===i.style.color)return t;e.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o&&!o.includes("var(")?o:void 0}const Fs="http://www.w3.org/2000/svg",Ls=400;function Rs(e,t){return 1===t?e:e.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi,e=>String(Number((Number(e)/t).toFixed(2))))}const Os="http://www.w3.org/2000/svg",Ts=5e3;class Ds{constructor(e,t){this.container=e,this.technique=t,this.links=new Map,this.paused=!1,this.scale=1,this.dark=!0,this.pathZoom=1,this.dotScale=1,this.paths=To}setScale(e){!Number.isFinite(e)||e<=0||e===this.scale||(this.scale=e,this.repaint())}setDotScale(e){!Number.isFinite(e)||e<=0||e===this.dotScale||(this.dotScale=e,this.repaint())}setPaths(e){if(e!==this.paths){this.paths=e;for(const[e,t]of this.links)for(const i of t.dots)i.el.style.offsetPath=this.offsetPath(e)}}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const[e,t]of this.links)for(const i of t.dots)i.el.style.offsetPath=this.offsetPath(e)}}setDesign(e,t){e===this.design&&t===this.dark||(this.design=e,this.dark=t,this.repaint())}update(e,t,i){const o=new Set;for(const n of e){o.add(n.connection);const e=this.links.get(n.connection)??this.createLink(n),s=t.flow.dotColor??t.colors[n.colorKey],r=e.colour!==s;e.colour=s,r&&(e.mixFrom="");const a=e.mixFrom?void 0:Ns(this.container,s);a&&(e.mixFrom=a);const l=r||void 0!==a,c=this.phaseOf(e.dots[0]);for(;e.dots.length>n.count;){const t=e.dots.pop();t?.animation?.cancel(),t?.el.remove()}for(;e.dots.length<n.count;)e.dots.push(this.createDot(e,n,e.dots.length,n.count,i,c));const d=5/Math.max(n.durationS,.01);for(const[t,o]of e.dots.entries())l&&this.paint(e,o),this.canAnimate(o,i)?(o.animation?o.animation.playbackRate=d:o.animation=this.startAnimation(e,o,t,n.count,c),this.setPhase(o.animation,t,n.count,c)):(o.animation?.cancel(),o.animation=void 0,o.el.style.offsetDistance=100*t/n.count+"%");l&&this.applyGlow(e),e.durationS=n.durationS,e.colorKey=n.colorKey,e.count=n.count}for(const[e,t]of this.links)if(!o.has(e)){for(const e of t.dots)e.animation?.cancel(),e.el.remove();t.group.remove(),this.links.delete(e)}}pause(){if(!this.paused){this.paused=!0;for(const e of this.links.values())for(const t of e.dots)t.animation?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.links.values())for(const t of e.dots)t.animation?.play()}}destroy(){for(const e of this.links.values()){for(const t of e.dots)t.animation?.cancel(),t.el.remove();e.group.remove()}this.links.clear(),this.defs?.remove(),this.defs=void 0}ground(){if(this.design)return this.dark?this.design.dark:this.design.light}repaint(){for(const e of this.links.values()){for(const t of e.dots)this.paint(e,t);this.applyGlow(e)}}createLink(e){const t=document.createElementNS(Os,"g");this.container.appendChild(t);const i={group:t,dots:[],durationS:e.durationS,colorKey:e.colorKey,colour:"",mixFrom:"",count:0};return this.links.set(e.connection,i),i}canAnimate(e,t){return"waapi"===this.technique&&t&&"function"==typeof e.el.animate}offsetPath(e){return`path("${Rs(this.paths[e],this.pathZoom)}")`}phaseOf(e){const t=e?.animation?.currentTime;return"number"!=typeof t?0:(t%Ts+Ts)%Ts/Ts}setPhase(e,t,i,o){e.currentTime=(o+t/i)%1*Ts}createDot(e,t,i,o,n,s=0){const r=document.createElementNS(Os,"g");r.setAttribute("class","dot"),r.style.offsetPath=this.offsetPath(t.connection),r.style.offsetRotate="auto",r.style.offsetDistance=(s+i/o)%1*100+"%",e.group.appendChild(r);const a={el:r};return this.paint(e,a),this.canAnimate(a,n)&&(a.animation=this.startAnimation(e,a,i,o,s)),a}startAnimation(e,t,i,o,n=0){const s=t.el.animate([{offsetDistance:"0%"},{offsetDistance:"100%"}],{duration:Ts,iterations:Number.POSITIVE_INFINITY,easing:"linear"});return s.playbackRate=5/Math.max(e.durationS,.01),this.setPhase(s,i,o,n),this.paused&&s.pause(),s}paint(e,t){for(;t.el.firstChild;)t.el.removeChild(t.el.firstChild);const i=this.ground(),o=e.colour,n=(i?.dot??10)/2/this.scale*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const e=document.createElementNS(Os,"circle");e.setAttribute("r",(3.4*n).toFixed(2)),e.setAttribute("fill",`url(#${this.haloGradient(o,i)})`),t.el.appendChild(e)}for(const s of As({dot:2*n,caps:this.design?.shape.caps??0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:o,mixFrom:e.mixFrom||o})){const e=document.createElementNS(Os,"circle");e.setAttribute("cx",s.forward.toFixed(2)),e.setAttribute("r",s.r.toFixed(2)),e.setAttribute("fill",s.colour),s.opacity<1&&e.setAttribute("fill-opacity",s.opacity.toFixed(3)),t.el.appendChild(e)}}applyGlow(e){const t=this.ground();e.group.style.filter=t?Cs(t.glow,t.glowStrength,e.colour,this.dotScale/this.scale):""}haloGradient(e,t){const i=`el-halo-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Os,"defs"),this.container.appendChild(this.defs)),!this.defs.querySelector(`#${CSS.escape(i)}`)){const o=document.createElementNS(Os,"radialGradient");o.setAttribute("id",i);for(const[i,n]of zs(t.glowStrength)){const t=document.createElementNS(Os,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(n)),o.appendChild(t)}this.defs.appendChild(o)}return i}}const qs="http://www.w3.org/2000/svg",Is=5e3;let Bs=0;class Vs{constructor(e){this.svg=e,this.lines=new Map,this.holeId="el-fan-hole-"+ ++Bs,this.reverse=!1,this.paused=!1,this.dotRadius=5,this.dark=!0,this.pathZoom=1,this.dotScale=1}setDesign(e,t){if(e!==this.design||t!==this.dark){this.design=e,this.dark=t;for(const e of this.lines.values())e.paintKey=void 0}}setDotColor(e){if(e!==this.dotColor){this.dotColor=e;for(const e of this.lines.values())e.paintKey=void 0}}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const e of this.lines.values())e.dotPath=void 0}}ground(){return this.dark?this.design?.dark:this.design?.light}update(e,t,i,o,n){const s=`${i.width} ${i.height}`;s!==this.size&&(this.size=s,this.svg.setAttribute("viewBox",`0 0 ${s}`),this.svg.setAttribute("width",String(i.width)),this.svg.setAttribute("height",String(i.height)));const r=this.holeClip(n,i),a=r!==this.clip;this.clip=r;const l=new Set;for(const i of e){l.add(i.key);const e=this.route?this.route(t,i):this.pathFor(t,i),n=!this.lines.has(i.key),s=this.lines.get(i.key)??this.createLine(i.key);if(e!==s.d&&(s.d=e,s.path.setAttribute("d",e)),a||n)for(const e of[s.path,s.group])r?e.setAttribute("clip-path",r):e.removeAttribute("clip-path");const c=i.inactive?void 0:this.ground(),d=i.fade??1,h=[i.inactive,i.color,c?.line,d].join("|");for(h!==s.look&&(s.look=h,s.path.setAttribute("class","fan-line"+(i.inactive?` inactive-${i.inactive}`:"")),s.path.style.stroke=i.inactive?"":i.color,s.path.style.opacity=c?String(c.line/100*d):"",s.path.style.setProperty("--el-fade",String(d)),s.group.style.opacity=d<1?String(d):"");s.dots.length>i.count;)s.dots.pop()?.remove(),s.animations.pop()?.cancel();for(;s.dots.length<i.count;)s.dots.push(this.createDot(s,i.key));const u=this.dotColor??i.color,p=[u,this.dotRadius,this.dotScale,c?this.design?.id:"",this.dark].join("|"),m=s.paintKey!==p;s.paintKey=p,m&&(s.mixFrom=void 0);const f=void 0===s.mixFrom?Ns(this.svg,u):void 0;f&&(s.mixFrom=f);const g=m||void 0!==f,_=s.mixFrom??u;g&&this.applyGlow(s,u,c);const w=s.count!==i.count,y=Rs(e,this.pathZoom),b=y!==s.dotPath;s.dotPath=y;const v=this.reverse?"auto 180deg":"auto",x=5/Math.max(i.durationS,.01);for(const[e,t]of s.dots.entries()){if(!g&&t.firstChild||this.paintDot(t,u,c,_),!b&&t.style.offsetPath||(t.style.offsetPath=`path("${y}")`),t.style.offsetRotate!==v&&(t.style.offsetRotate=v),!o||"function"!=typeof t.animate){s.animations[e]?.cancel(),s.animations[e]=void 0,t.style.offsetDistance=100*e/i.count+"%";continue}let n=s.animations[e];if(!n){const i=[{offsetDistance:"0%"},{offsetDistance:"100%"}];n=t.animate(this.reverse?i.reverse():i,{duration:Is,iterations:Number.POSITIVE_INFINITY,easing:"linear"}),s.animations[e]=n,this.paused&&n.pause()}n.playbackRate!==x&&(n.playbackRate=x),!w&&s.animations[e]||(n.currentTime=Is*e/i.count)}s.count=i.count}for(const[e,t]of this.lines)if(!l.has(e)){for(const e of t.animations)e?.cancel();for(const e of t.dots)e.remove();t.group.remove(),t.path.remove(),this.lines.delete(e)}}pathFor(e,t){const i=t.x-e.x,o=Math.min(160,Math.max(40,.6*i)),n=e.x+Math.min(o,i),s=o/2,r=e=>e.toFixed(1);return`M${r(e.x)},${r(e.y)} C${r(e.x+s)},${r(e.y)} ${r(n-s)},${r(t.y)} ${r(n)},${r(t.y)} L${r(t.x)},${r(t.y)}`}createLine(e){const t=document.createElementNS(qs,"path");t.setAttribute("class","fan-line"),t.setAttribute("fill","none"),t.dataset.key=e,this.svg.appendChild(t);const i=document.createElementNS(qs,"g");this.svg.appendChild(i);const o={path:t,group:i,dots:[],animations:[],count:0};return this.lines.set(e,o),o}holeClip(e,t){if(!(e&&e.r>0))return;this.defs||(this.defs=document.createElementNS(qs,"defs"),this.svg.appendChild(this.defs));let i=this.defs.querySelector(`#${this.holeId} path`);if(!i){const e=document.createElementNS(qs,"clipPath");e.setAttribute("id",this.holeId),e.setAttribute("clipPathUnits","userSpaceOnUse"),i=document.createElementNS(qs,"path"),i.setAttribute("clip-rule","evenodd"),e.appendChild(i),this.defs.appendChild(e)}const{width:o,height:n}=t,s=`M${-o},${-n}H${2*o}V${2*n}H${-o}Z${qo(e.x,e.y,e.r)}`;return i.getAttribute("d")!==s&&i.setAttribute("d",s),`url(#${this.holeId})`}haloGradient(e,t){const i=`fan-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(qs,"defs"),this.svg.appendChild(this.defs)),!this.defs.querySelector(`#${i}`)){const o=document.createElementNS(qs,"radialGradient");o.setAttribute("id",i);for(const[i,n]of zs(t.glowStrength)){const t=document.createElementNS(qs,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(n)),o.appendChild(t)}this.defs.appendChild(o)}return i}applyGlow(e,t,i){e.group.style.filter=i?Cs(i.glow,i.glowStrength,t,this.dotScale):""}paintDot(e,t,i,o){for(;e.firstChild;)e.removeChild(e.firstChild);const n=(i?i.dot/2:this.dotRadius)*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const o=document.createElementNS(qs,"circle");o.setAttribute("r",(3.4*n).toFixed(2)),o.setAttribute("fill",`url(#${this.haloGradient(t,i)})`),e.appendChild(o)}for(const s of As({dot:2*n,caps:i?this.design?.shape.caps??0:0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:t,mixFrom:o})){const t=document.createElementNS(qs,"circle");t.setAttribute("cx",s.forward.toFixed(2)),t.setAttribute("r",s.r.toFixed(2)),t.setAttribute("fill",s.colour),s.opacity<1&&t.setAttribute("fill-opacity",s.opacity.toFixed(3)),e.appendChild(t)}}createDot(e,t){const i=document.createElementNS(qs,"g");return i.setAttribute("class","fan-dot"),i.dataset.key=t,e.group.appendChild(i),i}setDotRadius(e){this.dotRadius=e}setDotScale(e){Number.isFinite(e)&&e>0&&(this.dotScale=e)}pause(){if(!this.paused){this.paused=!0;for(const e of this.lines.values())for(const t of e.animations)t?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.lines.values())for(const t of e.animations)t?.play()}}destroy(){for(const e of this.lines.values()){for(const t of e.animations)t?.cancel();for(const t of e.dots)t.remove();e.group.remove(),e.path.remove()}this.lines.clear(),this.defs?.remove(),this.defs=void 0,this.clip=void 0}}const Hs=e=>e.toFixed(1);function Ks(e,t,i,o=10){const n=0===t.y?0:o,s={x:e.x+t.x*n,y:e.y+t.y*n},r=i.x<s.x?-1:1,a=Math.abs(i.x-s.x),l=Math.min(160,Math.max(40,.6*a)),c=s.x+r*Math.min(l,a),d=l/2;return`${n>0?`M${Hs(e.x)},${Hs(e.y)} L${Hs(s.x)},${Hs(s.y)}`:`M${Hs(e.x)},${Hs(e.y)}`} C${Hs(s.x+Math.abs(t.x)*r*d)},${Hs(s.y+t.y*d)} ${Hs(c-r*d)},${Hs(i.y)} ${Hs(c)},${Hs(i.y)} L${Hs(i.x)},${Hs(i.y)}`}function js(e,t,i,o,n,s,r={x:o,y:0},a=10){const l=o=>t.some(t=>function(e,t=24){const i=[],o=e.match(/[MLC]|-?\d+(?:\.\d+)?/g)??[];let n={x:0,y:0},s=0;const r=()=>Number(o[s++]);for(;s<o.length;){const e=o[s++];if("M"===e)n={x:r(),y:r()},i.push(n);else if("L"===e){const e={x:r(),y:r()};for(let o=1;o<=t;o++){const s=o/t;i.push({x:n.x+(e.x-n.x)*s,y:n.y+(e.y-n.y)*s})}n=e}else if("C"===e){const e={x:r(),y:r()},o={x:r(),y:r()},s={x:r(),y:r()};for(let r=1;r<=t;r++){const a=r/t,l=1-a;i.push({x:l*l*l*n.x+3*l*l*a*e.x+3*l*a*a*o.x+a*a*a*s.x,y:l*l*l*n.y+3*l*l*a*e.y+3*l*a*a*o.y+a*a*a*s.y})}n=s}}return i}(Us(e,r,o,{x:i,y:t},a)).some(e=>n.some(t=>Math.hypot(e.x-t.x,e.y-t.y)<t.r)||(s?.(e.x,e.y)??!1))),c=i-8*o;let d=e.x;for(;o*(c-d)>0&&l(d);)d+=2*o;return o*(d-c)>0?c:d}function Us(e,t,i,o,n=10){const s=o.x<e.x?-1:1;if(s*(i-e.x)<1)return Ks(e,t,o,n);const r=0===t.y?0:n,a={x:e.x+t.x*r,y:e.y+t.y*r},l=Math.max(0,s*(i-a.x)),c=s*Math.min(20,l/2),d=r>0?`L${Hs(a.x)},${Hs(a.y)} C${Hs(a.x+c)},${Hs(a.y)} ${Hs(i-c)},${Hs(a.y)} ${Hs(i)},${Hs(a.y)}`:`L${Hs(i)},${Hs(a.y)}`,h=function(e,t,i){return Math.max(8,Math.min(i*(t-e),160))}(i,o.x,s),u=s*(h/2),p=i+s*h;return`M${Hs(e.x)},${Hs(e.y)} ${d} C${Hs(i+u)},${Hs(a.y)} ${Hs(p-u)},${Hs(o.y)} ${Hs(p)},${Hs(o.y)} L${Hs(o.x)},${Hs(o.y)}`}function Zs(e,t){if(t.height>e.bottom-e.top)return 0;const i=Math.min(e.bottom-t.height,Math.max(e.top,t.node-t.height/2));return Math.round(i-t.top)}function Qs(e,t){return e.isRest?e.name||Te("list.rest",t):e.name}function Gs(e,t="house"){return V`<ha-icon
    class="origin-icon"
    aria-hidden="true"
    .icon=${e.icons[t]??xn[t]}
    style="color:${e.colors[t]}"
  ></ha-icon>`}function Js(e){return e<=4?40:e<=7?34:28}function Ys(e){if(void 0!==e.value)return e.min===e.max?e.value>=e.max?1:0:Math.max(0,Math.min(1,(e.value-e.min)/(e.max-e.min)))}function Xs(e,t){if(void 0===e.value)return"";const i=t.states?.[e.entity],o=e.unit??i?.attributes?.unit_of_measurement;if(e.percent||"%"===o)return function(e,t){const i=new Intl.NumberFormat(Mo(t),{maximumFractionDigits:0}).format(Math.round(e)),o=xo(t?.locale?.language??t?.language);return`${i}${vo.has(o)?" ":""}%`}(e.value,t);return Po({entity_id:e.entity,state:String(e.value),attributes:{...i?.attributes??{},...o?{unit_of_measurement:o}:{}},last_changed:"",last_updated:""},t,"ha")}function er(e,t,i,o){const n=function(e,t,i){if(e.label)return e.label;if("ring"===t)return Te("list.charge_label",i);const o=i.states?.[e.entity]?.attributes?.friendly_name;return"string"==typeof o&&o?o:e.entity}(e,t,i);let s;return s=void 0===e.value?Te("list.charge_unknown",i,{label:n}):e.stale&&void 0!==e.since?Te("list.charge_stale",i,{label:n,value:Xs(e,i),time:Co(e.since,i)}):Te("list.charge",i,{label:n,value:Xs(e,i)}),o?Te("list.indicator_now",i,{text:s}):s}function tr(e,t,i,o,n,s=[],r=!1){const a=t.list.enabled;if(!a&&(0===s.length||r))return j;const l=ir(e,t,s);return V`
    <div class="list ${n?"stacked":""}" style="--el-row-h:${Js(l)}px">
      ${t.list.title?V`<p class="list-title">${t.list.title}</p>`:j}
      ${s.length>0&&!r?or(s,t,i,o,n):j}
      ${a?function(e,t,i,o,n){return V`
      <div class="rows">
        ${n?Gs(t):j}
        ${cn(e.entries,e=>e.key,e=>nr(e,t,i,o,n,!1))}
      </div>
  `}(e,t,i,o,n):j}
    </div>
  `}function ir(e,t,i){return(t.list.enabled?e.entries.length:0)+i.length}function or(e,t,i,o,n){return V`<div class="pv-rows">
    ${n?Gs(t,"solar"):j}
    ${cn(e,e=>e.key,e=>nr(e,t,i,o,n,!0))}
  </div>`}function nr(e,t,i,o,n,s){const r=void 0!==t.energy,a=function(e,t){const i=e.indicators;return!i||t.energy&&!i.inEnergy?{}:i.slots}(e,t),{ring:l,bar_top:c,bar_bottom:d,fill:h}=a,u=function(e,t){if(!e.idle||t.energy||!e.indicators)return;const i=e.indicators.idleValue;if("power"===i)return;const o=e.indicators.slots[i];return void 0===o?.value?void 0:o}(e,t),p=e.indicators?.idleValue,m=e.powerUnknown?"—":$o(e.w,i,t.power),f=u?Xs(u,i):m,g=t.energy?e.isRest?t.energy.rest:t.energy.consumers[e.entity??""]:void 0,_=g&&g.tier>0?`warn${g.tier}`:"",w=e.isRest?"single"===t.sources.house.kind||e.indicators&&(!r||e.indicators.inEnergy)?"rest":void 0:e.entity?s?`source:${e.key}`:`consumer:${e.key}`:void 0,y=t=>o(e.entity??"",t,w),b=Object.entries(a).map(([e,t])=>er(t,e,i,r)),v=[`${Qs(e,i)} ${m}`,...b].join(", "),x=[l&&er(l,"ring",i,r),h&&er(h,"fill",i,r)].filter(Boolean).join("\n"),k=h?Ys(h)??0:0,$=l||h?V`<span
          class="swatch ${e.icon?"icon":"dot"} ${h?"filled":""} ${h?.stale?"stale":""}"
          style="color:${e.color};--el-fill:${(100*k).toFixed(1)}%"
          title=${x}
          @click=${y}
          >${l?function(e,t){const i=11.2,o=2*Math.PI*i,n=o*(Ys(e)??0);return V`<svg
    class="charge-ring ${e.stale?"stale":""}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style="color:${e.color??t}"
  >
    <circle class="track" cx="12" cy="12" r=${i}></circle>
    ${n>0?H`<circle
          class="fill"
          cx="12"
          cy="12"
          r=${i}
          stroke-dasharray=${`${n.toFixed(2)} ${o.toFixed(2)}`}
          transform="rotate(-90 12 12)"
        ></circle>`:j}
  </svg>`}(l,e.color):j}${e.icon?V`<ha-icon .icon=${e.icon}></ha-icon>`:j}</span
        >`:e.icon?V`<ha-icon class="swatch icon" .icon=${e.icon} style="color:${e.color}"></ha-icon>`:V`<span class="swatch dot" style="color:${e.color}"></span>`,S=(t,o)=>t?V`<span
          class="bar ${"bar_top"===o?"top":"bottom"} ${t.stale?"stale":""}"
          style="--bar-color:${t.color??e.color};--bar-fill:${(100*(Ys(t)??0)).toFixed(1)}%"
          title=${er(t,o,i,r)}
          @click=${y}
        ></span>`:j;return V`
            <div
              class="row ${s?"pv":""} ${e.isRest?"rest":""} ${l||h?"charge":""} ${u?.stale?"stale":""} ${e.highlight?.bold?"bold":""} ${e.highlight?.band?"band":""}"
              style=${e.highlight?.band?`--el-row-color:${e.color}`:""}
              data-key=${e.key}
            >
              ${n?V`<span class="lane" aria-hidden="true"></span>`:j}
              ${$}
              <span class="name">${Qs(e,i)}</span>
              <span
                class="row-value ${u?"soc":""} ${_}"
                title=${g?.note??""}
                style=${u&&p&&"fill"!==p&&u.color?`color:${u.color}`:""}
                >${f}</span
              >
              ${e.entity||w?V`<button
                    class="row-hit"
                    title=${g?.note??""}
                    aria-label=${v}
                    @click=${y}
                  ></button>`:j}
              ${S(c,"bar_top")}${S(d,"bar_bottom")}
            </div>
          `}class sr{constructor(){this.positions=new Map,this.targets=new Map}static top(e,t){return e.getBoundingClientRect().top-t.getBoundingClientRect().top}capture(e){if(this.positions.clear(),this.blockTop=void 0,!e)return;const t=e.querySelector(".rows");t&&(this.blockTop=sr.top(t,e));for(const t of e.querySelectorAll(".row")){const i=t.dataset.key;i&&this.positions.set(i,sr.top(t,e))}}play(e,t){if(!e)return;const i=t&&"function"==typeof Element.prototype.animate,o=new Set,n=e.querySelector(".rows"),s=n&&void 0!==this.blockTop?this.blockTop-sr.top(n,e):0,r=e.querySelector(".row")?.getBoundingClientRect().height||28,a=this.positions.size>0?s:Math.max(-r,Math.min(r,s));for(const t of e.querySelectorAll(".row")){const n=t.dataset.key;if(!n)continue;o.add(n);const s=this.positions.get(n),r=sr.top(t,e),l=sr.runningGlide(t);if(l&&this.targets.get(n)===r)continue;if(this.targets.set(n,r),void 0===s){if(i){t.animate([{opacity:0,transform:`translateY(${a}px)`},{opacity:1,transform:`translateY(${.45*a}px)`,offset:.33},{opacity:1,transform:"none"}],{duration:ar,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=rr}continue}const c=s-r;if(!c||!i)continue;l?.cancel();t.animate([{transform:`translateY(${c}px)`},{transform:"none"}],{duration:ar,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=rr}for(const e of[...this.targets.keys()])o.has(e)||this.targets.delete(e);this.positions.clear()}gliding(e){if(!e)return!1;for(const t of e.querySelectorAll(".row"))if(sr.runningGlide(t))return!0;return!1}static runningGlide(e){if("function"==typeof e.getAnimations)return e.getAnimations().find(e=>e.id===rr&&("running"===e.playState||"pending"===e.playState))}}const rr="enerlens-glide",ar=600;function lr(e,t){const i=function(e){return!Number.isFinite(e)||e<=0?1:Math.sqrt(Math.min(e,1))}(e),o=e=>Math.round(1e3*e)/1e3;return{dot:o(t.dotSize/100*i),line:o(t.lineWidth/100*i)}}function cr(e,t,i){if(e.solarSources.length<2)return[];const o=[];for(const n of e.solarSources){if(!n.reading.available)continue;const e=n.reading.w;!i&&e<t.minConsumerW||o.push({key:n.key,name:n.name,w:e,color:n.color,entity:n.entity,icon:n.icon,threshold:t.minConsumerW,isRest:!1})}return o.sort((e,t)=>t.w-e.w)}function dr(e,t,i,o){const n=e.solarSources.filter(e=>e.reading.available&&e.reading.w>0&&Si({w:e.reading.w,threshold:t.minConsumerW},t)),s=e=>{const t=o?.indexOf(e)??-1;return-1===t?Number.POSITIVE_INFINITY:t},r=e=>e.reading.available?e.reading.w:0;n.sort((e,t)=>o&&s(e.key)-s(t.key)||r(t)-r(e));const a=n.reduce((e,t)=>e+r(t),0),l=e.solarSources.reduce((e,t)=>e+1e3*(t.kwp??0),0),c="peak"===i?Math.max(l,a):a,d=n.map(e=>({key:e.key,share:c>0?r(e)/c:0,color:e.color,entity:e.entity,isRest:!1}));if("peak"===i){const e=1-d.reduce((e,t)=>e+t.share,0);e>1e-9&&d.push({key:"__pv_free__",share:e,color:"var(--el-pv-free)",isRest:!0})}return d}class hr{constructor(){this.last=new Map,this.asked=new Set}get values(){return this.last}observe(e,t){for(const i of t){const t=fs(e,i.entity);null!==t&&this.last.set(i.entity,i.invert?-t:t)}}missing(e,t){return t.map(e=>e.entity).filter(t=>!this.asked.has(t)&&!this.last.has(t)&&null===fs(e,t))}async prefill(e,t,i,o=5e3){if(0===i.length)return;for(const e of i)this.asked.add(e);const n=Date.now(),s=e.callWS({type:"history/history_during_period",start_time:new Date(n-864e6).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[...i],minimal_response:!0,no_attributes:!0});let r;s.catch(()=>{});const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error("EnerLens: PV history timed out")),o)});let l;try{l=await Promise.race([s,a])}finally{void 0!==r&&clearTimeout(r)}if(null!==l&&"object"==typeof l)for(const o of i){const i=l[o];if(!Array.isArray(i))continue;const n=e.states[o];let s;for(const t of i){if("string"!=typeof t.s)continue;const i=fs({...e,states:{[o]:{...n,entity_id:o,state:t.s}}},o),r="number"==typeof t.lc?t.lc:t.lu;null!==i&&"number"==typeof r&&((!s||r>s.t)&&(s={w:i,t:r}))}const r=!0===t.find(e=>e.entity===o)?.invert;s&&!this.last.has(o)&&this.last.set(o,r?-s.w:s.w)}}}const ur=s`
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
    /* The free rest of the PV ring under "% kWp" (PV-5): fainter than a line. */
    --el-pv-free: rgba(127, 127, 127, 0.22);
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
    /* Above the body that follows: the tap areas of the last row of quick
       buttons reach a few pixels below the header (QB-14). */
    position: relative;
    z-index: 1;
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

  /* Mode chips and the list filter share one row at the right of the header.
     Too many for one row - expanded quick buttons (QB-11) - they wrap, a whole
     quick button at a time, and stay on the right. */
  .controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex: 0 1 auto;
    min-width: 0;
    margin-left: auto;
  }

  /* --- Expanded quick buttons (REQ QB-9, QB-10, QB-14) ------------------- */

  /* A quick button never breaks apart - unless it alone is wider than the
     card (QB-14, B). */
  .quick-group {
    display: inline-flex;
    flex-wrap: wrap;
    flex: none;
    max-width: 100%;
    align-items: stretch;
  }

  .quick-option {
    position: relative;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 18px;
  }

  /* The tap area of a segment is 36 px whatever is drawn (I-3, QB-14): the
     bar's own border is no target, so the segment reaches past it. */
  .controls:not(.qs-single) .quick-option::after {
    content: "";
    position: absolute;
    inset: -1px 0;
  }

  /* Inside, so a segment's rounding cannot cut it off (QB-14). */
  .quick-option:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -3px;
  }

  /* Segment buttons: one bar per quick button, the chosen value filled.
     36 px tall, the segments touch (QB-9, QB-14). */
  .controls:not(.qs-single) .quick-group {
    border: 1px solid var(--primary-color);
    border-radius: 18px;
  }
  .controls:not(.qs-single) .quick-option {
    min-height: 34px;
    padding: 0 11px;
  }
  .controls:not(.qs-single) .quick-option + .quick-option {
    border-left: 1px solid var(--primary-color);
  }
  .controls:not(.qs-single) .quick-option:first-child {
    border-radius: 17px 0 0 17px;
  }
  .controls:not(.qs-single) .quick-option:last-child {
    border-radius: 0 17px 17px 0;
  }
  .controls:not(.qs-single) .quick-option.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* Compact: 28 px, the same type; the tap area stays 36 px (I-3, QB-14):
     every target reaches 4 px beyond what is drawn, rows 10 px apart. */
  .controls.qs-segment-compact {
    row-gap: 10px;
  }
  .controls.qs-segment-compact .quick-option {
    min-height: 26px;
    padding: 0 8px;
  }
  .controls.qs-segment-compact .quick-option:first-child {
    border-radius: 13px 0 0 13px;
  }
  .controls.qs-segment-compact .quick-option:last-child {
    border-radius: 0 13px 13px 0;
  }
  .controls.qs-segment-compact .mode-chip {
    min-height: 28px;
    padding: 0 10px;
  }
  .controls.qs-segment-compact .filter-toggle {
    width: 28px;
    height: 28px;
  }
  .controls.qs-segment-compact .quick-option::after,
  .controls.qs-segment-compact .mode-chip::after,
  .controls.qs-segment-compact .filter-toggle::after {
    content: "";
    position: absolute;
    /* From the padding box: 26 px inside the border, 36 px with this. */
    inset: -5px 0;
  }
  .controls.qs-segment-compact .mode-chip,
  .controls.qs-segment-compact .filter-toggle {
    position: relative;
  }

  /* Single buttons: each value round on its own, a thin frame around the
     quick button (QB-9). */
  .controls.qs-single .quick-group {
    gap: 4px;
    padding: 3px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    border-radius: 22px;
  }
  .controls.qs-single .quick-option {
    min-height: 36px;
    min-width: 36px;
    padding: 0 12px;
    border-radius: 18px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
  }
  .controls.qs-single .quick-option.selected {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  /* Counted from a late start: amber, the date only in the tooltip (EM-9, QB-14). */
  .quick-option.late {
    color: var(--el-warn2);
  }
  .controls:not(.qs-single) .quick-option.late.selected {
    background: var(--el-warn2);
    color: var(--text-primary-color, #fff);
  }
  .controls.qs-single .quick-option.late {
    color: var(--el-warn2);
  }
  .controls.qs-single .quick-option.late.selected {
    border-color: var(--el-warn2);
  }

  /* The smoothing in an energy period: all grey, the remembered value
     filled light grey, nothing to tap (QB-5, QB-14, A). */
  .controls .quick-group.off,
  .controls .quick-group.off .quick-option + .quick-option {
    border-color: var(--divider-color, rgba(127, 127, 127, 0.3));
  }
  .quick-group.off .quick-option {
    color: var(--disabled-text-color, var(--secondary-text-color));
    cursor: default;
  }
  .quick-group.off .quick-option.selected {
    background: var(--divider-color, rgba(127, 127, 127, 0.3));
    border-color: var(--divider-color, rgba(127, 127, 127, 0.3));
    color: var(--secondary-text-color);
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

  .node .value.figure .arrow.diagonal {
    width: 1em;
    height: 1em;
    margin-block: -0.1em;
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
  /* Outside: the upper row's labels above, all others below (AN-5). */
  .node.label-above .label {
    bottom: calc(100% + 10px);
  }

  .node:not(.label-above) .label {
    top: calc(100% + 10px);
  }

  /* Triangles: the middle node's label lies on the lines below it - on a ground of the
     card's own colour, so it stays readable, transparent card or not (AN-5). */
  .node.label-ground .label {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: 4px;
    padding: 0 4px;
    z-index: 2;
  }

  /* The triangle is tall - 1.4 times its width: never wider than 320 px, below
     the list too, or it takes a phone's whole screen (24.10.2026). */
  .body.layout-triangle .cross,
  .body.layout-triangle.stacked .cross,
  .body.layout-triangle.no-list .cross,
  .body.layout-triangle-battery .cross,
  .body.layout-triangle-battery.stacked .cross,
  .body.layout-triangle-battery.no-list .cross {
    max-width: min(320px, 100%);
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

  /* Beside the drawing the blocks share one column, as wide as the widest
     row of both and pushed to the right: PV rows and consumers then have
     their marks, names and values one below the other (PV-7). A grid, not a
     block per row width - and only the width: the blocks keep their heights
     and their gap, the vertical placement (L-17) is untouched. */
  .list:not(.stacked) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
  }

  .list:not(.stacked) > * {
    grid-column: 2;
  }

  /* The title keeps the whole width, as before, and does not widen the rows'
     column: an item spanning a flexible track does not size the others. */
  .list:not(.stacked) > .list-title {
    grid-column: 1 / -1;
  }

  .list:not(.stacked) .rows,
  .list:not(.stacked) .pv-rows {
    min-width: 0;
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

  /* Extra values on the mark (REQ L-15, L-20): a thin ring around it, and/or
     the mark filling from below. Above the row's target so its tooltip shows;
     a tap on it opens the same window as the row. */
  .row.charge .swatch {
    position: relative;
    z-index: 1;
    cursor: pointer;
  }

  /* The fill of a plain mark: an outline, filled from below. */
  .swatch.dot.filled::after {
    box-sizing: border-box;
    border: 1.5px solid currentColor;
    background: linear-gradient(to top, currentColor var(--el-fill), transparent var(--el-fill));
  }

  /* The fill of an icon: a tank behind it (L-20, variant D chosen by Markus
     29.10.2026). The icon stays in full colour; a rounded field behind it
     fills from below - a faint copy of a thin icon was hard to read. */
  .swatch.icon.filled::before,
  .swatch.icon.filled::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 4px;
    z-index: -1;
  }

  .swatch.icon.filled::before {
    background: var(--secondary-text-color);
    opacity: 0.12;
  }

  .swatch.icon.filled::after {
    background: currentColor;
    opacity: 0.3;
    clip-path: inset(calc(100% - var(--el-fill)) 0 0 0);
  }

  /* A stale value greys the fill, not the consumer's own mark. */
  .swatch.icon.filled.stale::after {
    background: var(--secondary-text-color);
  }

  .swatch.dot.filled.stale {
    color: var(--secondary-text-color) !important;
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

  .charge-ring.stale {
    color: var(--secondary-text-color) !important;
  }

  .row.stale .row-value.soc {
    color: var(--secondary-text-color) !important;
  }

  .row.stale .row-value.soc {
    font-weight: 400;
  }

  /* The bars of a row (REQ L-20): 2 px near its top and bottom edge, from the
     name to the value, the row's height untouched. The element itself is a
     12 px strip around the line, so a mouse finds its tooltip; a tap falls
     through to the row's window. Track faint, fill in the bar's colour. */
  .bar {
    position: absolute;
    z-index: 1;
    left: calc(var(--el-swatch) + 6px);
    right: 0;
    /* Wide enough to find with the mouse (Markus 29.10.2026); the middle of
       the row with name and value stays free. */
    height: 12px;
    cursor: pointer;
  }

  /* On the edge itself a line reads as part of the neighbouring row
     (headless look, 29.10.2026). */
  .bar.top {
    top: 0;
  }

  .bar.bottom {
    bottom: 0;
  }

  .bar::before,
  .bar::after {
    content: "";
    position: absolute;
    left: 0;
    height: 2px;
    border-radius: 1px;
    background: var(--bar-color);
  }

  .bar::before {
    right: 0;
    opacity: 0.22;
  }

  .bar::after {
    width: var(--bar-fill);
  }

  /* 12 px strips inside the row, the line 3 px from its edge. */
  .bar.top::before,
  .bar.top::after {
    top: 3px;
  }

  .bar.bottom::before,
  .bar.bottom::after {
    bottom: 3px;
  }

  .bar.stale::before,
  .bar.stale::after {
    background: var(--secondary-text-color);
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
    /* The columns belong to the list, so the PV rows and the consumers share
       them (PV-7): the longest name of both decides. */
    .list.stacked {
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

    .list.stacked > * {
      grid-column: 1 / -1;
    }

    .list.stacked .rows,
    .list.stacked .pv-rows {
      display: grid;
      grid-template-columns: subgrid;
    }

    .list.stacked .row {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: center;
    }

    /* The row starts with the runway the fan lines cross; the band (L-19)
       covers mark, name and value only - an absolutely placed child of a
       grid takes its grid area as its box. */
    .list.stacked .row.band::before {
      grid-column: 2 / -1;
      grid-row: 1;
    }

    /* Below the cross the bars run over name and value only (L-20). */
    .list.stacked .bar {
      grid-column: 3 / -1;
      grid-row: 1;
      left: 0;
    }

    .list.stacked .lane {
      width: auto;
    }
  }

  /* Stacked, the lines gather left of the block; the icon marks that point as
     the house they come from. Absolute, so it stays out of the row grid, and
     only in this layout - beside the cross the house node itself is the
     starting point. */
  .list.stacked .rows,
  .list.stacked .pv-rows {
    position: relative;
  }

  /* Square, solar left (AN-3): the PV rows on their own left of the drawing,
     mirrored - value, name, mark, the mark towards the drawing. Both lists grow
     alike, so the drawing stands in the middle and both fans are equally wide
     ("breiter aber symmetrischer Aufbau"). Too narrow for that, both lists go
     below (the card measures it, _checkStacked). */
  .body.split .cross {
    max-width: min(320px, 44%);
  }

  .list.pv-side {
    grid-template-columns: minmax(0, max-content) minmax(0, 1fr);
  }

  .list.pv-side > * {
    grid-column: 1;
  }

  .list.pv-side .pv-rows {
    margin-bottom: 0;
  }

  .list.pv-side .row {
    flex-direction: row-reverse;
  }

  .list.pv-side .row .name {
    text-align: right;
  }

  /* The PV rows above the consumers, 10 px apart (PV-7, L-17). */
  .pv-rows {
    margin-bottom: 10px;
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

  /* Highlight (REQ L-19). The band reaches a little beyond the row on both
     sides, drawn behind it, so names and values keep their place and the
     fan line still ends on the mark. Bold weighs name and value. */
  .row.band::before {
    content: "";
    position: absolute;
    inset: 1px -6px;
    border-radius: 6px;
    background: var(--el-row-color);
    opacity: 0.14;
    pointer-events: none;
    z-index: -1;
  }

  .row.band {
    isolation: isolate;
  }

  /* Bold wins over the plain weight of a stale charge: grey says "not fresh",
     the weight says "highlighted", and the two do not exclude each other. */
  .row.bold .name,
  .row.bold .row-value,
  .row.bold.stale .row-value.soc {
    font-weight: 700;
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
`,pr="view-mode",mr="show-all",fr="energy-period",gr="pv-scale",_r=3e5,wr=ar+400;function yr(e,t){try{localStorage.setItem(e,t)}catch{}}function br(e){try{return localStorage.getItem(e)}catch{return null}}function vr(e){const t=Number.parseFloat(getComputedStyle(e).opacity);return Number.isNaN(t)?1:t}function xr(e,t){if(!e||!t)return e===t;const i=(e,t)=>e.length===t.length&&e.every((e,i)=>e===t[i]);return e.entity===t.entity&&i(e.outage,t.outage)&&i(e.ok,t.ok)}const kr=Object.fromEntries(Object.keys(gi).map(e=>[gi[e],{entity_id:gi[e],state:String(_i[e]),attributes:{unit_of_measurement:"W",device_class:"power"},last_changed:"",last_updated:""}])),$r=new Set,Sr=e=>"object"==typeof e&&null!==e,Ar=e=>!0===e.preview;function Mr(e){const t=[];let i=e;for(;i;)t.unshift(i),i=i.parentNode??(i instanceof ShadowRoot?i.host:null);return t}function Er(e,t){const i=Mr(e),o=Mr(t);let n=0;for(;n<i.length&&n<o.length&&i[n]===o[n];)n++;return n>=i.length||n>=o.length?i.length-o.length:i[n]instanceof ShadowRoot?-1:o[n]instanceof ShadowRoot?1:i[n].compareDocumentPosition(o[n])&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}class Cr extends ce{constructor(){super(...arguments),this._entityIds=[],this._chargeIds=[],this._extraIds=[],this._charge=new ye,this._solarMemory=new hr,this._chargeOf=e=>this._charge.state(this._hass,e),this._holds=new cs,this._heldOf=e=>this._holds.held(e,null!==this._period),this._rows=new sr,this._lastEntries=new Map,this._lastSolar=new Map,this._mode="current",this._designsPickedUp=!1,this._ring=new pn,this._solarRing=new pn,this._fanFollowUntil=0,this._technique="static",this._visible=!0,this._stacked=!1,this._stackedWidth=0,this._settled=!1,this._showAll=!1,this._pvScale="share",this._scale=1,this._plotScale=1,this._holeR=Ro,this._seeThrough=!1,this._outagePrefilled=!1,this._energyPeriod=null,this._energyChosen=!1,this._energyViews=new Map,this._energyKey="",this._energyAsked=new Map,this._statsKey="",this._statsRemembered=!1,this._statsRetryAt=0,this._rememberPending=!1,this._onVisibility=()=>{this._syncPlayState(),"hidden"===document.visibilityState?this._pause(Date.now()):this._resume()},this._onMotionChange=()=>this.requestUpdate(),this._onTransitionEnd=e=>{const{propertyName:t,target:i}=e;if("outline-color"!==t||!(i instanceof HTMLElement))return;const o=i.classList.contains("node")?i.closest(".plot"):null;o&&this._measureHoles(o)},this._pathZoom=1,this._onWindowResize=()=>this._measurePathZoom(),this._example=!1,this._onMoreInfo=e=>{this._example&&e.stopPropagation()},this._onDetail=e=>{if(e.stopPropagation(),this._example)return;const t=e.detail,i=e.composedPath()[0];Ar(this)?t.entity&&vn(i??this,t.entity):this.dispatchEvent(new CustomEvent("show-dialog",{bubbles:!0,composed:!0,detail:{dialogTag:mi,dialogImport:()=>Promise.resolve(),dialogParams:{card:this,node:t.node,origin:i,entity:t.entity}}}))}}get _period(){if(!this._energyPeriod||this._example)return null;const e=!1!==this._config?.view.power;return this.preview&&!this._energyChosen&&e?null:this._energyPeriod}_energyOffer(e){const t=e.view,i=t.energyDefault&&!0!==this._statsOk?[]:t.energyPeriods;return[...t.power?[null]:[],...i]}_statsWaiting(e){return e.view.energyDefault&&void 0===this._statsOk&&!this._example}_startEnergy(e,t){const i=this._energyOffer(e),o="power"===e.view.defaultEnergy?null:e.view.defaultEnergy;let n=i.includes(o)?o:i[0]??null;if(t&&e.view.remember&&i.length>1){const e=br(this._memKey(fr)),t=i.find(t=>(t??"kw")===e);void 0!==t&&(n=t)}this._energyPeriod=n}_applyRemembered(){const e=this._config;if(e?.view.remember){if(e.view.modes.length>1){const t=e.view.modes.find(e=>e===br(this._memKey(pr)));t&&(this._mode=t)}if(e.list.scope.length>1){const t=br(this._memKey(mr));"1"===t&&(this._showAll=e.list.scope.includes("full")),"0"===t&&(this._showAll=!e.list.scope.includes("filtered"))}if(e.view.pvScales.length>1){const t=e.view.pvScales.find(e=>e===br(this._memKey(gr)));t&&(this._pvScale=t)}this._startEnergy(e,!0),this._hass&&(this._tickModel=this._modelForMode(this._hass,e))}}_memKey(e){const t=this._config?.memoryId;if(!t)return`enerlens-${e}`;const i=location.pathname.replace(/^\/+|\/+$/g,"");let o=0;return Ar(this)||(o=this._rankInDashboard(t)??this._rankOnPage(t)),`enerlens:${i}:${t}${o>0?`#${o+1}`:""}:${e}`}_rankInDashboard(e){let t,i;for(const e of Mr(this).reverse()){const o=e;void 0===t&&"hui-card"===o.localName&&o.config&&(t=o.config),!i&&Sr(o.lovelace?.config)&&(i=o.lovelace.config)}if(void 0!==t&&i&&Array.isArray(i.views))for(const o of i.views){const i=di(o),n=i.indexOf(t);if(-1!==n)return i.slice(0,n).filter(t=>hi(t.memory_id)===e).length}}_rankOnPage(e){const t=[...$r].filter(t=>t.isConnected&&!Ar(t)&&t._config?.memoryId===e).sort(Er);return Math.max(0,t.indexOf(this))}_checkStatistics(){const e=this._config,t=this._realHass;if(!e?.view.energyDefault||!t||this._example)return;const i=ro(e).join(","),o=this._statsRetryAt>0&&Date.now()>=this._statsRetryAt;(i!==this._statsKey||o)&&(this._statsKey=i,this._statsRetryAt=0,o||(this._statsOk=void 0),function(e,t){const i=ro(t),o=i.join(","),n=ao.get(o);if(n)return n;const s=(async()=>{if(0===i.length||"function"!=typeof e.callWS)return!1;const t=await e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:i});if(!Array.isArray(t))return!1;const o=new Set(t.filter(e=>"object"==typeof e&&null!==e).filter(e=>(1===e.mean_type||!0===e.has_mean)&&"power"===e.unit_class).map(e=>e.statistic_id));return i.every(e=>o.has(e))})().catch(e=>{ao.delete(o),console.warn(e)});return ao.set(o,s),s}(t,e).then(e=>{this._statsKey===i&&(void 0===e&&(this._statsRetryAt=Date.now()+3e4),this._statsOk=e??!1,!1===e&&console.warn(Te("energy.no_statistics",t)),e&&this._config&&(this._startEnergy(this._config,!this._statsRemembered),this._statsRemembered=!0),this.requestUpdate())}))}_shownConfig(){const e=this._config,t=this._period;return t?function(e,t){const i=t?.hours??1,o=1/i;return{...e,power:{...e.power,energyHours:i},minConsumerW:e.minConsumerW*o,consumers:e.consumers.map(e=>void 0===e.minW?e:{...e,minW:e.minW*o}),energy:t?.marks??{roles:{},consumers:{},rest:{tier:0,note:""}}}}(e,this._energyViews.get(t)):e}_flowsOf(e){const t=this._period;return t?this._energyViews.get(t)?.flowsW??{}:function(e){return bi(e.solar.available?e.solar.w:0,e.grid.available?e.grid.positive:0,e.grid.available?e.grid.negative:0,e.battery?.available?e.battery.positive:0,e.battery?.available?e.battery.negative:0,e.house.available?e.house.w:0)}(e)}_cycleEnergy(){if(!this._config)return;const e=this._energyOffer(this._config),t=void 0!==this._energyPending?this._energyPending:this._period;this._selectEnergy(e[(e.indexOf(t)+1)%e.length])}_selectEnergy(e){const t=this._hass;if(!this._config)return;if(null===e||void 0!==t&&this._fresh(e,t,Date.now()))return this._energyPending=void 0,void this._showEnergy(e);this._energyPending=e,this.requestUpdate(),this._ensureEnergy(e,!0)}_showEnergy(e){this._energyPeriod=e,this._energyChosen=!0;const t=this.preview;this._config?.view.remember&&!t&&yr(this._memKey(fr),e??"kw"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}detailState(){return this._config?{config:this._config,shown:[...this._lastEntries?.keys()??[]].filter(e=>e!==je),period:void 0!==this._energyPending?this._energyPending:this._period,periods:this._energyOffer(this._config).filter(e=>null!==e)}:null}async detailEnergy(e){const t=this._hass,i=this._config;if(!t||!i)throw new Error("EnerLens: no configuration");const o=Date.now(),n=this._energyViews.get(e);if(n?.detail&&this._fresh(e,t,o)&&o-n.fetchedAt<_r)return n;const s=this._energyKey,r=await go(t,i,e,o);return s===this._energyKey&&(this._energyViews.set(e,r),this._period===e&&this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this.requestUpdate())),r}_fresh(e,t,i){const o=this._energyViews.get(e);return void 0!==o&&o.start===uo(e,Vi(e,i,mo(t),po(t)))}_ensureEnergy(e,t=!1){const i=e??this._period,o=this._hass,n=this._config;if(!i||!o||!n)return;const s=Date.now(),r=uo(i,Vi(i,s,mo(o),po(o))),a=this._energyAsked.get(i);if(a?.open)return;if(!t&&a&&a.start===r&&s-a.at<_r)return;const l={at:s,start:r,open:!0};this._energyAsked.set(i,l);const c=this._energyKey;go(o,n,i,s).then(e=>{if(l.open=!1,c===this._energyKey){if(this._energyViews.set(i,e),this._energyPending===i)return this._energyPending=void 0,void this._showEnergy(i);this._hass&&this._config&&this._period===i&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}}).catch(e=>{console.warn(e),l.open=!1,c===this._energyKey&&(this._energyAsked.get(i)===l&&(l.at=s-_r+3e4),this._energyPending===i&&(this._energyPending=void 0,this.requestUpdate()))})}_energyChip(e,t){if(this._example)return;const i=this._statsWaiting(t),o=i?[...t.view.power?[null]:[],...t.view.energyPeriods]:this._energyOffer(t),n=void 0!==this._energyPending?this._energyPending:this._period;if(o.length<2&&null===n&&!i)return;const s=n?this._energyViews.get(n):void 0,r=o[(o.indexOf(n)+1)%o.length],a=t.power.unit,l=yo(n,s,e,a),c=null!==n&&!0===s?.lateStart;return{labels:o.map(t=>yo(t,void 0,e,a)),active:l,ariaLabel:Te("energy.chip",e,{mode:l,next:yo(r,void 0,e,a)}),inPeriod:null!==n,late:c,waiting:i,title:c&&s?Te("energy.late",e,{date:wo(s.from,e,!0)}):"",onCycle:()=>this._cycleEnergy(),options:o.map(t=>{const i=t?this._energyViews.get(t):void 0,o=null!==t&&!0===i?.lateStart;return{label:yo(t,void 0,e,a),late:o,title:o&&i?Te("energy.late",e,{date:wo(i.from,e,!0)}):""}}),selected:o.indexOf(n),onSelect:e=>this._selectEnergy(o[e])}}get _nodePx(){return Math.max(70,112*this._scale+11)}_geometry(){const e=this._config;return jo(e.layout,e.flow.lines,null!==(this._model?.battery??null))}_cyclePvScale(){const e=this._config?.view.pvScales??[];e.length<2||this._setPvScale(e[(e.indexOf(this._pvScale)+1)%e.length])}_setPvScale(e){this._pvScale=e,this._config?.view.remember&&!Ar(this)&&yr(this._memKey(gr),this._pvScale)}_pvScaleChip(e,t){const i=t.view.pvScales;if(i.length<2)return;const o=t=>Te(`pv_scale.${t}`,e),n=i[(i.indexOf(this._pvScale)+1)%i.length],s="peak"===this._pvScale&&this._period?"pv_scale.peak_period_title":`pv_scale.${this._pvScale}_title`;return{labels:i.map(o),active:o(this._pvScale),ariaLabel:Te("pv_scale.chip",e,{mode:o(this._pvScale),next:o(n)}),title:Te(s,e),onCycle:()=>this._cyclePvScale(),titles:i.map(t=>Te("peak"===t&&this._period?"pv_scale.peak_period_title":`pv_scale.${t}_title`,e)),selected:i.indexOf(this._pvScale),onSelect:e=>this._setPvScale(i[e])}}_toggleShowAll(){this._showAll=!this._showAll,this._config?.view.remember&&!Ar(this)&&yr(this._memKey(mr),this._showAll?"1":"0"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config))}_pause(e){this._pausedAt??=e}_resume(){const e=this._pausedAt;if(void 0===e||!this.isConnected||"hidden"===document.visibilityState)return;if(!1===this._realHass?.connected)return;this._pausedAt=void 0;const t=Date.now();this._lastTick=t,!this._config||t-e<=1e3*this._config.updateIntervalS||(this._buffer?.markGap(e,t),this._historyFor=void 0,this._hass&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}set hass(e){this._realHass=e,!1===e.connected?this._pause(Date.now()):this._resume();const t=this._example,i=this._withExample(e),o=this._hass;this._hass=i,this._config&&(this._checkStatistics(),o&&t===this._example&&!this._shownChanged(o,i)||(this._config.gridStatus&&(this._outage=function(e,t,i){const o=e.states[t.entity]?.state;return Ie(i,o,t,Be(e,t.entity))}(i,this._config.gridStatus,this._outage)),this._observeCharge(i),this._example||this._solarMemory.observe(i,this._config.solarSources),this._model=xs(i,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel??=this._model,this._example||this._recordSamples(i),this.requestUpdate("hass",o)))}_withExample(e){const t=[...this._entityIds,...this._extraIds,...this._chargeIds],i=Object.values(gi);return this._example=this._entityIds.length>0&&t.every(e=>i.includes(e))&&!t.some(t=>e?.states?.[t]||e?.entities?.[t]),this._example?{...e,states:{...e.states,...kr}}:e}get hass(){return this._hass}_shownChanged(e,t){const i=[...this._entityIds,...this._chargeIds,...this._extraIds];return!!i.some(i=>e.states[i]!==t.states[i])||(e.language!==t.language||e.locale!==t.locale||e.formatEntityState!==t.formatEntityState||e.themes!==t.themes||e.connected!==t.connected||e.entities!==t.entities&&i.some(i=>e.entities?.[i]?.display_precision!==t.entities?.[i]?.display_precision))}_observeCharge(e){this._config&&0!==this._chargeIds.length&&(this._charge.observe(e,this._config.consumers),this._holds.observe(e,this._config.consumers))}_ensureLookups(){const e=this._hass;if(!e||!this._config)return;if(this._example||this.preview)return;this._config.gridStatus&&!this._outagePrefilled&&(this._outagePrefilled=!0,this._prefillOutage());const t=this._solarMemory.missing(e,this._config.solarSources);if(t.length>0&&this._solarMemory.prefill(e,this._config.solarSources,t).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=xs(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}),0===this._chargeIds.length)return;const i=this._charge.missing(e,this._config.consumers);0!==i.length&&this._charge.prefill(e,i).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=xs(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()})}setConfig(e){const t=this._config;this._config=li(e,this._hass),this._rawConfig=e,this._entityIds=function(e){const t=[],i=e=>{e&&!t.includes(e)&&t.push(e)};for(const t of[e.sources.solar,e.sources.grid,e.sources.battery,e.sources.house])"single"===t.kind?i(t.entity):"split"===t.kind&&(i(t.positive),i(t.negative));for(const t of e.solarSources)i(t.entity);i(e.sources.batterySoc),i(e.gridStatus?.entity);for(const t of e.consumers)i(t.entity);return t}(this._config),this._chargeIds=function(e){const t=[];for(const i of e.consumers){const e="condition"===i.hold?.kind?i.hold.entity:void 0,o=Object.values(i.indicators?.slots??{}).map(e=>e.entity);for(const i of[...o,e])i&&!t.includes(i)&&t.push(i)}for(const i of Object.values(e.rest?.indicators?.slots??{}))t.includes(i.entity)||t.push(i.entity);return t}(this._config),this._extraIds=function(e){const t=[];for(const i of Zt){if("battery"===i&&"absent"===e.sources.battery.kind)continue;const{inside:o,label:n}=e.nodes[i];for(const e of[o?.entity,n?.entity])e&&!t.includes(e)&&t.push(e)}return t}(this._config),this._realHass&&(this._hass=this._withExample(this._realHass));const i=this._config.view;t&&t.view.avgLongMinutes===i.avgLongMinutes||(this._buffer=new pe(6e4*i.avgLongMinutes)),t||(this._rememberPending=!0),t&&t.view.defaultMode===i.defaultMode&&i.modes.includes(this._mode)||(this._mode=i.defaultMode),t&&t.view.defaultPvScale===i.defaultPvScale&&i.pvScales.includes(this._pvScale)||(this._pvScale=i.defaultPvScale);const o=this._config.list,n=this._showAll?"full":"filtered";t&&t.list.defaultScope===o.defaultScope&&o.scope.includes(n)||(this._showAll="full"===o.defaultScope);const s=function(e){const{roles:t,inverted:i}=no(e);return JSON.stringify([t,[...i],e.solarSources.map(e=>e.entity),e.consumers.map(e=>e.entity),e.flow.minW])}(this._config);s!==this._energyKey&&(this._energyKey=s,this._energyViews.clear(),this._energyAsked.clear(),this._energyPending=void 0),ro(this._config).join(",")===this._statsKey&&i.energyDefault||(this._statsKey="",this._statsOk=void 0,this._statsRetryAt=0);const r=this._energyOffer(this._config);t&&t.view.defaultEnergy===i.defaultEnergy&&r.includes(this._energyPeriod)||this._startEnergy(this._config,!1),void 0===this._energyPending||r.includes(this._energyPending)||(this._energyPending=void 0),this._checkStatistics(),this.requestUpdate(),t&&xr(t.gridStatus,this._config.gridStatus)||(this._outage=void 0,this._outagePrefilled=!1),this._hass&&(this._observeCharge(this._hass),this._model=xs(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._model),t&&t.updateIntervalS===this._config.updateIntervalS||this._restartTick()}connectedCallback(){super.connectedCallback(),$r.add(this),this._resizeObserver=new ResizeObserver(()=>{this._measure(),this._drawFan(),this._measurePathZoom()}),this._resizeObserver.observe(this),window.addEventListener("resize",this._onWindowResize),this._technique=function(){const e="undefined"!=typeof CSS&&CSS.supports?.("offset-path",'path("M 0 0 L 1 1")'),t="undefined"!=typeof Element&&"animate"in Element.prototype;return e&&t?"waapi":"static"}(),this._intersectionObserver=new IntersectionObserver(e=>{this._visible=e.some(e=>e.isIntersecting),this._syncPlayState(),this._visible&&this._config&&this._updateFan()}),this._intersectionObserver.observe(this),this._pickUpLiveDesigns(),document.addEventListener("visibilitychange",this._onVisibility),this.renderRoot.addEventListener("transitionend",this._onTransitionEnd),this._resume(),this._motionQuery=window.matchMedia?.("(prefers-reduced-motion: reduce)"),this._motionQuery?.addEventListener?.("change",this._onMotionChange),this._restartTick()}_restartTick(){this._tickTimer&&clearInterval(this._tickTimer);const e=this._config?.updateIntervalS??5;this._lastTick=Date.now(),this._tickTimer=setInterval(()=>{const t=Date.now(),i=this._lastTick??t;this._lastTick=t,t-i>2*e*1e3&&(this._pause(i),this._resume()),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this._updateSince(),this.requestUpdate())},1e3*e)}get _dotsMove(){return this._animationsWanted&&"waapi"===this._technique}get _animationsWanted(){const e=this._config?.flow.animation??"auto";return"off"!==e&&("on"===e||!this._motionQuery?.matches)}_recordSamples(e){if(!this._config||!this._buffer)return;const t=Date.now();for(const i of this._entityIds){const o=e.states[i];o&&this._buffer.push(i,Date.parse(o.last_changed)||t,fs(e,i))}this._buffer.prune(t)}_modelForMode(e,t){const i=this._period;if(i){const o=this._energyViews.get(i);return $s(e,t,e=>o?.meanW(e)??null,this._chargeOf,this._solarMemory.values,this._heldOf)}if("current"===this._mode||!this._buffer||this._example)return xs(e,t,this._chargeOf,this._solarMemory.values,this._heldOf);const o=6e4*("avg_short"===this._mode?t.view.avgShortMinutes:t.view.avgLongMinutes),n=Date.now(),s=this._buffer;return $s(e,t,e=>s.mean(e,o,n),this._chargeOf,void 0,this._heldOf)}_ensureHistory(e=!1){const t=this._buffer;t&&"current"!==this._mode&&this._hass&&this._config&&(e||this._historyFor!==t)&&(this._example||this.preview||(this._historyFor=t,this._prefill(t)))}async _prefill(e){const t=this._hass,i=this._config;if(!t||!i)return;const o=Date.now();try{const n=await ge(t,this._entityIds,i.view.avgLongMinutes);if(e!==this._buffer)return;for(const[i,o]of Object.entries(n)){const n=t.states[i]?.attributes.unit_of_measurement;for(const t of o)e.push(i,t.t,this._toWatts(t.v,n))}e.healGaps(o,Object.entries(n).filter(([,e])=>e.length>0).map(([e])=>e)),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this._updateSince()}catch{this._updateSince()}finally{this.requestUpdate()}}async _prefillOutage(){const e=this._config?.gridStatus;if(this._hass&&e)try{const t=await async function(e,t,i=10,o=5e3){const n=Date.now(),s=e.callWS({type:"history/history_during_period",start_time:new Date(n-864e5*i).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0});let r;const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error(`EnerLens: grid status history timed out after ${o} ms`)),o)});let l;try{l=await Promise.race([s,a])}finally{void 0!==r&&clearTimeout(r)}if(null===l||"object"!=typeof l)return;const c=l[t];if(!Array.isArray(c))return;const d=e=>{const t=e.lu;return"number"==typeof t?t:0};for(const e of[...c].sort((e,t)=>d(t)-d(e))){const t=e.s;if("string"==typeof t&&!De.has(qe(t)))return t}}(this._hass,e.entity);void 0===this._outage&&xr(this._config?.gridStatus,e)&&(this._outage=Ie(void 0,t,e,Be(this._hass,e.entity)))}catch{}finally{this.requestUpdate()}}_toWatts(e,t){if(null===e)return null;return e*("kW"===t?1e3:"MW"===t?1e6:"mW"===t?.001:1)}_updateSince(){if(!this._buffer||"current"===this._mode)return void(this._since=void 0);const e=this._buffer.status(Date.now());this._since=e.complete||!e.since?void 0:new Date(e.since).toLocaleTimeString(this._hass?.locale.language??"de",{hour:"2-digit",minute:"2-digit"})}_setMode(e){e!==this._mode&&(this._mode=e,this._config?.view.remember&&!Ar(this)&&yr(this._memKey(pr),e),this._ensureHistory(!0),this._updateSince(),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}_measure(){const e=this.renderRoot?.querySelector(".plot"),t=e?.getBoundingClientRect().width??0;if(t>0){const i=t/No;this._plotScale=i,this.style.setProperty("--el-scale",String(i)),this._dots?.setScale(i),Math.abs(i-this._scale)>.005&&(this._scale=i),this._measureHoles(e)}return this._checkStacked()}_measureHoles(e){const t=e.querySelector(".node");if(!t)return;const i=getComputedStyle(t),o=function(e){const t=e.trim().toLowerCase();if("transparent"===t)return!0;const i=t.match(/\/\s*([\d.]+)(%?)\s*\)$/),o=t.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%?)\s*\)$/),n=i??o;if(!n)return!1;const s=Number(n[1])/(n[2]?100:1);return Number.isFinite(s)&&s<1}(i.backgroundColor);if(o!==this._seeThrough&&(this._seeThrough=o),!o)return;const n=Number.parseFloat(getComputedStyle(e).width),s=(Number.parseFloat(i.width)/2-Number.parseFloat(i.borderTopWidth||"0"))*No/n;s>0&&Number.isFinite(s)&&!(Math.abs(s-this._holeR)<.005)&&(this._holeR=s,e.querySelector("path.holes")?.setAttribute("d",Qo(this._geometry(),s)))}_measurePathZoom(){if("waapi"!==this._technique||"undefined"==typeof navigator||!/^Apple/.test(navigator.vendor??""))return;const e=this.renderRoot?.querySelector(".plot svg"),t=e?function(e){const t=(e=0,t=0)=>{const i=document.createElementNS(Fs,"circle");return i.setAttribute("cx",String(e)),i.setAttribute("cy",String(t)),i.setAttribute("r","1"),i},i=document.createElementNS(Fs,"g");i.style.offsetPath='path("M400,400 L400,401")',i.style.offsetRotate="0deg",i.style.offsetDistance="0%",i.appendChild(t());const o=t(Ls,Ls),n=t(),s=t(200,200),r=document.createElementNS(Fs,"g");r.style.visibility="hidden",r.style.pointerEvents="none",r.append(i,o,n,s),e.appendChild(r);try{const e=e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2,w:t.width}},t=e(n),r=e(o),a=e(i);if(!(r.w>0))return;const l=r.x-t.x,c=r.y-t.y,d=a.x-t.x,h=a.y-t.y,u=l*l+c*c;if(!(u>0))return;const p=e(s);if(Math.hypot(p.x-(t.x+r.x)/2,p.y-(t.y+r.y)/2)>.002*Math.sqrt(u))return;const m=(d*l+h*c)/u;if(!(m>.1&&m<10)||Math.abs(d*c-h*l)/u>.01*m)return;return Math.abs(m-1)<.002?1:m}finally{r.remove()}}(e):void 0;void 0===t||Math.abs(t-this._pathZoom)<.002||(this._pathZoom=t,this._dots?.setPathZoom(t),this._fan?.setPathZoom(t),this._solarFan?.setPathZoom(t),this._drawFan())}_checkStacked(){const e=this.renderRoot?.querySelector(".cross"),t=this.renderRoot?.querySelector(".list:not(.pv-side)"),i=this.renderRoot?.querySelector(".body");if(!e||!i)return!1;let o;if(this._splitsLists()){if(0===i.clientWidth)return!1;if(this._stacked)o=i.clientWidth<=this._stackedWidth;else{const i=this.renderRoot.querySelector(".pv-side");o=null!==i&&e.offsetLeft<=i.offsetLeft||null!==t&&t.offsetLeft<=e.offsetLeft}}else{if(!t)return!1;o=t.offsetTop>=e.offsetTop+e.offsetHeight/2}return o!==this._stacked&&(o&&(this._stackedWidth=i.clientWidth),this._stacked=o,this.requestUpdate(),!0)}_splitsLists(){return"square_left"===this._config?.layout&&this._lastSolar.size>0}_updateFan(){if(this._drawFan(),!this._visible||"function"!=typeof requestAnimationFrame)return;if(!this._rows.gliding(this.renderRoot.querySelector(".body")))return;if(this._fanFollowUntil=performance.now()+wr,void 0!==this._fanFollow)return;const e=()=>{this._fanFollow=void 0;const t=this._visible&&performance.now()<this._fanFollowUntil&&this._rows.gliding(this.renderRoot.querySelector(".body"));this._drawFan(),t&&(this._fanFollow=requestAnimationFrame(e))};this._fanFollow=requestAnimationFrame(e)}_drawFan(){this._config&&(this._placeLists(),this._drawConsumerFan(),this._drawSolarFan())}_placeLists(){const e=this.renderRoot?.querySelector(".pv-rows"),t=this.renderRoot?.querySelector(".rows"),i=[e,t].filter(e=>null!==e),o=this.renderRoot?.querySelector(".body"),n=this.renderRoot?.querySelector(".cross"),s=this.renderRoot?.querySelector(".node.solar"),r=this.renderRoot?.querySelector(".node.house");if(this._stacked||!e||!o||!n||!s||!r){for(const e of i)e.style.transform="";return}const a=e.parentElement?.classList.contains("pv-side")??!1,l=o.getBoundingClientRect().top,c=e=>{const t=/translateY\((-?[\d.]+)px\)/.exec(e.style.transform);return t?Number(t[1]):0},d=e=>{const t=e.getBoundingClientRect();return t.top+t.height/2-l},h=(e,t)=>{if(!e)return{top:0,height:0,node:d(t)};const i=e.getBoundingClientRect();return{top:i.top-l-c(e),height:i.height,node:d(t)}},u=n.getBoundingClientRect(),p={top:u.top-l,bottom:u.bottom-l},m=(e,t)=>{if(!e)return;const i=t?`translateY(${t}px)`:"";e.style.transform!==i&&(e.style.transform=i)};if(a)return m(e,Zs(p,h(e,s))),void(t&&m(t,Zs(p,h(t,r))));const f=function(e){const{drawing:t,pv:i,consumers:o,gap:n}=e;if(i.height+n+o.height>t.bottom-t.top)return{pv:0,consumers:0};let s=i.node-i.height/2,r=o.node-o.height/2;const a=s+i.height+n-r;return a>0&&(s-=a/2,r+=a/2),s<t.top&&(r=Math.max(r,t.top+i.height+n),s=t.top),r+o.height>t.bottom&&(r=t.bottom-o.height,s=Math.min(s,r-n-i.height)),{pv:Math.round(s-i.top),consumers:Math.round(r-o.top)}}({drawing:p,pv:h(e,s),consumers:h(t,r),gap:10});m(e,f.pv),m(t,f.consumers)}_fanRows(e,t,i,o=1){return e.map(e=>{const n=e.dataset.key,s=n?t.get(n):void 0;if(!s)return null;const r=vi(s.w,this._shownConfig()),a=!Si(s,this._shownConfig()),l=this._config?.flow.inactiveLines??"show";if(a&&"hide"===l)return null;const c=(this._stacked?e.querySelector(".swatch")??e:e).getBoundingClientRect(),d=e.getBoundingClientRect(),h=e.querySelector(".charge-ring"),u=h?Math.min(c.left,h.getBoundingClientRect().left):c.left;return{key:n,x:(1===o?u:c.right)-i.left,y:d.top+d.height/2-i.top,color:s.color,count:this._dotsMove?r?.count??0:0,durationS:r?.durationS??1,inactive:a&&"hide"!==l?l:void 0,fade:vr(e)}}).filter(e=>null!==e)}_layer(e,t){const i=e??new Vs(t);e||i.setPathZoom(this._pathZoom);const o=this._config;return i.setDesign(zi(o.flow.design),Ps(this,o.appearance)),i.setDotColor(o.flow.dotColor),i.setDotRadius(5),i.setDotScale(lr(this._plotScale,o.flow).dot),i}_exit(e,t,i,o){const n=e.getBoundingClientRect(),s={x:n.left+n.width/2-i.left,y:n.top+n.height/2-i.top},r=t.length>0?1===o?Math.min(...t.map(e=>e.x)):Math.max(...t.map(e=>e.x)):void 0,a=function(e,t,i,o=e.x+200*i){if(0===t.length)return{x:i,y:0};const n=t.reduce((e,t)=>e+t,0)/t.length,s=Math.max(1,i*(o-e.x)),r=80*Math.PI/180,a=Math.max(-r,Math.min(r,Math.atan2(n-e.y,s)));return Math.abs(a)<1e-9?{x:i,y:0}:{x:i*Math.cos(a),y:Math.sin(a)}}(s,t.map(e=>e.y),o,r),l=n.width/2,c={x:s.x+a.x*l,y:s.y+a.y*l},d=Number.parseFloat(getComputedStyle(e).borderTopWidth)||0,h=n.width/(e.offsetWidth||n.width);return{centre:s,dir:a,start:c,hole:this._seeThrough?{x:s.x,y:s.y,r:l-d*h}:void 0,lead:10*lr(this._plotScale,this._config.flow).line,radius:l}}_drawConsumerFan(){const e=this.renderRoot?.querySelector("svg.fan:not(.pv-fan)");if(!e||!this._config)return;this._fan=this._layer(this._fan,e);const t=this.renderRoot.querySelector(".body"),i=this.renderRoot.querySelector(".node.house"),o=this.renderRoot.querySelector(".rows"),n=[...this.renderRoot.querySelectorAll(".rows .row")];if(!t||!i||!o||0===n.length)return void this._fan.destroy();const s=t.getBoundingClientRect(),r=this._fanRows(n,this._lastEntries,s),a={width:s.width,height:s.height};if(this._stacked){const e=o.getBoundingClientRect();return this._fan.route=void 0,void this._fan.update(r,{x:e.left-s.left,y:e.top+e.height/2-s.top},a,this._animationsWanted)}const l=this._exit(i,r,s,1);this._fan.route=0!==l.dir.y?(e,t)=>Ks(e,l.dir,t,l.lead):void 0,this._fan.update(r,l.start,a,this._animationsWanted,l.hole)}_drawSolarFan(){const e=this.renderRoot?.querySelector("svg.pv-fan");if(!e||!this._config)return;this._solarFan=this._layer(this._solarFan,e),this._solarFan.reverse=!0;const t=this.renderRoot.querySelector(".body"),i=this.renderRoot.querySelector(".node.solar"),o=this.renderRoot.querySelector(".node.house"),n=this.renderRoot.querySelector(".pv-rows"),s=[...this.renderRoot.querySelectorAll(".pv-rows .row")];if(!(t&&i&&o&&n&&0!==s.length))return void this._solarFan.destroy();const r=t.getBoundingClientRect(),a=n.parentElement?.classList.contains("pv-side")??!1,l=this._fanRows(s,this._lastSolar,r,a?-1:1),c={width:r.width,height:r.height};if(this._stacked){const e=n.getBoundingClientRect();return this._solarFan.route=void 0,void this._solarFan.update(l,{x:e.left-r.left,y:e.top+e.height/2-r.top},c,this._animationsWanted)}const d=n.parentElement?.classList.contains("pv-side")?-1:1,h=this._exit(i,l,r,d),u=[...this.renderRoot.querySelectorAll(".node:not(.solar)")].map(e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2-r.left,y:t.top+t.height/2-r.top,r:t.width/2+14}}),p=o.getBoundingClientRect(),m=p.top+p.height/2-r.top,f=p.right-r.left+16,g=1===d?Math.min(...l.map(e=>e.x)):Math.max(...l.map(e=>e.x)),_=js(h.start,l.map(e=>e.y),g,d,u,1===d?(e,t)=>e<f&&t>m-6:void 0,h.dir,h.lead);this._solarFan.route=(e,t)=>Us(e,h.dir,_,t,h.lead),this._solarFan.update(l,h.start,c,this._animationsWanted,h.hole)}_pickUpLiveDesigns(){this._designsPickedUp||(this._designsPickedUp=!0,Promise.resolve().then(()=>this.requestUpdate()))}_warnUnknownDesign(e){const t=this._config?.flow.design;!e&&t&&"none"!==t&&this._warnedDesign!==t&&(this._warnedDesign=t,console.warn(`${fi}: flow design "${t}" is not in this build - drawing plain dots.`))}_syncPlayState(){const e="undefined"!=typeof document&&document.hidden;this._visible&&!e?(this._dots?.resume(),this._fan?.resume(),this._solarFan?.resume()):(this._dots?.pause(),this._fan?.pause(),this._solarFan?.pause(),this._ring.stop(),this._solarRing.stop())}willUpdate(){this._rememberPending&&this.isConnected&&(this._rememberPending=!1,this._applyRemembered()),this._rows.capture(this.renderRoot?.querySelector(".body")??null)}updated(){this._ensureHistory(),this._ensureLookups(),this._ensureEnergy(),this._rows.play(this.renderRoot.querySelector(".body"),this._animationsWanted&&this._settled);const e=this._animationsWanted&&"jump"!==this._config?.ring.animation&&this._visible&&!("undefined"!=typeof document&&document.hidden),t=e=>this.renderRoot.querySelector(`.node.${e}`);this._ring.update(t("house")??this.renderRoot,e,this._nodePx);const i=t("solar");if(i&&this._solarRing.update(i,e,this._nodePx),!this._hass||!this._config)return;const o=this.renderRoot.querySelector("g.dots");if(!o)return;const n=this.renderRoot.querySelector(".plot"),s=n?.getBoundingClientRect().width??0,r=zi(this._config.flow.design);this._warnUnknownDesign(void 0!==r);const a=Ps(this,this._config.appearance);"auto"===this._config.appearance?this.removeAttribute("data-appearance"):this.setAttribute("data-appearance",this._config.appearance),s>0&&(this._plotScale=s/No);const l=lr(this._plotScale,this._config.flow);this.style.setProperty("--el-line-k",l.line.toFixed(4)),this._dots||(this._dots=new Ds(o,this._technique),s>0&&this._dots.setScale(s/No),this._dots.setPathZoom(this._pathZoom),this._measurePathZoom()),this._dots.setDesign(r,a),this._dots.setDotScale(l.dot);const c=this._tickModel??this._model??xs(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),d=this._dotsMove?xi(this._flowsOf(c),this._shownConfig()):[];this._dots.setPaths(this._geometry().paths),this._dots.update(d,this._config,this._animationsWanted);const h=a?r?.dark:r?.light;h?this.style.setProperty("--el-link-opacity",String(h.line/100)):this.style.removeProperty("--el-link-opacity");const u=this._measure();this._updateFan(),this._syncPlayState(),u||(this._settled=!0)}disconnectedCallback(){super.disconnectedCallback(),setTimeout(()=>{this.isConnected||window.dispatchEvent(new CustomEvent(Hn,{detail:this}))},500),$r.delete(this),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._intersectionObserver?.disconnect(),this._intersectionObserver=void 0,document.removeEventListener("visibilitychange",this._onVisibility),this.renderRoot.removeEventListener("transitionend",this._onTransitionEnd),this._pause(Date.now()),window.removeEventListener("resize",this._onWindowResize),this._motionQuery?.removeEventListener?.("change",this._onMotionChange),this._motionQuery=void 0,this._dots?.destroy(),this._dots=void 0,this._fanFollow&&cancelAnimationFrame(this._fanFollow),this._fanFollow=void 0,this._fan?.destroy(),this._fan=void 0,this._solarFan?.destroy(),this._solarFan=void 0,this._ring.stop(),this._solarRing.stop(),this._tickTimer&&clearInterval(this._tickTimer),this._tickTimer=void 0}getCardSize(){return 7}getGridOptions(){return{columns:12,min_columns:12,rows:"auto"}}static async getConfigElement(){return await Promise.resolve().then(function(){return rl}),document.createElement(pi)}static getStubConfig(){return{memory_id:ci(),entities:{...gi},icons:{rest:"mdi:cloud-question"}}}render(){if(!this._hass||!this._config)return j;const e=this._modelForMode(this._hass,this._config),t=this._tickModel??e,i=this._shownConfig(),o=function(e,t,i){const o=new Map,n=new Map;for(const e of t.consumers)e.reading.available&&o.set(e.key,e.reading.w),e.indicators&&n.set(e.key,e.indicators);const s=e.entries.map(e=>e.isRest?{...e,indicators:t.rest?.indicators??e.indicators}:{...e,w:o.get(e.key)??(e.powerUnknown?0:e.w),powerUnknown:o.has(e.key)?void 0:e.powerUnknown,indicators:n.has(e.key)?n.get(e.key):e.indicators}),r=s.filter(e=>!e.isRest).reduce((e,t)=>e+t.w,0),a=s.findIndex(e=>e.isRest);if(a>=0&&!s[a].powerUnknown){const e=t.house.available?t.house.w-r:s[a].w;s[a]={...s[a],w:Math.max(0,e)}}return{entries:s,segments:Ai(s,i)}}(function(e,t,i=!1){const o=ki(e,t,i);return{entries:o,segments:Ai(o,t)}}(t,i,this._showAll),e,i),n=xi(this._flowsOf(t),i),s=new Map(n.map(e=>[e.connection,this._config?.colors[e.colorKey]??""]));this._lastEntries=new Map(o.entries.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const r=i.list.solar?function(e,t){const i=new Map;for(const e of t.solarSources)e.reading.available&&i.set(e.key,e.reading.w);return e.map(e=>({...e,w:i.get(e.key)??e.w}))}(cr(t,i,this._showAll),e):[];this._lastSolar=new Map(r.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const a=this._splitsLists()&&!this._stacked,l=i.view.pvScales.length>0?{segments:dr(e,i,this._pvScale,cr(t,i,!0).map(e=>e.key)),layout:this._pvScale}:void 0,c=(e,t,i)=>i?bn(t.currentTarget,{node:i,entity:e||void 0}):vn(t.currentTarget,e);return V`
      <ha-card
        translate="no"
        @hass-more-info=${this._onMoreInfo}
        @enerlens-detail=${this._onDetail}
      >
        ${Vn(this._config,this._hass,this._rawConfig?.title,this._mode,this._since,e=>this._setMode(e),this._showAll,()=>this._toggleShowAll(),this._energyChip(this._hass,this._config),this._pvScaleChip(this._hass,this._config))}
        ${!0===this._outage?(d=this._hass,V`<div class="outage-banner" role="status">
    <ha-icon icon="mdi:flash-off"></ha-icon>
    <span>${Te("outage.banner",d)}</span>
  </div>`):j}
        ${this._example?function(e){return V`<div class="example-banner" role="status">
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <span>${Te("example.banner",e)}</span>
  </div>`}(this._hass):j}
        <div
          class="body layout-${this._config.layout.replace("_","-")} ${this._stacked?"stacked":""} ${this._config.list.alwaysBelow||this._stacked&&this._splitsLists()?"force-below":""} ${a?"split":""} ${this._config.list.enabled||r.length>0?"":"no-list"}"
          style=${function(e,t){const i=jo(e.layout,e.flow.lines,t),o=Object.keys(i.nodePos).filter(e=>"battery"!==e||t),n=e=>"grid"===e||"battery"===e,s=i.viewH/2,r=o.filter(e=>i.labelAbove[e]&&i.nodePos[e].y<s),a=o.filter(e=>!i.labelAbove[e]&&i.nodePos[e].y>s+1),l=Math.max(8,...r.map(t=>26+zn(e,t,n(t))-15)),c=a.length>0?Math.max(8,...a.map(t=>28+zn(e,t,n(t))-30)):28,d=l-26-(c-28);return`--el-pad-top:${l}px;--el-pad-bottom:${c}px;--el-list-mt:${Math.max(0,d)}px;--el-list-mb:${Math.max(0,-d)}px`}(this._config,null!==e.battery)}
        >
          <svg class="fan" aria-hidden="true"></svg>
          <svg class="fan pv-fan" aria-hidden="true"></svg>
          ${a?function(e,t,i,o,n){return 0===n.length?j:V`
    <div class="list pv-side" style="--el-row-h:${Js(ir(e,t,n))}px">
      ${or(n,t,i,o,!1)}
    </div>
  `}(o,i,this._hass,c,r):j}
          ${Dn(e,i,this._hass,s,this._config.ring.enabled?o.segments:[],this._nodePx,!0===this._outage,this._animationsWanted,this._holeR,this._seeThrough,l)}
          ${tr(o,i,this._hass,c,this._stacked,r,a)}
        </div>
      </ha-card>
    `;var d}}Cr.styles=ur,Cr.properties={hass:{attribute:!1,noAccessor:!0},_model:{state:!0},_showAll:{state:!0},_pvScale:{state:!0},_outage:{state:!0},_scale:{state:!0},_seeThrough:{state:!0}},customElements.get(ui)||customElements.define(ui,Cr);const zr=window;zr.customCards=zr.customCards||[],zr.customCards.some(e=>e.type===ui)||zr.customCards.push({type:ui,name:fi,description:"Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",preview:!0,documentationURL:"https://github.com/wawersich/enerlens-card"}),console.info(`%c ${ui.toUpperCase()} %c 1.3.0 · 02ff767+ `,"color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const Wr=Jo(class extends Yo{constructor(){super(...arguments),this.key=j}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(rn(e),this.key=t),i}}),Pr=[{domain:"sensor",device_class:"power"},{domain:"sensor",unit_of_measurement:["W","kW","mW","MW"]}],Nr=[{domain:"sensor",device_class:"battery"},{domain:"sensor",unit_of_measurement:"%"}],Fr=["solar","grid","house","battery"],Lr="consumers_slot",Rr="solar_slot";function Or(e){const t=e.split(".")[0];return"binary_sensor"===t||"input_boolean"===t}const Tr=[["=","="],["!=","≠"],[">",">"],["<","<"],[">=","≥"],["<=","≤"]],Dr=e=>void 0===e||""===e||"="===e||"!="===e;function qr(e){const t=xa(e.condition)?e.condition:void 0,i=t&&Dr(t.operator)&&void 0!==t.value&&!Array.isArray(t.value)?{...e,condition:{...t,value:Gr(t.value)}}:e,o=xa(i.charge)?i.charge:void 0;if(!o||!fa(o.soc))return i;const{show:n,plugged:s,unplugged:r,soc:a,label:l,...c}=o,{charge:d,...h}=i,u={...h};if(xa(i.indicators)||(u.indicators={...c,ring:ka({entity:a,label:fa(l)?l:void 0}),idle_value:"ring",in_energy:!0}),fa(i.show))return u;if("always"===n)u.show="always";else if("plugged"===n&&fa(s)){const e=Or(s)?[]:ba(r)??[];u.show="condition",u.condition=e.length>0?{entity:s,operator:"!=",value:e}:{entity:s,operator:"=",value:["on"]}}return u}const Ir="__virtual",Br=e=>xa(e)&&"rest"===e.type;function Vr(e){if(null!=e&&!Array.isArray(e))return e;const t=Array.isArray(e)?e:[];return t.some(Br)?t:[...t,{type:"rest",[Ir]:!0}]}function Hr(e){const{[Ir]:t,entity:i,condition:o,charge:n,...s}=e,r=xa(e.indicators)?{...e.indicators}:void 0;return r&&(r.idle_value=void 0),ka({...s,type:"rest",show:"always"===e.show?"always":void 0,highlight:Qr(e.highlight),indicators:Ur(r)})??{type:"rest"}}function Kr(e){const t=qr(e),i=t.highlight;return xa(i)?{...t,highlight:Zr.filter(e=>!0===i[e])}:t}function jr(e,t,i=!1){const o=t=>Te(`editor.${t}`,e),n=xa(t.condition)?t.condition:{},s="string"==typeof n.entity?n.entity:"",r=e.states?.[s]?.attributes?.options,a=Or(s)?["on","off"]:(Array.isArray(r)?r:[]).filter(e=>"string"==typeof e),l=Dr(n.operator)?{name:"value",labelKey:"condition_values",selector:{select:{multiple:!0,custom_value:!0,mode:"list",options:a.map(e=>({value:e,label:e}))}}}:{name:"value",labelKey:"condition_number",selector:{number:{mode:"box",step:"any"}}},c=[{name:"position",selector:{select:{mode:"dropdown",options:[{value:"",label:o("position_sorted")},{value:"top",label:o("position_top")},{value:"bottom",label:o("position_bottom")}]}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"",label:o("show_power")},{value:"always",label:o("show_always")},...i?[]:[{value:"condition",label:o("show_condition")}]]}}}];"condition"!==t.show||i||c.push({name:"condition",type:"grid",schema:[{name:"entity",labelKey:"",selector:{entity:{}}},{name:"operator",labelKey:"condition_operator",selector:{select:{mode:"dropdown",options:Tr.map(([e,t],i)=>({value:e,label:`${t}  ${o(`operator_${i}`)}`}))}}},l]}),c.push({name:"highlight",labelKey:"highlight",selector:{select:{multiple:!0,mode:"list",options:[{value:"bold",label:o("highlight_bold")},{value:"band",label:o("highlight_band")}]}}});const d=xa(t.indicators)?t.indicators:{},h=He.filter(e=>{const t=d[e];return xa(t)&&fa(t.entity)});return c.push({name:"indicators",type:"expandable",title:o("indicators"),expanded:h.length>0,schema:[...He.map(e=>({name:e,type:"expandable",title:o(`indicator_${e}`),expanded:h.includes(e),schema:[{name:"entity",labelKey:"indicator_entity",selector:{entity:{}}},{name:"label",labelKey:"indicator_label_"+("ring"===e?"ring":"other"),selector:{text:{}}},{name:"",type:"grid",schema:[{name:"min",labelKey:"indicator_min",selector:{number:{mode:"box",step:"any"}}},{name:"max",labelKey:"indicator_max",selector:{number:{mode:"box",step:"any"}}}]}]})),...i?[]:[{name:"idle_value",labelKey:"idle_value",selector:{select:{mode:"dropdown",options:[{value:"",label:o("idle_power")},...h.map(e=>({value:e,label:o(`indicator_${e}`)}))]}}}],{name:"in_energy",labelKey:"in_energy",selector:{boolean:{}}}]}),[...i?[]:[{name:"entity",required:!0,selector:{entity:{filter:Pr}}}],{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"min_w",selector:{number:{...Ga("consumers.min_w"),mode:"box"}}},{name:"display",type:"expandable",flatten:!0,title:o("consumer_display"),schema:c}]}function Ur(e){if(!xa(e))return;const t={...ca(e,[...He,"idle_value","in_energy"])};for(const i of He){const o=e[i];if(!xa(o)||!fa(o.entity))continue;const n=e=>"number"==typeof e&&Number.isFinite(e)?e:void 0;t[i]=ka({...ca(o,["entity","label","min","max","color"]),entity:o.entity,label:fa(o.label)?o.label:void 0,min:n(o.min),max:n(o.max),color:"fill"!==i&&fa(o.color)?o.color:void 0})}const i=e.idle_value;"string"==typeof i&&"power"!==i&&void 0!==t[i]&&(t.idle_value=i),!0===e.in_energy&&(t.in_energy=!0);return He.some(e=>void 0!==t[e])?ka(t):void 0}const Zr=["bold","band"];function Qr(e){if(xa(e))return ka({...ca(e,["bold","band"]),bold:!0===e.bold||void 0,band:!0===e.band||void 0})}function Gr(e){const t=(Array.isArray(e)?e:[e]).map(e=>!0===e?"on":!1===e?"off":"number"==typeof e?String(e):e).filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function Jr(e,t){if("condition"!==e||!xa(t))return;const i=Dr(t.operator)?Gr(t.value):function(e){const t="number"==typeof e?e:"string"==typeof e?Number(e):Number.NaN;return"string"==typeof e&&""===e.trim()?void 0:Number.isFinite(t)?t:void 0}(t.value);return ka({...ca(t,["entity","operator","value"]),entity:fa(t.entity)?t.entity:void 0,operator:fa(t.operator)?t.operator:void 0,value:i})}const Yr=[...Fr,"rest"],Xr={solar:["entity","sources","derived"],grid:["entity","split","derived"],house:["entity","derived"],battery:["none","entity","split","derived"]},ea={grid:["grid_import","grid_export"],battery:["battery_discharge","battery_charge"]},ta={grid:["import","export"],battery:["discharge","charge"]},ia=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],oa="var(--primary-text-color)";function na(e,t){if("derived"===t)return"derived";if("solar"===e&&Array.isArray(t))return"sources";if("string"==typeof t&&!(e=>null==e||"string"==typeof e&&""===e.trim())(t))return"entity";if(xa(t)&&"entity"in t)return"entity";const i=ta[e];return xa(t)&&i&&(i[0]in t||i[1]in t)?"split":"house"===e?"derived":"battery"===e?"none":"entity"}function sa(e,t,i){const o=na(e,t);if(i[`${e}_source`]=o,"sources"===o)return void(i[`${e}_sources`]=t.map(e=>function(e){if("string"==typeof e)return{entity:e,excluded:!1};const{house:t,...i}=e;return{...i,excluded:"excluded"===t}}("string"==typeof e||xa(e)?e:"")));if("string"==typeof t)return void("entity"===o&&(i[e]=t));const n=t;if(!xa(n))return;const s=e=>"string"==typeof e?e:void 0;if("entity"===o)return i[e]=s(n.entity),void(i[`${e}_invert`]=!0===n.invert);const r=ea[e],a=ta[e];"split"===o&&r&&a&&(i[r[0]]=s(n[a[0]]),i[r[1]]=s(n[a[1]]))}const ra=["inside","label"],aa=(e,t)=>"label"===t||"battery"!==e,la=e=>"grid"===e||"battery"===e;function ca(e,t){return xa(e)?Object.fromEntries(Object.entries(e).filter(([e])=>!t.includes(e))):{}}const da={inside:["entity","position","decimals","size","weight"],label:["entity","prefix","decimals","size","weight"]},ha=["show_name","show_state","inside","label"];function ua(e,t,i,o){const n=`node_${t}_${i}_`,s=e[`${n}entity`];if(!fa(s))return;const r=e[`${n}decimals`],a=e[`${n}prefix`],l=e[`${n}weight`];return ka({...ca(o,da[i]),entity:s,..."inside"===i?{position:"below"===e[`${n}position`]?"below":void 0}:{prefix:fa(a)?a:void 0},decimals:fa(r)&&"ha"!==r?/^\d$/.test(r)?Number(r):r:void 0,size:ya(e[`${n}size`]),weight:fa(l)&&"normal"!==l?l:void 0})}function pa(e,t){const i={};for(const o of Fr)for(const n of ra){if(!aa(o,n))continue;const s=("battery"!==o||t)&&fa(e[`node_${o}_${n}_entity`]);i[`${o}_${n}`]=s?e[`color_${o}_${n}`]:void 0}return i.battery_inside=void 0,i}function ma(e){const t=e.entities??{},i=t.grid_status,o="object"==typeof i&&null!==i?i:void 0,n={title:e.title,layout:e.layout,flow_lines:e.flow?.lines,battery_soc:t.battery_soc,grid_status:"string"==typeof i?i:o?.entity,grid_status_outage:o?.outage,grid_status_ok:o?.ok,consumers:Vr(e.consumers),max_consumers:e.max_consumers,min_consumer_w:e.min_consumer_w,update_interval_s:e.update_interval_s,rest_label:e.list?.rest_label,appearance:e.appearance,list_enabled:e.list?.enabled,list_always_below:e.list?.always_below,ring_enabled:e.ring?.enabled,ring_animation:e.ring?.animation,power_unit:e.power?.unit,power_decimals:e.power?.decimals,power_digits:e.power?.digits,modes:$a(e.view?.modes),default_mode:e.view?.default_mode,avg_short_minutes:e.view?.avg_short_minutes,avg_long_minutes:e.view?.avg_long_minutes,energy_periods:$a(e.view?.energy_periods),default_energy:e.view?.default_energy,scope:$a(e.list?.scope),default_scope:e.list?.default_scope,inactive_lines:e.flow?.inactive_lines,animation:e.flow?.animation,design:e.flow?.design,dot_color:e.flow?.dot_color,dot_size:e.flow?.dot_size??100,line_width:e.flow?.line_width??100,min_w:e.flow?.min_w,peak_w:e.flow?.peak_w,slow_below_w:e.flow?.slow_below_w,full_speed_w:e.flow?.full_speed_w,more_dots_above_w:e.flow?.more_dots_above_w,max_dots_at_w:e.flow?.max_dots_at_w,max_dots:e.flow?.max_dots,slow_s:e.flow?.slow_s,fast_s:e.flow?.fast_s};for(const e of Fr)sa(e,t[e],n);n.pv_scales=$a(e.view?.pv_scales),n.quick_style=e.view?.quick_style;const s=Pa(e.view?.expanded);for(const e of za)n[`expanded_${e}`]=!!s.includes(e)||void 0;n.default_pv_scale=e.view?.default_pv_scale,n.list_solar=e.list?.solar,n.ring_solar=e.ring?.solar;const r=e.colors??{};for(const e of ia)n[`color_${e}`]=r[e];n.color_arrows=r.arrows,n.soc_stops=r.soc_stops,function(e,t){const i=e.colors??{};for(const o of Fr){const n=e.nodes?.[o]??{},s=`node_${o}_`;t[`${s}show_name`]=!1!==n.show_name,la(o)&&(t[`${s}show_state`]=!1!==n.show_state);for(const e of ra){if(!aa(o,e))continue;const r=xa(n[e])?n[e]:{},a=`${s}${e}_`;t[`${a}entity`]=r.entity,"inside"===e?t[`${a}position`]=r.position??"above":t[`${a}prefix`]=r.prefix,t[`${a}decimals`]=void 0===r.decimals||null===r.decimals||""===r.decimals?"ha":String(r.decimals),t[`${a}size`]=r.size??100,t[`${a}weight`]=r.weight??"normal",t[`color_${o}_${e}`]=i[`${o}_${e}`]}}}(e,n);const a=e.icons??{};for(const e of Yr)n[`icon_${e}`]=a[e];return n}const fa=e=>"string"==typeof e&&""!==e.trim();function ga(e,t){switch(t[`${e}_source`]??na(e,void 0)){case"none":return;case"derived":return"house"===e?void 0:"derived";case"entity":{const i=t[e];if(!fa(i))return;return!0===t[`${e}_invert`]?{entity:i,invert:!0}:i}case"sources":return function(e){if(!Array.isArray(e))return;const t=e.flatMap(e=>{const t="string"==typeof e?{entity:e}:xa(e)?e:{};if(!fa(t.entity))return[];const{excluded:i,...o}=t;return[ka({...o,kwp:wa(o.kwp),invert:!0===o.invert||void 0,house:!0===i?"excluded":void 0})]});return 0!==t.length?1===t.length&&1===Object.keys(t[0]).length?t[0].entity:t:void 0}(t[`${e}_sources`]);case"split":{const i=ea[e],o=ta[e];if(!i||!o)return;const n=t[i[0]],s=t[i[1]];if(!fa(n)||!fa(s))return;return{[o[0]]:n,[o[1]]:s}}}}const _a=e=>null===e||""===e?void 0:e;function wa(e){return"number"==typeof e&&Number.isFinite(e)?e:void 0}function ya(e){const t=wa(e);return 100===t?void 0:t}function ba(e){if(!Array.isArray(e))return;const t=e.filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function va(e){if(!xa(e))return;const t=e=>fa(e)?e:void 0,i="plugged"===e.show?t(e.plugged):void 0,o=ka({...ca(e,["soc","show","plugged","unplugged","label"]),soc:t(e.soc),label:t(e.label),show:t(e.show),plugged:i,unplugged:i&&!Or(i)?ba(e.unplugged):void 0});return o&&fa(o.soc)?o:void 0}const xa=e=>"object"==typeof e&&null!==e&&!Array.isArray(e);function ka(e){const t={};for(const[i,o]of Object.entries(e))null!=o&&""!==o&&(t[i]=o);return Object.keys(t).length?t:void 0}function $a(e){return Array.isArray(e)?e.filter(e=>"string"==typeof e):void 0}function Sa(e,t){if(!Array.isArray(e))return;const i=t.filter(t=>e.includes(t));return i.length>0?i:void 0}function Aa(e,t,i){if("string"!=typeof e)return;const o=Sa(t,i);return void 0===o||o.includes(e)?e:void 0}function Ma(e){return"derived"!==e.grid_source&&"derived"!==e.battery_source}const Ea=["flow_lines","inactive_lines","animation","design","dot_color","dot_size","line_width","min_w","peak_w","slow_below_w","full_speed_w","more_dots_above_w","max_dots_at_w","max_dots","slow_s","fast_s"],Ca=["quick_style","expanded_modes","expanded_energy_periods","expanded_pv_scales","expanded_scope","modes","default_mode","avg_short_minutes","avg_long_minutes","energy_periods","default_energy","pv_scales","default_pv_scale"],za=["modes","energy_periods","pv_scales","scope"],Wa=["segment","segment_compact","single"];function Pa(e){return Array.isArray(e)?e:null==e||""===e?[]:[e]}function Na(e,t){const i=new Set(za),o=[...za.filter(t=>!0===e[`expanded_${t}`]),...Pa(t).filter(e=>!i.has(e))];return o.length>0?o:void 0}const Fa=["current","avg_short","avg_long"],La=["power","today","24h","week","7d","month","30d"],Ra=["filtered","full"],Oa=["share","peak"],Ta={modes:Fa,energy_periods:La,scope:Ra},Da=["power","today","24h","week"],qa=["title","layout","max_consumers","min_consumer_w","update_interval_s","appearance"];function Ia(e){if(qa.includes(e)||"consumers"===e)return e;if("battery_soc"===e)return"entities.battery_soc";if(e.startsWith("grid_status"))return"entities.grid_status";for(const t of Fr){if(e===t||e===`${t}_source`||e===`${t}_sources`||e===`${t}_invert`||(ea[t]??[]).includes(e))return`entities.${t}`}return"rest_label"===e||e.startsWith("list_")||"scope"===e||"default_scope"===e?"list":e.startsWith("ring_")?"ring":e.startsWith("power_")?"power":Ca.includes(e)?"view":Ea.includes(e)?"flow":e.startsWith("color_")||"soc_stops"===e?"colors":e.startsWith("node_")?"nodes":e.startsWith("icon_")?"icons":void 0}const Ba={"entities.battery_soc":["entities.battery"],nodes:["entities.battery"],colors:["entities.battery","nodes"]};function Va(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,i)=>Va(e,t[i]));if(xa(e)&&xa(t)){return[...new Set([...Object.keys(e),...Object.keys(t)])].every(i=>Va(e[i],t[i]))}return!1}function Ha(e){if(null!==e&&("string"!=typeof e||""!==e.trim())){if(Array.isArray(e)){const t=e.map(Ha).filter(e=>void 0!==e);return t.length?t:void 0}if(xa(e)){const t={};for(const[i,o]of Object.entries(e)){const e=Ha(o);void 0!==e&&(t[i]=e)}return Object.keys(t).length?t:void 0}return e}}const Ka=e=>xa(e)?e:{};function ja(e,t){const i=e,o=function(e,t){const i=new Set;for(const o of new Set([...Object.keys(e),...Object.keys(t)])){const n=Ia(o);n&&!Va(e[o],t[o])&&i.add(n)}for(const[e,t]of Object.entries(Ba))t.some(e=>i.has(e))&&i.add(e);return i}(i,ma(t)),n=t,s=Ka(t.entities),r=(e,t,i)=>o.has(e)?t():Ha(i),a={...s};for(const e of Fr)a[e]=r(`entities.${e}`,()=>ga(e,i),s[e]);const l=void 0!==a.battery;a.battery_soc=r("entities.battery_soc",()=>l?_a(e.battery_soc):void 0,s.battery_soc),a.grid_status=r("entities.grid_status",()=>{const t=_a(e.grid_status);return t?ka({...ca(s.grid_status,["entity","outage","ok"]),entity:t,outage:ba(e.grid_status_outage),ok:ba(e.grid_status_ok)}):void 0},s.grid_status);const c=[...Fr,"battery_soc","grid_status"].map(e=>`entities.${e}`),d=xa(t.entities)||c.some(e=>o.has(e))?ka(a):Ha(t.entities);return{...t,type:t.type,title:r("title",()=>_a(e.title),n.title),entities:d,consumers:r("consumers",()=>function(e){if(!Array.isArray(e))return;const t=new Set,i=[];let o=!1;for(const n of e){if(!xa(n))continue;if("rest"===n.type&&!o){if(!0===n[Ir])continue;o=!0,i.push(Hr(n));continue}if(void 0!==n.type){const e=Ha(n);xa(e)&&i.push(e);continue}const e=ka({...n,charge:va(n.charge),condition:Jr(n.show,n.condition),highlight:Qr(n.highlight),indicators:Ur(n.indicators)}),s=e?.entity;e&&"string"==typeof s&&!t.has(s)&&(t.add(s),i.push(e))}return i.length?i:void 0}(e.consumers),n.consumers),max_consumers:r("max_consumers",()=>wa(e.max_consumers),n.max_consumers),min_consumer_w:r("min_consumer_w",()=>wa(e.min_consumer_w),n.min_consumer_w),update_interval_s:r("update_interval_s",()=>wa(e.update_interval_s),n.update_interval_s),appearance:r("appearance",()=>_a(e.appearance),n.appearance),layout:r("layout",()=>_a(e.layout),n.layout),list:r("list",()=>ka({...ca(n.list,["enabled","rest_label","always_below","scope","default_scope","solar"]),enabled:e.list_enabled,solar:e.list_solar,rest_label:e.rest_label,always_below:e.list_always_below,scope:Sa(e.scope,Ra),default_scope:Aa(e.default_scope,e.scope,Ra)}),n.list),ring:r("ring",()=>ka({...ca(n.ring,["enabled","animation","solar"]),enabled:e.ring_enabled,solar:e.ring_solar,animation:_a(e.ring_animation)}),n.ring),power:r("power",()=>ka({...ca(n.power,["unit","decimals","digits"]),unit:_a(e.power_unit),decimals:wa(e.power_decimals),digits:wa(e.power_digits)}),n.power),view:r("view",()=>ka({...ca(n.view,["modes","default_mode","avg_short_minutes","avg_long_minutes","show_selector","energy_periods","default_energy","pv_scales","default_pv_scale","quick_style","expanded"]),quick_style:_a(e.quick_style),expanded:Na(e,xa(n.view)?n.view.expanded:void 0),modes:Sa(e.modes,Fa),default_mode:Aa(e.default_mode,e.modes,Fa),avg_short_minutes:wa(e.avg_short_minutes),avg_long_minutes:wa(e.avg_long_minutes),energy_periods:Sa(e.energy_periods,La),default_energy:Aa(e.default_energy,e.energy_periods,La),pv_scales:Sa(e.pv_scales,Oa),default_pv_scale:Aa(e.default_pv_scale,e.pv_scales,Oa)}),n.view),flow:r("flow",()=>ka({...Ka(t.flow),lines:e.flow_lines,inactive_lines:e.inactive_lines,animation:e.animation,design:e.design,dot_color:_a(e.dot_color),dot_size:ya(e.dot_size),line_width:ya(e.line_width),min_w:wa(e.min_w),peak_w:wa(e.peak_w),slow_below_w:wa(e.slow_below_w),full_speed_w:wa(e.full_speed_w),more_dots_above_w:wa(e.more_dots_above_w),max_dots_at_w:wa(e.max_dots_at_w),max_dots:wa(e.max_dots),slow_s:wa(e.slow_s),fast_s:wa(e.fast_s)}),n.flow),colors:r("colors",()=>ka({...Ka(t.colors),...Object.fromEntries(ia.map(e=>[e,i[`color_${e}`]])),...void 0!==i.soc_stops?{soc_stops:i.soc_stops}:{},arrows:i.color_arrows,...pa(i,l)}),n.colors),nodes:r("nodes",()=>function(e,t,i){const o=ca(i,Fr);for(const n of Fr){if("battery"===n&&!t)continue;const s=`node_${n}_`,r=xa(i)?i[n]:void 0,a=xa(r)?r:{},l=ka({...ca(a,ha),show_name:!1!==e[`${s}show_name`]&&void 0,show_state:(!la(n)||!1!==e[`${s}show_state`])&&void 0,inside:aa(n,"inside")?ua(e,n,"inside",a.inside):void 0,label:ua(e,n,"label",a.label)});l&&(o[n]=l)}return ka(o)}(i,l,t.nodes),n.nodes),icons:r("icons",()=>ka({...ca(n.icons,Yr),...Object.fromEntries(Yr.map(e=>[e,i[`icon_${e}`]]))}),n.icons)}}function Ua(e){return{select:{mode:"dropdown",options:["ha","0","1","2","3","sig2","sig3","sig4"].map(t=>({value:t,label:e(`decimals_${t}`)}))}}}function Za(e){return{select:{mode:"dropdown",options:["normal","medium","bold"].map(t=>({value:t,label:e(`weight_${t}`)}))}}}const Qa={name:"colors_hint",type:"constant"};function Ga(e){const{min:t,max:i}=wt[e];return void 0===i?{min:t}:{min:t,max:i}}const Ja=new Set(Object.keys(wt).map(e=>Ya(e)).filter(e=>void 0!==e));function Ya(e){return e.startsWith("view.")||e.startsWith("flow.")?e.slice(5):e.startsWith("power.")?e.replace(".","_"):e.includes(".")||e.includes("[")?void 0:e}function Xa(e){const t=e.schema;return t?t.flatMap(Xa):"string"==typeof e.name?[e.name]:[]}const el={current:"mode_current",avg_short:"mode_short",avg_long:"mode_long"};function tl(e){const t=Ma(e)?Sa(e.energy_periods,La)??Da:["power"];return{modes:Sa(e.modes,Fa)??Fa,energy_periods:t,scope:Sa(e.scope,Ra)??Ra}}function il(e){const t=Array.isArray(e.consumers)&&e.consumers.some(e=>xa(e)&&fa(e.entity)),i=(e,t)=>null==e||""===e?t:e,o=i(e.layout,"cross");return{list_enabled:i(e.list_enabled,t),ring_enabled:i(e.ring_enabled,t),ring_solar:i(e.ring_solar,!0),quick_style:i(e.quick_style,"segment"),layout:o,flow_lines:i(e.flow_lines,"cross"===o?"curved":"straight"),appearance:i(e.appearance,"auto"),ring_animation:i(e.ring_animation,"overtake"),power_unit:i(e.power_unit,"kW"),power_decimals:i(e.power_decimals,2),power_digits:i(e.power_digits,3),inactive_lines:i(e.inactive_lines,"show"),animation:i(e.animation,"auto"),design:i(e.design,Ei)}}function ol(e,t,i){return t.map(t=>({value:t,label:i(t),...1===e.length&&e[0]===t?{disabled:!0}:{}}))}function nl(e,t){const i=t=>Te(`editor.${t}`,e),o=tl(t),n=o.energy_periods.includes("power"),s=Array.isArray(t.consumers),r=Array.isArray(t.consumers)&&t.consumers.some(e=>xa(e)&&!e.type),a=Fr.filter(e=>"derived"===t[`${e}_source`]),l="sources"===t.solar_source,c=(Array.isArray(t.solar_sources)?t.solar_sources:[]).filter(e=>xa(e)&&fa(e.entity)),d=c.length>1,h=c.length>0&&c.every(e=>void 0!==wa(e.kwp)),u=(Sa(t.pv_scales,Oa)??Oa).filter(e=>"share"===e?d:h),p=Fr.map(o=>{const n=function(e,t,i,o){const n=t[`${e}_source`]??na(e,void 0),s=Xr[e].filter(e=>"derived"!==e||!i||"derived"===n).map(t=>({value:t,label:o("split"===t?`source_split_${e}`:`source_${t}`)})),r=[{name:`${e}_source`,selector:{select:{mode:"dropdown",options:s}}}];if("entity"===n)r.push({type:"grid",name:"",schema:[{name:e,selector:{entity:{filter:Pr}}},{name:`${e}_invert`,selector:{boolean:{}}}]});else if("split"===n)for(const t of ea[e]??[])r.push({name:t,selector:{entity:{filter:Pr}}});return r}(o,t,a.some(e=>e!==o),i);return"battery"===o&&"none"!==t.battery_source&&n.push({name:"battery_soc",selector:{entity:{filter:Nr}}}),{name:`entities_${o}`,type:"expandable",flatten:!0,title:Te(`node.${o}`,e),schema:n}}),m="string"==typeof t.grid_status?t.grid_status:void 0,f=m?e.states?.[m]?.attributes.options:void 0,g={select:{multiple:!0,custom_value:!0,mode:"list",options:(Array.isArray(f)?f:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e}))}};return[{name:"title",selector:{text:{}}},{name:"entities",type:"expandable",flatten:!0,title:i("entities"),schema:[...p,Qa]},{name:"nodes",type:"expandable",flatten:!0,title:i("nodes"),schema:[...Fr.filter(e=>"battery"!==e||"none"!==t.battery_source).map(o=>function(e,t,i,o){const n=`node_${e}_`,s=[{name:`${n}show_name`,selector:{boolean:{}}}];la(e)&&s.push({name:`${n}show_state`,selector:{boolean:{}}});for(const i of ra){if(!aa(e,i))continue;const r=`${n}${i}_`;s.push({name:`${r}entity`,selector:{entity:{}}}),fa(t[`${r}entity`])&&("inside"===i?s.push({name:`${r}position`,selector:{select:{mode:"dropdown",options:[{value:"above",label:o("position_above")},{value:"below",label:o("position_below")}]}}}):s.push({name:`${r}prefix`,selector:{text:{}}}),s.push({name:`${r}decimals`,selector:Ua(o)},{name:`${r}size`,selector:{number:{min:60,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:`${r}weight`,selector:Za(o)}))}return{name:`node_${e}`,type:"expandable",flatten:!0,title:Te(`node.${e}`,i),schema:s}}(o,t,e,i)),Qa]},...l?[{name:Rr,type:"constant"}]:[],{name:Lr,type:"constant"},{name:"grid_status",type:"expandable",flatten:!0,title:i("grid_status_section"),schema:[{name:"grid_status",selector:{entity:{}}},{name:"grid_status_outage",selector:g},{name:"grid_status_ok",selector:g}]},{name:"display",type:"expandable",flatten:!0,title:i("display"),schema:[{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"cross",label:i("layout_cross")},{value:"square_right",label:i("layout_square_right")},{value:"square_left",label:i("layout_square_left")},{value:"triangle",label:i("layout_triangle")},{value:"triangle_battery",label:i("layout_triangle_battery")}]}}},{name:"flow_lines",selector:{select:{mode:"dropdown",options:[{value:"curved",label:i("lines_curved")},{value:"straight",label:i("lines_straight")}]}}},{name:"appearance",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("appearance_auto")},{value:"light",label:i("appearance_light")},{value:"dark",label:i("appearance_dark")}]}}},{name:"list_enabled",selector:{boolean:{}}},...l?[{name:"list_solar",selector:{boolean:{}}}]:[],{name:"list_always_below",selector:{boolean:{}}},{name:"ring_enabled",selector:{boolean:{}}},...l?[{name:"ring_solar",selector:{boolean:{}}}]:[],{name:"ring_animation",selector:{select:{mode:"dropdown",options:[{value:"overtake",label:i("ring_overtake")},{value:"fade",label:i("ring_fade")},{value:"jump",label:i("ring_jump")}]}}},{name:"max_consumers",selector:{number:{...Ga("max_consumers"),mode:"box"}}},{name:"min_consumer_w",selector:{number:{...Ga("min_consumer_w"),mode:"box"}}},...s?[]:[{name:"rest_label",selector:{text:{}}}],{name:"power_unit",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("power_auto")},{value:"kW",label:i("power_kw")},{value:"W",label:i("power_w")}]}}},..."auto"===t.power_unit?[{name:"power_digits",selector:{select:{mode:"dropdown",options:[{value:2,label:"2"},{value:3,label:"3"},{value:4,label:"4"}]}}}]:[],..."W"===t.power_unit||"auto"===t.power_unit?[]:[{name:"power_decimals",selector:{select:{mode:"dropdown",options:[{value:1,label:"1"},{value:2,label:"2"},{value:3,label:"3"}]}}}],{name:"update_interval_s",selector:{number:{...Ga("update_interval_s"),mode:"box"}}}]},(()=>{const s=(e,t,i=!1)=>t.length>1?[{name:`expanded_${e}`,disabled:i,selector:{boolean:{}}}]:[],a=[{name:"quick_style",selector:{select:{mode:"dropdown",options:Wa.map(e=>({value:e,label:i(`quick_style_${e}`)}))}}}],c=[{name:"modes",disabled:!n,selector:{select:{multiple:!0,mode:"list",options:ol(o.modes,Fa,e=>i(el[e]))}}},{name:"avg_short_minutes",disabled:!n,selector:{number:{...Ga("view.avg_short_minutes"),mode:"box"}}},{name:"avg_long_minutes",disabled:!n,selector:{number:{...Ga("view.avg_long_minutes"),mode:"box"}}},...s("modes",o.modes,!n)],p=[{name:"energy_periods",disabled:!Ma(t),selector:{select:{multiple:!0,mode:"list",options:ol(o.energy_periods,La,e=>i(`energy_${e}`))}}},...s("energy_periods",o.energy_periods,!Ma(t))],m=r?[{name:"scope",selector:{select:{multiple:!0,mode:"list",options:ol(o.scope,Ra,e=>i(`scope_${e}`))}}},...s("scope",o.scope)]:[],f=!1!==t.ring_solar,g=l&&f&&(d||h),_=g?[{name:"pv_scales",selector:{select:{multiple:!0,mode:"list",options:ol(u,Oa,e=>i(`pv_scale_${e}`)).map(e=>"share"===e.value&&!d||"peak"===e.value&&!h?{...e,disabled:!0}:e)}}},...s("pv_scales",u.filter(e=>"share"===e?d:h))]:[],w=g?h?d?void 0:Te("editor_help.pv_scale_share_locked",e):Te("editor_help.pv_scale_peak_locked",e):void 0;return{name:"quick_buttons",type:"expandable",flatten:!0,title:i("quick_buttons"),schema:[...a,...c,...p,..._,...m],parts:[{title:i("group_quick_style"),schema:a},{title:i("group_smoothing"),notice:n?void 0:Te("editor_help.modes_locked",e),schema:c},{title:i("group_energy"),schema:p},...g?[{title:i("group_pv_scale"),notice:w,schema:_}]:[],...r?[{title:i("group_scope"),schema:m}]:[]]}})(),{name:"flow",type:"expandable",flatten:!0,title:i("flow"),schema:[{name:"min_w",selector:{number:{...Ga("flow.min_w"),mode:"box"}}},{name:"peak_w",selector:{number:{...Ga("flow.peak_w"),mode:"box"}}},{name:"inactive_lines",selector:{select:{mode:"dropdown",options:[{value:"show",label:i("lines_show")},{value:"dim",label:i("lines_dim")},{value:"hide",label:i("lines_hide")}]}}},{name:"animation",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("anim_auto")},{value:"on",label:i("anim_on")},{value:"off",label:i("anim_off")}]}}},{name:"design",selector:{select:{mode:"dropdown",options:[{value:Ei,label:i("design_none")},...Ci.map(t=>({value:t.id,label:Wi(t,e)}))]}}},{name:"dot_size",selector:{number:{...Ga("flow.dot_size"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"line_width",selector:{number:{...Ga("flow.line_width"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"flow_fine",type:"expandable",flatten:!0,title:i("flow_fine"),schema:[{name:"slow_below_w",selector:{number:{...Ga("flow.slow_below_w"),mode:"box"}}},{name:"full_speed_w",selector:{number:{...Ga("flow.full_speed_w"),mode:"box"}}},{name:"more_dots_above_w",selector:{number:{...Ga("flow.more_dots_above_w"),mode:"box"}}},{name:"max_dots_at_w",selector:{number:{...Ga("flow.max_dots_at_w"),mode:"box"}}},{name:"max_dots",selector:{number:{...Ga("flow.max_dots"),mode:"box"}}},{name:"slow_s",selector:{number:{...Ga("flow.slow_s"),step:.1,mode:"box"}}},{name:"fast_s",selector:{number:{...Ga("flow.fast_s"),step:.1,mode:"box"}}}]}]},{name:"icons",type:"expandable",flatten:!0,title:i("icons"),schema:Yr.filter(e=>"rest"!==e||!s).map(e=>({name:`icon_${e}`,selector:{icon:{}}}))}]}class sl extends ce{constructor(){super(...arguments),this._wasValid=!0,this._openColors=new Set,this._pickerMode="hex",this._consumerKeys=[],this._nextConsumerKey=0,this._openConsumers=new Set,this._builtSections=new Set,this._builtConsumers=new Set,this._label=e=>{const t=e.name,i=/^node_(?:solar|grid|house|battery)_(.+)$/.exec(t);return i?Te(`editor.node_${i[1]}`,this.hass):"grid_status"===t?Te("editor.grid_status",this.hass):t.endsWith("_source")?Te(`editor.${t.replace(/_source$/,"")}`,this.hass):t.endsWith("_invert")?Te("editor.invert",this.hass):t.startsWith("icon_")?Te(`editor.${t.slice(5)}`,this.hass):Fr.includes(t)?Te("editor.entity",this.hass):Te(`editor.${t}`,this.hass)},this._helper=e=>{if("grid_status"===e.name)return"";const t=this._flat??{};if("energy_periods"===e.name&&!Ma(t))return Te("editor_help.energy_periods_locked",this.hass);let i=`editor_help.${e.name.replace(/^node_(?:solar|grid|house|battery)_/,"node_")}`;if(e.name.startsWith("color_")&&(i="editor_help.color"),e.name.endsWith("_source")){if("derived"!==(this._flat??{})[e.name])return"";i="editor_help.derived"}const o=Te(i,this.hass);return o===i?"":o},this._probe=e=>{const t=this.shadowRoot;if(!t||"undefined"==typeof getComputedStyle)return"";const i=document.createElement("span");if(i.style.display="none",i.style.color=e,""===i.style.color)return"";t.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o},this._hexTyped=e=>{const t=e.target,i=Ce(t.value);i&&this._picker?(this._picker={id:this._picker.id,hsv:ze(i,this._picker.hsv.h)},this._applyColor(this._picker.id,i)):this._picker&&(t.value=We(this._picker.hsv))},this._addStop=()=>{const e=this._socStops();if(!e)return;const t=e.length-1;let i=50,o=t,n=-1;for(let s=1;s<=t;s++){const t=e[s].at-e[s-1].at;t>n&&(n=t,o=s,i=Math.round((e[s].at+e[s-1].at)/2))}const s=[...e];s.splice(o,0,{at:i,color:e[o].color}),this._writeStops(s)},this._notes=new Map,this._sourceLabel=e=>Te(`editor.pv_source_${e.name}`,this.hass),this._sourceHelper=e=>{const t=`editor_help.pv_source_${e.name}`,i=Te(t,this.hass);return i===t?"":i},this._restHelper=e=>"min_w"===e.name?Te("editor_help.rest_min_w",this.hass):"position"===e.name?Te("editor_help.rest_position",this.hass):"show"===e.name?Te("editor_help.rest_show",this.hass):this._consumerHelper(e),this._consumerLabel=e=>{if(""===e.labelKey)return"";if(e.labelKey)return Te(`editor.${e.labelKey}`,this.hass);const t=`editor.consumer_${e.name}`,i=Te(t,this.hass);return i===t?Te(`editor.${e.name}`,this.hass):i},this._consumerHelper=e=>{if(""===e.labelKey)return"";const t=`editor_help.${e.labelKey??`consumer_${e.name}`}`,i=Te(t,this.hass);return i===t?"":i},this._addConsumer=()=>{const e=this._consumerRows(),t=[...this._keysFor(e.length)],i=e[e.length-1],o=xa(i)&&!0===i[Ir]?e.length-1:e.length,n=[...e],s=this._nextConsumerKey++;n.splice(o,0,{}),t.splice(o,0,s),this._openConsumers=new Set([...this._openConsumers,s]),this._builtConsumers=new Set([...this._builtConsumers,s]),this._writeConsumers(n,t)},this._moveConsumer=e=>{e.stopPropagation(),this._moveTo(e.detail.oldIndex,e.detail.newIndex)}}setConfig(e){this._config=e,void 0!==this._flat&&JSON.stringify(e)===this._emitted||(this._flat=ma(e),this._consumerKeys=[],this._openConsumers=new Set),queueMicrotask(()=>this._fixOnOpen(e))}connectedCallback(){super.connectedCallback();const e=this._config;e&&queueMicrotask(()=>this._fixOnOpen(e))}_fixOnOpen(e){if(this._config!==e||this._fixedFor===e||!this.isConnected)return;this._fixedFor=e;let t=function(e){const t=e.view;if(!xa(t)||!1!==t.show_selector)return;let i;try{i=li(e)}catch{return}const{show_selector:o,...n}=t,s={...e,view:{...n,modes:i.view.modes,energy_periods:Sa(n.energy_periods,La)??(i.view.power?["power"]:i.view.energyPeriods)}};return i.consumers.length>0&&(s.list={...e.list??{},scope:i.list.scope}),i.view.pvScales.length>0&&(s.view.pv_scales=i.view.pvScales),s}(e);const i=hi(e.memory_id);if((void 0===i||this._twiceInDashboard(i))&&(t={...t??e,memory_id:ci()}),!t)return;const o=t;this._config=o,this._fixedFor=o,this._flat=ma(o),this._emitted=JSON.stringify(o),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:o},bubbles:!0,composed:!0})),this.requestUpdate()}_twiceInDashboard(e){let t=this;for(;t;){const i=t.lovelace?.config;if(i){return di(i.views).filter(t=>hi(t.memory_id)===e).length>1}t=t.parentNode??(t instanceof ShadowRoot?t.host:null)}return!1}_shownFlat(){const e=this._flat??{};return this._shown?.from!==e&&(this._shown={from:e,data:{...e,...tl(e),...il(e)}}),this._shown.data}_valueChanged(e){const t={...e.detail.value},i=this._flat??{},o=tl(i);for(const e of["modes","energy_periods","scope"]){!(void 0!==Sa(i[e],Ta[e]))&&Va(t[e],o[e])&&(t[e]=void 0)}const n=il(i);for(const[e,o]of Object.entries(n)){(void 0===i[e]||null===i[e]||""===i[e])&&Va(t[e],o)&&(t[e]=void 0)}this._emit(t)}_emit(e){if(!this._config)return;this._flat=e;const t=ja(e,this._config);try{this._config!==this._validFor&&(this._validFor=this._config,this._wasValid=void 0===function(e,t){try{return void li(e,t,[])}catch(e){return e}}(this._config,this.hass)),this._wasValid&&li(t,this.hass,[]),this._held=void 0}catch(t){return void(this._held=function(e,t){for(const i of Fr){const o=e[`${i}_source`]??na(i,void 0);if(("entity"===o||"split"===o||"sources"===o)&&void 0===ga(i,e))return Te("editor.incomplete",t,{name:Te(`node.${i}`,t)})}}(e,this.hass)??(t instanceof Error?t.message:String(t)))}this._emitted=JSON.stringify(t),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_setColor(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t,o=this._consumerRows(),n=o.findIndex(Br);"rest"===e&&n>=0?this._writeRest(o,n,{color:i}):this._emit({...this._flat,[`color_${e}`]:i})}_renderColors(){return V`
      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">${(e=>Te(`editor.${e}`,this.hass))("colors")}</div>
        <div class="colors">
          ${this._picker?V`<div
                  class="scrim"
                  @pointerdown=${e=>{e.stopPropagation(),this._picker=void 0}}
                ></div>`:""}
          <p class="hint">${Te("editor_help.color",this.hass)}</p>
          ${ia.map(e=>this._renderNodeColor(e))}
          ${this._renderExtraColors()}
          ${this._renderDotColor()} ${this._renderArrowColors()} ${this._renderConsumerColors()}
          ${this._renderSocStops()}
        </div>
      </ha-expansion-panel>
    `}_renderExtraColors(){const e=this._flat??{},t=[];for(const i of Fr)if("battery"!==i||"none"!==e.battery_source)for(const o of ra){if(!aa(i,o)||!fa(e[`node_${i}_${o}_entity`]))continue;const n=`color_${i}_${o}`,s=e[n],r=Te(`editor.color_extra_${o}`,this.hass,{node:Te(`node.${i}`,this.hass)});t.push(this._colorRow({id:`flat:${n}`,label:r,name:r,value:"string"==typeof s?s:"",preset:"var(--secondary-text-color)"}))}return t.length?V`${this._group(Te("editor.colors_extras",this.hass))}${t}`:""}_group(e){return V`<p class="group">${e}</p>`}_renderNodeColor(e){const t="rest"===e?this._restColour():this._flat?.[`color_${e}`],i=Te(`editor.color_${e}`,this.hass);return this._colorRow({id:`node:${e}`,label:i,name:i,value:"string"==typeof t?t:"",preset:be[e]})}_renderDotColor(){const e=this._flat?.dot_color,t="string"==typeof e&&""!==e.trim(),i=Te("editor.dot_color",this.hass);return V`
      ${this._group(Te("editor.colors_dots",this.hass))}
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!t}
          @change=${i=>{const o=i.target.checked;o&&t&&(this._lastDotColor=e),this._setFlat("dot_color",o?"":this._lastDotColor??oa)}}
        />
        <span>${Te("editor.dot_color_follow",this.hass)}</span>
      </label>
      ${t?this._colorRow({id:"flat:dot_color",label:i,name:i,value:e,preset:oa}):j}
    `}_renderArrowColors(){const e=this._flat?.color_arrows;return V`
      ${this._group(Te("editor.colors_arrows",this.hass))}
      <label class="switch">
        <input
          class="arrow-colors"
          type="checkbox"
          .checked=${"direction"!==e}
          @change=${e=>{const t=e.target.checked;this._setFlat("color_arrows",t?"":"direction")}}
        />
        <span>${Te("editor.arrow_colors_red_green",this.hass)}</span>
      </label>
    `}_renderConsumerColors(){const e=this._flat?.consumers,t=(Array.isArray(e)?e:[]).map((e,t)=>({entry:e,index:t})).filter(e=>xa(e.entry));if(t.every(({entry:e})=>Br(e)&&!xa(e.indicators)))return V``;const i=xe;let o=0;return V`
      ${this._group(Te("editor.colors_consumers",this.hass))}
      ${t.map(({entry:e,index:t})=>{const n=Br(e);n&&o++;const s=n?this._restView(e).name||Te("list.rest",this.hass):"string"==typeof e.name&&e.name.trim()||("string"==typeof e.entity?e.entity:`#${t+1}`),r="string"==typeof e.color?e.color:"",a=n?this._restColour()||be.rest:r||i[(t-o)%i.length],l=qr(e),c=xa(l.indicators)?l.indicators:{},d=["ring","bar_top","bar_bottom"].filter(e=>{const t=c[e];return xa(t)&&fa(t.entity)});return V`${n?j:this._colorRow({id:`consumer:${t}`,label:s,name:s,value:r,preset:a})}${d.map(e=>{const i=c[e],o=`${s} · ${Te(`editor.indicator_${e}`,this.hass)}`;return this._colorRow({id:`indicator:${t}:${e}`,label:o,name:o,value:"string"==typeof i.color?i.color:"",preset:a})})}`})}
    `}_renderSocStops(){const e=this._socStops();if(!e)return V`
        ${this._group(Te("editor.colors_soc",this.hass))}
        <p class="hint">${Te("editor.yaml_only",this.hass)}</p>
      `;const t=e.length-1;return V`
      ${this._group(Te("editor.colors_soc",this.hass))}
      ${e.map((e,i)=>{const o=0===i||i===t;return this._colorRow({id:`stop:${i}`,label:`${e.at} %`,name:V`
            <span class="at">
              ${o?V`<span class="fixed">${e.at}</span>`:V`<input
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
          `,value:e.color,preset:e.color,trail:o?void 0:V`<button
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
    `}_colorRow(e){const{id:t,label:i,name:o,value:n,preset:s,trail:r}=e,a=this._openColors.has(t),l=this._picker?.id===t,c=`color-field-${t.replace(":","-")}`,d=l?We(this._picker.hsv):Ce(n||s,this._probe)??"#888888";return V`
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
    `}_renderPicker(e){const{h:t,s:i,v:o}=this._picker.hsv;return V`
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
          ${"hex"===this._pickerMode?V`<input
                  class="hex"
                  type="text"
                  spellcheck="false"
                  .value=${e}
                  aria-label=${Te("editor.color_hex",this.hass)}
                  @change=${this._hexTyped}
                />`:V`<code class="reading">${e}</code>`}
          <div class="modes" role="group" aria-label=${Te("editor.color_mode",this.hass)}>
            ${["hex","rgb","hsl"].map(e=>V`<button
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
    `}_renderChannels(){const e=this._picker.hsv,t="rgb"===this._pickerMode,i=Pe(e),o=t?(()=>{const t=/^#(..)(..)(..)$/.exec(We(e)),[i,o,n]=t?[1,2,3].map(e=>Number.parseInt(t[e],16)):[0,0,0];return[{key:"r",label:"R",value:i,max:255},{key:"g",label:"G",value:o,max:255},{key:"b",label:"B",value:n,max:255}]})():[{key:"h",label:"H",value:Math.round(i.h),max:360},{key:"s",label:"S",value:Math.round(100*i.s),max:100},{key:"l",label:"L",value:Math.round(100*i.l),max:100}];return V`
      <div class="channels">
        ${o.map(e=>V`
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
    `}_setChannel(e,t,i){if(!this._picker||!Number.isFinite(t))return;const o=this._picker.hsv;let n;if("r"===e||"g"===e||"b"===e){const i=/^#(..)(..)(..)$/.exec(We(o)),s=i?[1,2,3].map(e=>Number.parseInt(i[e],16)):[0,0,0];s["rgb".indexOf(e)]=Math.min(255,Math.max(0,Math.round(t)));const r=`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`;n=ze(r,o.h)}else{const i=Pe(o),s=Math.max(0,t);"h"===e&&(i.h=Math.min(360,s)%360),"s"===e&&(i.s=Math.min(100,s)/100),"l"===e&&(i.l=Math.min(100,s)/100),n={...Ne(i),h:i.h}}this._picker={id:this._picker.id,hsv:n},i&&this._commitPicker()}_renderInUse(){const e=this._coloursInUse();return 0===e.length?V``:V`
      <div class="used">
        <span class="cap">${Te("editor.color_used",this.hass)}</span>
        <div class="chips">
          ${e.map(e=>V`<button
              class="chip"
              style="background:${e.hex}"
              title=${e.value}
              aria-label=${e.value}
              @click=${()=>this._takeColour(e.value,e.hex)}
            ></button>`)}
        </div>
      </div>
    `}_coloursInUse(){const e=this._flat??{},t=[],i=new Set,o=e=>{if("string"!=typeof e||""===e.trim())return;const o=Ce(e,this._probe);o&&!i.has(o)&&(i.add(o),t.push({value:e,hex:o}))};for(const t of ia)o(e[`color_${t}`]??be[t]);const n=Array.isArray(e.consumers)?e.consumers:[];let s=0;n.forEach((e,t)=>{Br(e)&&s++,xa(e)&&!Br(e)&&o(e.color??xe[(t-s)%xe.length])});for(const e of this._socStops()??[])o(e.color);return t}_takeColour(e,t){this._picker&&(this._picker={id:this._picker.id,hsv:ze(t,this._picker.hsv.h)},this._applyColor(this._picker.id,e))}_applyColor(e,t){const i=e.indexOf(":"),o=e.slice(0,i),n=e.slice(i+1);if("flat"===o)this._setFlat(n,t);else if("node"===o)this._setColor(n,t);else if("consumer"===o)this._setConsumerColor(Number(n),t);else if("stop"===o)this._setStopColor(Number(n),t);else if("indicator"===o){const[e,i]=n.split(":");this._setIndicatorColor(Number(e),i,t)}}_setFlat(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t;this._emit({...this._flat,[e]:i})}_setConsumerColor(e,t){if(!this._flat)return;const i=this._flat,o=Array.isArray(i.consumers)?[...i.consumers]:[];if(!xa(o[e]))return;const{color:n,...s}=o[e];o[e]=""===t.trim()?s:{...s,color:t},this._emit({...i,consumers:o})}_setIndicatorColor(e,t,i){if(!this._flat)return;const o=this._flat,n=Array.isArray(o.consumers)?[...o.consumers]:[];if(!xa(n[e]))return;const s=qr(n[e]),r=xa(s.indicators)?{...s.indicators}:{},a=xa(r[t])?r[t]:void 0;if(!a)return;const{color:l,...c}=a;r[t]=""===i.trim()?c:{...c,color:i},n[e]=ka({...s,indicators:r}),this._emit({...o,consumers:n})}_socStops(){const e=this._flat?.soc_stops;if(null==e||""===e)return ve.map(e=>({...e}));return Array.isArray(e)&&e.length>=2&&e.every(e=>xa(e)&&"number"==typeof e.at&&Number.isFinite(e.at)&&fa(e.color))?e:void 0}_writeStops(e){this._flat&&this._emit({...this._flat,soc_stops:e})}_setStopColor(e,t){const i=this._socStops();""!==t.trim()&&i&&this._writeStops(i.map((i,o)=>o===e?{...i,color:t}:i))}_setStopAt(e,t){const i=this._socStops();if(!i||!Number.isFinite(t)||e<=0||e>=i.length-1)return;const o=i[e-1].at,n=i[e+1].at,s=Math.min(n,Math.max(o,Math.round(t)));this._writeStops(i.map((t,i)=>i===e?{...t,at:s}:t))}_removeStop(e){const t=this._socStops();!t||t.length<=2||0===e||e===t.length-1||this._writeStops(t.filter((t,i)=>i!==e))}_togglePicker(e,t){this._picker?.id!==e?this._picker={id:e,hsv:ze(t,this._picker?.hsv.h??0)}:this._picker=void 0}_drag(e,t){const i=e.currentTarget;e.preventDefault(),e.stopPropagation(),i.setPointerCapture?.(e.pointerId);const o=e=>{if(!this._picker)return;const o=i.getBoundingClientRect(),n=o.width?Math.min(1,Math.max(0,(e.clientX-o.left)/o.width)):0,s=o.height?Math.min(1,Math.max(0,(e.clientY-o.top)/o.height)):0,r=this._picker.hsv;this._picker={id:this._picker.id,hsv:"hue"===t?{h:360*n,s:r.s||1,v:r.v||1}:{...r,s:n,v:1-s}}},n=()=>{i.removeEventListener("pointermove",o),i.removeEventListener("pointerup",n),i.removeEventListener("pointercancel",n),this._commitPicker()};i.addEventListener("pointermove",o),i.addEventListener("pointerup",n),i.addEventListener("pointercancel",n),o(e)}_pickerKeydown(e){if("Escape"===e.key)return this._picker=void 0,void e.stopPropagation();if(!this._picker)return;const t=e.target.classList.contains("hue"),i=e.shiftKey?10:1,o={...this._picker.hsv};switch(e.key){case"ArrowLeft":t?o.h-=i:o.s-=i/100;break;case"ArrowRight":t?o.h+=i:o.s+=i/100;break;case"ArrowUp":if(t)return;o.v+=i/100;break;case"ArrowDown":if(t)return;o.v-=i/100;break;default:return}e.preventDefault(),e.stopPropagation(),this._picker={id:this._picker.id,hsv:{h:(o.h%360+360)%360,s:Math.min(1,Math.max(0,t?o.s||1:o.s)),v:Math.min(1,Math.max(0,t?o.v||1:o.v))}},this._commitPicker()}_commitPicker(){this._picker&&this._applyColor(this._picker.id,We(this._picker.hsv))}_toggleColor(e){const t=new Set(this._openColors);t.delete(e)||t.add(e),this._openColors=t}render(){return this.hass&&this._config&&this._flat?V`${this._held?V`<p class="field-note held-note" role="alert">
            ${Te("editor.held",this.hass,{message:this._held})}
          </p>`:j}${this._renderBody()}`:j}_renderBody(){if(!this.hass||!this._config||!this._flat)return j;this._notesFor!==this._config&&(this._notesFor=this._config,this._notes=this._notesOf(this._config));const e=nl(this.hass,this._flat),t=e.findIndex(e=>e.name===Rr),i=e.findIndex(e=>e.name===Lr),o=-1===i?e:e.slice(0,i);if(-1!==t){const n=o.slice(0,t),s=o.slice(t+1),r=-1===i?[]:e.slice(i+1),a=r.findIndex(e=>"icons"===e.name),l=-1===a?r.length:a;return V`${this._renderPieces(n)}${this._renderSources()}${this._renderPieces(s)}${this._renderConsumers()}${this._renderPieces(r.slice(0,l))}${this._renderColors()}${this._renderPieces(r.slice(l))}`}const n=-1===i?[]:e.slice(i+1),s=n.findIndex(e=>"icons"===e.name),r=-1===s?n.length:s;return V`${this._renderPieces(o)}${this._renderConsumers()}${this._renderPieces(n.slice(0,r))}${this._renderColors()}${this._renderPieces(n.slice(r))}`}_notesOf(e){const t=[];try{li(e,this.hass,t)}catch{}const i=t.filter((e,i)=>t.findIndex(t=>t.field===e.field)===i);return new Map(i.flatMap(e=>{const t=Ya(e.field);if(!t)return[];const{min:i,max:o}=wt[e.field.replace(/\[\d+\]/,"")]??{min:0},n="order"===e.reason?`editor.note_order_${t}`:`editor.note_${e.reason}`,s=Te(n,this.hass,{min:i,max:o??""});return[[t,s===n?Te("editor.note_order",this.hass):s]]}))}_form(e){const t=[];let i=[];for(const o of e){i.push(o);const e=Xa(o);if(!e.some(e=>Ja.has(e)))continue;const n=e.filter(e=>this._notes.has(e));t.push(this._haForm(i));for(const e of n)t.push(V`<p class="field-note" role="note">${this._notes.get(e)}</p>`);i=[]}return(i.length>0||0===t.length)&&t.push(this._haForm(i)),V`${t}`}_haForm(e){return V`
      <ha-form
        .hass=${this.hass}
        .data=${this._shownFlat()}
        .schema=${e}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_renderPieces(e){const t=[];let i=[];for(const o of e)"expandable"===o.type?(i.length&&t.push(this._form(i)),i=[],t.push(this._renderSection(o))):i.push(o);return i.length&&t.push(this._form(i)),t}_renderParts(e){const t=e.parts??[e],i=e=>V`
      ${e.notice?V`<p class="section-notice" role="note">${e.notice}</p>`:j}
      ${Wr(function(e){const t=[],i=e=>{if(Array.isArray(e))for(const o of e){o.disabled&&t.push(String(o.name));const e=o.selector?.select;for(const i of e?.options??[])i.disabled&&t.push(`${o.name}=${i.value}`);i(o.schema)}};return i(e),t.join(",")}(e.schema),this._form(e.schema))}
    `;return t[0]===e?[i(e)]:t.map(e=>V`<fieldset class="part">
        <legend class="part-title">${e.title}</legend>
        ${i(e)}
      </fieldset>`)}_renderSection(e){const t=String(e.name),i=this._builtSections.has(t),o=Te(`editor_help.${t}`,this.hass),n=o===`editor_help.${t}`?"":o;return V`
      <ha-expansion-panel
        outlined
        class="section"
        data-section=${t}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&!i&&(this._builtSections=new Set([...this._builtSections,t]))}}
      >
        <div slot="header" role="heading" aria-level="3">${e.title}</div>
        <div class="section-content">
          ${n?V`<p class="section-description">${n}</p>`:j}
          ${i?this._renderParts(e):j}
        </div>
      </ha-expansion-panel>
    `}_sourceRows(){const e=this._flat?.solar_sources;return Array.isArray(e)?e:[]}_writeSources(e){this._flat&&this._emit({...this._flat,solar_sources:e})}_renderSources(){const e=e=>Te(`editor.${e}`,this.hass),t=this._sourceRows();return V`
      <ha-expansion-panel outlined class="consumers-panel sources-panel">
        <div slot="header" role="heading" aria-level="3">${e("solar_sources")}</div>
        <div class="consumers">
          <p class="hint">${Te("editor_help.solar_sources",this.hass)}</p>
          ${t.map((t,i)=>V`<div class="source">
              <ha-form
                .hass=${this.hass}
                .data=${t}
                .schema=${[{name:"entity",required:!0,selector:{entity:{filter:Pr}}},{name:"name",selector:{text:{}}},{name:"kwp",selector:{number:{...Ga("entities.solar.kwp"),step:.01,mode:"box"}}},{name:"icon",selector:{icon:{}}},{name:"excluded",selector:{boolean:{}}}]}
                .computeLabel=${this._sourceLabel}
                .computeHelper=${this._sourceHelper}
                @value-changed=${e=>{e.stopPropagation();const t=[...this._sourceRows()];t[i]=e.detail.value,this._writeSources(t)}}
              ></ha-form>
              <button
                class="remove"
                type="button"
                aria-label=${e("source_remove")}
                title=${e("source_remove")}
                @click=${()=>{const e=[...this._sourceRows()];e.splice(i,1),this._writeSources(e)}}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>`)}
          <button
            class="add-consumer"
            type="button"
            @click=${()=>this._writeSources([...this._sourceRows(),{excluded:!1}])}
          >
            <ha-icon icon="mdi:plus"></ha-icon>${e("source_add")}
          </button>
        </div>
      </ha-expansion-panel>
    `}_consumerRows(){const e=this._flat?.consumers;return Array.isArray(e)?e:[]}_keysFor(e){for(;this._consumerKeys.length<e;)this._consumerKeys.push(this._nextConsumerKey++);return this._consumerKeys.length>e&&(this._consumerKeys.length=e),this._consumerKeys}_writeConsumers(e,t){this._flat&&(this._consumerKeys=t,this._emit({...this._flat,consumers:e}))}_renderConsumers(){const e=e=>Te(`editor.${e}`,this.hass),t=this._consumerRows(),i=this._keysFor(t.length);let o=0;const n=t.map((e,t)=>{const n=Br(e);n&&o++;const s=xa(e)&&void 0!==e.type&&!(n&&1===o);return{row:e,index:t,key:i[t],colour:t-o,ignored:s}});return V`
      <ha-expansion-panel outlined class="consumers-panel">
        <div slot="header" role="heading" aria-level="3">${e("consumers")}</div>
        <div class="consumers">
          <p class="hint">${Te("editor_help.consumers_list",this.hass)}</p>
          ${this._renderHeldWarning(t)}
          <ha-sortable handle-selector=".handle" @item-moved=${this._moveConsumer}>
            <div class="consumer-list">
              ${cn(n,e=>e.key,e=>e.ignored?this._renderIgnored(e.row,e.index):Br(e.row)?this._renderRest(e.row,e.index,e.key):this._renderConsumer(e.row,e.index,e.key,e.colour))}
            </div>
          </ha-sortable>
          <button class="add-consumer" type="button" @click=${this._addConsumer}>
            <ha-icon icon="mdi:plus"></ha-icon>${e("consumer_add")}
          </button>
          <p class="hint">${e("colors_hint")}</p>
        </div>
      </ha-expansion-panel>
    `}_renderHeldWarning(e){const t=this._config?.max_consumers;if("number"!=typeof t||!Number.isFinite(t))return j;const i=new Set,o=e.filter(e=>{if(!xa(e)||!fa(e.entity)||i.has(e.entity))return!1;i.add(e.entity);const t=qr(e);if("always"===t.show)return!0;const o=Jr(t.show,t.condition);return Boolean(o?.entity&&o.operator&&void 0!==o.value)}).length;return o<t?j:V`<p class="hint warn">
      ${Te("editor_help.consumers_held_limit",this.hass,{held:o,limit:t})}
    </p>`}_renderConsumer(e,t,i,o){const n=e=>Te(`editor.${e}`,this.hass),s=xa(e)?e:{},r="string"==typeof s.entity?s.entity:"",a=this.hass?.states?.[r]?.attributes?.friendly_name,l="string"==typeof s.name&&s.name.trim()||"string"==typeof a&&a||r||n("consumer_new"),c=qr(s),d=xa(c.indicators)?c.indicators:{},h=He.some(e=>{const t=d[e];return xa(t)&&fa(t.entity)}),u=xe,p="string"==typeof s.color&&""!==s.color.trim()?s.color:u[o%u.length];return V`
      <ha-expansion-panel
        outlined
        class="consumer"
        .expanded=${this._openConsumers.has(i)}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&(this._builtConsumers.has(i)||(this._builtConsumers=new Set([...this._builtConsumers,i])))}}
        @expanded-changed=${e=>{if(e.target!==e.currentTarget)return;const t=new Set(this._openConsumers);e.detail.expanded?t.add(i):t.delete(i),this._openConsumers=t}}
      >
        <div slot="header" class="consumer-head">
          ${this._moveControls(t)}
          <ha-icon
            class="consumer-icon"
            icon=${"string"==typeof s.icon&&s.icon?s.icon:"mdi:flash"}
            style="color:${p}"
          ></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">${l}</span>
            ${r?V`<small>${r}</small>`:j}
          </span>
          ${h?V`<span class="badge"><ha-icon icon="mdi:gauge"></ha-icon>${n("indicators")}</span>`:j}
          <button
            class="remove"
            type="button"
            aria-label=${n("consumer_remove")}
            title=${n("consumer_remove")}
            @click=${e=>{e.stopPropagation(),this._removeConsumer(t)}}
            @keydown=${e=>{e.stopPropagation()}}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${this._builtConsumers.has(i)?V`<ha-form
                .hass=${this.hass}
                .data=${Kr(s)}
                .schema=${jr(this.hass,Kr(s))}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._consumerHelper}
                @value-changed=${e=>{e.stopPropagation(),this._setConsumer(t,e.detail.value)}}
              ></ha-form>`:j}
      </ha-expansion-panel>
    `}_renderRest(e,t,i){const o=this._restView(e),n="string"==typeof o.name&&o.name.trim()||Te("list.rest",this.hass),s=this._restColour()||be.rest;return V`
      <ha-expansion-panel
        outlined
        class="rest-entry"
        .expanded=${this._openConsumers.has(i)}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&(this._builtConsumers.has(i)||(this._builtConsumers=new Set([...this._builtConsumers,i])))}}
        @expanded-changed=${e=>{if(e.target!==e.currentTarget)return;const t=new Set(this._openConsumers);e.detail.expanded?t.add(i):t.delete(i),this._openConsumers=t}}
      >
        <div slot="header" class="consumer-head">
          ${this._moveControls(t)}
          <ha-icon
            class="consumer-icon"
            icon=${"string"==typeof o.icon&&o.icon?o.icon:"mdi:cloud-question"}
            style="color:${s}"
          ></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">${n}</span>
            <small>${(e=>Te(`editor.${e}`,this.hass))("rest_entry")}</small>
          </span>
        </div>
        ${this._builtConsumers.has(i)?V`<ha-form
                .hass=${this.hass}
                .data=${Kr(o)}
                .schema=${jr(this.hass,Kr(o),!0)}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._restHelper}
                @value-changed=${e=>{e.stopPropagation(),this._setRest(t,e.detail.value)}}
              ></ha-form>`:j}
      </ha-expansion-panel>
    `}_renderIgnored(e,t){const i=e=>Te(`editor.${e}`,this.hass);return V`
      <div class="ignored-entry">
        <div class="consumer-head">
          ${this._moveControls(t)}
          <ha-icon class="consumer-icon" icon="mdi:help-circle-outline"></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">type: ${String(e.type)}</span>
            <small>${i("entry_ignored")}</small>
          </span>
          <button
            class="remove"
            type="button"
            aria-label=${i("consumer_remove")}
            title=${i("consumer_remove")}
            @click=${()=>this._removeConsumer(t)}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
      </div>
    `}_restView(e){const t=this._flat??{},{[Ir]:i,type:o,...n}=e;return ka({...n,name:fa(n.name)?n.name:t.rest_label,icon:fa(n.icon)?n.icon:t.icon_rest})??{}}_restColour(){const e=this._flat??{},t=this._consumerRows().find(Br),i=t?.color;return"string"==typeof i&&""!==i.trim()?i:"string"==typeof e.color_rest?e.color_rest:""}_writeRest(e,t,i,o=[...this._consumerKeys]){if(!this._flat)return;const n=this._flat,s=xa(e[t])?e[t]:{},{[Ir]:r,...a}=s,l=[...e];l[t]=ka({name:n.rest_label,icon:n.icon_rest,color:n.color_rest,...a,...i,type:"rest"}),this._consumerKeys=o,this._emit({...n,consumers:l,rest_label:void 0,icon_rest:void 0,color_rest:void 0})}_setRest(e,t){const i=this._consumerRows(),o=xa(i[e])?i[e]:{};if(JSON.stringify(Kr(this._restView(o)))===JSON.stringify(t))return;const n=t.highlight,s=Array.isArray(n)?{...t,highlight:{...ca(o.highlight,[...Zr]),bold:n.includes("bold"),band:n.includes("band")}}:t,r=Kr(this._restView(o)),a=Object.fromEntries(Object.keys(r).filter(e=>!(e in s)).map(e=>[e,void 0]));this._writeRest(i,e,{...a,...s})}_moveControls(e){const t=e=>Te(`editor.${e}`,this.hass);return customElements.get("ha-sortable")?V`<ha-icon
          class="handle"
          icon="mdi:drag"
          @click=${e=>e.stopPropagation()}
          @keydown=${e=>e.stopPropagation()}
        ></ha-icon>`:V`<span class="move">
          ${[-1,1].map(i=>V`<button
              type="button"
              aria-label=${t(i<0?"consumer_up":"consumer_down")}
              ?disabled=${e+i<0||e+i>=this._consumerRows().length}
              @click=${t=>{t.stopPropagation(),this._moveTo(e,e+i)}}
              @keydown=${e=>e.stopPropagation()}
            >
              <ha-icon icon=${i<0?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>
            </button>`)}
        </span>`}_setConsumer(e,t){const i=[...this._consumerRows()],o=i[e],n=xa(o)&&JSON.stringify(Kr(o))===JSON.stringify(t),s=t.highlight,r=Array.isArray(s)?{...t,highlight:{...ca(xa(o)?o.highlight:void 0,[...Zr]),bold:s.includes("bold"),band:s.includes("band")}}:t;i[e]=n?o:qr(r),this._writeConsumers(i,[...this._consumerKeys])}_removeConsumer(e){const t=[...this._consumerRows()],i=[...this._consumerKeys];t.splice(e,1),i.splice(e,1),this._writeConsumers(t,i)}_moveTo(e,t){const i=[...this._consumerRows()],o=[...this._consumerKeys];if(e===t||e>=i.length)return;const n=i.findIndex(Br);i.splice(t,0,...i.splice(e,1)),o.splice(t,0,...o.splice(e,1));const s=i.findIndex(Br);xa(i[s])&&!0===i[s][Ir]&&s!==n?this._writeRest(i,s,{},o):this._writeConsumers(i,o)}}sl.properties={hass:{attribute:!1},_config:{state:!0},_flat:{state:!0},_openColors:{state:!0},_picker:{state:!0},_pickerMode:{state:!0},_openConsumers:{state:!0},_builtSections:{state:!0},_builtConsumers:{state:!0},_held:{state:!0}},sl.styles=s`
    /* One PV source: its form, the remove button beside it (PV-9). */
    .source {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .source ha-form {
      flex: 1;
    }

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

    .consumer,
    .rest-entry {
      --expansion-panel-summary-padding: 0 8px 0 4px;
      --expansion-panel-content-padding: 4px 12px 12px;
    }

    /* An entry the card skips (L-21): framed like the others, nothing to unfold. */
    .ignored-entry {
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 8px 8px 8px 4px;
      color: var(--secondary-text-color);
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

    .hint.warn {
      color: var(--warning-color, #ffa600);
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
  `,customElements.get(pi)||customElements.define(pi,sl);var rl=Object.freeze({__proto__:null,consumerView:qr,fieldOwner:Ia});export{Ke as ConfigError};
