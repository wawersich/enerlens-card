const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let s=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=o.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&o.set(i,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const o=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new s(o,e,i)},r=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,p=globalThis,m=p.trustedTypes,f=m?m.emptyScript:"",g=p.reactiveElementPolyfillSupport,_=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!a(e,t),v={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&l(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:s}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const n=o?.call(this);s?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const e=this.properties,t=[...d(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,o)=>{if(t)i.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of o){const o=document.createElement("style"),s=e.litNonce;void 0!==s&&o.setAttribute("nonce",s),o.textContent=t.cssText,i.appendChild(o)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=o;const n=s.fromAttribute(t,e.type);this[o]=n??this._$Ej?.get(o)??n,this._$Em=null}}requestUpdate(e,t,i,o=!1,s){if(void 0!==e){const n=this.constructor;if(!1===o&&(s=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??y)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:s},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==s||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[_("elementProperties")]=new Map,b[_("finalized")]=new Map,g?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,$=x.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+M,C=`<${E}>`,z=document,P=()=>z.createComment(""),W=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,F="[ \t\n\f\r]",L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,O=/>/g,T=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,q=/"/g,I=/^(?:script|style|textarea|title)$/i,B=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),H=B(1),V=B(2),K=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),U=new WeakMap,Z=z.createTreeWalker(z,129);function Q(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const G=(e,t)=>{const i=e.length-1,o=[];let s,n=2===t?"<svg>":3===t?"<math>":"",r=L;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===L?"!--"===l[1]?r=R:void 0!==l[1]?r=O:void 0!==l[2]?(I.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=T):void 0!==l[3]&&(r=T):r===T?">"===l[0]?(r=s??L,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?T:'"'===l[3]?q:D):r===q||r===D?r=T:r===R||r===O?r=L:(r=T,s=void 0);const h=r===T&&e[t+1].startsWith("/>")?" ":"";n+=r===L?i+C:c>=0?(o.push(a),i.slice(0,c)+A+i.slice(c)+M+h):i+M+(-2===c?t:h)}return[Q(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class Y{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let s=0,n=0;const r=e.length-1,a=this.parts,[l,c]=G(e,t);if(this.el=Y.createElement(l,i),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=Z.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(A)){const t=c[n++],i=o.getAttribute(e).split(M),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:r[2],strings:i,ctor:"."===r[1]?ie:"?"===r[1]?oe:"@"===r[1]?se:te}),o.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:s}),o.removeAttribute(e));if(I.test(o.tagName)){const e=o.textContent.split(M),t=e.length-1;if(t>0){o.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],P()),Z.nextNode(),a.push({type:2,index:++s});o.append(e[t],P())}}}else if(8===o.nodeType)if(o.data===E)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=o.data.indexOf(M,e+1));)a.push({type:7,index:s}),e+=M.length-1}s++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,o){if(t===K)return t;let s=void 0!==o?i._$Co?.[o]:i._$Cl;const n=W(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(e),s._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=s:i._$Cl=s),void 0!==s&&(t=J(e,s._$AS(e,t.values),s,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??z).importNode(t,!0);Z.currentNode=o;let s=Z.nextNode(),n=0,r=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new ee(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new ne(s,this,e)),this._$AV.push(t),a=i[++r]}n!==a?.index&&(s=Z.nextNode(),n++)}return Z.currentNode=z,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),W(e)?e===j||null==e||""===e?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==K&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&W(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=U.get(e.strings);return void 0===t&&U.set(e.strings,t=new Y(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const s of e)o===t.length?t.push(i=new ee(this.O(P()),this.O(P()),this,this.options)):i=t[o],i._$AI(s),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,s){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}_$AI(e,t=this,i,o){const s=this.strings;let n=!1;if(void 0===s)e=J(this,e,t,0),n=!W(e)||e!==this._$AH&&e!==K,n&&(this._$AH=e);else{const o=e;let r,a;for(e=s[0],r=0;r<s.length-1;r++)a=J(this,o[i+r],t,r),a===K&&(a=this._$AH[r]),n||=!W(a)||a!==this._$AH[r],a===j?e=j:e!==j&&(e+=(a??"")+s[r+1]),this._$AH[r]=a}n&&!o&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}}class oe extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}}class se extends te{constructor(e,t,i,o,s){super(e,t,i,o,s),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??j)===K)return;const i=this._$AH,o=e===j&&i!==j||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==j&&(i===j||o);o&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re={I:ee},ae=x.litHtmlPolyfillSupport;ae?.(Y,ee),(x.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;let ce=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let s=o._$litPart$;if(void 0===s){const e=i?.renderBefore??null;o._$litPart$=s=new ee(t.insertBefore(P(),e),e,void 0,i??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=Number.NaN;class ue{constructor(){this.ts=new Float64Array(32),this.vs=new Float64Array(32),this.count=0}get length(){return this.count}oldest(){return this.count>0?this.ts[0]:void 0}push(e,t){if(!Number.isFinite(e))return;const i=null!==t&&Number.isFinite(t)?t:he;if(0===this.count||e>this.ts[this.count-1])return void this.insertAt(this.count,e,i);const o=this.lowerBound(e);o<this.count&&this.ts[o]===e?this.vs[o]=i:this.insertAt(o,e,i)}mean(e,t){if(0===this.count||t<=e)return null;let i=this.upperBound(e),o=i>0?this.vs[i-1]:he,s=e,n=0,r=0;for(;i<this.count&&this.ts[i]<=t;i++){const e=this.ts[i];Number.isNaN(o)||(n+=o*(e-s),r+=e-s),o=this.vs[i],s=e}return Number.isNaN(o)||(n+=o*(t-s),r+=t-s),r>0?n/r:null}has(e){const t=this.lowerBound(e);return t<this.count&&this.ts[t]===e}removeGap(e){const t=this.lowerBound(e);t>=this.count||this.ts[t]!==e||!Number.isNaN(this.vs[t])||(this.ts.copyWithin(t,t+1,this.count),this.vs.copyWithin(t,t+1,this.count),this.count--)}prune(e){const t=this.upperBound(e)-1;t>0&&this.dropOldest(t)}insertAt(e,t,i){let o=e;if(this.count===this.ts.length)if(this.count<512)this.grow();else{if(0===o)return;this.dropOldest(1),o--}o<this.count&&(this.ts.copyWithin(o+1,o,this.count),this.vs.copyWithin(o+1,o,this.count)),this.ts[o]=t,this.vs[o]=i,this.count++}grow(){const e=Math.min(512,2*this.ts.length),t=new Float64Array(e),i=new Float64Array(e);t.set(this.ts.subarray(0,this.count)),i.set(this.vs.subarray(0,this.count)),this.ts=t,this.vs=i}dropOldest(e){this.ts.copyWithin(0,e,this.count),this.vs.copyWithin(0,e,this.count),this.count-=e}lowerBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<e?t=o+1:i=o}return t}upperBound(e){let t=0,i=this.count;for(;t<i;){const o=t+i>>1;this.ts[o]<=e?t=o+1:i=o}return t}}class pe{constructor(e){this.series=new Map,this.gaps=[],this.windowMs=Number.isFinite(e)&&e>0?e:0}push(e,t,i){let o=this.series.get(e);void 0===o&&(o=new ue,this.series.set(e,o)),o.push(t,i)}markGap(e,t=e){if(!Number.isFinite(e))return;const i=new Map;for(const[t,o]of this.series){const s=o.has(e)?e+1:e;o.push(s,null),i.set(t,s)}this.gaps.push({t:e,markedAt:t,at:i})}healGaps(e,t){const i=new Set(t),o=[];for(const t of this.gaps)if(t.markedAt>e)o.push(t);else{for(const[e,o]of t.at)i.has(e)&&(this.series.get(e)?.removeGap(o),t.at.delete(e));t.at.size>0&&o.push(t)}this.gaps=o}mean(e,t,i){const o=this.series.get(e);return void 0===o?null:o.mean(i-t,i)}status(e){const t=e-this.windowMs;let i,o=this.series.size>0;for(const e of this.series.values()){const s=e.oldest();void 0!==s?((void 0===i||s>i)&&(i=s),s>t&&(o=!1)):o=!1}return void 0===i?{complete:!1}:{complete:o,since:i}}prune(e){const t=e-this.windowMs;for(const e of this.series.values())e.prune(t);this.gaps=this.gaps.filter(e=>e.t>=t)}sampleCount(e){return this.series.get(e)?.length??0}}function me(e){if("string"!=typeof e)return null;const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}function fe(e){if(null===e||"object"!=typeof e)return null;const{s:t,lu:i}=e;return"number"==typeof i&&Number.isFinite(i)?{t:Math.round(1e3*i),v:me(t)}:null}async function ge(e,t,i,o=5e3){const s={};if(0===t.length)return s;const n=Date.now(),r=n-6e4*i,a=e.callWS({type:"history/history_during_period",start_time:new Date(r).toISOString(),end_time:new Date(n).toISOString(),entity_ids:t,minimal_response:!0,no_attributes:!0});let l;const c=new Promise((e,s)=>{l=setTimeout(()=>{s(new Error(`EnerLens: history/history_during_period did not answer within ${o} ms (${t.length} entities, ${i} min) - falling back to live buffering`))},o)});let d;try{d=await Promise.race([a,c])}finally{void 0!==l&&clearTimeout(l)}if(null===d||"object"!=typeof d)return s;const h=d;for(const e of t){const t=h[e];if(!Array.isArray(t))continue;const i=[];for(const e of t){const t=fe(e);null!==t&&i.push(t)}i.sort((e,t)=>e.t-t.t),s[e]=i}return s}function _e(e){if(void 0===e||""===e.trim())return;const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(100,t)):void 0}class we{constructor(){this.known=new Map,this.asked=new Set}observe(e,t){for(const i of t){const t=i.charge;if(!t)continue;const o=e.states[t.soc],s=_e(o?.state);if(void 0!==s){const e=Date.parse(o?.last_updated||o?.last_changed||"");this.known.set(t.soc,{value:s,t:Number.isFinite(e)?e:Date.now()})}}}state(e,t){const i=_e(e.states[t.soc]?.state);if(void 0!==i)return{soc:i,stale:!1};const o=this.known.get(t.soc);return o?{soc:o.value,stale:!0,since:o.t}:{stale:!1}}missing(e,t){const i=[];for(const o of t){const t=o.charge?.soc;!t||i.includes(t)||this.asked.has(t)||this.known.has(t)||void 0===_e(e.states[t]?.state)&&i.push(t)}return i}async prefill(e,t,i=5e3){if(0===t.length)return;for(const e of t)this.asked.add(e);const o=Date.now(),s=e.callWS({type:"history/history_during_period",start_time:new Date(o-864e6).toISOString(),end_time:new Date(o).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0});let n;s.catch(()=>{});const r=new Promise((e,t)=>{n=setTimeout(()=>t(new Error("EnerLens: charge history timed out")),i)});let a;try{a=await Promise.race([s,r])}finally{void 0!==n&&clearTimeout(n)}if(null!==a&&"object"==typeof a)for(const e of t){const t=a[e];if(!Array.isArray(t))continue;let i;for(const e of t){const t="string"==typeof e.s?_e(e.s):void 0,o="number"==typeof e.lc?e.lc:e.lu;if(void 0===t||"number"!=typeof o)continue;const s=1e3*o;(!i||s>i.t)&&(i={value:t,t:s})}i&&!this.known.has(e)&&this.known.set(e,i)}}}const ye={solar:"var(--energy-solar-color, #ff9800)",house:"var(--primary-color)",grid_import:"var(--energy-grid-consumption-color, #488fc2)",grid_export:"var(--energy-grid-return-color, #8353d1)",battery_charge:"var(--energy-battery-in-color, #f06292)",battery_discharge:"var(--energy-battery-out-color, #4db6ac)",rest:"#7d7d7d"},ve=Object.freeze([{at:0,color:"#e53935"},{at:50,color:"#fdd835"},{at:100,color:"#43a047"}]),be=Object.freeze(["#7e57c2","#26a69a","#ec407a","#8d6e63","#5c6bc0","#ffca28","#66bb6a","#78909c","#ab47bc","#29b6f6"]),xe=/^#([\da-f])([\da-f])([\da-f])$/i,ke=/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,$e=/^rgba?\(([^)]*)\)$/i;function Se(e){const t=e.trim(),i=xe.exec(t);if(i){const[,e,t,o]=i;return{r:Number.parseInt(e+e,16),g:Number.parseInt(t+t,16),b:Number.parseInt(o+o,16),a:1}}const o=ke.exec(t);if(o){const[,e,t,i]=o;return{r:Number.parseInt(e,16),g:Number.parseInt(t,16),b:Number.parseInt(i,16),a:1}}const s=$e.exec(t);if(s){const e=s[1].replace(/\//g," ").split(/[\s,]+/).filter(Boolean).map(Number);return e.length<3||e.some(e=>!Number.isFinite(e))?null:{r:e[0],g:e[1],b:e[2],a:e.length>3?e[3]:1}}return null}function Ae(e,t,i){if(0===t.length)return"";const o=[...t].sort((e,t)=>e.at-t.at);if(1===o.length||!Number.isFinite(e))return o[0].color;let s=0;for(;s<o.length-2&&o[s+1].at<=e;)s++;const n=o[s],r=o[s+1],a=r.at-n.at,l=0===a?0:Math.min(1,Math.max(0,(e-n.at)/a));if(l<=0)return n.color;if(l>=1)return r.color;const c=Se(i?i(n.color):n.color),d=Se(i?i(r.color):r.color);return c&&d?function({r:e,g:t,b:i,a:o}){const s=e=>Math.min(255,Math.max(0,Math.round(e))),n=`${s(e)}, ${s(t)}, ${s(i)}`;return o>=1?`rgb(${n})`:`rgba(${n}, ${o})`}(function(e,t,i){return{r:e.r+(t.r-e.r)*i,g:e.g+(t.g-e.g)*i,b:e.b+(t.b-e.b)*i,a:e.a+(t.a-e.a)*i}}(c,d,l)):l<.5?n.color:r.color}function Me(e){const t=/^var\((--[^,)]+)/.exec(e.trim());if(!t||"undefined"==typeof getComputedStyle)return e;return getComputedStyle(document.documentElement).getPropertyValue(t[1]).trim()||e}function Ee(e,t){const i=e.trim();if(""===i)return null;const o=(t?Se(t(i)):null)??Se(i);if(o){const e=e=>Math.min(255,Math.max(0,Math.round(e))).toString(16).padStart(2,"0");return`#${e(o.r)}${e(o.g)}${e(o.b)}`}const s=function(e){const t=/^var\(\s*--[^,)]+,([\s\S]+)\)$/.exec(e.trim()),i=t?.[1].trim();return i||null}(i);return s?Ee(s,t):null}function Ce(e,t=0){const i=Se(e);if(!i)return{h:t,s:0,v:0};const o=i.r/255,s=i.g/255,n=i.b/255,r=Math.max(o,s,n),a=r-Math.min(o,s,n);let l=t;return a>0&&(l=r===o?(s-n)/a%6*60:r===s?60*((n-o)/a+2):60*((o-s)/a+4)),{h:(l+360)%360,s:0===r?0:a/r,v:r}}function ze({h:e,s:t,v:i}){const o=(e%360+360)%360,s=Math.min(1,Math.max(0,t)),n=Math.min(1,Math.max(0,i)),r=n*s,a=r*(1-Math.abs(o/60%2-1)),l=n-r,c=Math.floor(o/60)%6,[d,h,u]=[[r,a,0],[a,r,0],[0,r,a],[0,a,r],[a,0,r],[r,0,a]][c],p=e=>Math.round(255*(e+l)).toString(16).padStart(2,"0");return`#${p(d)}${p(h)}${p(u)}`}function Pe({h:e,s:t,v:i}){const o=i*(1-t/2),s=Math.min(o,1-o);return{h:e,s:0===s?0:(i-o)/s,l:o}}function We({h:e,s:t,l:i}){const o=i+t*Math.min(i,1-i);return{h:e,s:0===o?0:2*(1-i/o),v:o}}function Ne(e,t){return"direction"===e.colors.arrows?e.colors[t]:"grid_import"===t||"battery_discharge"===t?"var(--error-color, #db4437)":"var(--success-color, #43a047)"}const Fe={en:{node:{solar:"Solar",grid:"Grid",house:"House",battery:"Battery",grid_import:"Grid · import",grid_export:"Grid · export",battery_charging:"Battery · charging",battery_discharging:"Battery · discharging",derived_suffix:"· calculated",derived_alone:"calculated",partial:"without {names}",no_grid:"no grid"},list:{rest:"Other",title:"Consumers",show_all:"Show every consumer, even without power",filter_on:"Show active consumers only",charge_label:"State of charge",charge:"{label} {value}",charge_stale:"{label} {value} · as of {time}",charge_unknown:"{label} unknown"},view:{now:"Now",average:"Ø {minutes} min",off_in_period:"Averages only apply to the kW view",since:"since {time}",chip:"View: {mode}, next: {next}"},energy:{today:"Today","24h":"24 h",week:"Week","7d":"7 days",month:"Month","30d":"30 days",from:"{period} from {date}",chip:"Energy: {mode}, next: {next}",filled:"{percent} of the time filled in from neighbouring values",since:"Statistics only from {date}",none:"No statistics",rest:"Includes filled-in, later or missing consumer values",late:"Statistics only from {date}; the period counts from then",no_statistics:"Energy mode: not every main sensor (solar, grid, battery, house) has long-term statistics; the card stays with power.",fixed:"Energy: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} must be a mapping.",string:"{field} must be a non-empty text.",boolean:"{field} must be true or false.",number:"{field} must be a number.",integer:"{field} must be a whole number.",list:"{field} must be a list.",non_empty:"{field} must not be empty.",enum:"{field} must be one of: {allowed}.",min:"{field} must be at least {min}.",range:"{field} must be between {min} and {max}.",positive:"{field} must be greater than 0.",missing_entities:"{field} is missing: at least three of the four balance quantities must be configured as sensors.",mixed_form:"{field}: use either an entity id, the entity/invert form, the two-entity form or derived - not a mixture.",two_derived:"Only one balance quantity may be derived; {field} would be the second one.",soc_without_battery:"{field} has no effect without entities.battery and is ignored.",soc_stops:"{field} needs at least two stops in ascending order, the first at 0 and the last at 100.",soc_stop_entry:"{field} needs a numeric at value and a colour.",consumer_entity:"{field} has no entity and is skipped.",duplicate_consumer:"{field}: entity {entity} is listed more than once; the later entry is skipped.",solar_house:'{field}: only "excluded" (not part of the house value) is allowed; the value is ignored.',pv_scale:'{field}: "% kWp" needs kwp on every source, "100%" at least two sources; the card uses what is possible.',unknown_key:"Unknown option {field} - ignored.",order_fixed:"{first} must be less than {second} - {second} was raised to {value}.",clamped:"{field} must be between {min} and {max} - {value} is used.",grid_status_no_outage:"{field} needs an entity and at least one outage state - without them the grid status is ignored.",empty_choice:"{field}: an empty list counts as not set; the default applies.",energy_derived:"{field}: the energy mode does not work with a derived grid or battery; it stays off.",charge_no_soc:"{field} has no soc entity and is ignored.",charge_no_plugged:"{field}: show plugged needs a plugged entity - listed by power instead.",condition_incomplete:"{field} needs an entity, an operator and a value - shown by power until then.",condition_number:"{field}: {operator} compares with exactly one number - the condition is never met.",show_twice:"{field}: show and charge.show are both set - show is used, charge.show ignored.",extra_no_entity:"{field} has no entity and is ignored.",not_for_node:"{field} does not exist for this node and is ignored.",rounded:"{field}: whole numbers only - rounded to {value}.",order_used:"{field}: to keep the order, the card uses {value}.",clamped_min:"{field} must be at least {min} - {value} is used.",unknown_value:"{field}: unknown value, allowed are {allowed} - the card uses the default."}},editor:{title:"Title",entities:"Main entities",solar:"Solar power",grid:"Grid power",house:"House consumption",battery:"Battery power",battery_soc:"State of charge",consumers:"Consumers",entity:"Entity",name:"Name",color:"Colour",display:"Display",max_consumers:"Maximum consumers",min_consumer_w:"Minimum power (W)",update_interval_s:"Update interval (seconds)",rest_label:"Label for the remainder",list_enabled:"Show list",list_always_below:"List always below",ring_enabled:"Show consumer ring",ring_animation:"Consumer ring animation",ring_overtake:"Overtake",ring_fade:"Cross-fade colours",ring_jump:"Jump",view:"View",mode_current:"Current",mode_short:"Short average",mode_long:"Long average",avg_short_minutes:"Short window (minutes)",avg_long_minutes:"Long window (minutes)",energy_periods:"Available values",energy_today:"Today",energy_24h:"24 h",energy_week:"Week",energy_7d:"7 days",energy_month:"Month",energy_30d:"30 days",flow:"Flows",inactive_lines:"Lines without flow",lines_show:"Show",lines_dim:"Dim",lines_hide:"Hide",animation:"Motion",anim_auto:"Follow system setting",anim_on:"Always",anim_off:"Off",design:"Look of the dots",design_none:"Plain dots",dot_size:"Dot size",line_width:"Line width",invert:"Flip sign",source_entity:"One entity",source_split_grid:"Two entities (import / export)",source_split_battery:"Two entities (discharge / charge)",source_derived:"Derived from the other quantities",source_none:"No battery",grid_import:"Import",grid_export:"Export",battery_discharge:"Discharge",battery_charge:"Charge",colors:"Colours",icons:"Icons",color_solar:"Solar",color_house:"House",color_grid_import:"Grid · import",color_grid_export:"Grid · export",color_battery_charge:"Battery · charging",color_battery_discharge:"Battery · discharging",color_rest:"Remainder",color_reset:"Reset to default",color_default:"Default",color_css:"CSS",color_pick:"Pick a colour",color_hue:"Hue",color_sv:"Saturation and brightness",color_hex:"Hex value",color_mode:"Notation",color_used:"Used in this card",colors_consumers:"Consumers",colors_soc:"State of charge",yaml_only:"Only editable in YAML - the values there are not in a form this editor can show.",color_at:"At percent",color_remove:"Remove stop",color_add_stop:"Add stop",min_w:"Minimum power (W)",icon:"Icon",peak_w:"System peak power (W)",flow_fine:"Fine-tune the motion",slow_below_w:"Speed up from (W)",more_dots_above_w:"More dots from (W)",max_dots_at_w:"All dots from (W)",max_dots:"Maximum dots",slow_s:"Resting pace (seconds per lap)",fast_s:"Full speed (seconds per lap)",full_speed_w:"Full speed from (W)",power_unit:"Show power in",power_kw:"Kilowatts (kW)",power_w:"Watts (W), whole numbers",power_decimals:"Decimals (kW)",grid_status_section:"Grid outage (optional)",grid_status:"Grid status entity",grid_status_outage:"States that mean: no grid",grid_status_ok:"States that mean: grid is there",layout:"Arrangement",layout_cross:"Cross",layout_square_right:"Square · solar right",layout_square_left:"Square · solar left",layout_triangle:"Triangle · house centre",layout_triangle_battery:"Triangle · battery centre",flow_lines:"Line form",lines_curved:"Curved",lines_straight:"Straight",appearance:"Card appearance",appearance_auto:"Follow the theme",appearance_light:"Light",appearance_dark:"Dark",rest:"Remainder",dot_color:"Colour of the dots",colors_dots:"Dots",dot_color_follow:"Dots in the colour of their line",colors_arrows:"Arrows",arrow_colors_red_green:"Arrows red/green: import and discharge red, export and charge green (otherwise in their direction's colour) - in energy mode and the detail window",power_auto:"Automatic",power_digits:"Significant digits",consumer_add:"Add consumer",consumer_new:"New consumer",consumer_remove:"Remove consumer",charge:"State of charge",consumer_soc:"State of charge entity (%)",consumer_label:"Label",consumer_show:"Show in the list",consumer_up:"Move up",consumer_down:"Move down",nodes:"Main entities: labels & extra values",node_show_name:"Show name",node_show_state:"Show state word",node_inside_entity:"Extra value in the circle",node_inside_position:"Position in the circle",node_inside_decimals:"Digits",node_inside_size:"Size",node_inside_weight:"Font weight",node_label_entity:"Extra value with the label",node_label_prefix:"Prefix",node_label_decimals:"Digits",node_label_size:"Size",node_label_weight:"Font weight",position_above:"above the icon",position_below:"below the value",decimals_ha:"As in Home Assistant",decimals_0:"0 decimals",decimals_1:"1 decimal",decimals_2:"2 decimals",decimals_3:"3 decimals",decimals_sig2:"2 significant digits",decimals_sig3:"3 significant digits",decimals_sig4:"4 significant digits",weight_normal:"normal",weight_medium:"medium",weight_bold:"bold",colors_extras:"Extra values",color_extra_inside:"{node} · in the circle",color_extra_label:"{node} · with the label",colors_hint:"Colours are set further down, in the group “Colours”.",group_smoothing:"Smoothing",group_energy:"Power/energy",group_scope:"List scope",modes:"Available values",scope:"Available values",energy_power:"Power",scope_filtered:"Filtered",scope_full:"Complete",quick_buttons:"Quick buttons",note_min:"At least {min}.",note_max:"At most {max}.",note_integer:"Whole numbers only.",note_order:"The order is wrong.",note_order_avg_short_minutes:"The short window must be shorter than the long one.",note_order_avg_long_minutes:"The long window must be longer than the short one.",note_order_fast_s:"The fast cycle must be shorter than the slow one.",note_order_slow_s:"The slow cycle must be longer than the fast one.",note_order_min_w:"Must lie below the thresholds for the dots.",note_order_slow_below_w:"The thresholds must grow from top to bottom.",note_order_more_dots_above_w:"The thresholds must grow from top to bottom.",note_order_max_dots_at_w:"The thresholds must grow from top to bottom.",note_order_full_speed_w:"Must be above the threshold for slow dots.",source_sources:"Several sources (one per inverter)",solar_sources:"PV sources",source_add:"Add source",source_remove:"Remove source",pv_source_entity:"Entity",pv_source_name:"Name",pv_source_kwp:"Peak power (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Not part of the house value",list_solar:"PV rows in the list",ring_solar:"Show PV ring",group_pv_scale:"PV scale",pv_scales:"Values offered",pv_scale_share:"100%",pv_scale_peak:"% kWp",group_quick_style:"All quick buttons",quick_style:"Style",quick_style_segment:"Segment buttons",quick_style_segment_compact:"Segment buttons, compact",quick_style_single:"Single buttons",expanded_modes:"Expand",expanded_energy_periods:"Expand",expanded_pv_scales:"Expand",expanded_scope:"Expand",consumer_position:"Position in the list",position_sorted:"By power",position_top:"Top",position_bottom:"Bottom",show_power:"By power (default)",show_always:"Always",show_condition:"Condition",condition_entity:"Sensor",condition_operator:"Operator",condition_values:"Value(s)",condition_number:"Value",consumer_display:"Display"},editor_help:{min_consumer_w:"Consumers below this power are hidden and counted towards the remainder. Default: 10 W.",max_consumers:"Only the strongest consumers are listed; the rest are counted together. Empty = all (default).",update_interval_s:"How often the list reorders. The figures themselves update immediately. Default: 5 seconds.",rest_label:'Name for the part that is not measured individually. Default: "Other".',design:"How the travelling dots look. “Plain dots” is a circle and nothing else; the others give it a lighter core and, depending on the design, a glow. Speed and the number of dots follow the power, not the design. Default: plain dots.",dot_size:"100 % is the size of the dots on a card with large nodes. Smaller cards - the list beside the drawing, a phone - take somewhat smaller dots on their own. Default: 100 %.",line_width:"100 % is 3 px for the connections and 2 px for the lines to the list on a card with large nodes. Smaller cards take somewhat thinner lines on their own. Default: 100 %.",avg_short_minutes:"Window for the short average. Default: 2.",avg_long_minutes:"Window for the long average. Default: 15.",energy_periods:"What the quick button offers: power, and energy over a period worked out from the statistics of the power sensors. Several ticked: each tap steps on. One ticked: fixed, no button. Default: power, today, 24 h, week – but only when solar, grid, battery and house have statistics, otherwise power alone. Grid and battery with two sensors show both directions; with one signed sensor the grid shows its balance and the battery no figure.",energy_periods_locked:"Not available with a derived grid or battery.",inactive_lines:'Connections with nothing flowing on them. "Hide" calms the picture at night. Default: show.',animation:'"Follow system setting" respects the device\'s reduce-motion preference - that lives in the operating system, not in Home Assistant. Default: follow system setting.',ring_animation:"How the consumer ring follows a reordered list. “Overtake”: every segment travels to its new place, one moving forward passes on an inner lane. “Cross-fade colours”: the places stay, their colours blend into the new order. “Jump”: no motion, new values show at once. With Motion off the ring always jumps. Default: overtake.",battery_soc:"State of charge in percent. Never averaged.",color:"Any CSS value, e.g. #7e57c2 or var(--primary-color). Empty = automatic.",solar:"Positive = production. If the sensor reports production as negative, flip the sign.",grid:"Positive = import from the grid, negative = export. If your sensor has it the other way round, flip the sign.",house:'Total consumption of the house. Without a sensor of its own, choose "Derived".',battery:"Positive = discharging, negative = charging (Home Assistant's convention). If your sensor has it the other way round, flip the sign.",grid_import:"Import only, as a magnitude ≥ 0.",grid_export:"Export only, as a magnitude ≥ 0.",battery_discharge:"Discharging only, as a magnitude ≥ 0.",battery_charge:"Charging from all sources, as a magnitude ≥ 0.",derived:"Calculated from the other three quantities so the balance adds up. Only one quantity can be derived.",min_w:"From this power on a connection counts as active: dots move, grid and battery show their state. Below it everything is neutral. Default: 10 W.",icon_battery:"Empty = icon follows the state of charge.",peak_w:"One value for the whole motion: at this power the most dots run at their fastest. The three thresholds below derive from it (1/12, 1/3, 1/1) while they are empty. Default 6000 W.",flow_fine:"Only needed when the peak power alone does not do. A set value overrides the one derived from the peak. If the order is wrong, the card raises the second value and says so in the browser console.",slow_below_w:"Below this a single dot runs at resting pace. From here on it gets faster. Default: peak / 12.",more_dots_above_w:"From here on more dots join, independent of the speed. Default: peak / 3.",max_dots_at_w:"From here on as many dots as allowed. In between: more and more dots. Default: peak.",slow_s:"One lap when little is flowing. Default 5.",fast_s:"One lap when a lot is flowing. Default 1.8.",max_dots:"How many dots a connection carries at most. Default 5.",full_speed_w:"From here on the dot runs as fast as it gets. In between: one dot, getting faster. Default: same as “More dots from”.",power_unit:"Kilowatts, watts or automatic. “Automatic” picks per value: whole watts below 1000 W, kilowatts above - otherwise a 30 W consumer reads as “0.0 kW”. Default: kilowatts.",power_decimals:"Kilowatts only; watts are always whole numbers. Default 2.",grid_status:"Only if your installation reports an outage - many do not. Without it the card shows no outage; everything else works.",grid_status_outage:"Required. Every integration names its states differently, so nothing is guessed here. Enter the raw state, not the label Home Assistant shows: an enum sensor displays a translated name, so “Not detected” may really be `not_detected`. Picking from the list avoids the question.",grid_status_ok:"Optional. Left empty, the entity's own options minus the outage states count as \\u201cgrid is there\\u201d; anything else, including unavailable, leaves the last state standing.",layout:"Where the four nodes stand. With Square · solar left the PV rows stand left of the drawing and the consumers right of it; on a card too narrow for that, both lists go below. Default: Cross.",flow_lines:"How the connections between the nodes run. Default: curved for the cross, straight for the other arrangements.",appearance:"Shows this one card light or dark – whatever the theme says, and without touching the rest of the dashboard. It also settles which of its two value sets a flow design takes. “Follow the theme” reads the ground, which works nearly always – but not for themes that paint no card background of their own. Light and dark use Home Assistant's default colours, not those of a custom theme.",icon_rest:"Empty = a plain dot.",dot_color:"Empty = each dot carries the colour of its flow, which is what shows where the energy comes from. A colour here applies to every dot on the card; the lines keep theirs.",power_digits:"How much the number says, not how many places follow the point. With 3: 1.23 kW · 12.3 kW · 123 kW. A decimal place means something different at 1.23 kW than at 123 kW; this keeps what the figure tells constant. Watts are always whole. Default: 3.",consumers_list:"Unfold to edit, drag by the handle to sort. The colour is under “Colours”.",consumer_min_w:"Overrides the global minimum power - say 50 W for a heat pump, so its standby does not count as a consumer.",consumer_soc:"For a wallbox, the car’s state of charge from the car’s own integration. Shown as a ring around the icon; while nothing charges it stands in the row instead of the power.",consumer_label:"An own name instead of “State of charge”, when the value is something else in percent. Shown in the tooltip and the detail window. Empty: state of charge.",consumer_show:"From its minimum power a consumer is always listed. 'Always' or a condition keep it there as well, even at 0 W - a wallbox while the car is plugged in, say. Held rows count towards the maximum number of consumers.",node_show_state:"Without the state word only the colour tells export from import, charging from discharging.",node_inside_entity:"Any entity. The circle only has room for a number and its unit. Always shows the current state, also in the average views.",node_label_entity:"Any entity, right next to the circle. Always shows the current state, also in the average views.",node_label_prefix:'Free text in front of the value, e.g. "Self-sufficiency".',node_inside_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_label_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_inside_size:"In percent of the node value.",node_label_size:"In percent of the label (12 px).",node_inside_position:"Above the icon the value sits where the battery shows its charge, and tapping it opens its own history. Below the value, tapping opens the node's entity.",modes:"What the quick button offers: now, the short and the long average. Several ticked: each tap steps on. One ticked: fixed, no button. Default: all three.",modes_locked:"Averages exist for power only. Tick “Power” under “Quick button power/energy” to set the smoothing. Until then the card always shows the current reading.",scope:"What the quick button offers: the filtered consumer list or every consumer. Several ticked: each tap switches. One ticked: fixed, no button. Default: both.",list_enabled:"Default: on when consumers are set.",ring_enabled:"Ring of the consumers at the house. Default: on when consumers are set.",list_always_below:"Keeps the list under the drawing even when there is room beside it. Default: off.",quick_buttons:"The buttons in the card's header. For each, what it offers: several values – each tap steps on; one value – fixed, no button.",solar_sources:"Every inverter or string with a sensor of its own; the PV is their sum. A source's colour can be set in YAML (color), otherwise orange tones.",pv_source_kwp:'Needed on every source for the "% kWp" scale. Default: none.',pv_source_excluded:"For sources feeding in past the inverter (balcony plant): their power is added to the measured house value. Default: off.",list_solar:"Shows each source as a row above the consumers, with a fan of its own. Default: off.",ring_solar:"Ring of the sources at the PV node. Default: on.",pv_scales:'What the quick button offers: "100%" - the ring shows each source\'s share and is always full; "% kWp" - the power relative to peak power. Several ticked: each tap switches. One ticked: fixed, no button. Default: both, as far as possible.',pv_scale_peak_locked:'"% kWp" needs the peak power (kWp) of every source. Enter it under "PV sources" to choose this scale.',pv_scale_share_locked:'"100%" needs at least two sources - with one the ring would always be full.',quick_style:'How the quick buttons look. "Segment buttons, compact" also makes the cycling buttons flatter; "Single buttons" shows with expanded quick buttons. Default: segment buttons.',expanded_modes:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_energy_periods:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_pv_scales:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_scope:"Filtered and Complete as two buttons instead of one filter button. Default: off.",consumer_position:"At the top or bottom the row stays put, several in the order of this list (drag to sort). The position does not decide which rows appear.",condition_values:"One or more states; = means 'is one of them', ≠ 'is none of them'. Numbers are compared as numbers.",condition_number:"One number, in the sensor's unit.",consumers_held_limit:"{held} consumers are shown always or by a condition, the maximum is {limit}. No other consumer appears then."},outage:{banner:"Island mode — no grid",label:"Grid status"},example:{banner:"Example values — pick your sensors in the editor"},pv_scale:{share:"100%",peak:"% kWp",share_title:"PV: share of each source, the ring is always full",peak_title:"PV: power relative to peak power",peak_period_title:"PV: mean power over the period relative to peak power",chip:"PV scale: {mode}, next: {next}"},detail:{import:"Import",export:"Export",discharge:"Discharge",charge:"Charge",soc:"State of charge",periods:"Period",open:"{name}: open history","48h":"48 h",mean:"Five-minute mean",aggregation:"5-minute mean · band: lowest to highest reading"}},de:{node:{solar:"PV",grid:"Netz",house:"Haus",battery:"Batterie",grid_import:"Netz · Bezug",grid_export:"Netz · Einspeisung",battery_charging:"Batterie · lädt",battery_discharging:"Batterie · entlädt",derived_suffix:"· berechnet",derived_alone:"berechnet",partial:"ohne {names}",no_grid:"kein Netz"},list:{rest:"Rest",title:"Verbraucher",show_all:"Alle Verbraucher anzeigen, auch ohne Leistung",filter_on:"Nur aktive Verbraucher anzeigen",charge_label:"Ladestand",charge:"{label} {value}",charge_stale:"{label} {value} · Stand {time}",charge_unknown:"{label} unbekannt"},view:{now:"Jetzt",average:"Ø {minutes} min",off_in_period:"Mittelwerte gibt es nur in der kW-Ansicht",since:"seit {time}",chip:"Ansicht: {mode}, weiter zu {next}"},energy:{today:"Heute","24h":"24 h",week:"Woche","7d":"7 Tage",month:"Monat","30d":"30 Tage",from:"{period} ab {date}",chip:"Energie: {mode}, weiter zu {next}",filled:"{percent} der Zeit aus Nachbarwerten ergänzt",since:"Statistik erst ab {date}",none:"Keine Statistik",rest:"Enthält ergänzte, spätere oder fehlende Verbraucherwerte",late:"Statistik erst ab {date}, der Zeitraum zählt ab dann",no_statistics:"Energie-Modus: Nicht alle Hauptsensoren (PV, Netz, Batterie, Haus) haben eine Langzeitstatistik; die Karte bleibt bei der Leistung.",fixed:"Energie: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} muss ein Objekt sein.",string:"{field} muss ein nicht leerer Text sein.",boolean:"{field} muss true oder false sein.",number:"{field} muss eine Zahl sein.",integer:"{field} muss eine ganze Zahl sein.",list:"{field} muss eine Liste sein.",non_empty:"{field} darf nicht leer sein.",enum:"{field} muss einer dieser Werte sein: {allowed}.",min:"{field} muss mindestens {min} sein.",range:"{field} muss zwischen {min} und {max} liegen.",positive:"{field} muss größer als 0 sein.",missing_entities:"{field} fehlt: mindestens drei der vier Bilanzgrößen müssen als Sensor angegeben sein.",mixed_form:"{field}: entweder Entitäts-ID, die entity/invert-Form, die Zwei-Entitäten-Form oder derived - keine Mischform.",two_derived:"Nur eine Bilanzgröße darf abgeleitet werden; {field} wäre die zweite.",soc_without_battery:"{field} ist ohne entities.battery wirkungslos und wird ignoriert.",soc_stops:"{field} braucht mindestens zwei Stützstellen in aufsteigender Reihenfolge, die erste bei 0, die letzte bei 100.",soc_stop_entry:"{field} braucht einen numerischen at-Wert und eine Farbe.",consumer_entity:"{field} hat keine entity und wird übersprungen.",duplicate_consumer:"{field}: die Entität {entity} ist mehrfach angegeben; der weitere Eintrag wird übersprungen.",solar_house:"{field}: erlaubt ist nur „excluded“ (nicht im Hauswert enthalten); der Wert wird ignoriert.",pv_scale:"{field}: „% kWp“ braucht kWp an jeder Quelle, „100 %“ mindestens zwei Quellen; die Karte nimmt, was möglich ist.",unknown_key:"Unbekannte Option {field} - wird ignoriert.",order_fixed:"{first} muss kleiner als {second} sein — {second} wurde auf {value} angehoben.",clamped:"{field} muss zwischen {min} und {max} liegen — es wird {value} verwendet.",grid_status_no_outage:"{field} braucht eine Entität und mindestens einen Ausfall-Zustand — ohne beides wird der Netzstatus ignoriert.",empty_choice:"{field}: Eine leere Liste gilt als nicht gesetzt; es gilt der Standard.",energy_derived:"{field}: Der Energie-Modus geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie; er bleibt aus.",charge_no_soc:"{field} hat keine soc-Entität und wird ignoriert.",charge_no_plugged:"{field}: show plugged braucht eine plugged-Entität - stattdessen nach Leistung.",condition_incomplete:"{field} braucht Entität, Operator und Wert - bis dahin wie nach Leistung.",condition_number:"{field}: {operator} vergleicht mit genau einer Zahl - die Bedingung ist nie erfüllt.",show_twice:"{field}: show und charge.show sind beide gesetzt - show gilt, charge.show wird ignoriert.",extra_no_entity:"{field} hat keine entity und wird ignoriert.",not_for_node:"{field} gibt es bei diesem Knoten nicht und wird ignoriert.",rounded:"{field}: nur ganze Zahlen – gerundet auf {value}.",order_used:"{field}: Wegen der Reihenfolge rechnet die Karte mit {value}.",clamped_min:"{field} muss mindestens {min} sein – verwendet wird {value}.",unknown_value:"{field}: unbekannter Wert, erlaubt sind {allowed} – die Karte nimmt den Standard."}},editor:{title:"Titel",entities:"Basis-Entitäten",solar:"PV-Leistung",grid:"Netzleistung",house:"Hausverbrauch",battery:"Batterieleistung",battery_soc:"Ladezustand",consumers:"Verbraucher",entity:"Entität",name:"Name",color:"Farbe",display:"Darstellung",max_consumers:"Höchstzahl Verbraucher",min_consumer_w:"Mindestleistung (W)",update_interval_s:"Takt (Sekunden)",rest_label:"Bezeichnung für den Rest",list_enabled:"Liste anzeigen",list_always_below:"Liste immer unten",ring_enabled:"Verbraucher-Ring anzeigen",ring_animation:"Animation des Verbraucher-Rings",ring_overtake:"Überholen",ring_fade:"Farben überblenden",ring_jump:"Springen",view:"Ansicht",mode_current:"Aktuell",mode_short:"Kurzer Mittelwert",mode_long:"Langer Mittelwert",avg_short_minutes:"Kurzes Fenster (Minuten)",avg_long_minutes:"Langes Fenster (Minuten)",energy_periods:"Verfügbare Werte",energy_today:"Heute",energy_24h:"24 h",energy_week:"Woche",energy_7d:"7 Tage",energy_month:"Monat",energy_30d:"30 Tage",flow:"Flüsse",inactive_lines:"Linien ohne Fluss",lines_show:"Anzeigen",lines_dim:"Abschwächen",lines_hide:"Ausblenden",animation:"Bewegung",anim_auto:"Systemeinstellung folgen",anim_on:"Immer",anim_off:"Aus",design:"Aussehen der Punkte",design_none:"Einfache Punkte",dot_size:"Punktgröße",line_width:"Liniendicke",invert:"Vorzeichen umdrehen",source_entity:"Eine Entität",source_split_grid:"Zwei Entitäten (Bezug / Einspeisung)",source_split_battery:"Zwei Entitäten (Entladen / Laden)",source_derived:"Abgeleitet aus den anderen Größen",source_none:"Keine Batterie",grid_import:"Bezug",grid_export:"Einspeisung",battery_discharge:"Entladen",battery_charge:"Laden",colors:"Farben",icons:"Icons",color_solar:"PV",color_house:"Haus",color_grid_import:"Netz · Bezug",color_grid_export:"Netz · Einspeisung",color_battery_charge:"Batterie · lädt",color_battery_discharge:"Batterie · entlädt",color_rest:"Rest",color_reset:"Auf Standard zurücksetzen",color_default:"Standard",color_css:"CSS",color_pick:"Farbe wählen",color_hue:"Farbton",color_sv:"Sättigung und Helligkeit",color_hex:"Hex-Wert",color_mode:"Schreibweise",color_used:"In dieser Karte verwendet",colors_consumers:"Verbraucher",colors_soc:"Ladestand",yaml_only:"Nur im YAML bearbeitbar – die Werte dort haben eine Form, die dieser Editor nicht anzeigen kann.",color_at:"Bei Prozent",color_remove:"Stufe entfernen",color_add_stop:"Stufe hinzufügen",min_w:"Mindestleistung (W)",icon:"Icon",peak_w:"Höchstleistung der Anlage (W)",flow_fine:"Feineinstellung der Bewegung",slow_below_w:"Beschleunigung ab (W)",more_dots_above_w:"Mehr Punkte ab (W)",max_dots_at_w:"Alle Punkte ab (W)",max_dots:"Höchstzahl Punkte",slow_s:"Ruhe-Tempo (Sekunden pro Runde)",fast_s:"Höchsttempo (Sekunden pro Runde)",full_speed_w:"Höchsttempo ab (W)",power_unit:"Leistung anzeigen in",power_kw:"Kilowatt (kW)",power_w:"Watt (W), ganze Zahlen",power_decimals:"Nachkommastellen (kW)",grid_status_section:"Netzausfall (optional)",grid_status:"Entität für den Netzstatus",grid_status_outage:"Zustände, die „kein Netz“ bedeuten",grid_status_ok:"Zustände, die „Netz liegt an“ bedeuten",layout:"Anordnung",layout_cross:"Kreuz",layout_square_right:"Quadrat · PV rechts",layout_square_left:"Quadrat · PV links",layout_triangle:"Dreieck · Haus Mitte",layout_triangle_battery:"Dreieck · Batterie Mitte",flow_lines:"Linienform",lines_curved:"Geschwungen",lines_straight:"Gerade",appearance:"Erscheinungsbild der Karte",appearance_auto:"Wie das Theme",appearance_light:"Hell",appearance_dark:"Dunkel",rest:"Rest",dot_color:"Farbe der Punkte",colors_dots:"Punkte",dot_color_follow:"Punkte in der Farbe ihrer Linie",colors_arrows:"Pfeile",arrow_colors_red_green:"Pfeile rot/grün: Bezug und Entladen rot, Einspeisung und Laden grün (sonst in der Farbe ihrer Richtung) – im Energie-Modus und im Detailfenster",power_auto:"Automatisch",power_digits:"Relevante Stellen",consumer_add:"Verbraucher hinzufügen",consumer_new:"Neuer Verbraucher",consumer_remove:"Verbraucher entfernen",charge:"Ladestand",consumer_soc:"Ladestand-Entität (%)",consumer_label:"Bezeichnung",consumer_show:"In der Liste zeigen",consumer_up:"Nach oben",consumer_down:"Nach unten",nodes:"Basis-Entitäten: Beschriftung & Zusatzwerte",node_show_name:"Name anzeigen",node_show_state:"Zustandswort anzeigen",node_inside_entity:"Zusatzwert im Kreis",node_inside_position:"Lage im Kreis",node_inside_decimals:"Stellen",node_inside_size:"Größe",node_inside_weight:"Schriftstärke",node_label_entity:"Zusatzwert beim Text",node_label_prefix:"Vorsatz",node_label_decimals:"Stellen",node_label_size:"Größe",node_label_weight:"Schriftstärke",position_above:"über dem Icon",position_below:"unter dem Wert",decimals_ha:"Wie in Home Assistant",decimals_0:"0 Nachkommastellen",decimals_1:"1 Nachkommastelle",decimals_2:"2 Nachkommastellen",decimals_3:"3 Nachkommastellen",decimals_sig2:"2 signifikante Stellen",decimals_sig3:"3 signifikante Stellen",decimals_sig4:"4 signifikante Stellen",weight_normal:"normal",weight_medium:"mittel",weight_bold:"fett",colors_extras:"Zusatzwerte",color_extra_inside:"{node} · im Kreis",color_extra_label:"{node} · beim Text",colors_hint:"Die Farben stellst du weiter unten in der Gruppe „Farben“ ein.",group_smoothing:"Glättung",group_energy:"Leistung/Energie",group_scope:"Listenumfang",modes:"Verfügbare Werte",scope:"Verfügbare Werte",energy_power:"Leistung",scope_filtered:"Gefiltert",scope_full:"Vollständig",quick_buttons:"Quick-Buttons",note_min:"Mindestens {min}.",note_max:"Höchstens {max}.",note_integer:"Nur ganze Zahlen.",note_order:"Die Reihenfolge stimmt nicht.",note_order_avg_short_minutes:"Das kurze Fenster muss kürzer sein als das lange.",note_order_avg_long_minutes:"Das lange Fenster muss länger sein als das kurze.",note_order_fast_s:"Die schnelle Umlaufzeit muss kürzer sein als die langsame.",note_order_slow_s:"Die langsame Umlaufzeit muss länger sein als die schnelle.",note_order_min_w:"Muss unter den Schwellen für die Punkte liegen.",note_order_slow_below_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_more_dots_above_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_max_dots_at_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_full_speed_w:"Muss größer sein als die Schwelle für langsame Punkte.",source_sources:"Mehrere Quellen (je Wechselrichter)",solar_sources:"PV-Quellen",source_add:"Quelle hinzufügen",source_remove:"Quelle entfernen",pv_source_entity:"Entität",pv_source_name:"Name",pv_source_kwp:"Spitzenleistung (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Nicht im Hauswert enthalten",list_solar:"PV-Zeilen in der Liste",ring_solar:"PV-Ring anzeigen",group_pv_scale:"PV-Skala",pv_scales:"Verfügbare Werte",pv_scale_share:"100 %",pv_scale_peak:"% kWp",group_quick_style:"Alle Quick-Buttons",quick_style:"Darstellung",quick_style_segment:"Segment-Buttons",quick_style_segment_compact:"Segment-Buttons kompakt",quick_style_single:"Einzel-Buttons",expanded_modes:"Aufklappen",expanded_energy_periods:"Aufklappen",expanded_pv_scales:"Aufklappen",expanded_scope:"Aufklappen",consumer_position:"Position in der Liste",position_sorted:"Nach Leistung",position_top:"Oben",position_bottom:"Unten",show_power:"Nach Leistung (Standard)",show_always:"Immer",show_condition:"Bedingung",condition_entity:"Sensor",condition_operator:"Operator",condition_values:"Wert(e)",condition_number:"Wert",consumer_display:"Darstellung"},editor_help:{min_consumer_w:"Verbraucher unterhalb dieser Leistung werden ausgeblendet und zählen zum Rest. Standard: 10 W.",max_consumers:"Nur die stärksten Verbraucher erscheinen; alle weiteren zählen zum Rest. Leer = alle (Standard).",update_interval_s:"Wie oft die Liste neu sortiert wird. Die Werte selbst ändern sich sofort. Standard: 5 Sekunden.",rest_label:"Name für den nicht einzeln gemessenen Anteil. Standard: „Rest“.",design:"Wie die laufenden Punkte aussehen. „Einfache Punkte“ ist ein Kreis ohne alles; die übrigen geben ihm einen hellen Kern und je nach Design ein Glühen. Tempo und Anzahl der Punkte hängen an der Leistung, nicht am Design. Standard: Einfache Punkte.",dot_size:"100 % ist die Größe der Punkte auf einer Karte mit großen Knoten. Kleinere Karten – Liste neben der Zeichnung, Handy – nehmen von sich aus etwas kleinere Punkte. Standard: 100 %.",line_width:"100 % sind 3 px für die Verbindungen und 2 px für die Linien zur Liste, auf einer Karte mit großen Knoten. Kleinere Karten nehmen von sich aus etwas dünnere Linien. Standard: 100 %.",avg_short_minutes:"Zeitraum für den kurzen Mittelwert. Standard: 2.",avg_long_minutes:"Zeitraum für den langen Mittelwert. Standard: 15.",energy_periods:"Was der Quick-Button anbietet: die Leistung und Energie über einen Zeitraum, berechnet aus der Statistik der Leistungssensoren. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: Leistung, Heute, 24 h, Woche – aber nur, wenn PV, Netz, Batterie und Haus eine Statistik haben, sonst nur Leistung. Netz und Batterie mit zwei Sensoren zeigen beide Richtungen; mit einem Sensor mit Vorzeichen zeigt das Netz den Saldo, die Batterie keine Zahl.",energy_periods_locked:"Geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie.",inactive_lines:"Verbindungen, auf denen gerade nichts fließt. „Ausblenden“ beruhigt das Bild nachts. Standard: Anzeigen.",animation:"„Systemeinstellung folgen“ richtet sich nach „Bewegung reduzieren“ des Geräts — das steht im Betriebssystem, nicht in Home Assistant. Standard: Systemeinstellung folgen.",ring_animation:"Wie der Verbraucher-Ring einer umsortierten Liste folgt. „Überholen“: Jedes Segment wandert an seinen neuen Platz, wer nach vorn rückt, überholt auf einer inneren Bahn. „Farben überblenden“: Die Plätze bleiben, ihre Farben blenden in die neue Reihenfolge über. „Springen“: keine Bewegung, neue Werte sind sofort da. Bei Bewegung „Aus“ springt der Ring immer. Standard: Überholen.",battery_soc:"Ladezustand in Prozent. Wird nie gemittelt.",color:"Beliebiger CSS-Wert, z. B. #7e57c2 oder var(--primary-color). Leer = automatisch.",solar:"Positive Werte = Erzeugung. Meldet der Sensor die Erzeugung negativ, Vorzeichen umdrehen.",grid:"Positiv = Bezug aus dem Netz, negativ = Einspeisung. Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",house:"Gesamtverbrauch des Hauses. Ohne eigenen Sensor „Abgeleitet“ wählen.",battery:"Positiv = Entladen, negativ = Laden (Konvention von Home Assistant). Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",grid_import:"Nur der Bezug, als Betrag ≥ 0.",grid_export:"Nur die Einspeisung, als Betrag ≥ 0.",battery_discharge:"Nur das Entladen, als Betrag ≥ 0.",battery_charge:"Nur das Laden aus allen Quellen, als Betrag ≥ 0.",derived:"Wird aus den drei anderen Größen berechnet, damit die Bilanz aufgeht. Nur eine Größe kann abgeleitet sein.",min_w:"Ab dieser Leistung gilt eine Verbindung als aktiv: Punkte laufen, Netz und Batterie zeigen ihren Zustand. Darunter ist alles neutral. Standard: 10 W.",icon_battery:"Leer = Icon folgt dem Ladezustand.",peak_w:"Ein Wert für die ganze Bewegung: Bei dieser Leistung laufen die meisten Punkte am schnellsten. Die drei Schwellen der Feineinstellung ergeben sich daraus (1/12, 1/3, 1/1), solange sie leer sind. Standard 6000 W.",flow_fine:"Nur nötig, wenn die Höchstleistung allein nicht reicht. Ein gesetzter Wert hat Vorrang vor der Ableitung aus der Höchstleistung. Stimmt die Reihenfolge nicht, hebt die Karte den zweiten Wert an und meldet es in der Browser-Konsole.",slow_below_w:"Darunter läuft ein einzelner Punkt im Ruhe-Tempo. Ab hier wird er schneller. Standard: Höchstleistung / 12.",more_dots_above_w:"Ab hier kommen weitere Punkte dazu, unabhängig vom Tempo. Standard: Höchstleistung / 3.",max_dots_at_w:"Ab hier laufen so viele Punkte wie erlaubt. Dazwischen: immer mehr Punkte. Standard: Höchstleistung.",slow_s:"Zeit für eine Runde, wenn wenig fließt. Standard 5.",fast_s:"Zeit für eine Runde, wenn viel fließt. Standard 1,8.",max_dots:"Wie viele Punkte auf einer Verbindung höchstens laufen. Standard 5.",full_speed_w:"Ab hier läuft der Punkt so schnell wie möglich. Dazwischen: ein Punkt, der schneller wird. Standard: wie „Mehr Punkte ab“.",power_unit:"Kilowatt, Watt oder automatisch. „Automatisch“ wählt je Wert: unter 1000 W ganze Watt, darüber Kilowatt — sonst steht ein Verbraucher mit 30 W als „0,0 kW“ da. Standard: Kilowatt.",power_decimals:"Nur bei Kilowatt; Watt werden immer als ganze Zahl gezeigt. Standard 2.",grid_status:"Nur wenn deine Anlage einen Netzausfall meldet — viele tun es nicht. Ohne diese Angabe zeigt die Karte keinen Ausfall an; alles andere funktioniert.",grid_status_outage:"Pflichtangabe. Jede Integration benennt ihre Zustände anders, hier wird nichts geraten. Trage den Rohwert ein, nicht die Anzeige von Home Assistant: Ein Aufzählungssensor zeigt einen übersetzten Namen, aus „Nicht erkannt“ wird also `not_detected`. Wer aus der Liste auswählt, umgeht die Frage.",grid_status_ok:"Optional. Leer gelassen gelten die eigenen Optionen der Entität ohne die Ausfall-Zustände als „Netz liegt an“; alles andere, auch unavailable, lässt den letzten Zustand stehen.",layout:"Wo die vier Knoten stehen. Beim Quadrat · PV links stehen die PV-Zeilen links der Zeichnung, die Verbraucher rechts; ist die Karte dafür zu schmal, stehen beide Listen darunter. Standard: Kreuz.",flow_lines:"Wie die Verbindungen zwischen den Knoten laufen. Standard: geschwungen beim Kreuz, gerade bei den anderen Anordnungen.",appearance:"Zeigt diese eine Karte hell oder dunkel – unabhängig vom Theme und ohne den Rest des Dashboards zu verändern. Es legt zugleich fest, welchen der beiden Wertesätze ein Fluss-Design nimmt. „Wie das Theme“ liest den Untergrund aus; das klappt fast immer, aber nicht bei Themes ohne eigenen Kartenhintergrund. Hell und Dunkel verwenden die Standardfarben von Home Assistant, nicht die eines eigenen Themes.",icon_rest:"Leer = ein schlichter Punkt.",dot_color:"Leer = jeder Punkt hat die Farbe seines Flusses und zeigt damit, woher die Energie kommt. Eine Farbe hier gilt für alle Punkte der Karte; die Linien behalten ihre.",power_digits:"Wie viele Ziffern die Zahl aussagt — nicht wie viele hinter dem Komma stehen. Mit 3: 1,23 kW · 12,3 kW · 123 kW. Eine Nachkommastelle bedeutet bei 1,23 kW etwas anderes als bei 123 kW; die Aussagekraft bleibt so gleich. Watt sind immer ganz. Standard: 3.",consumers_list:"Aufklappen zum Bearbeiten, am Griff ziehen zum Sortieren. Die Farbe steht unter „Farben“.",consumer_min_w:"Überschreibt die globale Mindestleistung – etwa 50 W für eine Wärmepumpe, damit ihr Standby nicht als Verbraucher zählt.",consumer_soc:"Für eine Wallbox der Ladestand des Autos, aus dessen eigener Integration. Erscheint als Ring um das Icon; lädt nichts, steht er statt der Leistung in der Zeile.",consumer_label:"Eigene Bezeichnung statt „Ladestand“, wenn der Wert etwas anderes in Prozent ist. Steht im Tooltip und im Detailfenster. Leer: Ladestand.",consumer_show:"Ab der Mindestleistung steht ein Verbraucher immer in der Liste. „Immer“ oder eine Bedingung halten ihn zusätzlich, auch bei 0 W – etwa die Wallbox, solange das Auto angesteckt ist. Gehaltene Zeilen zählen zur Höchstzahl Verbraucher.",node_show_state:"Ohne Zustandswort zeigt nur noch die Farbe, ob eingespeist oder bezogen, geladen oder entladen wird.",node_inside_entity:"Eine beliebige Entität. Im Kreis ist nur Platz für Zahl und Einheit. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_entity:"Eine beliebige Entität, direkt am Kreis. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_prefix:"Freier Text vor dem Wert, z. B. „Autarkie“.",node_inside_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_label_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_inside_size:"In Prozent des Knotenwerts.",node_label_size:"In Prozent der Beschriftung (12 px).",node_inside_position:"Über dem Icon steht der Wert dort, wo die Batterie ihren Ladezustand zeigt, und Antippen öffnet seine eigene Historie. Unter dem Wert öffnet Antippen die Entität des Knotens.",modes:"Was der Quick-Button anbietet: Jetzt, kurzer und langer Mittelwert. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: alle drei.",modes_locked:"Mittelwerte gibt es nur für die Leistung. Hake unter „Quick-Button Leistung/Energie“ „Leistung“ an, dann lässt sich die Glättung einstellen. Bis dahin zeigt die Karte immer den Augenblickswert.",scope:"Was der Quick-Button anbietet: die gefilterte Verbraucherliste oder alle Verbraucher. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide.",list_enabled:"Standard: an, wenn Verbraucher eingetragen sind.",ring_enabled:"Ring der Verbraucher am Haus. Standard: an, wenn Verbraucher eingetragen sind.",list_always_below:"Die Liste bleibt unter der Zeichnung, auch wenn daneben Platz wäre. Standard: aus.",quick_buttons:"Die Knöpfe im Kopf der Karte. Je Knopf, was er anbietet: mehrere Werte – jeder Tipp schaltet weiter; ein Wert – fest, ohne Knopf.",solar_sources:"Jeder Wechselrichter oder String mit eigenem Sensor; die PV ist ihre Summe. Die Farbe einer Quelle lässt sich im YAML setzen (color), sonst Orange-Töne.",pv_source_kwp:"Für die Skala „% kWp“ an jeder Quelle nötig. Ohne Angabe: keine.",pv_source_excluded:"Für Quellen, die am Wechselrichter vorbei einspeisen (Balkonkraftwerk): Ihre Leistung wird zum gemessenen Hauswert addiert. Standard: aus.",list_solar:"Zeigt jede Quelle als Zeile über den Verbrauchern, mit eigenem Fächer. Standard: aus.",ring_solar:"Ring der Quellen am PV-Knoten. Standard: an.",pv_scales:"Was der Quick-Button anbietet: „100 %“ – der Ring zeigt den Anteil jeder Quelle und ist immer voll; „% kWp“ – die Leistung im Verhältnis zur Spitzenleistung. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide, soweit möglich.",pv_scale_peak_locked:"„% kWp“ braucht die Spitzenleistung (kWp) an jeder Quelle. Trage sie unter „PV-Quellen“ ein, dann lässt sich die Skala wählen.",pv_scale_share_locked:"„100 %“ braucht mindestens zwei Quellen – mit einer wäre der Ring immer voll.",quick_style:"Wie die Quick-Buttons aussehen. „Segment-Buttons kompakt“ macht auch die Buttons zum Durchschalten flacher; „Einzel-Buttons“ wirkt bei aufgeklappten Quick-Buttons. Standard: Segment-Buttons.",expanded_modes:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_energy_periods:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_pv_scales:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_scope:"Gefiltert und Vollständig als zwei Buttons statt eines Filter-Knopfs. Standard: aus.",consumer_position:"Oben oder unten steht die Zeile fest, mehrere in der Reihenfolge dieser Liste (Ziehen zum Sortieren). Welche Zeilen erscheinen, entscheidet die Position nicht.",condition_values:"Einer oder mehrere Zustände; = heißt „ist einer davon“, ≠ „ist keiner davon“. Zahlen werden als Zahlen verglichen.",condition_number:"Eine Zahl in der Einheit des Sensors.",consumers_held_limit:"{held} Verbraucher sind immer oder per Bedingung sichtbar, die Höchstzahl ist {limit}. Andere Verbraucher erscheinen dann nicht."},outage:{banner:"Inselbetrieb — kein Netz",label:"Netzstatus"},example:{banner:"Beispielwerte — wähle deine Sensoren im Editor"},pv_scale:{share:"100 %",peak:"% kWp",share_title:"PV: Anteil jeder Quelle, der Ring ist immer voll",peak_title:"PV: Leistung im Verhältnis zur Spitzenleistung",peak_period_title:"PV: mittlere Leistung im Zeitraum im Verhältnis zur Spitzenleistung",chip:"PV-Skala: {mode}, weiter: {next}"},detail:{import:"Bezug",export:"Einspeisung",discharge:"Entladen",charge:"Laden",soc:"Ladestand",periods:"Zeitraum",open:"{name}: Verlauf öffnen","48h":"48 h",mean:"5-Minuten-Mittel",aggregation:"5-Minuten-Mittel · Fläche: kleinster bis größter Wert"}}};function Le(e){const t="undefined"!=typeof document?document.documentElement?.lang:void 0;return(e?.language||t||"en").split("-")[0].toLowerCase()}function Re(e,t){let i=e;for(const e of t.split(".")){if("object"!=typeof i||null===i)return;i=i[e]}return"string"==typeof i?i:void 0}function Oe(e,t,i){const o=Le(t),s=Re(Fe[o],e)??Re(Fe.en,e)??e;return i?s.replace(/\{(\w+)\}/g,(e,t)=>t in i?String(i[t]):e):s}const Te=new Set(["unavailable","unknown","none",""]),De=e=>e.trim().toLowerCase();function qe(e,t,i,o){switch(function(e,t,i){if(void 0===e)return"hold";const o=De(e);return Te.has(o)?"hold":t.outage.includes(o)?"outage":t.ok.length>0?t.ok.includes(o)?"ok":"hold":i&&i.length>0?i.some(e=>De(e)===o)?"ok":"hold":"ok"}(t,i,o)){case"outage":return!0;case"ok":return!1;default:return e}}function Ie(e,t){const i=e.states[t]?.attributes.options;if(Array.isArray(i))return i.filter(e=>"string"==typeof e)}function Be(e,t){console.warn(Oe("error.config.grid_status_no_outage",t,{field:e}))}class He extends Error{constructor(e,t){super(e),this.field=t,this.name="ConfigError"}}const Ve="__rest__",Ke=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],je={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home"},Ue=["current","avg_short","avg_long"],Ze=["power","today","24h","week","7d","month","30d"],Qe=["power","today","24h","week"],Ge=["filtered","full"],Ye=["share","peak"],Je=["auto","on","off"],Xe=["show","dim","hide"],et=["overtake","fade","jump"],tt=["auto","light","dark"],it=new Set(["type","title","entities","consumers","min_consumer_w","max_consumers","update_interval_s","list","ring","view","flow","colors","icons","power","appearance","nodes","memory_id","layout"]),ot=new Set(["view_layout","layout_options","grid_options","visibility","card_mod"]),st={positive:"import",negative:"export"},nt={positive:"discharge",negative:"charge"};function rt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function at(e,t,i,o){return new He(Oe(e,i,{field:t,...o}),t)}function lt(e,t,i){if(!rt(e))throw at("error.config.object",t,i);return e}function ct(e,t,i){if("string"!=typeof e||""===e.trim())throw at("error.config.string",t,i);return e}const dt=e=>null==e||"string"==typeof e&&""===e.trim();function ht(e,t,i){if(!dt(e))return ct(e,t,i)}function ut(e,t,i){return dt(e)?{}:lt(e,t,i)}function pt(e,t,i,o){if(dt(e))return i;if("boolean"!=typeof e)throw at("error.config.boolean",t,o);return e}function mt(e,t,i,o){if(dt(e))return i;if("number"!=typeof e||!Number.isFinite(e))throw at("error.config.number",t,o);return e}function ft(e,t,i,o){const s=mt(e,t,i,o);if(!Number.isInteger(s))throw at("error.config.integer",t,o);return s}let gt;const _t={min_consumer_w:{min:0},max_consumers:{min:1,integer:!0},update_interval_s:{min:1},"view.avg_short_minutes":{min:1,max:120,integer:!0},"view.avg_long_minutes":{min:2,max:240,integer:!0},"flow.min_w":{min:0},"flow.peak_w":{min:1},"flow.slow_below_w":{min:0},"flow.more_dots_above_w":{min:0},"flow.max_dots_at_w":{min:0},"flow.full_speed_w":{min:0},"flow.max_dots":{min:2,max:10,integer:!0},"flow.slow_s":{min:.1},"flow.fast_s":{min:.1},"flow.dot_size":{min:40,max:150},"flow.line_width":{min:30,max:150},"consumers.min_w":{min:0},"entities.solar.kwp":{min:.01,max:1e4},"nodes.size":{min:60,max:150}};function wt(e,t,i,o,s=_t[t]){let n=mt(e,t,i,o);s.integer&&!Number.isInteger(n)&&(n=Math.round(n),console.warn(Oe("error.config.rounded",o,{field:t,value:n})),gt?.push({field:t,used:n,reason:"integer"}));const{min:r,max:a}=s;if(n<r||void 0!==a&&n>a){const e=n<r?"min":"max";n=n<r?r:a,console.warn(void 0===a?Oe("error.config.clamped_min",o,{field:t,min:r,value:n}):Oe("error.config.clamped",o,{field:t,min:r,max:a,value:n})),gt?.push({field:t,used:n,reason:e})}return n}function yt(e,t){const i=e.flatMap((e,t)=>e.set?[t]:[]),o=i.map(t=>e[t].value).sort((e,t)=>e-t),s=e.map(e=>e.value);i.forEach((e,t)=>{s[e]=o[t]});for(let t=s.length-1;t>0;t--){if(!e[t].set||e[t-1].set||s[t]>=s[t-1]+e[t].gap)continue;const i=_t[e[t-1].field]?.min??Number.NEGATIVE_INFINITY;s[t]-e[t].gap>=i&&(s[t-1]=s[t]-e[t].gap)}for(let t=1;t<s.length;t++)s[t]<s[t-1]+e[t].gap&&(s[t]=s[t-1]+e[t].gap);const n=e.map((e,t)=>s[t]!==e.value);return e.forEach((e,i)=>{n[i]&&console.warn(Oe("error.config.order_used",t,{field:e.field,value:s[i]}))}),n.some(Boolean)&&e.forEach((e,t)=>{(e.set||n[t])&&gt?.push({field:e.field,used:s[t],reason:"order"})}),s}function vt(e,t,i,o,s){if(e<t||e>i)throw at("error.config.range",o,s,{min:t,max:i});return e}function bt(e,t,i,o,s){if(dt(e))return o;if("string"!=typeof e||!t.includes(e))throw at("error.config.enum",i,s,{allowed:t.join(", ")});return e}function xt(e,t,i,o,s){return dt(e)?o:"string"==typeof e&&t.includes(e)?e:(console.warn(Oe("error.config.unknown_value",s,{field:i,allowed:t.join(", ")})),o)}const kt=["cross","square_right","square_left","triangle","triangle_battery"],$t=["curved","straight"],St=["segment","segment_compact","single"],At=["modes","energy_periods","pv_scales","scope"];function Mt(e,t){if(dt(e))return[];const i=Array.isArray(e)?e:[e],o=[];for(const e of i)"string"==typeof e&&At.includes(e)?o.includes(e)||o.push(e):console.warn(Oe("error.config.unknown_value",t,{field:"view.expanded",allowed:At.join(", ")}));return o}function Et(e,t,i,o){if(dt(e))return;if(!Array.isArray(e))throw at("error.config.list",i,o);for(const s of e)bt(s,t,i,t[0],o);const s=t.filter(t=>e.includes(t));if(0!==s.length)return s;console.warn(Oe("error.config.empty_choice",o,{field:i}))}function Ct(e,t,i,o){if(dt(e))return{kind:"absent"};if("string"==typeof e)return"derived"===e?{kind:"derived"}:{kind:"single",entity:e,invert:!1};if(!rt(e))throw at("error.config.mixed_form",t,o);const s=Object.keys(e),n="entity"in e,r=void 0!==i&&(i.positive in e||i.negative in e);if(n&&r)throw at("error.config.mixed_form",t,o);if(n){if(s.some(e=>"entity"!==e&&"invert"!==e))throw at("error.config.mixed_form",t,o);const i=e.entity;if("string"!=typeof i||""===i.trim())throw at("error.config.mixed_form",t,o);const n=e.invert;if(!dt(n)&&"boolean"!=typeof n)throw at("error.config.boolean",`${t}.invert`,o);return{kind:"single",entity:i,invert:!0===n}}if(i&&r){if(s.some(e=>e!==i.positive&&e!==i.negative))throw at("error.config.mixed_form",t,o);const n=e[i.positive],r=e[i.negative];if("string"!=typeof n||""===n.trim()||"string"!=typeof r||""===r.trim())throw at("error.config.mixed_form",t,o);return{kind:"split",positive:n,negative:r}}throw at("error.config.mixed_form",t,o)}function zt(e,t,i){if(dt(e))return[];if(!Array.isArray(e))throw at("error.config.list",t,i);const o=[];for(const s of e){if(dt(s))continue;if("string"!=typeof s)throw at("error.config.string",t,i);const e=De(s);""===e||o.includes(e)||o.push(e)}return o}const Pt=Object.freeze(["#e65100","#ffc107","#ff9800","#ffd54f","#f4511e","#ffb74d"]);function Wt(e,t,i){if("absent"===e.kind)throw at("error.config.missing_entities",t,i)}const Nt=["solar_inside","solar_label","grid_inside","grid_label","house_inside","house_label","battery_label"];function Ft(e,t){const i=Object.fromEntries(Nt.map(e=>[e,"var(--secondary-text-color)"]));if(!rt(e))return i;for(const o of Nt){const s=ht(e[o],`colors.${o}`,t);s&&(i[o]=s)}return dt(e.battery_inside)||console.warn(Oe("error.config.not_for_node",t,{field:"colors.battery_inside"})),i}const Lt=["red_green","direction"];function Rt(e,t){const i={...ye,socStops:ve.map(e=>({...e})),consumerPalette:[...be],arrows:"red_green"},o=ut(e,"colors",t);for(const e of Ke){const s=ht(o[e],`colors.${e}`,t);s&&(i[e]=s)}return i.arrows=xt(o.arrows,Lt,"colors.arrows","red_green",t),dt(o.soc_stops)||(i.socStops=function(e,t){const i="colors.soc_stops";if(!Array.isArray(e))throw at("error.config.list",i,t);if(e.length<2)throw at("error.config.soc_stops",i,t);const o=[];for(let s=0;s<e.length;s++){const n=e[s];if(!rt(n)||"number"!=typeof n.at||!Number.isFinite(n.at)||"string"!=typeof n.color||""===n.color.trim())throw at("error.config.soc_stop_entry",`${i}[${s}]`,t,{index:s});o.push({at:n.at,color:n.color})}for(let e=1;e<o.length;e++)if(o[e].at<o[e-1].at)throw at("error.config.soc_stops",i,t);if(0!==o[0].at)throw at("error.config.soc_stops",i,t);if(100!==o[o.length-1].at)throw at("error.config.soc_stops",i,t);return o}(o.soc_stops,t)),dt(o.consumer_palette)||(i.consumerPalette=function(e,t){const i="colors.consumer_palette";if(!Array.isArray(e))throw at("error.config.list",i,t);if(0===e.length)throw at("error.config.non_empty",i,t);return e.map((e,o)=>ct(e,`${i}[${o}]`,t))}(o.consumer_palette,t)),i}const Ot=["kW","W","auto"];function Tt(e,t){const i=ut(e,"power",t);return{unit:bt(i.unit,Ot,"power.unit","kW",t),decimals:vt(ft(i.decimals,"power.decimals",2,t),1,3,"power.decimals",t),digits:vt(ft(i.digits,"power.digits",3,t),2,4,"power.digits",t)}}function Dt(e,t){const i={...je},o=ut(e,"icons",t);for(const e of["solar","grid","house","battery","rest"]){const s=ht(o[e],`icons.${e}`,t);s&&(i[e]=s)}return i}const qt=["charging","plugged","always"];const It=/^(binary_sensor|input_boolean)\./,Bt=["top","bottom"],Ht=["always","condition"],Vt=["=","!=",">","<",">=","<="];function Kt(e){return!0===e?"on":!1===e?"off":"number"==typeof e&&Number.isFinite(e)?String(e):"string"==typeof e&&""!==e.trim()?De(e):void 0}const jt=["solar","grid","house","battery"],Ut=["above","below"],Zt=["normal","medium","bold"],Qt=["ha","sig2","sig3","sig4"],Gt=new Set(["show_name","show_state","inside","label"]),Yt={inside:new Set(["entity","position","decimals","size","weight"]),label:new Set(["entity","prefix","decimals","size","weight"])};function Jt(e,t,i){if(dt(e))return"ha";if("string"==typeof e&&Qt.includes(e))return e;const o="string"==typeof e&&/^\d$/.test(e)?Number(e):e;if(0===o||1===o||2===o||3===o)return o;throw at("error.config.enum",t,i,{allowed:"ha, 0, 1, 2, 3, sig2, sig3, sig4"})}function Xt(e,t,i,o){for(const s of Object.keys(e))t.has(s)||console.warn(Oe("error.config.unknown_key",o,{field:`${i}.${s}`}))}function ei(e,t,i,o){if(dt(e))return;const s=lt(e,i,o);Xt(s,Yt[t],i,o);const n="string"==typeof s.entity?s.entity.trim():"";if(!n)return void console.warn(Oe("error.config.extra_no_entity",o,{field:i}));const r={entity:n,decimals:Jt(s.decimals,`${i}.decimals`,o),size:wt(s.size,`${i}.size`,100,o,_t["nodes.size"]),weight:bt(s.weight,Zt,`${i}.weight`,"normal",o)};if("inside"===t)return{...r,position:bt(s.position,Ut,`${i}.position`,"above",o)};if(!dt(s.prefix)&&"string"!=typeof s.prefix)throw at("error.config.string",`${i}.prefix`,o);const a="string"==typeof s.prefix?s.prefix.trim():"";return{...r,prefix:a||void 0}}function ti(e,t){const i=Object.fromEntries(jt.map(e=>[e,{showName:!0,showState:!0}]));if(dt(e))return i;const o=lt(e,"nodes",t);Xt(o,new Set(jt),"nodes",t);for(const e of jt){if(dt(o[e]))continue;const s=`nodes.${e}`,n=lt(o[e],s,t);Xt(n,Gt,s,t);const r=i[e];r.showName=pt(n.show_name,`${s}.show_name`,!0,t);const a=pt(n.show_state,`${s}.show_state`,!0,t);"grid"===e||"battery"===e?r.showState=a:dt(n.show_state)||console.warn(Oe("error.config.not_for_node",t,{field:`${s}.show_state`})),"battery"!==e?r.inside=ei(n.inside,"inside",`${s}.inside`,t):dt(n.inside)||console.warn(Oe("error.config.not_for_node",t,{field:`${s}.inside`})),r.label=ei(n.label,"label",`${s}.label`,t)}return i}function ii(e,t,i){const{charge:o,hold:s,old:n}=function(e,t,i,o=!1){if(dt(e))return{old:!1};const s=lt(e,t,i),n=ht(s.soc,`${t}.soc`,i);if(!n)return console.warn(Oe("error.config.charge_no_soc",i,{field:t})),{old:!1};const r={soc:n,label:ht(s.label,`${t}.label`,i)},a=!dt(s.show)||!dt(s.plugged)||!dt(s.unplugged);if(o)return{charge:r,old:a};const l=bt(s.show,qt,`${t}.show`,"charging",i),c=ht(s.plugged,`${t}.plugged`,i);if("always"===l)return{charge:r,hold:{kind:"always"},old:a};if("plugged"!==l)return{charge:r,old:a};if(!c)return console.warn(Oe("error.config.charge_no_plugged",i,{field:t})),{charge:r,old:a};const d=It.test(c)?[]:zt(s.unplugged,`${t}.unplugged`,i);return{charge:r,hold:d.length>0?{kind:"condition",entity:c,operator:"!=",values:d}:{kind:"condition",entity:c,operator:"=",values:["on"]},old:a}}(e.charge,`${t}.charge`,i,!dt(e.show)),r=function(e,t,i){if(dt(e.show))return;if("always"===bt(e.show,Ht,`${t}.show`,"always",i))return{kind:"always"};const o=`${t}.condition`,s=dt(e.condition)?{}:lt(e.condition,o,i),n=ht(s.entity,`${o}.entity`,i),r=dt(s.operator)?void 0:bt(s.operator,Vt,`${o}.operator`,"=",i),a=(Array.isArray(s.value)?s.value:[s.value]).filter(e=>!dt(e));if(!n||!r||0===a.length)return void console.warn(Oe("error.config.condition_incomplete",i,{field:o}));if("="===r||"!="===r){const e=[];for(const t of a){const i=Kt(t);void 0===i||e.includes(i)||e.push(i)}return 0===e.length?void console.warn(Oe("error.config.condition_incomplete",i,{field:o})):{kind:"condition",entity:n,operator:r,values:e}}const l="number"==typeof s.value?s.value:Number(s.value);return Array.isArray(s.value)||"boolean"==typeof s.value||!Number.isFinite(l)?(console.warn(Oe("error.config.condition_number",i,{field:o,operator:r})),{kind:"condition",entity:n,operator:r,invalid:!0}):{kind:"condition",entity:n,operator:r,limit:l}}(e,t,i);return!dt(e.show)&&n&&console.warn(Oe("error.config.show_twice",i,{field:t})),{charge:o,hold:dt(e.show)?s:r,position:dt(e.position)?void 0:bt(e.position,Bt,`${t}.position`,"top",i)}}function oi(e,t,i){gt=i;const o=console.warn;i&&(console.warn=()=>{});try{return function(e,t){const i=lt(e,"config",t);if(function(e,t){for(const i of Object.keys(e))it.has(i)||ot.has(i)||console.warn(Oe("error.config.unknown_key",t,{field:i}))}(i,t),dt(i.entities))throw at("error.config.missing_entities","entities",t);const o=lt(i.entities,"entities",t),s=Array.isArray(o.solar)?function(e,t){const i=new Set,o=[];return e.forEach((e,s)=>{const n=`entities.solar[${s}]`,r="string"==typeof e?{entity:e}:e;if(!rt(r)||"string"!=typeof r.entity||""===r.entity.trim())return void console.warn(Oe("error.config.consumer_entity",t,{field:n,index:s}));const a=r.entity.trim();if("derived"===a)throw at("error.config.mixed_form",n,t);if(i.has(a))return void console.warn(Oe("error.config.duplicate_consumer",t,{field:n,entity:a}));i.add(a);const l=r.invert;if(!dt(l)&&"boolean"!=typeof l)throw at("error.config.boolean",`${n}.invert`,t);const c=ht(r.house,`${n}.house`,t);void 0!==c&&"excluded"!==c&&console.warn(Oe("error.config.solar_house",t,{field:`${n}.house`})),o.push({key:a,entity:a,name:ht(r.name,`${n}.name`,t),kwp:dt(r.kwp)?void 0:wt(r.kwp,`${n}.kwp`,1,t,_t["entities.solar.kwp"]),icon:ht(r.icon,`${n}.icon`,t),color:ht(r.color,`${n}.color`,t)??Pt[s%Pt.length],invert:!0===l,excluded:"excluded"===c})}),o}(o.solar,t):[],n=Array.isArray(o.solar)?s.length>0?{kind:"sum"}:{kind:"absent"}:Ct(o.solar,"entities.solar",void 0,t),r=Ct(o.grid,"entities.grid",st,t),a=Ct(o.battery,"entities.battery",nt,t),l=Ct(o.house,"entities.house",void 0,t),c="absent"===l.kind?{kind:"derived"}:l;Wt(n,"entities.solar",t),Wt(r,"entities.grid",t);const d=[["entities.solar",n],["entities.grid",r],["entities.battery",a],["entities.house",c]].filter(([,e])=>"derived"===e.kind).map(([e])=>e);if(d.length>1)throw at("error.config.two_derived",d[1],t);let h;h=ht(o.battery_soc,"entities.battery_soc",t),void 0!==h&&"absent"===a.kind&&(console.warn(Oe("error.config.soc_without_battery",t,{field:"entities.battery_soc"})),h=void 0);const u=function(e,t,i){if(dt(e))return;if("string"==typeof e)return void Be(t,i);const o=lt(e,t,i),s=ct(o.entity,`${t}.entity`,i),n=zt(o.outage,`${t}.outage`,i),r=zt(o.ok,`${t}.ok`,i);if(0!==n.length)return{entity:s,outage:n,ok:r};Be(t,i)}(o.grid_status,"entities.grid_status",t),p=Rt(i.colors,t),m=function(e,t,i){if(dt(e))return[];if(!Array.isArray(e))throw at("error.config.list","consumers",i);const o=new Set,s=[];for(let n=0;n<e.length;n++){const r=e[n],a=`consumers[${n}]`;if(!rt(r)||"string"!=typeof r.entity||""===r.entity.trim()){console.warn(Oe("error.config.consumer_entity",i,{field:a,index:n}));continue}const l=r.entity;o.has(l)?console.warn(Oe("error.config.duplicate_consumer",i,{field:a,entity:l})):(o.add(l),s.push({key:l,entity:l,name:ht(r.name,`${a}.name`,i),color:ht(r.color,`${a}.color`,i)??t[n%t.length],icon:ht(r.icon,`${a}.icon`,i),minW:dt(r.min_w)?void 0:wt(r.min_w,`${a}.min_w`,0,i,_t["consumers.min_w"]),...ii(r,a,i)}))}return s}(i.consumers,p.consumerPalette,t),f=wt(i.min_consumer_w,"min_consumer_w",10,t),g=dt(i.max_consumers)?Number.POSITIVE_INFINITY:wt(i.max_consumers,"max_consumers",1,t),_=wt(i.update_interval_s,"update_interval_s",5,t),w=ut(i.list,"list",t),y=ut(i.ring,"ring",t),v=m.length>0,b=ut(i.view,"view",t),[x,k]=yt([{field:"view.avg_short_minutes",value:wt(b.avg_short_minutes,"view.avg_short_minutes",2,t),set:!dt(b.avg_short_minutes),gap:0},{field:"view.avg_long_minutes",value:wt(b.avg_long_minutes,"view.avg_long_minutes",15,t),set:!dt(b.avg_long_minutes),gap:1}],t),$=ut(i.flow,"flow",t),S=wt($.min_w,"flow.min_w",10,t),A=wt($.peak_w,"flow.peak_w",6e3,t),M=wt($.max_dots,"flow.max_dots",5,t),E=[["flow.min_w",S,$.min_w,0],["flow.slow_below_w",A/12,$.slow_below_w,0],["flow.more_dots_above_w",A/3,$.more_dots_above_w,1],["flow.max_dots_at_w",A,$.max_dots_at_w,1]].map(([e,i,o,s])=>({field:e,value:"flow.min_w"===e?S:wt(o,e,i,t),set:!dt(o),gap:s})),[C,z,P,W]=yt(E,t),[N,F]=yt([{field:"flow.fast_s",value:wt($.fast_s,"flow.fast_s",1.8,t),set:!dt($.fast_s),gap:0},{field:"flow.slow_s",value:wt($.slow_s,"flow.slow_s",5,t),set:!dt($.slow_s),gap:1}],t);let L=P;dt($.full_speed_w)||(L=wt($.full_speed_w,"flow.full_speed_w",P,t),L<=z&&(L=z+1,console.warn(Oe("error.config.order_used",t,{field:"flow.full_speed_w",value:L})),gt?.push({field:"flow.full_speed_w",used:L,reason:"order"})));const R=xt(i.layout,kt,"layout","cross",t),O=function(e,t,i,o,s,n){const r=!pt(e.show_selector,"view.show_selector",!0,n),a=bt(e.default_mode,Ue,"view.default_mode","current",n),l=bt(e.default_energy,Ze,"view.default_energy","power",n),c=bt(t.default_scope,Ge,"list.default_scope","filtered",n);let d=Et(e.modes,Ue,"view.modes",n)??(r?[a]:[...Ue]);const h="view.energy_periods";let u=Et(e.energy_periods,Ze,h,n);const p=void 0===u&&!r;u??=r?[l]:[...Qe],!u.some(e=>"power"!==e)||"derived"!==i.kind&&"derived"!==o.kind||(console.warn(Oe("error.config.energy_derived",n,{field:h})),u=["power"]);const m=u.includes("power");m||(d=["current"]);const f=Et(t.scope,Ge,"list.scope",n)??(r?[c]:[...Ge]),g=bt(e.default_pv_scale,Ye,"view.default_pv_scale","share",n),_=s.sources,w=Ye.filter(e=>"share"===e?_.length>1:_.length>0&&_.every(e=>void 0!==e.kwp)),y=Et(e.pv_scales,Ye,"view.pv_scales",n)??(r?[g]:[...Ye]);let v=s.ring?y.filter(e=>w.includes(e)):[];return s.ring&&0===v.length&&w.length>0&&(console.warn(Oe("error.config.pv_scale",n,{field:"view.pv_scales"})),v=[w[0]]),{modes:d,defaultMode:d.includes(a)?a:d[0],power:m,energyPeriods:u.filter(e=>"power"!==e),energyDefault:p&&u.length>1,defaultEnergy:u.includes(l)?l:u[0],scope:f,defaultScope:f.includes(c)?c:f[0],pvScales:v,defaultPvScale:v.includes(g)?g:v[0]??"share"}}(b,w,r,a,{sources:s,ring:pt(y.solar,"ring.solar",!0,t)},t);return{layout:R,title:ht(i.title,"title",t),memoryId:"number"==typeof i.memory_id?String(i.memory_id):ht(i.memory_id,"memory_id",t),sources:{solar:n,grid:r,battery:a,house:c,batterySoc:h},gridStatus:u,solarSources:s,consumers:m,minConsumerW:f,maxConsumers:g,updateIntervalS:_,list:{enabled:pt(w.enabled,"list.enabled",v,t),restLabel:ht(w.rest_label,"list.rest_label",t),title:ht(w.title,"list.title",t),alwaysBelow:pt(w.always_below,"list.always_below",!1,t),solar:pt(w.solar,"list.solar",!1,t),scope:O.scope,defaultScope:O.defaultScope},ring:{enabled:pt(y.enabled,"ring.enabled",v,t),animation:bt(y.animation,et,"ring.animation","overtake",t),solar:pt(y.solar,"ring.solar",!0,t)},view:{modes:O.modes,defaultMode:O.defaultMode,avgShortMinutes:x,avgLongMinutes:k,remember:pt(b.remember,"view.remember",!0,t),power:O.power,energyPeriods:O.energyPeriods,energyDefault:O.energyDefault,defaultEnergy:O.defaultEnergy,pvScales:O.pvScales,defaultPvScale:O.defaultPvScale,quickStyle:xt(b.quick_style,St,"view.quick_style","segment",t),expanded:Mt(b.expanded,t)},flow:{minW:C,slowBelowW:z,fullSpeedW:L,moreDotsAboveW:P,maxDotsAtW:W,maxDots:M,slowS:F,fastS:N,animation:bt($.animation,Je,"flow.animation","auto",t),design:"string"==typeof $.design&&$.design.trim()?$.design.trim():"none",dotColor:"string"==typeof $.dot_color&&$.dot_color.trim()?$.dot_color.trim():void 0,dotSize:wt($.dot_size,"flow.dot_size",100,t),lineWidth:wt($.line_width,"flow.line_width",100,t),lines:xt($.lines,$t,"flow.lines","cross"===R?"curved":"straight",t),inactiveLines:bt($.inactive_lines,Xe,"flow.inactive_lines","show",t)},appearance:bt(i.appearance,tt,"appearance","auto",t),colors:p,icons:Dt(i.icons,t),nodes:ti(i.nodes,t),extraColors:Ft(i.colors,t),power:Tt(i.power,t),...void 0===i.card_mod?{}:{card_mod:i.card_mod}}}(e,t)}finally{gt=void 0,console.warn=o}}function si(){const e="abcdefghijklmnopqrstuvwxyz0123456789";return[...crypto.getRandomValues(new Uint8Array(8))].map(t=>e[t%36]).join("")}function ni(e){const t=[],i=e=>{if(Array.isArray(e))for(const t of e)i(t);else if(rt(e)){"string"==typeof e.type&&t.push(e);for(const t of["sections","cards","card"])i(e[t])}};return i(e),t}function ri(e){return"number"==typeof e?String(e):"string"==typeof e&&e.trim()?e:void 0}const ai="enerlens-card",li="enerlens-card-editor",ci="enerlens-card-detail",di="EnerLens Card",hi={solar:"sensor.solar_power",grid:"sensor.grid_power"},ui={solar:3200,grid:450},pi={solar_battery:"battery_charge",solar_grid:"grid_export",battery_grid:"grid_export",grid_battery:"grid_import",solar_house:"solar",battery_house:"battery_discharge",grid_house:"grid_import"},mi=Object.keys(pi);function fi(e,t,i,o,s,n){let r=e,a=t,l=i,c=o,d=s,h=n;const u={},p=(e,t)=>(t>0&&(u[e]=t),t),m=p("solar_battery",Math.min(r,d));r-=m,d-=m;const f=p("solar_grid",Math.min(r,l));r-=f,l-=f;const g=p("battery_grid",Math.min(c,l));c-=g,l-=g;const _=p("grid_battery",Math.min(a,d));a-=_,d-=_;const w=p("solar_house",Math.min(r,h));r-=w,h-=w;const y=p("battery_house",Math.min(c,h));return c-=y,h-=y,p("grid_house",Math.min(a,h)),u}function gi(e,t){const{minW:i,slowBelowW:o,fullSpeedW:s,moreDotsAboveW:n,maxDotsAtW:r,maxDots:a,slowS:l,fastS:c}=t.flow;if(!Number.isFinite(e)||e<i)return null;let d=l;if(e>=s)d=c;else if(e>o){d=l-(e-o)/(s-o)*(l-c)}let h=1;if(e>=n){const t=(e-n)/(r-n);h=Math.min(a,2+Math.floor(t*(a-2)))}return{count:h,durationS:d}}function _i(e,t){const i=[];for(const o of mi){const s=e[o];if(void 0===s)continue;const n=gi(s,t);n&&i.push({connection:o,w:s,count:n.count,durationS:n.durationS,colorKey:pi[o]})}return i}function wi(e){const t=e.charge;if(t)return{entity:t.entity,soc:t.soc,stale:t.stale,since:t.since,label:t.label}}function yi(e,t){return e.w>=e.threshold||null!==gi(e.w,t)}function vi(e,t){const i=e.filter(e=>yi(e,t)),o=i.reduce((e,t)=>e+t.w,0);return i.map(e=>({key:e.key,share:o>0?e.w/o:0,color:e.color,entity:e.entity,isRest:e.isRest}))}function bi(e,t,i=!1){const o=function(e,t,i){const o=[],s=[],n=[],r=new Map,a=new Map;e.consumers.forEach((e,t)=>{r.set(e.key,t),e.position&&a.set(e.key,e.position)});for(const r of e.consumers){if(!r.reading.available&&void 0!==t.energy?.consumers[r.entity]){n.push({key:r.key,name:r.name,w:0,color:r.color,entity:r.entity,icon:r.icon,threshold:r.minW??t.minConsumerW,isRest:!1,powerUnknown:!0});continue}const e=!0===r.held;if(!r.reading.available&&!e)continue;const a=r.reading.available?r.reading.w:0,l=r.minW??t.minConsumerW;if(!i&&!e&&a<l)continue;const c={key:r.key,name:r.name,w:a,color:r.color,entity:r.entity,icon:r.icon,threshold:l,isRest:!1,charge:wi(r),powerUnknown:!r.reading.available||void 0};(e?s:o).push(c)}const l=i?Number.POSITIVE_INFINITY:Math.max(0,t.maxConsumers-s.length),c=s.concat(xi(o).slice(0,l)),d=[],h=[],u=[];for(const e of c){const t=a.get(e.key);("top"===t?h:"bottom"===t?u:d).push(e)}if(e.house.available){const i=e.house.w-c.reduce((e,t)=>e+t.w,0);i>=t.minConsumerW&&d.push({key:Ve,name:t.list.restLabel??"",w:i,color:t.colors.rest,icon:t.icons.rest,threshold:t.minConsumerW,isRest:!0})}const p=(e,t)=>(r.get(e.key)??0)-(r.get(t.key)??0),m=n.filter(e=>!a.has(e.key));for(const e of n){const t=a.get(e.key);"top"===t?h.push(e):"bottom"===t&&u.push(e)}return h.sort(p).concat(xi(d),u.sort(p),m)}(e,t,i);return{entries:o,segments:vi(o,t)}}function xi(e){return e.sort((e,t)=>t.w-e.w)}const ki="none";let $i=function(e){for(const t of e){const e=t.spur;"number"!=typeof t.shape?.bias&&"number"==typeof e?.bias&&(t.shape.bias=e.bias),"number"!=typeof t.shape?.bias&&(t.shape.bias=0),"number"!=typeof t.shape?.caps&&(t.shape.caps=0);for(const e of[t.dark,t.light])"number"!=typeof e?.line&&(e.line=80)}return e}([{id:"kugeln",name:"Kugeln",name_en:"Orbs",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:0,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:0,glowStrength:45,line:80}},{id:"partylicht",name:"Partylicht",name_en:"Party Light",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:2,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:1,glowStrength:45,line:80}},{id:"leuchtpunkte",name:"Leuchtpunkte",name_en:"Glowing Dots",shape:{caps:5,bias:95},dark:{dot:9,core:20,coreLight:100,glow:2,glowStrength:80,line:80},light:{dot:8,core:20,coreLight:75,glow:2,glowStrength:45,line:80}},{id:"electron",name:"Electron",shape:{caps:5,bias:70},dark:{dot:10,core:40,coreLight:100,glow:0,glowStrength:80,line:80},light:{dot:10,core:40,coreLight:100,glow:0,glowStrength:10,line:80}},{id:"proton",name:"Proton",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:2,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:100,glow:2,glowStrength:30,line:80}},{id:"neutrino",name:"Neutrino",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:0,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:85,glow:0,glowStrength:30,line:80}}]);function Si(e){if(e&&e!==ki)return $i.find(t=>t.id===e)}function Ai(e,t){const i=e.name_en?.trim();return i?"de"===Le(t)?e.name:i:e.name}const Mi=36e5,Ei=3e5,Ci=864e5,zi=["solar","import","export","discharge","charge","house"],Pi=new Set(["solar","import","discharge"]),Wi={solar:0,import:0,export:0,discharge:0,charge:0,house:0},Ni=new Map;function Fi(e,t){let i=Ni.get(t);i||(i=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}),Ni.set(t,i));const o=i.formatToParts(e),s=e=>Number(o.find(t=>t.type===e)?.value??0);return Date.UTC(s("year"),s("month")-1,s("day"),s("hour"),s("minute"),s("second"))-1e3*Math.floor(e/1e3)}function Li(e,t,i,o){const s=Date.UTC(e,t,i),n=s-Fi(s,o);return s-Fi(n,o)}const Ri={"24h":24,"7d":168,"30d":720};function Oi(e){return void 0!==Ri[e]}function Ti(e,t,i,o){const s=Ri[e];if(void 0!==s){const i="30d"===e?Mi:Ei;return Math.ceil((t-s*Mi)/i)*i}const n=new Date(t+Fi(t,i)),r=n.getUTCFullYear(),a=n.getUTCMonth(),l=n.getUTCDate();if("month"===e)return Li(r,a,1,i);if("week"===e){return Li(r,a,l-(n.getUTCDay()-o+7)%7,i)}return Li(r,a,l,i)}function Di(e,t,i){const o=Fi(e,i);if("hour"===t)return e-((e+o)%Mi+Mi)%Mi;const s=new Date(e+o);return Li(s.getUTCFullYear(),s.getUTCMonth(),s.getUTCDate(),i)}function qi(e,t,i,o){if(Oi(e))return i;const s=new Date(t+Fi(t,o)),n=s.getUTCFullYear(),r=s.getUTCMonth(),a=s.getUTCDate();return"month"===e?Li(n,r+1,1,o):Li(n,r,a+("week"===e?7:1),o)}function Ii(e){return e<=.02?0:e<=.1?1:2}function Bi(e){const t=new Map;for(const i of e??[])null!==i.mean&&Number.isFinite(i.mean)&&t.set(i.start,i.mean);return t}class Hi{constructor(e,t,i){this.hourly=Bi(e),this.fiveMin=Bi(t),this.first=Math.min(...this.hourly.keys(),...this.fiveMin.keys(),i??Number.POSITIVE_INFINITY)}get exists(){return Number.isFinite(this.first)}at(e){if(e.hourly){const t=this.hourly.get(e.start);return void 0===t?void 0:{w:t,filled:!1}}const t=this.fiveMin.get(e.start);if(void 0!==t)return{w:t,filled:!1};const i=this.hourly.get(Math.floor(e.start/Mi)*Mi);return void 0===i?void 0:{w:i,filled:!0}}before(e){const t=Math.floor(e.start/Mi)*Mi-Mi;return e.hourly?this.hourly.get(e.start-Mi):this.fiveMin.get(e.start-Ei)??this.hourly.get(t)}neighbour(e,t){const i=e.hourly?this.hourly:this.fiveMin,o=e=>this.hourly.get(Math.floor(e/Mi)*Mi),s=i.get(e.start-Ci)??(e.hourly?void 0:o(e.start-Ci));if(void 0!==s)return s;if(e.start+Ci>=t)return 0;return i.get(e.start+Ci)??(e.hourly?void 0:o(e.start+Ci))??0}}function Vi(e,t){let i=0,o=0;for(const s of zi)s!==e&&(Pi.has(s)?i+=t[s]:o+=t[s]);return Pi.has(e)?o-i:i-o}class Ki{constructor(){this.own=new Map}add(e,t,i,o){const s=this.own.get(e)??{wh:0,filled:0,ms:0};s.wh+=t,s.ms+=i,o&&(s.filled+=i),this.own.set(e,s)}bars(){return[...this.own.entries()].sort((e,t)=>e[0]-t[0]).map(([e,t])=>({start:e,wh:t.wh,filledShare:t.ms>0?t.filled/t.ms:0}))}}function ji(e){const t=new Map,i=i=>{let o=t.get(i);return o||(o=new Hi(e.hourly[i],e.fiveMin[i],e.since?.[i]),t.set(i,o)),o},o=zi.filter(t=>void 0!==e.roles[t]),s=["solar","house"].find(t=>void 0===e.roles[t]),n=e.solarSources?.length?e.solarSources.map(e=>({id:e,s:i(e)})):void 0,r=n?.filter(e=>e.s.exists)??[],a=o.filter(t=>"solar"===t&&n?r.length>0:i(e.roles[t]).exists),l=a.length===o.length;let c=Number.NEGATIVE_INFINITY,d=Number.NEGATIVE_INFINITY;const h=o.flatMap(t=>"solar"===t&&n?n.map(e=>e.s):[i(e.roles[t])]);for(const t of[...h,...e.consumers.map(i)]){for(const e of t.hourly.keys())d=Math.max(d,e+Mi);for(const e of t.fiveMin.keys())c=Math.max(c,e+Ei)}c=Math.max(c,d);const u=Math.max(e.from,Math.min(e.to,c)),p=Math.max(e.from,...a.map(t=>"solar"===t&&n?Math.min(...r.map(e=>e.s.first)):i(e.roles[t]).first)),m=Math.min(p,u),f=u-m,g=function(e,t,i){const o=[];let s=e;for(;s<t;)if(s%Mi===0&&s+Mi<=Math.min(t,i))o.push({start:s,end:s+Mi,hourly:!0}),s+=Mi;else{const e=Math.min(t,(Math.floor(s/Ei)+1)*Ei);o.push({start:s,end:e,hourly:!1}),s=e}return o}(m,u,d),_={...Wi},w={...Wi},y=new Map,v=new Map,b={};let x;const k=new Map(r.map(e=>[e.id,{wh:0,filledMs:0,counted:0,last:void 0}]));for(const t of g){const o=(t.end-t.start)/Mi,c={...Wi},d=new Set,h=[];let p=0;for(const s of a){if("solar"===s&&n){let i=0;for(const{id:s,s:n}of r){if(t.start<n.first)continue;const r=k.get(s),a=n.at(t);let l,c=!1;if(a?(l=a.w,c=a.filled):(r.last??n.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?l=0:(l=n.neighbour(t,u),c=!0),r.last=l,e.houseExcluded?.includes(s)&&(p+=l),r.wh+=l*o,r.counted+=t.end-t.start,e.bucketOf){const i=v.get(s)??new Ki;v.set(s,i),i.add(e.bucketOf(t.start),l*o,t.end-t.start,c)}c&&(r.filledMs+=t.end-t.start,d.add("solar")),i+=l}c.solar=i;continue}const a=i(e.roles[s]),l=a.at(t);l?(c[s]=l.w,l.filled&&d.add(s)):"solar"===s&&(x??a.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?c.solar=0:h.push(s)}if(1===h.length&&!s&&l){const e=Vi(h[0],c);c[h[0]]=Math.max(0,"house"===h[0]?e-p:e),d.add(h[0])}else for(const o of h)c[o]=i(e.roles[o]).neighbour(t,u),d.add(o);let m=0;s&&(m=Vi(s,c),c[s]=Math.max(0,m),d.size>0&&d.add(s)),x=c.solar;for(const i of zi){const n=(i===s?m:c[i])*o;if(_[i]+=n,d.has(i)&&(w[i]+=t.end-t.start),e.bucketOf){const o=y.get(i)??new Ki;y.set(i,o),o.add(e.bucketOf(t.start),n,t.end-t.start,d.has(i))}}if(l){const e=fi(c.solar,c.import,c.export,c.discharge,c.charge,c.house);for(const[t,i]of Object.entries(e))b[t]=(b[t]??0)+i*o}}const $={};for(const e of zi){const t=e===s?l:a.includes(e);$[e]=t?{wh:_[e],filledShare:f>0?w[e]/f:0}:null}const S={},A=new Map,M=e.bucketOf;for(const t of e.consumers){const e=M?{buckets:new Ki,of:M}:void 0;S[t]=Ui(i(t),g,m,u,e),e&&S[t]&&A.set(t,e.buckets)}const E=n?Object.fromEntries(n.map(({id:e,s:t})=>{const i=k.get(e);if(!i)return[e,null];const o={wh:i.wh,filledShare:i.counted>0?i.filledMs/i.counted:0};return t.first>m&&(o.since=t.first),[e,o]})):void 0;let C,z;if(e.bucketOf){C={};for(const e of zi)$[e]&&(C[e]=y.get(e)?.bars()??[]);z={};for(const[e,t]of[...v,...A])z[e]=t.bars()}return{from:m,to:u,lateStart:m>e.from,main:$,consumers:S,sources:E,flows:b,bars:C,entityBars:z}}function Ui(e,t,i,o,s){if(!e.exists)return null;let n=0,r=0,a=0;for(const i of t){if(i.start<e.first)continue;const t=e.at(i),l=t?t.w:e.neighbour(i,o);t&&!t.filled||(r+=i.end-i.start),n+=l*(i.end-i.start)/Mi,a+=i.end-i.start,s?.buckets.add(s.of(i.start),l*(i.end-i.start)/Mi,i.end-i.start,!t||t.filled)}const l={wh:n,filledShare:a>0?r/a:0};return e.first>i&&(l.since=e.first),l}const Zi=36e5,Qi=864e5;const Gi="#positive",Yi="#negative",Ji="#pv-sum";function Xi(e){const t={},i=new Set,o=new Map,s=(e,o)=>{"single"===o.kind&&(t[e]=o.entity,o.invert&&i.add(o.entity))},{solar:n,grid:r,battery:a,house:l}=e.sources;if(s("solar",n),"sum"===n.kind){t.solar=Ji;for(const t of e.solarSources)t.invert&&i.add(t.entity)}s("house",l);const c=(e,s,n)=>{if("split"===n.kind)t[e]=n.positive,t[s]=n.negative;else if("single"===n.kind){const r={positive:n.entity+Gi,negative:n.entity+Yi};o.set(n.entity,r),t[e]=r.positive,t[s]=r.negative,n.invert&&i.add(n.entity)}};return c("import","export",r),c("discharge","charge",a),{roles:t,inverted:i,signed:o}}function eo(e,t){const i=Object.values(e.roles).filter(e=>e!==Ji).map(e=>e.endsWith(Gi)||e.endsWith(Yi)?e.slice(0,e.lastIndexOf("#")):e),o="sum"===t.sources.solar.kind?t.solarSources.map(e=>e.entity):[];return[...new Set([...i,...o,...t.consumers.map(e=>e.entity)])]}function to(e){return[...eo(Xi(e),{...e,consumers:[]})].sort()}const io=new Map;function oo(e,t){const i={...e};for(const[o,s]of t){const t=e[o];t&&(i[s.positive]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(e.mean,0)})),i[s.negative]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(-e.mean,0)})))}return i}function so(e,t,i){const o={};if(!e||"object"!=typeof e)return o;const s=e;for(const e of t){const t=s[e];if(!Array.isArray(t))continue;const n=i.has(e)?-1:1;o[e]=t.flatMap(e=>{const t=e,i="number"==typeof t.start?t.start:Date.parse(String(t.start)),o="number"==typeof t.mean?n*t.mean:null;return Number.isFinite(i)?[{start:i,mean:o}]:[]})}return o}async function no(e,t,i,o,s,n){let r;const a=new Promise((e,i)=>{r=setTimeout(()=>i(new Error(`EnerLens: statistics (${t}) did not answer within ${s} ms`)),s)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),...void 0!==n?{end_time:new Date(n).toISOString()}:{},statistic_ids:o,period:t,types:["mean"],units:{power:"W"}}),a])}finally{void 0!==r&&clearTimeout(r)}}function ro(e,t){return Oi(e)?0:t}function ao(e){const t=e.locale?.first_weekday,i=t?["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(t):-1;if(i>=0)return i;try{const t=new Intl.Locale(e.locale?.language??e.language??"en"),i=(t.getWeekInfo?.()??t.weekInfo)?.firstDay;if(i)return i%7}catch{}return 1}function lo(e){const t=Intl.DateTimeFormat().resolvedOptions().timeZone;return"local"===e.locale?.time_zone?t:e.config?.time_zone??t}function co(e,t){const i={};for(const[o,s]of Object.entries(e)){const e=Math.min(...s.map(e=>e.start));e<t&&(i[o]=e)}return i}async function ho(e,t,i,o=Date.now(),s=1e4){const n=Xi(t),{roles:r,inverted:a,signed:l}=n,c=eo(n,t),d=Ti(i,o,lo(e),ao(e)),h=Math.floor(o/Zi)*Zi,u=Math.ceil(d/Zi)*Zi,p=d<u&&d<h-Qi,[m,f,g,_]=await Promise.all([no(e,"hour",d-Qi,c,s),no(e,"5minute",h-Qi,c,s),no(e,"day",d-32*Qi,c,s),p?no(e,"5minute",d,c,s,u):Promise.resolve({})]),w=so(f,c,a);for(const[e,t]of Object.entries(so(_,c,a)))w[e]=[...t,...w[e]??[]];const y=lo(e),v=function(e){return"today"===e||"24h"===e?"hour":"day"}(i),b=ji({bucketOf:e=>Di(e,v,y),from:d,to:o,roles:r,consumers:t.consumers.map(e=>e.entity),hourly:oo(so(m,c,a),l),fiveMin:oo(w,l),pvZeroBelowW:t.flow.minW,since:co(oo(so(g,c,a),l),d-Qi),solarSources:r.solar===Ji?t.solarSources.map(e=>e.entity):void 0,houseExcluded:t.solarSources.filter(e=>e.excluded).map(e=>e.entity)}),x=function(e,t,i,o,s,n,r=e.from,a=new Map){const l=Math.max((e.to-e.from)/Zi,1/12),c=new Map;for(const[t,s]of Object.entries(i)){const i=e.main[t]?.wh;c.set(s,void 0===i?null:o.has(s)?-i:i)}for(const[t,i]of Object.entries(e.consumers))c.set(t,i?.wh??null);for(const[t,i]of Object.entries(e.sources??{})){const e=i?.wh;c.set(t,void 0===e?null:o.has(t)?-e:e)}for(const[e,t]of a){const i=c.get(t.positive),s=c.get(t.negative),n=null==i||null==s?null:i-s;c.set(e,null===n?null:o.has(e)?-n:n)}const d=e=>{const t=Ii(e);return{tier:t,note:t>0?Oe("energy.filled",s,{percent:uo(e,s)}):""}},h={};for(const t of Object.keys(e.main)){const i=e.main[t];h[t]=i?d(i.filledShare):{tier:0,note:""}}const u={};let p=h.house?.tier??0;for(const[t,i]of Object.entries(e.consumers)){let e;e=i?void 0!==i.since?{tier:2,note:Oe("energy.since",s,{date:po(i.since,s)})}:d(i.filledShare):{tier:2,note:Oe("energy.none",s)},u[t]=e,p=Math.max(p,e.tier),e.tier}if(e.sources){let t={tier:0,note:""};for(const[i,o]of Object.entries(e.sources)){let e;e=o?void 0!==o.since?{tier:2,note:Oe("energy.since",s,{date:po(o.since,s)})}:d(o.filledShare):{tier:2,note:Oe("energy.none",s)},u[i]=e,e.tier>t.tier&&(t=e)}h.solar=t}const m={tier:p,note:p>0?Oe("energy.rest",s):""},f=!0===i.discharge?.endsWith(Gi),g={},_=Object.keys(i).every(t=>null!==e.main[t]);if(i.import?.endsWith(Gi)&&_){const t=t=>Math.max(0,(e.main[t]?.wh??0)/l),i=t("import")-t("export");Object.assign(g,fi(t("solar"),Math.max(i,0),Math.max(-i,0),f?0:t("discharge"),f?0:t("charge"),t("house")))}else if(!i.import?.endsWith(Gi))for(const[t,i]of Object.entries(e.flows))f&&t.includes("battery")||(g[t]=i/l);return{period:t,from:e.from,to:e.to,lateStart:e.lateStart,hours:l,meanW:e=>{const t=c.get(e);return null==t?null:t/l},flowsW:g,marks:{roles:h,consumers:u,rest:m},fetchedAt:n,start:r}}(b,i,r,a,e,o,ro(i,d),l);return x.detail={step:v,bars:b.bars??{},entityBars:b.entityBars??{},axisFrom:Di(d,v,y),axisTo:qi(i,d,o,y)},x}function uo(e,t){return new Intl.NumberFormat(t.locale?.language??t.language,{style:"percent",maximumFractionDigits:0}).format(Math.max(e,.01))}function po(e,t,i=!1){return new Intl.DateTimeFormat(t.locale?.language??t.language,{timeZone:lo(t),day:"numeric",month:"numeric",...i?{hour:"2-digit",minute:"2-digit"}:{}}).format(e)}function mo(e,t,i,o="kW"){if(!e)return"W"===o?"Watt":"kW";const s=Oe(`energy.${e}`,i);return t?.lateStart&&t.period===e?Oe("energy.from",i,{period:s,date:po(t.from,i,"today"===e||"24h"===e)}):s}const fo={unit:"kW",decimals:2,digits:3},go=new Set(["cs","de","fi","fr","sk","sv"]);function _o(e){return(e??"").split("-")[0].toLowerCase()}function wo(e,t){const i=e=>Math.max(t-1-Math.floor(Math.log10(e)),0),o=Math.abs(e);if(!(o>0))return Math.max(t-1,0);const s=i(o),n=Number(o.toFixed(s));return n>0?Math.min(s,i(n)):s}function yo(e,t,i=fo){if(void 0!==i.energyHours)return vo(e*i.energyHours,t);const o="auto"===i.unit?function(e){return Math.round(Math.abs(e))<1e3?"W":"kW"}(e):i.unit,s="W"===o?0:"auto"===i.unit?wo(e/1e3,i.digits):i.decimals,n="W"===o?e:e/1e3;return`${new Intl.NumberFormat(xo(t),{minimumFractionDigits:s,maximumFractionDigits:s,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(bo(n,s)?0:n)} ${o}`}function vo(e,t){const i=new Intl.NumberFormat(xo(t),{minimumFractionDigits:1,maximumFractionDigits:1,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}),o=e/1e3;return o>0&&o<.05?`< ${i.format(.1)} kWh`:`${i.format(bo(o,1)?0:o)} kWh`}function bo(e,t){return 0===Number(e.toFixed(t))}function xo(e){switch(e?.locale?.number_format){case"comma_decimal":return["en-US","en"];case"decimal_comma":return["de","es","it"];case"space_comma":return["fr","sv","cs"];case"quote_decimal":return["de-CH"];case"none":return"en-US";case"system":return;default:return e?.locale?.language}}function ko(e,t){if(!e)return"—";const i=Number(e.state);if(""===e.state.trim()||!Number.isFinite(i))return"—";if(t?.formatEntityState)return t.formatEntityState(e);const o=t?.entities?.[e.entity_id]?.display_precision,s="number"==typeof o?o:e.state.split(".")[1]?.length??0,n=new Intl.NumberFormat(xo(t),{minimumFractionDigits:s,maximumFractionDigits:s,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(i),r=_o(t?.locale?.language??t?.language);return`${n}${go.has(r)?" ":""}%`}function $o(e,t){const i=new Intl.NumberFormat(xo(t),{maximumFractionDigits:0}).format(Math.round(e)),o=_o(t?.locale?.language??t?.language);return`${i}${go.has(o)?" ":""}%`}function So(e,t,i=Date.now()){const o=new Date(e),s=o.toLocaleTimeString(xo(t),{hour:"2-digit",minute:"2-digit"});if(o.toDateString()===new Date(i).toDateString())return s;return`${o.toLocaleDateString(xo(t),{day:"numeric",month:"numeric"})} ${s}`}const Ao=new Set(["monetary","duration","timestamp","date"]);function Mo(e,t){return"°"===e?"":"%"===e?go.has(_o(t?.locale?.language??t?.language))?" ":"":" "}function Eo(e,t,i){if(!e||"unavailable"===e.state||"unknown"===e.state)return Oe("state.unavailable",t);const o=e.attributes.unit_of_measurement,s=Number(e.state),n=(Boolean(o)||Boolean(e.attributes.state_class))&&""!==e.state.trim()&&Number.isFinite(s),r=Ao.has(String(e.attributes.device_class??""));if("ha"===i||!n||r)return t?.formatEntityState?t.formatEntityState(e):o?`${e.state}${Mo(o,t)}${o}`:e.state;const a="number"==typeof i?0:Number(i.slice(3)),l="number"==typeof i?i:wo(s,a),c=l>20?wo(0,a):l,d=new Intl.NumberFormat(xo(t),{minimumFractionDigits:c,maximumFractionDigits:c,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(bo(s,c)?0:s);return o?`${d}${Mo(o,t)}${o}`:d}const Co=400,zo=200,Po=200,Wo=56,No={solar:{x:zo,y:58},grid:{x:58,y:Po},house:{x:342,y:Po},battery:{x:zo,y:342}},Fo={solar_house:"M200,114 C200,168 232,200 286,200",solar_grid:"M200,114 C200,168 168,200 114,200",solar_battery:"M200,114 L200,286",grid_house:"M114,200 L286,200",grid_battery:"M114,200 C168,200 200,232 200,286",battery_grid:"M114,200 C168,200 200,232 200,286",battery_house:"M200,286 C200,232 232,200 286,200"},Lo=["solar_house","solar_grid","solar_battery","grid_house","grid_battery","battery_house"];function Ro(e,t,i){const o=e=>Number(e.toFixed(3)),s=`A${o(i)},${o(i)} 0 1 0`;return`M${o(e-i)},${o(t)}${s} ${o(e+i)},${o(t)}${s} ${o(e-i)},${o(t)}Z`}const Oo=e=>e.toFixed(2);function To(e,t){const i=Math.hypot(t.x-e.x,t.y-e.y)||1;return{x:e.x+(t.x-e.x)/i*Wo,y:e.y+(t.y-e.y)/i*Wo}}function Do(e,t){const i=Math.SQRT1_2,o=e.x-zo,s=e.y-Po;return{x:zo+o*i-t*s*i,y:Po+t*o*i+s*i}}function qo(e,t){return e.replace(/(-?[\d.]+),(-?[\d.]+)/g,(e,i,o)=>{const s=Do({x:Number(i),y:Number(o)},t);return`${Oo(s.x)},${Oo(s.y)}`})}const Io=new Map;function Bo(e,t,i){const o=`${e}|${t}|${i}`,s=Io.get(o);if(s)return s;let n={...No},r=400;const a="triangle"===e||"triangle_battery"===e,l="triangle_battery"===e&&i,c=l?"battery":"house";if("square_right"===e||"square_left"===e){const t="square_right"===e?1:-1;n={solar:Do(No.solar,t),grid:Do(No.grid,t),house:Do(No.house,t),battery:Do(No.battery,t)}}else a&&(r=i?560:350,n={solar:{x:305,y:70},house:{x:305,y:l?490:280},battery:{x:305,y:l?280:490},grid:{x:95,y:280}});const d=(e,t)=>function(e,t){const i=To(e,t),o=To(t,e);return`M${Oo(i.x)},${Oo(i.y)} L${Oo(o.x)},${Oo(o.y)}`}(n[e],n[t]);let h;if("cross"===e&&"curved"===t)h={...Fo};else if("square_right"!==e&&"square_left"!==e||"curved"!==t){const e=a&&"curved"===t,i=e&&!l?Vo(n,"grid","battery",c):d("grid","battery");h={solar_house:l?Ho(n,"house"):d("solar","house"),solar_grid:e?Vo(n,"solar","grid",c):d("solar","grid"),solar_battery:a&&!l?Ho(n,"battery"):d("solar","battery"),grid_house:e&&l?Vo(n,"grid","house",c):d("grid","house"),grid_battery:i,battery_grid:i,battery_house:d("battery","house")}}else{const t="square_right"===e?1:-1;h=Object.fromEntries(Object.entries(Fo).map(([e,i])=>[e,qo(i,t)]))}const u=r/2,p=Object.fromEntries(Object.keys(n).map(e=>[e,a?"solar"===e:n[e].y<u-1])),m={layout:e,viewW:Co,viewH:r,nodePos:n,paths:h,labelAbove:p,ground:a?c:null};return Io.set(o,m),m}function Ho(e,t){const i=(e,t,i)=>({x:e.x+-.6*i,y:e.y+.8*t*i}),o=i(e.solar,1,Wo),s=i(e.solar,1,216),n=i(e[t],-1,216),r=i(e[t],-1,Wo);return`M${Oo(o.x)},${Oo(o.y)} C${Oo(s.x)},${Oo(s.y)} ${Oo(n.x)},${Oo(n.y)} ${Oo(r.x)},${Oo(r.y)}`}function Vo(e,t,i,o){const s=e[t],n=e[i],r=e[o],a=(s.x+n.x)/2,l=(s.y+n.y)/2,c=Math.hypot(a-r.x,l-r.y)||1,d={x:a+(a-r.x)/c*90,y:l+(l-r.y)/c*90},h=To(s,d),u=To(n,d);return`M${Oo(h.x)},${Oo(h.y)} Q${Oo(d.x)},${Oo(d.y)} ${Oo(u.x)},${Oo(u.y)}`}function Ko(e,t){return`M${-e.viewW},${-e.viewH}H${2*e.viewW}V${2*e.viewH}H${-e.viewW}Z`+Object.values(e.nodePos).map(({x:e,y:i})=>Ro(e,i,t)).join("")}const jo=2,Uo=e=>(...t)=>({_$litDirective$:e,values:t});let Zo=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Qo}=re,Go=e=>e,Yo=()=>document.createComment(""),Jo=(e,t,i)=>{const o=e._$AA.parentNode,s=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=o.insertBefore(Yo(),s),n=o.insertBefore(Yo(),s);i=new Qo(t,n,e,e.options)}else{const t=i._$AB.nextSibling,n=i._$AM,r=n!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==n._$AU&&i._$AP(t)}if(t!==s||r){let e=i._$AA;for(;e!==t;){const t=Go(e).nextSibling;Go(o).insertBefore(e,s),e=t}}}return i},Xo=(e,t,i=e)=>(e._$AI(t,i),e),es={},ts=(e,t=es)=>e._$AH=t,is=e=>{e._$AR(),e._$AA.remove()},os=(e,t,i)=>{const o=new Map;for(let s=t;s<=i;s++)o.set(e[s],s);return o},ss=Uo(class extends Zo{constructor(e){if(super(e),e.type!==jo)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let o;void 0===i?i=t:void 0!==t&&(o=t);const s=[],n=[];let r=0;for(const t of e)s[r]=o?o(t,r):r,n[r]=i(t,r),r++;return{values:n,keys:s}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,o]){const s=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,i,o);if(!Array.isArray(s))return this.ut=r,n;const a=this.ut??=[],l=[];let c,d,h=0,u=s.length-1,p=0,m=n.length-1;for(;h<=u&&p<=m;)if(null===s[h])h++;else if(null===s[u])u--;else if(a[h]===r[p])l[p]=Xo(s[h],n[p]),h++,p++;else if(a[u]===r[m])l[m]=Xo(s[u],n[m]),u--,m--;else if(a[h]===r[m])l[m]=Xo(s[h],n[m]),Jo(e,l[m+1],s[h]),h++,m--;else if(a[u]===r[p])l[p]=Xo(s[u],n[p]),Jo(e,s[h],s[u]),u--,p++;else if(void 0===c&&(c=os(r,p,m),d=os(a,h,u)),c.has(a[h]))if(c.has(a[u])){const t=d.get(r[p]),i=void 0!==t?s[t]:null;if(null===i){const t=Jo(e,s[h]);Xo(t,n[p]),l[p]=t}else l[p]=Xo(i,n[p]),Jo(e,s[h],i),s[t]=null;p++}else is(s[u]),u--;else is(s[h]),h++;for(;p<=m;){const t=Jo(e,l[m+1]);Xo(t,n[p]),l[p++]=t}for(;h<=u;){const e=s[h++];null!==e&&is(e)}return this.ut=r,ts(e,l),K}});function ns(e,t,i,o="overtake",s=!1,n="share"){const r=e.filter(e=>e.share>0);if(!t||0===r.length)return j;const{r:a,strokeWidth:l}=function(e){const t=100/Math.max(1,e- -11)*11;return{r:50-t/2,strokeWidth:t}}(i),c=2*Math.PI*a,d="peak"===n,h=d?0:.0085*c,u=.014*c,p=r.length>1?r.length*h:0,m=c-p,f=r.map(e=>e.share*m);let g=0;for(const[e,t]of f.entries())t>0&&t<u&&(g+=u-t,f[e]=u);if(g>0){const e=f.indexOf(Math.max(...f));f[e]=Math.max(u,f[e]-g)}const _=d?f.reduce((e,t,i)=>r[i].isRest?e:e+t,0):0;let w=d?-_/2:0;const y=r.map((e,t)=>{const i={segment:e,index:t,length:f[t],offset:w};return w+=i.length+(r.length>1?h:0),i}),v="fade"===o;return v||y.sort((e,t)=>e.segment.key<t.segment.key?-1:e.segment.key>t.segment.key?1:0),H`<svg class="ring ${v&&s?"fade":""}" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${ss(y,e=>v?d&&e.segment.isRest?`fade-${e.segment.key}`:`slot-${e.index}`:e.segment.key,e=>V`<circle
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
  </svg>`}const rs=15.8,as={now:()=>performance.now(),frame:e=>requestAnimationFrame(()=>e()),cancel:e=>cancelAnimationFrame(e)};class ls{constructor(e=("function"==typeof requestAnimationFrame?as:void 0)){this.clock=e,this.drawn=new WeakMap,this.shownAt=new WeakMap,this.shown=[],this.lane=.8,this.last=0}update(e,t,i){const o=[...e.querySelectorAll("svg.ring circle.ring-seg")].map(e=>({el:e,index:Number(e.dataset.index),len:Number(e.dataset.length),off:Number(e.dataset.offset),circ:Number(e.dataset.circ),gap:Number(e.dataset.gap??0)})).sort((e,t)=>e.index-t.index);this.lane=function(e){const t=e/2,i=(t-5.5-2)/(t+5.5);return Math.min(.85,Math.max(.6,i))}(i);const s=o.filter(e=>this.drawn.has(e.el)),n=[...s].sort((e,t)=>(this.shownAt.get(e.el)??0)-(this.shownAt.get(t.el)??0)),r=new Map(n.map((e,t)=>[e.el,t])),a=new Map(s.map((e,t)=>[e.el,t]));for(const e of o)this.shownAt.set(e.el,e.index);this.shown=o.map(e=>e.el);const l=s.some(e=>this.drawn.get(e.el)?.circ!==e.circ);if(!t||!this.clock||0===s.length||l){for(const e of o)this.drawn.set(e.el,{len:cs(e.len),off:cs(e.off),circ:e.circ,gap:e.gap});return void this.halt()}for(const[e,t]of o.entries()){const i=this.drawn.get(t.el);if(!i){this.drawn.set(t.el,this.born(o,e));continue}i.len.to=t.len,i.off.to=t.off,i.gap=t.gap;const n=r.get(t.el)??0,l=a.get(t.el)??0,c=s.filter(e=>(r.get(e.el)??0)<n&&(a.get(e.el)??0)>l).map(e=>e.el),d=(i.dive?.passing??[]).filter(e=>a.has(e)&&(a.get(e)??0)>l&&!c.includes(e));if(c.length+d.length>0){const e=i.dive?.scale??{x:1,v:-(1-this.lane)*rs,to:this.lane};e.to=this.lane,i.dive={passing:[...c,...d],scale:e}}else i.dive&&(i.dive.passing=[])}this.draw();this.shown.some(e=>{const t=this.drawn.get(e);return!(void 0===t||hs(t.len)&&hs(t.off)&&void 0===t.dive)})&&this.run()}born(e,t){const i=e[t],o=t>0?this.drawn.get(e[t-1].el):void 0;let s,n=!1;for(let i=1;i<e.length&&!s;i++)s=this.drawn.get(e[(t+i)%e.length].el),n=t+i>=e.length;const r=o?o.off.x+o.len.x:0,a=s?(n?i.circ:0)+s.off.x-r:0,l=o?Math.min(i.gap,Math.max(0,a)):0,c=o?o.off.v+o.len.v:0,d=s?s.off.v:c,h=o?.dive?{passing:[...o.dive.passing],scale:{...o.dive.scale}}:void 0;return{len:{x:0,v:d-c,to:i.len},off:{x:r+l,v:c,to:i.off},circ:i.circ,gap:i.gap,dive:h}}stop(){for(const e of this.shown){const t=this.drawn.get(e);t&&ds(t)}this.halt()}halt(){void 0!==this.pending&&this.clock?.cancel(this.pending),this.pending=void 0;for(const e of this.shown){const t=this.drawn.get(e);t&&(t.dive=void 0)}this.draw()}run(){void 0===this.pending&&this.clock&&(this.last=this.clock.now(),this.pending=this.clock.frame(()=>this.frame()))}frame(){if(this.pending=void 0,!this.clock)return;const e=this.clock.now(),t=Math.min(.25,Math.max(0,(e-this.last)/1e3));this.last=e;let i=!1;for(const e of this.shown){const o=this.drawn.get(e);o&&(us(o.len,t),us(o.off,t),hs(o.len)&&hs(o.off)||(i=!0))}if(!i)for(const e of this.shown){const t=this.drawn.get(e);t&&Object.assign(t,{len:cs(t.len.to),off:cs(t.off.to)}),t?.dive&&(t.dive.passing=[])}for(const e of this.shown){const o=this.drawn.get(e);o?.dive&&this.dip(e,o,o.dive,t),o?.dive&&(i=!0)}this.draw(),i&&(this.pending=this.clock.frame(()=>this.frame()))}dip(e,t,i,o){const s=t.off.x+t.len.x;i.passing=i.passing.filter(i=>{const o=this.shown.includes(i)?this.drawn.get(i):void 0;return void 0!==o&&i!==e&&s+t.gap/2-.4>o.off.x}),i.scale.to=i.passing.length>0?this.lane:1,us(i.scale,o,rs),0===i.passing.length&&hs(i.scale,.001,rs)&&(t.dive=void 0)}draw(){for(const e of this.shown){const t=this.drawn.get(e);if(!t)continue;const i=Math.max(0,Math.min(t.circ,t.len.x)),o=`${i.toFixed(2)} ${(t.circ-i).toFixed(2)}`,s=(-t.off.x).toFixed(2),n=t.dive?t.dive.scale.x.toFixed(3):"",r=`${o}|${s}|${n}`;r!==t.written&&(t.written=r,e.setAttribute("stroke-dasharray",o),e.setAttribute("stroke-dashoffset",s),n?e.setAttribute("transform",`translate(50 50) scale(${n}) translate(-50 -50)`):e.removeAttribute("transform"))}}}function cs(e){return{x:e,v:0,to:e}}function ds(e){e.len=cs(e.len.to),e.off=cs(e.off.to),e.dive=void 0}function hs(e,t=.05,i=3.16){return Math.abs(e.x-e.to)<t&&Math.abs(e.v)<t*i}function us(e,t,i=3.16){const o=e.x-e.to,s=e.v+i*o,n=Math.exp(-i*t);e.x=e.to+(o+s*t)*n,e.v=(e.v-i*s*t)*n}function ps(e,t){return e.available?e.net>=t?"positive":e.net<=-t?"negative":"none":"none"}function ms(e,t){if(!e.derived)return"negative"===ps(e,t)?e.entityNegative??e.entityPositive:e.entityPositive??e.entityNegative}function fs(e,t){e.dispatchEvent(new CustomEvent("enerlens-detail",{detail:t,bubbles:!0,composed:!0}))}function gs(e,t){e.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}const _s={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home",battery:"mdi:battery"};function ws(e,t){if(t)return t;if(!e.available)return"mdi:battery";const i=10*Math.round(e.w/10);return i<=0?"mdi:battery-outline":i>=100?"mdi:battery":`mdi:battery-${i}`}function ys(e,t,i){if(e&&!t.energy)return Oe("node.partial",i,{names:e.join(", ")})}function vs(e){return e&&e.tier>0?`warn${e.tier}`:""}function bs(e,t,i,o){return!e||!e.available||Math.abs(e.net)<o.flow.minW?"var(--el-line)":o.colors[e.net>0?t:i]}function xs(e,t,i){return e.available?yo(e.w,t,i.power):Oe("state.unavailable",t)}const ks={normal:400,medium:500,bold:700};function $s(e,t,i){return`color:${t};font-size:calc(var(${i}) * ${e.size/100});font-weight:${ks[e.weight]}`}function Ss(e,t,i){const o=e.nodes[t],s=o.label,n=(o.showName?15:0)+(i&&o.showState?15:0)+("derived"===e.sources[t].kind?15:0);return s?n+24+(0===n?8:0):n}function As(e,t,i,o,s="solar"===e.key){const n=t.nodes[e.key],[r,...a]=e.label.split(" · "),l=n.showState?a.join(" · "):"",c=n.showName||!0===e.outage,d=e.derived?Oe(c?"node.derived_suffix":"node.derived_alone",i):"",h=n.label,u=void 0!==t.energy;let p="";if(h){const s=h.prefix??"",n=Eo(i.states[h.entity],i,h.decimals),r=t.extraColors[`${e.key}_label`],a=s?`${s} ${n}`:n;p=H`<button
      class="extra-label extra"
      style=${$s(h,r,"--el-label-size")+(u?";visibility:hidden":"")}
      tabindex=${u?"-1":"0"}
      aria-hidden=${u?"true":"false"}
      title=${a}
      aria-label=${a}
      @click=${o(h.entity)}
    >${s?H`<span class="extra-prefix">${s}</span> `:""}<span class="extra-value"
        >${n}</span
      ></button>`}if(!(c||l||d||h))return"";const m=H`${c?H`<span class="label-name">${r}</span>`:""}${l?H`<span class="label-state">${l}</span>`:""}${d?H`<span class="label-state derived">${d}</span>`:""}`;return H`<div class="label">${s?H`${m}${p}`:H`${p}${m}`}</div>`}function Ms(e,t,i,o=!1){const s=[];s.push({key:"solar",icon:t.icons.solar??_s.solar,color:e.solar.available&&e.solar.w>0?t.colors.solar:"var(--el-line)",label:Oe("node.solar",i),derived:e.solar.derived,value:xs(e.solar,i,t),available:e.solar.available,entity:e.solar.derived?void 0:e.solar.entity??(1===t.solarSources.length?t.solarSources[0].entity:void 0),detail:e.solar.derived?void 0:"solar",partial:ys(e.solar.missing,t,i)});const n=e.grid,r=ps(n,t.flow.minW),a=o&&void 0!==t.gridStatus;s.push({key:"grid",icon:t.icons.grid??_s.grid,color:a?"var(--el-error)":bs(n,"grid_import","grid_export",t),label:Oe(a||"none"===r?"node.grid":"positive"===r?"node.grid_import":"node.grid_export",i),derived:n.derived,value:a?Oe("node.no_grid",i):n.available?yo(Math.abs(n.net),i,t.power):Oe("state.unavailable",i),available:a||n.available,outage:a,partial:ys(n.missing,t,i),entity:a?t.gridStatus?.entity:ms(n,t.flow.minW),detail:a||n.derived?void 0:"grid"}),s.push({key:"house",icon:t.icons.house??_s.house,color:t.colors.house,label:Oe("node.house",i),derived:e.house.derived,value:xs(e.house,i,t),available:e.house.available,entity:e.house.derived?void 0:e.house.entity,partial:ys(e.house.missing,t,i),detail:e.house.derived?void 0:"house"});const l=e.battery;if(l){const o=ps(l,t.flow.minW),n=t.sources.batterySoc,r=n?i.states[n]:void 0;s.push({key:"battery",icon:ws(e.soc,t.icons.battery),color:bs(l,"battery_discharge","battery_charge",t),label:Oe("positive"===o?"node.battery_discharging":"negative"===o?"node.battery_charging":"node.battery",i),derived:l.derived,value:l.available?yo(Math.abs(l.net),i,t.power):Oe("state.unavailable",i),available:l.available,socValue:e.soc.available?ko(r,i):void 0,socPercent:e.soc.available?Math.max(0,Math.min(100,e.soc.w)):void 0,socFillColor:e.soc.available?Ae(e.soc.w,t.colors.socStops,Me):void 0,entity:ms(l,t.flow.minW),detail:l.derived?void 0:"battery",socEntity:n,partial:ys(l.missing,t,i)})}return t.energy&&function(e,t,i,o){const s=i.energy?.roles??{},n=Cs(i.layout),r=Oe("state.unavailable",o),a=(e,t,n,a,l)=>({arrow:e,color:Ne(i,t),text:null===n?r:yo(n,o,i.power),entity:l,mark:s[a]}),l=(e,t,o,s)=>Math.max(e,t)<i.flow.minW?"var(--el-line)":i.colors[e>=t?o:s];for(const r of e){if("solar"===r.key&&(r.mark=s.solar),"house"===r.key&&(r.mark=s.house),"grid"===r.key){const e=t.grid,c=e.available?e.positive:null,d=e.available?e.negative:null;if(r.label=Oe("node.grid",o),r.crossed=r.outage,r.outage=!1,r.icon=i.icons.grid??_s.grid,r.color=l(c??0,d??0,"grid_import","grid_export"),"single"===i.sources.grid.kind){const t=e.available?e.net:null,i=(t??0)<0,o=a(i?n.export:n.import,i?"grid_export":"grid_import",null===t?null:Math.abs(t),i?"export":"import",e.entityPositive??e.entityNegative);o.mark=zs(s.import,s.export),r.detail="grid",r.figures={lower:o},r.entity=o.entity,r.value=o.text;continue}r.detail="grid",r.figures={upper:a(n.import,"grid_import",c,"import",e.entityPositive),lower:a(n.export,"grid_export",d,"export",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}if("battery"===r.key&&t.battery){const e=t.battery,s=e.available?e.positive:null,c=e.available?e.negative:null;if(r.label=Oe("node.battery",o),r.color=l(s??0,c??0,"battery_discharge","battery_charge"),r.socValue=void 0,r.socPercent=void 0,r.socEntity=void 0,r.icon=i.icons.battery??"mdi:battery","single"===i.sources.battery.kind){r.noFigure=!0,r.value="",r.entity=e.entityPositive??e.entityNegative;continue}r.detail="battery",r.figures={upper:a(n.discharge,"battery_discharge",s,"discharge",e.entityPositive),lower:a(n.charge,"battery_charge",c,"charge",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}}}(s,e,t,i),s}const Es={"→":{box:"0 0 18 12",d:"M1.5 6 H16 M12 2.2 L16 6 L12 9.8",shape:"wide"},"←":{box:"0 0 18 12",d:"M16.5 6 H2 M6 2.2 L2 6 L6 9.8",shape:"wide"},"↓":{box:"0 0 12 18",d:"M6 1.5 V16 M2.2 12 L6 16 L9.8 12",shape:"tall"},"↑":{box:"0 0 12 18",d:"M6 16.5 V2 M2.2 6 L6 2 L9.8 6",shape:"tall"},"↘":{box:"0 0 16 16",d:"M2 2 L14 14 M14 7.5 V14 H7.5",shape:"square"},"↖":{box:"0 0 16 16",d:"M14 14 L2 2 M2 8.5 V2 H8.5",shape:"square"},"↗":{box:"0 0 16 16",d:"M2 14 L14 2 M7.5 2 H14 V8.5",shape:"square"},"↙":{box:"0 0 16 16",d:"M14 2 L2 14 M2 7.5 V14 H8.5",shape:"square"}};function Cs(e){switch(e){case"square_right":return{import:"↘",export:"↖",discharge:"↗",charge:"↙"};case"square_left":return{import:"↗",export:"↙",discharge:"↖",charge:"↘"};default:return{import:"→",export:"←",discharge:"↑",charge:"↓"}}}function zs(e,t){return e?t&&t.tier>e.tier?t:e:t}function Ps(e){const t=Es[e.arrow]??Es["→"];return H`<div class="value figure ${vs(e.mark)}" title=${e.mark?.note??""}>
    <svg
      class="arrow ${"tall"===t.shape?"vertical":"square"===t.shape?"diagonal":""}"
      data-arrow=${e.arrow}
      viewBox=${t.box}
      aria-hidden="true"
      style="color:${e.color}"
    >
      ${V`<path d=${t.d}></path>`}
    </svg>
    ${e.text}
  </div>`}function Ws(e,t,i,o){return t.nodes[e.key].inside?.position!==o||e.figures?"":function(e,t,i){const o=t.nodes[e.key].inside;if(!o)return H``;const s=t.extraColors[`${e.key}_inside`];return H`<div class="extra-inside extra" style=${$s(o,s,"--el-value-size")}>${Eo(i.states[o.entity],i,o.decimals)}</div>`}(e,t,i)}const Ns=new Set(["solar_battery","grid_battery","battery_house","battery_grid"]);function Fs(e,t,i,o,s=[],n=123,r=!1,a=!1,l=56,c=!1,d){const h=Ms(e,t,i,r),u=Bo(t.layout,t.flow.lines,null!==e.battery),p=e.battery?Lo:Lo.filter(e=>!Ns.has(e)),m=[..."hide"===t.flow.inactiveLines?p.filter(e=>o.has(e)):p].sort((e,t)=>Number(o.has(e))-Number(o.has(t)));return H`
    <div class="cross ${null===e.battery?"no-battery":""}">
      <div class="plot">
        <svg viewBox="0 0 ${u.viewW} ${u.viewH}" aria-hidden="true">
          ${c?V`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${Ko(u,l)}></path>
            </clipPath>
          </defs>`:j}
          <g clip-path=${c?"url(#el-holes)":j}>
          ${m.map(e=>V`<path
                class="link ${o.has(e)?"active":`inactive-${t.flow.inactiveLines}`}"
                style=${o.has(e)?`stroke:${o.get(e)}`:""}
                d=${u.paths[e]}
              ></path>`)}
            <g class="dots"></g>
          </g>
        </svg>
        ${h.map(e=>{const o=function(e,t){const i=e.nodePos[t];return{left:100*i.x/e.viewW+"%",top:100*i.y/e.viewH+"%"}}(u,e.key),r=u.labelAbove[e.key],l=(e,t)=>i=>{t?fs(i.currentTarget,{node:t,entity:e}):e&&gs(i.currentTarget,e)},c=("house"===e.key?s:"solar"===e.key?d?.segments??[]:[]).some(e=>e.share>0);return H`
          <div
            class="node ${e.key} ${c?"has-ring":""} ${r?"label-above":""} ${u.ground===e.key?"label-ground":""} ${e.outage?"outage":""} ${t.energy?"in-period":""}"
            style="left:${o.left};top:${o.top};border-color:${c?"transparent":e.color}"
          >
            ${"house"===e.key?ns(s,s.length>0,n,t.ring.animation,a):""}
            ${"solar"===e.key&&d?ns(d.segments,!0,n,t.ring.animation,a,d.layout):""}
            ${void 0!==e.socPercent?H`<div class="fill-clip">
                    <div
                      class="fill"
                      style="height:${e.socPercent}%;background:${e.socFillColor}"
                    ></div>
                  </div>`:""}
            ${e.socValue?H`<div class="value">${e.socValue}</div>`:""}
            ${e.figures?.upper?Ps(e.figures.upper):""}
            ${Ws(e,t,i,"above")}
            ${e.outage||e.crossed?H`<div class="icon-cross">
                    <ha-icon
                      .icon=${e.icon}
                      style="color:${e.crossed?"var(--el-error)":e.color}"
                    ></ha-icon>
                    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
                      <path d="M3,3 L21,21"></path>
                      <path d="M21,3 L3,21"></path>
                    </svg>
                  </div>`:H`<ha-icon .icon=${e.icon} style="color:${e.color}"></ha-icon>`}
            ${e.noFigure?"":e.figures?Ps(e.figures.lower):H`<div
                    class="value ${e.available?"":"unavailable"} ${vs(e.mark)} ${e.partial?"warn2":""}"
                    title=${e.partial??e.mark?.note??""}
                  >${e.value}</div>`}
            ${Ws(e,t,i,"below")}
            ${r?As(e,t,i,l,r):""}
            ${function(e,t,i,o,s="solar"===e.key){const n=t.nodes[e.key],r=n.label?"-2px":"-22px",a=s?r:"-22px",l=s?"-22px":r,c="above"!==n.inside?.position||t.energy?void 0:n.inside,d=e.figures?.upper?.entity?{entity:e.figures.upper.entity,text:e.figures.upper.text}:e.socEntity&&"battery"!==e.detail?{entity:e.socEntity,text:e.socValue??""}:c?{entity:c.entity,text:Eo(i.states[c.entity],i,c.decimals)}:void 0;if(d){const t="height:max(44px, calc(50% + 2px))";return H`
      <button
        class="hit upper"
        style=${c&&n.label?`top:${a};bottom:auto;${t};z-index:3`:`top:${a}`}
        aria-label=${`${e.label} ${d.text}`}
        @click=${o(d.entity,e.figures?.upper?e.detail:void 0)}
      ></button>
      <button
        class="hit lower"
        style=${!s&&n.label?`top:auto;bottom:${l};${t}`:`bottom:${l}`}
        aria-label=${e.value?`${e.label} ${e.value}`:e.label}
        @click=${o(e.entity,e.detail)}
        ?disabled=${!e.entity&&!e.detail}
      ></button>
    `}if(!e.entity&&!e.detail)return"";const h=e.socValue?`, ${e.socValue}`:"";return H`<button
    class="hit"
    style="top:${a};bottom:${l}"
    aria-label=${e.value?`${e.label} ${e.value}${h}`:`${e.label}${h}`}
    @click=${o(e.entity,e.detail)}
  ></button>`}(e,t,i,l,r)}
            ${r?"":As(e,t,i,l,r)}
          </div>
          `})}
      </div>
    </div>
  `}function Ls(e,t,i){if("current"===e)return Oe("view.now",i);return Oe("view.average",i,{minutes:"avg_short"===e?t.view.avgShortMinutes:t.view.avgLongMinutes})}function Rs(e,t,i){return"ArrowRight"===e||"ArrowDown"===e?(t+1)%i:"ArrowLeft"===e||"ArrowUp"===e?(t-1+i)%i:"Home"===e?0:"End"===e?i-1:-1}function Os(e,t,i,o,s,n=!1,r=""){const a=e=>{n||e===o||s(e)};return H`<div
    class="quick-group ${n?"off":""}"
    role="radiogroup"
    data-quick=${e}
    aria-label=${t}
    aria-disabled=${n?"true":"false"}
    title=${n?r:""}
  >
    ${i.map((e,t)=>H`<button
        class="quick-option ${t===o?"selected":""} ${e.late?"late":""}"
        role="radio"
        aria-checked=${t===o?"true":"false"}
        tabindex=${t===(o<0?0:o)?0:-1}
        aria-label=${e.aria}
        title=${n?r:e.title??""}
        @click=${()=>a(t)}
        @keydown=${e=>((e,t)=>{const o=Rs(e.key,t,i.length);if(o<0)return;if(e.preventDefault(),n)return;const s=e.currentTarget.parentElement;a(o),setTimeout(()=>s?.querySelectorAll('[role="radio"]')[o]?.focus(),0)})(e,t)}
      >
        ${e.label}
      </button>`)}
  </div>`}function Ts(e,t,i,o,s,n,r,a,l,c){const d=e.view.modes.length>1,h=void 0!==a&&e.consumers.length>0&&e.list.scope.length>1,u=void 0!==l&&(l.waiting||l.labels.length>1),p=!0===l?.inPeriod,m=p?u?j:H`<div class="mode-note ${l?.late?"late":""}" title=${l?.title??""}>
          ${Oe("energy.fixed",t,{period:l?.active??""})}
        </div>`:d||"current"===o?j:H`<div class="mode-note">${Ls(o,e,t)}</div>`,f=u&&!(e.view.expanded.includes("energy_periods")&&l?.waiting);if(!(i||d||f||c||h||m!==j))return j;const g=new Set(e.view.expanded),_=e=>Oe(`editor.${e}`,t),w=Oe(r?"list.filter_on":"list.show_all",t),y=h?g.has("scope")?Os("scope",_("group_scope"),[{label:H`<ha-icon .icon=${"mdi:filter-outline"}></ha-icon>`,aria:Oe("editor.scope_filtered",t),title:Oe("editor.scope_filtered",t)},{label:H`<ha-icon .icon=${"mdi:filter-off-outline"}></ha-icon>`,aria:Oe("editor.scope_full",t),title:Oe("editor.scope_full",t)}],r?1:0,()=>a?.()):H`<button
        class="filter-toggle ${r?"on":""}"
        aria-pressed=${r?"true":"false"}
        aria-label=${w}
        title=${w}
        @click=${a}
      >
        <ha-icon .icon=${r?"mdi:filter-off-outline":"mdi:filter-outline"}></ha-icon>
      </button>`:j,v=e.view.modes,b=d?g.has("modes")?Os("modes",_("group_smoothing"),v.map(i=>({label:Ls(i,e,t),aria:Ls(i,e,t),title:i===o&&s?Oe("view.since",t,{time:s}):""})),v.indexOf(o),e=>n(v[e]),p,Oe("view.off_in_period",t)):function(e,t,i,o,s,n=!1){const r=e.view.modes,a=r[(r.indexOf(i)+1)%r.length],l=n?Oe("view.off_in_period",t):Oe("view.chip",t,{mode:Ls(i,e,t),next:Ls(a,e,t)});return H`<button
    class="mode-chip view-chip"
    aria-disabled=${n?"true":"false"}
    aria-label=${l}
    title=${n?l:o?Oe("view.since",t,{time:o}):""}
    @click=${()=>{n||s(a)}}
  >
    ${r.map(o=>H`<span class="mode-label ${o===i?"active":""}" aria-hidden="true"
        >${Ls(o,e,t)}</span
      >`)}
  </button>`}(e,t,o,s,n,p):j,x=u&&l?g.has("energy_periods")?l.waiting?j:Os("energy_periods",_("group_energy"),l.options.map(e=>({label:e.label,aria:e.label,title:e.title,late:e.late})),l.selected,l.onSelect):function(e){const t=e.labels.includes(e.active)?e.labels:[...e.labels,e.active];return e.waiting?H`<button class="mode-chip energy-chip waiting" aria-hidden="true" tabindex="-1">
      ${t.map(t=>H`<span class="mode-label ${t===e.active?"active":""}">${t}</span>`)}
    </button>`:H`<button
    class="mode-chip energy-chip ${e.late?"late":""}"
    aria-label=${e.ariaLabel}
    title=${e.title}
    @click=${e.onCycle}
  >
    ${t.map(t=>H`<span class="mode-label ${t===e.active?"active":""}" aria-hidden="true"
        >${t}</span
      >`)}
  </button>`}(l):j,k=c?g.has("pv_scales")?Os("pv_scales",_("group_pv_scale"),c.labels.map((e,t)=>({label:e,aria:e,title:c.titles[t]})),c.selected,c.onSelect):H`<button
    class="mode-chip energy-chip pv-scale-chip"
    aria-label=${($=c).ariaLabel}
    title=${$.title}
    @click=${$.onCycle}
  >
    ${$.labels.map(e=>H`<span class="mode-label ${e===$.active?"active":""}" aria-hidden="true"
        >${e}</span
      >`)}
  </button>`:j;var $;return H`
    <div class="header">
      ${i?H`<div class="title">${i}</div>`:H`<span></span>`}
      <div class="controls qs-${e.view.quickStyle.replace("_","-")}">
        ${b}
        ${m}
        ${x}
        ${k}
        ${y}
      </div>
    </div>
  `}const Ds="enerlens-card-gone",qs="ha-chart-base",Is=5e3,Bs=36e5,Hs={today:0,"24h":24,"48h":48,"7d":168},Vs={today:"energy.today","24h":"energy.24h","48h":"detail.48h","7d":"energy.7d"};function Ks(e,t,i,o=[]){if(e.startsWith("consumer:")){const o=t.consumers.find(t=>`consumer:${t.key}`===e),s=o?i?.states?.[o.entity]?.attributes?.friendly_name:void 0,n=o?.name??s??o?.entity??"";return o?{title:n,layout:"single",series:[{entity:o.entity,name:n,color:o.color,sign:1,role:"house"}],soc:o.charge?.soc,socLabel:o.charge?.label}:{title:n,series:[],layout:"single"}}if(e.startsWith("source:")){const o=t.solarSources.find(t=>`source:${t.key}`===e),s=o?.name??(o?i?.states?.[o.entity]?.attributes?.friendly_name:void 0)??o?.entity??"";return o?{title:s,layout:"single",series:[{entity:o.entity,name:s,color:o.color,sign:1,role:"solar",invert:o.invert}]}:{title:s,series:[],layout:"single"}}const s=Oe(`node.${e}`,i),n={title:s,series:[],layout:"mirrored"};if("solar"===e){const e=t.solarSources,o=t.sources.solar;if("single"===o.kind||"sum"===o.kind&&1===e.length){const i="single"===o.kind?void 0:e[0];return{title:s,layout:"single",series:[{entity:"single"===o.kind?o.entity:i?.entity??"",name:s,color:i?.color??t.colors.solar,sign:1,role:"solar",invert:"single"===o.kind?o.invert:i?.invert,roles:["solar"]}]}}return"sum"!==o.kind||e.length<2?n:{title:s,layout:"stacked",series:e.map(e=>({entity:e.entity,name:e.name??i?.states?.[e.entity]?.attributes?.friendly_name??e.entity,color:e.color,sign:1,role:"solar"})),parts:e.map(e=>({entity:e.entity,invert:e.invert,quiet:!0}))}}if("rest"===e){const e=t.sources.house,s=t.list.restLabel||Oe("list.rest",i);if("single"!==e.kind)return{title:s,series:[],layout:"total"};const n=t.solarSources.filter(e=>e.excluded);return{title:s,layout:"total",series:[{entity:e.entity,name:s,color:"var(--secondary-text-color)",sign:1,role:"house"}],parts:[{entity:e.entity,invert:e.invert,quiet:!1},...n.map(e=>({entity:e.entity,invert:e.invert,quiet:!0})),...o.map(e=>({entity:e,invert:!1,quiet:!0,minus:!0}))]}}if("house"===e){const e=t.sources.house,i=t.solarSources.filter(e=>e.excluded);return"single"!==e.kind?n:0===i.length?{title:s,layout:"single",series:[{entity:e.entity,name:s,color:t.colors.house,sign:1,role:"house",invert:e.invert,roles:["house"]}]}:{title:s,layout:"total",series:[{entity:e.entity,name:s,color:t.colors.house,sign:1,role:"house"}],parts:[{entity:e.entity,invert:e.invert,quiet:!1},...i.map(e=>({entity:e.entity,invert:e.invert,quiet:!0}))]}}const r="grid"===e?t.sources.grid:t.sources.battery,a=Cs(t.layout);if("single"===r.kind){const i="grid"===e,o=i?"grid_import":"battery_discharge",n=i?"grid_export":"battery_charge";return{title:s,layout:"single",series:[{entity:r.entity,name:s,color:t.colors[o],downColor:t.colors[n],sign:1,role:i?"import":"discharge",invert:r.invert,roles:i?["import","export"]:["discharge","charge"],arrows:i?{up:a.import,down:a.export,upColor:Ne(t,o),downColor:Ne(t,n)}:void 0,noFigure:!i}],soc:i?void 0:t.sources.batterySoc}}if("split"!==r.kind)return n;const[l,c]="grid"===e?["import","export"]:["discharge","charge"],d=(o,s,n)=>{const r="grid"===e?`grid_${o}`:`battery_${o}`;return{entity:s,name:Oe(`detail.${o}`,i),color:t.colors[r],arrow:a[o],arrowColor:Ne(t,r),sign:n,role:o}};return{title:s,layout:"mirrored",series:[d(l,r.positive,1),d(c,r.negative,-1)],soc:"battery"===e?t.sources.batterySoc:void 0}}async function js(e,t,i,o,s="hour"){const n=function(e,t,i,o){const s=e.map(e=>[Math.max(e.t,t),null===e.v?null:o(e.v)]),n=s.at(-1);return n&&n[0]<i&&s.push([i,n[1]]),s}((await ge(e,[t],Math.ceil((o-i)/6e4),2e4))[t]??[],i,o,e=>e),r=n[0]?.[0]??o;if(r-i<=Bs)return{line:n,band:[]};const a=await e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),end_time:new Date(r).toISOString(),statistic_ids:[t],period:s,types:["min","max"]}),l=(a?.[t]??[]).filter(e=>null!==e.min&&null!==e.max&&e.start<r).map(e=>({start:e.start,min:e.min,max:e.max}));return{line:n,band:l}}function Us(e){return H`${e.map((e,t)=>0===t?H`${e}`:H`<br />${e}`)}`}function Zs(e,t){if(!t)return;let i=0,o=!1;for(const s of e){const e=t.meanW(s.entity);if(null===e){if(s.quiet)continue;return null}s.minus||(o=!0);const n=s.invert?-e:e;i+=s.minus?-n:n}return o?i:null}function Qs(e,t,i){const o=i?.meanW(e);return null==o?o:t?.find(t=>t.entity===e)?.invert?-o:o}class Gs extends ce{constructor(){super(...arguments),this._open=!1,this._period=null,this._power=!1,this._range="24h",this._busy=!1,this._ticket=0,this._shown=[],this._loaded=!1,this._onCardGone=e=>{e.detail===this._params?.card&&this.closeDialog()},this._renew=!1,this._renewed=new Set}async showDialog(e){clearInterval(this._timer),this._params=e,this._open=!0,this._view=void 0,this._chart=void 0,this._socChart=void 0,this._drawn=void 0,this._busy=!1,this._giveWayTo=void 0,this._loaded=!1,window.addEventListener(Ds,this._onCardGone);const t=e.card.detailState();this._period=t?.period??null,this._power=null===this._period,this._range="24h",this._load(),this._timer=setInterval(()=>{this._load()},3e5),await this.updateComplete}closeDialog(){return this._open=!1,customElements.get("ha-adaptive-dialog")||this._closed(),!0}_closed(){const e=this._params;if(!e)return;const t=e.origin;window.removeEventListener(Ds,this._onCardGone),clearInterval(this._timer),this._timer=void 0,this._ticket++,this._params=void 0,this._open=!1,this.dispatchEvent(new CustomEvent("dialog-closed",{detail:{dialog:ci},bubbles:!0,composed:!0}));const i=this._giveWayTo;this._giveWayTo=void 0,i?gs(e.card,i):t?.focus()}get _hass(){return this.hass??this._params?.card.hass}async _chartReady(){const e=qs;if(customElements.get(e))return!0;let t;this._pullChart().catch(e=>console.warn(e));try{return await Promise.race([customElements.whenDefined(e).then(()=>!0),new Promise(e=>{t=setTimeout(()=>e(!1),Is)})])}finally{clearTimeout(t)}}async _pullChart(){const e=await(window.loadCardHelpers?.()),t=this._params,i=t?.card.detailState(),o=t?.entity??(t&&i?Ks(t.node,i.config).series[0]?.entity:void 0);if(!e||!o)return;const s=e.createCardElement({type:"statistics-graph",entities:[o],days_to_show:1});s.hass=this._hass,s.style.display="none",this.renderRoot.appendChild(s),await customElements.whenDefined("ha-chart-base"),s.remove()}_giveWay(){const e=this._params;e&&(this._giveWayTo=e.entity,this.closeDialog())}async _load(e=!1){const t=this._params,i=this._hass,o=t?.card.detailState();if(!t||!i||!o)return;const s=++this._ticket,n=()=>s===this._ticket;e&&(this._busy=!0);try{const e=!this._power&&this._period,s=this._powerRange(i);this._shown=o.shown??[];const r=Ks(t.node,o.config,i,this._shown),a=e?t.card.detailEnergy(e):async function(e,t,i,o){let s;const n=new Promise((e,t)=>{s=setTimeout(()=>t(new Error("EnerLens: five-minute statistics did not answer")),2e4)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(i).toISOString(),end_time:new Date(o).toISOString(),statistic_ids:t,period:"5minute",types:["mean","min","max"],units:{power:"W"}}),n])??{}}finally{clearTimeout(s)}}(i,(r.parts??r.series).map(e=>e.entity),s.from,Date.now());a.catch(()=>{});const l=await this._chartReady();if(!n())return;if(!l)return void this._giveWay();let c,d="hour";const h={period:this._period,range:this._range};if(e){const e=await a;if(!n())return;if(!this._loaded&&"single"===r.layout&&null===e.meanW(r.series[0]?.entity??""))return void this._giveWay();this._view=e,this._drawEnergy(e);const t=e.detail;if(t){const e=("hour"===t.step?Bs:24*Bs)/2;c={from:t.axisFrom,to:t.axisTo,min:t.axisFrom-e,max:t.axisTo+e},d=t.step}}else{const e=await a;if(!n())return;if(!this._loaded&&"single"===r.layout&&!e[r.series[0]?.entity??""]?.length)return void this._giveWay();h.power={range:s,rows:e},this._drawPower(s,e),c={...s,min:s.from,max:s.to}}const u=r.soc;if(u&&c){const e=await js(i,u,c.from,Math.min(c.to,Date.now()),d);if(!n())return;h.soc={data:e,min:c.min,max:c.max},this._drawSoc(e,c.min,c.max)}this._drawn=h,this._loaded=!0,this._renew=!1,this._renewed.clear()}catch(e){console.warn(e),n()&&!this._loaded?this._giveWay():n()&&this._drawn&&(this._period=this._drawn.period,this._range=this._drawn.range,this._renew=!1,this._renewed.clear())}finally{n()&&(this._busy=!1)}}_pick(e){e!==this._period&&(this._period=e,this._renew=!0,this._renewed.clear(),this._load(!0))}_pickRange(e){e!==this._range&&(this._range=e,this._renew=!0,this._renewed.clear(),this._load(!0))}_powerRange(e){const t=Date.now();if("today"!==this._range)return{from:t-Hs[this._range]*Bs,to:t};const i=lo(e),o=Ti("today",t,i,ao(e));return{from:o,to:qi("today",o,t,i)}}_drawPower(e,t){const i=this._params,o=this._hass,s=i?.card.detailState();if(!i||!o||!s)return;const n=Ks(i.node,s.config,o,this._shown);if("total"===n.layout&&n.parts)return void this._drawTotal(n,n.parts,e,t);if("stacked"===n.layout&&n.parts)return void this._drawStacked(n,n.parts,e,t);const r=n.series,a=s.config.power,l="mirrored"===n.layout,c=e=>`${!l&&e<0?"−":""}${yo(Math.abs(e),o,a)}`,d=r.flatMap(e=>{const i=(t[e.entity]??[]).map(t=>e.invert?{...t,mean:null===t.mean?null:-t.mean,min:null===t.max?null:-t.max,max:null===t.min?null:-t.min}:t),o=this._paint(e.color),s=t=>0===t?0:e.sign*t,n=t=>null===t.min||null===t.max?null:e.sign>0?t.min:s(t.max),r={stack:`band-${e.role}`,stackStrategy:"all",showSymbol:!1};return[{...r,name:`${e.role}-low`,type:"line",lineStyle:{opacity:0},data:i.map(e=>[e.start,n(e)])},{...r,name:`${e.role}-span`,type:"line",lineStyle:{opacity:0},areaStyle:{color:o,opacity:.2},data:i.map(e=>[e.start,null===e.min||null===e.max?null:e.max-e.min])},{id:e.entity,name:e.name,type:"line",showSymbol:!1,lineStyle:{width:1.5},itemStyle:{color:o},data:i.map(e=>[e.start,null===e.mean?null:s(e.mean)])}]}),h=this._chartFor("_chart","power");h.options={xAxis:{type:"time",min:e.from,max:e.to},yAxis:{type:"value",axisLabel:{formatter:c}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,formatter:e=>{const t=Array.isArray(e)?e:[e],i=e=>t.find(t=>t.seriesName===e)?.value[1],o=r.map(e=>{const t=i(e.name),o=i(`${e.role}-low`),s=i(`${e.role}-span`);if(null==t)return`${e.name}: —`;if(null==o||null==s)return`${e.name}: ${c(t)}`;const[n,r]=l?[Math.abs(o),Math.abs(o+s)].sort((e,t)=>e-t):[o,o+s];return`${e.name}: ${c(t)} (${c(n)} – ${c(r)})`});return Us([t[0]?.axisValueLabel??"",...o])}}},h.data=d,this.requestUpdate()}_drawStacked(e,t,i,o){const s=this._hass,n=this._params?.card.detailState();if(!s||!n)return;const r=t.map(e=>new Map((o[e.entity]??[]).map(e=>[e.start,e.mean]))),a=[...new Set(r.flatMap(e=>[...e.keys()]))].sort((e,t)=>e-t),l=t.map((e,t)=>a.map(i=>{const o=r[t].get(i);return null==o?0:e.invert?-o:o})),c=e=>`${e<0?"−":""}${yo(Math.abs(e),s,n.config.power)}`,d=this._paint("var(--secondary-text-color)"),h=this._chartFor("_chart","power");h.options={xAxis:{type:"time",min:i.from,max:i.to},yAxis:{type:"value",axisLabel:{formatter:c}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?c(e):"—"}},h.data=[...e.series.map((e,t)=>{const i=this._paint(e.color);return{id:e.entity,name:e.name,type:"line",stack:"pv",showSymbol:!1,lineStyle:{width:0},itemStyle:{color:i},areaStyle:{color:i,opacity:.85},data:a.map((e,i)=>[e,l[t][i]])}}),{id:"sum",name:e.title,type:"line",showSymbol:!1,z:10,lineStyle:{width:.8,color:d},itemStyle:{color:d},data:a.map((e,t)=>[e,l.reduce((e,i)=>e+i[t],0)])}],this.requestUpdate()}_drawTotal(e,t,i,o){const s=this._hass,n=this._params?.card.detailState(),r=e.series[0];if(!s||!n||!r)return;const a=t.map(e=>new Map((o[e.entity]??[]).map(e=>[e.start,e.mean]))),l=[...new Set(a.flatMap(e=>[...e.keys()]))].sort((e,t)=>e-t),c=l.map(e=>{let i=0;for(const[o,s]of t.entries()){const t=a[o].get(e);if(null==t){if(s.quiet)continue;return[e,null]}const n=s.invert?-t:t;i+=s.minus?-n:n}return[e,i]}),d=e=>`${e<0?"−":""}${yo(Math.abs(e),s,n.config.power)}`,h=this._paint(r.color),u=this._chartFor("_chart","power");u.options={xAxis:{type:"time",min:i.from,max:i.to},yAxis:{type:"value",axisLabel:{formatter:d}},legend:{show:!1},grid:{left:64,right:16,top:16,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?d(e):"—"}},u.data=[{id:r.entity,name:r.name,type:"line",showSymbol:!1,lineStyle:{width:1.5},itemStyle:{color:h},data:c}],this.requestUpdate()}_drawSoc(e,t,i){const o=this._hass;if(!o)return;const s=this._params,n=s?.card.detailState(),r=s&&n?Ks(s.node,n.config,o,this._shown):void 0,a=r?.socLabel||Oe("detail.soc",o),l=this._paint("var(--secondary-text-color)"),c=this._paint("var(--divider-color)"),d=e=>`${Math.round(e)} %`,h=[];e.band.length>0&&h.push({name:"min",type:"line",stack:"band",step:"end",showSymbol:!1,lineStyle:{opacity:0},data:e.band.map(e=>[e.start,e.min])},{name:"max",type:"line",stack:"band",step:"end",showSymbol:!1,lineStyle:{opacity:0},areaStyle:{color:l,opacity:.25},data:e.band.map(e=>[e.start,e.max-e.min])}),h.push({name:a,type:"line",step:"end",showSymbol:!1,lineStyle:{width:1.5,color:l},itemStyle:{color:l},areaStyle:{color:c,opacity:.6},data:e.line});const u=this._chartFor("_socChart","soc");u.height="160px",u.options={xAxis:{type:"time",min:t,max:i},yAxis:{type:"value",min:0,max:100,interval:50,axisLabel:{formatter:d}},legend:{show:!1},grid:{left:this._power?64:48,right:16,top:12,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,formatter:e=>{const t=Array.isArray(e)?e:[e],i=t.find(e=>"min"===e.seriesName)?.value[1],o=t.find(e=>"max"===e.seriesName)?.value[1],s=t.find(e=>e.seriesName===a)?.value[1],n=null!=s?d(s):null!=i&&null!=o?`${d(i)} – ${d(i+o)}`:"—";return Us([t[0]?.axisValueLabel??"",`${a}: ${n}`])}}},u.data=h,this.requestUpdate()}_chartFor(e,t){this._renew&&!this._renewed.has(e)&&(this._renewed.add(e),this[e]=void 0);const i=this[e]??document.createElement(qs);return i.className=`chart ${t}`,i.hass=this._hass,i.height="300px",this[e]=i,i}_paint(e){const t=document.createElement("span");t.style.color=e,this.renderRoot.appendChild(t);const i=getComputedStyle(t).color;return t.remove(),i&&!i.includes("var(")?i:Ee(e)??e}_drawEnergy(e){const t=this._params,i=this._hass,o=t?.card.detailState(),s=e.detail;if(!(t&&i&&o&&s))return;const n=lo(i),r=Ks(t.node,o.config,i,this._shown),a=r.series,l=[];for(let e=s.axisFrom;e<s.axisTo;)l.push(e),e="hour"===s.step?e+Bs:Di(e+36*Bs,"day",n);const c=a.map(e=>{const t=new Map((e=>{if(e.roles){const[t,i]=e.roles,o=new Map((s.bars[t]??[]).map(e=>[e.start,{...e}]));for(const e of i?s.bars[i]??[]:[]){const t=o.get(e.start);o.set(e.start,{start:e.start,wh:(t?.wh??0)-e.wh,filledShare:Math.max(t?.filledShare??0,e.filledShare)})}return[...o.values()]}if("stacked"===r.layout||"single"===r.layout)return s.entityBars[e.entity]??[];if("total"!==r.layout||!r.parts)return s.bars[e.role]??[];const t=new Map;let i;for(const o of r.parts){const n=o.entity===e.entity?s.bars[e.role]:s.entityBars[o.entity];if(!n&&!o.quiet)return[];const r=n??[];o.quiet||(i=new Set(r.map(e=>e.start)));for(const e of r){const i=t.get(e.start);t.set(e.start,{start:e.start,wh:(i?.wh??0)+(o.minus?-e.wh:e.wh),filledShare:Math.max(i?.filledShare??0,e.filledShare)})}}return[...t.values()].filter(e=>!i||i.has(e.start))})(e).map(e=>[e.start,e]));return{id:e.entity,name:e.name,type:"bar",stack:"pair",barMaxWidth:28,itemStyle:{color:this._paint(e.color),borderRadius:2},data:l.map((i,o)=>{const n=t.get(i),a=i+((l[o+1]??s.axisTo)-i)/2;if(!n)return[a,null];const c="mirrored"===r.layout?Math.max(0,n.wh):n.wh,d=[a,e.sign*c/1e3],h=e.downColor&&c<0?{color:this._paint(e.downColor)}:{},u=Ii(n.filledShare)>0?{opacity:.45}:{};return Object.keys(h).length||Object.keys(u).length?{value:d,itemStyle:{...h,...u}}:d})}}),d=new Intl.NumberFormat(xo(i),{maximumFractionDigits:1}),h="mirrored"===r.layout,u=this._chartFor("_chart","energy");u.options={xAxis:{type:"time",min:s.axisFrom,max:s.axisTo},yAxis:{type:"value",name:"kWh",axisLabel:{formatter:e=>d.format(h?Math.abs(e):e)}},legend:{show:!1},grid:{left:48,right:16,top:32,bottom:28,containLabel:!1},tooltip:{trigger:"axis",confine:!0,valueFormatter:e=>"number"==typeof e?`${!h&&e<0?"−":""}${vo(1e3*Math.abs(e),i)}`:""}},u.data=c,this.requestUpdate()}updated(e){if(!e.has("hass"))return;const t=this.hass?.themes?.darkMode,i=this._dark;if(this._dark=t,void 0===i||i===t||!this._drawn)return;const o=this._drawn;o.power?this._drawPower(o.power.range,o.power.rows):this._view&&this._drawEnergy(this._view),o.soc&&this._drawSoc(o.soc.data,o.soc.min,o.soc.max)}shouldUpdate(e){return e.has("_params")||e.has("_open")||void 0!==this._params}_chips(e,t,i,o){const s=this._hass;if(e.length<2)return j;const n=Math.max(0,null===t?0:e.indexOf(t));return H`<div class="chips" role="radiogroup" aria-label=${Oe("detail.periods",s)}>
      ${e.map((s,r)=>H`<button
          class="chip"
          role="radio"
          aria-checked=${s===t?"true":"false"}
          tabindex=${r===n?0:-1}
          @click=${()=>o(s)}
          @keydown=${t=>((t,i)=>{const s=Rs(t.key,i,e.length);if(s<0)return;t.preventDefault();const n=t.currentTarget.parentElement;o(e[s]),setTimeout(()=>n?.querySelectorAll('[role="radio"]')[s]?.focus(),0)})(t,r)}
        >${i(s)}</button>`)}
    </div>`}_renderContent(e){const t=this._params,i=this._hass;if(!t||!i)return j;const o=this._power?void 0:this._view,s=Ks(t.node,e.config,i,this._shown),n=s.series,r=o?.marks.roles,a=s.soc,l=e=>t=>gs(t.currentTarget,e);return H`
      ${this._power?this._chips(Object.keys(Hs),this._range,e=>Oe(Vs[e],i),e=>this._pickRange(e)):this._chips(e.periods,this._period,e=>Oe(`energy.${e}`,i),e=>this._pick(e))}
      <div class="sums ${this._busy?"busy":""}">
        ${"stacked"===s.layout&&s.parts?H`<span class="sum total ${r?.solar&&r.solar.tier>0?`warn${r.solar.tier}`:""}"
                title=${r?.solar?.note??""}
                >${s.title}${o?H` <b>${function(e,t,i){return null==e?"—":vo(Math.max(0,e*t.hours),i)}(Zs(s.parts,o),o,i)}</b>`:j}</span
              >`:j}
        ${n.map(e=>{const n="total"===s.layout&&s.parts?Zs(s.parts,o):"stacked"===s.layout?Qs(e.entity,s.parts,o):e.invert?Qs(e.entity,[{entity:e.entity,invert:!0,quiet:!0}],o):o?.meanW(e.entity),a=e.arrows&&!this._power&&o&&null!=n?n<0?{text:e.arrows.down,color:e.arrows.downColor}:{text:e.arrows.up,color:e.arrows.upColor}:void 0,c=this._power||e.noFigure?void 0:o&&null!=n?e.arrows?vo(Math.abs(n*o.hours),i):e.roles?vo(n*o.hours,i):"single"===s.layout?`${n<0?"−":""}${vo(Math.abs(n*o.hours),i)}`:vo(Math.max(0,n*o.hours),i):"—",d=e.roles?[r?.[e.roles[0]],e.roles[1]?r?.[e.roles[1]]:void 0].reduce((e,t)=>t&&(!e||t.tier>e.tier)?t:e,void 0):"stacked"===s.layout||"single"===s.layout?o?.marks.consumers[e.entity]:"rest"===t.node?o?.marks.rest:r?.[e.role];return"total"===s.layout?H`<span
              class="sum total ${d&&d.tier>0?`warn${d.tier}`:""}"
              title=${d?.note??""}
              >${e.name}${c?H` <b>${c}</b>`:j}</span
            >`:H`<button
            class="sum ${d&&d.tier>0?`warn${d.tier}`:""}"
            title=${d?.note??""}
            aria-label=${Oe("detail.open",i,{name:c?`${e.name} ${c}`:e.name})}
            @click=${l(e.entity)}
          >${a?H`<span style="color:${a.color}">${a.text}</span> `:e.arrow?H`<span style="color:${e.arrowColor}">${e.arrow}</span> `:"stacked"===s.layout?H`<span class="swatch" style="background:${e.color}"></span>`:j}${e.name}${c?H` <b>${c}</b>`:j}</button>`})}
      </div>
      ${this._power?H`<div class="note">${Oe("mirrored"===s.layout||"single"===s.layout?"detail.aggregation":"detail.mean",i)}</div>`:j}
      ${o?.lateStart?H`<div class="late">
            ${Oe("energy.late",i,{date:po(o.from,i,"hour"===o.detail?.step)})}
          </div>`:j}
      <div class="charts ${this._busy?"busy":""}">
        ${this._chart??H`<div class="loading" role="progressbar" aria-busy="true"></div>`}
        ${a&&this._socChart?H`<button
                class="sum soc-name"
                aria-label=${Oe("detail.open",i,{name:s.socLabel||Oe("detail.soc",i)})}
                @click=${l(a)}
              >${s.socLabel||Oe("detail.soc",i)}</button>
              ${this._socChart}`:j}
      </div>
    `}render(){if(!this._params)return H``;const e=this._hass,t=this._params.card.detailState(),i=t?Ks(this._params.node,t.config,e,this._shown).title:Oe(`node.${this._params.node}`,e);return H`
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
    `}}Gs.properties={hass:{attribute:!1},_params:{state:!0},_open:{state:!0},_period:{state:!0},_range:{state:!0},_view:{state:!0},_busy:{state:!0}},Gs.styles=n`
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
  `,customElements.get(ci)||customElements.define(ci,Gs);const Ys=new Set(["unavailable","unknown",""]);function Js(e){return/^[-+]?(\d+\.?\d*|\.\d+)$/.test(e)?Number(e):void 0}function Xs(e,t){if(void 0===e)return;const i=De(e);if(Ys.has(i))return;if(t.invalid)return!1;if("="===t.operator||"!="===t.operator){const e=Js(i),o=(t.values??[]).some(t=>{const o=Js(t);return void 0!==e&&void 0!==o?e===o:t===i});return"="===t.operator?o:!o}const o=Js(i),s=t.limit;if(void 0===o||void 0===s)return!1;switch(t.operator){case">":return o>s;case"<":return o<s;case">=":return o>=s;default:return o<=s}}class en{constructor(){this.answers=new Map}static keyOf(e,t){return JSON.stringify([e.key,t.entity,t.operator,t.values,t.limit])}observe(e,t){for(const i of t){const t=i.hold;if("condition"!==t?.kind)continue;const o=Xs(e.states[t.entity]?.state,t);void 0!==o&&this.answers.set(en.keyOf(i,t),o)}}held(e,t){const i=e.hold;return!!i&&("always"===i.kind||!t&&(this.answers.get(en.keyOf(e,i))??!1))}}const tn=Object.freeze({mW:.001,W:1,kW:1e3,MW:1e6,GW:1e9,TW:1e12}),on={solar:{kind:"absent"},grid:{kind:"absent"},battery:{kind:"absent"},house:{kind:"absent"}},sn=new Set;function nn(e,t){sn.has(e)||(sn.add(e),console.warn(`[enerlens-card] ${t}`))}function rn(e){if("string"!=typeof e||""===e.trim())return null;const t=Number(e);return Number.isFinite(t)?t:null}function an(e,t){const i=e?.states?.[t];if(!i)return null;const o=rn(i.state);if(null===o)return null;const s=i.attributes?.unit_of_measurement;if("string"==typeof s&&""!==s){const e=tn[s];return"number"==typeof e?o*e:(nn(`${t}|unit`,`${t}: unknown power unit "${s}", value ignored`),null)}return"power"===i.attributes?.device_class?(nn(`${t}|assume-w`,`${t}: no unit_of_measurement, assuming W`),o):(nn(`${t}|no-unit`,`${t}: neither unit_of_measurement nor device_class "power", value ignored`),null)}function ln(e){const t=Math.max(0,e),i=Math.max(0,-e);return{positive:t,negative:i,net:t-i}}function cn(e,t){if("single"===e.kind){const i=t(e.entity);return null===i?null:ln(e.invert?-i:i)}if("split"===e.kind){const i=t(e.positive),o=t(e.negative);if(null===i||null===o)return null;const s=Math.max(0,i),n=Math.max(0,o);return{positive:s,negative:n,net:s-n}}return null}function dn(e){return"single"===e.kind?{positive:e.entity,negative:e.entity}:"split"===e.kind?{positive:e.positive,negative:e.negative}:{}}function hn(e,t,i){return null===e?{available:!1,entity:t,derived:i}:{available:!0,w:e,entity:t,derived:i}}function un(e,t,i){return null===e?{available:!1,entityPositive:t.positive,entityNegative:t.negative,derived:i}:{available:!0,positive:e.positive,negative:e.negative,net:e.net,entityPositive:t.positive,entityNegative:t.negative,derived:i}}function pn(e,t){if(!t)return{available:!1,derived:!1};const i=e?.states?.[t];return hn(i?rn(i.state):null,t,!1)}function mn(e,t,i,o,s){return fn(e,t,t=>an(e,t),i,o,s)}function fn(e,t,i,o,s,n){const r=e=>{try{const t=i(e);return"number"==typeof t&&Number.isFinite(t)?t:null}catch{return null}},a=t?.sources??on,{solar:l,grid:c,battery:d,house:h}=a,u="derived"===h.kind||"absent"===h.kind,p="absent"===d.kind,m=(t?.solarSources??[]).map(t=>{const i=r(t.entity);return{key:t.key,entity:t.entity,name:t.name??e?.states?.[t.entity]?.attributes?.friendly_name??t.entity,color:t.color,icon:t.icon,kwp:t.kwp,excluded:t.excluded,reading:hn(null===i?null:t.invert?-i:i,t.entity,!1)}}),f="sum"===l.kind?function(e,t,i){const o=t?.flow?.minW??0;let s=0,n=!1;const r=[];for(const t of e){if(t.reading.available){s+=t.reading.w,n=!0;continue}const e=i?.get(t.entity);void 0!==e&&(e>=o?r.push(t.name):n=!0)}return n?{value:ln(s),missing:r.length>0?r:void 0}:{value:null}}(m,t,s):void 0,g=f?.missing,_=f?f.value:cn(l,r),w=cn(c,r),y=p?null:cn(d,r),v=u?null:cn(h,r),b=u?[]:m.filter(e=>e.excluded),x=b.length>0,k=v&&x?ln(v.net+b.reduce((e,t)=>e+(t.reading.available?t.reading.w:0),0)):v,$=_?.net??null,S=w?.net??null,A=k?.net??null,M=p?0:y?.net??null,E=(e,t,i,o)=>null===e||null===t||null===i?null:o(e,t,i),C=u?E($,S,M,(e,t,i)=>Math.max(0,e+t+i)):null,z="derived"===l.kind?E(A,S,M,(e,t,i)=>Math.max(0,e-t-i)):null,P="derived"===c.kind?E(A,$,M,(e,t,i)=>e-t-i):null,W="derived"===d.kind?E(A,$,S,(e,t,i)=>e-t-i):null,N=e=>g?{...e,missing:g}:e,F="derived"===l.kind?hn(z,void 0,!0):N(hn(_?.net??null,dn(l).positive,!1)),L=u?N(hn(C,void 0,!0)):hn(k?.net??null,dn(h).positive,!1),R=x?{...L,corrected:!0}:L,O="derived"===c.kind?N(un(null===P?null:ln(P),{},!0)):un(w,dn(c),!1);let T=null;"derived"===d.kind?T=N(un(null===W?null:ln(W),{},!0)):p||(T=un(y,dn(d),!1));const D=(t?.consumers??[]).map(t=>{const i=e?.states?.[t.entity],s=i?.attributes?.friendly_name;return{key:t.key,entity:t.entity,name:t.name??s??t.entity,color:t.color,minW:t.minW,icon:t.icon,reading:hn(r(t.entity),t.entity,!1),charge:t.charge&&o?{...o(t.charge),entity:t.charge.soc,label:t.charge.label}:void 0,held:n?.(t)??"always"===t.hold?.kind,position:t.position}});return{solar:F,solarSources:m,grid:O,battery:T,soc:pn(e,a.batterySoc),house:R,consumers:D}}function gn(e,t){const i=function(e){const t=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(t){const e=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1],i=Number.parseInt(e,16);return[i>>16&255,i>>8&255,255&i]}const i=e.match(/^rgba?\(([^)]+)\)/i);if(!i)return;const o=i[1].split(/[,\s/]+/).map(Number);return o.length<3||o.slice(0,3).some(e=>!Number.isFinite(e))?void 0:[o[0],o[1],o[2]]}(e);if(!i)return e;return`rgb(${i.map(e=>Math.round(e+(255-e)*t)).join(",")})`}function _n(e){const t=e.dot/2,i=[{r:t,colour:e.colour,opacity:1,forward:0}],o=Math.floor(e.caps);if(o<=0||e.core<=0||e.coreLight<=0)return i;const s=1-.15**(1/o);for(let n=1;n<=o;n++){const r=n/o,a=1-r*(1-e.core);i.push({r:t*a,colour:gn(e.mixFrom??e.colour,e.coreLight*r),opacity:s,forward:e.bias*t*(1-a)})}return i}const wn=[3,8],yn=[[0,.55],[.3,.42],[.62,.12],[1,0]];function vn(e,t,i,o){if(1!==e||t<=0)return"";const s=t/60;return wn.map(e=>`drop-shadow(0 0 ${(e*s*o).toFixed(1)}px ${i})`).join(" ")}function bn(e){const t=e/60;return yn.map(([e,i])=>[e,Math.min(i*t,1)])}function xn(e){const t=e.match(/rgba?\(([^)]+)\)/i);if(!t)return;const i=t[1].split(/[,\s/]+/).map(Number);if(i.length<3||i.slice(0,3).some(e=>!Number.isFinite(e)))return;if(i.length>=4&&Number.isFinite(i[3])&&i[3]<.1)return;const[o,s,n]=i;return(.2126*o+.7152*s+.0722*n)/255}function kn(e,t){return"dark"===t||"light"!==t&&function(e){if("function"!=typeof getComputedStyle)return!0;const t=getComputedStyle(e),i=xn(t.backgroundColor);if(void 0!==i)return i<.5;const o=xn(t.color);return void 0===o||o>.5}(e)}function $n(e,t){if("function"!=typeof getComputedStyle||"undefined"==typeof document)return t;const i=document.createElement("span");if(i.style.display="none",i.style.color=t,""===i.style.color)return t;e.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o&&!o.includes("var(")?o:void 0}const Sn="http://www.w3.org/2000/svg",An=400;function Mn(e,t){return 1===t?e:e.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi,e=>String(Number((Number(e)/t).toFixed(2))))}const En="http://www.w3.org/2000/svg",Cn=5e3;class zn{constructor(e,t){this.container=e,this.technique=t,this.links=new Map,this.paused=!1,this.scale=1,this.dark=!0,this.pathZoom=1,this.dotScale=1,this.paths=Fo}setScale(e){!Number.isFinite(e)||e<=0||e===this.scale||(this.scale=e,this.repaint())}setDotScale(e){!Number.isFinite(e)||e<=0||e===this.dotScale||(this.dotScale=e,this.repaint())}setPaths(e){if(e!==this.paths){this.paths=e;for(const[e,t]of this.links)for(const i of t.dots)i.el.style.offsetPath=this.offsetPath(e)}}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const[e,t]of this.links)for(const i of t.dots)i.el.style.offsetPath=this.offsetPath(e)}}setDesign(e,t){e===this.design&&t===this.dark||(this.design=e,this.dark=t,this.repaint())}update(e,t,i){const o=new Set;for(const s of e){o.add(s.connection);const e=this.links.get(s.connection)??this.createLink(s),n=t.flow.dotColor??t.colors[s.colorKey],r=e.colour!==n;e.colour=n,r&&(e.mixFrom="");const a=e.mixFrom?void 0:$n(this.container,n);a&&(e.mixFrom=a);const l=r||void 0!==a,c=this.phaseOf(e.dots[0]);for(;e.dots.length>s.count;){const t=e.dots.pop();t?.animation?.cancel(),t?.el.remove()}for(;e.dots.length<s.count;)e.dots.push(this.createDot(e,s,e.dots.length,s.count,i,c));const d=5/Math.max(s.durationS,.01);for(const[t,o]of e.dots.entries())l&&this.paint(e,o),this.canAnimate(o,i)?(o.animation?o.animation.playbackRate=d:o.animation=this.startAnimation(e,o,t,s.count,c),this.setPhase(o.animation,t,s.count,c)):(o.animation?.cancel(),o.animation=void 0,o.el.style.offsetDistance=100*t/s.count+"%");l&&this.applyGlow(e),e.durationS=s.durationS,e.colorKey=s.colorKey,e.count=s.count}for(const[e,t]of this.links)if(!o.has(e)){for(const e of t.dots)e.animation?.cancel(),e.el.remove();t.group.remove(),this.links.delete(e)}}pause(){if(!this.paused){this.paused=!0;for(const e of this.links.values())for(const t of e.dots)t.animation?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.links.values())for(const t of e.dots)t.animation?.play()}}destroy(){for(const e of this.links.values()){for(const t of e.dots)t.animation?.cancel(),t.el.remove();e.group.remove()}this.links.clear(),this.defs?.remove(),this.defs=void 0}ground(){if(this.design)return this.dark?this.design.dark:this.design.light}repaint(){for(const e of this.links.values()){for(const t of e.dots)this.paint(e,t);this.applyGlow(e)}}createLink(e){const t=document.createElementNS(En,"g");this.container.appendChild(t);const i={group:t,dots:[],durationS:e.durationS,colorKey:e.colorKey,colour:"",mixFrom:"",count:0};return this.links.set(e.connection,i),i}canAnimate(e,t){return"waapi"===this.technique&&t&&"function"==typeof e.el.animate}offsetPath(e){return`path("${Mn(this.paths[e],this.pathZoom)}")`}phaseOf(e){const t=e?.animation?.currentTime;return"number"!=typeof t?0:(t%Cn+Cn)%Cn/Cn}setPhase(e,t,i,o){e.currentTime=(o+t/i)%1*Cn}createDot(e,t,i,o,s,n=0){const r=document.createElementNS(En,"g");r.setAttribute("class","dot"),r.style.offsetPath=this.offsetPath(t.connection),r.style.offsetRotate="auto",r.style.offsetDistance=(n+i/o)%1*100+"%",e.group.appendChild(r);const a={el:r};return this.paint(e,a),this.canAnimate(a,s)&&(a.animation=this.startAnimation(e,a,i,o,n)),a}startAnimation(e,t,i,o,s=0){const n=t.el.animate([{offsetDistance:"0%"},{offsetDistance:"100%"}],{duration:Cn,iterations:Number.POSITIVE_INFINITY,easing:"linear"});return n.playbackRate=5/Math.max(e.durationS,.01),this.setPhase(n,i,o,s),this.paused&&n.pause(),n}paint(e,t){for(;t.el.firstChild;)t.el.removeChild(t.el.firstChild);const i=this.ground(),o=e.colour,s=(i?.dot??10)/2/this.scale*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const e=document.createElementNS(En,"circle");e.setAttribute("r",(3.4*s).toFixed(2)),e.setAttribute("fill",`url(#${this.haloGradient(o,i)})`),t.el.appendChild(e)}for(const n of _n({dot:2*s,caps:this.design?.shape.caps??0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:o,mixFrom:e.mixFrom||o})){const e=document.createElementNS(En,"circle");e.setAttribute("cx",n.forward.toFixed(2)),e.setAttribute("r",n.r.toFixed(2)),e.setAttribute("fill",n.colour),n.opacity<1&&e.setAttribute("fill-opacity",n.opacity.toFixed(3)),t.el.appendChild(e)}}applyGlow(e){const t=this.ground();e.group.style.filter=t?vn(t.glow,t.glowStrength,e.colour,this.dotScale/this.scale):""}haloGradient(e,t){const i=`el-halo-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(En,"defs"),this.container.appendChild(this.defs)),!this.defs.querySelector(`#${CSS.escape(i)}`)){const o=document.createElementNS(En,"radialGradient");o.setAttribute("id",i);for(const[i,s]of bn(t.glowStrength)){const t=document.createElementNS(En,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(s)),o.appendChild(t)}this.defs.appendChild(o)}return i}}const Pn="http://www.w3.org/2000/svg",Wn=5e3;let Nn=0;class Fn{constructor(e){this.svg=e,this.lines=new Map,this.holeId="el-fan-hole-"+ ++Nn,this.reverse=!1,this.paused=!1,this.dotRadius=5,this.dark=!0,this.pathZoom=1,this.dotScale=1}setDesign(e,t){if(e!==this.design||t!==this.dark){this.design=e,this.dark=t;for(const e of this.lines.values())e.paintKey=void 0}}setDotColor(e){if(e!==this.dotColor){this.dotColor=e;for(const e of this.lines.values())e.paintKey=void 0}}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const e of this.lines.values())e.dotPath=void 0}}ground(){return this.dark?this.design?.dark:this.design?.light}update(e,t,i,o,s){const n=`${i.width} ${i.height}`;n!==this.size&&(this.size=n,this.svg.setAttribute("viewBox",`0 0 ${n}`),this.svg.setAttribute("width",String(i.width)),this.svg.setAttribute("height",String(i.height)));const r=this.holeClip(s,i),a=r!==this.clip;this.clip=r;const l=new Set;for(const i of e){l.add(i.key);const e=this.route?this.route(t,i):this.pathFor(t,i),s=!this.lines.has(i.key),n=this.lines.get(i.key)??this.createLine(i.key);if(e!==n.d&&(n.d=e,n.path.setAttribute("d",e)),a||s)for(const e of[n.path,n.group])r?e.setAttribute("clip-path",r):e.removeAttribute("clip-path");const c=i.inactive?void 0:this.ground(),d=i.fade??1,h=[i.inactive,i.color,c?.line,d].join("|");for(h!==n.look&&(n.look=h,n.path.setAttribute("class","fan-line"+(i.inactive?` inactive-${i.inactive}`:"")),n.path.style.stroke=i.inactive?"":i.color,n.path.style.opacity=c?String(c.line/100*d):"",n.path.style.setProperty("--el-fade",String(d)),n.group.style.opacity=d<1?String(d):"");n.dots.length>i.count;)n.dots.pop()?.remove(),n.animations.pop()?.cancel();for(;n.dots.length<i.count;)n.dots.push(this.createDot(n,i.key));const u=this.dotColor??i.color,p=[u,this.dotRadius,this.dotScale,c?this.design?.id:"",this.dark].join("|"),m=n.paintKey!==p;n.paintKey=p,m&&(n.mixFrom=void 0);const f=void 0===n.mixFrom?$n(this.svg,u):void 0;f&&(n.mixFrom=f);const g=m||void 0!==f,_=n.mixFrom??u;g&&this.applyGlow(n,u,c);const w=n.count!==i.count,y=Mn(e,this.pathZoom),v=y!==n.dotPath;n.dotPath=y;const b=this.reverse?"auto 180deg":"auto",x=5/Math.max(i.durationS,.01);for(const[e,t]of n.dots.entries()){if(!g&&t.firstChild||this.paintDot(t,u,c,_),!v&&t.style.offsetPath||(t.style.offsetPath=`path("${y}")`),t.style.offsetRotate!==b&&(t.style.offsetRotate=b),!o||"function"!=typeof t.animate){n.animations[e]?.cancel(),n.animations[e]=void 0,t.style.offsetDistance=100*e/i.count+"%";continue}let s=n.animations[e];if(!s){const i=[{offsetDistance:"0%"},{offsetDistance:"100%"}];s=t.animate(this.reverse?i.reverse():i,{duration:Wn,iterations:Number.POSITIVE_INFINITY,easing:"linear"}),n.animations[e]=s,this.paused&&s.pause()}s.playbackRate!==x&&(s.playbackRate=x),!w&&n.animations[e]||(s.currentTime=Wn*e/i.count)}n.count=i.count}for(const[e,t]of this.lines)if(!l.has(e)){for(const e of t.animations)e?.cancel();for(const e of t.dots)e.remove();t.group.remove(),t.path.remove(),this.lines.delete(e)}}pathFor(e,t){const i=t.x-e.x,o=Math.min(160,Math.max(40,.6*i)),s=e.x+Math.min(o,i),n=o/2,r=e=>e.toFixed(1);return`M${r(e.x)},${r(e.y)} C${r(e.x+n)},${r(e.y)} ${r(s-n)},${r(t.y)} ${r(s)},${r(t.y)} L${r(t.x)},${r(t.y)}`}createLine(e){const t=document.createElementNS(Pn,"path");t.setAttribute("class","fan-line"),t.setAttribute("fill","none"),t.dataset.key=e,this.svg.appendChild(t);const i=document.createElementNS(Pn,"g");this.svg.appendChild(i);const o={path:t,group:i,dots:[],animations:[],count:0};return this.lines.set(e,o),o}holeClip(e,t){if(!(e&&e.r>0))return;this.defs||(this.defs=document.createElementNS(Pn,"defs"),this.svg.appendChild(this.defs));let i=this.defs.querySelector(`#${this.holeId} path`);if(!i){const e=document.createElementNS(Pn,"clipPath");e.setAttribute("id",this.holeId),e.setAttribute("clipPathUnits","userSpaceOnUse"),i=document.createElementNS(Pn,"path"),i.setAttribute("clip-rule","evenodd"),e.appendChild(i),this.defs.appendChild(e)}const{width:o,height:s}=t,n=`M${-o},${-s}H${2*o}V${2*s}H${-o}Z${Ro(e.x,e.y,e.r)}`;return i.getAttribute("d")!==n&&i.setAttribute("d",n),`url(#${this.holeId})`}haloGradient(e,t){const i=`fan-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Pn,"defs"),this.svg.appendChild(this.defs)),!this.defs.querySelector(`#${i}`)){const o=document.createElementNS(Pn,"radialGradient");o.setAttribute("id",i);for(const[i,s]of bn(t.glowStrength)){const t=document.createElementNS(Pn,"stop");t.setAttribute("offset",String(i)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(s)),o.appendChild(t)}this.defs.appendChild(o)}return i}applyGlow(e,t,i){e.group.style.filter=i?vn(i.glow,i.glowStrength,t,this.dotScale):""}paintDot(e,t,i,o){for(;e.firstChild;)e.removeChild(e.firstChild);const s=(i?i.dot/2:this.dotRadius)*this.dotScale;if(i&&2===i.glow&&i.glowStrength>0){const o=document.createElementNS(Pn,"circle");o.setAttribute("r",(3.4*s).toFixed(2)),o.setAttribute("fill",`url(#${this.haloGradient(t,i)})`),e.appendChild(o)}for(const n of _n({dot:2*s,caps:i?this.design?.shape.caps??0:0,core:(i?.core??0)/100,coreLight:(i?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:t,mixFrom:o})){const t=document.createElementNS(Pn,"circle");t.setAttribute("cx",n.forward.toFixed(2)),t.setAttribute("r",n.r.toFixed(2)),t.setAttribute("fill",n.colour),n.opacity<1&&t.setAttribute("fill-opacity",n.opacity.toFixed(3)),e.appendChild(t)}}createDot(e,t){const i=document.createElementNS(Pn,"g");return i.setAttribute("class","fan-dot"),i.dataset.key=t,e.group.appendChild(i),i}setDotRadius(e){this.dotRadius=e}setDotScale(e){Number.isFinite(e)&&e>0&&(this.dotScale=e)}pause(){if(!this.paused){this.paused=!0;for(const e of this.lines.values())for(const t of e.animations)t?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.lines.values())for(const t of e.animations)t?.play()}}destroy(){for(const e of this.lines.values()){for(const t of e.animations)t?.cancel();for(const t of e.dots)t.remove();e.group.remove(),e.path.remove()}this.lines.clear(),this.defs?.remove(),this.defs=void 0,this.clip=void 0}}const Ln=e=>e.toFixed(1);function Rn(e,t,i,o=10){const s=0===t.y?0:o,n={x:e.x+t.x*s,y:e.y+t.y*s},r=i.x<n.x?-1:1,a=Math.abs(i.x-n.x),l=Math.min(160,Math.max(40,.6*a)),c=n.x+r*Math.min(l,a),d=l/2;return`${s>0?`M${Ln(e.x)},${Ln(e.y)} L${Ln(n.x)},${Ln(n.y)}`:`M${Ln(e.x)},${Ln(e.y)}`} C${Ln(n.x+Math.abs(t.x)*r*d)},${Ln(n.y+t.y*d)} ${Ln(c-r*d)},${Ln(i.y)} ${Ln(c)},${Ln(i.y)} L${Ln(i.x)},${Ln(i.y)}`}function On(e,t,i,o,s,n,r={x:o,y:0},a=10){const l=o=>t.some(t=>function(e,t=24){const i=[],o=e.match(/[MLC]|-?\d+(?:\.\d+)?/g)??[];let s={x:0,y:0},n=0;const r=()=>Number(o[n++]);for(;n<o.length;){const e=o[n++];if("M"===e)s={x:r(),y:r()},i.push(s);else if("L"===e){const e={x:r(),y:r()};for(let o=1;o<=t;o++){const n=o/t;i.push({x:s.x+(e.x-s.x)*n,y:s.y+(e.y-s.y)*n})}s=e}else if("C"===e){const e={x:r(),y:r()},o={x:r(),y:r()},n={x:r(),y:r()};for(let r=1;r<=t;r++){const a=r/t,l=1-a;i.push({x:l*l*l*s.x+3*l*l*a*e.x+3*l*a*a*o.x+a*a*a*n.x,y:l*l*l*s.y+3*l*l*a*e.y+3*l*a*a*o.y+a*a*a*n.y})}s=n}}return i}(Tn(e,r,o,{x:i,y:t},a)).some(e=>s.some(t=>Math.hypot(e.x-t.x,e.y-t.y)<t.r)||(n?.(e.x,e.y)??!1))),c=i-8*o;let d=e.x;for(;o*(c-d)>0&&l(d);)d+=2*o;return o*(d-c)>0?c:d}function Tn(e,t,i,o,s=10){const n=o.x<e.x?-1:1;if(n*(i-e.x)<1)return Rn(e,t,o,s);const r=0===t.y?0:s,a={x:e.x+t.x*r,y:e.y+t.y*r},l=Math.max(0,n*(i-a.x)),c=n*Math.min(20,l/2),d=r>0?`L${Ln(a.x)},${Ln(a.y)} C${Ln(a.x+c)},${Ln(a.y)} ${Ln(i-c)},${Ln(a.y)} ${Ln(i)},${Ln(a.y)}`:`L${Ln(i)},${Ln(a.y)}`,h=function(e,t,i){return Math.max(8,Math.min(i*(t-e),160))}(i,o.x,n),u=n*(h/2),p=i+n*h;return`M${Ln(e.x)},${Ln(e.y)} ${d} C${Ln(i+u)},${Ln(a.y)} ${Ln(p-u)},${Ln(o.y)} ${Ln(p)},${Ln(o.y)} L${Ln(o.x)},${Ln(o.y)}`}function Dn(e,t){if(t.height>e.bottom-e.top)return 0;const i=Math.min(e.bottom-t.height,Math.max(e.top,t.node-t.height/2));return Math.round(i-t.top)}function qn(e,t){return e.isRest?e.name||Oe("list.rest",t):e.name}function In(e,t="house"){return H`<ha-icon
    class="origin-icon"
    aria-hidden="true"
    .icon=${e.icons[t]??_s[t]}
    style="color:${e.colors[t]}"
  ></ha-icon>`}function Bn(e){return e<=4?40:e<=7?34:28}function Hn(e,t,i,o,s,n=[],r=!1){const a=t.list.enabled;if(!a&&(0===n.length||r))return j;const l=Vn(e,t,n);return H`
    <div class="list ${s?"stacked":""}" style="--el-row-h:${Bn(l)}px">
      ${t.list.title?H`<p class="list-title">${t.list.title}</p>`:j}
      ${n.length>0&&!r?Kn(n,t,i,o,s):j}
      ${a?function(e,t,i,o,s){return H`
      <div class="rows">
        ${s?In(t):j}
        ${ss(e.entries,e=>e.key,e=>jn(e,t,i,o,s,!1))}
      </div>
  `}(e,t,i,o,s):j}
    </div>
  `}function Vn(e,t,i){return(t.list.enabled?e.entries.length:0)+i.length}function Kn(e,t,i,o,s){return H`<div class="pv-rows">
    ${s?In(t,"solar"):j}
    ${ss(e,e=>e.key,e=>jn(e,t,i,o,s,!0))}
  </div>`}function jn(e,t,i,o,s,n){{const r=e.charge,a=function(e,t){return!t.energy&&void 0!==e.charge?.soc&&(e.powerUnknown||e.w<t.flow.minW)}(e,t),l=a&&void 0!==r?.soc?$o(r.soc,i):e.powerUnknown?"—":yo(e.w,i,t.power),c=r?function(e,t){const i=e.label||Oe("list.charge_label",t);if(void 0===e.soc)return Oe("list.charge_unknown",t,{label:i});const o=$o(e.soc,t);return e.stale&&void 0!==e.since?Oe("list.charge_stale",t,{label:i,value:o,time:So(e.since,t)}):Oe("list.charge",t,{label:i,value:o})}(r,i):"",d=t.energy?e.isRest?t.energy.rest:t.energy.consumers[e.entity??""]:void 0,h=d&&d.tier>0?`warn${d.tier}`:"",u=e.isRest?"single"===t.sources.house.kind?"rest":void 0:e.entity?n?`source:${e.key}`:`consumer:${e.key}`:void 0,p=t=>r?H`<button
                  class="soc-hit ${t}"
                  title=${c}
                  aria-label=${`${qn(e,i)}: ${c}`}
                  @click=${t=>u?o(e.entity,t,u):o(r.entity,t)}
                ></button>`:j;return H`
            <div
              class="row ${n?"pv":""} ${e.isRest?"rest":""} ${r?"charge":""} ${r?.stale?"stale":""}"
              data-key=${e.key}
            >
              ${s?H`<span class="lane" aria-hidden="true"></span>`:j}
              ${r?H`<span class="swatch ${e.icon?"icon":"dot"}" style="color:${e.color}"
                      >${function(e){const t=11.2,i=2*Math.PI*t,o=void 0===e?0:i*Math.max(0,Math.min(100,e))/100;return H`<svg class="charge-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="track" cx="12" cy="12" r=${t}></circle>
    ${o>0?V`<circle
          class="fill"
          cx="12"
          cy="12"
          r=${t}
          stroke-dasharray=${`${o.toFixed(2)} ${i.toFixed(2)}`}
          transform="rotate(-90 12 12)"
        ></circle>`:j}
  </svg>`}(r.soc)}${e.icon?H`<ha-icon .icon=${e.icon}></ha-icon>`:j}${p("mark")}</span
                    >`:e.icon?H`<ha-icon class="swatch icon" .icon=${e.icon} style="color:${e.color}"></ha-icon>`:H`<span class="swatch dot" style="color:${e.color}"></span>`}
              <span class="name">${qn(e,i)}</span>
              <span class="row-value ${a?"soc":""} ${h}" title=${d?.note??""}
                >${l}${a?p("value"):j}</span
              >
              ${e.entity||u?H`<button
                    class="row-hit"
                    title=${d?.note??""}
                    aria-label=${`${qn(e,i)} ${e.powerUnknown?"—":yo(e.w,i,t.power)}`}
                    @click=${t=>o(e.entity??"",t,u)}
                  ></button>`:j}
            </div>
          `}}class Un{constructor(){this.positions=new Map,this.targets=new Map}static top(e,t){return e.getBoundingClientRect().top-t.getBoundingClientRect().top}capture(e){if(this.positions.clear(),this.blockTop=void 0,!e)return;const t=e.querySelector(".rows");t&&(this.blockTop=Un.top(t,e));for(const t of e.querySelectorAll(".row")){const i=t.dataset.key;i&&this.positions.set(i,Un.top(t,e))}}play(e,t){if(!e)return;const i=t&&"function"==typeof Element.prototype.animate,o=new Set,s=e.querySelector(".rows"),n=s&&void 0!==this.blockTop?this.blockTop-Un.top(s,e):0,r=e.querySelector(".row")?.getBoundingClientRect().height||28,a=this.positions.size>0?n:Math.max(-r,Math.min(r,n));for(const t of e.querySelectorAll(".row")){const s=t.dataset.key;if(!s)continue;o.add(s);const n=this.positions.get(s),r=Un.top(t,e),l=Un.runningGlide(t);if(l&&this.targets.get(s)===r)continue;if(this.targets.set(s,r),void 0===n){if(i){t.animate([{opacity:0,transform:`translateY(${a}px)`},{opacity:1,transform:`translateY(${.45*a}px)`,offset:.33},{opacity:1,transform:"none"}],{duration:Qn,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=Zn}continue}const c=n-r;if(!c||!i)continue;l?.cancel();t.animate([{transform:`translateY(${c}px)`},{transform:"none"}],{duration:Qn,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=Zn}for(const e of[...this.targets.keys()])o.has(e)||this.targets.delete(e);this.positions.clear()}gliding(e){if(!e)return!1;for(const t of e.querySelectorAll(".row"))if(Un.runningGlide(t))return!0;return!1}static runningGlide(e){if("function"==typeof e.getAnimations)return e.getAnimations().find(e=>e.id===Zn&&("running"===e.playState||"pending"===e.playState))}}const Zn="enerlens-glide",Qn=600;function Gn(e,t){const i=function(e){return!Number.isFinite(e)||e<=0?1:Math.sqrt(Math.min(e,1))}(e),o=e=>Math.round(1e3*e)/1e3;return{dot:o(t.dotSize/100*i),line:o(t.lineWidth/100*i)}}function Yn(e,t,i){if(e.solarSources.length<2)return[];const o=[];for(const s of e.solarSources){if(!s.reading.available)continue;const e=s.reading.w;!i&&e<t.minConsumerW||o.push({key:s.key,name:s.name,w:e,color:s.color,entity:s.entity,icon:s.icon,threshold:t.minConsumerW,isRest:!1})}return o.sort((e,t)=>t.w-e.w)}function Jn(e,t,i,o){const s=e.solarSources.filter(e=>e.reading.available&&e.reading.w>0&&yi({w:e.reading.w,threshold:t.minConsumerW},t)),n=e=>{const t=o?.indexOf(e)??-1;return-1===t?Number.POSITIVE_INFINITY:t},r=e=>e.reading.available?e.reading.w:0;s.sort((e,t)=>o&&n(e.key)-n(t.key)||r(t)-r(e));const a=s.reduce((e,t)=>e+r(t),0),l=e.solarSources.reduce((e,t)=>e+1e3*(t.kwp??0),0),c="peak"===i?Math.max(l,a):a,d=s.map(e=>({key:e.key,share:c>0?r(e)/c:0,color:e.color,entity:e.entity,isRest:!1}));if("peak"===i){const e=1-d.reduce((e,t)=>e+t.share,0);e>1e-9&&d.push({key:"__pv_free__",share:e,color:"var(--el-pv-free)",isRest:!0})}return d}class Xn{constructor(){this.last=new Map,this.asked=new Set}get values(){return this.last}observe(e,t){for(const i of t){const t=an(e,i.entity);null!==t&&this.last.set(i.entity,i.invert?-t:t)}}missing(e,t){return t.map(e=>e.entity).filter(t=>!this.asked.has(t)&&!this.last.has(t)&&null===an(e,t))}async prefill(e,t,i,o=5e3){if(0===i.length)return;for(const e of i)this.asked.add(e);const s=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(s-864e6).toISOString(),end_time:new Date(s).toISOString(),entity_ids:[...i],minimal_response:!0,no_attributes:!0});let r;n.catch(()=>{});const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error("EnerLens: PV history timed out")),o)});let l;try{l=await Promise.race([n,a])}finally{void 0!==r&&clearTimeout(r)}if(null!==l&&"object"==typeof l)for(const o of i){const i=l[o];if(!Array.isArray(i))continue;const s=e.states[o];let n;for(const t of i){if("string"!=typeof t.s)continue;const i=an({...e,states:{[o]:{...s,entity_id:o,state:t.s}}},o),r="number"==typeof t.lc?t.lc:t.lu;null!==i&&"number"==typeof r&&((!n||r>n.t)&&(n={w:i,t:r}))}const r=!0===t.find(e=>e.entity===o)?.invert;n&&!this.last.has(o)&&this.last.set(o,r?-n.w:n.w)}}}const er=n`
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
`,tr="view-mode",ir="show-all",or="energy-period",sr="pv-scale",nr=3e5,rr=Qn+400;function ar(e,t){try{localStorage.setItem(e,t)}catch{}}function lr(e){try{return localStorage.getItem(e)}catch{return null}}function cr(e){const t=Number.parseFloat(getComputedStyle(e).opacity);return Number.isNaN(t)?1:t}function dr(e,t){if(!e||!t)return e===t;const i=(e,t)=>e.length===t.length&&e.every((e,i)=>e===t[i]);return e.entity===t.entity&&i(e.outage,t.outage)&&i(e.ok,t.ok)}const hr=Object.fromEntries(Object.keys(hi).map(e=>[hi[e],{entity_id:hi[e],state:String(ui[e]),attributes:{unit_of_measurement:"W",device_class:"power"},last_changed:"",last_updated:""}])),ur=new Set,pr=e=>"object"==typeof e&&null!==e,mr=e=>!0===e.preview;function fr(e){const t=[];let i=e;for(;i;)t.unshift(i),i=i.parentNode??(i instanceof ShadowRoot?i.host:null);return t}function gr(e,t){const i=fr(e),o=fr(t);let s=0;for(;s<i.length&&s<o.length&&i[s]===o[s];)s++;return s>=i.length||s>=o.length?i.length-o.length:i[s]instanceof ShadowRoot?-1:o[s]instanceof ShadowRoot?1:i[s].compareDocumentPosition(o[s])&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}class _r extends ce{constructor(){super(...arguments),this._entityIds=[],this._chargeIds=[],this._extraIds=[],this._charge=new we,this._solarMemory=new Xn,this._chargeOf=e=>this._charge.state(this._hass,e),this._holds=new en,this._heldOf=e=>this._holds.held(e,null!==this._period),this._rows=new Un,this._lastEntries=new Map,this._lastSolar=new Map,this._mode="current",this._designsPickedUp=!1,this._ring=new ls,this._solarRing=new ls,this._fanFollowUntil=0,this._technique="static",this._visible=!0,this._stacked=!1,this._stackedWidth=0,this._settled=!1,this._showAll=!1,this._pvScale="share",this._scale=1,this._plotScale=1,this._holeR=Wo,this._seeThrough=!1,this._outagePrefilled=!1,this._energyPeriod=null,this._energyChosen=!1,this._energyViews=new Map,this._energyKey="",this._energyAsked=new Map,this._statsKey="",this._statsRemembered=!1,this._statsRetryAt=0,this._rememberPending=!1,this._onVisibility=()=>{this._syncPlayState(),"hidden"===document.visibilityState?this._pause(Date.now()):this._resume()},this._onMotionChange=()=>this.requestUpdate(),this._onTransitionEnd=e=>{const{propertyName:t,target:i}=e;if("outline-color"!==t||!(i instanceof HTMLElement))return;const o=i.classList.contains("node")?i.closest(".plot"):null;o&&this._measureHoles(o)},this._pathZoom=1,this._onWindowResize=()=>this._measurePathZoom(),this._example=!1,this._onMoreInfo=e=>{this._example&&e.stopPropagation()},this._onDetail=e=>{if(e.stopPropagation(),this._example)return;const t=e.detail,i=e.composedPath()[0];mr(this)?t.entity&&gs(i??this,t.entity):this.dispatchEvent(new CustomEvent("show-dialog",{bubbles:!0,composed:!0,detail:{dialogTag:ci,dialogImport:()=>Promise.resolve(),dialogParams:{card:this,node:t.node,origin:i,entity:t.entity}}}))}}get _period(){if(!this._energyPeriod||this._example)return null;const e=!1!==this._config?.view.power;return this.preview&&!this._energyChosen&&e?null:this._energyPeriod}_energyOffer(e){const t=e.view,i=t.energyDefault&&!0!==this._statsOk?[]:t.energyPeriods;return[...t.power?[null]:[],...i]}_statsWaiting(e){return e.view.energyDefault&&void 0===this._statsOk&&!this._example}_startEnergy(e,t){const i=this._energyOffer(e),o="power"===e.view.defaultEnergy?null:e.view.defaultEnergy;let s=i.includes(o)?o:i[0]??null;if(t&&e.view.remember&&i.length>1){const e=lr(this._memKey(or)),t=i.find(t=>(t??"kw")===e);void 0!==t&&(s=t)}this._energyPeriod=s}_applyRemembered(){const e=this._config;if(e?.view.remember){if(e.view.modes.length>1){const t=e.view.modes.find(e=>e===lr(this._memKey(tr)));t&&(this._mode=t)}if(e.list.scope.length>1){const t=lr(this._memKey(ir));"1"===t&&(this._showAll=e.list.scope.includes("full")),"0"===t&&(this._showAll=!e.list.scope.includes("filtered"))}if(e.view.pvScales.length>1){const t=e.view.pvScales.find(e=>e===lr(this._memKey(sr)));t&&(this._pvScale=t)}this._startEnergy(e,!0),this._hass&&(this._tickModel=this._modelForMode(this._hass,e))}}_memKey(e){const t=this._config?.memoryId;if(!t)return`enerlens-${e}`;const i=location.pathname.replace(/^\/+|\/+$/g,"");let o=0;return mr(this)||(o=this._rankInDashboard(t)??this._rankOnPage(t)),`enerlens:${i}:${t}${o>0?`#${o+1}`:""}:${e}`}_rankInDashboard(e){let t,i;for(const e of fr(this).reverse()){const o=e;void 0===t&&"hui-card"===o.localName&&o.config&&(t=o.config),!i&&pr(o.lovelace?.config)&&(i=o.lovelace.config)}if(void 0!==t&&i&&Array.isArray(i.views))for(const o of i.views){const i=ni(o),s=i.indexOf(t);if(-1!==s)return i.slice(0,s).filter(t=>ri(t.memory_id)===e).length}}_rankOnPage(e){const t=[...ur].filter(t=>t.isConnected&&!mr(t)&&t._config?.memoryId===e).sort(gr);return Math.max(0,t.indexOf(this))}_checkStatistics(){const e=this._config,t=this._realHass;if(!e?.view.energyDefault||!t||this._example)return;const i=to(e).join(","),o=this._statsRetryAt>0&&Date.now()>=this._statsRetryAt;(i!==this._statsKey||o)&&(this._statsKey=i,this._statsRetryAt=0,o||(this._statsOk=void 0),function(e,t){const i=to(t),o=i.join(","),s=io.get(o);if(s)return s;const n=(async()=>{if(0===i.length||"function"!=typeof e.callWS)return!1;const t=await e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:i});if(!Array.isArray(t))return!1;const o=new Set(t.filter(e=>"object"==typeof e&&null!==e).filter(e=>(1===e.mean_type||!0===e.has_mean)&&"power"===e.unit_class).map(e=>e.statistic_id));return i.every(e=>o.has(e))})().catch(e=>{io.delete(o),console.warn(e)});return io.set(o,n),n}(t,e).then(e=>{this._statsKey===i&&(void 0===e&&(this._statsRetryAt=Date.now()+3e4),this._statsOk=e??!1,!1===e&&console.warn(Oe("energy.no_statistics",t)),e&&this._config&&(this._startEnergy(this._config,!this._statsRemembered),this._statsRemembered=!0),this.requestUpdate())}))}_shownConfig(){const e=this._config,t=this._period;return t?function(e,t){const i=t?.hours??1,o=1/i;return{...e,power:{...e.power,energyHours:i},minConsumerW:e.minConsumerW*o,consumers:e.consumers.map(e=>void 0===e.minW?e:{...e,minW:e.minW*o}),energy:t?.marks??{roles:{},consumers:{},rest:{tier:0,note:""}}}}(e,this._energyViews.get(t)):e}_flowsOf(e){const t=this._period;return t?this._energyViews.get(t)?.flowsW??{}:function(e){return fi(e.solar.available?e.solar.w:0,e.grid.available?e.grid.positive:0,e.grid.available?e.grid.negative:0,e.battery?.available?e.battery.positive:0,e.battery?.available?e.battery.negative:0,e.house.available?e.house.w:0)}(e)}_cycleEnergy(){if(!this._config)return;const e=this._energyOffer(this._config),t=void 0!==this._energyPending?this._energyPending:this._period;this._selectEnergy(e[(e.indexOf(t)+1)%e.length])}_selectEnergy(e){const t=this._hass;if(!this._config)return;if(null===e||void 0!==t&&this._fresh(e,t,Date.now()))return this._energyPending=void 0,void this._showEnergy(e);this._energyPending=e,this.requestUpdate(),this._ensureEnergy(e,!0)}_showEnergy(e){this._energyPeriod=e,this._energyChosen=!0;const t=this.preview;this._config?.view.remember&&!t&&ar(this._memKey(or),e??"kw"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}detailState(){return this._config?{config:this._config,shown:[...this._lastEntries?.keys()??[]].filter(e=>e!==Ve),period:void 0!==this._energyPending?this._energyPending:this._period,periods:this._energyOffer(this._config).filter(e=>null!==e)}:null}async detailEnergy(e){const t=this._hass,i=this._config;if(!t||!i)throw new Error("EnerLens: no configuration");const o=Date.now(),s=this._energyViews.get(e);if(s?.detail&&this._fresh(e,t,o)&&o-s.fetchedAt<nr)return s;const n=this._energyKey,r=await ho(t,i,e,o);return n===this._energyKey&&(this._energyViews.set(e,r),this._period===e&&this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this.requestUpdate())),r}_fresh(e,t,i){const o=this._energyViews.get(e);return void 0!==o&&o.start===ro(e,Ti(e,i,lo(t),ao(t)))}_ensureEnergy(e,t=!1){const i=e??this._period,o=this._hass,s=this._config;if(!i||!o||!s)return;const n=Date.now(),r=ro(i,Ti(i,n,lo(o),ao(o))),a=this._energyAsked.get(i);if(a?.open)return;if(!t&&a&&a.start===r&&n-a.at<nr)return;const l={at:n,start:r,open:!0};this._energyAsked.set(i,l);const c=this._energyKey;ho(o,s,i,n).then(e=>{if(l.open=!1,c===this._energyKey){if(this._energyViews.set(i,e),this._energyPending===i)return this._energyPending=void 0,void this._showEnergy(i);this._hass&&this._config&&this._period===i&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}}).catch(e=>{console.warn(e),l.open=!1,c===this._energyKey&&(this._energyAsked.get(i)===l&&(l.at=n-nr+3e4),this._energyPending===i&&(this._energyPending=void 0,this.requestUpdate()))})}_energyChip(e,t){if(this._example)return;const i=this._statsWaiting(t),o=i?[...t.view.power?[null]:[],...t.view.energyPeriods]:this._energyOffer(t),s=void 0!==this._energyPending?this._energyPending:this._period;if(o.length<2&&null===s&&!i)return;const n=s?this._energyViews.get(s):void 0,r=o[(o.indexOf(s)+1)%o.length],a=t.power.unit,l=mo(s,n,e,a),c=null!==s&&!0===n?.lateStart;return{labels:o.map(t=>mo(t,void 0,e,a)),active:l,ariaLabel:Oe("energy.chip",e,{mode:l,next:mo(r,void 0,e,a)}),inPeriod:null!==s,late:c,waiting:i,title:c&&n?Oe("energy.late",e,{date:po(n.from,e,!0)}):"",onCycle:()=>this._cycleEnergy(),options:o.map(t=>{const i=t?this._energyViews.get(t):void 0,o=null!==t&&!0===i?.lateStart;return{label:mo(t,void 0,e,a),late:o,title:o&&i?Oe("energy.late",e,{date:po(i.from,e,!0)}):""}}),selected:o.indexOf(s),onSelect:e=>this._selectEnergy(o[e])}}get _nodePx(){return Math.max(70,112*this._scale+11)}_geometry(){const e=this._config;return Bo(e.layout,e.flow.lines,null!==(this._model?.battery??null))}_cyclePvScale(){const e=this._config?.view.pvScales??[];e.length<2||this._setPvScale(e[(e.indexOf(this._pvScale)+1)%e.length])}_setPvScale(e){this._pvScale=e,this._config?.view.remember&&!mr(this)&&ar(this._memKey(sr),this._pvScale)}_pvScaleChip(e,t){const i=t.view.pvScales;if(i.length<2)return;const o=t=>Oe(`pv_scale.${t}`,e),s=i[(i.indexOf(this._pvScale)+1)%i.length],n="peak"===this._pvScale&&this._period?"pv_scale.peak_period_title":`pv_scale.${this._pvScale}_title`;return{labels:i.map(o),active:o(this._pvScale),ariaLabel:Oe("pv_scale.chip",e,{mode:o(this._pvScale),next:o(s)}),title:Oe(n,e),onCycle:()=>this._cyclePvScale(),titles:i.map(t=>Oe("peak"===t&&this._period?"pv_scale.peak_period_title":`pv_scale.${t}_title`,e)),selected:i.indexOf(this._pvScale),onSelect:e=>this._setPvScale(i[e])}}_toggleShowAll(){this._showAll=!this._showAll,this._config?.view.remember&&!mr(this)&&ar(this._memKey(ir),this._showAll?"1":"0"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config))}_pause(e){this._pausedAt??=e}_resume(){const e=this._pausedAt;if(void 0===e||!this.isConnected||"hidden"===document.visibilityState)return;if(!1===this._realHass?.connected)return;this._pausedAt=void 0;const t=Date.now();this._lastTick=t,!this._config||t-e<=1e3*this._config.updateIntervalS||(this._buffer?.markGap(e,t),this._historyFor=void 0,this._hass&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}set hass(e){this._realHass=e,!1===e.connected?this._pause(Date.now()):this._resume();const t=this._example,i=this._withExample(e),o=this._hass;this._hass=i,this._config&&(this._checkStatistics(),o&&t===this._example&&!this._shownChanged(o,i)||(this._config.gridStatus&&(this._outage=function(e,t,i){const o=e.states[t.entity]?.state;return qe(i,o,t,Ie(e,t.entity))}(i,this._config.gridStatus,this._outage)),this._observeCharge(i),this._example||this._solarMemory.observe(i,this._config.solarSources),this._model=mn(i,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel??=this._model,this._example||this._recordSamples(i),this.requestUpdate("hass",o)))}_withExample(e){const t=[...this._entityIds,...this._extraIds,...this._chargeIds],i=Object.values(hi);return this._example=this._entityIds.length>0&&t.every(e=>i.includes(e))&&!t.some(t=>e?.states?.[t]||e?.entities?.[t]),this._example?{...e,states:{...e.states,...hr}}:e}get hass(){return this._hass}_shownChanged(e,t){const i=[...this._entityIds,...this._chargeIds,...this._extraIds];return!!i.some(i=>e.states[i]!==t.states[i])||(e.language!==t.language||e.locale!==t.locale||e.formatEntityState!==t.formatEntityState||e.themes!==t.themes||e.connected!==t.connected||e.entities!==t.entities&&i.some(i=>e.entities?.[i]?.display_precision!==t.entities?.[i]?.display_precision))}_observeCharge(e){this._config&&0!==this._chargeIds.length&&(this._charge.observe(e,this._config.consumers),this._holds.observe(e,this._config.consumers))}_ensureLookups(){const e=this._hass;if(!e||!this._config)return;if(this._example||this.preview)return;this._config.gridStatus&&!this._outagePrefilled&&(this._outagePrefilled=!0,this._prefillOutage());const t=this._solarMemory.missing(e,this._config.solarSources);if(t.length>0&&this._solarMemory.prefill(e,this._config.solarSources,t).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=mn(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}),0===this._chargeIds.length)return;const i=this._charge.missing(e,this._config.consumers);0!==i.length&&this._charge.prefill(e,i).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=mn(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()})}setConfig(e){const t=this._config;this._config=oi(e,this._hass),this._rawConfig=e,this._entityIds=function(e){const t=[],i=e=>{e&&!t.includes(e)&&t.push(e)};for(const t of[e.sources.solar,e.sources.grid,e.sources.battery,e.sources.house])"single"===t.kind?i(t.entity):"split"===t.kind&&(i(t.positive),i(t.negative));for(const t of e.solarSources)i(t.entity);i(e.sources.batterySoc),i(e.gridStatus?.entity);for(const t of e.consumers)i(t.entity);return t}(this._config),this._chargeIds=function(e){const t=[];for(const i of e.consumers){const e="condition"===i.hold?.kind?i.hold.entity:void 0;for(const o of[i.charge?.soc,e])o&&!t.includes(o)&&t.push(o)}return t}(this._config),this._extraIds=function(e){const t=[];for(const i of jt){if("battery"===i&&"absent"===e.sources.battery.kind)continue;const{inside:o,label:s}=e.nodes[i];for(const e of[o?.entity,s?.entity])e&&!t.includes(e)&&t.push(e)}return t}(this._config),this._realHass&&(this._hass=this._withExample(this._realHass));const i=this._config.view;t&&t.view.avgLongMinutes===i.avgLongMinutes||(this._buffer=new pe(6e4*i.avgLongMinutes)),t||(this._rememberPending=!0),t&&t.view.defaultMode===i.defaultMode&&i.modes.includes(this._mode)||(this._mode=i.defaultMode),t&&t.view.defaultPvScale===i.defaultPvScale&&i.pvScales.includes(this._pvScale)||(this._pvScale=i.defaultPvScale);const o=this._config.list,s=this._showAll?"full":"filtered";t&&t.list.defaultScope===o.defaultScope&&o.scope.includes(s)||(this._showAll="full"===o.defaultScope);const n=function(e){const{roles:t,inverted:i}=Xi(e);return JSON.stringify([t,[...i],e.solarSources.map(e=>e.entity),e.consumers.map(e=>e.entity),e.flow.minW])}(this._config);n!==this._energyKey&&(this._energyKey=n,this._energyViews.clear(),this._energyAsked.clear(),this._energyPending=void 0),to(this._config).join(",")===this._statsKey&&i.energyDefault||(this._statsKey="",this._statsOk=void 0,this._statsRetryAt=0);const r=this._energyOffer(this._config);t&&t.view.defaultEnergy===i.defaultEnergy&&r.includes(this._energyPeriod)||this._startEnergy(this._config,!1),void 0===this._energyPending||r.includes(this._energyPending)||(this._energyPending=void 0),this._checkStatistics(),this.requestUpdate(),t&&dr(t.gridStatus,this._config.gridStatus)||(this._outage=void 0,this._outagePrefilled=!1),this._hass&&(this._observeCharge(this._hass),this._model=mn(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),this._tickModel=this._model),t&&t.updateIntervalS===this._config.updateIntervalS||this._restartTick()}connectedCallback(){super.connectedCallback(),ur.add(this),this._resizeObserver=new ResizeObserver(()=>{this._measure(),this._drawFan(),this._measurePathZoom()}),this._resizeObserver.observe(this),window.addEventListener("resize",this._onWindowResize),this._technique=function(){const e="undefined"!=typeof CSS&&CSS.supports?.("offset-path",'path("M 0 0 L 1 1")'),t="undefined"!=typeof Element&&"animate"in Element.prototype;return e&&t?"waapi":"static"}(),this._intersectionObserver=new IntersectionObserver(e=>{this._visible=e.some(e=>e.isIntersecting),this._syncPlayState(),this._visible&&this._config&&this._updateFan()}),this._intersectionObserver.observe(this),this._pickUpLiveDesigns(),document.addEventListener("visibilitychange",this._onVisibility),this.renderRoot.addEventListener("transitionend",this._onTransitionEnd),this._resume(),this._motionQuery=window.matchMedia?.("(prefers-reduced-motion: reduce)"),this._motionQuery?.addEventListener?.("change",this._onMotionChange),this._restartTick()}_restartTick(){this._tickTimer&&clearInterval(this._tickTimer);const e=this._config?.updateIntervalS??5;this._lastTick=Date.now(),this._tickTimer=setInterval(()=>{const t=Date.now(),i=this._lastTick??t;this._lastTick=t,t-i>2*e*1e3&&(this._pause(i),this._resume()),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this._updateSince(),this.requestUpdate())},1e3*e)}get _dotsMove(){return this._animationsWanted&&"waapi"===this._technique}get _animationsWanted(){const e=this._config?.flow.animation??"auto";return"off"!==e&&("on"===e||!this._motionQuery?.matches)}_recordSamples(e){if(!this._config||!this._buffer)return;const t=Date.now();for(const i of this._entityIds){const o=e.states[i];o&&this._buffer.push(i,Date.parse(o.last_changed)||t,an(e,i))}this._buffer.prune(t)}_modelForMode(e,t){const i=this._period;if(i){const o=this._energyViews.get(i);return fn(e,t,e=>o?.meanW(e)??null,this._chargeOf,this._solarMemory.values,this._heldOf)}if("current"===this._mode||!this._buffer||this._example)return mn(e,t,this._chargeOf,this._solarMemory.values,this._heldOf);const o=6e4*("avg_short"===this._mode?t.view.avgShortMinutes:t.view.avgLongMinutes),s=Date.now(),n=this._buffer;return fn(e,t,e=>n.mean(e,o,s),this._chargeOf,void 0,this._heldOf)}_ensureHistory(e=!1){const t=this._buffer;t&&"current"!==this._mode&&this._hass&&this._config&&(e||this._historyFor!==t)&&(this._example||this.preview||(this._historyFor=t,this._prefill(t)))}async _prefill(e){const t=this._hass,i=this._config;if(!t||!i)return;const o=Date.now();try{const s=await ge(t,this._entityIds,i.view.avgLongMinutes);if(e!==this._buffer)return;for(const[i,o]of Object.entries(s)){const s=t.states[i]?.attributes.unit_of_measurement;for(const t of o)e.push(i,t.t,this._toWatts(t.v,s))}e.healGaps(o,Object.entries(s).filter(([,e])=>e.length>0).map(([e])=>e)),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this._updateSince()}catch{this._updateSince()}finally{this.requestUpdate()}}async _prefillOutage(){const e=this._config?.gridStatus;if(this._hass&&e)try{const t=await async function(e,t,i=10,o=5e3){const s=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(s-864e5*i).toISOString(),end_time:new Date(s).toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0});let r;const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error(`EnerLens: grid status history timed out after ${o} ms`)),o)});let l;try{l=await Promise.race([n,a])}finally{void 0!==r&&clearTimeout(r)}if(null===l||"object"!=typeof l)return;const c=l[t];if(!Array.isArray(c))return;const d=e=>{const t=e.lu;return"number"==typeof t?t:0};for(const e of[...c].sort((e,t)=>d(t)-d(e))){const t=e.s;if("string"==typeof t&&!Te.has(De(t)))return t}}(this._hass,e.entity);void 0===this._outage&&dr(this._config?.gridStatus,e)&&(this._outage=qe(void 0,t,e,Ie(this._hass,e.entity)))}catch{}finally{this.requestUpdate()}}_toWatts(e,t){if(null===e)return null;return e*("kW"===t?1e3:"MW"===t?1e6:"mW"===t?.001:1)}_updateSince(){if(!this._buffer||"current"===this._mode)return void(this._since=void 0);const e=this._buffer.status(Date.now());this._since=e.complete||!e.since?void 0:new Date(e.since).toLocaleTimeString(this._hass?.locale.language??"de",{hour:"2-digit",minute:"2-digit"})}_setMode(e){e!==this._mode&&(this._mode=e,this._config?.view.remember&&!mr(this)&&ar(this._memKey(tr),e),this._ensureHistory(!0),this._updateSince(),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}_measure(){const e=this.renderRoot?.querySelector(".plot"),t=e?.getBoundingClientRect().width??0;if(t>0){const i=t/Co;this._plotScale=i,this.style.setProperty("--el-scale",String(i)),this._dots?.setScale(i),Math.abs(i-this._scale)>.005&&(this._scale=i),this._measureHoles(e)}return this._checkStacked()}_measureHoles(e){const t=e.querySelector(".node");if(!t)return;const i=getComputedStyle(t),o=function(e){const t=e.trim().toLowerCase();if("transparent"===t)return!0;const i=t.match(/\/\s*([\d.]+)(%?)\s*\)$/),o=t.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%?)\s*\)$/),s=i??o;if(!s)return!1;const n=Number(s[1])/(s[2]?100:1);return Number.isFinite(n)&&n<1}(i.backgroundColor);if(o!==this._seeThrough&&(this._seeThrough=o),!o)return;const s=Number.parseFloat(getComputedStyle(e).width),n=(Number.parseFloat(i.width)/2-Number.parseFloat(i.borderTopWidth||"0"))*Co/s;n>0&&Number.isFinite(n)&&!(Math.abs(n-this._holeR)<.005)&&(this._holeR=n,e.querySelector("path.holes")?.setAttribute("d",Ko(this._geometry(),n)))}_measurePathZoom(){if("waapi"!==this._technique||"undefined"==typeof navigator||!/^Apple/.test(navigator.vendor??""))return;const e=this.renderRoot?.querySelector(".plot svg"),t=e?function(e){const t=(e=0,t=0)=>{const i=document.createElementNS(Sn,"circle");return i.setAttribute("cx",String(e)),i.setAttribute("cy",String(t)),i.setAttribute("r","1"),i},i=document.createElementNS(Sn,"g");i.style.offsetPath='path("M400,400 L400,401")',i.style.offsetRotate="0deg",i.style.offsetDistance="0%",i.appendChild(t());const o=t(An,An),s=t(),n=t(200,200),r=document.createElementNS(Sn,"g");r.style.visibility="hidden",r.style.pointerEvents="none",r.append(i,o,s,n),e.appendChild(r);try{const e=e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2,w:t.width}},t=e(s),r=e(o),a=e(i);if(!(r.w>0))return;const l=r.x-t.x,c=r.y-t.y,d=a.x-t.x,h=a.y-t.y,u=l*l+c*c;if(!(u>0))return;const p=e(n);if(Math.hypot(p.x-(t.x+r.x)/2,p.y-(t.y+r.y)/2)>.002*Math.sqrt(u))return;const m=(d*l+h*c)/u;if(!(m>.1&&m<10)||Math.abs(d*c-h*l)/u>.01*m)return;return Math.abs(m-1)<.002?1:m}finally{r.remove()}}(e):void 0;void 0===t||Math.abs(t-this._pathZoom)<.002||(this._pathZoom=t,this._dots?.setPathZoom(t),this._fan?.setPathZoom(t),this._solarFan?.setPathZoom(t),this._drawFan())}_checkStacked(){const e=this.renderRoot?.querySelector(".cross"),t=this.renderRoot?.querySelector(".list:not(.pv-side)"),i=this.renderRoot?.querySelector(".body");if(!e||!i)return!1;let o;if(this._splitsLists()){if(0===i.clientWidth)return!1;if(this._stacked)o=i.clientWidth<=this._stackedWidth;else{const i=this.renderRoot.querySelector(".pv-side");o=null!==i&&e.offsetLeft<=i.offsetLeft||null!==t&&t.offsetLeft<=e.offsetLeft}}else{if(!t)return!1;o=t.offsetTop>=e.offsetTop+e.offsetHeight/2}return o!==this._stacked&&(o&&(this._stackedWidth=i.clientWidth),this._stacked=o,this.requestUpdate(),!0)}_splitsLists(){return"square_left"===this._config?.layout&&this._lastSolar.size>0}_updateFan(){if(this._drawFan(),!this._visible||"function"!=typeof requestAnimationFrame)return;if(!this._rows.gliding(this.renderRoot.querySelector(".body")))return;if(this._fanFollowUntil=performance.now()+rr,void 0!==this._fanFollow)return;const e=()=>{this._fanFollow=void 0;const t=this._visible&&performance.now()<this._fanFollowUntil&&this._rows.gliding(this.renderRoot.querySelector(".body"));this._drawFan(),t&&(this._fanFollow=requestAnimationFrame(e))};this._fanFollow=requestAnimationFrame(e)}_drawFan(){this._config&&(this._placeLists(),this._drawConsumerFan(),this._drawSolarFan())}_placeLists(){const e=this.renderRoot?.querySelector(".pv-rows"),t=this.renderRoot?.querySelector(".rows"),i=[e,t].filter(e=>null!==e),o=this.renderRoot?.querySelector(".body"),s=this.renderRoot?.querySelector(".cross"),n=this.renderRoot?.querySelector(".node.solar"),r=this.renderRoot?.querySelector(".node.house");if(this._stacked||!e||!o||!s||!n||!r){for(const e of i)e.style.transform="";return}const a=e.parentElement?.classList.contains("pv-side")??!1,l=o.getBoundingClientRect().top,c=e=>{const t=/translateY\((-?[\d.]+)px\)/.exec(e.style.transform);return t?Number(t[1]):0},d=e=>{const t=e.getBoundingClientRect();return t.top+t.height/2-l},h=(e,t)=>{if(!e)return{top:0,height:0,node:d(t)};const i=e.getBoundingClientRect();return{top:i.top-l-c(e),height:i.height,node:d(t)}},u=s.getBoundingClientRect(),p={top:u.top-l,bottom:u.bottom-l},m=(e,t)=>{if(!e)return;const i=t?`translateY(${t}px)`:"";e.style.transform!==i&&(e.style.transform=i)};if(a)return m(e,Dn(p,h(e,n))),void(t&&m(t,Dn(p,h(t,r))));const f=function(e){const{drawing:t,pv:i,consumers:o,gap:s}=e;if(i.height+s+o.height>t.bottom-t.top)return{pv:0,consumers:0};let n=i.node-i.height/2,r=o.node-o.height/2;const a=n+i.height+s-r;return a>0&&(n-=a/2,r+=a/2),n<t.top&&(r=Math.max(r,t.top+i.height+s),n=t.top),r+o.height>t.bottom&&(r=t.bottom-o.height,n=Math.min(n,r-s-i.height)),{pv:Math.round(n-i.top),consumers:Math.round(r-o.top)}}({drawing:p,pv:h(e,n),consumers:h(t,r),gap:10});m(e,f.pv),m(t,f.consumers)}_fanRows(e,t,i,o=1){return e.map(e=>{const s=e.dataset.key,n=s?t.get(s):void 0;if(!n)return null;const r=gi(n.w,this._shownConfig()),a=!yi(n,this._shownConfig()),l=this._config?.flow.inactiveLines??"show";if(a&&"hide"===l)return null;const c=(this._stacked?e.querySelector(".swatch")??e:e).getBoundingClientRect(),d=e.getBoundingClientRect(),h=e.querySelector(".charge-ring"),u=h?Math.min(c.left,h.getBoundingClientRect().left):c.left;return{key:s,x:(1===o?u:c.right)-i.left,y:d.top+d.height/2-i.top,color:n.color,count:this._dotsMove?r?.count??0:0,durationS:r?.durationS??1,inactive:a&&"hide"!==l?l:void 0,fade:cr(e)}}).filter(e=>null!==e)}_layer(e,t){const i=e??new Fn(t);e||i.setPathZoom(this._pathZoom);const o=this._config;return i.setDesign(Si(o.flow.design),kn(this,o.appearance)),i.setDotColor(o.flow.dotColor),i.setDotRadius(5),i.setDotScale(Gn(this._plotScale,o.flow).dot),i}_exit(e,t,i,o){const s=e.getBoundingClientRect(),n={x:s.left+s.width/2-i.left,y:s.top+s.height/2-i.top},r=t.length>0?1===o?Math.min(...t.map(e=>e.x)):Math.max(...t.map(e=>e.x)):void 0,a=function(e,t,i,o=e.x+200*i){if(0===t.length)return{x:i,y:0};const s=t.reduce((e,t)=>e+t,0)/t.length,n=Math.max(1,i*(o-e.x)),r=80*Math.PI/180,a=Math.max(-r,Math.min(r,Math.atan2(s-e.y,n)));return Math.abs(a)<1e-9?{x:i,y:0}:{x:i*Math.cos(a),y:Math.sin(a)}}(n,t.map(e=>e.y),o,r),l=s.width/2,c={x:n.x+a.x*l,y:n.y+a.y*l},d=Number.parseFloat(getComputedStyle(e).borderTopWidth)||0,h=s.width/(e.offsetWidth||s.width);return{centre:n,dir:a,start:c,hole:this._seeThrough?{x:n.x,y:n.y,r:l-d*h}:void 0,lead:10*Gn(this._plotScale,this._config.flow).line,radius:l}}_drawConsumerFan(){const e=this.renderRoot?.querySelector("svg.fan:not(.pv-fan)");if(!e||!this._config)return;this._fan=this._layer(this._fan,e);const t=this.renderRoot.querySelector(".body"),i=this.renderRoot.querySelector(".node.house"),o=this.renderRoot.querySelector(".rows"),s=[...this.renderRoot.querySelectorAll(".rows .row")];if(!t||!i||!o||0===s.length)return void this._fan.destroy();const n=t.getBoundingClientRect(),r=this._fanRows(s,this._lastEntries,n),a={width:n.width,height:n.height};if(this._stacked){const e=o.getBoundingClientRect();return this._fan.route=void 0,void this._fan.update(r,{x:e.left-n.left,y:e.top+e.height/2-n.top},a,this._animationsWanted)}const l=this._exit(i,r,n,1);this._fan.route=0!==l.dir.y?(e,t)=>Rn(e,l.dir,t,l.lead):void 0,this._fan.update(r,l.start,a,this._animationsWanted,l.hole)}_drawSolarFan(){const e=this.renderRoot?.querySelector("svg.pv-fan");if(!e||!this._config)return;this._solarFan=this._layer(this._solarFan,e),this._solarFan.reverse=!0;const t=this.renderRoot.querySelector(".body"),i=this.renderRoot.querySelector(".node.solar"),o=this.renderRoot.querySelector(".node.house"),s=this.renderRoot.querySelector(".pv-rows"),n=[...this.renderRoot.querySelectorAll(".pv-rows .row")];if(!(t&&i&&o&&s&&0!==n.length))return void this._solarFan.destroy();const r=t.getBoundingClientRect(),a=s.parentElement?.classList.contains("pv-side")??!1,l=this._fanRows(n,this._lastSolar,r,a?-1:1),c={width:r.width,height:r.height};if(this._stacked){const e=s.getBoundingClientRect();return this._solarFan.route=void 0,void this._solarFan.update(l,{x:e.left-r.left,y:e.top+e.height/2-r.top},c,this._animationsWanted)}const d=s.parentElement?.classList.contains("pv-side")?-1:1,h=this._exit(i,l,r,d),u=[...this.renderRoot.querySelectorAll(".node:not(.solar)")].map(e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2-r.left,y:t.top+t.height/2-r.top,r:t.width/2+14}}),p=o.getBoundingClientRect(),m=p.top+p.height/2-r.top,f=p.right-r.left+16,g=1===d?Math.min(...l.map(e=>e.x)):Math.max(...l.map(e=>e.x)),_=On(h.start,l.map(e=>e.y),g,d,u,1===d?(e,t)=>e<f&&t>m-6:void 0,h.dir,h.lead);this._solarFan.route=(e,t)=>Tn(e,h.dir,_,t,h.lead),this._solarFan.update(l,h.start,c,this._animationsWanted,h.hole)}_pickUpLiveDesigns(){this._designsPickedUp||(this._designsPickedUp=!0,Promise.resolve().then(()=>this.requestUpdate()))}_warnUnknownDesign(e){const t=this._config?.flow.design;!e&&t&&"none"!==t&&this._warnedDesign!==t&&(this._warnedDesign=t,console.warn(`${di}: flow design "${t}" is not in this build - drawing plain dots.`))}_syncPlayState(){const e="undefined"!=typeof document&&document.hidden;this._visible&&!e?(this._dots?.resume(),this._fan?.resume(),this._solarFan?.resume()):(this._dots?.pause(),this._fan?.pause(),this._solarFan?.pause(),this._ring.stop(),this._solarRing.stop())}willUpdate(){this._rememberPending&&this.isConnected&&(this._rememberPending=!1,this._applyRemembered()),this._rows.capture(this.renderRoot?.querySelector(".body")??null)}updated(){this._ensureHistory(),this._ensureLookups(),this._ensureEnergy(),this._rows.play(this.renderRoot.querySelector(".body"),this._animationsWanted&&this._settled);const e=this._animationsWanted&&"jump"!==this._config?.ring.animation&&this._visible&&!("undefined"!=typeof document&&document.hidden),t=e=>this.renderRoot.querySelector(`.node.${e}`);this._ring.update(t("house")??this.renderRoot,e,this._nodePx);const i=t("solar");if(i&&this._solarRing.update(i,e,this._nodePx),!this._hass||!this._config)return;const o=this.renderRoot.querySelector("g.dots");if(!o)return;const s=this.renderRoot.querySelector(".plot"),n=s?.getBoundingClientRect().width??0,r=Si(this._config.flow.design);this._warnUnknownDesign(void 0!==r);const a=kn(this,this._config.appearance);"auto"===this._config.appearance?this.removeAttribute("data-appearance"):this.setAttribute("data-appearance",this._config.appearance),n>0&&(this._plotScale=n/Co);const l=Gn(this._plotScale,this._config.flow);this.style.setProperty("--el-line-k",l.line.toFixed(4)),this._dots||(this._dots=new zn(o,this._technique),n>0&&this._dots.setScale(n/Co),this._dots.setPathZoom(this._pathZoom),this._measurePathZoom()),this._dots.setDesign(r,a),this._dots.setDotScale(l.dot);const c=this._tickModel??this._model??mn(this._hass,this._config,this._chargeOf,this._solarMemory.values,this._heldOf),d=this._dotsMove?_i(this._flowsOf(c),this._shownConfig()):[];this._dots.setPaths(this._geometry().paths),this._dots.update(d,this._config,this._animationsWanted);const h=a?r?.dark:r?.light;h?this.style.setProperty("--el-link-opacity",String(h.line/100)):this.style.removeProperty("--el-link-opacity");const u=this._measure();this._updateFan(),this._syncPlayState(),u||(this._settled=!0)}disconnectedCallback(){super.disconnectedCallback(),setTimeout(()=>{this.isConnected||window.dispatchEvent(new CustomEvent(Ds,{detail:this}))},500),ur.delete(this),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._intersectionObserver?.disconnect(),this._intersectionObserver=void 0,document.removeEventListener("visibilitychange",this._onVisibility),this.renderRoot.removeEventListener("transitionend",this._onTransitionEnd),this._pause(Date.now()),window.removeEventListener("resize",this._onWindowResize),this._motionQuery?.removeEventListener?.("change",this._onMotionChange),this._motionQuery=void 0,this._dots?.destroy(),this._dots=void 0,this._fanFollow&&cancelAnimationFrame(this._fanFollow),this._fanFollow=void 0,this._fan?.destroy(),this._fan=void 0,this._solarFan?.destroy(),this._solarFan=void 0,this._ring.stop(),this._solarRing.stop(),this._tickTimer&&clearInterval(this._tickTimer),this._tickTimer=void 0}getCardSize(){return 7}getGridOptions(){return{columns:12,min_columns:12,rows:"auto"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Da}),document.createElement(li)}static getStubConfig(){return{memory_id:si(),entities:{...hi},icons:{rest:"mdi:cloud-question"}}}render(){if(!this._hass||!this._config)return j;const e=this._modelForMode(this._hass,this._config),t=this._tickModel??e,i=this._shownConfig(),o=function(e,t,i){const o=new Map,s=new Map;for(const e of t.consumers)e.reading.available&&o.set(e.key,e.reading.w),e.charge&&s.set(e.key,wi(e));const n=e.entries.map(e=>e.isRest?e:{...e,w:o.get(e.key)??(e.powerUnknown?0:e.w),powerUnknown:o.has(e.key)?void 0:e.powerUnknown,charge:s.has(e.key)?s.get(e.key):e.charge}),r=n.filter(e=>!e.isRest).reduce((e,t)=>e+t.w,0),a=n.findIndex(e=>e.isRest);if(a>=0){const e=t.house.available?t.house.w-r:n[a].w;n[a]={...n[a],w:Math.max(0,e)}}return{entries:n,segments:vi(n,i)}}(bi(t,i,this._showAll),e,i),s=_i(this._flowsOf(t),i),n=new Map(s.map(e=>[e.connection,this._config?.colors[e.colorKey]??""]));this._lastEntries=new Map(o.entries.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const r=i.list.solar?function(e,t){const i=new Map;for(const e of t.solarSources)e.reading.available&&i.set(e.key,e.reading.w);return e.map(e=>({...e,w:i.get(e.key)??e.w}))}(Yn(t,i,this._showAll),e):[];this._lastSolar=new Map(r.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const a=this._splitsLists()&&!this._stacked,l=i.view.pvScales.length>0?{segments:Jn(e,i,this._pvScale,Yn(t,i,!0).map(e=>e.key)),layout:this._pvScale}:void 0,c=(e,t,i)=>i?fs(t.currentTarget,{node:i,entity:e||void 0}):gs(t.currentTarget,e);return H`
      <ha-card
        translate="no"
        @hass-more-info=${this._onMoreInfo}
        @enerlens-detail=${this._onDetail}
      >
        ${Ts(this._config,this._hass,this._rawConfig?.title,this._mode,this._since,e=>this._setMode(e),this._showAll,()=>this._toggleShowAll(),this._energyChip(this._hass,this._config),this._pvScaleChip(this._hass,this._config))}
        ${!0===this._outage?(d=this._hass,H`<div class="outage-banner" role="status">
    <ha-icon icon="mdi:flash-off"></ha-icon>
    <span>${Oe("outage.banner",d)}</span>
  </div>`):j}
        ${this._example?function(e){return H`<div class="example-banner" role="status">
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <span>${Oe("example.banner",e)}</span>
  </div>`}(this._hass):j}
        <div
          class="body layout-${this._config.layout.replace("_","-")} ${this._stacked?"stacked":""} ${this._config.list.alwaysBelow||this._stacked&&this._splitsLists()?"force-below":""} ${a?"split":""} ${this._config.list.enabled||r.length>0?"":"no-list"}"
          style=${function(e,t){const i=Bo(e.layout,e.flow.lines,t),o=Object.keys(i.nodePos).filter(e=>"battery"!==e||t),s=e=>"grid"===e||"battery"===e,n=i.viewH/2,r=o.filter(e=>i.labelAbove[e]&&i.nodePos[e].y<n),a=o.filter(e=>!i.labelAbove[e]&&i.nodePos[e].y>n+1),l=Math.max(8,...r.map(t=>26+Ss(e,t,s(t))-15)),c=a.length>0?Math.max(8,...a.map(t=>28+Ss(e,t,s(t))-30)):28,d=l-26-(c-28);return`--el-pad-top:${l}px;--el-pad-bottom:${c}px;--el-list-mt:${Math.max(0,d)}px;--el-list-mb:${Math.max(0,-d)}px`}(this._config,null!==e.battery)}
        >
          <svg class="fan" aria-hidden="true"></svg>
          <svg class="fan pv-fan" aria-hidden="true"></svg>
          ${a?function(e,t,i,o,s){return 0===s.length?j:H`
    <div class="list pv-side" style="--el-row-h:${Bn(Vn(e,t,s))}px">
      ${Kn(s,t,i,o,!1)}
    </div>
  `}(o,i,this._hass,c,r):j}
          ${Fs(e,i,this._hass,n,this._config.ring.enabled?o.segments:[],this._nodePx,!0===this._outage,this._animationsWanted,this._holeR,this._seeThrough,l)}
          ${Hn(o,i,this._hass,c,this._stacked,r,a)}
        </div>
      </ha-card>
    `;var d}}_r.styles=er,_r.properties={hass:{attribute:!1,noAccessor:!0},_model:{state:!0},_showAll:{state:!0},_pvScale:{state:!0},_outage:{state:!0},_scale:{state:!0},_seeThrough:{state:!0}},customElements.get(ai)||customElements.define(ai,_r);const wr=window;wr.customCards=wr.customCards||[],wr.customCards.some(e=>e.type===ai)||wr.customCards.push({type:ai,name:di,description:"Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",preview:!0,documentationURL:"https://github.com/wawersich/enerlens-card"}),console.info(`%c ${ai.toUpperCase()} %c 1.2.0 · 4897d0f+ `,"color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const yr=Uo(class extends Zo{constructor(){super(...arguments),this.key=j}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(ts(e),this.key=t),i}}),vr=[{domain:"sensor",device_class:"power"},{domain:"sensor",unit_of_measurement:["W","kW","mW","MW"]}],br=[{domain:"sensor",device_class:"battery"},{domain:"sensor",unit_of_measurement:"%"}],xr=["solar","grid","house","battery"],kr="consumers_slot",$r="solar_slot";function Sr(e){const t=e.split(".")[0];return"binary_sensor"===t||"input_boolean"===t}const Ar=[["=","="],["!=","≠"],[">",">"],["<","<"],[">=","≥"],["<=","≤"]],Mr=e=>void 0===e||""===e||"="===e||"!="===e;function Er(e){const t=ta(e.condition)?e.condition:void 0,i=t&&Mr(t.operator)&&void 0!==t.value&&!Array.isArray(t.value)?{...e,condition:{...t,value:Cr(t.value)}}:e,o=ta(i.charge)?i.charge:void 0;if(!o||!("show"in o||"plugged"in o||"unplugged"in o))return i;const{show:s,plugged:n,unplugged:r,...a}=o,l={...i,charge:a};if(Zr(i.show)||!Zr(o.soc))return l;if("always"===s)l.show="always";else if("plugged"===s&&Zr(n)){const e=Sr(n)?[]:Xr(r)??[];l.show="condition",l.condition=e.length>0?{entity:n,operator:"!=",value:e}:{entity:n,operator:"=",value:["on"]}}return l}function Cr(e){const t=(Array.isArray(e)?e:[e]).map(e=>!0===e?"on":!1===e?"off":"number"==typeof e?String(e):e).filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function zr(e,t){if("condition"!==e||!ta(t))return;const i=Mr(t.operator)?Cr(t.value):function(e){const t="number"==typeof e?e:"string"==typeof e?Number(e):Number.NaN;return"string"==typeof e&&""===e.trim()?void 0:Number.isFinite(t)?t:void 0}(t.value);return ia({...Br(t,["entity","operator","value"]),entity:Zr(t.entity)?t.entity:void 0,operator:Zr(t.operator)?t.operator:void 0,value:i})}const Pr=[...xr,"rest"],Wr={solar:["entity","sources","derived"],grid:["entity","split","derived"],house:["entity","derived"],battery:["none","entity","split","derived"]},Nr={grid:["grid_import","grid_export"],battery:["battery_discharge","battery_charge"]},Fr={grid:["import","export"],battery:["discharge","charge"]},Lr=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],Rr="var(--primary-text-color)";function Or(e,t){if("derived"===t)return"derived";if("solar"===e&&Array.isArray(t))return"sources";if("string"==typeof t&&!(e=>null==e||"string"==typeof e&&""===e.trim())(t))return"entity";if(ta(t)&&"entity"in t)return"entity";const i=Fr[e];return ta(t)&&i&&(i[0]in t||i[1]in t)?"split":"house"===e?"derived":"battery"===e?"none":"entity"}function Tr(e,t,i){const o=Or(e,t);if(i[`${e}_source`]=o,"sources"===o)return void(i[`${e}_sources`]=t.map(e=>function(e){if("string"==typeof e)return{entity:e,excluded:!1};const{house:t,...i}=e;return{...i,excluded:"excluded"===t}}("string"==typeof e||ta(e)?e:"")));if("string"==typeof t)return void("entity"===o&&(i[e]=t));const s=t;if(!ta(s))return;const n=e=>"string"==typeof e?e:void 0;if("entity"===o)return i[e]=n(s.entity),void(i[`${e}_invert`]=!0===s.invert);const r=Nr[e],a=Fr[e];"split"===o&&r&&a&&(i[r[0]]=n(s[a[0]]),i[r[1]]=n(s[a[1]]))}const Dr=["inside","label"],qr=(e,t)=>"label"===t||"battery"!==e,Ir=e=>"grid"===e||"battery"===e;function Br(e,t){return ta(e)?Object.fromEntries(Object.entries(e).filter(([e])=>!t.includes(e))):{}}const Hr={inside:["entity","position","decimals","size","weight"],label:["entity","prefix","decimals","size","weight"]},Vr=["show_name","show_state","inside","label"];function Kr(e,t,i,o){const s=`node_${t}_${i}_`,n=e[`${s}entity`];if(!Zr(n))return;const r=e[`${s}decimals`],a=e[`${s}prefix`],l=e[`${s}weight`];return ia({...Br(o,Hr[i]),entity:n,..."inside"===i?{position:"below"===e[`${s}position`]?"below":void 0}:{prefix:Zr(a)?a:void 0},decimals:Zr(r)&&"ha"!==r?/^\d$/.test(r)?Number(r):r:void 0,size:Jr(e[`${s}size`]),weight:Zr(l)&&"normal"!==l?l:void 0})}function jr(e,t){const i={};for(const o of xr)for(const s of Dr){if(!qr(o,s))continue;const n=("battery"!==o||t)&&Zr(e[`node_${o}_${s}_entity`]);i[`${o}_${s}`]=n?e[`color_${o}_${s}`]:void 0}return i.battery_inside=void 0,i}function Ur(e){const t=e.entities??{},i=t.grid_status,o="object"==typeof i&&null!==i?i:void 0,s={title:e.title,layout:e.layout,flow_lines:e.flow?.lines,battery_soc:t.battery_soc,grid_status:"string"==typeof i?i:o?.entity,grid_status_outage:o?.outage,grid_status_ok:o?.ok,consumers:e.consumers,max_consumers:e.max_consumers,min_consumer_w:e.min_consumer_w,update_interval_s:e.update_interval_s,rest_label:e.list?.rest_label,appearance:e.appearance,list_enabled:e.list?.enabled,list_always_below:e.list?.always_below,ring_enabled:e.ring?.enabled,ring_animation:e.ring?.animation,power_unit:e.power?.unit,power_decimals:e.power?.decimals,power_digits:e.power?.digits,modes:oa(e.view?.modes),default_mode:e.view?.default_mode,avg_short_minutes:e.view?.avg_short_minutes,avg_long_minutes:e.view?.avg_long_minutes,energy_periods:oa(e.view?.energy_periods),default_energy:e.view?.default_energy,scope:oa(e.list?.scope),default_scope:e.list?.default_scope,inactive_lines:e.flow?.inactive_lines,animation:e.flow?.animation,design:e.flow?.design,dot_color:e.flow?.dot_color,dot_size:e.flow?.dot_size??100,line_width:e.flow?.line_width??100,min_w:e.flow?.min_w,peak_w:e.flow?.peak_w,slow_below_w:e.flow?.slow_below_w,full_speed_w:e.flow?.full_speed_w,more_dots_above_w:e.flow?.more_dots_above_w,max_dots_at_w:e.flow?.max_dots_at_w,max_dots:e.flow?.max_dots,slow_s:e.flow?.slow_s,fast_s:e.flow?.fast_s};for(const e of xr)Tr(e,t[e],s);s.pv_scales=oa(e.view?.pv_scales),s.quick_style=e.view?.quick_style;const n=ha(e.view?.expanded);for(const e of ca)s[`expanded_${e}`]=!!n.includes(e)||void 0;s.default_pv_scale=e.view?.default_pv_scale,s.list_solar=e.list?.solar,s.ring_solar=e.ring?.solar;const r=e.colors??{};for(const e of Lr)s[`color_${e}`]=r[e];s.color_arrows=r.arrows,s.soc_stops=r.soc_stops,function(e,t){const i=e.colors??{};for(const o of xr){const s=e.nodes?.[o]??{},n=`node_${o}_`;t[`${n}show_name`]=!1!==s.show_name,Ir(o)&&(t[`${n}show_state`]=!1!==s.show_state);for(const e of Dr){if(!qr(o,e))continue;const r=ta(s[e])?s[e]:{},a=`${n}${e}_`;t[`${a}entity`]=r.entity,"inside"===e?t[`${a}position`]=r.position??"above":t[`${a}prefix`]=r.prefix,t[`${a}decimals`]=void 0===r.decimals||null===r.decimals||""===r.decimals?"ha":String(r.decimals),t[`${a}size`]=r.size??100,t[`${a}weight`]=r.weight??"normal",t[`color_${o}_${e}`]=i[`${o}_${e}`]}}}(e,s);const a=e.icons??{};for(const e of Pr)s[`icon_${e}`]=a[e];return s}const Zr=e=>"string"==typeof e&&""!==e.trim();function Qr(e,t){switch(t[`${e}_source`]??Or(e,void 0)){case"none":return;case"derived":return"house"===e?void 0:"derived";case"entity":{const i=t[e];if(!Zr(i))return;return!0===t[`${e}_invert`]?{entity:i,invert:!0}:i}case"sources":return function(e){if(!Array.isArray(e))return;const t=e.flatMap(e=>{const t="string"==typeof e?{entity:e}:ta(e)?e:{};if(!Zr(t.entity))return[];const{excluded:i,...o}=t;return[ia({...o,kwp:Yr(o.kwp),invert:!0===o.invert||void 0,house:!0===i?"excluded":void 0})]});return 0!==t.length?1===t.length&&1===Object.keys(t[0]).length?t[0].entity:t:void 0}(t[`${e}_sources`]);case"split":{const i=Nr[e],o=Fr[e];if(!i||!o)return;const s=t[i[0]],n=t[i[1]];if(!Zr(s)||!Zr(n))return;return{[o[0]]:s,[o[1]]:n}}}}const Gr=e=>null===e||""===e?void 0:e;function Yr(e){return"number"==typeof e&&Number.isFinite(e)?e:void 0}function Jr(e){const t=Yr(e);return 100===t?void 0:t}function Xr(e){if(!Array.isArray(e))return;const t=e.filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function ea(e){if(!ta(e))return;const t=e=>Zr(e)?e:void 0,i="plugged"===e.show?t(e.plugged):void 0,o=ia({...Br(e,["soc","show","plugged","unplugged","label"]),soc:t(e.soc),label:t(e.label),show:t(e.show),plugged:i,unplugged:i&&!Sr(i)?Xr(e.unplugged):void 0});return o&&Zr(o.soc)?o:void 0}const ta=e=>"object"==typeof e&&null!==e&&!Array.isArray(e);function ia(e){const t={};for(const[i,o]of Object.entries(e))null!=o&&""!==o&&(t[i]=o);return Object.keys(t).length?t:void 0}function oa(e){return Array.isArray(e)?e.filter(e=>"string"==typeof e):void 0}function sa(e,t){if(!Array.isArray(e))return;const i=t.filter(t=>e.includes(t));return i.length>0?i:void 0}function na(e,t,i){if("string"!=typeof e)return;const o=sa(t,i);return void 0===o||o.includes(e)?e:void 0}function ra(e){return"derived"!==e.grid_source&&"derived"!==e.battery_source}const aa=["flow_lines","inactive_lines","animation","design","dot_color","dot_size","line_width","min_w","peak_w","slow_below_w","full_speed_w","more_dots_above_w","max_dots_at_w","max_dots","slow_s","fast_s"],la=["quick_style","expanded_modes","expanded_energy_periods","expanded_pv_scales","expanded_scope","modes","default_mode","avg_short_minutes","avg_long_minutes","energy_periods","default_energy","pv_scales","default_pv_scale"],ca=["modes","energy_periods","pv_scales","scope"],da=["segment","segment_compact","single"];function ha(e){return Array.isArray(e)?e:null==e||""===e?[]:[e]}function ua(e,t){const i=new Set(ca),o=[...ca.filter(t=>!0===e[`expanded_${t}`]),...ha(t).filter(e=>!i.has(e))];return o.length>0?o:void 0}const pa=["current","avg_short","avg_long"],ma=["power","today","24h","week","7d","month","30d"],fa=["filtered","full"],ga=["share","peak"],_a={modes:pa,energy_periods:ma,scope:fa},wa=["power","today","24h","week"],ya=["title","layout","max_consumers","min_consumer_w","update_interval_s","appearance"];function va(e){if(ya.includes(e)||"consumers"===e)return e;if("battery_soc"===e)return"entities.battery_soc";if(e.startsWith("grid_status"))return"entities.grid_status";for(const t of xr){if(e===t||e===`${t}_source`||e===`${t}_sources`||e===`${t}_invert`||(Nr[t]??[]).includes(e))return`entities.${t}`}return"rest_label"===e||e.startsWith("list_")||"scope"===e||"default_scope"===e?"list":e.startsWith("ring_")?"ring":e.startsWith("power_")?"power":la.includes(e)?"view":aa.includes(e)?"flow":e.startsWith("color_")||"soc_stops"===e?"colors":e.startsWith("node_")?"nodes":e.startsWith("icon_")?"icons":void 0}const ba={"entities.battery_soc":["entities.battery"],nodes:["entities.battery"],colors:["entities.battery","nodes"]};function xa(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,i)=>xa(e,t[i]));if(ta(e)&&ta(t)){return[...new Set([...Object.keys(e),...Object.keys(t)])].every(i=>xa(e[i],t[i]))}return!1}function ka(e){if(null!==e&&("string"!=typeof e||""!==e.trim())){if(Array.isArray(e)){const t=e.map(ka).filter(e=>void 0!==e);return t.length?t:void 0}if(ta(e)){const t={};for(const[i,o]of Object.entries(e)){const e=ka(o);void 0!==e&&(t[i]=e)}return Object.keys(t).length?t:void 0}return e}}const $a=e=>ta(e)?e:{};function Sa(e,t){const i=e,o=function(e,t){const i=new Set;for(const o of new Set([...Object.keys(e),...Object.keys(t)])){const s=va(o);s&&!xa(e[o],t[o])&&i.add(s)}for(const[e,t]of Object.entries(ba))t.some(e=>i.has(e))&&i.add(e);return i}(i,Ur(t)),s=t,n=$a(t.entities),r=(e,t,i)=>o.has(e)?t():ka(i),a={...n};for(const e of xr)a[e]=r(`entities.${e}`,()=>Qr(e,i),n[e]);const l=void 0!==a.battery;a.battery_soc=r("entities.battery_soc",()=>l?Gr(e.battery_soc):void 0,n.battery_soc),a.grid_status=r("entities.grid_status",()=>{const t=Gr(e.grid_status);return t?ia({...Br(n.grid_status,["entity","outage","ok"]),entity:t,outage:Xr(e.grid_status_outage),ok:Xr(e.grid_status_ok)}):void 0},n.grid_status);const c=[...xr,"battery_soc","grid_status"].map(e=>`entities.${e}`),d=ta(t.entities)||c.some(e=>o.has(e))?ia(a):ka(t.entities);return{...t,type:t.type,title:r("title",()=>Gr(e.title),s.title),entities:d,consumers:r("consumers",()=>function(e){if(!Array.isArray(e))return;const t=new Set,i=[];for(const o of e){if(!ta(o))continue;const e=ia({...o,charge:ea(o.charge),condition:zr(o.show,o.condition)}),s=e?.entity;e&&"string"==typeof s&&!t.has(s)&&(t.add(s),i.push(e))}return i.length?i:void 0}(e.consumers),s.consumers),max_consumers:r("max_consumers",()=>Yr(e.max_consumers),s.max_consumers),min_consumer_w:r("min_consumer_w",()=>Yr(e.min_consumer_w),s.min_consumer_w),update_interval_s:r("update_interval_s",()=>Yr(e.update_interval_s),s.update_interval_s),appearance:r("appearance",()=>Gr(e.appearance),s.appearance),layout:r("layout",()=>Gr(e.layout),s.layout),list:r("list",()=>ia({...Br(s.list,["enabled","rest_label","always_below","scope","default_scope","solar"]),enabled:e.list_enabled,solar:e.list_solar,rest_label:e.rest_label,always_below:e.list_always_below,scope:sa(e.scope,fa),default_scope:na(e.default_scope,e.scope,fa)}),s.list),ring:r("ring",()=>ia({...Br(s.ring,["enabled","animation","solar"]),enabled:e.ring_enabled,solar:e.ring_solar,animation:Gr(e.ring_animation)}),s.ring),power:r("power",()=>ia({...Br(s.power,["unit","decimals","digits"]),unit:Gr(e.power_unit),decimals:Yr(e.power_decimals),digits:Yr(e.power_digits)}),s.power),view:r("view",()=>ia({...Br(s.view,["modes","default_mode","avg_short_minutes","avg_long_minutes","show_selector","energy_periods","default_energy","pv_scales","default_pv_scale","quick_style","expanded"]),quick_style:Gr(e.quick_style),expanded:ua(e,ta(s.view)?s.view.expanded:void 0),modes:sa(e.modes,pa),default_mode:na(e.default_mode,e.modes,pa),avg_short_minutes:Yr(e.avg_short_minutes),avg_long_minutes:Yr(e.avg_long_minutes),energy_periods:sa(e.energy_periods,ma),default_energy:na(e.default_energy,e.energy_periods,ma),pv_scales:sa(e.pv_scales,ga),default_pv_scale:na(e.default_pv_scale,e.pv_scales,ga)}),s.view),flow:r("flow",()=>ia({...$a(t.flow),lines:e.flow_lines,inactive_lines:e.inactive_lines,animation:e.animation,design:e.design,dot_color:Gr(e.dot_color),dot_size:Jr(e.dot_size),line_width:Jr(e.line_width),min_w:Yr(e.min_w),peak_w:Yr(e.peak_w),slow_below_w:Yr(e.slow_below_w),full_speed_w:Yr(e.full_speed_w),more_dots_above_w:Yr(e.more_dots_above_w),max_dots_at_w:Yr(e.max_dots_at_w),max_dots:Yr(e.max_dots),slow_s:Yr(e.slow_s),fast_s:Yr(e.fast_s)}),s.flow),colors:r("colors",()=>ia({...$a(t.colors),...Object.fromEntries(Lr.map(e=>[e,i[`color_${e}`]])),...void 0!==i.soc_stops?{soc_stops:i.soc_stops}:{},arrows:i.color_arrows,...jr(i,l)}),s.colors),nodes:r("nodes",()=>function(e,t,i){const o=Br(i,xr);for(const s of xr){if("battery"===s&&!t)continue;const n=`node_${s}_`,r=ta(i)?i[s]:void 0,a=ta(r)?r:{},l=ia({...Br(a,Vr),show_name:!1!==e[`${n}show_name`]&&void 0,show_state:(!Ir(s)||!1!==e[`${n}show_state`])&&void 0,inside:qr(s,"inside")?Kr(e,s,"inside",a.inside):void 0,label:Kr(e,s,"label",a.label)});l&&(o[s]=l)}return ia(o)}(i,l,t.nodes),s.nodes),icons:r("icons",()=>ia({...Br(s.icons,Pr),...Object.fromEntries(Pr.map(e=>[e,i[`icon_${e}`]]))}),s.icons)}}function Aa(e){return{select:{mode:"dropdown",options:["ha","0","1","2","3","sig2","sig3","sig4"].map(t=>({value:t,label:e(`decimals_${t}`)}))}}}function Ma(e){return{select:{mode:"dropdown",options:["normal","medium","bold"].map(t=>({value:t,label:e(`weight_${t}`)}))}}}const Ea={name:"colors_hint",type:"constant"};function Ca(e){const{min:t,max:i}=_t[e];return void 0===i?{min:t}:{min:t,max:i}}const za=new Set(Object.keys(_t).map(e=>Pa(e)).filter(e=>void 0!==e));function Pa(e){return e.startsWith("view.")||e.startsWith("flow.")?e.slice(5):e.startsWith("power.")?e.replace(".","_"):e.includes(".")||e.includes("[")?void 0:e}function Wa(e){const t=e.schema;return t?t.flatMap(Wa):"string"==typeof e.name?[e.name]:[]}const Na={current:"mode_current",avg_short:"mode_short",avg_long:"mode_long"};function Fa(e){const t=ra(e)?sa(e.energy_periods,ma)??wa:["power"];return{modes:sa(e.modes,pa)??pa,energy_periods:t,scope:sa(e.scope,fa)??fa}}function La(e){const t=Array.isArray(e.consumers)&&e.consumers.some(e=>ta(e)&&Zr(e.entity)),i=(e,t)=>null==e||""===e?t:e,o=i(e.layout,"cross");return{list_enabled:i(e.list_enabled,t),ring_enabled:i(e.ring_enabled,t),ring_solar:i(e.ring_solar,!0),quick_style:i(e.quick_style,"segment"),layout:o,flow_lines:i(e.flow_lines,"cross"===o?"curved":"straight"),appearance:i(e.appearance,"auto"),ring_animation:i(e.ring_animation,"overtake"),power_unit:i(e.power_unit,"kW"),power_decimals:i(e.power_decimals,2),power_digits:i(e.power_digits,3),inactive_lines:i(e.inactive_lines,"show"),animation:i(e.animation,"auto"),design:i(e.design,ki)}}function Ra(e,t,i){return t.map(t=>({value:t,label:i(t),...1===e.length&&e[0]===t?{disabled:!0}:{}}))}function Oa(e,t){const i=t=>Oe(`editor.${t}`,e),o=Fa(t),s=o.energy_periods.includes("power"),n=Array.isArray(t.consumers)&&t.consumers.length>0,r=xr.filter(e=>"derived"===t[`${e}_source`]),a="sources"===t.solar_source,l=(Array.isArray(t.solar_sources)?t.solar_sources:[]).filter(e=>ta(e)&&Zr(e.entity)),c=l.length>1,d=l.length>0&&l.every(e=>void 0!==Yr(e.kwp)),h=(sa(t.pv_scales,ga)??ga).filter(e=>"share"===e?c:d),u=xr.map(o=>{const s=function(e,t,i,o){const s=t[`${e}_source`]??Or(e,void 0),n=Wr[e].filter(e=>"derived"!==e||!i||"derived"===s).map(t=>({value:t,label:o("split"===t?`source_split_${e}`:`source_${t}`)})),r=[{name:`${e}_source`,selector:{select:{mode:"dropdown",options:n}}}];if("entity"===s)r.push({type:"grid",name:"",schema:[{name:e,selector:{entity:{filter:vr}}},{name:`${e}_invert`,selector:{boolean:{}}}]});else if("split"===s)for(const t of Nr[e]??[])r.push({name:t,selector:{entity:{filter:vr}}});return r}(o,t,r.some(e=>e!==o),i);return"battery"===o&&"none"!==t.battery_source&&s.push({name:"battery_soc",selector:{entity:{filter:br}}}),{name:`entities_${o}`,type:"expandable",flatten:!0,title:Oe(`node.${o}`,e),schema:s}}),p="string"==typeof t.grid_status?t.grid_status:void 0,m=p?e.states?.[p]?.attributes.options:void 0,f={select:{multiple:!0,custom_value:!0,mode:"list",options:(Array.isArray(m)?m:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e}))}};return[{name:"title",selector:{text:{}}},{name:"entities",type:"expandable",flatten:!0,title:i("entities"),schema:[...u,Ea]},{name:"nodes",type:"expandable",flatten:!0,title:i("nodes"),schema:[...xr.filter(e=>"battery"!==e||"none"!==t.battery_source).map(o=>function(e,t,i,o){const s=`node_${e}_`,n=[{name:`${s}show_name`,selector:{boolean:{}}}];Ir(e)&&n.push({name:`${s}show_state`,selector:{boolean:{}}});for(const i of Dr){if(!qr(e,i))continue;const r=`${s}${i}_`;n.push({name:`${r}entity`,selector:{entity:{}}}),Zr(t[`${r}entity`])&&("inside"===i?n.push({name:`${r}position`,selector:{select:{mode:"dropdown",options:[{value:"above",label:o("position_above")},{value:"below",label:o("position_below")}]}}}):n.push({name:`${r}prefix`,selector:{text:{}}}),n.push({name:`${r}decimals`,selector:Aa(o)},{name:`${r}size`,selector:{number:{min:60,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:`${r}weight`,selector:Ma(o)}))}return{name:`node_${e}`,type:"expandable",flatten:!0,title:Oe(`node.${e}`,i),schema:n}}(o,t,e,i)),Ea]},...a?[{name:$r,type:"constant"}]:[],{name:kr,type:"constant"},{name:"grid_status",type:"expandable",flatten:!0,title:i("grid_status_section"),schema:[{name:"grid_status",selector:{entity:{}}},{name:"grid_status_outage",selector:f},{name:"grid_status_ok",selector:f}]},{name:"display",type:"expandable",flatten:!0,title:i("display"),schema:[{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"cross",label:i("layout_cross")},{value:"square_right",label:i("layout_square_right")},{value:"square_left",label:i("layout_square_left")},{value:"triangle",label:i("layout_triangle")},{value:"triangle_battery",label:i("layout_triangle_battery")}]}}},{name:"flow_lines",selector:{select:{mode:"dropdown",options:[{value:"curved",label:i("lines_curved")},{value:"straight",label:i("lines_straight")}]}}},{name:"appearance",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("appearance_auto")},{value:"light",label:i("appearance_light")},{value:"dark",label:i("appearance_dark")}]}}},{name:"list_enabled",selector:{boolean:{}}},...a?[{name:"list_solar",selector:{boolean:{}}}]:[],{name:"list_always_below",selector:{boolean:{}}},{name:"ring_enabled",selector:{boolean:{}}},...a?[{name:"ring_solar",selector:{boolean:{}}}]:[],{name:"ring_animation",selector:{select:{mode:"dropdown",options:[{value:"overtake",label:i("ring_overtake")},{value:"fade",label:i("ring_fade")},{value:"jump",label:i("ring_jump")}]}}},{name:"max_consumers",selector:{number:{...Ca("max_consumers"),mode:"box"}}},{name:"min_consumer_w",selector:{number:{...Ca("min_consumer_w"),mode:"box"}}},{name:"rest_label",selector:{text:{}}},{name:"power_unit",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("power_auto")},{value:"kW",label:i("power_kw")},{value:"W",label:i("power_w")}]}}},..."auto"===t.power_unit?[{name:"power_digits",selector:{select:{mode:"dropdown",options:[{value:2,label:"2"},{value:3,label:"3"},{value:4,label:"4"}]}}}]:[],..."W"===t.power_unit||"auto"===t.power_unit?[]:[{name:"power_decimals",selector:{select:{mode:"dropdown",options:[{value:1,label:"1"},{value:2,label:"2"},{value:3,label:"3"}]}}}],{name:"update_interval_s",selector:{number:{...Ca("update_interval_s"),mode:"box"}}}]},(()=>{const r=(e,t,i=!1)=>t.length>1?[{name:`expanded_${e}`,disabled:i,selector:{boolean:{}}}]:[],l=[{name:"quick_style",selector:{select:{mode:"dropdown",options:da.map(e=>({value:e,label:i(`quick_style_${e}`)}))}}}],u=[{name:"modes",disabled:!s,selector:{select:{multiple:!0,mode:"list",options:Ra(o.modes,pa,e=>i(Na[e]))}}},{name:"avg_short_minutes",disabled:!s,selector:{number:{...Ca("view.avg_short_minutes"),mode:"box"}}},{name:"avg_long_minutes",disabled:!s,selector:{number:{...Ca("view.avg_long_minutes"),mode:"box"}}},...r("modes",o.modes,!s)],p=[{name:"energy_periods",disabled:!ra(t),selector:{select:{multiple:!0,mode:"list",options:Ra(o.energy_periods,ma,e=>i(`energy_${e}`))}}},...r("energy_periods",o.energy_periods,!ra(t))],m=n?[{name:"scope",selector:{select:{multiple:!0,mode:"list",options:Ra(o.scope,fa,e=>i(`scope_${e}`))}}},...r("scope",o.scope)]:[],f=!1!==t.ring_solar,g=a&&f&&(c||d),_=g?[{name:"pv_scales",selector:{select:{multiple:!0,mode:"list",options:Ra(h,ga,e=>i(`pv_scale_${e}`)).map(e=>"share"===e.value&&!c||"peak"===e.value&&!d?{...e,disabled:!0}:e)}}},...r("pv_scales",h.filter(e=>"share"===e?c:d))]:[],w=g?d?c?void 0:Oe("editor_help.pv_scale_share_locked",e):Oe("editor_help.pv_scale_peak_locked",e):void 0;return{name:"quick_buttons",type:"expandable",flatten:!0,title:i("quick_buttons"),schema:[...l,...u,...p,..._,...m],parts:[{title:i("group_quick_style"),schema:l},{title:i("group_smoothing"),notice:s?void 0:Oe("editor_help.modes_locked",e),schema:u},{title:i("group_energy"),schema:p},...g?[{title:i("group_pv_scale"),notice:w,schema:_}]:[],...n?[{title:i("group_scope"),schema:m}]:[]]}})(),{name:"flow",type:"expandable",flatten:!0,title:i("flow"),schema:[{name:"min_w",selector:{number:{...Ca("flow.min_w"),mode:"box"}}},{name:"peak_w",selector:{number:{...Ca("flow.peak_w"),mode:"box"}}},{name:"inactive_lines",selector:{select:{mode:"dropdown",options:[{value:"show",label:i("lines_show")},{value:"dim",label:i("lines_dim")},{value:"hide",label:i("lines_hide")}]}}},{name:"animation",selector:{select:{mode:"dropdown",options:[{value:"auto",label:i("anim_auto")},{value:"on",label:i("anim_on")},{value:"off",label:i("anim_off")}]}}},{name:"design",selector:{select:{mode:"dropdown",options:[{value:ki,label:i("design_none")},...$i.map(t=>({value:t.id,label:Ai(t,e)}))]}}},{name:"dot_size",selector:{number:{...Ca("flow.dot_size"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"line_width",selector:{number:{...Ca("flow.line_width"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"flow_fine",type:"expandable",flatten:!0,title:i("flow_fine"),schema:[{name:"slow_below_w",selector:{number:{...Ca("flow.slow_below_w"),mode:"box"}}},{name:"full_speed_w",selector:{number:{...Ca("flow.full_speed_w"),mode:"box"}}},{name:"more_dots_above_w",selector:{number:{...Ca("flow.more_dots_above_w"),mode:"box"}}},{name:"max_dots_at_w",selector:{number:{...Ca("flow.max_dots_at_w"),mode:"box"}}},{name:"max_dots",selector:{number:{...Ca("flow.max_dots"),mode:"box"}}},{name:"slow_s",selector:{number:{...Ca("flow.slow_s"),step:.1,mode:"box"}}},{name:"fast_s",selector:{number:{...Ca("flow.fast_s"),step:.1,mode:"box"}}}]}]},{name:"icons",type:"expandable",flatten:!0,title:i("icons"),schema:Pr.map(e=>({name:`icon_${e}`,selector:{icon:{}}}))}]}class Ta extends ce{constructor(){super(...arguments),this._openColors=new Set,this._pickerMode="hex",this._consumerKeys=[],this._nextConsumerKey=0,this._openConsumers=new Set,this._builtSections=new Set,this._builtConsumers=new Set,this._label=e=>{const t=e.name,i=/^node_(?:solar|grid|house|battery)_(.+)$/.exec(t);return i?Oe(`editor.node_${i[1]}`,this.hass):"grid_status"===t?Oe("editor.grid_status",this.hass):t.endsWith("_source")?Oe(`editor.${t.replace(/_source$/,"")}`,this.hass):t.endsWith("_invert")?Oe("editor.invert",this.hass):t.startsWith("icon_")?Oe(`editor.${t.slice(5)}`,this.hass):xr.includes(t)?Oe("editor.entity",this.hass):Oe(`editor.${t}`,this.hass)},this._helper=e=>{if("grid_status"===e.name)return"";const t=this._flat??{};if("energy_periods"===e.name&&!ra(t))return Oe("editor_help.energy_periods_locked",this.hass);let i=`editor_help.${e.name.replace(/^node_(?:solar|grid|house|battery)_/,"node_")}`;if(e.name.startsWith("color_")&&(i="editor_help.color"),e.name.endsWith("_source")){if("derived"!==(this._flat??{})[e.name])return"";i="editor_help.derived"}const o=Oe(i,this.hass);return o===i?"":o},this._probe=e=>{const t=this.shadowRoot;if(!t||"undefined"==typeof getComputedStyle)return"";const i=document.createElement("span");if(i.style.display="none",i.style.color=e,""===i.style.color)return"";t.appendChild(i);const o=getComputedStyle(i).color;return i.remove(),o},this._hexTyped=e=>{const t=e.target,i=Ee(t.value);i&&this._picker?(this._picker={id:this._picker.id,hsv:Ce(i,this._picker.hsv.h)},this._applyColor(this._picker.id,i)):this._picker&&(t.value=ze(this._picker.hsv))},this._addStop=()=>{const e=this._socStops();if(!e)return;const t=e.length-1;let i=50,o=t,s=-1;for(let n=1;n<=t;n++){const t=e[n].at-e[n-1].at;t>s&&(s=t,o=n,i=Math.round((e[n].at+e[n-1].at)/2))}const n=[...e];n.splice(o,0,{at:i,color:e[o].color}),this._writeStops(n)},this._notes=new Map,this._sourceLabel=e=>Oe(`editor.pv_source_${e.name}`,this.hass),this._sourceHelper=e=>{const t=`editor_help.pv_source_${e.name}`,i=Oe(t,this.hass);return i===t?"":i},this._consumerLabel=e=>{if(e.labelKey)return Oe(`editor.${e.labelKey}`,this.hass);const t=`editor.consumer_${e.name}`,i=Oe(t,this.hass);return i===t?Oe(`editor.${e.name}`,this.hass):i},this._consumerHelper=e=>{const t=`editor_help.${e.labelKey??`consumer_${e.name}`}`,i=Oe(t,this.hass);return i===t?"":i},this._addConsumer=()=>{const e=[...this._consumerRows(),{}],t=[...this._keysFor(e.length-1),this._nextConsumerKey++];this._openConsumers=new Set([...this._openConsumers,t[t.length-1]]),this._builtConsumers=new Set([...this._builtConsumers,t[t.length-1]]),this._writeConsumers(e,t)},this._moveConsumer=e=>{e.stopPropagation(),this._moveTo(e.detail.oldIndex,e.detail.newIndex)}}setConfig(e){this._config=e,void 0!==this._flat&&JSON.stringify(e)===this._emitted||(this._flat=Ur(e),this._consumerKeys=[],this._openConsumers=new Set),queueMicrotask(()=>this._fixOnOpen(e))}connectedCallback(){super.connectedCallback();const e=this._config;e&&queueMicrotask(()=>this._fixOnOpen(e))}_fixOnOpen(e){if(this._config!==e||this._fixedFor===e||!this.isConnected)return;this._fixedFor=e;let t=function(e){const t=e.view;if(!ta(t)||!1!==t.show_selector)return;let i;try{i=oi(e)}catch{return}const{show_selector:o,...s}=t,n={...e,view:{...s,modes:i.view.modes,energy_periods:sa(s.energy_periods,ma)??(i.view.power?["power"]:i.view.energyPeriods)}};return i.consumers.length>0&&(n.list={...e.list??{},scope:i.list.scope}),i.view.pvScales.length>0&&(n.view.pv_scales=i.view.pvScales),n}(e);const i=ri(e.memory_id);if((void 0===i||this._twiceInDashboard(i))&&(t={...t??e,memory_id:si()}),!t)return;const o=t;this._config=o,this._fixedFor=o,this._flat=Ur(o),this._emitted=JSON.stringify(o),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:o},bubbles:!0,composed:!0})),this.requestUpdate()}_twiceInDashboard(e){let t=this;for(;t;){const i=t.lovelace?.config;if(i){return ni(i.views).filter(t=>ri(t.memory_id)===e).length>1}t=t.parentNode??(t instanceof ShadowRoot?t.host:null)}return!1}_shownFlat(){const e=this._flat??{};return this._shown?.from!==e&&(this._shown={from:e,data:{...e,...Fa(e),...La(e)}}),this._shown.data}_valueChanged(e){const t={...e.detail.value},i=this._flat??{},o=Fa(i);for(const e of["modes","energy_periods","scope"]){!(void 0!==sa(i[e],_a[e]))&&xa(t[e],o[e])&&(t[e]=void 0)}const s=La(i);for(const[e,o]of Object.entries(s)){(void 0===i[e]||null===i[e]||""===i[e])&&xa(t[e],o)&&(t[e]=void 0)}this._emit(t)}_emit(e){if(!this._config)return;this._flat=e;const t=Sa(e,this._config);this._emitted=JSON.stringify(t),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_setColor(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t;this._emit({...this._flat,[`color_${e}`]:i})}_renderColors(){return H`
      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">${(e=>Oe(`editor.${e}`,this.hass))("colors")}</div>
        <div class="colors">
          ${this._picker?H`<div
                  class="scrim"
                  @pointerdown=${e=>{e.stopPropagation(),this._picker=void 0}}
                ></div>`:""}
          <p class="hint">${Oe("editor_help.color",this.hass)}</p>
          ${Lr.map(e=>this._renderNodeColor(e))}
          ${this._renderExtraColors()}
          ${this._renderDotColor()} ${this._renderArrowColors()} ${this._renderConsumerColors()}
          ${this._renderSocStops()}
        </div>
      </ha-expansion-panel>
    `}_renderExtraColors(){const e=this._flat??{},t=[];for(const i of xr)if("battery"!==i||"none"!==e.battery_source)for(const o of Dr){if(!qr(i,o)||!Zr(e[`node_${i}_${o}_entity`]))continue;const s=`color_${i}_${o}`,n=e[s],r=Oe(`editor.color_extra_${o}`,this.hass,{node:Oe(`node.${i}`,this.hass)});t.push(this._colorRow({id:`flat:${s}`,label:r,name:r,value:"string"==typeof n?n:"",preset:"var(--secondary-text-color)"}))}return t.length?H`${this._group(Oe("editor.colors_extras",this.hass))}${t}`:""}_group(e){return H`<p class="group">${e}</p>`}_renderNodeColor(e){const t=this._flat?.[`color_${e}`],i=Oe(`editor.color_${e}`,this.hass);return this._colorRow({id:`node:${e}`,label:i,name:i,value:"string"==typeof t?t:"",preset:ye[e]})}_renderDotColor(){const e=this._flat?.dot_color,t="string"==typeof e&&""!==e.trim(),i=Oe("editor.dot_color",this.hass);return H`
      ${this._group(Oe("editor.colors_dots",this.hass))}
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!t}
          @change=${i=>{const o=i.target.checked;o&&t&&(this._lastDotColor=e),this._setFlat("dot_color",o?"":this._lastDotColor??Rr)}}
        />
        <span>${Oe("editor.dot_color_follow",this.hass)}</span>
      </label>
      ${t?this._colorRow({id:"flat:dot_color",label:i,name:i,value:e,preset:Rr}):j}
    `}_renderArrowColors(){const e=this._flat?.color_arrows;return H`
      ${this._group(Oe("editor.colors_arrows",this.hass))}
      <label class="switch">
        <input
          class="arrow-colors"
          type="checkbox"
          .checked=${"direction"!==e}
          @change=${e=>{const t=e.target.checked;this._setFlat("color_arrows",t?"":"direction")}}
        />
        <span>${Oe("editor.arrow_colors_red_green",this.hass)}</span>
      </label>
    `}_renderConsumerColors(){const e=this._flat?.consumers,t=(Array.isArray(e)?e:[]).map((e,t)=>({entry:e,index:t})).filter(e=>ta(e.entry));if(0===t.length)return H``;const i=be;return H`
      ${this._group(Oe("editor.colors_consumers",this.hass))}
      ${t.map(({entry:e,index:t})=>{const o="string"==typeof e.name&&e.name.trim()||("string"==typeof e.entity?e.entity:`#${t+1}`);return this._colorRow({id:`consumer:${t}`,label:o,name:o,value:"string"==typeof e.color?e.color:"",preset:i[t%i.length]})})}
    `}_renderSocStops(){const e=this._socStops();if(!e)return H`
        ${this._group(Oe("editor.colors_soc",this.hass))}
        <p class="hint">${Oe("editor.yaml_only",this.hass)}</p>
      `;const t=e.length-1;return H`
      ${this._group(Oe("editor.colors_soc",this.hass))}
      ${e.map((e,i)=>{const o=0===i||i===t;return this._colorRow({id:`stop:${i}`,label:`${e.at} %`,name:H`
            <span class="at">
              ${o?H`<span class="fixed">${e.at}</span>`:H`<input
                      class="percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      .value=${String(e.at)}
                      aria-label=${Oe("editor.color_at",this.hass)}
                      @change=${e=>this._setStopAt(i,Number(e.target.value))}
                    />`}
              <span class="unit">%</span>
            </span>
          `,value:e.color,preset:e.color,trail:o?void 0:H`<button
                class="reset"
                title=${Oe("editor.color_remove",this.hass)}
                aria-label=${Oe("editor.color_remove",this.hass)}
                @click=${()=>this._removeStop(i)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>`})})}
      <button class="add" @click=${this._addStop}>
        <ha-icon icon="mdi:plus"></ha-icon>${Oe("editor.color_add_stop",this.hass)}
      </button>
    `}_colorRow(e){const{id:t,label:i,name:o,value:s,preset:n,trail:r}=e,a=this._openColors.has(t),l=this._picker?.id===t,c=`color-field-${t.replace(":","-")}`,d=l?ze(this._picker.hsv):Ee(s||n,this._probe)??"#888888";return H`
      <div class="color ${a?"open":""} ${l?"picking":""}">
        <div class="head">
          <button
            class="swatch"
            data-key=${t}
            style="background:${d}"
            aria-label=${`${i} - ${Oe("editor.color_pick",this.hass)}`}
            aria-haspopup="dialog"
            aria-expanded=${l?"true":"false"}
            @click=${()=>this._togglePicker(t,d)}
          ></button>
          <span class="name">${o}</span>
          <span class="css">${s||Oe("editor.color_default",this.hass)}</span>
          <button
            class="more"
            aria-expanded=${a?"true":"false"}
            aria-controls=${c}
            @click=${()=>this._toggleColor(t)}
          >
            ${Oe("editor.color_css",this.hass)} ${a?"▴":"▾"}
          </button>
          ${r??""}
        </div>
        ${l?this._renderPicker(d):""}
        <div class="body" id=${c} ?hidden=${!a}>
          <ha-textfield
            .label=${i}
            .value=${s}
            .placeholder=${n}
            @input=${e=>this._applyColor(t,e.target.value)}
          ></ha-textfield>
          <button
            class="reset"
            ?disabled=${""===s}
            title=${Oe("editor.color_reset",this.hass)}
            aria-label=${Oe("editor.color_reset",this.hass)}
            @click=${()=>this._applyColor(t,"")}
          >
            <ha-icon icon="mdi:backup-restore"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPicker(e){const{h:t,s:i,v:o}=this._picker.hsv;return H`
      <div
        class="picker"
        role="dialog"
        aria-label=${Oe("editor.color_pick",this.hass)}
        @keydown=${this._pickerKeydown}
      >
        <div
          class="sv"
          tabindex="0"
          role="group"
          aria-label=${Oe("editor.color_sv",this.hass)}
          style="--hue:${t}"
          @pointerdown=${e=>this._drag(e,"sv")}
        >
          <span class="knob" style="left:${100*i}%;top:${100*(1-o)}%"></span>
        </div>
        <div
          class="hue"
          tabindex="0"
          role="slider"
          aria-label=${Oe("editor.color_hue",this.hass)}
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow=${Math.round(t)}
          @pointerdown=${e=>this._drag(e,"hue")}
        >
          <span class="knob" style="left:${t/360*100}%"></span>
        </div>
        <div class="foot">
          <span class="chip" style="background:${e}"></span>
          ${"hex"===this._pickerMode?H`<input
                  class="hex"
                  type="text"
                  spellcheck="false"
                  .value=${e}
                  aria-label=${Oe("editor.color_hex",this.hass)}
                  @change=${this._hexTyped}
                />`:H`<code class="reading">${e}</code>`}
          <div class="modes" role="group" aria-label=${Oe("editor.color_mode",this.hass)}>
            ${["hex","rgb","hsl"].map(e=>H`<button
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
    `}_renderChannels(){const e=this._picker.hsv,t="rgb"===this._pickerMode,i=Pe(e),o=t?(()=>{const t=/^#(..)(..)(..)$/.exec(ze(e)),[i,o,s]=t?[1,2,3].map(e=>Number.parseInt(t[e],16)):[0,0,0];return[{key:"r",label:"R",value:i,max:255},{key:"g",label:"G",value:o,max:255},{key:"b",label:"B",value:s,max:255}]})():[{key:"h",label:"H",value:Math.round(i.h),max:360},{key:"s",label:"S",value:Math.round(100*i.s),max:100},{key:"l",label:"L",value:Math.round(100*i.l),max:100}];return H`
      <div class="channels">
        ${o.map(e=>H`
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
    `}_setChannel(e,t,i){if(!this._picker||!Number.isFinite(t))return;const o=this._picker.hsv;let s;if("r"===e||"g"===e||"b"===e){const i=/^#(..)(..)(..)$/.exec(ze(o)),n=i?[1,2,3].map(e=>Number.parseInt(i[e],16)):[0,0,0];n["rgb".indexOf(e)]=Math.min(255,Math.max(0,Math.round(t)));const r=`#${n.map(e=>e.toString(16).padStart(2,"0")).join("")}`;s=Ce(r,o.h)}else{const i=Pe(o),n=Math.max(0,t);"h"===e&&(i.h=Math.min(360,n)%360),"s"===e&&(i.s=Math.min(100,n)/100),"l"===e&&(i.l=Math.min(100,n)/100),s={...We(i),h:i.h}}this._picker={id:this._picker.id,hsv:s},i&&this._commitPicker()}_renderInUse(){const e=this._coloursInUse();return 0===e.length?H``:H`
      <div class="used">
        <span class="cap">${Oe("editor.color_used",this.hass)}</span>
        <div class="chips">
          ${e.map(e=>H`<button
              class="chip"
              style="background:${e.hex}"
              title=${e.value}
              aria-label=${e.value}
              @click=${()=>this._takeColour(e.value,e.hex)}
            ></button>`)}
        </div>
      </div>
    `}_coloursInUse(){const e=this._flat??{},t=[],i=new Set,o=e=>{if("string"!=typeof e||""===e.trim())return;const o=Ee(e,this._probe);o&&!i.has(o)&&(i.add(o),t.push({value:e,hex:o}))};for(const t of Lr)o(e[`color_${t}`]??ye[t]);(Array.isArray(e.consumers)?e.consumers:[]).forEach((e,t)=>{ta(e)&&o(e.color??be[t%be.length])});for(const e of this._socStops()??[])o(e.color);return t}_takeColour(e,t){this._picker&&(this._picker={id:this._picker.id,hsv:Ce(t,this._picker.hsv.h)},this._applyColor(this._picker.id,e))}_applyColor(e,t){const i=e.indexOf(":"),o=e.slice(0,i),s=e.slice(i+1);"flat"===o?this._setFlat(s,t):"node"===o?this._setColor(s,t):"consumer"===o?this._setConsumerColor(Number(s),t):"stop"===o&&this._setStopColor(Number(s),t)}_setFlat(e,t){if(!this._flat)return;const i=""===t.trim()?void 0:t;this._emit({...this._flat,[e]:i})}_setConsumerColor(e,t){if(!this._flat)return;const i=this._flat,o=Array.isArray(i.consumers)?[...i.consumers]:[];if(!ta(o[e]))return;const{color:s,...n}=o[e];o[e]=""===t.trim()?n:{...n,color:t},this._emit({...i,consumers:o})}_socStops(){const e=this._flat?.soc_stops;if(null==e||""===e)return ve.map(e=>({...e}));return Array.isArray(e)&&e.length>=2&&e.every(e=>ta(e)&&"number"==typeof e.at&&Number.isFinite(e.at)&&Zr(e.color))?e:void 0}_writeStops(e){this._flat&&this._emit({...this._flat,soc_stops:e})}_setStopColor(e,t){const i=this._socStops();""!==t.trim()&&i&&this._writeStops(i.map((i,o)=>o===e?{...i,color:t}:i))}_setStopAt(e,t){const i=this._socStops();if(!i||!Number.isFinite(t)||e<=0||e>=i.length-1)return;const o=i[e-1].at,s=i[e+1].at,n=Math.min(s,Math.max(o,Math.round(t)));this._writeStops(i.map((t,i)=>i===e?{...t,at:n}:t))}_removeStop(e){const t=this._socStops();!t||t.length<=2||0===e||e===t.length-1||this._writeStops(t.filter((t,i)=>i!==e))}_togglePicker(e,t){this._picker?.id!==e?this._picker={id:e,hsv:Ce(t,this._picker?.hsv.h??0)}:this._picker=void 0}_drag(e,t){const i=e.currentTarget;e.preventDefault(),e.stopPropagation(),i.setPointerCapture?.(e.pointerId);const o=e=>{if(!this._picker)return;const o=i.getBoundingClientRect(),s=o.width?Math.min(1,Math.max(0,(e.clientX-o.left)/o.width)):0,n=o.height?Math.min(1,Math.max(0,(e.clientY-o.top)/o.height)):0,r=this._picker.hsv;this._picker={id:this._picker.id,hsv:"hue"===t?{h:360*s,s:r.s||1,v:r.v||1}:{...r,s:s,v:1-n}}},s=()=>{i.removeEventListener("pointermove",o),i.removeEventListener("pointerup",s),i.removeEventListener("pointercancel",s),this._commitPicker()};i.addEventListener("pointermove",o),i.addEventListener("pointerup",s),i.addEventListener("pointercancel",s),o(e)}_pickerKeydown(e){if("Escape"===e.key)return this._picker=void 0,void e.stopPropagation();if(!this._picker)return;const t=e.target.classList.contains("hue"),i=e.shiftKey?10:1,o={...this._picker.hsv};switch(e.key){case"ArrowLeft":t?o.h-=i:o.s-=i/100;break;case"ArrowRight":t?o.h+=i:o.s+=i/100;break;case"ArrowUp":if(t)return;o.v+=i/100;break;case"ArrowDown":if(t)return;o.v-=i/100;break;default:return}e.preventDefault(),e.stopPropagation(),this._picker={id:this._picker.id,hsv:{h:(o.h%360+360)%360,s:Math.min(1,Math.max(0,t?o.s||1:o.s)),v:Math.min(1,Math.max(0,t?o.v||1:o.v))}},this._commitPicker()}_commitPicker(){this._picker&&this._applyColor(this._picker.id,ze(this._picker.hsv))}_toggleColor(e){const t=new Set(this._openColors);t.delete(e)||t.add(e),this._openColors=t}render(){if(!this.hass||!this._config||!this._flat)return j;this._notesFor!==this._config&&(this._notesFor=this._config,this._notes=this._notesOf(this._config));const e=Oa(this.hass,this._flat),t=e.findIndex(e=>e.name===$r),i=e.findIndex(e=>e.name===kr),o=-1===i?e:e.slice(0,i);if(-1!==t){const s=o.slice(0,t),n=o.slice(t+1),r=-1===i?[]:e.slice(i+1),a=r.findIndex(e=>"icons"===e.name),l=-1===a?r.length:a;return H`${this._renderPieces(s)}${this._renderSources()}${this._renderPieces(n)}${this._renderConsumers()}${this._renderPieces(r.slice(0,l))}${this._renderColors()}${this._renderPieces(r.slice(l))}`}const s=-1===i?[]:e.slice(i+1),n=s.findIndex(e=>"icons"===e.name),r=-1===n?s.length:n;return H`${this._renderPieces(o)}${this._renderConsumers()}${this._renderPieces(s.slice(0,r))}${this._renderColors()}${this._renderPieces(s.slice(r))}`}_notesOf(e){const t=[];try{oi(e,this.hass,t)}catch{}const i=t.filter((e,i)=>t.findIndex(t=>t.field===e.field)===i);return new Map(i.flatMap(e=>{const t=Pa(e.field);if(!t)return[];const{min:i,max:o}=_t[e.field.replace(/\[\d+\]/,"")]??{min:0},s="order"===e.reason?`editor.note_order_${t}`:`editor.note_${e.reason}`,n=Oe(s,this.hass,{min:i,max:o??""});return[[t,n===s?Oe("editor.note_order",this.hass):n]]}))}_form(e){const t=[];let i=[];for(const o of e){i.push(o);const e=Wa(o);if(!e.some(e=>za.has(e)))continue;const s=e.filter(e=>this._notes.has(e));t.push(this._haForm(i));for(const e of s)t.push(H`<p class="field-note" role="note">${this._notes.get(e)}</p>`);i=[]}return(i.length>0||0===t.length)&&t.push(this._haForm(i)),H`${t}`}_haForm(e){return H`
      <ha-form
        .hass=${this.hass}
        .data=${this._shownFlat()}
        .schema=${e}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_renderPieces(e){const t=[];let i=[];for(const o of e)"expandable"===o.type?(i.length&&t.push(this._form(i)),i=[],t.push(this._renderSection(o))):i.push(o);return i.length&&t.push(this._form(i)),t}_renderParts(e){const t=e.parts??[e],i=e=>H`
      ${e.notice?H`<p class="section-notice" role="note">${e.notice}</p>`:j}
      ${yr(function(e){const t=[],i=e=>{if(Array.isArray(e))for(const o of e){o.disabled&&t.push(String(o.name));const e=o.selector?.select;for(const i of e?.options??[])i.disabled&&t.push(`${o.name}=${i.value}`);i(o.schema)}};return i(e),t.join(",")}(e.schema),this._form(e.schema))}
    `;return t[0]===e?[i(e)]:t.map(e=>H`<fieldset class="part">
        <legend class="part-title">${e.title}</legend>
        ${i(e)}
      </fieldset>`)}_renderSection(e){const t=String(e.name),i=this._builtSections.has(t),o=Oe(`editor_help.${t}`,this.hass),s=o===`editor_help.${t}`?"":o;return H`
      <ha-expansion-panel
        outlined
        class="section"
        data-section=${t}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&!i&&(this._builtSections=new Set([...this._builtSections,t]))}}
      >
        <div slot="header" role="heading" aria-level="3">${e.title}</div>
        <div class="section-content">
          ${s?H`<p class="section-description">${s}</p>`:j}
          ${i?this._renderParts(e):j}
        </div>
      </ha-expansion-panel>
    `}_sourceRows(){const e=this._flat?.solar_sources;return Array.isArray(e)?e:[]}_writeSources(e){this._flat&&this._emit({...this._flat,solar_sources:e})}_renderSources(){const e=e=>Oe(`editor.${e}`,this.hass),t=this._sourceRows();return H`
      <ha-expansion-panel outlined class="consumers-panel sources-panel">
        <div slot="header" role="heading" aria-level="3">${e("solar_sources")}</div>
        <div class="consumers">
          <p class="hint">${Oe("editor_help.solar_sources",this.hass)}</p>
          ${t.map((t,i)=>H`<div class="source">
              <ha-form
                .hass=${this.hass}
                .data=${t}
                .schema=${[{name:"entity",required:!0,selector:{entity:{filter:vr}}},{name:"name",selector:{text:{}}},{name:"kwp",selector:{number:{...Ca("entities.solar.kwp"),step:.01,mode:"box"}}},{name:"icon",selector:{icon:{}}},{name:"excluded",selector:{boolean:{}}}]}
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
    `}_consumerRows(){const e=this._flat?.consumers;return Array.isArray(e)?e:[]}_keysFor(e){for(;this._consumerKeys.length<e;)this._consumerKeys.push(this._nextConsumerKey++);return this._consumerKeys.length>e&&(this._consumerKeys.length=e),this._consumerKeys}_writeConsumers(e,t){this._flat&&(this._consumerKeys=t,this._emit({...this._flat,consumers:e}))}_renderConsumers(){const e=e=>Oe(`editor.${e}`,this.hass),t=this._consumerRows(),i=this._keysFor(t.length),o=t.map((e,t)=>({row:e,index:t,key:i[t]}));return H`
      <ha-expansion-panel outlined class="consumers-panel">
        <div slot="header" role="heading" aria-level="3">${e("consumers")}</div>
        <div class="consumers">
          <p class="hint">${Oe("editor_help.consumers_list",this.hass)}</p>
          ${this._renderHeldWarning(t)}
          <ha-sortable handle-selector=".handle" @item-moved=${this._moveConsumer}>
            <div class="consumer-list">
              ${ss(o,e=>e.key,e=>this._renderConsumer(e.row,e.index,e.key))}
            </div>
          </ha-sortable>
          <button class="add-consumer" type="button" @click=${this._addConsumer}>
            <ha-icon icon="mdi:plus"></ha-icon>${e("consumer_add")}
          </button>
          <p class="hint">${e("colors_hint")}</p>
        </div>
      </ha-expansion-panel>
    `}_renderHeldWarning(e){const t=this._config?.max_consumers;if("number"!=typeof t||!Number.isFinite(t))return j;const i=new Set,o=e.filter(e=>{if(!ta(e)||!Zr(e.entity)||i.has(e.entity))return!1;i.add(e.entity);const t=Er(e);if("always"===t.show)return!0;const o=zr(t.show,t.condition);return Boolean(o?.entity&&o.operator&&void 0!==o.value)}).length;return o<t?j:H`<p class="hint warn">
      ${Oe("editor_help.consumers_held_limit",this.hass,{held:o,limit:t})}
    </p>`}_renderConsumer(e,t,i){const o=e=>Oe(`editor.${e}`,this.hass),s=ta(e)?e:{},n="string"==typeof s.entity?s.entity:"",r=this.hass?.states?.[n]?.attributes?.friendly_name,a="string"==typeof s.name&&s.name.trim()||"string"==typeof r&&r||n||o("consumer_new"),l=ta(s.charge)?s.charge:void 0,c=Zr(l?.soc),d=be,h="string"==typeof s.color&&""!==s.color.trim()?s.color:d[t%d.length];return H`
      <ha-expansion-panel
        outlined
        class="consumer"
        .expanded=${this._openConsumers.has(i)}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&(this._builtConsumers.has(i)||(this._builtConsumers=new Set([...this._builtConsumers,i])))}}
        @expanded-changed=${e=>{if(e.target!==e.currentTarget)return;const t=new Set(this._openConsumers);e.detail.expanded?t.add(i):t.delete(i),this._openConsumers=t}}
      >
        <div slot="header" class="consumer-head">
          ${customElements.get("ha-sortable")?H`<ha-icon
                  class="handle"
                  icon="mdi:drag"
                  @click=${e=>e.stopPropagation()}
                  @keydown=${e=>e.stopPropagation()}
                ></ha-icon>`:H`<span class="move">
                  ${[-1,1].map(e=>H`<button
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
            icon=${"string"==typeof s.icon&&s.icon?s.icon:"mdi:flash"}
            style="color:${h}"
          ></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">${a}</span>
            ${n?H`<small>${n}</small>`:j}
          </span>
          ${c?H`<span class="badge"><ha-icon icon="mdi:battery-charging-70"></ha-icon>${o("charge")}</span>`:j}
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
        ${this._builtConsumers.has(i)?H`<ha-form
                .hass=${this.hass}
                .data=${Er(s)}
                .schema=${function(e,t){const i=t=>Oe(`editor.${t}`,e),o=ta(t.condition)?t.condition:{},s="string"==typeof o.entity?o.entity:"",n=e.states?.[s]?.attributes?.options,r=Sr(s)?["on","off"]:(Array.isArray(n)?n:[]).filter(e=>"string"==typeof e),a=Mr(o.operator)?{name:"value",labelKey:"condition_values",selector:{select:{multiple:!0,custom_value:!0,mode:"list",options:r.map(e=>({value:e,label:e}))}}}:{name:"value",labelKey:"condition_number",selector:{number:{mode:"box",step:"any"}}},l=[{name:"position",selector:{select:{mode:"dropdown",options:[{value:"",label:i("position_sorted")},{value:"top",label:i("position_top")},{value:"bottom",label:i("position_bottom")}]}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"",label:i("show_power")},{value:"always",label:i("show_always")},{value:"condition",label:i("show_condition")}]}}}];return"condition"===t.show&&l.push({name:"condition",type:"grid",schema:[{name:"entity",labelKey:"condition_entity",selector:{entity:{}}},{name:"operator",labelKey:"condition_operator",selector:{select:{mode:"dropdown",options:Ar.map(([e,t])=>({value:e,label:t}))}}},a]}),l.push({name:"charge",type:"expandable",title:i("charge"),schema:[{name:"soc",selector:{entity:{filter:br}}},{name:"label",selector:{text:{}}}]}),[{name:"entity",required:!0,selector:{entity:{filter:vr}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"min_w",selector:{number:{...Ca("consumers.min_w"),mode:"box"}}},{name:"display",type:"expandable",flatten:!0,title:i("consumer_display"),schema:l}]}(this.hass,Er(s))}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._consumerHelper}
                @value-changed=${e=>{e.stopPropagation(),this._setConsumer(t,e.detail.value)}}
              ></ha-form>`:j}
      </ha-expansion-panel>
    `}_setConsumer(e,t){const i=[...this._consumerRows()];i[e]=Er(t),this._writeConsumers(i,[...this._consumerKeys])}_removeConsumer(e){const t=[...this._consumerRows()],i=[...this._consumerKeys];t.splice(e,1),i.splice(e,1),this._writeConsumers(t,i)}_moveTo(e,t){const i=[...this._consumerRows()],o=[...this._consumerKeys];e===t||e>=i.length||(i.splice(t,0,...i.splice(e,1)),o.splice(t,0,...o.splice(e,1)),this._writeConsumers(i,o))}}Ta.properties={hass:{attribute:!1},_config:{state:!0},_flat:{state:!0},_openColors:{state:!0},_picker:{state:!0},_pickerMode:{state:!0},_openConsumers:{state:!0},_builtSections:{state:!0},_builtConsumers:{state:!0}},Ta.styles=n`
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
  `,customElements.get(li)||customElements.define(li,Ta);var Da=Object.freeze({__proto__:null,consumerView:Er,fieldOwner:va});export{He as ConfigError};
