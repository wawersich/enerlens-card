const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),i=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const o=this.t;if(t&&void 0===e){const t=void 0!==o&&1===o.length;t&&(e=i.get(o)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&i.set(o,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,o,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new s(i,e,o)},r=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const o of e.cssRules)t+=o.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,p=globalThis,m=p.trustedTypes,g=m?m.emptyScript:"",f=p.reactiveElementPolyfillSupport,_=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=null!==e;break;case Number:o=null===e?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch(e){o=null}}return o}},y=(e,t)=>!a(e,t),v={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(e,o,t);void 0!==i&&l(this.prototype,e,i)}}static getPropertyDescriptor(e,t,o){const{get:i,set:s}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const n=i?.call(this);s?.call(this,t),this.requestUpdate(e,n,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const e=this.properties,t=[...d(e),...h(e)];for(const o of t)this.createProperty(o,e[o])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,o]of t)this.elementProperties.set(e,o)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const o=this._$Eu(e,t);void 0!==o&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const e of o)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const o=t.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const o=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((o,i)=>{if(t)o.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of i){const i=document.createElement("style"),s=e.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=t.cssText,o.appendChild(i)}})(o,this.constructor.elementStyles),o}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$ET(e,t){const o=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,o);if(void 0!==i&&!0===o.reflect){const s=(void 0!==o.converter?.toAttribute?o.converter:w).toAttribute(t,o.type);this._$Em=e,null==s?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const o=this.constructor,i=o._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=o.getPropertyOptions(i),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=i;const n=s.fromAttribute(t,e.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(e,t,o,i=!1,s){if(void 0!==e){const n=this.constructor;if(!1===i&&(s=this[e]),o??=n.getPropertyOptions(e),!((o.hasChanged??y)(s,t)||o.useDefault&&o.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,o))))return;this.C(e,t,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:o,reflect:i,wrapped:s},n){o&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==s||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||o||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,o]of e){const{wrapped:e}=o,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,o,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[_("elementProperties")]=new Map,b[_("finalized")]=new Map,f?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,$=x.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+M,C=`<${E}>`,z=document,P=()=>z.createComment(""),W=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,F="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,q=/>/g,D=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),T=/'/g,O=/"/g,I=/^(?:script|style|textarea|title)$/i,B=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),H=B(1),V=B(2),j=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),U=new WeakMap,Z=z.createTreeWalker(z,129);function Q(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const G=(e,t)=>{const o=e.length-1,i=[];let s,n=2===t?"<svg>":3===t?"<math>":"",r=R;for(let t=0;t<o;t++){const o=e[t];let a,l,c=-1,d=0;for(;d<o.length&&(r.lastIndex=d,l=r.exec(o),null!==l);)d=r.lastIndex,r===R?"!--"===l[1]?r=L:void 0!==l[1]?r=q:void 0!==l[2]?(I.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=D):void 0!==l[3]&&(r=D):r===D?">"===l[0]?(r=s??R,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?D:'"'===l[3]?O:T):r===O||r===T?r=D:r===L||r===q?r=R:(r=D,s=void 0);const h=r===D&&e[t+1].startsWith("/>")?" ":"";n+=r===R?o+C:c>=0?(i.push(a),o.slice(0,c)+A+o.slice(c)+M+h):o+M+(-2===c?t:h)}return[Q(e,n+(e[o]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class Y{constructor({strings:e,_$litType$:t},o){let i;this.parts=[];let s=0,n=0;const r=e.length-1,a=this.parts,[l,c]=G(e,t);if(this.el=Y.createElement(l,o),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=Z.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(A)){const t=c[n++],o=i.getAttribute(e).split(M),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:r[2],strings:o,ctor:"."===r[1]?oe:"?"===r[1]?ie:"@"===r[1]?se:te}),i.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:s}),i.removeAttribute(e));if(I.test(i.tagName)){const e=i.textContent.split(M),t=e.length-1;if(t>0){i.textContent=$?$.emptyScript:"";for(let o=0;o<t;o++)i.append(e[o],P()),Z.nextNode(),a.push({type:2,index:++s});i.append(e[t],P())}}}else if(8===i.nodeType)if(i.data===E)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(M,e+1));)a.push({type:7,index:s}),e+=M.length-1}s++}}static createElement(e,t){const o=z.createElement("template");return o.innerHTML=e,o}}function J(e,t,o=e,i){if(t===j)return t;let s=void 0!==i?o._$Co?.[i]:o._$Cl;const n=W(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(e),s._$AT(e,o,i)),void 0!==i?(o._$Co??=[])[i]=s:o._$Cl=s),void 0!==s&&(t=J(e,s._$AS(e,t.values),s,i)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:o}=this._$AD,i=(e?.creationScope??z).importNode(t,!0);Z.currentNode=i;let s=Z.nextNode(),n=0,r=0,a=o[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new ee(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new ne(s,this,e)),this._$AV.push(t),a=o[++r]}n!==a?.index&&(s=Z.nextNode(),n++)}return Z.currentNode=z,i}p(e){let t=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,o,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),W(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&W(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:o}=e,i="number"==typeof o?this._$AC(e):(void 0===o.el&&(o.el=Y.createElement(Q(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new X(i,this),o=e.u(this.options);e.p(t),this.T(o),this._$AH=e}}_$AC(e){let t=U.get(e.strings);return void 0===t&&U.set(e.strings,t=new Y(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let o,i=0;for(const s of e)i===t.length?t.push(o=new ee(this.O(P()),this.O(P()),this,this.options)):o=t[i],o._$AI(s),i++;i<t.length&&(this._$AR(o&&o._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,i,s){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=K}_$AI(e,t=this,o,i){const s=this.strings;let n=!1;if(void 0===s)e=J(this,e,t,0),n=!W(e)||e!==this._$AH&&e!==j,n&&(this._$AH=e);else{const i=e;let r,a;for(e=s[0],r=0;r<s.length-1;r++)a=J(this,i[o+r],t,r),a===j&&(a=this._$AH[r]),n||=!W(a)||a!==this._$AH[r],a===K?e=K:e!==K&&(e+=(a??"")+s[r+1]),this._$AH[r]=a}n&&!i&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class se extends te{constructor(e,t,o,i,s){super(e,t,o,i,s),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??K)===j)return;const o=this._$AH,i=e===K&&o!==K||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,s=e!==K&&(o===K||i);i&&this.element.removeEventListener(this.name,this,o),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re={I:ee},ae=x.litHtmlPolyfillSupport;ae?.(Y,ee),(x.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;let ce=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,o)=>{const i=o?.renderBefore??t;let s=i._$litPart$;if(void 0===s){const e=o?.renderBefore??null;i._$litPart$=s=new ee(t.insertBefore(P(),e),e,void 0,o??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=Number.NaN;class ue{constructor(){this.ts=new Float64Array(32),this.vs=new Float64Array(32),this.count=0}get length(){return this.count}oldest(){return this.count>0?this.ts[0]:void 0}push(e,t){if(!Number.isFinite(e))return;const o=null!==t&&Number.isFinite(t)?t:he;if(0===this.count||e>this.ts[this.count-1])return void this.insertAt(this.count,e,o);const i=this.lowerBound(e);i<this.count&&this.ts[i]===e?this.vs[i]=o:this.insertAt(i,e,o)}mean(e,t){if(0===this.count||t<=e)return null;let o=this.upperBound(e),i=o>0?this.vs[o-1]:he,s=e,n=0,r=0;for(;o<this.count&&this.ts[o]<=t;o++){const e=this.ts[o];Number.isNaN(i)||(n+=i*(e-s),r+=e-s),i=this.vs[o],s=e}return Number.isNaN(i)||(n+=i*(t-s),r+=t-s),r>0?n/r:null}has(e){const t=this.lowerBound(e);return t<this.count&&this.ts[t]===e}removeGap(e){const t=this.lowerBound(e);t>=this.count||this.ts[t]!==e||!Number.isNaN(this.vs[t])||(this.ts.copyWithin(t,t+1,this.count),this.vs.copyWithin(t,t+1,this.count),this.count--)}prune(e){const t=this.upperBound(e)-1;t>0&&this.dropOldest(t)}insertAt(e,t,o){let i=e;if(this.count===this.ts.length)if(this.count<512)this.grow();else{if(0===i)return;this.dropOldest(1),i--}i<this.count&&(this.ts.copyWithin(i+1,i,this.count),this.vs.copyWithin(i+1,i,this.count)),this.ts[i]=t,this.vs[i]=o,this.count++}grow(){const e=Math.min(512,2*this.ts.length),t=new Float64Array(e),o=new Float64Array(e);t.set(this.ts.subarray(0,this.count)),o.set(this.vs.subarray(0,this.count)),this.ts=t,this.vs=o}dropOldest(e){this.ts.copyWithin(0,e,this.count),this.vs.copyWithin(0,e,this.count),this.count-=e}lowerBound(e){let t=0,o=this.count;for(;t<o;){const i=t+o>>1;this.ts[i]<e?t=i+1:o=i}return t}upperBound(e){let t=0,o=this.count;for(;t<o;){const i=t+o>>1;this.ts[i]<=e?t=i+1:o=i}return t}}class pe{constructor(e){this.series=new Map,this.gaps=[],this.windowMs=Number.isFinite(e)&&e>0?e:0}push(e,t,o){let i=this.series.get(e);void 0===i&&(i=new ue,this.series.set(e,i)),i.push(t,o)}markGap(e,t=e){if(!Number.isFinite(e))return;const o=new Map;for(const[t,i]of this.series){const s=i.has(e)?e+1:e;i.push(s,null),o.set(t,s)}this.gaps.push({t:e,markedAt:t,at:o})}healGaps(e,t){const o=new Set(t),i=[];for(const t of this.gaps)if(t.markedAt>e)i.push(t);else{for(const[e,i]of t.at)o.has(e)&&(this.series.get(e)?.removeGap(i),t.at.delete(e));t.at.size>0&&i.push(t)}this.gaps=i}mean(e,t,o){const i=this.series.get(e);return void 0===i?null:i.mean(o-t,o)}status(e){const t=e-this.windowMs;let o,i=this.series.size>0;for(const e of this.series.values()){const s=e.oldest();void 0!==s?((void 0===o||s>o)&&(o=s),s>t&&(i=!1)):i=!1}return void 0===o?{complete:!1}:{complete:i,since:o}}prune(e){const t=e-this.windowMs;for(const e of this.series.values())e.prune(t);this.gaps=this.gaps.filter(e=>e.t>=t)}sampleCount(e){return this.series.get(e)?.length??0}}function me(e){if("string"!=typeof e)return null;const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}function ge(e){if(null===e||"object"!=typeof e)return null;const{s:t,lu:o}=e;return"number"==typeof o&&Number.isFinite(o)?{t:Math.round(1e3*o),v:me(t)}:null}const fe=new Set(["unavailable","unknown",""]);function _e(e,t){if(void 0===e)return;const o=e.trim().toLowerCase();return fe.has(o)?void 0:0===t.length?"on"===o:!t.includes(o)}function we(e){if(void 0===e||""===e.trim())return;const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(100,t)):void 0}class ye{constructor(){this.plugged=new Map,this.known=new Map,this.asked=new Set}observe(e,t){for(const o of t){const t=o.charge;if(!t)continue;const i=e.states[t.soc],s=we(i?.state);if(void 0!==s){const e=Date.parse(i?.last_updated||i?.last_changed||"");this.known.set(t.soc,{value:s,t:Number.isFinite(e)?e:Date.now()})}if(t.plugged){const o=_e(e.states[t.plugged]?.state,t.unplugged);void 0!==o&&this.plugged.set(t.plugged,o)}}}state(e,t){const o=!!t.plugged&&(this.plugged.get(t.plugged)??!1),i=we(e.states[t.soc]?.state);if(void 0!==i)return{soc:i,stale:!1,plugged:o};const s=this.known.get(t.soc);return s?{soc:s.value,stale:!0,since:s.t,plugged:o}:{stale:!1,plugged:o}}missing(e,t){const o=[];for(const i of t){const t=i.charge?.soc;!t||o.includes(t)||this.asked.has(t)||this.known.has(t)||void 0===we(e.states[t]?.state)&&o.push(t)}return o}async prefill(e,t,o=5e3){if(0===t.length)return;for(const e of t)this.asked.add(e);const i=Date.now(),s=e.callWS({type:"history/history_during_period",start_time:new Date(i-864e6).toISOString(),end_time:new Date(i).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0});let n;s.catch(()=>{});const r=new Promise((e,t)=>{n=setTimeout(()=>t(new Error("EnerLens: charge history timed out")),o)});let a;try{a=await Promise.race([s,r])}finally{void 0!==n&&clearTimeout(n)}if(null!==a&&"object"==typeof a)for(const e of t){const t=a[e];if(!Array.isArray(t))continue;let o;for(const e of t){const t="string"==typeof e.s?we(e.s):void 0,i="number"==typeof e.lc?e.lc:e.lu;if(void 0===t||"number"!=typeof i)continue;const s=1e3*i;(!o||s>o.t)&&(o={value:t,t:s})}o&&!this.known.has(e)&&this.known.set(e,o)}}}const ve={solar:"var(--energy-solar-color, #ff9800)",house:"var(--primary-color)",grid_import:"var(--energy-grid-consumption-color, #488fc2)",grid_export:"var(--energy-grid-return-color, #8353d1)",battery_charge:"var(--energy-battery-in-color, #f06292)",battery_discharge:"var(--energy-battery-out-color, #4db6ac)",rest:"#7d7d7d"},be=Object.freeze([{at:0,color:"#e53935"},{at:50,color:"#fdd835"},{at:100,color:"#43a047"}]),xe=Object.freeze(["#7e57c2","#26a69a","#ec407a","#8d6e63","#5c6bc0","#ffca28","#66bb6a","#78909c","#ab47bc","#29b6f6"]),ke=/^#([\da-f])([\da-f])([\da-f])$/i,$e=/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,Se=/^rgba?\(([^)]*)\)$/i;function Ae(e){const t=e.trim(),o=ke.exec(t);if(o){const[,e,t,i]=o;return{r:Number.parseInt(e+e,16),g:Number.parseInt(t+t,16),b:Number.parseInt(i+i,16),a:1}}const i=$e.exec(t);if(i){const[,e,t,o]=i;return{r:Number.parseInt(e,16),g:Number.parseInt(t,16),b:Number.parseInt(o,16),a:1}}const s=Se.exec(t);if(s){const e=s[1].replace(/\//g," ").split(/[\s,]+/).filter(Boolean).map(Number);return e.length<3||e.some(e=>!Number.isFinite(e))?null:{r:e[0],g:e[1],b:e[2],a:e.length>3?e[3]:1}}return null}function Me(e,t,o){if(0===t.length)return"";const i=[...t].sort((e,t)=>e.at-t.at);if(1===i.length||!Number.isFinite(e))return i[0].color;let s=0;for(;s<i.length-2&&i[s+1].at<=e;)s++;const n=i[s],r=i[s+1],a=r.at-n.at,l=0===a?0:Math.min(1,Math.max(0,(e-n.at)/a));if(l<=0)return n.color;if(l>=1)return r.color;const c=Ae(o?o(n.color):n.color),d=Ae(o?o(r.color):r.color);return c&&d?function({r:e,g:t,b:o,a:i}){const s=e=>Math.min(255,Math.max(0,Math.round(e))),n=`${s(e)}, ${s(t)}, ${s(o)}`;return i>=1?`rgb(${n})`:`rgba(${n}, ${i})`}(function(e,t,o){return{r:e.r+(t.r-e.r)*o,g:e.g+(t.g-e.g)*o,b:e.b+(t.b-e.b)*o,a:e.a+(t.a-e.a)*o}}(c,d,l)):l<.5?n.color:r.color}function Ee(e){const t=/^var\((--[^,)]+)/.exec(e.trim());if(!t||"undefined"==typeof getComputedStyle)return e;return getComputedStyle(document.documentElement).getPropertyValue(t[1]).trim()||e}function Ce(e,t){const o=e.trim();if(""===o)return null;const i=(t?Ae(t(o)):null)??Ae(o);if(i){const e=e=>Math.min(255,Math.max(0,Math.round(e))).toString(16).padStart(2,"0");return`#${e(i.r)}${e(i.g)}${e(i.b)}`}const s=function(e){const t=/^var\(\s*--[^,)]+,([\s\S]+)\)$/.exec(e.trim()),o=t?.[1].trim();return o||null}(o);return s?Ce(s,t):null}function ze(e,t=0){const o=Ae(e);if(!o)return{h:t,s:0,v:0};const i=o.r/255,s=o.g/255,n=o.b/255,r=Math.max(i,s,n),a=r-Math.min(i,s,n);let l=t;return a>0&&(l=r===i?(s-n)/a%6*60:r===s?60*((n-i)/a+2):60*((i-s)/a+4)),{h:(l+360)%360,s:0===r?0:a/r,v:r}}function Pe({h:e,s:t,v:o}){const i=(e%360+360)%360,s=Math.min(1,Math.max(0,t)),n=Math.min(1,Math.max(0,o)),r=n*s,a=r*(1-Math.abs(i/60%2-1)),l=n-r,c=Math.floor(i/60)%6,[d,h,u]=[[r,a,0],[a,r,0],[0,r,a],[0,a,r],[a,0,r],[r,0,a]][c],p=e=>Math.round(255*(e+l)).toString(16).padStart(2,"0");return`#${p(d)}${p(h)}${p(u)}`}function We({h:e,s:t,v:o}){const i=o*(1-t/2),s=Math.min(i,1-i);return{h:e,s:0===s?0:(o-i)/s,l:i}}function Ne({h:e,s:t,l:o}){const i=o+t*Math.min(o,1-o);return{h:e,s:0===i?0:2*(1-o/i),v:i}}const Fe={en:{node:{solar:"Solar",grid:"Grid",house:"House",battery:"Battery",grid_import:"Grid · import",grid_export:"Grid · export",battery_charging:"Battery · charging",battery_discharging:"Battery · discharging",derived_suffix:"· calculated",derived_alone:"calculated",partial:"without {names}",no_grid:"no grid"},list:{rest:"Other",title:"Consumers",show_all:"Show every consumer, even without power",filter_on:"Show active consumers only",charge:"State of charge {value}",charge_stale:"State of charge {value} · as of {time}",charge_unknown:"State of charge unknown"},view:{now:"Now",average:"Ø {minutes} min",off_in_period:"Averages only apply to the kW view",since:"since {time}",chip:"View: {mode}, next: {next}"},energy:{today:"Today","24h":"24 h",week:"Week","7d":"7 days",month:"Month","30d":"30 days",from:"{period} from {date}",chip:"Energy: {mode}, next: {next}",filled:"{percent} of the time filled in from neighbouring values",since:"Statistics only from {date}",none:"No statistics",rest:"Includes filled-in, later or missing consumer values",late:"Statistics only from {date}; the period counts from then",no_statistics:"Energy mode: not every main sensor (solar, grid, battery, house) has long-term statistics; the card stays with power.",fixed:"Energy: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} must be a mapping.",string:"{field} must be a non-empty text.",boolean:"{field} must be true or false.",number:"{field} must be a number.",integer:"{field} must be a whole number.",list:"{field} must be a list.",non_empty:"{field} must not be empty.",enum:"{field} must be one of: {allowed}.",min:"{field} must be at least {min}.",range:"{field} must be between {min} and {max}.",positive:"{field} must be greater than 0.",missing_entities:"{field} is missing: at least three of the four balance quantities must be configured as sensors.",mixed_form:"{field}: use either an entity id, the entity/invert form, the two-entity form or derived - not a mixture.",two_derived:"Only one balance quantity may be derived; {field} would be the second one.",soc_without_battery:"{field} has no effect without entities.battery and is ignored.",soc_stops:"{field} needs at least two stops in ascending order, the first at 0 and the last at 100.",soc_stop_entry:"{field} needs a numeric at value and a colour.",consumer_entity:"{field} has no entity and is skipped.",duplicate_consumer:"{field}: entity {entity} is listed more than once; the later entry is skipped.",solar_house:'{field}: only "excluded" (not part of the house value) is allowed; the value is ignored.',pv_scale:'{field}: "% kWp" needs kwp on every source, "100%" at least two sources; the card uses what is possible.',unknown_key:"Unknown option {field} - ignored.",order_fixed:"{first} must be less than {second} - {second} was raised to {value}.",clamped:"{field} must be between {min} and {max} - {value} is used.",grid_status_no_outage:"{field} needs an entity and at least one outage state - without them the grid status is ignored.",empty_choice:"{field}: an empty list counts as not set; the default applies.",energy_derived:"{field}: the energy mode does not work with a derived grid or battery; it stays off.",charge_no_soc:"{field} has no soc entity and is ignored.",charge_no_plugged:"{field}: show plugged needs a plugged entity - shown while charging instead.",extra_no_entity:"{field} has no entity and is ignored.",not_for_node:"{field} does not exist for this node and is ignored.",rounded:"{field}: whole numbers only - rounded to {value}.",order_used:"{field}: to keep the order, the card uses {value}.",clamped_min:"{field} must be at least {min} - {value} is used.",unknown_value:"{field}: unknown value, allowed are {allowed} - the card uses the default."}},editor:{title:"Title",entities:"Main entities",solar:"Solar power",grid:"Grid power",house:"House consumption",battery:"Battery power",battery_soc:"State of charge",consumers:"Consumers",entity:"Entity",name:"Name",color:"Colour",display:"Display",max_consumers:"Maximum consumers",min_consumer_w:"Minimum power (W)",update_interval_s:"Update interval (seconds)",rest_label:"Label for the remainder",list_enabled:"Show list",list_always_below:"List always below",ring_enabled:"Show consumer ring",ring_animation:"Consumer ring animation",ring_overtake:"Overtake",ring_fade:"Cross-fade colours",ring_jump:"Jump",view:"View",mode_current:"Current",mode_short:"Short average",mode_long:"Long average",avg_short_minutes:"Short window (minutes)",avg_long_minutes:"Long window (minutes)",energy_periods:"Available values",energy_today:"Today",energy_24h:"24 h",energy_week:"Week",energy_7d:"7 days",energy_month:"Month",energy_30d:"30 days",flow:"Flows",inactive_lines:"Lines without flow",lines_show:"Show",lines_dim:"Dim",lines_hide:"Hide",animation:"Motion",anim_auto:"Follow system setting",anim_on:"Always",anim_off:"Off",design:"Look of the dots",design_none:"Plain dots",dot_size:"Dot size",line_width:"Line width",invert:"Flip sign",source_entity:"One entity",source_split_grid:"Two entities (import / export)",source_split_battery:"Two entities (discharge / charge)",source_derived:"Derived from the other quantities",source_none:"No battery",grid_import:"Import",grid_export:"Export",battery_discharge:"Discharge",battery_charge:"Charge",colors:"Colours",icons:"Icons",color_solar:"Solar",color_house:"House",color_grid_import:"Grid · import",color_grid_export:"Grid · export",color_battery_charge:"Battery · charging",color_battery_discharge:"Battery · discharging",color_rest:"Remainder",color_reset:"Reset to default",color_default:"Default",color_css:"CSS",color_pick:"Pick a colour",color_hue:"Hue",color_sv:"Saturation and brightness",color_hex:"Hex value",color_mode:"Notation",color_used:"Used in this card",colors_consumers:"Consumers",colors_soc:"State of charge",yaml_only:"Only editable in YAML - the values there are not in a form this editor can show.",color_at:"At percent",color_remove:"Remove stop",color_add_stop:"Add stop",min_w:"Minimum power (W)",icon:"Icon",peak_w:"System peak power (W)",flow_fine:"Fine-tune the motion",slow_below_w:"Speed up from (W)",more_dots_above_w:"More dots from (W)",max_dots_at_w:"All dots from (W)",max_dots:"Maximum dots",slow_s:"Resting pace (seconds per lap)",fast_s:"Full speed (seconds per lap)",full_speed_w:"Full speed from (W)",power_unit:"Show power in",power_kw:"Kilowatts (kW)",power_w:"Watts (W), whole numbers",power_decimals:"Decimals (kW)",grid_status_section:"Grid outage (optional)",grid_status:"Grid status entity",grid_status_outage:"States that mean: no grid",grid_status_ok:"States that mean: grid is there",layout:"Arrangement",layout_cross:"Cross",layout_square_right:"Square · solar right",layout_square_left:"Square · solar left",layout_triangle:"Triangle",flow_lines:"Line form",lines_curved:"Curved",lines_straight:"Straight",appearance:"Card appearance",appearance_auto:"Follow the theme",appearance_light:"Light",appearance_dark:"Dark",rest:"Remainder",dot_color:"Colour of the dots",colors_dots:"Dots",dot_color_follow:"Dots in the colour of their line",power_auto:"Automatic",power_digits:"Significant digits",consumer_add:"Add consumer",consumer_new:"New consumer",consumer_remove:"Remove consumer",charge:"State of charge",charge_show_charging:"While charging",charge_show_plugged:"While plugged in",charge_show_always:"Always",consumer_soc:"State of charge entity (%)",consumer_show:"Show in the list",consumer_plugged:"Plugged in",consumer_unplugged:"Not plugged in when",consumer_up:"Move up",consumer_down:"Move down",nodes:"Labels & extra values",node_show_name:"Show name",node_show_state:"Show state word",node_inside_entity:"Extra value in the circle",node_inside_position:"Position in the circle",node_inside_decimals:"Digits",node_inside_size:"Size",node_inside_weight:"Font weight",node_label_entity:"Extra value with the label",node_label_prefix:"Prefix",node_label_decimals:"Digits",node_label_size:"Size",node_label_weight:"Font weight",position_above:"above the icon",position_below:"below the value",decimals_ha:"As in Home Assistant",decimals_0:"0 decimals",decimals_1:"1 decimal",decimals_2:"2 decimals",decimals_3:"3 decimals",decimals_sig2:"2 significant digits",decimals_sig3:"3 significant digits",decimals_sig4:"4 significant digits",weight_normal:"normal",weight_medium:"medium",weight_bold:"bold",colors_extras:"Extra values",color_extra_inside:"{node} · in the circle",color_extra_label:"{node} · with the label",colors_hint:"Colours are set further down, in the group “Colours”.",group_smoothing:"Smoothing",group_energy:"Power/energy",group_scope:"List scope",modes:"Available values",scope:"Available values",energy_power:"Power",scope_filtered:"Filtered",scope_full:"Complete",quick_buttons:"Quick buttons",note_min:"At least {min}.",note_max:"At most {max}.",note_integer:"Whole numbers only.",note_order:"The order is wrong.",note_order_avg_short_minutes:"The short window must be shorter than the long one.",note_order_avg_long_minutes:"The long window must be longer than the short one.",note_order_fast_s:"The fast cycle must be shorter than the slow one.",note_order_slow_s:"The slow cycle must be longer than the fast one.",note_order_min_w:"Must lie below the thresholds for the dots.",note_order_slow_below_w:"The thresholds must grow from top to bottom.",note_order_more_dots_above_w:"The thresholds must grow from top to bottom.",note_order_max_dots_at_w:"The thresholds must grow from top to bottom.",note_order_full_speed_w:"Must be above the threshold for slow dots.",source_sources:"Several sources (one per inverter)",solar_sources:"PV sources",source_add:"Add source",source_remove:"Remove source",pv_source_entity:"Entity",pv_source_name:"Name",pv_source_kwp:"Peak power (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Not part of the house value",list_solar:"PV rows in the list",ring_solar:"Show PV ring",group_pv_scale:"PV scale",pv_scales:"Values offered",pv_scale_share:"100%",pv_scale_peak:"% kWp",group_quick_style:"All quick buttons",quick_style:"Style",quick_style_segment:"Segment buttons",quick_style_segment_compact:"Segment buttons, compact",quick_style_single:"Single buttons",expanded_modes:"Expand",expanded_energy_periods:"Expand",expanded_pv_scales:"Expand",expanded_scope:"Expand"},editor_help:{min_consumer_w:"Consumers below this power are hidden and counted towards the remainder. Default: 10 W.",max_consumers:"Only the strongest consumers are listed; the rest are counted together. Empty = all (default).",update_interval_s:"How often the list reorders. The figures themselves update immediately. Default: 5 seconds.",rest_label:'Name for the part that is not measured individually. Default: "Other".',design:"How the travelling dots look. “Plain dots” is a circle and nothing else; the others give it a lighter core and, depending on the design, a glow. Speed and the number of dots follow the power, not the design. Default: plain dots.",dot_size:"100 % is the size of the dots on a card with large nodes. Smaller cards - the list beside the drawing, a phone - take somewhat smaller dots on their own. Default: 100 %.",line_width:"100 % is 3 px for the connections and 2 px for the lines to the list on a card with large nodes. Smaller cards take somewhat thinner lines on their own. Default: 100 %.",avg_short_minutes:"Window for the short average. Default: 2.",avg_long_minutes:"Window for the long average. Default: 15.",energy_periods:"What the quick button offers: power, and energy over a period worked out from the statistics of the power sensors. Several ticked: each tap steps on. One ticked: fixed, no button. Default: power, today, 24 h, week – but only when solar, grid, battery and house have statistics, otherwise power alone. Grid and battery with two sensors show both directions; with one signed sensor the grid shows its balance and the battery no figure.",energy_periods_locked:"Not available with a derived grid or battery.",inactive_lines:'Connections with nothing flowing on them. "Hide" calms the picture at night. Default: show.',animation:'"Follow system setting" respects the device\'s reduce-motion preference - that lives in the operating system, not in Home Assistant. Default: follow system setting.',ring_animation:"How the consumer ring follows a reordered list. “Overtake”: every segment travels to its new place, one moving forward passes on an inner lane. “Cross-fade colours”: the places stay, their colours blend into the new order. “Jump”: no motion, new values show at once. With Motion off the ring always jumps. Default: overtake.",battery_soc:"State of charge in percent. Never averaged.",color:"Any CSS value, e.g. #7e57c2 or var(--primary-color). Empty = automatic.",solar:"Positive = production. If the sensor reports production as negative, flip the sign.",grid:"Positive = import from the grid, negative = export. If your sensor has it the other way round, flip the sign.",house:'Total consumption of the house. Without a sensor of its own, choose "Derived".',battery:"Positive = discharging, negative = charging (Home Assistant's convention). If your sensor has it the other way round, flip the sign.",grid_import:"Import only, as a magnitude ≥ 0.",grid_export:"Export only, as a magnitude ≥ 0.",battery_discharge:"Discharging only, as a magnitude ≥ 0.",battery_charge:"Charging from all sources, as a magnitude ≥ 0.",derived:"Calculated from the other three quantities so the balance adds up. Only one quantity can be derived.",min_w:"From this power on a connection counts as active: dots move, grid and battery show their state. Below it everything is neutral. Default: 10 W.",icon_battery:"Empty = icon follows the state of charge.",peak_w:"One value for the whole motion: at this power the most dots run at their fastest. The three thresholds below derive from it (1/12, 1/3, 1/1) while they are empty. Default 6000 W.",flow_fine:"Only needed when the peak power alone does not do. A set value overrides the one derived from the peak. If the order is wrong, the card raises the second value and says so in the browser console.",slow_below_w:"Below this a single dot runs at resting pace. From here on it gets faster. Default: peak / 12.",more_dots_above_w:"From here on more dots join, independent of the speed. Default: peak / 3.",max_dots_at_w:"From here on as many dots as allowed. In between: more and more dots. Default: peak.",slow_s:"One lap when little is flowing. Default 5.",fast_s:"One lap when a lot is flowing. Default 1.8.",max_dots:"How many dots a connection carries at most. Default 5.",full_speed_w:"From here on the dot runs as fast as it gets. In between: one dot, getting faster. Default: same as “More dots from”.",power_unit:"Kilowatts, watts or automatic. “Automatic” picks per value: whole watts below 1000 W, kilowatts above - otherwise a 30 W consumer reads as “0.0 kW”. Default: kilowatts.",power_decimals:"Kilowatts only; watts are always whole numbers. Default 2.",grid_status:"Only if your installation reports an outage - many do not. Without it the card shows no outage; everything else works.",grid_status_outage:"Required. Every integration names its states differently, so nothing is guessed here. Enter the raw state, not the label Home Assistant shows: an enum sensor displays a translated name, so “Not detected” may really be `not_detected`. Picking from the list avoids the question.",grid_status_ok:"Optional. Left empty, the entity's own options minus the outage states count as \\u201cgrid is there\\u201d; anything else, including unavailable, leaves the last state standing.",layout:"Where the four nodes stand. With Square · solar left the PV rows stand left of the drawing and the consumers right of it; on a card too narrow for that, both lists go below. Default: Cross.",flow_lines:"How the connections between the nodes run. Default: curved for the cross, straight for the other arrangements.",appearance:"Shows this one card light or dark – whatever the theme says, and without touching the rest of the dashboard. It also settles which of its two value sets a flow design takes. “Follow the theme” reads the ground, which works nearly always – but not for themes that paint no card background of their own. Light and dark use Home Assistant's default colours, not those of a custom theme.",icon_rest:"Empty = a plain dot.",dot_color:"Empty = each dot carries the colour of its flow, which is what shows where the energy comes from. A colour here applies to every dot on the card; the lines keep theirs.",power_digits:"How much the number says, not how many places follow the point. With 3: 1.23 kW · 12.3 kW · 123 kW. A decimal place means something different at 1.23 kW than at 123 kW; this keeps what the figure tells constant. Watts are always whole. Default: 3.",consumers_list:"Unfold to edit, drag by the handle to sort. The colour is under “Colours”.",consumer_min_w:"Overrides the global minimum power - say 50 W for a heat pump, so its standby does not count as a consumer.",consumer_soc:"For a wallbox, the car’s state of charge from the car’s own integration. Shown as a ring around the icon; while nothing charges it stands in the row instead of the power.",consumer_show:"“While plugged in” keeps the row in the list as long as the car is plugged in - full and at 0 W too.",consumer_plugged:"An on/off sensor (on = plugged in) or a status sensor of the wallbox.",consumer_unplugged:"The status sensor’s states that mean “not plugged in”; all others count as plugged in.",node_show_state:"Without the state word only the colour tells export from import, charging from discharging.",node_inside_entity:"Any entity. The circle only has room for a number and its unit. Always shows the current state, also in the average views.",node_label_entity:"Any entity, right next to the circle. Always shows the current state, also in the average views.",node_label_prefix:'Free text in front of the value, e.g. "Self-sufficiency".',node_inside_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_label_decimals:'"As in Home Assistant" uses the display precision from the entity\'s settings. Significant digits apply whatever the unit: 1.23 · 12.3 · 123. Text, money, durations and points in time are not affected - they always look as in Home Assistant.',node_inside_size:"In percent of the node value.",node_label_size:"In percent of the label (12 px).",node_inside_position:"Above the icon the value sits where the battery shows its charge, and tapping it opens its own history. Below the value, tapping opens the node's entity.",modes:"What the quick button offers: now, the short and the long average. Several ticked: each tap steps on. One ticked: fixed, no button. Default: all three.",modes_locked:"Averages exist for power only. Tick “Power” under “Quick button power/energy” to set the smoothing. Until then the card always shows the current reading.",scope:"What the quick button offers: the filtered consumer list or every consumer. Several ticked: each tap switches. One ticked: fixed, no button. Default: both.",list_enabled:"Default: on when consumers are set.",ring_enabled:"Ring of the consumers at the house. Default: on when consumers are set.",list_always_below:"Keeps the list under the drawing even when there is room beside it. Default: off.",quick_buttons:"The buttons in the card's header. For each, what it offers: several values – each tap steps on; one value – fixed, no button.",solar_sources:"Every inverter or string with a sensor of its own; the PV is their sum. A source's colour can be set in YAML (color), otherwise orange tones.",pv_source_kwp:'Needed on every source for the "% kWp" scale. Default: none.',pv_source_excluded:'For sources feeding in past the inverter (balcony plant): their power is added to the measured house value, which then reads "calculated". Default: off.',list_solar:"Shows each source as a row above the consumers, with a fan of its own. Default: off.",ring_solar:"Ring of the sources at the PV node. Default: on.",pv_scales:'What the quick button offers: "100%" - the ring shows each source\'s share and is always full; "% kWp" - the power relative to peak power. Several ticked: each tap switches. One ticked: fixed, no button. Default: both, as far as possible.',pv_scale_peak_locked:'"% kWp" needs the peak power (kWp) of every source. Enter it under "PV sources" to choose this scale.',pv_scale_share_locked:'"100%" needs at least two sources - with one the ring would always be full.',quick_style:'How the quick buttons look. "Segment buttons, compact" also makes the cycling buttons flatter; "Single buttons" shows with expanded quick buttons. Default: segment buttons.',expanded_modes:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_energy_periods:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_pv_scales:"Every value as its own button side by side instead of one button that cycles. Default: off.",expanded_scope:"Filtered and Complete as two buttons instead of one filter button. Default: off."},outage:{banner:"Island mode — no grid",label:"Grid status"},example:{banner:"Example values — pick your sensors in the editor"},pv_scale:{share:"100%",peak:"% kWp",share_title:"PV: share of each source, the ring is always full",peak_title:"PV: power relative to peak power",peak_period_title:"PV: mean power over the period relative to peak power",chip:"PV scale: {mode}, next: {next}"}},de:{node:{solar:"PV",grid:"Netz",house:"Haus",battery:"Batterie",grid_import:"Netz · Bezug",grid_export:"Netz · Einspeisung",battery_charging:"Batterie · lädt",battery_discharging:"Batterie · entlädt",derived_suffix:"· berechnet",derived_alone:"berechnet",partial:"ohne {names}",no_grid:"kein Netz"},list:{rest:"Rest",title:"Verbraucher",show_all:"Alle Verbraucher anzeigen, auch ohne Leistung",filter_on:"Nur aktive Verbraucher anzeigen",charge:"Ladestand {value}",charge_stale:"Ladestand {value} · Stand {time}",charge_unknown:"Ladestand unbekannt"},view:{now:"Jetzt",average:"Ø {minutes} min",off_in_period:"Mittelwerte gibt es nur in der kW-Ansicht",since:"seit {time}",chip:"Ansicht: {mode}, weiter zu {next}"},energy:{today:"Heute","24h":"24 h",week:"Woche","7d":"7 Tage",month:"Monat","30d":"30 Tage",from:"{period} ab {date}",chip:"Energie: {mode}, weiter zu {next}",filled:"{percent} der Zeit aus Nachbarwerten ergänzt",since:"Statistik erst ab {date}",none:"Keine Statistik",rest:"Enthält ergänzte, spätere oder fehlende Verbraucherwerte",late:"Statistik erst ab {date}, der Zeitraum zählt ab dann",no_statistics:"Energie-Modus: Nicht alle Hauptsensoren (PV, Netz, Batterie, Haus) haben eine Langzeitstatistik; die Karte bleibt bei der Leistung.",fixed:"Energie: {period}"},state:{unavailable:"—"},error:{config:{object:"{field} muss ein Objekt sein.",string:"{field} muss ein nicht leerer Text sein.",boolean:"{field} muss true oder false sein.",number:"{field} muss eine Zahl sein.",integer:"{field} muss eine ganze Zahl sein.",list:"{field} muss eine Liste sein.",non_empty:"{field} darf nicht leer sein.",enum:"{field} muss einer dieser Werte sein: {allowed}.",min:"{field} muss mindestens {min} sein.",range:"{field} muss zwischen {min} und {max} liegen.",positive:"{field} muss größer als 0 sein.",missing_entities:"{field} fehlt: mindestens drei der vier Bilanzgrößen müssen als Sensor angegeben sein.",mixed_form:"{field}: entweder Entitäts-ID, die entity/invert-Form, die Zwei-Entitäten-Form oder derived - keine Mischform.",two_derived:"Nur eine Bilanzgröße darf abgeleitet werden; {field} wäre die zweite.",soc_without_battery:"{field} ist ohne entities.battery wirkungslos und wird ignoriert.",soc_stops:"{field} braucht mindestens zwei Stützstellen in aufsteigender Reihenfolge, die erste bei 0, die letzte bei 100.",soc_stop_entry:"{field} braucht einen numerischen at-Wert und eine Farbe.",consumer_entity:"{field} hat keine entity und wird übersprungen.",duplicate_consumer:"{field}: die Entität {entity} ist mehrfach angegeben; der weitere Eintrag wird übersprungen.",solar_house:"{field}: erlaubt ist nur „excluded“ (nicht im Hauswert enthalten); der Wert wird ignoriert.",pv_scale:"{field}: „% kWp“ braucht kWp an jeder Quelle, „100 %“ mindestens zwei Quellen; die Karte nimmt, was möglich ist.",unknown_key:"Unbekannte Option {field} - wird ignoriert.",order_fixed:"{first} muss kleiner als {second} sein — {second} wurde auf {value} angehoben.",clamped:"{field} muss zwischen {min} und {max} liegen — es wird {value} verwendet.",grid_status_no_outage:"{field} braucht eine Entität und mindestens einen Ausfall-Zustand — ohne beides wird der Netzstatus ignoriert.",empty_choice:"{field}: Eine leere Liste gilt als nicht gesetzt; es gilt der Standard.",energy_derived:"{field}: Der Energie-Modus geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie; er bleibt aus.",charge_no_soc:"{field} hat keine soc-Entität und wird ignoriert.",charge_no_plugged:"{field}: show plugged braucht eine plugged-Entität - stattdessen wie beim Laden.",extra_no_entity:"{field} hat keine entity und wird ignoriert.",not_for_node:"{field} gibt es bei diesem Knoten nicht und wird ignoriert.",rounded:"{field}: nur ganze Zahlen – gerundet auf {value}.",order_used:"{field}: Wegen der Reihenfolge rechnet die Karte mit {value}.",clamped_min:"{field} muss mindestens {min} sein – verwendet wird {value}.",unknown_value:"{field}: unbekannter Wert, erlaubt sind {allowed} – die Karte nimmt den Standard."}},editor:{title:"Titel",entities:"Basis-Entitäten",solar:"PV-Leistung",grid:"Netzleistung",house:"Hausverbrauch",battery:"Batterieleistung",battery_soc:"Ladezustand",consumers:"Verbraucher",entity:"Entität",name:"Name",color:"Farbe",display:"Darstellung",max_consumers:"Höchstzahl Verbraucher",min_consumer_w:"Mindestleistung (W)",update_interval_s:"Takt (Sekunden)",rest_label:"Bezeichnung für den Rest",list_enabled:"Liste anzeigen",list_always_below:"Liste immer unten",ring_enabled:"Verbraucher-Ring anzeigen",ring_animation:"Animation des Verbraucher-Rings",ring_overtake:"Überholen",ring_fade:"Farben überblenden",ring_jump:"Springen",view:"Ansicht",mode_current:"Aktuell",mode_short:"Kurzer Mittelwert",mode_long:"Langer Mittelwert",avg_short_minutes:"Kurzes Fenster (Minuten)",avg_long_minutes:"Langes Fenster (Minuten)",energy_periods:"Verfügbare Werte",energy_today:"Heute",energy_24h:"24 h",energy_week:"Woche",energy_7d:"7 Tage",energy_month:"Monat",energy_30d:"30 Tage",flow:"Flüsse",inactive_lines:"Linien ohne Fluss",lines_show:"Anzeigen",lines_dim:"Abschwächen",lines_hide:"Ausblenden",animation:"Bewegung",anim_auto:"Systemeinstellung folgen",anim_on:"Immer",anim_off:"Aus",design:"Aussehen der Punkte",design_none:"Einfache Punkte",dot_size:"Punktgröße",line_width:"Liniendicke",invert:"Vorzeichen umdrehen",source_entity:"Eine Entität",source_split_grid:"Zwei Entitäten (Bezug / Einspeisung)",source_split_battery:"Zwei Entitäten (Entladen / Laden)",source_derived:"Abgeleitet aus den anderen Größen",source_none:"Keine Batterie",grid_import:"Bezug",grid_export:"Einspeisung",battery_discharge:"Entladen",battery_charge:"Laden",colors:"Farben",icons:"Icons",color_solar:"PV",color_house:"Haus",color_grid_import:"Netz · Bezug",color_grid_export:"Netz · Einspeisung",color_battery_charge:"Batterie · lädt",color_battery_discharge:"Batterie · entlädt",color_rest:"Rest",color_reset:"Auf Standard zurücksetzen",color_default:"Standard",color_css:"CSS",color_pick:"Farbe wählen",color_hue:"Farbton",color_sv:"Sättigung und Helligkeit",color_hex:"Hex-Wert",color_mode:"Schreibweise",color_used:"In dieser Karte verwendet",colors_consumers:"Verbraucher",colors_soc:"Ladestand",yaml_only:"Nur im YAML bearbeitbar – die Werte dort haben eine Form, die dieser Editor nicht anzeigen kann.",color_at:"Bei Prozent",color_remove:"Stufe entfernen",color_add_stop:"Stufe hinzufügen",min_w:"Mindestleistung (W)",icon:"Icon",peak_w:"Höchstleistung der Anlage (W)",flow_fine:"Feineinstellung der Bewegung",slow_below_w:"Beschleunigung ab (W)",more_dots_above_w:"Mehr Punkte ab (W)",max_dots_at_w:"Alle Punkte ab (W)",max_dots:"Höchstzahl Punkte",slow_s:"Ruhe-Tempo (Sekunden pro Runde)",fast_s:"Höchsttempo (Sekunden pro Runde)",full_speed_w:"Höchsttempo ab (W)",power_unit:"Leistung anzeigen in",power_kw:"Kilowatt (kW)",power_w:"Watt (W), ganze Zahlen",power_decimals:"Nachkommastellen (kW)",grid_status_section:"Netzausfall (optional)",grid_status:"Entität für den Netzstatus",grid_status_outage:"Zustände, die „kein Netz“ bedeuten",grid_status_ok:"Zustände, die „Netz liegt an“ bedeuten",layout:"Anordnung",layout_cross:"Kreuz",layout_square_right:"Quadrat · PV rechts",layout_square_left:"Quadrat · PV links",layout_triangle:"Dreieck",flow_lines:"Linienform",lines_curved:"Geschwungen",lines_straight:"Gerade",appearance:"Erscheinungsbild der Karte",appearance_auto:"Wie das Theme",appearance_light:"Hell",appearance_dark:"Dunkel",rest:"Rest",dot_color:"Farbe der Punkte",colors_dots:"Punkte",dot_color_follow:"Punkte in der Farbe ihrer Linie",power_auto:"Automatisch",power_digits:"Relevante Stellen",consumer_add:"Verbraucher hinzufügen",consumer_new:"Neuer Verbraucher",consumer_remove:"Verbraucher entfernen",charge:"Ladestand",charge_show_charging:"Beim Laden",charge_show_plugged:"Wenn angesteckt",charge_show_always:"Immer",consumer_soc:"Ladestand-Entität (%)",consumer_show:"In der Liste zeigen",consumer_plugged:"Angesteckt",consumer_unplugged:"Nicht angesteckt bei",consumer_up:"Nach oben",consumer_down:"Nach unten",nodes:"Beschriftung & Zusatzwerte",node_show_name:"Name anzeigen",node_show_state:"Zustandswort anzeigen",node_inside_entity:"Zusatzwert im Kreis",node_inside_position:"Lage im Kreis",node_inside_decimals:"Stellen",node_inside_size:"Größe",node_inside_weight:"Schriftstärke",node_label_entity:"Zusatzwert beim Text",node_label_prefix:"Vorsatz",node_label_decimals:"Stellen",node_label_size:"Größe",node_label_weight:"Schriftstärke",position_above:"über dem Icon",position_below:"unter dem Wert",decimals_ha:"Wie in Home Assistant",decimals_0:"0 Nachkommastellen",decimals_1:"1 Nachkommastelle",decimals_2:"2 Nachkommastellen",decimals_3:"3 Nachkommastellen",decimals_sig2:"2 signifikante Stellen",decimals_sig3:"3 signifikante Stellen",decimals_sig4:"4 signifikante Stellen",weight_normal:"normal",weight_medium:"mittel",weight_bold:"fett",colors_extras:"Zusatzwerte",color_extra_inside:"{node} · im Kreis",color_extra_label:"{node} · beim Text",colors_hint:"Die Farben stellst du weiter unten in der Gruppe „Farben“ ein.",group_smoothing:"Glättung",group_energy:"Leistung/Energie",group_scope:"Listenumfang",modes:"Verfügbare Werte",scope:"Verfügbare Werte",energy_power:"Leistung",scope_filtered:"Gefiltert",scope_full:"Vollständig",quick_buttons:"Quick-Buttons",note_min:"Mindestens {min}.",note_max:"Höchstens {max}.",note_integer:"Nur ganze Zahlen.",note_order:"Die Reihenfolge stimmt nicht.",note_order_avg_short_minutes:"Das kurze Fenster muss kürzer sein als das lange.",note_order_avg_long_minutes:"Das lange Fenster muss länger sein als das kurze.",note_order_fast_s:"Die schnelle Umlaufzeit muss kürzer sein als die langsame.",note_order_slow_s:"Die langsame Umlaufzeit muss länger sein als die schnelle.",note_order_min_w:"Muss unter den Schwellen für die Punkte liegen.",note_order_slow_below_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_more_dots_above_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_max_dots_at_w:"Die Schwellen müssen von oben nach unten größer werden.",note_order_full_speed_w:"Muss größer sein als die Schwelle für langsame Punkte.",source_sources:"Mehrere Quellen (je Wechselrichter)",solar_sources:"PV-Quellen",source_add:"Quelle hinzufügen",source_remove:"Quelle entfernen",pv_source_entity:"Entität",pv_source_name:"Name",pv_source_kwp:"Spitzenleistung (kWp)",pv_source_icon:"Icon",pv_source_excluded:"Nicht im Hauswert enthalten",list_solar:"PV-Zeilen in der Liste",ring_solar:"PV-Ring anzeigen",group_pv_scale:"PV-Skala",pv_scales:"Verfügbare Werte",pv_scale_share:"100 %",pv_scale_peak:"% kWp",group_quick_style:"Alle Quick-Buttons",quick_style:"Darstellung",quick_style_segment:"Segment-Buttons",quick_style_segment_compact:"Segment-Buttons kompakt",quick_style_single:"Einzel-Buttons",expanded_modes:"Aufklappen",expanded_energy_periods:"Aufklappen",expanded_pv_scales:"Aufklappen",expanded_scope:"Aufklappen"},editor_help:{min_consumer_w:"Verbraucher unterhalb dieser Leistung werden ausgeblendet und zählen zum Rest. Standard: 10 W.",max_consumers:"Nur die stärksten Verbraucher erscheinen; alle weiteren zählen zum Rest. Leer = alle (Standard).",update_interval_s:"Wie oft die Liste neu sortiert wird. Die Werte selbst ändern sich sofort. Standard: 5 Sekunden.",rest_label:"Name für den nicht einzeln gemessenen Anteil. Standard: „Rest“.",design:"Wie die laufenden Punkte aussehen. „Einfache Punkte“ ist ein Kreis ohne alles; die übrigen geben ihm einen hellen Kern und je nach Design ein Glühen. Tempo und Anzahl der Punkte hängen an der Leistung, nicht am Design. Standard: Einfache Punkte.",dot_size:"100 % ist die Größe der Punkte auf einer Karte mit großen Knoten. Kleinere Karten – Liste neben der Zeichnung, Handy – nehmen von sich aus etwas kleinere Punkte. Standard: 100 %.",line_width:"100 % sind 3 px für die Verbindungen und 2 px für die Linien zur Liste, auf einer Karte mit großen Knoten. Kleinere Karten nehmen von sich aus etwas dünnere Linien. Standard: 100 %.",avg_short_minutes:"Zeitraum für den kurzen Mittelwert. Standard: 2.",avg_long_minutes:"Zeitraum für den langen Mittelwert. Standard: 15.",energy_periods:"Was der Quick-Button anbietet: die Leistung und Energie über einen Zeitraum, berechnet aus der Statistik der Leistungssensoren. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: Leistung, Heute, 24 h, Woche – aber nur, wenn PV, Netz, Batterie und Haus eine Statistik haben, sonst nur Leistung. Netz und Batterie mit zwei Sensoren zeigen beide Richtungen; mit einem Sensor mit Vorzeichen zeigt das Netz den Saldo, die Batterie keine Zahl.",energy_periods_locked:"Geht nicht mit abgeleitetem Netz oder abgeleiteter Batterie.",inactive_lines:"Verbindungen, auf denen gerade nichts fließt. „Ausblenden“ beruhigt das Bild nachts. Standard: Anzeigen.",animation:"„Systemeinstellung folgen“ richtet sich nach „Bewegung reduzieren“ des Geräts — das steht im Betriebssystem, nicht in Home Assistant. Standard: Systemeinstellung folgen.",ring_animation:"Wie der Verbraucher-Ring einer umsortierten Liste folgt. „Überholen“: Jedes Segment wandert an seinen neuen Platz, wer nach vorn rückt, überholt auf einer inneren Bahn. „Farben überblenden“: Die Plätze bleiben, ihre Farben blenden in die neue Reihenfolge über. „Springen“: keine Bewegung, neue Werte sind sofort da. Bei Bewegung „Aus“ springt der Ring immer. Standard: Überholen.",battery_soc:"Ladezustand in Prozent. Wird nie gemittelt.",color:"Beliebiger CSS-Wert, z. B. #7e57c2 oder var(--primary-color). Leer = automatisch.",solar:"Positive Werte = Erzeugung. Meldet der Sensor die Erzeugung negativ, Vorzeichen umdrehen.",grid:"Positiv = Bezug aus dem Netz, negativ = Einspeisung. Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",house:"Gesamtverbrauch des Hauses. Ohne eigenen Sensor „Abgeleitet“ wählen.",battery:"Positiv = Entladen, negativ = Laden (Konvention von Home Assistant). Ist es beim Sensor umgekehrt, Vorzeichen umdrehen.",grid_import:"Nur der Bezug, als Betrag ≥ 0.",grid_export:"Nur die Einspeisung, als Betrag ≥ 0.",battery_discharge:"Nur das Entladen, als Betrag ≥ 0.",battery_charge:"Nur das Laden aus allen Quellen, als Betrag ≥ 0.",derived:"Wird aus den drei anderen Größen berechnet, damit die Bilanz aufgeht. Nur eine Größe kann abgeleitet sein.",min_w:"Ab dieser Leistung gilt eine Verbindung als aktiv: Punkte laufen, Netz und Batterie zeigen ihren Zustand. Darunter ist alles neutral. Standard: 10 W.",icon_battery:"Leer = Icon folgt dem Ladezustand.",peak_w:"Ein Wert für die ganze Bewegung: Bei dieser Leistung laufen die meisten Punkte am schnellsten. Die drei Schwellen der Feineinstellung ergeben sich daraus (1/12, 1/3, 1/1), solange sie leer sind. Standard 6000 W.",flow_fine:"Nur nötig, wenn die Höchstleistung allein nicht reicht. Ein gesetzter Wert hat Vorrang vor der Ableitung aus der Höchstleistung. Stimmt die Reihenfolge nicht, hebt die Karte den zweiten Wert an und meldet es in der Browser-Konsole.",slow_below_w:"Darunter läuft ein einzelner Punkt im Ruhe-Tempo. Ab hier wird er schneller. Standard: Höchstleistung / 12.",more_dots_above_w:"Ab hier kommen weitere Punkte dazu, unabhängig vom Tempo. Standard: Höchstleistung / 3.",max_dots_at_w:"Ab hier laufen so viele Punkte wie erlaubt. Dazwischen: immer mehr Punkte. Standard: Höchstleistung.",slow_s:"Zeit für eine Runde, wenn wenig fließt. Standard 5.",fast_s:"Zeit für eine Runde, wenn viel fließt. Standard 1,8.",max_dots:"Wie viele Punkte auf einer Verbindung höchstens laufen. Standard 5.",full_speed_w:"Ab hier läuft der Punkt so schnell wie möglich. Dazwischen: ein Punkt, der schneller wird. Standard: wie „Mehr Punkte ab“.",power_unit:"Kilowatt, Watt oder automatisch. „Automatisch“ wählt je Wert: unter 1000 W ganze Watt, darüber Kilowatt — sonst steht ein Verbraucher mit 30 W als „0,0 kW“ da. Standard: Kilowatt.",power_decimals:"Nur bei Kilowatt; Watt werden immer als ganze Zahl gezeigt. Standard 2.",grid_status:"Nur wenn deine Anlage einen Netzausfall meldet — viele tun es nicht. Ohne diese Angabe zeigt die Karte keinen Ausfall an; alles andere funktioniert.",grid_status_outage:"Pflichtangabe. Jede Integration benennt ihre Zustände anders, hier wird nichts geraten. Trage den Rohwert ein, nicht die Anzeige von Home Assistant: Ein Aufzählungssensor zeigt einen übersetzten Namen, aus „Nicht erkannt“ wird also `not_detected`. Wer aus der Liste auswählt, umgeht die Frage.",grid_status_ok:"Optional. Leer gelassen gelten die eigenen Optionen der Entität ohne die Ausfall-Zustände als „Netz liegt an“; alles andere, auch unavailable, lässt den letzten Zustand stehen.",layout:"Wo die vier Knoten stehen. Beim Quadrat · PV links stehen die PV-Zeilen links der Zeichnung, die Verbraucher rechts; ist die Karte dafür zu schmal, stehen beide Listen darunter. Standard: Kreuz.",flow_lines:"Wie die Verbindungen zwischen den Knoten laufen. Standard: geschwungen beim Kreuz, gerade bei den anderen Anordnungen.",appearance:"Zeigt diese eine Karte hell oder dunkel – unabhängig vom Theme und ohne den Rest des Dashboards zu verändern. Es legt zugleich fest, welchen der beiden Wertesätze ein Fluss-Design nimmt. „Wie das Theme“ liest den Untergrund aus; das klappt fast immer, aber nicht bei Themes ohne eigenen Kartenhintergrund. Hell und Dunkel verwenden die Standardfarben von Home Assistant, nicht die eines eigenen Themes.",icon_rest:"Leer = ein schlichter Punkt.",dot_color:"Leer = jeder Punkt hat die Farbe seines Flusses und zeigt damit, woher die Energie kommt. Eine Farbe hier gilt für alle Punkte der Karte; die Linien behalten ihre.",power_digits:"Wie viele Ziffern die Zahl aussagt — nicht wie viele hinter dem Komma stehen. Mit 3: 1,23 kW · 12,3 kW · 123 kW. Eine Nachkommastelle bedeutet bei 1,23 kW etwas anderes als bei 123 kW; die Aussagekraft bleibt so gleich. Watt sind immer ganz. Standard: 3.",consumers_list:"Aufklappen zum Bearbeiten, am Griff ziehen zum Sortieren. Die Farbe steht unter „Farben“.",consumer_min_w:"Überschreibt die globale Mindestleistung – etwa 50 W für eine Wärmepumpe, damit ihr Standby nicht als Verbraucher zählt.",consumer_soc:"Für eine Wallbox der Ladestand des Autos, aus dessen eigener Integration. Erscheint als Ring um das Icon; lädt nichts, steht er statt der Leistung in der Zeile.",consumer_show:"„Wenn angesteckt“ hält die Zeile in der Liste, solange das Auto angesteckt ist – auch voll und bei 0 W.",consumer_plugged:"Ein Ein/Aus-Sensor (an = angesteckt) oder ein Status-Sensor der Wallbox.",consumer_unplugged:"Die Zustände des Status-Sensors, die „nicht angesteckt“ bedeuten; alle anderen gelten als angesteckt.",node_show_state:"Ohne Zustandswort zeigt nur noch die Farbe, ob eingespeist oder bezogen, geladen oder entladen wird.",node_inside_entity:"Eine beliebige Entität. Im Kreis ist nur Platz für Zahl und Einheit. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_entity:"Eine beliebige Entität, direkt am Kreis. Zeigt immer den aktuellen Zustand, auch in den Ø-Ansichten.",node_label_prefix:"Freier Text vor dem Wert, z. B. „Autarkie“.",node_inside_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_label_decimals:"„Wie in Home Assistant“ übernimmt die Angezeigte Genauigkeit aus den Einstellungen der Entität. Signifikante Stellen gelten unabhängig von der Einheit: 1,23 · 12,3 · 123. Auf Text, Geldbeträge, Dauer und Zeitpunkte wirkt die Auswahl nicht – sie stehen immer so da wie in Home Assistant.",node_inside_size:"In Prozent des Knotenwerts.",node_label_size:"In Prozent der Beschriftung (12 px).",node_inside_position:"Über dem Icon steht der Wert dort, wo die Batterie ihren Ladezustand zeigt, und Antippen öffnet seine eigene Historie. Unter dem Wert öffnet Antippen die Entität des Knotens.",modes:"Was der Quick-Button anbietet: Jetzt, kurzer und langer Mittelwert. Mehrere angehakt: Jeder Tipp schaltet weiter. Einer angehakt: fest, ohne Knopf. Standard: alle drei.",modes_locked:"Mittelwerte gibt es nur für die Leistung. Hake unter „Quick-Button Leistung/Energie“ „Leistung“ an, dann lässt sich die Glättung einstellen. Bis dahin zeigt die Karte immer den Augenblickswert.",scope:"Was der Quick-Button anbietet: die gefilterte Verbraucherliste oder alle Verbraucher. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide.",list_enabled:"Standard: an, wenn Verbraucher eingetragen sind.",ring_enabled:"Ring der Verbraucher am Haus. Standard: an, wenn Verbraucher eingetragen sind.",list_always_below:"Die Liste bleibt unter der Zeichnung, auch wenn daneben Platz wäre. Standard: aus.",quick_buttons:"Die Knöpfe im Kopf der Karte. Je Knopf, was er anbietet: mehrere Werte – jeder Tipp schaltet weiter; ein Wert – fest, ohne Knopf.",solar_sources:"Jeder Wechselrichter oder String mit eigenem Sensor; die PV ist ihre Summe. Die Farbe einer Quelle lässt sich im YAML setzen (color), sonst Orange-Töne.",pv_source_kwp:"Für die Skala „% kWp“ an jeder Quelle nötig. Ohne Angabe: keine.",pv_source_excluded:"Für Quellen, die am Wechselrichter vorbei einspeisen (Balkonkraftwerk): Ihre Leistung wird zum gemessenen Hauswert addiert, das Haus heißt dann „berechnet“. Standard: aus.",list_solar:"Zeigt jede Quelle als Zeile über den Verbrauchern, mit eigenem Fächer. Standard: aus.",ring_solar:"Ring der Quellen am PV-Knoten. Standard: an.",pv_scales:"Was der Quick-Button anbietet: „100 %“ – der Ring zeigt den Anteil jeder Quelle und ist immer voll; „% kWp“ – die Leistung im Verhältnis zur Spitzenleistung. Mehrere angehakt: Jeder Tipp schaltet um. Einer angehakt: fest, ohne Knopf. Standard: beide, soweit möglich.",pv_scale_peak_locked:"„% kWp“ braucht die Spitzenleistung (kWp) an jeder Quelle. Trage sie unter „PV-Quellen“ ein, dann lässt sich die Skala wählen.",pv_scale_share_locked:"„100 %“ braucht mindestens zwei Quellen – mit einer wäre der Ring immer voll.",quick_style:"Wie die Quick-Buttons aussehen. „Segment-Buttons kompakt“ macht auch die Buttons zum Durchschalten flacher; „Einzel-Buttons“ wirkt bei aufgeklappten Quick-Buttons. Standard: Segment-Buttons.",expanded_modes:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_energy_periods:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_pv_scales:"Alle Werte als eigene Buttons nebeneinander statt eines Buttons zum Durchschalten. Standard: aus.",expanded_scope:"Gefiltert und Vollständig als zwei Buttons statt eines Filter-Knopfs. Standard: aus."},outage:{banner:"Inselbetrieb — kein Netz",label:"Netzstatus"},example:{banner:"Beispielwerte — wähle deine Sensoren im Editor"},pv_scale:{share:"100 %",peak:"% kWp",share_title:"PV: Anteil jeder Quelle, der Ring ist immer voll",peak_title:"PV: Leistung im Verhältnis zur Spitzenleistung",peak_period_title:"PV: mittlere Leistung im Zeitraum im Verhältnis zur Spitzenleistung",chip:"PV-Skala: {mode}, weiter: {next}"}}};function Re(e){const t="undefined"!=typeof document?document.documentElement?.lang:void 0;return(e?.language||t||"en").split("-")[0].toLowerCase()}function Le(e,t){let o=e;for(const e of t.split(".")){if("object"!=typeof o||null===o)return;o=o[e]}return"string"==typeof o?o:void 0}function qe(e,t,o){const i=Re(t),s=Le(Fe[i],e)??Le(Fe.en,e)??e;return o?s.replace(/\{(\w+)\}/g,(e,t)=>t in o?String(o[t]):e):s}const De=new Set(["unavailable","unknown","none",""]),Te=e=>e.trim().toLowerCase();function Oe(e,t,o,i){switch(function(e,t,o){if(void 0===e)return"hold";const i=Te(e);return De.has(i)?"hold":t.outage.includes(i)?"outage":t.ok.length>0?t.ok.includes(i)?"ok":"hold":o&&o.length>0?o.some(e=>Te(e)===i)?"ok":"hold":"ok"}(t,o,i)){case"outage":return!0;case"ok":return!1;default:return e}}function Ie(e,t){const o=e.states[t]?.attributes.options;if(Array.isArray(o))return o.filter(e=>"string"==typeof e)}function Be(e,t){console.warn(qe("error.config.grid_status_no_outage",t,{field:e}))}class He extends Error{constructor(e,t){super(e),this.field=t,this.name="ConfigError"}}const Ve=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],je={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home"},Ke=["current","avg_short","avg_long"],Ue=["power","today","24h","week","7d","month","30d"],Ze=["power","today","24h","week"],Qe=["filtered","full"],Ge=["share","peak"],Ye=["auto","on","off"],Je=["show","dim","hide"],Xe=["overtake","fade","jump"],et=["auto","light","dark"],tt=new Set(["type","title","entities","consumers","min_consumer_w","max_consumers","update_interval_s","list","ring","view","flow","colors","icons","power","appearance","nodes","memory_id","layout"]),ot=new Set(["view_layout","layout_options","grid_options","visibility","card_mod"]),it={positive:"import",negative:"export"},st={positive:"discharge",negative:"charge"};function nt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function rt(e,t,o,i){return new He(qe(e,o,{field:t,...i}),t)}function at(e,t,o){if(!nt(e))throw rt("error.config.object",t,o);return e}function lt(e,t,o){if("string"!=typeof e||""===e.trim())throw rt("error.config.string",t,o);return e}const ct=e=>null==e||"string"==typeof e&&""===e.trim();function dt(e,t,o){if(!ct(e))return lt(e,t,o)}function ht(e,t,o){return ct(e)?{}:at(e,t,o)}function ut(e,t,o,i){if(ct(e))return o;if("boolean"!=typeof e)throw rt("error.config.boolean",t,i);return e}function pt(e,t,o,i){if(ct(e))return o;if("number"!=typeof e||!Number.isFinite(e))throw rt("error.config.number",t,i);return e}function mt(e,t,o,i){const s=pt(e,t,o,i);if(!Number.isInteger(s))throw rt("error.config.integer",t,i);return s}let gt;const ft={min_consumer_w:{min:0},max_consumers:{min:1,integer:!0},update_interval_s:{min:1},"view.avg_short_minutes":{min:1,max:120,integer:!0},"view.avg_long_minutes":{min:2,max:240,integer:!0},"flow.min_w":{min:0},"flow.peak_w":{min:1},"flow.slow_below_w":{min:0},"flow.more_dots_above_w":{min:0},"flow.max_dots_at_w":{min:0},"flow.full_speed_w":{min:0},"flow.max_dots":{min:2,max:10,integer:!0},"flow.slow_s":{min:.1},"flow.fast_s":{min:.1},"flow.dot_size":{min:40,max:150},"flow.line_width":{min:30,max:150},"consumers.min_w":{min:0},"entities.solar.kwp":{min:.01,max:1e4},"nodes.size":{min:60,max:150}};function _t(e,t,o,i,s=ft[t]){let n=pt(e,t,o,i);s.integer&&!Number.isInteger(n)&&(n=Math.round(n),console.warn(qe("error.config.rounded",i,{field:t,value:n})),gt?.push({field:t,used:n,reason:"integer"}));const{min:r,max:a}=s;if(n<r||void 0!==a&&n>a){const e=n<r?"min":"max";n=n<r?r:a,console.warn(void 0===a?qe("error.config.clamped_min",i,{field:t,min:r,value:n}):qe("error.config.clamped",i,{field:t,min:r,max:a,value:n})),gt?.push({field:t,used:n,reason:e})}return n}function wt(e,t){const o=e.flatMap((e,t)=>e.set?[t]:[]),i=o.map(t=>e[t].value).sort((e,t)=>e-t),s=e.map(e=>e.value);o.forEach((e,t)=>{s[e]=i[t]});for(let t=s.length-1;t>0;t--){if(!e[t].set||e[t-1].set||s[t]>=s[t-1]+e[t].gap)continue;const o=ft[e[t-1].field]?.min??Number.NEGATIVE_INFINITY;s[t]-e[t].gap>=o&&(s[t-1]=s[t]-e[t].gap)}for(let t=1;t<s.length;t++)s[t]<s[t-1]+e[t].gap&&(s[t]=s[t-1]+e[t].gap);const n=e.map((e,t)=>s[t]!==e.value);return e.forEach((e,o)=>{n[o]&&console.warn(qe("error.config.order_used",t,{field:e.field,value:s[o]}))}),n.some(Boolean)&&e.forEach((e,t)=>{(e.set||n[t])&&gt?.push({field:e.field,used:s[t],reason:"order"})}),s}function yt(e,t,o,i,s){if(e<t||e>o)throw rt("error.config.range",i,s,{min:t,max:o});return e}function vt(e,t,o,i,s){if(ct(e))return i;if("string"!=typeof e||!t.includes(e))throw rt("error.config.enum",o,s,{allowed:t.join(", ")});return e}function bt(e,t,o,i,s){return ct(e)?i:"string"==typeof e&&t.includes(e)?e:(console.warn(qe("error.config.unknown_value",s,{field:o,allowed:t.join(", ")})),i)}const xt=["cross","square_right","square_left","triangle"],kt=["curved","straight"],$t=["segment","segment_compact","single"],St=["modes","energy_periods","pv_scales","scope"];function At(e,t){if(ct(e))return[];const o=Array.isArray(e)?e:[e],i=[];for(const e of o)"string"==typeof e&&St.includes(e)?i.includes(e)||i.push(e):console.warn(qe("error.config.unknown_value",t,{field:"view.expanded",allowed:St.join(", ")}));return i}function Mt(e,t,o,i){if(ct(e))return;if(!Array.isArray(e))throw rt("error.config.list",o,i);for(const s of e)vt(s,t,o,t[0],i);const s=t.filter(t=>e.includes(t));if(0!==s.length)return s;console.warn(qe("error.config.empty_choice",i,{field:o}))}function Et(e,t,o,i){if(ct(e))return{kind:"absent"};if("string"==typeof e)return"derived"===e?{kind:"derived"}:{kind:"single",entity:e,invert:!1};if(!nt(e))throw rt("error.config.mixed_form",t,i);const s=Object.keys(e),n="entity"in e,r=void 0!==o&&(o.positive in e||o.negative in e);if(n&&r)throw rt("error.config.mixed_form",t,i);if(n){if(s.some(e=>"entity"!==e&&"invert"!==e))throw rt("error.config.mixed_form",t,i);const o=e.entity;if("string"!=typeof o||""===o.trim())throw rt("error.config.mixed_form",t,i);const n=e.invert;if(!ct(n)&&"boolean"!=typeof n)throw rt("error.config.boolean",`${t}.invert`,i);return{kind:"single",entity:o,invert:!0===n}}if(o&&r){if(s.some(e=>e!==o.positive&&e!==o.negative))throw rt("error.config.mixed_form",t,i);const n=e[o.positive],r=e[o.negative];if("string"!=typeof n||""===n.trim()||"string"!=typeof r||""===r.trim())throw rt("error.config.mixed_form",t,i);return{kind:"split",positive:n,negative:r}}throw rt("error.config.mixed_form",t,i)}function Ct(e,t,o){if(ct(e))return[];if(!Array.isArray(e))throw rt("error.config.list",t,o);const i=[];for(const s of e){if(ct(s))continue;if("string"!=typeof s)throw rt("error.config.string",t,o);const e=Te(s);""===e||i.includes(e)||i.push(e)}return i}const zt=Object.freeze(["#e65100","#ffc107","#ff9800","#ffd54f","#f4511e","#ffb74d"]);function Pt(e,t,o){if("absent"===e.kind)throw rt("error.config.missing_entities",t,o)}const Wt=["solar_inside","solar_label","grid_inside","grid_label","house_inside","house_label","battery_label"];function Nt(e,t){const o=Object.fromEntries(Wt.map(e=>[e,"var(--secondary-text-color)"]));if(!nt(e))return o;for(const i of Wt){const s=dt(e[i],`colors.${i}`,t);s&&(o[i]=s)}return ct(e.battery_inside)||console.warn(qe("error.config.not_for_node",t,{field:"colors.battery_inside"})),o}function Ft(e,t){const o={...ve,socStops:be.map(e=>({...e})),consumerPalette:[...xe]},i=ht(e,"colors",t);for(const e of Ve){const s=dt(i[e],`colors.${e}`,t);s&&(o[e]=s)}return ct(i.soc_stops)||(o.socStops=function(e,t){const o="colors.soc_stops";if(!Array.isArray(e))throw rt("error.config.list",o,t);if(e.length<2)throw rt("error.config.soc_stops",o,t);const i=[];for(let s=0;s<e.length;s++){const n=e[s];if(!nt(n)||"number"!=typeof n.at||!Number.isFinite(n.at)||"string"!=typeof n.color||""===n.color.trim())throw rt("error.config.soc_stop_entry",`${o}[${s}]`,t,{index:s});i.push({at:n.at,color:n.color})}for(let e=1;e<i.length;e++)if(i[e].at<i[e-1].at)throw rt("error.config.soc_stops",o,t);if(0!==i[0].at)throw rt("error.config.soc_stops",o,t);if(100!==i[i.length-1].at)throw rt("error.config.soc_stops",o,t);return i}(i.soc_stops,t)),ct(i.consumer_palette)||(o.consumerPalette=function(e,t){const o="colors.consumer_palette";if(!Array.isArray(e))throw rt("error.config.list",o,t);if(0===e.length)throw rt("error.config.non_empty",o,t);return e.map((e,i)=>lt(e,`${o}[${i}]`,t))}(i.consumer_palette,t)),o}const Rt=["kW","W","auto"];function Lt(e,t){const o=ht(e,"power",t);return{unit:vt(o.unit,Rt,"power.unit","kW",t),decimals:yt(mt(o.decimals,"power.decimals",2,t),1,3,"power.decimals",t),digits:yt(mt(o.digits,"power.digits",3,t),2,4,"power.digits",t)}}function qt(e,t){const o={...je},i=ht(e,"icons",t);for(const e of["solar","grid","house","battery","rest"]){const s=dt(i[e],`icons.${e}`,t);s&&(o[e]=s)}return o}const Dt=["charging","plugged","always"];function Tt(e,t,o){if(ct(e))return;const i=at(e,t,o),s=dt(i.soc,`${t}.soc`,o);if(!s)return void console.warn(qe("error.config.charge_no_soc",o,{field:t}));let n=vt(i.show,Dt,`${t}.show`,"charging",o);const r=dt(i.plugged,`${t}.plugged`,o);return"plugged"!==n||r||(console.warn(qe("error.config.charge_no_plugged",o,{field:t})),n="charging"),{soc:s,show:n,plugged:r,unplugged:/^(binary_sensor|input_boolean)\./.test(r??"")?[]:Ct(i.unplugged,`${t}.unplugged`,o)}}const Ot=["solar","grid","house","battery"],It=["above","below"],Bt=["normal","medium","bold"],Ht=["ha","sig2","sig3","sig4"],Vt=new Set(["show_name","show_state","inside","label"]),jt={inside:new Set(["entity","position","decimals","size","weight"]),label:new Set(["entity","prefix","decimals","size","weight"])};function Kt(e,t,o){if(ct(e))return"ha";if("string"==typeof e&&Ht.includes(e))return e;const i="string"==typeof e&&/^\d$/.test(e)?Number(e):e;if(0===i||1===i||2===i||3===i)return i;throw rt("error.config.enum",t,o,{allowed:"ha, 0, 1, 2, 3, sig2, sig3, sig4"})}function Ut(e,t,o,i){for(const s of Object.keys(e))t.has(s)||console.warn(qe("error.config.unknown_key",i,{field:`${o}.${s}`}))}function Zt(e,t,o,i){if(ct(e))return;const s=at(e,o,i);Ut(s,jt[t],o,i);const n="string"==typeof s.entity?s.entity.trim():"";if(!n)return void console.warn(qe("error.config.extra_no_entity",i,{field:o}));const r={entity:n,decimals:Kt(s.decimals,`${o}.decimals`,i),size:_t(s.size,`${o}.size`,100,i,ft["nodes.size"]),weight:vt(s.weight,Bt,`${o}.weight`,"normal",i)};if("inside"===t)return{...r,position:vt(s.position,It,`${o}.position`,"above",i)};if(!ct(s.prefix)&&"string"!=typeof s.prefix)throw rt("error.config.string",`${o}.prefix`,i);const a="string"==typeof s.prefix?s.prefix.trim():"";return{...r,prefix:a||void 0}}function Qt(e,t){const o=Object.fromEntries(Ot.map(e=>[e,{showName:!0,showState:!0}]));if(ct(e))return o;const i=at(e,"nodes",t);Ut(i,new Set(Ot),"nodes",t);for(const e of Ot){if(ct(i[e]))continue;const s=`nodes.${e}`,n=at(i[e],s,t);Ut(n,Vt,s,t);const r=o[e];r.showName=ut(n.show_name,`${s}.show_name`,!0,t);const a=ut(n.show_state,`${s}.show_state`,!0,t);"grid"===e||"battery"===e?r.showState=a:ct(n.show_state)||console.warn(qe("error.config.not_for_node",t,{field:`${s}.show_state`})),"battery"!==e?r.inside=Zt(n.inside,"inside",`${s}.inside`,t):ct(n.inside)||console.warn(qe("error.config.not_for_node",t,{field:`${s}.inside`})),r.label=Zt(n.label,"label",`${s}.label`,t)}return o}function Gt(e,t,o){gt=o;const i=console.warn;o&&(console.warn=()=>{});try{return function(e,t){const o=at(e,"config",t);if(function(e,t){for(const o of Object.keys(e))tt.has(o)||ot.has(o)||console.warn(qe("error.config.unknown_key",t,{field:o}))}(o,t),ct(o.entities))throw rt("error.config.missing_entities","entities",t);const i=at(o.entities,"entities",t),s=Array.isArray(i.solar)?function(e,t){const o=new Set,i=[];return e.forEach((e,s)=>{const n=`entities.solar[${s}]`,r="string"==typeof e?{entity:e}:e;if(!nt(r)||"string"!=typeof r.entity||""===r.entity.trim())return void console.warn(qe("error.config.consumer_entity",t,{field:n,index:s}));const a=r.entity.trim();if("derived"===a)throw rt("error.config.mixed_form",n,t);if(o.has(a))return void console.warn(qe("error.config.duplicate_consumer",t,{field:n,entity:a}));o.add(a);const l=r.invert;if(!ct(l)&&"boolean"!=typeof l)throw rt("error.config.boolean",`${n}.invert`,t);const c=dt(r.house,`${n}.house`,t);void 0!==c&&"excluded"!==c&&console.warn(qe("error.config.solar_house",t,{field:`${n}.house`})),i.push({key:a,entity:a,name:dt(r.name,`${n}.name`,t),kwp:ct(r.kwp)?void 0:_t(r.kwp,`${n}.kwp`,1,t,ft["entities.solar.kwp"]),icon:dt(r.icon,`${n}.icon`,t),color:dt(r.color,`${n}.color`,t)??zt[s%zt.length],invert:!0===l,excluded:"excluded"===c})}),i}(i.solar,t):[],n=Array.isArray(i.solar)?s.length>0?{kind:"sum"}:{kind:"absent"}:Et(i.solar,"entities.solar",void 0,t),r=Et(i.grid,"entities.grid",it,t),a=Et(i.battery,"entities.battery",st,t),l=Et(i.house,"entities.house",void 0,t),c="absent"===l.kind?{kind:"derived"}:l;Pt(n,"entities.solar",t),Pt(r,"entities.grid",t);const d=[["entities.solar",n],["entities.grid",r],["entities.battery",a],["entities.house",c]].filter(([,e])=>"derived"===e.kind).map(([e])=>e);if(d.length>1)throw rt("error.config.two_derived",d[1],t);let h;h=dt(i.battery_soc,"entities.battery_soc",t),void 0!==h&&"absent"===a.kind&&(console.warn(qe("error.config.soc_without_battery",t,{field:"entities.battery_soc"})),h=void 0);const u=function(e,t,o){if(ct(e))return;if("string"==typeof e)return void Be(t,o);const i=at(e,t,o),s=lt(i.entity,`${t}.entity`,o),n=Ct(i.outage,`${t}.outage`,o),r=Ct(i.ok,`${t}.ok`,o);if(0!==n.length)return{entity:s,outage:n,ok:r};Be(t,o)}(i.grid_status,"entities.grid_status",t),p=Ft(o.colors,t),m=function(e,t,o){if(ct(e))return[];if(!Array.isArray(e))throw rt("error.config.list","consumers",o);const i=new Set,s=[];for(let n=0;n<e.length;n++){const r=e[n],a=`consumers[${n}]`;if(!nt(r)||"string"!=typeof r.entity||""===r.entity.trim()){console.warn(qe("error.config.consumer_entity",o,{field:a,index:n}));continue}const l=r.entity;i.has(l)?console.warn(qe("error.config.duplicate_consumer",o,{field:a,entity:l})):(i.add(l),s.push({key:l,entity:l,name:dt(r.name,`${a}.name`,o),color:dt(r.color,`${a}.color`,o)??t[n%t.length],icon:dt(r.icon,`${a}.icon`,o),minW:ct(r.min_w)?void 0:_t(r.min_w,`${a}.min_w`,0,o,ft["consumers.min_w"]),charge:Tt(r.charge,`${a}.charge`,o)}))}return s}(o.consumers,p.consumerPalette,t),g=_t(o.min_consumer_w,"min_consumer_w",10,t),f=ct(o.max_consumers)?Number.POSITIVE_INFINITY:_t(o.max_consumers,"max_consumers",1,t),_=_t(o.update_interval_s,"update_interval_s",5,t),w=ht(o.list,"list",t),y=ht(o.ring,"ring",t),v=m.length>0,b=ht(o.view,"view",t),[x,k]=wt([{field:"view.avg_short_minutes",value:_t(b.avg_short_minutes,"view.avg_short_minutes",2,t),set:!ct(b.avg_short_minutes),gap:0},{field:"view.avg_long_minutes",value:_t(b.avg_long_minutes,"view.avg_long_minutes",15,t),set:!ct(b.avg_long_minutes),gap:1}],t),$=ht(o.flow,"flow",t),S=_t($.min_w,"flow.min_w",10,t),A=_t($.peak_w,"flow.peak_w",6e3,t),M=_t($.max_dots,"flow.max_dots",5,t),E=[["flow.min_w",S,$.min_w,0],["flow.slow_below_w",A/12,$.slow_below_w,0],["flow.more_dots_above_w",A/3,$.more_dots_above_w,1],["flow.max_dots_at_w",A,$.max_dots_at_w,1]].map(([e,o,i,s])=>({field:e,value:"flow.min_w"===e?S:_t(i,e,o,t),set:!ct(i),gap:s})),[C,z,P,W]=wt(E,t),[N,F]=wt([{field:"flow.fast_s",value:_t($.fast_s,"flow.fast_s",1.8,t),set:!ct($.fast_s),gap:0},{field:"flow.slow_s",value:_t($.slow_s,"flow.slow_s",5,t),set:!ct($.slow_s),gap:1}],t);let R=P;ct($.full_speed_w)||(R=_t($.full_speed_w,"flow.full_speed_w",P,t),R<=z&&(R=z+1,console.warn(qe("error.config.order_used",t,{field:"flow.full_speed_w",value:R})),gt?.push({field:"flow.full_speed_w",used:R,reason:"order"})));const L=bt(o.layout,xt,"layout","cross",t),q=function(e,t,o,i,s,n){const r=!ut(e.show_selector,"view.show_selector",!0,n),a=vt(e.default_mode,Ke,"view.default_mode","current",n),l=vt(e.default_energy,Ue,"view.default_energy","power",n),c=vt(t.default_scope,Qe,"list.default_scope","filtered",n);let d=Mt(e.modes,Ke,"view.modes",n)??(r?[a]:[...Ke]);const h="view.energy_periods";let u=Mt(e.energy_periods,Ue,h,n);const p=void 0===u&&!r;u??=r?[l]:[...Ze],!u.some(e=>"power"!==e)||"derived"!==o.kind&&"derived"!==i.kind||(console.warn(qe("error.config.energy_derived",n,{field:h})),u=["power"]);const m=u.includes("power");m||(d=["current"]);const g=Mt(t.scope,Qe,"list.scope",n)??(r?[c]:[...Qe]),f=vt(e.default_pv_scale,Ge,"view.default_pv_scale","share",n),_=s.sources,w=Ge.filter(e=>"share"===e?_.length>1:_.length>0&&_.every(e=>void 0!==e.kwp)),y=Mt(e.pv_scales,Ge,"view.pv_scales",n)??(r?[f]:[...Ge]);let v=s.ring?y.filter(e=>w.includes(e)):[];return s.ring&&0===v.length&&w.length>0&&(console.warn(qe("error.config.pv_scale",n,{field:"view.pv_scales"})),v=[w[0]]),{modes:d,defaultMode:d.includes(a)?a:d[0],power:m,energyPeriods:u.filter(e=>"power"!==e),energyDefault:p&&u.length>1,defaultEnergy:u.includes(l)?l:u[0],scope:g,defaultScope:g.includes(c)?c:g[0],pvScales:v,defaultPvScale:v.includes(f)?f:v[0]??"share"}}(b,w,r,a,{sources:s,ring:ut(y.solar,"ring.solar",!0,t)},t);return{layout:L,title:dt(o.title,"title",t),memoryId:"number"==typeof o.memory_id?String(o.memory_id):dt(o.memory_id,"memory_id",t),sources:{solar:n,grid:r,battery:a,house:c,batterySoc:h},gridStatus:u,solarSources:s,consumers:m,minConsumerW:g,maxConsumers:f,updateIntervalS:_,list:{enabled:ut(w.enabled,"list.enabled",v,t),restLabel:dt(w.rest_label,"list.rest_label",t),title:dt(w.title,"list.title",t),alwaysBelow:ut(w.always_below,"list.always_below",!1,t),solar:ut(w.solar,"list.solar",!1,t),scope:q.scope,defaultScope:q.defaultScope},ring:{enabled:ut(y.enabled,"ring.enabled",v,t),animation:vt(y.animation,Xe,"ring.animation","overtake",t),solar:ut(y.solar,"ring.solar",!0,t)},view:{modes:q.modes,defaultMode:q.defaultMode,avgShortMinutes:x,avgLongMinutes:k,remember:ut(b.remember,"view.remember",!0,t),power:q.power,energyPeriods:q.energyPeriods,energyDefault:q.energyDefault,defaultEnergy:q.defaultEnergy,pvScales:q.pvScales,defaultPvScale:q.defaultPvScale,quickStyle:bt(b.quick_style,$t,"view.quick_style","segment",t),expanded:At(b.expanded,t)},flow:{minW:C,slowBelowW:z,fullSpeedW:R,moreDotsAboveW:P,maxDotsAtW:W,maxDots:M,slowS:F,fastS:N,animation:vt($.animation,Ye,"flow.animation","auto",t),design:"string"==typeof $.design&&$.design.trim()?$.design.trim():"none",dotColor:"string"==typeof $.dot_color&&$.dot_color.trim()?$.dot_color.trim():void 0,dotSize:_t($.dot_size,"flow.dot_size",100,t),lineWidth:_t($.line_width,"flow.line_width",100,t),lines:bt($.lines,kt,"flow.lines","cross"===L?"curved":"straight",t),inactiveLines:vt($.inactive_lines,Je,"flow.inactive_lines","show",t)},appearance:vt(o.appearance,et,"appearance","auto",t),colors:p,icons:qt(o.icons,t),nodes:Qt(o.nodes,t),extraColors:Nt(o.colors,t),power:Lt(o.power,t),...void 0===o.card_mod?{}:{card_mod:o.card_mod}}}(e,t)}finally{gt=void 0,console.warn=i}}function Yt(){const e="abcdefghijklmnopqrstuvwxyz0123456789";return[...crypto.getRandomValues(new Uint8Array(8))].map(t=>e[t%36]).join("")}function Jt(e){const t=[],o=e=>{if(Array.isArray(e))for(const t of e)o(t);else if(nt(e)){"string"==typeof e.type&&t.push(e);for(const t of["sections","cards","card"])o(e[t])}};return o(e),t}function Xt(e){return"number"==typeof e?String(e):"string"==typeof e&&e.trim()?e:void 0}const eo="enerlens-card",to="enerlens-card-editor",oo="EnerLens Card",io={solar:"sensor.solar_power",grid:"sensor.grid_power"},so={solar:3200,grid:450},no={solar_battery:"battery_charge",solar_grid:"grid_export",battery_grid:"grid_export",grid_battery:"grid_import",solar_house:"solar",battery_house:"battery_discharge",grid_house:"grid_import"},ro=Object.keys(no);function ao(e,t,o,i,s,n){let r=e,a=t,l=o,c=i,d=s,h=n;const u={},p=(e,t)=>(t>0&&(u[e]=t),t),m=p("solar_battery",Math.min(r,d));r-=m,d-=m;const g=p("solar_grid",Math.min(r,l));r-=g,l-=g;const f=p("battery_grid",Math.min(c,l));c-=f,l-=f;const _=p("grid_battery",Math.min(a,d));a-=_,d-=_;const w=p("solar_house",Math.min(r,h));r-=w,h-=w;const y=p("battery_house",Math.min(c,h));return c-=y,h-=y,p("grid_house",Math.min(a,h)),u}function lo(e,t){const{minW:o,slowBelowW:i,fullSpeedW:s,moreDotsAboveW:n,maxDotsAtW:r,maxDots:a,slowS:l,fastS:c}=t.flow;if(!Number.isFinite(e)||e<o)return null;let d=l;if(e>=s)d=c;else if(e>i){d=l-(e-i)/(s-i)*(l-c)}let h=1;if(e>=n){const t=(e-n)/(r-n);h=Math.min(a,2+Math.floor(t*(a-2)))}return{count:h,durationS:d}}function co(e,t){const o=[];for(const i of ro){const s=e[i];if(void 0===s)continue;const n=lo(s,t);n&&o.push({connection:i,w:s,count:n.count,durationS:n.durationS,colorKey:no[i]})}return o}function ho(e){const t=e.charge;if(t)return{entity:t.entity,soc:t.soc,stale:t.stale,since:t.since}}function uo(e,t){return e.w>=e.threshold||null!==lo(e.w,t)}function po(e,t){const o=e.filter(e=>uo(e,t)),i=o.reduce((e,t)=>e+t.w,0);return o.map(e=>({key:e.key,share:i>0?e.w/i:0,color:e.color,entity:e.entity,isRest:e.isRest}))}function mo(e,t,o=!1){const i=function(e,t,o){const i=[],s=[],n=[];for(const r of e.consumers){const e=r.charge,a=void 0!==e&&("always"===e.show||"plugged"===e.show&&e.plugged);if(!r.reading.available&&void 0!==t.energy?.consumers[r.entity]){n.push({key:r.key,name:r.name,w:0,color:r.color,entity:r.entity,icon:r.icon,threshold:r.minW??t.minConsumerW,isRest:!1,powerUnknown:!0});continue}if(!r.reading.available&&!a)continue;const l=r.reading.available?r.reading.w:0,c=r.minW??t.minConsumerW;if(!o&&!a&&l<c)continue;const d={key:r.key,name:r.name,w:l,color:r.color,entity:r.entity,icon:r.icon,threshold:c,isRest:!1,charge:ho(r),powerUnknown:!r.reading.available||void 0};(a?s:i).push(d)}const r=go(i).slice(0,o?Number.POSITIVE_INFINITY:t.maxConsumers).concat(s),a=r.slice();if(e.house.available){const o=e.house.w-r.reduce((e,t)=>e+t.w,0);o>=t.minConsumerW&&a.push({key:"__rest__",name:t.list.restLabel??"",w:o,color:t.colors.rest,icon:t.icons.rest,threshold:t.minConsumerW,isRest:!0})}return go(a).concat(n)}(e,t,o);return{entries:i,segments:po(i,t)}}function go(e){return e.sort((e,t)=>t.w-e.w)}const fo="none";let _o=function(e){for(const t of e){const e=t.spur;"number"!=typeof t.shape?.bias&&"number"==typeof e?.bias&&(t.shape.bias=e.bias),"number"!=typeof t.shape?.bias&&(t.shape.bias=0),"number"!=typeof t.shape?.caps&&(t.shape.caps=0);for(const e of[t.dark,t.light])"number"!=typeof e?.line&&(e.line=80)}return e}([{id:"kugeln",name:"Kugeln",name_en:"Orbs",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:0,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:0,glowStrength:45,line:80}},{id:"partylicht",name:"Partylicht",name_en:"Party Light",shape:{caps:5,bias:70},dark:{dot:14,core:30,coreLight:60,glow:2,glowStrength:100,line:80},light:{dot:14,core:20,coreLight:75,glow:1,glowStrength:45,line:80}},{id:"leuchtpunkte",name:"Leuchtpunkte",name_en:"Glowing Dots",shape:{caps:5,bias:95},dark:{dot:9,core:20,coreLight:100,glow:2,glowStrength:80,line:80},light:{dot:8,core:20,coreLight:75,glow:2,glowStrength:45,line:80}},{id:"electron",name:"Electron",shape:{caps:5,bias:70},dark:{dot:10,core:40,coreLight:100,glow:0,glowStrength:80,line:80},light:{dot:10,core:40,coreLight:100,glow:0,glowStrength:10,line:80}},{id:"proton",name:"Proton",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:2,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:100,glow:2,glowStrength:30,line:80}},{id:"neutrino",name:"Neutrino",shape:{caps:3,bias:100},dark:{dot:6,core:38,coreLight:100,glow:0,glowStrength:100,line:80},light:{dot:7,core:64,coreLight:85,glow:0,glowStrength:30,line:80}}]);function wo(e){if(e&&e!==fo)return _o.find(t=>t.id===e)}function yo(e,t){const o=e.name_en?.trim();return o?"de"===Re(t)?e.name:o:e.name}const vo=36e5,bo=3e5,xo=864e5,ko=["solar","import","export","discharge","charge","house"],$o=new Set(["solar","import","discharge"]),So={solar:0,import:0,export:0,discharge:0,charge:0,house:0};function Ao(e,t){const o=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(e),i=e=>Number(o.find(t=>t.type===e)?.value??0);return Date.UTC(i("year"),i("month")-1,i("day"),i("hour"),i("minute"),i("second"))-1e3*Math.floor(e/1e3)}function Mo(e,t,o,i){const s=Date.UTC(e,t,o),n=s-Ao(s,i);return s-Ao(n,i)}const Eo={"24h":24,"7d":168,"30d":720};function Co(e,t,o,i){const s=Eo[e];if(void 0!==s){const o="30d"===e?vo:bo;return Math.ceil((t-s*vo)/o)*o}const n=new Date(t+Ao(t,o)),r=n.getUTCFullYear(),a=n.getUTCMonth(),l=n.getUTCDate();if("month"===e)return Mo(r,a,1,o);if("week"===e){return Mo(r,a,l-(n.getUTCDay()-i+7)%7,o)}return Mo(r,a,l,o)}function zo(e){const t=new Map;for(const o of e??[])null!==o.mean&&Number.isFinite(o.mean)&&t.set(o.start,o.mean);return t}class Po{constructor(e,t,o){this.hourly=zo(e),this.fiveMin=zo(t),this.first=Math.min(...this.hourly.keys(),...this.fiveMin.keys(),o??Number.POSITIVE_INFINITY)}get exists(){return Number.isFinite(this.first)}at(e){if(e.hourly){const t=this.hourly.get(e.start);return void 0===t?void 0:{w:t,filled:!1}}const t=this.fiveMin.get(e.start);if(void 0!==t)return{w:t,filled:!1};const o=this.hourly.get(Math.floor(e.start/vo)*vo);return void 0===o?void 0:{w:o,filled:!0}}before(e){const t=Math.floor(e.start/vo)*vo-vo;return e.hourly?this.hourly.get(e.start-vo):this.fiveMin.get(e.start-bo)??this.hourly.get(t)}neighbour(e,t){const o=e.hourly?this.hourly:this.fiveMin,i=e=>this.hourly.get(Math.floor(e/vo)*vo),s=o.get(e.start-xo)??(e.hourly?void 0:i(e.start-xo));if(void 0!==s)return s;if(e.start+xo>=t)return 0;return o.get(e.start+xo)??(e.hourly?void 0:i(e.start+xo))??0}}function Wo(e,t){let o=0,i=0;for(const s of ko)s!==e&&($o.has(s)?o+=t[s]:i+=t[s]);return $o.has(e)?i-o:o-i}function No(e){const t=new Map,o=o=>{let i=t.get(o);return i||(i=new Po(e.hourly[o],e.fiveMin[o],e.since?.[o]),t.set(o,i)),i},i=ko.filter(t=>void 0!==e.roles[t]),s=["solar","house"].find(t=>void 0===e.roles[t]),n=e.solarSources?.length?e.solarSources.map(e=>({id:e,s:o(e)})):void 0,r=n?.filter(e=>e.s.exists)??[],a=i.filter(t=>"solar"===t&&n?r.length>0:o(e.roles[t]).exists),l=a.length===i.length;let c=Number.NEGATIVE_INFINITY,d=Number.NEGATIVE_INFINITY;const h=i.flatMap(t=>"solar"===t&&n?n.map(e=>e.s):[o(e.roles[t])]);for(const t of[...h,...e.consumers.map(o)]){for(const e of t.hourly.keys())d=Math.max(d,e+vo);for(const e of t.fiveMin.keys())c=Math.max(c,e+bo)}c=Math.max(c,d);const u=Math.max(e.from,Math.min(e.to,c)),p=Math.max(e.from,...a.map(t=>"solar"===t&&n?Math.min(...r.map(e=>e.s.first)):o(e.roles[t]).first)),m=Math.min(p,u),g=u-m,f=function(e,t,o){const i=[];let s=e;for(;s<t;)if(s%vo===0&&s+vo<=Math.min(t,o))i.push({start:s,end:s+vo,hourly:!0}),s+=vo;else{const e=Math.min(t,(Math.floor(s/bo)+1)*bo);i.push({start:s,end:e,hourly:!1}),s=e}return i}(m,u,d),_={...So},w={...So},y={};let v;const b=new Map(r.map(e=>[e.id,{wh:0,filledMs:0,counted:0,last:void 0}]));for(const t of f){const i=(t.end-t.start)/vo,c={...So},d=new Set,h=[];for(const s of a){if("solar"===s&&n){let o=0;for(const{id:s,s:n}of r){if(t.start<n.first)continue;const r=b.get(s),a=n.at(t);let l,c=!1;a?(l=a.w,c=a.filled):(r.last??n.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?l=0:(l=n.neighbour(t,u),c=!0),r.last=l,r.wh+=l*i,r.counted+=t.end-t.start,c&&(r.filledMs+=t.end-t.start,d.add("solar")),o+=l}c.solar=o;continue}const a=o(e.roles[s]),l=a.at(t);l?(c[s]=l.w,l.filled&&d.add(s)):"solar"===s&&(v??a.before(t)??e.pvZeroBelowW)<e.pvZeroBelowW?c.solar=0:h.push(s)}if(1===h.length&&!s&&l)c[h[0]]=Math.max(0,Wo(h[0],c)),d.add(h[0]);else for(const i of h)c[i]=o(e.roles[i]).neighbour(t,u),d.add(i);let p=0;s&&(p=Wo(s,c),c[s]=Math.max(0,p),d.size>0&&d.add(s)),v=c.solar;for(const e of ko)_[e]+=(e===s?p:c[e])*i,d.has(e)&&(w[e]+=t.end-t.start);if(l){const e=ao(c.solar,c.import,c.export,c.discharge,c.charge,c.house);for(const[t,o]of Object.entries(e))y[t]=(y[t]??0)+o*i}}const x={};for(const e of ko){const t=e===s?l:a.includes(e);x[e]=t?{wh:_[e],filledShare:g>0?w[e]/g:0}:null}const k={};for(const t of e.consumers)k[t]=Fo(o(t),f,m,u);const $=n?Object.fromEntries(n.map(({id:e,s:t})=>{const o=b.get(e);if(!o)return[e,null];const i={wh:o.wh,filledShare:o.counted>0?o.filledMs/o.counted:0};return t.first>m&&(i.since=t.first),[e,i]})):void 0;return{from:m,to:u,lateStart:m>e.from,main:x,consumers:k,sources:$,flows:y}}function Fo(e,t,o,i){if(!e.exists)return null;let s=0,n=0,r=0;for(const o of t){if(o.start<e.first)continue;const t=e.at(o),a=t?t.w:e.neighbour(o,i);t&&!t.filled||(n+=o.end-o.start),s+=a*(o.end-o.start)/vo,r+=o.end-o.start}const a={wh:s,filledShare:r>0?n/r:0};return e.first>o&&(a.since=e.first),a}const Ro=36e5,Lo=24*Ro,qo="#positive",Do="#negative",To="#pv-sum";function Oo(e){const t={},o=new Set,i=new Map,s=(e,i)=>{"single"===i.kind&&(t[e]=i.entity,i.invert&&o.add(i.entity))},{solar:n,grid:r,battery:a,house:l}=e.sources;if(s("solar",n),"sum"===n.kind){t.solar=To;for(const t of e.solarSources)t.invert&&o.add(t.entity)}s("house",l);const c=(e,s,n)=>{if("split"===n.kind)t[e]=n.positive,t[s]=n.negative;else if("single"===n.kind){const r={positive:n.entity+qo,negative:n.entity+Do};i.set(n.entity,r),t[e]=r.positive,t[s]=r.negative,n.invert&&o.add(n.entity)}};return c("import","export",r),c("discharge","charge",a),{roles:t,inverted:o,signed:i}}function Io(e,t){const o=Object.values(e.roles).filter(e=>e!==To).map(e=>e.endsWith(qo)||e.endsWith(Do)?e.slice(0,e.lastIndexOf("#")):e),i="sum"===t.sources.solar.kind?t.solarSources.map(e=>e.entity):[];return[...new Set([...o,...i,...t.consumers.map(e=>e.entity)])]}function Bo(e){return[...Io(Oo(e),{...e,consumers:[]})].sort()}const Ho=new Map;function Vo(e,t){const o={...e};for(const[i,s]of t){const t=e[i];t&&(o[s.positive]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(e.mean,0)})),o[s.negative]=t.map(e=>({start:e.start,mean:null===e.mean?null:Math.max(-e.mean,0)})))}return o}function jo(e,t,o){const i={};if(!e||"object"!=typeof e)return i;const s=e;for(const e of t){const t=s[e];if(!Array.isArray(t))continue;const n=o.has(e)?-1:1;i[e]=t.flatMap(e=>{const t=e,o="number"==typeof t.start?t.start:Date.parse(String(t.start)),i="number"==typeof t.mean?n*t.mean:null;return Number.isFinite(o)?[{start:o,mean:i}]:[]})}return i}async function Ko(e,t,o,i,s,n){let r;const a=new Promise((e,o)=>{r=setTimeout(()=>o(new Error(`EnerLens: statistics (${t}) did not answer within ${s} ms`)),s)});try{return await Promise.race([e.callWS({type:"recorder/statistics_during_period",start_time:new Date(o).toISOString(),...void 0!==n?{end_time:new Date(n).toISOString()}:{},statistic_ids:i,period:t,types:["mean"],units:{power:"W"}}),a])}finally{void 0!==r&&clearTimeout(r)}}function Uo(e,t){return function(e){return void 0!==Eo[e]}(e)?0:t}function Zo(e){const t=e.locale?.first_weekday,o=t?["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(t):-1;if(o>=0)return o;try{const t=new Intl.Locale(e.locale?.language??e.language??"en"),o=(t.getWeekInfo?.()??t.weekInfo)?.firstDay;if(o)return o%7}catch{}return 1}function Qo(e){const t=Intl.DateTimeFormat().resolvedOptions().timeZone;return"local"===e.locale?.time_zone?t:e.config?.time_zone??t}function Go(e,t){const o={};for(const[i,s]of Object.entries(e)){const e=Math.min(...s.map(e=>e.start));e<t&&(o[i]=e)}return o}async function Yo(e,t,o,i=Date.now(),s=1e4){const n=Oo(t),{roles:r,inverted:a,signed:l}=n,c=Io(n,t),d=Co(o,i,Qo(e),Zo(e)),h=Math.floor(i/Ro)*Ro,u=Math.ceil(d/Ro)*Ro,p=d<u&&d<h-Lo,[m,g,f,_]=await Promise.all([Ko(e,"hour",d-Lo,c,s),Ko(e,"5minute",h-Lo,c,s),Ko(e,"day",d-32*Lo,c,s),p?Ko(e,"5minute",d,c,s,u):Promise.resolve({})]),w=jo(g,c,a);for(const[e,t]of Object.entries(jo(_,c,a)))w[e]=[...t,...w[e]??[]];const y=No({from:d,to:i,roles:r,consumers:t.consumers.map(e=>e.entity),hourly:Vo(jo(m,c,a),l),fiveMin:Vo(w,l),pvZeroBelowW:t.flow.minW,since:Go(Vo(jo(f,c,a),l),d-Lo),solarSources:r.solar===To?t.solarSources.map(e=>e.entity):void 0});return function(e,t,o,i,s,n,r=e.from,a=new Map){const l=Math.max((e.to-e.from)/Ro,1/12),c=new Map;for(const[t,s]of Object.entries(o)){const o=e.main[t]?.wh;c.set(s,void 0===o?null:i.has(s)?-o:o)}for(const[t,o]of Object.entries(e.consumers))c.set(t,o?.wh??null);for(const[t,o]of Object.entries(e.sources??{})){const e=o?.wh;c.set(t,void 0===e?null:i.has(t)?-e:e)}for(const[e,t]of a){const o=c.get(t.positive),s=c.get(t.negative),n=null==o||null==s?null:o-s;c.set(e,null===n?null:i.has(e)?-n:n)}const d=e=>{const t=(o=e)<=.02?0:o<=.1?1:2;var o;return{tier:t,note:t>0?qe("energy.filled",s,{percent:Jo(e,s)}):""}},h={};for(const t of Object.keys(e.main)){const o=e.main[t];h[t]=o?d(o.filledShare):{tier:0,note:""}}const u={};let p=h.house?.tier??0;for(const[t,o]of Object.entries(e.consumers)){let e;e=o?void 0!==o.since?{tier:2,note:qe("energy.since",s,{date:Xo(o.since,s)})}:d(o.filledShare):{tier:2,note:qe("energy.none",s)},u[t]=e,p=Math.max(p,e.tier),e.tier}if(e.sources){let t={tier:0,note:""};for(const[o,i]of Object.entries(e.sources)){let e;e=i?void 0!==i.since?{tier:2,note:qe("energy.since",s,{date:Xo(i.since,s)})}:d(i.filledShare):{tier:2,note:qe("energy.none",s)},u[o]=e,e.tier>t.tier&&(t=e)}h.solar=t}const m={tier:p,note:p>0?qe("energy.rest",s):""},g=!0===o.discharge?.endsWith(qo),f={},_=Object.keys(o).every(t=>null!==e.main[t]);if(o.import?.endsWith(qo)&&_){const t=t=>Math.max(0,(e.main[t]?.wh??0)/l),o=t("import")-t("export");Object.assign(f,ao(t("solar"),Math.max(o,0),Math.max(-o,0),g?0:t("discharge"),g?0:t("charge"),t("house")))}else if(!o.import?.endsWith(qo))for(const[t,o]of Object.entries(e.flows))g&&t.includes("battery")||(f[t]=o/l);return{period:t,from:e.from,to:e.to,lateStart:e.lateStart,hours:l,meanW:e=>{const t=c.get(e);return null==t?null:t/l},flowsW:f,marks:{roles:h,consumers:u,rest:m},fetchedAt:n,start:r}}(y,o,r,a,e,i,Uo(o,d),l)}function Jo(e,t){return new Intl.NumberFormat(t.locale?.language??t.language,{style:"percent",maximumFractionDigits:0}).format(Math.max(e,.01))}function Xo(e,t,o=!1){return new Intl.DateTimeFormat(t.locale?.language??t.language,{timeZone:Qo(t),day:"numeric",month:"numeric",...o?{hour:"2-digit",minute:"2-digit"}:{}}).format(e)}function ei(e,t,o,i="kW"){if(!e)return"W"===i?"Watt":"kW";const s=qe(`energy.${e}`,o);return t?.lateStart&&t.period===e?qe("energy.from",o,{period:s,date:Xo(t.from,o,"today"===e||"24h"===e)}):s}const ti=Object.freeze({mW:.001,W:1,kW:1e3,MW:1e6,GW:1e9,TW:1e12}),oi={solar:{kind:"absent"},grid:{kind:"absent"},battery:{kind:"absent"},house:{kind:"absent"}},ii=new Set;function si(e,t){ii.has(e)||(ii.add(e),console.warn(`[enerlens-card] ${t}`))}function ni(e){if("string"!=typeof e||""===e.trim())return null;const t=Number(e);return Number.isFinite(t)?t:null}function ri(e,t){const o=e?.states?.[t];if(!o)return null;const i=ni(o.state);if(null===i)return null;const s=o.attributes?.unit_of_measurement;if("string"==typeof s&&""!==s){const e=ti[s];return"number"==typeof e?i*e:(si(`${t}|unit`,`${t}: unknown power unit "${s}", value ignored`),null)}return"power"===o.attributes?.device_class?(si(`${t}|assume-w`,`${t}: no unit_of_measurement, assuming W`),i):(si(`${t}|no-unit`,`${t}: neither unit_of_measurement nor device_class "power", value ignored`),null)}function ai(e){const t=Math.max(0,e),o=Math.max(0,-e);return{positive:t,negative:o,net:t-o}}function li(e,t){if("single"===e.kind){const o=t(e.entity);return null===o?null:ai(e.invert?-o:o)}if("split"===e.kind){const o=t(e.positive),i=t(e.negative);if(null===o||null===i)return null;const s=Math.max(0,o),n=Math.max(0,i);return{positive:s,negative:n,net:s-n}}return null}function ci(e){return"single"===e.kind?{positive:e.entity,negative:e.entity}:"split"===e.kind?{positive:e.positive,negative:e.negative}:{}}function di(e,t,o){return null===e?{available:!1,entity:t,derived:o}:{available:!0,w:e,entity:t,derived:o}}function hi(e,t,o){return null===e?{available:!1,entityPositive:t.positive,entityNegative:t.negative,derived:o}:{available:!0,positive:e.positive,negative:e.negative,net:e.net,entityPositive:t.positive,entityNegative:t.negative,derived:o}}function ui(e,t){if(!t)return{available:!1,derived:!1};const o=e?.states?.[t];return di(o?ni(o.state):null,t,!1)}function pi(e,t,o,i){return mi(e,t,t=>ri(e,t),o,i)}function mi(e,t,o,i,s){const n=e=>{try{const t=o(e);return"number"==typeof t&&Number.isFinite(t)?t:null}catch{return null}},r=t?.sources??oi,{solar:a,grid:l,battery:c,house:d}=r,h="derived"===d.kind||"absent"===d.kind,u="absent"===c.kind,p=(t?.solarSources??[]).map(t=>{const o=n(t.entity);return{key:t.key,entity:t.entity,name:t.name??e?.states?.[t.entity]?.attributes?.friendly_name??t.entity,color:t.color,icon:t.icon,kwp:t.kwp,excluded:t.excluded,reading:di(null===o?null:t.invert?-o:o,t.entity,!1)}}),m="sum"===a.kind?function(e,t,o){const i=t?.flow?.minW??0;let s=0,n=!1;const r=[];for(const t of e){if(t.reading.available){s+=t.reading.w,n=!0;continue}const e=o?.get(t.entity);void 0!==e&&(e>=i?r.push(t.name):n=!0)}return n?{value:ai(s),missing:r.length>0?r:void 0}:{value:null}}(p,t,s):void 0,g=m?.missing,f=m?m.value:li(a,n),_=li(l,n),w=u?null:li(c,n),y=h?null:li(d,n),v=h?[]:p.filter(e=>e.excluded),b=v.length>0,x=y&&b?ai(y.net+v.reduce((e,t)=>e+(t.reading.available?t.reading.w:0),0)):y,k=f?.net??null,$=_?.net??null,S=x?.net??null,A=u?0:w?.net??null,M=(e,t,o,i)=>null===e||null===t||null===o?null:i(e,t,o),E=h?M(k,$,A,(e,t,o)=>Math.max(0,e+t+o)):null,C="derived"===a.kind?M(S,$,A,(e,t,o)=>Math.max(0,e-t-o)):null,z="derived"===l.kind?M(S,k,A,(e,t,o)=>e-t-o):null,P="derived"===c.kind?M(S,k,$,(e,t,o)=>e-t-o):null,W=e=>g?{...e,missing:g}:e,N="derived"===a.kind?di(C,void 0,!0):W(di(f?.net??null,ci(a).positive,!1)),F=h?W(di(E,void 0,!0)):di(x?.net??null,ci(d).positive,!1),R=b?{...F,corrected:!0}:F,L="derived"===l.kind?W(hi(null===z?null:ai(z),{},!0)):hi(_,ci(l),!1);let q=null;"derived"===c.kind?q=W(hi(null===P?null:ai(P),{},!0)):u||(q=hi(w,ci(c),!1));const D=(t?.consumers??[]).map(t=>{const o=e?.states?.[t.entity],s=o?.attributes?.friendly_name;return{key:t.key,entity:t.entity,name:t.name??s??t.entity,color:t.color,minW:t.minW,icon:t.icon,reading:di(n(t.entity),t.entity,!1),charge:t.charge&&i?{...i(t.charge),entity:t.charge.soc,show:t.charge.show}:void 0}});return{solar:N,solarSources:p,grid:L,battery:q,soc:ui(e,r.batterySoc),house:R,consumers:D}}const gi={unit:"kW",decimals:2,digits:3},fi=new Set(["cs","de","fi","fr","sk","sv"]);function _i(e){return(e??"").split("-")[0].toLowerCase()}function wi(e,t){const o=e=>Math.max(t-1-Math.floor(Math.log10(e)),0),i=Math.abs(e);if(!(i>0))return Math.max(t-1,0);const s=o(i),n=Number(i.toFixed(s));return n>0?Math.min(s,o(n)):s}function yi(e,t,o=gi){if(void 0!==o.energyHours)return function(e,t){const o=new Intl.NumberFormat(bi(t),{minimumFractionDigits:1,maximumFractionDigits:1,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}),i=e/1e3;return i>0&&i<.05?`< ${o.format(.1)} kWh`:`${o.format(vi(i,1)?0:i)} kWh`}(e*o.energyHours,t);const i="auto"===o.unit?function(e){return Math.round(Math.abs(e))<1e3?"W":"kW"}(e):o.unit,s="W"===i?0:"auto"===o.unit?wi(e/1e3,o.digits):o.decimals,n="W"===i?e:e/1e3;return`${new Intl.NumberFormat(bi(t),{minimumFractionDigits:s,maximumFractionDigits:s,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(vi(n,s)?0:n)} ${i}`}function vi(e,t){return 0===Number(e.toFixed(t))}function bi(e){switch(e?.locale?.number_format){case"comma_decimal":return["en-US","en"];case"decimal_comma":return["de","es","it"];case"space_comma":return["fr","sv","cs"];case"quote_decimal":return["de-CH"];case"none":return"en-US";case"system":return;default:return e?.locale?.language}}function xi(e,t){if(!e)return"—";const o=Number(e.state);if(""===e.state.trim()||!Number.isFinite(o))return"—";if(t?.formatEntityState)return t.formatEntityState(e);const i=t?.entities?.[e.entity_id]?.display_precision,s="number"==typeof i?i:e.state.split(".")[1]?.length??0,n=new Intl.NumberFormat(bi(t),{minimumFractionDigits:s,maximumFractionDigits:s,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(o),r=_i(t?.locale?.language??t?.language);return`${n}${fi.has(r)?" ":""}%`}function ki(e,t){const o=new Intl.NumberFormat(bi(t),{maximumFractionDigits:0}).format(Math.round(e)),i=_i(t?.locale?.language??t?.language);return`${o}${fi.has(i)?" ":""}%`}function $i(e,t,o=Date.now()){const i=new Date(e),s=i.toLocaleTimeString(bi(t),{hour:"2-digit",minute:"2-digit"});if(i.toDateString()===new Date(o).toDateString())return s;return`${i.toLocaleDateString(bi(t),{day:"numeric",month:"numeric"})} ${s}`}const Si=new Set(["monetary","duration","timestamp","date"]);function Ai(e,t){return"°"===e?"":"%"===e?fi.has(_i(t?.locale?.language??t?.language))?" ":"":" "}function Mi(e,t,o){if(!e||"unavailable"===e.state||"unknown"===e.state)return qe("state.unavailable",t);const i=e.attributes.unit_of_measurement,s=Number(e.state),n=(Boolean(i)||Boolean(e.attributes.state_class))&&""!==e.state.trim()&&Number.isFinite(s),r=Si.has(String(e.attributes.device_class??""));if("ha"===o||!n||r)return t?.formatEntityState?t.formatEntityState(e):i?`${e.state}${Ai(i,t)}${i}`:e.state;const a="number"==typeof o?0:Number(o.slice(3)),l="number"==typeof o?o:wi(s,a),c=l>20?wi(0,a):l,d=new Intl.NumberFormat(bi(t),{minimumFractionDigits:c,maximumFractionDigits:c,..."none"===t?.locale?.number_format?{useGrouping:!1}:{}}).format(vi(s,c)?0:s);return i?`${d}${Ai(i,t)}${i}`:d}const Ei=400,Ci=200,zi=200,Pi=56,Wi={solar:{x:Ci,y:58},grid:{x:58,y:zi},house:{x:342,y:zi},battery:{x:Ci,y:342}},Ni={solar_house:"M200,114 C200,168 232,200 286,200",solar_grid:"M200,114 C200,168 168,200 114,200",solar_battery:"M200,114 L200,286",grid_house:"M114,200 L286,200",grid_battery:"M114,200 C168,200 200,232 200,286",battery_grid:"M114,200 C168,200 200,232 200,286",battery_house:"M200,286 C200,232 232,200 286,200"},Fi=["solar_house","solar_grid","solar_battery","grid_house","grid_battery","battery_house"];function Ri(e,t,o){const i=e=>Number(e.toFixed(3)),s=`A${i(o)},${i(o)} 0 1 0`;return`M${i(e-o)},${i(t)}${s} ${i(e+o)},${i(t)}${s} ${i(e-o)},${i(t)}Z`}const Li=e=>e.toFixed(2);function qi(e,t){const o=Math.hypot(t.x-e.x,t.y-e.y)||1;return{x:e.x+(t.x-e.x)/o*Pi,y:e.y+(t.y-e.y)/o*Pi}}function Di(e,t){const o=Math.SQRT1_2,i=e.x-Ci,s=e.y-zi;return{x:Ci+i*o-t*s*o,y:zi+t*i*o+s*o}}function Ti(e,t){return e.replace(/(-?[\d.]+),(-?[\d.]+)/g,(e,o,i)=>{const s=Di({x:Number(o),y:Number(i)},t);return`${Li(s.x)},${Li(s.y)}`})}const Oi=new Map;function Ii(e,t,o){const i=`${e}|${t}|${o}`,s=Oi.get(i);if(s)return s;let n={...Wi},r=400;if("square_right"===e||"square_left"===e){const t="square_right"===e?1:-1;n={solar:Di(Wi.solar,t),grid:Di(Wi.grid,t),house:Di(Wi.house,t),battery:Di(Wi.battery,t)}}else"triangle"===e&&(r=o?560:350,n={solar:{x:305,y:70},house:{x:305,y:280},battery:{x:305,y:490},grid:{x:95,y:280}});const a=(e,t)=>function(e,t){const o=qi(e,t),i=qi(t,e);return`M${Li(o.x)},${Li(o.y)} L${Li(i.x)},${Li(i.y)}`}(n[e],n[t]);let l;if("cross"===e&&"curved"===t)l={...Ni};else if("square_right"!==e&&"square_left"!==e||"curved"!==t){const o="triangle"===e&&"curved"===t?Hi(n,"grid","battery"):a("grid","battery");l={solar_house:a("solar","house"),solar_grid:"triangle"===e&&"curved"===t?Hi(n,"solar","grid"):a("solar","grid"),solar_battery:"triangle"===e?Bi(n):a("solar","battery"),grid_house:a("grid","house"),grid_battery:o,battery_grid:o,battery_house:a("battery","house")}}else{const t="square_right"===e?1:-1;l=Object.fromEntries(Object.entries(Ni).map(([e,o])=>[e,Ti(o,t)]))}const c=r/2,d=Object.fromEntries(Object.keys(n).map(t=>[t,"triangle"===e?"solar"===t:n[t].y<c-1])),h={layout:e,viewW:Ei,viewH:r,nodePos:n,paths:l,labelAbove:d};return Oi.set(i,h),h}function Bi(e){const t={x:e.solar.x-33.6,y:e.solar.y+.8*Pi},o={x:e.battery.x-33.6,y:e.battery.y-.8*Pi},i=e.house.x-128;return`M${Li(t.x)},${Li(t.y)} C${Li(i)},${Li(t.y+70)} ${Li(i)},${Li(o.y-70)} ${Li(o.x)},${Li(o.y)}`}function Hi(e,t,o){const i=e[t],s=e[o],n=e.house,r=(i.x+s.x)/2,a=(i.y+s.y)/2,l=Math.hypot(r-n.x,a-n.y)||1,c={x:r+(r-n.x)/l*90,y:a+(a-n.y)/l*90},d=qi(i,c),h=qi(s,c);return`M${Li(d.x)},${Li(d.y)} Q${Li(c.x)},${Li(c.y)} ${Li(h.x)},${Li(h.y)}`}function Vi(e,t){return`M${-e.viewW},${-e.viewH}H${2*e.viewW}V${2*e.viewH}H${-e.viewW}Z`+Object.values(e.nodePos).map(({x:e,y:o})=>Ri(e,o,t)).join("")}const ji=2,Ki=e=>(...t)=>({_$litDirective$:e,values:t});let Ui=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,o){this._$Ct=e,this._$AM=t,this._$Ci=o}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Zi}=re,Qi=e=>e,Gi=()=>document.createComment(""),Yi=(e,t,o)=>{const i=e._$AA.parentNode,s=void 0===t?e._$AB:t._$AA;if(void 0===o){const t=i.insertBefore(Gi(),s),n=i.insertBefore(Gi(),s);o=new Zi(t,n,e,e.options)}else{const t=o._$AB.nextSibling,n=o._$AM,r=n!==e;if(r){let t;o._$AQ?.(e),o._$AM=e,void 0!==o._$AP&&(t=e._$AU)!==n._$AU&&o._$AP(t)}if(t!==s||r){let e=o._$AA;for(;e!==t;){const t=Qi(e).nextSibling;Qi(i).insertBefore(e,s),e=t}}}return o},Ji=(e,t,o=e)=>(e._$AI(t,o),e),Xi={},es=(e,t=Xi)=>e._$AH=t,ts=e=>{e._$AR(),e._$AA.remove()},os=(e,t,o)=>{const i=new Map;for(let s=t;s<=o;s++)i.set(e[s],s);return i},is=Ki(class extends Ui{constructor(e){if(super(e),e.type!==ji)throw Error("repeat() can only be used in text expressions")}dt(e,t,o){let i;void 0===o?o=t:void 0!==t&&(i=t);const s=[],n=[];let r=0;for(const t of e)s[r]=i?i(t,r):r,n[r]=o(t,r),r++;return{values:n,keys:s}}render(e,t,o){return this.dt(e,t,o).values}update(e,[t,o,i]){const s=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,o,i);if(!Array.isArray(s))return this.ut=r,n;const a=this.ut??=[],l=[];let c,d,h=0,u=s.length-1,p=0,m=n.length-1;for(;h<=u&&p<=m;)if(null===s[h])h++;else if(null===s[u])u--;else if(a[h]===r[p])l[p]=Ji(s[h],n[p]),h++,p++;else if(a[u]===r[m])l[m]=Ji(s[u],n[m]),u--,m--;else if(a[h]===r[m])l[m]=Ji(s[h],n[m]),Yi(e,l[m+1],s[h]),h++,m--;else if(a[u]===r[p])l[p]=Ji(s[u],n[p]),Yi(e,s[h],s[u]),u--,p++;else if(void 0===c&&(c=os(r,p,m),d=os(a,h,u)),c.has(a[h]))if(c.has(a[u])){const t=d.get(r[p]),o=void 0!==t?s[t]:null;if(null===o){const t=Yi(e,s[h]);Ji(t,n[p]),l[p]=t}else l[p]=Ji(o,n[p]),Yi(e,s[h],o),s[t]=null;p++}else ts(s[u]),u--;else ts(s[h]),h++;for(;p<=m;){const t=Yi(e,l[m+1]);Ji(t,n[p]),l[p++]=t}for(;h<=u;){const e=s[h++];null!==e&&ts(e)}return this.ut=r,es(e,l),j}});function ss(e,t,o,i="overtake",s=!1,n="share"){const r=e.filter(e=>e.share>0);if(!t||0===r.length)return K;const{r:a,strokeWidth:l}=function(e){const t=100/Math.max(1,e- -11)*11;return{r:50-t/2,strokeWidth:t}}(o),c=2*Math.PI*a,d="peak"===n,h=d?0:.0085*c,u=.014*c,p=r.length>1?r.length*h:0,m=c-p,g=r.map(e=>e.share*m);let f=0;for(const[e,t]of g.entries())t>0&&t<u&&(f+=u-t,g[e]=u);if(f>0){const e=g.indexOf(Math.max(...g));g[e]=Math.max(u,g[e]-f)}const _=d?g.reduce((e,t,o)=>r[o].isRest?e:e+t,0):0;let w=d?-_/2:0;const y=r.map((e,t)=>{const o={segment:e,index:t,length:g[t],offset:w};return w+=o.length+(r.length>1?h:0),o}),v="fade"===i;return v||y.sort((e,t)=>e.segment.key<t.segment.key?-1:e.segment.key>t.segment.key?1:0),H`<svg class="ring ${v&&s?"fade":""}" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${is(y,e=>v?d&&e.segment.isRest?`fade-${e.segment.key}`:`slot-${e.index}`:e.segment.key,e=>V`<circle
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
  </svg>`}const ns=15.8,rs={now:()=>performance.now(),frame:e=>requestAnimationFrame(()=>e()),cancel:e=>cancelAnimationFrame(e)};class as{constructor(e=("function"==typeof requestAnimationFrame?rs:void 0)){this.clock=e,this.drawn=new WeakMap,this.shownAt=new WeakMap,this.shown=[],this.lane=.8,this.last=0}update(e,t,o){const i=[...e.querySelectorAll("svg.ring circle.ring-seg")].map(e=>({el:e,index:Number(e.dataset.index),len:Number(e.dataset.length),off:Number(e.dataset.offset),circ:Number(e.dataset.circ),gap:Number(e.dataset.gap??0)})).sort((e,t)=>e.index-t.index);this.lane=function(e){const t=e/2,o=(t-5.5-2)/(t+5.5);return Math.min(.85,Math.max(.6,o))}(o);const s=i.filter(e=>this.drawn.has(e.el)),n=[...s].sort((e,t)=>(this.shownAt.get(e.el)??0)-(this.shownAt.get(t.el)??0)),r=new Map(n.map((e,t)=>[e.el,t])),a=new Map(s.map((e,t)=>[e.el,t]));for(const e of i)this.shownAt.set(e.el,e.index);this.shown=i.map(e=>e.el);const l=s.some(e=>this.drawn.get(e.el)?.circ!==e.circ);if(!t||!this.clock||0===s.length||l){for(const e of i)this.drawn.set(e.el,{len:ls(e.len),off:ls(e.off),circ:e.circ,gap:e.gap});return void this.halt()}for(const[e,t]of i.entries()){const o=this.drawn.get(t.el);if(!o){this.drawn.set(t.el,this.born(i,e));continue}o.len.to=t.len,o.off.to=t.off,o.gap=t.gap;const n=r.get(t.el)??0,l=a.get(t.el)??0,c=s.filter(e=>(r.get(e.el)??0)<n&&(a.get(e.el)??0)>l).map(e=>e.el),d=(o.dive?.passing??[]).filter(e=>a.has(e)&&(a.get(e)??0)>l&&!c.includes(e));if(c.length+d.length>0){const e=o.dive?.scale??{x:1,v:-(1-this.lane)*ns,to:this.lane};e.to=this.lane,o.dive={passing:[...c,...d],scale:e}}else o.dive&&(o.dive.passing=[])}this.draw();this.shown.some(e=>{const t=this.drawn.get(e);return!(void 0===t||ds(t.len)&&ds(t.off)&&void 0===t.dive)})&&this.run()}born(e,t){const o=e[t],i=t>0?this.drawn.get(e[t-1].el):void 0;let s,n=!1;for(let o=1;o<e.length&&!s;o++)s=this.drawn.get(e[(t+o)%e.length].el),n=t+o>=e.length;const r=i?i.off.x+i.len.x:0,a=s?(n?o.circ:0)+s.off.x-r:0,l=i?Math.min(o.gap,Math.max(0,a)):0,c=i?i.off.v+i.len.v:0,d=s?s.off.v:c,h=i?.dive?{passing:[...i.dive.passing],scale:{...i.dive.scale}}:void 0;return{len:{x:0,v:d-c,to:o.len},off:{x:r+l,v:c,to:o.off},circ:o.circ,gap:o.gap,dive:h}}stop(){for(const e of this.shown){const t=this.drawn.get(e);t&&cs(t)}this.halt()}halt(){void 0!==this.pending&&this.clock?.cancel(this.pending),this.pending=void 0;for(const e of this.shown){const t=this.drawn.get(e);t&&(t.dive=void 0)}this.draw()}run(){void 0===this.pending&&this.clock&&(this.last=this.clock.now(),this.pending=this.clock.frame(()=>this.frame()))}frame(){if(this.pending=void 0,!this.clock)return;const e=this.clock.now(),t=Math.min(.25,Math.max(0,(e-this.last)/1e3));this.last=e;let o=!1;for(const e of this.shown){const i=this.drawn.get(e);i&&(hs(i.len,t),hs(i.off,t),ds(i.len)&&ds(i.off)||(o=!0))}if(!o)for(const e of this.shown){const t=this.drawn.get(e);t&&Object.assign(t,{len:ls(t.len.to),off:ls(t.off.to)}),t?.dive&&(t.dive.passing=[])}for(const e of this.shown){const i=this.drawn.get(e);i?.dive&&this.dip(e,i,i.dive,t),i?.dive&&(o=!0)}this.draw(),o&&(this.pending=this.clock.frame(()=>this.frame()))}dip(e,t,o,i){const s=t.off.x+t.len.x;o.passing=o.passing.filter(o=>{const i=this.shown.includes(o)?this.drawn.get(o):void 0;return void 0!==i&&o!==e&&s+t.gap/2-.4>i.off.x}),o.scale.to=o.passing.length>0?this.lane:1,hs(o.scale,i,ns),0===o.passing.length&&ds(o.scale,.001,ns)&&(t.dive=void 0)}draw(){for(const e of this.shown){const t=this.drawn.get(e);if(!t)continue;const o=Math.max(0,Math.min(t.circ,t.len.x)),i=`${o.toFixed(2)} ${(t.circ-o).toFixed(2)}`,s=(-t.off.x).toFixed(2),n=t.dive?t.dive.scale.x.toFixed(3):"",r=`${i}|${s}|${n}`;r!==t.written&&(t.written=r,e.setAttribute("stroke-dasharray",i),e.setAttribute("stroke-dashoffset",s),n?e.setAttribute("transform",`translate(50 50) scale(${n}) translate(-50 -50)`):e.removeAttribute("transform"))}}}function ls(e){return{x:e,v:0,to:e}}function cs(e){e.len=ls(e.len.to),e.off=ls(e.off.to),e.dive=void 0}function ds(e,t=.05,o=3.16){return Math.abs(e.x-e.to)<t&&Math.abs(e.v)<t*o}function hs(e,t,o=3.16){const i=e.x-e.to,s=e.v+o*i,n=Math.exp(-o*t);e.x=e.to+(i+s*t)*n,e.v=(e.v-o*s*t)*n}function us(e,t){return e.available?e.net>=t?"positive":e.net<=-t?"negative":"none":"none"}function ps(e,t){if(!e.derived)return"negative"===us(e,t)?e.entityNegative??e.entityPositive:e.entityPositive??e.entityNegative}function ms(e,t){e.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}const gs={solar:"mdi:white-balance-sunny",grid:"mdi:transmission-tower",house:"mdi:home",battery:"mdi:battery"};function fs(e,t){if(t)return t;if(!e.available)return"mdi:battery";const o=10*Math.round(e.w/10);return o<=0?"mdi:battery-outline":o>=100?"mdi:battery":`mdi:battery-${o}`}function _s(e,t,o){if(e&&!t.energy)return qe("node.partial",o,{names:e.join(", ")})}function ws(e){return e&&e.tier>0?`warn${e.tier}`:""}function ys(e,t,o,i){return!e||!e.available||Math.abs(e.net)<i.flow.minW?"var(--el-line)":i.colors[e.net>0?t:o]}function vs(e,t,o){return e.available?yi(e.w,t,o.power):qe("state.unavailable",t)}const bs={normal:400,medium:500,bold:700};function xs(e,t,o){return`color:${t};font-size:calc(var(${o}) * ${e.size/100});font-weight:${bs[e.weight]}`}function ks(e,t,o){const i=e.nodes[t],s=i.label,n=(i.showName?15:0)+(o&&i.showState?15:0)+("derived"===e.sources[t].kind?15:0);return s?n+24+(0===n?8:0):n}function $s(e,t,o,i,s="solar"===e.key){const n=t.nodes[e.key],[r,...a]=e.label.split(" · "),l=n.showState?a.join(" · "):"",c=n.showName||!0===e.outage,d=e.derived?qe(c?"node.derived_suffix":"node.derived_alone",o):"",h=n.label,u=void 0!==t.energy;let p="";if(h){const s=h.prefix??"",n=Mi(o.states[h.entity],o,h.decimals),r=t.extraColors[`${e.key}_label`],a=s?`${s} ${n}`:n;p=H`<button
      class="extra-label extra"
      style=${xs(h,r,"--el-label-size")+(u?";visibility:hidden":"")}
      tabindex=${u?"-1":"0"}
      aria-hidden=${u?"true":"false"}
      title=${a}
      aria-label=${a}
      @click=${i(h.entity)}
    >${s?H`<span class="extra-prefix">${s}</span> `:""}<span class="extra-value"
        >${n}</span
      ></button>`}if(!(c||l||d||h))return"";const m=H`${c?H`<span class="label-name">${r}</span>`:""}${l?H`<span class="label-state">${l}</span>`:""}${d?H`<span class="label-state derived">${d}</span>`:""}`;return H`<div class="label">${s?H`${m}${p}`:H`${p}${m}`}</div>`}function Ss(e,t,o,i=!1){const s=[];s.push({key:"solar",icon:t.icons.solar??gs.solar,color:e.solar.available&&e.solar.w>0?t.colors.solar:"var(--el-line)",label:qe("node.solar",o),derived:e.solar.derived,value:vs(e.solar,o,t),available:e.solar.available,entity:e.solar.derived?void 0:e.solar.entity,partial:_s(e.solar.missing,t,o)});const n=e.grid,r=us(n,t.flow.minW),a=i&&void 0!==t.gridStatus;s.push({key:"grid",icon:t.icons.grid??gs.grid,color:a?"var(--el-error)":ys(n,"grid_import","grid_export",t),label:qe(a||"none"===r?"node.grid":"positive"===r?"node.grid_import":"node.grid_export",o),derived:n.derived,value:a?qe("node.no_grid",o):n.available?yi(Math.abs(n.net),o,t.power):qe("state.unavailable",o),available:a||n.available,outage:a,partial:_s(n.missing,t,o),entity:a?t.gridStatus?.entity:ps(n,t.flow.minW)}),s.push({key:"house",icon:t.icons.house??gs.house,color:t.colors.house,label:qe("node.house",o),derived:e.house.derived||!0===e.house.corrected,value:vs(e.house,o,t),available:e.house.available,entity:e.house.derived?void 0:e.house.entity,partial:_s(e.house.missing,t,o)});const l=e.battery;if(l){const i=us(l,t.flow.minW),n=t.sources.batterySoc,r=n?o.states[n]:void 0;s.push({key:"battery",icon:fs(e.soc,t.icons.battery),color:ys(l,"battery_discharge","battery_charge",t),label:qe("positive"===i?"node.battery_discharging":"negative"===i?"node.battery_charging":"node.battery",o),derived:l.derived,value:l.available?yi(Math.abs(l.net),o,t.power):qe("state.unavailable",o),available:l.available,socValue:e.soc.available?xi(r,o):void 0,socPercent:e.soc.available?Math.max(0,Math.min(100,e.soc.w)):void 0,socFillColor:e.soc.available?Me(e.soc.w,t.colors.socStops,Ee):void 0,entity:ps(l,t.flow.minW),socEntity:n,partial:_s(l.missing,t,o)})}return t.energy&&function(e,t,o,i){const s=o.energy?.roles??{},n=function(e){switch(e){case"square_right":return{import:"↘",export:"↖",discharge:"↗",charge:"↙"};case"square_left":return{import:"↗",export:"↙",discharge:"↖",charge:"↘"};default:return{import:"→",export:"←",discharge:"↑",charge:"↓"}}}(o.layout),r=qe("state.unavailable",i),a=(e,t,n,a,l)=>({arrow:e,color:o.colors[t],text:null===n?r:yi(n,i,o.power),entity:l,mark:s[a]}),l=(e,t,i,s)=>Math.max(e,t)<o.flow.minW?"var(--el-line)":o.colors[e>=t?i:s];for(const r of e){if("solar"===r.key&&(r.mark=s.solar),"house"===r.key&&(r.mark=s.house),"grid"===r.key){const e=t.grid,c=e.available?e.positive:null,d=e.available?e.negative:null;if(r.label=qe("node.grid",i),r.crossed=r.outage,r.outage=!1,r.icon=o.icons.grid??gs.grid,r.color=l(c??0,d??0,"grid_import","grid_export"),"single"===o.sources.grid.kind){const t=e.available?e.net:null,o=(t??0)<0,i=a(o?n.export:n.import,o?"grid_export":"grid_import",null===t?null:Math.abs(t),o?"export":"import",e.entityPositive??e.entityNegative);i.mark=Ms(s.import,s.export),r.figures={lower:i},r.entity=i.entity,r.value=i.text;continue}r.figures={upper:a(n.import,"grid_import",c,"import",e.entityPositive),lower:a(n.export,"grid_export",d,"export",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}if("battery"===r.key&&t.battery){const e=t.battery,s=e.available?e.positive:null,c=e.available?e.negative:null;if(r.label=qe("node.battery",i),r.color=l(s??0,c??0,"battery_discharge","battery_charge"),r.socValue=void 0,r.socPercent=void 0,r.socEntity=void 0,r.icon=o.icons.battery??"mdi:battery","single"===o.sources.battery.kind){r.noFigure=!0,r.value="",r.entity=e.entityPositive??e.entityNegative;continue}r.figures={upper:a(n.discharge,"battery_discharge",s,"discharge",e.entityPositive),lower:a(n.charge,"battery_charge",c,"charge",e.entityNegative)},r.entity=e.entityNegative,r.value=r.figures.lower.text}}}(s,e,t,o),s}const As={"→":{box:"0 0 18 12",d:"M1.5 6 H16 M12 2.2 L16 6 L12 9.8",shape:"wide"},"←":{box:"0 0 18 12",d:"M16.5 6 H2 M6 2.2 L2 6 L6 9.8",shape:"wide"},"↓":{box:"0 0 12 18",d:"M6 1.5 V16 M2.2 12 L6 16 L9.8 12",shape:"tall"},"↑":{box:"0 0 12 18",d:"M6 16.5 V2 M2.2 6 L6 2 L9.8 6",shape:"tall"},"↘":{box:"0 0 16 16",d:"M2 2 L14 14 M14 7.5 V14 H7.5",shape:"square"},"↖":{box:"0 0 16 16",d:"M14 14 L2 2 M2 8.5 V2 H8.5",shape:"square"},"↗":{box:"0 0 16 16",d:"M2 14 L14 2 M7.5 2 H14 V8.5",shape:"square"},"↙":{box:"0 0 16 16",d:"M14 2 L2 14 M2 7.5 V14 H8.5",shape:"square"}};function Ms(e,t){return e?t&&t.tier>e.tier?t:e:t}function Es(e){const t=As[e.arrow]??As["→"];return H`<div class="value figure ${ws(e.mark)}" title=${e.mark?.note??""}>
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
  </div>`}function Cs(e,t,o,i){return t.nodes[e.key].inside?.position!==i||e.figures?"":function(e,t,o){const i=t.nodes[e.key].inside;if(!i)return H``;const s=t.extraColors[`${e.key}_inside`];return H`<div class="extra-inside extra" style=${xs(i,s,"--el-value-size")}>${Mi(o.states[i.entity],o,i.decimals)}</div>`}(e,t,o)}const zs=new Set(["solar_battery","grid_battery","battery_house","battery_grid"]);function Ps(e,t,o,i,s=[],n=123,r=!1,a=!1,l=56,c=!1,d){const h=Ss(e,t,o,r),u=Ii(t.layout,t.flow.lines,null!==e.battery),p=e.battery?Fi:Fi.filter(e=>!zs.has(e)),m=[..."hide"===t.flow.inactiveLines?p.filter(e=>i.has(e)):p].sort((e,t)=>Number(i.has(e))-Number(i.has(t)));return H`
    <div class="cross ${null===e.battery?"no-battery":""}">
      <div class="plot">
        <svg viewBox="0 0 ${u.viewW} ${u.viewH}" aria-hidden="true">
          ${c?V`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${Vi(u,l)}></path>
            </clipPath>
          </defs>`:K}
          <g clip-path=${c?"url(#el-holes)":K}>
          ${m.map(e=>V`<path
                class="link ${i.has(e)?"active":`inactive-${t.flow.inactiveLines}`}"
                style=${i.has(e)?`stroke:${i.get(e)}`:""}
                d=${u.paths[e]}
              ></path>`)}
            <g class="dots"></g>
          </g>
        </svg>
        ${h.map(e=>{const i=function(e,t){const o=e.nodePos[t];return{left:100*o.x/e.viewW+"%",top:100*o.y/e.viewH+"%"}}(u,e.key),r=u.labelAbove[e.key],l=e=>t=>{e&&ms(t.currentTarget,e)},c=("house"===e.key?s:"solar"===e.key?d?.segments??[]:[]).some(e=>e.share>0);return H`
          <div
            class="node ${e.key} ${c?"has-ring":""} ${r?"label-above":""} ${"triangle"===u.layout&&"house"===e.key?"label-ground":""} ${e.outage?"outage":""} ${t.energy?"in-period":""}"
            style="left:${i.left};top:${i.top};border-color:${c?"transparent":e.color}"
          >
            ${"house"===e.key?ss(s,s.length>0,n,t.ring.animation,a):""}
            ${"solar"===e.key&&d?ss(d.segments,!0,n,t.ring.animation,a,d.layout):""}
            ${void 0!==e.socPercent?H`<div class="fill-clip">
                    <div
                      class="fill"
                      style="height:${e.socPercent}%;background:${e.socFillColor}"
                    ></div>
                  </div>`:""}
            ${e.socValue?H`<div class="value">${e.socValue}</div>`:""}
            ${e.figures?.upper?Es(e.figures.upper):""}
            ${Cs(e,t,o,"above")}
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
            ${e.noFigure?"":e.figures?Es(e.figures.lower):H`<div
                    class="value ${e.available?"":"unavailable"} ${ws(e.mark)} ${e.partial?"warn2":""}"
                    title=${e.partial??e.mark?.note??""}
                  >${e.value}</div>`}
            ${Cs(e,t,o,"below")}
            ${r?$s(e,t,o,l,r):""}
            ${function(e,t,o,i,s="solar"===e.key){const n=t.nodes[e.key],r=n.label?"-2px":"-22px",a=s?r:"-22px",l=s?"-22px":r,c="above"!==n.inside?.position||t.energy?void 0:n.inside,d=e.figures?.upper?.entity?{entity:e.figures.upper.entity,text:e.figures.upper.text}:e.socEntity?{entity:e.socEntity,text:e.socValue??""}:c?{entity:c.entity,text:Mi(o.states[c.entity],o,c.decimals)}:void 0;if(d){const t="height:max(44px, calc(50% + 2px))";return H`
      <button
        class="hit upper"
        style=${c&&n.label?`top:${a};bottom:auto;${t};z-index:3`:`top:${a}`}
        aria-label=${`${e.label} ${d.text}`}
        @click=${i(d.entity)}
      ></button>
      <button
        class="hit lower"
        style=${!s&&n.label?`top:auto;bottom:${l};${t}`:`bottom:${l}`}
        aria-label=${e.value?`${e.label} ${e.value}`:e.label}
        @click=${i(e.entity)}
        ?disabled=${!e.entity}
      ></button>
    `}return e.entity?H`<button
    class="hit"
    style="top:${a};bottom:${l}"
    aria-label=${e.value?`${e.label} ${e.value}`:e.label}
    @click=${i(e.entity)}
  ></button>`:""}(e,t,o,l,r)}
            ${r?"":$s(e,t,o,l,r)}
          </div>
          `})}
      </div>
    </div>
  `}function Ws(e,t){const o=function(e){const t=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(t){const e=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1],o=Number.parseInt(e,16);return[o>>16&255,o>>8&255,255&o]}const o=e.match(/^rgba?\(([^)]+)\)/i);if(!o)return;const i=o[1].split(/[,\s/]+/).map(Number);return i.length<3||i.slice(0,3).some(e=>!Number.isFinite(e))?void 0:[i[0],i[1],i[2]]}(e);if(!o)return e;return`rgb(${o.map(e=>Math.round(e+(255-e)*t)).join(",")})`}function Ns(e){const t=e.dot/2,o=[{r:t,colour:e.colour,opacity:1,forward:0}],i=Math.floor(e.caps);if(i<=0||e.core<=0||e.coreLight<=0)return o;const s=1-.15**(1/i);for(let n=1;n<=i;n++){const r=n/i,a=1-r*(1-e.core);o.push({r:t*a,colour:Ws(e.mixFrom??e.colour,e.coreLight*r),opacity:s,forward:e.bias*t*(1-a)})}return o}const Fs=[3,8],Rs=[[0,.55],[.3,.42],[.62,.12],[1,0]];function Ls(e,t,o,i){if(1!==e||t<=0)return"";const s=t/60;return Fs.map(e=>`drop-shadow(0 0 ${(e*s*i).toFixed(1)}px ${o})`).join(" ")}function qs(e){const t=e/60;return Rs.map(([e,o])=>[e,Math.min(o*t,1)])}function Ds(e){const t=e.match(/rgba?\(([^)]+)\)/i);if(!t)return;const o=t[1].split(/[,\s/]+/).map(Number);if(o.length<3||o.slice(0,3).some(e=>!Number.isFinite(e)))return;if(o.length>=4&&Number.isFinite(o[3])&&o[3]<.1)return;const[i,s,n]=o;return(.2126*i+.7152*s+.0722*n)/255}function Ts(e,t){return"dark"===t||"light"!==t&&function(e){if("function"!=typeof getComputedStyle)return!0;const t=getComputedStyle(e),o=Ds(t.backgroundColor);if(void 0!==o)return o<.5;const i=Ds(t.color);return void 0===i||i>.5}(e)}function Os(e,t){if("function"!=typeof getComputedStyle||"undefined"==typeof document)return t;const o=document.createElement("span");if(o.style.display="none",o.style.color=t,""===o.style.color)return t;e.appendChild(o);const i=getComputedStyle(o).color;return o.remove(),i&&!i.includes("var(")?i:void 0}const Is="http://www.w3.org/2000/svg",Bs=400;function Hs(e,t){return 1===t?e:e.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi,e=>String(Number((Number(e)/t).toFixed(2))))}const Vs="http://www.w3.org/2000/svg",js=5e3;class Ks{constructor(e,t){this.container=e,this.technique=t,this.links=new Map,this.paused=!1,this.scale=1,this.dark=!0,this.pathZoom=1,this.dotScale=1,this.paths=Ni}setScale(e){!Number.isFinite(e)||e<=0||e===this.scale||(this.scale=e,this.repaint())}setDotScale(e){!Number.isFinite(e)||e<=0||e===this.dotScale||(this.dotScale=e,this.repaint())}setPaths(e){if(e!==this.paths){this.paths=e;for(const[e,t]of this.links)for(const o of t.dots)o.el.style.offsetPath=this.offsetPath(e)}}setPathZoom(e){if(e!==this.pathZoom){this.pathZoom=e;for(const[e,t]of this.links)for(const o of t.dots)o.el.style.offsetPath=this.offsetPath(e)}}setDesign(e,t){e===this.design&&t===this.dark||(this.design=e,this.dark=t,this.repaint())}update(e,t,o){const i=new Set;for(const s of e){i.add(s.connection);const e=this.links.get(s.connection)??this.createLink(s),n=t.flow.dotColor??t.colors[s.colorKey],r=e.colour!==n;e.colour=n,r&&(e.mixFrom="");const a=e.mixFrom?void 0:Os(this.container,n);a&&(e.mixFrom=a);const l=r||void 0!==a,c=this.phaseOf(e.dots[0]);for(;e.dots.length>s.count;){const t=e.dots.pop();t?.animation?.cancel(),t?.el.remove()}for(;e.dots.length<s.count;)e.dots.push(this.createDot(e,s,e.dots.length,s.count,o,c));const d=5/Math.max(s.durationS,.01);for(const[t,i]of e.dots.entries())l&&this.paint(e,i),this.canAnimate(i,o)?(i.animation?i.animation.playbackRate=d:i.animation=this.startAnimation(e,i,t,s.count,c),this.setPhase(i.animation,t,s.count,c)):(i.animation?.cancel(),i.animation=void 0,i.el.style.offsetDistance=100*t/s.count+"%");l&&this.applyGlow(e),e.durationS=s.durationS,e.colorKey=s.colorKey,e.count=s.count}for(const[e,t]of this.links)if(!i.has(e)){for(const e of t.dots)e.animation?.cancel(),e.el.remove();t.group.remove(),this.links.delete(e)}}pause(){if(!this.paused){this.paused=!0;for(const e of this.links.values())for(const t of e.dots)t.animation?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.links.values())for(const t of e.dots)t.animation?.play()}}destroy(){for(const e of this.links.values()){for(const t of e.dots)t.animation?.cancel(),t.el.remove();e.group.remove()}this.links.clear(),this.defs?.remove(),this.defs=void 0}ground(){if(this.design)return this.dark?this.design.dark:this.design.light}repaint(){for(const e of this.links.values()){for(const t of e.dots)this.paint(e,t);this.applyGlow(e)}}createLink(e){const t=document.createElementNS(Vs,"g");this.container.appendChild(t);const o={group:t,dots:[],durationS:e.durationS,colorKey:e.colorKey,colour:"",mixFrom:"",count:0};return this.links.set(e.connection,o),o}canAnimate(e,t){return"waapi"===this.technique&&t&&"function"==typeof e.el.animate}offsetPath(e){return`path("${Hs(this.paths[e],this.pathZoom)}")`}phaseOf(e){const t=e?.animation?.currentTime;return"number"!=typeof t?0:(t%js+js)%js/js}setPhase(e,t,o,i){e.currentTime=(i+t/o)%1*js}createDot(e,t,o,i,s,n=0){const r=document.createElementNS(Vs,"g");r.setAttribute("class","dot"),r.style.offsetPath=this.offsetPath(t.connection),r.style.offsetRotate="auto",r.style.offsetDistance=(n+o/i)%1*100+"%",e.group.appendChild(r);const a={el:r};return this.paint(e,a),this.canAnimate(a,s)&&(a.animation=this.startAnimation(e,a,o,i,n)),a}startAnimation(e,t,o,i,s=0){const n=t.el.animate([{offsetDistance:"0%"},{offsetDistance:"100%"}],{duration:js,iterations:Number.POSITIVE_INFINITY,easing:"linear"});return n.playbackRate=5/Math.max(e.durationS,.01),this.setPhase(n,o,i,s),this.paused&&n.pause(),n}paint(e,t){for(;t.el.firstChild;)t.el.removeChild(t.el.firstChild);const o=this.ground(),i=e.colour,s=(o?.dot??10)/2/this.scale*this.dotScale;if(o&&2===o.glow&&o.glowStrength>0){const e=document.createElementNS(Vs,"circle");e.setAttribute("r",(3.4*s).toFixed(2)),e.setAttribute("fill",`url(#${this.haloGradient(i,o)})`),t.el.appendChild(e)}for(const n of Ns({dot:2*s,caps:this.design?.shape.caps??0,core:(o?.core??0)/100,coreLight:(o?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:i,mixFrom:e.mixFrom||i})){const e=document.createElementNS(Vs,"circle");e.setAttribute("cx",n.forward.toFixed(2)),e.setAttribute("r",n.r.toFixed(2)),e.setAttribute("fill",n.colour),n.opacity<1&&e.setAttribute("fill-opacity",n.opacity.toFixed(3)),t.el.appendChild(e)}}applyGlow(e){const t=this.ground();e.group.style.filter=t?Ls(t.glow,t.glowStrength,e.colour,this.dotScale/this.scale):""}haloGradient(e,t){const o=`el-halo-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Vs,"defs"),this.container.appendChild(this.defs)),!this.defs.querySelector(`#${CSS.escape(o)}`)){const i=document.createElementNS(Vs,"radialGradient");i.setAttribute("id",o);for(const[o,s]of qs(t.glowStrength)){const t=document.createElementNS(Vs,"stop");t.setAttribute("offset",String(o)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(s)),i.appendChild(t)}this.defs.appendChild(i)}return o}}const Us="http://www.w3.org/2000/svg",Zs=5e3;let Qs=0;class Gs{constructor(e){this.svg=e,this.lines=new Map,this.holeId="el-fan-hole-"+ ++Qs,this.reverse=!1,this.paused=!1,this.dotRadius=5,this.dark=!0,this.pathZoom=1,this.dotScale=1}setDesign(e,t){if(e!==this.design||t!==this.dark){this.design=e,this.dark=t;for(const e of this.lines.values())e.paintKey=void 0}}setDotColor(e){if(e!==this.dotColor){this.dotColor=e;for(const e of this.lines.values())e.paintKey=void 0}}setPathZoom(e){this.pathZoom=e}ground(){return this.dark?this.design?.dark:this.design?.light}update(e,t,o,i,s){this.svg.setAttribute("viewBox",`0 0 ${o.width} ${o.height}`),this.svg.setAttribute("width",String(o.width)),this.svg.setAttribute("height",String(o.height));const n=this.holeClip(s,o),r=n!==this.clip;this.clip=n;const a=new Set;for(const o of e){a.add(o.key);const e=this.route?this.route(t,o):this.pathFor(t,o),s=!this.lines.has(o.key),l=this.lines.get(o.key)??this.createLine(o.key);if(l.path.setAttribute("d",e),r||s)for(const e of[l.path,l.group])n?e.setAttribute("clip-path",n):e.removeAttribute("clip-path");l.path.setAttribute("class","fan-line"+(o.inactive?` inactive-${o.inactive}`:"")),l.path.style.stroke=o.inactive?"":o.color;const c=o.inactive?void 0:this.ground(),d=o.fade??1;for(l.path.style.opacity=c?String(c.line/100*d):"",l.path.style.setProperty("--el-fade",String(d)),l.group.style.opacity=d<1?String(d):"";l.dots.length>o.count;)l.dots.pop()?.remove(),l.animations.pop()?.cancel();for(;l.dots.length<o.count;)l.dots.push(this.createDot(l,o.key));const h=this.dotColor??o.color,u=[h,this.dotRadius,this.dotScale,c?this.design?.id:"",this.dark].join("|"),p=l.paintKey!==u;l.paintKey=u,p&&(l.mixFrom=void 0);const m=void 0===l.mixFrom?Os(this.svg,h):void 0;m&&(l.mixFrom=m);const g=p||void 0!==m,f=l.mixFrom??h;g&&this.applyGlow(l,h,c);const _=l.count!==o.count,w=Hs(e,this.pathZoom),y=5/Math.max(o.durationS,.01);for(const[e,t]of l.dots.entries()){if(!g&&t.firstChild||this.paintDot(t,h,c,f),t.style.offsetPath=`path("${w}")`,t.style.offsetRotate="auto",!i||"function"!=typeof t.animate){l.animations[e]?.cancel(),l.animations[e]=void 0,t.style.offsetDistance=100*e/o.count+"%";continue}let s=l.animations[e];if(!s){const o=[{offsetDistance:"0%"},{offsetDistance:"100%"}];s=t.animate(this.reverse?o.reverse():o,{duration:Zs,iterations:Number.POSITIVE_INFINITY,easing:"linear"}),l.animations[e]=s,this.paused&&s.pause()}s.playbackRate=y,!_&&l.animations[e]||(s.currentTime=Zs*e/o.count)}l.count=o.count}for(const[e,t]of this.lines)if(!a.has(e)){for(const e of t.animations)e?.cancel();for(const e of t.dots)e.remove();t.group.remove(),t.path.remove(),this.lines.delete(e)}}pathFor(e,t){const o=t.x-e.x,i=Math.min(160,Math.max(40,.6*o)),s=e.x+Math.min(i,o),n=i/2,r=e=>e.toFixed(1);return`M${r(e.x)},${r(e.y)} C${r(e.x+n)},${r(e.y)} ${r(s-n)},${r(t.y)} ${r(s)},${r(t.y)} L${r(t.x)},${r(t.y)}`}createLine(e){const t=document.createElementNS(Us,"path");t.setAttribute("class","fan-line"),t.setAttribute("fill","none"),t.dataset.key=e,this.svg.appendChild(t);const o=document.createElementNS(Us,"g");this.svg.appendChild(o);const i={path:t,group:o,dots:[],animations:[],count:0};return this.lines.set(e,i),i}holeClip(e,t){if(!(e&&e.r>0))return;this.defs||(this.defs=document.createElementNS(Us,"defs"),this.svg.appendChild(this.defs));let o=this.defs.querySelector(`#${this.holeId} path`);if(!o){const e=document.createElementNS(Us,"clipPath");e.setAttribute("id",this.holeId),e.setAttribute("clipPathUnits","userSpaceOnUse"),o=document.createElementNS(Us,"path"),o.setAttribute("clip-rule","evenodd"),e.appendChild(o),this.defs.appendChild(e)}const{width:i,height:s}=t,n=`M${-i},${-s}H${2*i}V${2*s}H${-i}Z${Ri(e.x,e.y,e.r)}`;return o.getAttribute("d")!==n&&o.setAttribute("d",n),`url(#${this.holeId})`}haloGradient(e,t){const o=`fan-${e.replace(/[^a-z0-9]/gi,"")}-${t.glowStrength}`;if(this.defs||(this.defs=document.createElementNS(Us,"defs"),this.svg.appendChild(this.defs)),!this.defs.querySelector(`#${o}`)){const i=document.createElementNS(Us,"radialGradient");i.setAttribute("id",o);for(const[o,s]of qs(t.glowStrength)){const t=document.createElementNS(Us,"stop");t.setAttribute("offset",String(o)),t.setAttribute("stop-color",e),t.setAttribute("stop-opacity",String(s)),i.appendChild(t)}this.defs.appendChild(i)}return o}applyGlow(e,t,o){e.group.style.filter=o?Ls(o.glow,o.glowStrength,t,this.dotScale):""}paintDot(e,t,o,i){for(;e.firstChild;)e.removeChild(e.firstChild);const s=(o?o.dot/2:this.dotRadius)*this.dotScale;if(o&&2===o.glow&&o.glowStrength>0){const i=document.createElementNS(Us,"circle");i.setAttribute("r",(3.4*s).toFixed(2)),i.setAttribute("fill",`url(#${this.haloGradient(t,o)})`),e.appendChild(i)}for(const n of Ns({dot:2*s,caps:o?this.design?.shape.caps??0:0,core:(o?.core??0)/100,coreLight:(o?.coreLight??0)/100,bias:(this.design?.shape.bias??0)/100,colour:t,mixFrom:i})){const t=document.createElementNS(Us,"circle");t.setAttribute("cx",n.forward.toFixed(2)),t.setAttribute("r",n.r.toFixed(2)),t.setAttribute("fill",n.colour),n.opacity<1&&t.setAttribute("fill-opacity",n.opacity.toFixed(3)),e.appendChild(t)}}createDot(e,t){const o=document.createElementNS(Us,"g");return o.setAttribute("class","fan-dot"),o.dataset.key=t,e.group.appendChild(o),o}setDotRadius(e){this.dotRadius=e}setDotScale(e){Number.isFinite(e)&&e>0&&(this.dotScale=e)}pause(){if(!this.paused){this.paused=!0;for(const e of this.lines.values())for(const t of e.animations)t?.pause()}}resume(){if(this.paused){this.paused=!1;for(const e of this.lines.values())for(const t of e.animations)t?.play()}}destroy(){for(const e of this.lines.values()){for(const t of e.animations)t?.cancel();for(const t of e.dots)t.remove();e.group.remove(),e.path.remove()}this.lines.clear(),this.defs?.remove(),this.defs=void 0,this.clip=void 0}}const Ys=e=>e.toFixed(1);function Js(e,t,o,i=10){const s=0===t.y?0:i,n={x:e.x+t.x*s,y:e.y+t.y*s},r=o.x<n.x?-1:1,a=Math.abs(o.x-n.x),l=Math.min(160,Math.max(40,.6*a)),c=n.x+r*Math.min(l,a),d=l/2;return`${s>0?`M${Ys(e.x)},${Ys(e.y)} L${Ys(n.x)},${Ys(n.y)}`:`M${Ys(e.x)},${Ys(e.y)}`} C${Ys(n.x+Math.abs(t.x)*r*d)},${Ys(n.y+t.y*d)} ${Ys(c-r*d)},${Ys(o.y)} ${Ys(c)},${Ys(o.y)} L${Ys(o.x)},${Ys(o.y)}`}function Xs(e,t,o,i,s,n,r={x:i,y:0},a=10){const l=i=>t.some(t=>function(e,t=24){const o=[],i=e.match(/[MLC]|-?\d+(?:\.\d+)?/g)??[];let s={x:0,y:0},n=0;const r=()=>Number(i[n++]);for(;n<i.length;){const e=i[n++];if("M"===e)s={x:r(),y:r()},o.push(s);else if("L"===e){const e={x:r(),y:r()};for(let i=1;i<=t;i++){const n=i/t;o.push({x:s.x+(e.x-s.x)*n,y:s.y+(e.y-s.y)*n})}s=e}else if("C"===e){const e={x:r(),y:r()},i={x:r(),y:r()},n={x:r(),y:r()};for(let r=1;r<=t;r++){const a=r/t,l=1-a;o.push({x:l*l*l*s.x+3*l*l*a*e.x+3*l*a*a*i.x+a*a*a*n.x,y:l*l*l*s.y+3*l*l*a*e.y+3*l*a*a*i.y+a*a*a*n.y})}s=n}}return o}(en(e,r,i,{x:o,y:t},a)).some(e=>s.some(t=>Math.hypot(e.x-t.x,e.y-t.y)<t.r)||(n?.(e.x,e.y)??!1))),c=o-8*i;let d=e.x;for(;i*(c-d)>0&&l(d);)d+=2*i;return i*(d-c)>0?c:d}function en(e,t,o,i,s=10){const n=i.x<e.x?-1:1;if(n*(o-e.x)<1)return Js(e,t,i,s);const r=0===t.y?0:s,a={x:e.x+t.x*r,y:e.y+t.y*r},l=Math.max(0,n*(o-a.x)),c=n*Math.min(20,l/2),d=r>0?`L${Ys(a.x)},${Ys(a.y)} C${Ys(a.x+c)},${Ys(a.y)} ${Ys(o-c)},${Ys(a.y)} ${Ys(o)},${Ys(a.y)}`:`L${Ys(o)},${Ys(a.y)}`,h=function(e,t,o){return Math.max(8,Math.min(o*(t-e),160))}(o,i.x,n),u=n*(h/2),p=o+n*h;return`M${Ys(e.x)},${Ys(e.y)} ${d} C${Ys(o+u)},${Ys(a.y)} ${Ys(p-u)},${Ys(i.y)} ${Ys(p)},${Ys(i.y)} L${Ys(i.x)},${Ys(i.y)}`}function tn(e,t){if(t.height>e.bottom-e.top)return 0;const o=Math.min(e.bottom-t.height,Math.max(e.top,t.node-t.height/2));return Math.round(o-t.top)}function on(e,t,o){if("current"===e)return qe("view.now",o);return qe("view.average",o,{minutes:"avg_short"===e?t.view.avgShortMinutes:t.view.avgLongMinutes})}function sn(e,t,o,i,s,n=!1,r=""){const a=e=>{n||e===i||s(e)};return H`<div
    class="quick-group ${n?"off":""}"
    role="radiogroup"
    data-quick=${e}
    aria-label=${t}
    aria-disabled=${n?"true":"false"}
    title=${n?r:""}
  >
    ${o.map((e,t)=>H`<button
        class="quick-option ${t===i?"selected":""} ${e.late?"late":""}"
        role="radio"
        aria-checked=${t===i?"true":"false"}
        tabindex=${t===(i<0?0:i)?0:-1}
        aria-label=${e.aria}
        title=${n?r:e.title??""}
        @click=${()=>a(t)}
        @keydown=${e=>((e,t)=>{const i=o.length,s="ArrowRight"===e.key||"ArrowDown"===e.key?(t+1)%i:"ArrowLeft"===e.key||"ArrowUp"===e.key?(t-1+i)%i:"Home"===e.key?0:"End"===e.key?i-1:-1;if(s<0)return;if(e.preventDefault(),n)return;const r=e.currentTarget.parentElement;a(s),setTimeout(()=>r?.querySelectorAll('[role="radio"]')[s]?.focus(),0)})(e,t)}
      >
        ${e.label}
      </button>`)}
  </div>`}function nn(e,t,o,i,s,n,r,a,l,c){const d=e.view.modes.length>1,h=void 0!==a&&e.consumers.length>0&&e.list.scope.length>1,u=void 0!==l&&(l.waiting||l.labels.length>1),p=!0===l?.inPeriod,m=p?u?K:H`<div class="mode-note ${l?.late?"late":""}" title=${l?.title??""}>
          ${qe("energy.fixed",t,{period:l?.active??""})}
        </div>`:d||"current"===i?K:H`<div class="mode-note">${on(i,e,t)}</div>`,g=u&&!(e.view.expanded.includes("energy_periods")&&l?.waiting);if(!(o||d||g||c||h||m!==K))return K;const f=new Set(e.view.expanded),_=e=>qe(`editor.${e}`,t),w=qe(r?"list.filter_on":"list.show_all",t),y=h?f.has("scope")?sn("scope",_("group_scope"),[{label:H`<ha-icon .icon=${"mdi:filter-outline"}></ha-icon>`,aria:qe("editor.scope_filtered",t),title:qe("editor.scope_filtered",t)},{label:H`<ha-icon .icon=${"mdi:filter-off-outline"}></ha-icon>`,aria:qe("editor.scope_full",t),title:qe("editor.scope_full",t)}],r?1:0,()=>a?.()):H`<button
        class="filter-toggle ${r?"on":""}"
        aria-pressed=${r?"true":"false"}
        aria-label=${w}
        title=${w}
        @click=${a}
      >
        <ha-icon .icon=${r?"mdi:filter-off-outline":"mdi:filter-outline"}></ha-icon>
      </button>`:K,v=e.view.modes,b=d?f.has("modes")?sn("modes",_("group_smoothing"),v.map(o=>({label:on(o,e,t),aria:on(o,e,t),title:o===i&&s?qe("view.since",t,{time:s}):""})),v.indexOf(i),e=>n(v[e]),p,qe("view.off_in_period",t)):function(e,t,o,i,s,n=!1){const r=e.view.modes,a=r[(r.indexOf(o)+1)%r.length],l=n?qe("view.off_in_period",t):qe("view.chip",t,{mode:on(o,e,t),next:on(a,e,t)});return H`<button
    class="mode-chip view-chip"
    aria-disabled=${n?"true":"false"}
    aria-label=${l}
    title=${n?l:i?qe("view.since",t,{time:i}):""}
    @click=${()=>{n||s(a)}}
  >
    ${r.map(i=>H`<span class="mode-label ${i===o?"active":""}" aria-hidden="true"
        >${on(i,e,t)}</span
      >`)}
  </button>`}(e,t,i,s,n,p):K,x=u&&l?f.has("energy_periods")?l.waiting?K:sn("energy_periods",_("group_energy"),l.options.map(e=>({label:e.label,aria:e.label,title:e.title,late:e.late})),l.selected,l.onSelect):function(e){const t=e.labels.includes(e.active)?e.labels:[...e.labels,e.active];return e.waiting?H`<button class="mode-chip energy-chip waiting" aria-hidden="true" tabindex="-1">
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
  </button>`}(l):K,k=c?f.has("pv_scales")?sn("pv_scales",_("group_pv_scale"),c.labels.map((e,t)=>({label:e,aria:e,title:c.titles[t]})),c.selected,c.onSelect):H`<button
    class="mode-chip energy-chip pv-scale-chip"
    aria-label=${($=c).ariaLabel}
    title=${$.title}
    @click=${$.onCycle}
  >
    ${$.labels.map(e=>H`<span class="mode-label ${e===$.active?"active":""}" aria-hidden="true"
        >${e}</span
      >`)}
  </button>`:K;var $;return H`
    <div class="header">
      ${o?H`<div class="title">${o}</div>`:H`<span></span>`}
      <div class="controls qs-${e.view.quickStyle.replace("_","-")}">
        ${b}
        ${m}
        ${x}
        ${k}
        ${y}
      </div>
    </div>
  `}function rn(e,t){return e.isRest?e.name||qe("list.rest",t):e.name}function an(e,t="house"){return H`<ha-icon
    class="origin-icon"
    aria-hidden="true"
    .icon=${e.icons[t]??gs[t]}
    style="color:${e.colors[t]}"
  ></ha-icon>`}function ln(e){return e<=4?40:e<=7?34:28}function cn(e,t,o,i,s,n=[],r=!1){const a=t.list.enabled;if(!a&&(0===n.length||r))return K;const l=dn(e,t,n);return H`
    <div class="list ${s?"stacked":""}" style="--el-row-h:${ln(l)}px">
      ${t.list.title?H`<p class="list-title">${t.list.title}</p>`:K}
      ${n.length>0&&!r?hn(n,t,o,i,s):K}
      ${a?function(e,t,o,i,s){return H`
      <div class="rows">
        ${s?an(t):K}
        ${is(e.entries,e=>e.key,e=>un(e,t,o,i,s,!1))}
      </div>
  `}(e,t,o,i,s):K}
    </div>
  `}function dn(e,t,o){return(t.list.enabled?e.entries.length:0)+o.length}function hn(e,t,o,i,s){return H`<div class="pv-rows">
    ${s?an(t,"solar"):K}
    ${is(e,e=>e.key,e=>un(e,t,o,i,s,!0))}
  </div>`}function un(e,t,o,i,s,n){{const r=e.charge,a=function(e,t){return!t.energy&&void 0!==e.charge?.soc&&(e.powerUnknown||e.w<t.flow.minW)}(e,t),l=a&&void 0!==r?.soc?ki(r.soc,o):e.powerUnknown?"—":yi(e.w,o,t.power),c=r?function(e,t){if(void 0===e.soc)return qe("list.charge_unknown",t);const o=ki(e.soc,t);return e.stale&&void 0!==e.since?qe("list.charge_stale",t,{value:o,time:$i(e.since,t)}):qe("list.charge",t,{value:o})}(r,o):"",d=t.energy?e.isRest?t.energy.rest:t.energy.consumers[e.entity??""]:void 0,h=d&&d.tier>0?`warn${d.tier}`:"",u=t=>r?H`<button
                  class="soc-hit ${t}"
                  title=${c}
                  aria-label=${`${rn(e,o)}: ${c}`}
                  @click=${e=>i(r.entity,e)}
                ></button>`:K;return H`
            <div
              class="row ${n?"pv":""} ${e.isRest?"rest":""} ${r?"charge":""} ${r?.stale?"stale":""}"
              data-key=${e.key}
            >
              ${s?H`<span class="lane" aria-hidden="true"></span>`:K}
              ${r?H`<span class="swatch ${e.icon?"icon":"dot"}" style="color:${e.color}"
                      >${function(e){const t=11.2,o=2*Math.PI*t,i=void 0===e?0:o*Math.max(0,Math.min(100,e))/100;return H`<svg class="charge-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="track" cx="12" cy="12" r=${t}></circle>
    ${i>0?V`<circle
          class="fill"
          cx="12"
          cy="12"
          r=${t}
          stroke-dasharray=${`${i.toFixed(2)} ${o.toFixed(2)}`}
          transform="rotate(-90 12 12)"
        ></circle>`:K}
  </svg>`}(r.soc)}${e.icon?H`<ha-icon .icon=${e.icon}></ha-icon>`:K}${u("mark")}</span
                    >`:e.icon?H`<ha-icon class="swatch icon" .icon=${e.icon} style="color:${e.color}"></ha-icon>`:H`<span class="swatch dot" style="color:${e.color}"></span>`}
              <span class="name">${rn(e,o)}</span>
              <span class="row-value ${a?"soc":""} ${h}" title=${d?.note??""}
                >${l}${a?u("value"):K}</span
              >
              ${e.entity?H`<button
                    class="row-hit"
                    title=${d?.note??""}
                    aria-label=${`${rn(e,o)} ${e.powerUnknown?"—":yi(e.w,o,t.power)}`}
                    @click=${t=>i(e.entity,t)}
                  ></button>`:K}
            </div>
          `}}class pn{constructor(){this.positions=new Map,this.targets=new Map}static top(e,t){return e.getBoundingClientRect().top-t.getBoundingClientRect().top}capture(e){if(this.positions.clear(),this.blockTop=void 0,!e)return;const t=e.querySelector(".rows");t&&(this.blockTop=pn.top(t,e));for(const t of e.querySelectorAll(".row")){const o=t.dataset.key;o&&this.positions.set(o,pn.top(t,e))}}play(e,t){if(!e)return;const o=t&&"function"==typeof Element.prototype.animate,i=new Set,s=e.querySelector(".rows"),n=s&&void 0!==this.blockTop?this.blockTop-pn.top(s,e):0,r=e.querySelector(".row")?.getBoundingClientRect().height||28,a=this.positions.size>0?n:Math.max(-r,Math.min(r,n));for(const t of e.querySelectorAll(".row")){const s=t.dataset.key;if(!s)continue;i.add(s);const n=this.positions.get(s),r=pn.top(t,e),l=pn.runningGlide(t);if(l&&this.targets.get(s)===r)continue;if(this.targets.set(s,r),void 0===n){if(o){t.animate([{opacity:0,transform:`translateY(${a}px)`},{opacity:1,transform:`translateY(${.45*a}px)`,offset:.33},{opacity:1,transform:"none"}],{duration:600,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=mn}continue}const c=n-r;if(!c||!o)continue;l?.cancel();t.animate([{transform:`translateY(${c}px)`},{transform:"none"}],{duration:600,easing:"cubic-bezier(0.4, 0, 0.2, 1)"}).id=mn}for(const e of[...this.targets.keys()])i.has(e)||this.targets.delete(e);this.positions.clear()}static runningGlide(e){if("function"==typeof e.getAnimations)return e.getAnimations().find(e=>e.id===mn&&"running"===e.playState)}}const mn="enerlens-glide";function gn(e,t){const o=function(e){return!Number.isFinite(e)||e<=0?1:Math.sqrt(Math.min(e,1))}(e),i=e=>Math.round(1e3*e)/1e3;return{dot:i(t.dotSize/100*o),line:i(t.lineWidth/100*o)}}function fn(e,t,o){if(e.solarSources.length<2)return[];const i=[];for(const s of e.solarSources){if(!s.reading.available)continue;const e=s.reading.w;!o&&e<t.minConsumerW||i.push({key:s.key,name:s.name,w:e,color:s.color,entity:s.entity,icon:s.icon,threshold:t.minConsumerW,isRest:!1})}return i.sort((e,t)=>t.w-e.w)}function _n(e,t,o,i){const s=e.solarSources.filter(e=>e.reading.available&&e.reading.w>0&&uo({w:e.reading.w,threshold:t.minConsumerW},t)),n=e=>{const t=i?.indexOf(e)??-1;return-1===t?Number.POSITIVE_INFINITY:t},r=e=>e.reading.available?e.reading.w:0;s.sort((e,t)=>i&&n(e.key)-n(t.key)||r(t)-r(e));const a=s.reduce((e,t)=>e+r(t),0),l=e.solarSources.reduce((e,t)=>e+1e3*(t.kwp??0),0),c="peak"===o?Math.max(l,a):a,d=s.map(e=>({key:e.key,share:c>0?r(e)/c:0,color:e.color,entity:e.entity,isRest:!1}));if("peak"===o){const e=1-d.reduce((e,t)=>e+t.share,0);e>1e-9&&d.push({key:"__pv_free__",share:e,color:"var(--el-pv-free)",isRest:!0})}return d}class wn{constructor(){this.last=new Map,this.asked=new Set}get values(){return this.last}observe(e,t){for(const o of t){const t=ri(e,o.entity);null!==t&&this.last.set(o.entity,o.invert?-t:t)}}missing(e,t){return t.map(e=>e.entity).filter(t=>!this.asked.has(t)&&!this.last.has(t)&&null===ri(e,t))}async prefill(e,t,o,i=5e3){if(0===o.length)return;for(const e of o)this.asked.add(e);const s=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(s-864e6).toISOString(),end_time:new Date(s).toISOString(),entity_ids:[...o],minimal_response:!0,no_attributes:!0});let r;n.catch(()=>{});const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error("EnerLens: PV history timed out")),i)});let l;try{l=await Promise.race([n,a])}finally{void 0!==r&&clearTimeout(r)}if(null!==l&&"object"==typeof l)for(const i of o){const o=l[i];if(!Array.isArray(o))continue;const s=e.states[i];let n;for(const t of o){if("string"!=typeof t.s)continue;const o=ri({...e,states:{[i]:{...s,entity_id:i,state:t.s}}},i),r="number"==typeof t.lc?t.lc:t.lu;null!==o&&"number"==typeof r&&((!n||r>n.t)&&(n={w:o,t:r}))}const r=!0===t.find(e=>e.entity===i)?.invert;n&&!this.last.has(i)&&this.last.set(i,r?-n.w:n.w)}}}const yn=n`
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

  /* Triangle: the house's label lies on the lines below it - on a ground of the
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
  .body.layout-triangle.no-list .cross {
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
`,vn="view-mode",bn="show-all",xn="energy-period",kn="pv-scale",$n=3e5;function Sn(e,t){try{localStorage.setItem(e,t)}catch{}}function An(e){try{return localStorage.getItem(e)}catch{return null}}function Mn(e){const t=Number.parseFloat(getComputedStyle(e).opacity);return Number.isNaN(t)?1:t}function En(e,t){if(!e||!t)return e===t;const o=(e,t)=>e.length===t.length&&e.every((e,o)=>e===t[o]);return e.entity===t.entity&&o(e.outage,t.outage)&&o(e.ok,t.ok)}const Cn=Object.fromEntries(Object.keys(io).map(e=>[io[e],{entity_id:io[e],state:String(so[e]),attributes:{unit_of_measurement:"W",device_class:"power"},last_changed:"",last_updated:""}])),zn=new Set,Pn=e=>"object"==typeof e&&null!==e,Wn=e=>!0===e.preview;function Nn(e){const t=[];let o=e;for(;o;)t.unshift(o),o=o.parentNode??(o instanceof ShadowRoot?o.host:null);return t}function Fn(e,t){const o=Nn(e),i=Nn(t);let s=0;for(;s<o.length&&s<i.length&&o[s]===i[s];)s++;return s>=o.length||s>=i.length?o.length-i.length:o[s]instanceof ShadowRoot?-1:i[s]instanceof ShadowRoot?1:o[s].compareDocumentPosition(i[s])&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}class Rn extends ce{constructor(){super(...arguments),this._entityIds=[],this._chargeIds=[],this._extraIds=[],this._charge=new ye,this._solarMemory=new wn,this._chargeOf=e=>this._charge.state(this._hass,e),this._rows=new pn,this._lastEntries=new Map,this._lastSolar=new Map,this._mode="current",this._designsPickedUp=!1,this._ring=new as,this._solarRing=new as,this._technique="static",this._visible=!0,this._stacked=!1,this._stackedWidth=0,this._settled=!1,this._showAll=!1,this._pvScale="share",this._scale=1,this._plotScale=1,this._holeR=Pi,this._seeThrough=!1,this._outagePrefilled=!1,this._energyPeriod=null,this._energyChosen=!1,this._energyViews=new Map,this._energyKey="",this._energyAsked=new Map,this._statsKey="",this._statsRemembered=!1,this._statsRetryAt=0,this._rememberPending=!1,this._onVisibility=()=>{this._syncPlayState(),"hidden"===document.visibilityState?this._pause(Date.now()):this._resume()},this._onMotionChange=()=>this.requestUpdate(),this._onTransitionEnd=e=>{const{propertyName:t,target:o}=e;if("outline-color"!==t||!(o instanceof HTMLElement))return;const i=o.classList.contains("node")?o.closest(".plot"):null;i&&this._measureHoles(i)},this._pathZoom=1,this._onWindowResize=()=>this._measurePathZoom(),this._example=!1,this._onMoreInfo=e=>{this._example&&e.stopPropagation()}}get _period(){if(!this._energyPeriod||this._example)return null;const e=!1!==this._config?.view.power;return this.preview&&!this._energyChosen&&e?null:this._energyPeriod}_energyOffer(e){const t=e.view,o=t.energyDefault&&!0!==this._statsOk?[]:t.energyPeriods;return[...t.power?[null]:[],...o]}_statsWaiting(e){return e.view.energyDefault&&void 0===this._statsOk&&!this._example}_startEnergy(e,t){const o=this._energyOffer(e),i="power"===e.view.defaultEnergy?null:e.view.defaultEnergy;let s=o.includes(i)?i:o[0]??null;if(t&&e.view.remember&&o.length>1){const e=An(this._memKey(xn)),t=o.find(t=>(t??"kw")===e);void 0!==t&&(s=t)}this._energyPeriod=s}_applyRemembered(){const e=this._config;if(e?.view.remember){if(e.view.modes.length>1){const t=e.view.modes.find(e=>e===An(this._memKey(vn)));t&&(this._mode=t)}if(e.list.scope.length>1){const t=An(this._memKey(bn));"1"===t&&(this._showAll=e.list.scope.includes("full")),"0"===t&&(this._showAll=!e.list.scope.includes("filtered"))}if(e.view.pvScales.length>1){const t=e.view.pvScales.find(e=>e===An(this._memKey(kn)));t&&(this._pvScale=t)}this._startEnergy(e,!0),this._hass&&(this._tickModel=this._modelForMode(this._hass,e))}}_memKey(e){const t=this._config?.memoryId;if(!t)return`enerlens-${e}`;const o=location.pathname.replace(/^\/+|\/+$/g,"");let i=0;return Wn(this)||(i=this._rankInDashboard(t)??this._rankOnPage(t)),`enerlens:${o}:${t}${i>0?`#${i+1}`:""}:${e}`}_rankInDashboard(e){let t,o;for(const e of Nn(this).reverse()){const i=e;void 0===t&&"hui-card"===i.localName&&i.config&&(t=i.config),!o&&Pn(i.lovelace?.config)&&(o=i.lovelace.config)}if(void 0!==t&&o&&Array.isArray(o.views))for(const i of o.views){const o=Jt(i),s=o.indexOf(t);if(-1!==s)return o.slice(0,s).filter(t=>Xt(t.memory_id)===e).length}}_rankOnPage(e){const t=[...zn].filter(t=>t.isConnected&&!Wn(t)&&t._config?.memoryId===e).sort(Fn);return Math.max(0,t.indexOf(this))}_checkStatistics(){const e=this._config,t=this._realHass;if(!e?.view.energyDefault||!t||this._example)return;const o=Bo(e).join(","),i=this._statsRetryAt>0&&Date.now()>=this._statsRetryAt;(o!==this._statsKey||i)&&(this._statsKey=o,this._statsRetryAt=0,i||(this._statsOk=void 0),function(e,t){const o=Bo(t),i=o.join(","),s=Ho.get(i);if(s)return s;const n=(async()=>{if(0===o.length||"function"!=typeof e.callWS)return!1;const t=await e.callWS({type:"recorder/get_statistics_metadata",statistic_ids:o});if(!Array.isArray(t))return!1;const i=new Set(t.filter(e=>"object"==typeof e&&null!==e).filter(e=>(1===e.mean_type||!0===e.has_mean)&&"power"===e.unit_class).map(e=>e.statistic_id));return o.every(e=>i.has(e))})().catch(e=>{Ho.delete(i),console.warn(e)});return Ho.set(i,n),n}(t,e).then(e=>{this._statsKey===o&&(void 0===e&&(this._statsRetryAt=Date.now()+3e4),this._statsOk=e??!1,!1===e&&console.warn(qe("energy.no_statistics",t)),e&&this._config&&(this._startEnergy(this._config,!this._statsRemembered),this._statsRemembered=!0),this.requestUpdate())}))}_shownConfig(){const e=this._config,t=this._period;return t?function(e,t){const o=t?.hours??1,i=1/o;return{...e,power:{...e.power,energyHours:o},minConsumerW:e.minConsumerW*i,consumers:e.consumers.map(e=>void 0===e.minW?e:{...e,minW:e.minW*i}),energy:t?.marks??{roles:{},consumers:{},rest:{tier:0,note:""}}}}(e,this._energyViews.get(t)):e}_flowsOf(e){const t=this._period;return t?this._energyViews.get(t)?.flowsW??{}:function(e){return ao(e.solar.available?e.solar.w:0,e.grid.available?e.grid.positive:0,e.grid.available?e.grid.negative:0,e.battery?.available?e.battery.positive:0,e.battery?.available?e.battery.negative:0,e.house.available?e.house.w:0)}(e)}_cycleEnergy(){if(!this._config)return;const e=this._energyOffer(this._config),t=void 0!==this._energyPending?this._energyPending:this._period;this._selectEnergy(e[(e.indexOf(t)+1)%e.length])}_selectEnergy(e){const t=this._hass;if(!this._config)return;if(null===e||void 0!==t&&this._fresh(e,t,Date.now()))return this._energyPending=void 0,void this._showEnergy(e);this._energyPending=e,this.requestUpdate(),this._ensureEnergy(e,!0)}_showEnergy(e){this._energyPeriod=e,this._energyChosen=!0;const t=this.preview;this._config?.view.remember&&!t&&Sn(this._memKey(xn),e??"kw"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}_fresh(e,t,o){const i=this._energyViews.get(e);return void 0!==i&&i.start===Uo(e,Co(e,o,Qo(t),Zo(t)))}_ensureEnergy(e,t=!1){const o=e??this._period,i=this._hass,s=this._config;if(!o||!i||!s)return;const n=Date.now(),r=Uo(o,Co(o,n,Qo(i),Zo(i))),a=this._energyAsked.get(o);if(a?.open)return;if(!t&&a&&a.start===r&&n-a.at<$n)return;const l={at:n,start:r,open:!0};this._energyAsked.set(o,l);const c=this._energyKey;Yo(i,s,o,n).then(e=>{if(l.open=!1,c===this._energyKey){if(this._energyViews.set(o,e),this._energyPending===o)return this._energyPending=void 0,void this._showEnergy(o);this._hass&&this._config&&this._period===o&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}}).catch(e=>{console.warn(e),l.open=!1,c===this._energyKey&&(this._energyAsked.get(o)===l&&(l.at=n-$n+3e4),this._energyPending===o&&(this._energyPending=void 0,this.requestUpdate()))})}_energyChip(e,t){if(this._example)return;const o=this._statsWaiting(t),i=o?[...t.view.power?[null]:[],...t.view.energyPeriods]:this._energyOffer(t),s=void 0!==this._energyPending?this._energyPending:this._period;if(i.length<2&&null===s&&!o)return;const n=s?this._energyViews.get(s):void 0,r=i[(i.indexOf(s)+1)%i.length],a=t.power.unit,l=ei(s,n,e,a),c=null!==s&&!0===n?.lateStart;return{labels:i.map(t=>ei(t,void 0,e,a)),active:l,ariaLabel:qe("energy.chip",e,{mode:l,next:ei(r,void 0,e,a)}),inPeriod:null!==s,late:c,waiting:o,title:c&&n?qe("energy.late",e,{date:Xo(n.from,e,!0)}):"",onCycle:()=>this._cycleEnergy(),options:i.map(t=>{const o=t?this._energyViews.get(t):void 0,i=null!==t&&!0===o?.lateStart;return{label:ei(t,void 0,e,a),late:i,title:i&&o?qe("energy.late",e,{date:Xo(o.from,e,!0)}):""}}),selected:i.indexOf(s),onSelect:e=>this._selectEnergy(i[e])}}get _nodePx(){return Math.max(70,112*this._scale+11)}_geometry(){const e=this._config;return Ii(e.layout,e.flow.lines,null!==(this._model?.battery??null))}_cyclePvScale(){const e=this._config?.view.pvScales??[];e.length<2||this._setPvScale(e[(e.indexOf(this._pvScale)+1)%e.length])}_setPvScale(e){this._pvScale=e,this._config?.view.remember&&!Wn(this)&&Sn(this._memKey(kn),this._pvScale)}_pvScaleChip(e,t){const o=t.view.pvScales;if(o.length<2)return;const i=t=>qe(`pv_scale.${t}`,e),s=o[(o.indexOf(this._pvScale)+1)%o.length],n="peak"===this._pvScale&&this._period?"pv_scale.peak_period_title":`pv_scale.${this._pvScale}_title`;return{labels:o.map(i),active:i(this._pvScale),ariaLabel:qe("pv_scale.chip",e,{mode:i(this._pvScale),next:i(s)}),title:qe(n,e),onCycle:()=>this._cyclePvScale(),titles:o.map(t=>qe("peak"===t&&this._period?"pv_scale.peak_period_title":`pv_scale.${t}_title`,e)),selected:o.indexOf(this._pvScale),onSelect:e=>this._setPvScale(o[e])}}_toggleShowAll(){this._showAll=!this._showAll,this._config?.view.remember&&!Wn(this)&&Sn(this._memKey(bn),this._showAll?"1":"0"),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config))}_pause(e){this._pausedAt??=e}_resume(){const e=this._pausedAt;if(void 0===e||!this.isConnected||"hidden"===document.visibilityState)return;if(!1===this._realHass?.connected)return;this._pausedAt=void 0;const t=Date.now();this._lastTick=t,!this._config||t-e<=1e3*this._config.updateIntervalS||(this._buffer?.markGap(e,t),this._historyFor=void 0,this._hass&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}set hass(e){this._realHass=e,!1===e.connected?this._pause(Date.now()):this._resume();const t=this._example,o=this._withExample(e),i=this._hass;this._hass=o,this._config&&(this._checkStatistics(),i&&t===this._example&&!this._shownChanged(i,o)||(this._config.gridStatus&&(this._outage=function(e,t,o){const i=e.states[t.entity]?.state;return Oe(o,i,t,Ie(e,t.entity))}(o,this._config.gridStatus,this._outage)),this._observeCharge(o),this._example||this._solarMemory.observe(o,this._config.solarSources),this._model=pi(o,this._config,this._chargeOf,this._solarMemory.values),this._tickModel??=this._model,this._example||this._recordSamples(o),this.requestUpdate("hass",i)))}_withExample(e){const t=[...this._entityIds,...this._extraIds,...this._chargeIds],o=Object.values(io);return this._example=this._entityIds.length>0&&t.every(e=>o.includes(e))&&!t.some(t=>e?.states?.[t]||e?.entities?.[t]),this._example?{...e,states:{...e.states,...Cn}}:e}get hass(){return this._hass}_shownChanged(e,t){const o=[...this._entityIds,...this._chargeIds,...this._extraIds];return!!o.some(o=>e.states[o]!==t.states[o])||(e.language!==t.language||e.locale!==t.locale||e.formatEntityState!==t.formatEntityState||e.themes!==t.themes||e.connected!==t.connected||e.entities!==t.entities&&o.some(o=>e.entities?.[o]?.display_precision!==t.entities?.[o]?.display_precision))}_observeCharge(e){this._config&&0!==this._chargeIds.length&&this._charge.observe(e,this._config.consumers)}_ensureLookups(){const e=this._hass;if(!e||!this._config)return;if(this._example||this.preview)return;this._config.gridStatus&&!this._outagePrefilled&&(this._outagePrefilled=!0,this._prefillOutage());const t=this._solarMemory.missing(e,this._config.solarSources);if(t.length>0&&this._solarMemory.prefill(e,this._config.solarSources,t).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=pi(this._hass,this._config,this._chargeOf,this._solarMemory.values),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()}),0===this._chargeIds.length)return;const o=this._charge.missing(e,this._config.consumers);0!==o.length&&this._charge.prefill(e,o).catch(()=>{}).finally(()=>{this._hass&&this._config&&(this._model=pi(this._hass,this._config,this._chargeOf,this._solarMemory.values),this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate()})}setConfig(e){const t=this._config;this._config=Gt(e,this._hass),this._rawConfig=e,this._entityIds=function(e){const t=[],o=e=>{e&&!t.includes(e)&&t.push(e)};for(const t of[e.sources.solar,e.sources.grid,e.sources.battery,e.sources.house])"single"===t.kind?o(t.entity):"split"===t.kind&&(o(t.positive),o(t.negative));for(const t of e.solarSources)o(t.entity);o(e.sources.batterySoc),o(e.gridStatus?.entity);for(const t of e.consumers)o(t.entity);return t}(this._config),this._chargeIds=function(e){const t=[];for(const o of e.consumers){const e=o.charge;if(e)for(const o of[e.soc,e.plugged])o&&!t.includes(o)&&t.push(o)}return t}(this._config),this._extraIds=function(e){const t=[];for(const o of Ot){if("battery"===o&&"absent"===e.sources.battery.kind)continue;const{inside:i,label:s}=e.nodes[o];for(const e of[i?.entity,s?.entity])e&&!t.includes(e)&&t.push(e)}return t}(this._config),this._realHass&&(this._hass=this._withExample(this._realHass));const o=this._config.view;t&&t.view.avgLongMinutes===o.avgLongMinutes||(this._buffer=new pe(6e4*o.avgLongMinutes)),t||(this._rememberPending=!0),t&&t.view.defaultMode===o.defaultMode&&o.modes.includes(this._mode)||(this._mode=o.defaultMode),t&&t.view.defaultPvScale===o.defaultPvScale&&o.pvScales.includes(this._pvScale)||(this._pvScale=o.defaultPvScale);const i=this._config.list,s=this._showAll?"full":"filtered";t&&t.list.defaultScope===i.defaultScope&&i.scope.includes(s)||(this._showAll="full"===i.defaultScope);const n=function(e){const{roles:t,inverted:o}=Oo(e);return JSON.stringify([t,[...o],e.solarSources.map(e=>e.entity),e.consumers.map(e=>e.entity),e.flow.minW])}(this._config);n!==this._energyKey&&(this._energyKey=n,this._energyViews.clear(),this._energyAsked.clear(),this._energyPending=void 0),Bo(this._config).join(",")===this._statsKey&&o.energyDefault||(this._statsKey="",this._statsOk=void 0,this._statsRetryAt=0);const r=this._energyOffer(this._config);t&&t.view.defaultEnergy===o.defaultEnergy&&r.includes(this._energyPeriod)||this._startEnergy(this._config,!1),void 0===this._energyPending||r.includes(this._energyPending)||(this._energyPending=void 0),this._checkStatistics(),this.requestUpdate(),t&&En(t.gridStatus,this._config.gridStatus)||(this._outage=void 0,this._outagePrefilled=!1),this._hass&&(this._observeCharge(this._hass),this._model=pi(this._hass,this._config,this._chargeOf,this._solarMemory.values),this._tickModel=this._model),t&&t.updateIntervalS===this._config.updateIntervalS||this._restartTick()}connectedCallback(){super.connectedCallback(),zn.add(this),this._resizeObserver=new ResizeObserver(()=>{this._measure(),this._measurePathZoom()}),this._resizeObserver.observe(this),window.addEventListener("resize",this._onWindowResize),this._technique=function(){const e="undefined"!=typeof CSS&&CSS.supports?.("offset-path",'path("M 0 0 L 1 1")'),t="undefined"!=typeof Element&&"animate"in Element.prototype;return e&&t?"waapi":"static"}(),this._intersectionObserver=new IntersectionObserver(e=>{this._visible=e.some(e=>e.isIntersecting),this._syncPlayState()}),this._intersectionObserver.observe(this),this._pickUpLiveDesigns(),document.addEventListener("visibilitychange",this._onVisibility),this.renderRoot.addEventListener("transitionend",this._onTransitionEnd),this._resume(),this._motionQuery=window.matchMedia?.("(prefers-reduced-motion: reduce)"),this._motionQuery?.addEventListener?.("change",this._onMotionChange),this._restartTick()}_restartTick(){this._tickTimer&&clearInterval(this._tickTimer);const e=this._config?.updateIntervalS??5;this._lastTick=Date.now(),this._tickTimer=setInterval(()=>{const t=Date.now(),o=this._lastTick??t;this._lastTick=t,t-o>2*e*1e3&&(this._pause(o),this._resume()),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config),this._updateSince(),this.requestUpdate())},1e3*e)}get _dotsMove(){return this._animationsWanted&&"waapi"===this._technique}get _animationsWanted(){const e=this._config?.flow.animation??"auto";return"off"!==e&&("on"===e||!this._motionQuery?.matches)}_recordSamples(e){if(!this._config||!this._buffer)return;const t=Date.now();for(const o of this._entityIds){const i=e.states[o];i&&this._buffer.push(o,Date.parse(i.last_changed)||t,ri(e,o))}this._buffer.prune(t)}_modelForMode(e,t){const o=this._period;if(o){const i=this._energyViews.get(o);return mi(e,t,e=>i?.meanW(e)??null,this._chargeOf,this._solarMemory.values)}if("current"===this._mode||!this._buffer||this._example)return pi(e,t,this._chargeOf,this._solarMemory.values);const i=6e4*("avg_short"===this._mode?t.view.avgShortMinutes:t.view.avgLongMinutes),s=Date.now(),n=this._buffer;return mi(e,t,e=>n.mean(e,i,s),this._chargeOf)}_ensureHistory(e=!1){const t=this._buffer;t&&"current"!==this._mode&&this._hass&&this._config&&(e||this._historyFor!==t)&&(this._example||this.preview||(this._historyFor=t,this._prefill(t)))}async _prefill(e){const t=this._hass,o=this._config;if(!t||!o)return;const i=Date.now();try{const s=await async function(e,t,o,i=5e3){const s={};if(0===t.length)return s;const n=Date.now(),r=n-6e4*o,a=e.callWS({type:"history/history_during_period",start_time:new Date(r).toISOString(),end_time:new Date(n).toISOString(),entity_ids:t,minimal_response:!0,no_attributes:!0});let l;const c=new Promise((e,s)=>{l=setTimeout(()=>{s(new Error(`EnerLens: history/history_during_period did not answer within ${i} ms (${t.length} entities, ${o} min) - falling back to live buffering`))},i)});let d;try{d=await Promise.race([a,c])}finally{void 0!==l&&clearTimeout(l)}if(null===d||"object"!=typeof d)return s;const h=d;for(const e of t){const t=h[e];if(!Array.isArray(t))continue;const o=[];for(const e of t){const t=ge(e);null!==t&&o.push(t)}o.sort((e,t)=>e.t-t.t),s[e]=o}return s}(t,this._entityIds,o.view.avgLongMinutes);if(e!==this._buffer)return;for(const[o,i]of Object.entries(s)){const s=t.states[o]?.attributes.unit_of_measurement;for(const t of i)e.push(o,t.t,this._toWatts(t.v,s))}e.healGaps(i,Object.entries(s).filter(([,e])=>e.length>0).map(([e])=>e)),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this._updateSince()}catch{this._updateSince()}finally{this.requestUpdate()}}async _prefillOutage(){const e=this._config?.gridStatus;if(this._hass&&e)try{const t=await async function(e,t,o=10,i=5e3){const s=Date.now(),n=e.callWS({type:"history/history_during_period",start_time:new Date(s-864e5*o).toISOString(),end_time:new Date(s).toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0});let r;const a=new Promise((e,t)=>{r=setTimeout(()=>t(new Error(`EnerLens: grid status history timed out after ${i} ms`)),i)});let l;try{l=await Promise.race([n,a])}finally{void 0!==r&&clearTimeout(r)}if(null===l||"object"!=typeof l)return;const c=l[t];if(!Array.isArray(c))return;const d=e=>{const t=e.lu;return"number"==typeof t?t:0};for(const e of[...c].sort((e,t)=>d(t)-d(e))){const t=e.s;if("string"==typeof t&&!De.has(Te(t)))return t}}(this._hass,e.entity);void 0===this._outage&&En(this._config?.gridStatus,e)&&(this._outage=Oe(void 0,t,e,Ie(this._hass,e.entity)))}catch{}finally{this.requestUpdate()}}_toWatts(e,t){if(null===e)return null;return e*("kW"===t?1e3:"MW"===t?1e6:"mW"===t?.001:1)}_updateSince(){if(!this._buffer||"current"===this._mode)return void(this._since=void 0);const e=this._buffer.status(Date.now());this._since=e.complete||!e.since?void 0:new Date(e.since).toLocaleTimeString(this._hass?.locale.language??"de",{hour:"2-digit",minute:"2-digit"})}_setMode(e){e!==this._mode&&(this._mode=e,this._config?.view.remember&&!Wn(this)&&Sn(this._memKey(vn),e),this._ensureHistory(!0),this._updateSince(),this._hass&&this._config&&(this._tickModel=this._modelForMode(this._hass,this._config)),this.requestUpdate())}_measure(){const e=this.renderRoot?.querySelector(".plot"),t=e?.getBoundingClientRect().width??0;if(t>0){const o=t/Ei;this._plotScale=o,this.style.setProperty("--el-scale",String(o)),this._dots?.setScale(o),Math.abs(o-this._scale)>.005&&(this._scale=o),this._measureHoles(e)}return this._checkStacked()}_measureHoles(e){const t=e.querySelector(".node");if(!t)return;const o=getComputedStyle(t),i=function(e){const t=e.trim().toLowerCase();if("transparent"===t)return!0;const o=t.match(/\/\s*([\d.]+)(%?)\s*\)$/),i=t.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%?)\s*\)$/),s=o??i;if(!s)return!1;const n=Number(s[1])/(s[2]?100:1);return Number.isFinite(n)&&n<1}(o.backgroundColor);if(i!==this._seeThrough&&(this._seeThrough=i),!i)return;const s=Number.parseFloat(getComputedStyle(e).width),n=(Number.parseFloat(o.width)/2-Number.parseFloat(o.borderTopWidth||"0"))*Ei/s;n>0&&Number.isFinite(n)&&!(Math.abs(n-this._holeR)<.005)&&(this._holeR=n,e.querySelector("path.holes")?.setAttribute("d",Vi(this._geometry(),n)))}_measurePathZoom(){if("waapi"!==this._technique||"undefined"==typeof navigator||!/^Apple/.test(navigator.vendor??""))return;const e=this.renderRoot?.querySelector(".plot svg"),t=e?function(e){const t=(e=0,t=0)=>{const o=document.createElementNS(Is,"circle");return o.setAttribute("cx",String(e)),o.setAttribute("cy",String(t)),o.setAttribute("r","1"),o},o=document.createElementNS(Is,"g");o.style.offsetPath='path("M400,400 L400,401")',o.style.offsetRotate="0deg",o.style.offsetDistance="0%",o.appendChild(t());const i=t(Bs,Bs),s=t(),n=t(200,200),r=document.createElementNS(Is,"g");r.style.visibility="hidden",r.style.pointerEvents="none",r.append(o,i,s,n),e.appendChild(r);try{const e=e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2,w:t.width}},t=e(s),r=e(i),a=e(o);if(!(r.w>0))return;const l=r.x-t.x,c=r.y-t.y,d=a.x-t.x,h=a.y-t.y,u=l*l+c*c;if(!(u>0))return;const p=e(n);if(Math.hypot(p.x-(t.x+r.x)/2,p.y-(t.y+r.y)/2)>.002*Math.sqrt(u))return;const m=(d*l+h*c)/u;if(!(m>.1&&m<10)||Math.abs(d*c-h*l)/u>.01*m)return;return Math.abs(m-1)<.002?1:m}finally{r.remove()}}(e):void 0;void 0===t||Math.abs(t-this._pathZoom)<.002||(this._pathZoom=t,this._dots?.setPathZoom(t),this._fan?.setPathZoom(t),this._solarFan?.setPathZoom(t),this._drawFan())}_checkStacked(){const e=this.renderRoot?.querySelector(".cross"),t=this.renderRoot?.querySelector(".list:not(.pv-side)"),o=this.renderRoot?.querySelector(".body");if(!e||!o)return!1;let i;if(this._splitsLists()){if(0===o.clientWidth)return!1;if(this._stacked)i=o.clientWidth<=this._stackedWidth;else{const o=this.renderRoot.querySelector(".pv-side");i=null!==o&&e.offsetLeft<=o.offsetLeft||null!==t&&t.offsetLeft<=e.offsetLeft}}else{if(!t)return!1;i=t.offsetTop>=e.offsetTop+e.offsetHeight/2}return i!==this._stacked&&(i&&(this._stackedWidth=o.clientWidth),this._stacked=i,this.requestUpdate(),!0)}_splitsLists(){return"square_left"===this._config?.layout&&this._lastSolar.size>0}_updateFan(){if(this._drawFan(),this._fanFollow&&cancelAnimationFrame(this._fanFollow),"function"!=typeof requestAnimationFrame)return;const e=performance.now(),t=()=>{this._drawFan(),this._fanFollow=performance.now()-e<650?requestAnimationFrame(t):void 0};this._fanFollow=requestAnimationFrame(t)}_drawFan(){this._config&&(this._placeLists(),this._drawConsumerFan(),this._drawSolarFan())}_placeLists(){const e=this.renderRoot?.querySelector(".pv-rows"),t=this.renderRoot?.querySelector(".rows"),o=[e,t].filter(e=>null!==e),i=this.renderRoot?.querySelector(".body"),s=this.renderRoot?.querySelector(".cross"),n=this.renderRoot?.querySelector(".node.solar"),r=this.renderRoot?.querySelector(".node.house");if(this._stacked||!e||!i||!s||!n||!r){for(const e of o)e.style.transform="";return}const a=e.parentElement?.classList.contains("pv-side")??!1,l=i.getBoundingClientRect().top,c=e=>{const t=/translateY\((-?[\d.]+)px\)/.exec(e.style.transform);return t?Number(t[1]):0},d=e=>{const t=e.getBoundingClientRect();return t.top+t.height/2-l},h=(e,t)=>{if(!e)return{top:0,height:0,node:d(t)};const o=e.getBoundingClientRect();return{top:o.top-l-c(e),height:o.height,node:d(t)}},u=s.getBoundingClientRect(),p={top:u.top-l,bottom:u.bottom-l},m=(e,t)=>{if(!e)return;const o=t?`translateY(${t}px)`:"";e.style.transform!==o&&(e.style.transform=o)};if(a)return m(e,tn(p,h(e,n))),void(t&&m(t,tn(p,h(t,r))));const g=function(e){const{drawing:t,pv:o,consumers:i,gap:s}=e;if(o.height+s+i.height>t.bottom-t.top)return{pv:0,consumers:0};let n=o.node-o.height/2,r=i.node-i.height/2;const a=n+o.height+s-r;return a>0&&(n-=a/2,r+=a/2),n<t.top&&(r=Math.max(r,t.top+o.height+s),n=t.top),r+i.height>t.bottom&&(r=t.bottom-i.height,n=Math.min(n,r-s-o.height)),{pv:Math.round(n-o.top),consumers:Math.round(r-i.top)}}({drawing:p,pv:h(e,n),consumers:h(t,r),gap:10});m(e,g.pv),m(t,g.consumers)}_fanRows(e,t,o,i=1){return e.map(e=>{const s=e.dataset.key,n=s?t.get(s):void 0;if(!n)return null;const r=lo(n.w,this._shownConfig()),a=!uo(n,this._shownConfig()),l=this._config?.flow.inactiveLines??"show";if(a&&"hide"===l)return null;const c=(this._stacked?e.querySelector(".swatch")??e:e).getBoundingClientRect(),d=e.getBoundingClientRect(),h=e.querySelector(".charge-ring"),u=h?Math.min(c.left,h.getBoundingClientRect().left):c.left;return{key:s,x:(1===i?u:c.right)-o.left,y:d.top+d.height/2-o.top,color:n.color,count:this._dotsMove?r?.count??0:0,durationS:r?.durationS??1,inactive:a&&"hide"!==l?l:void 0,fade:Mn(e)}}).filter(e=>null!==e)}_layer(e,t){const o=e??new Gs(t);e||o.setPathZoom(this._pathZoom);const i=this._config;return o.setDesign(wo(i.flow.design),Ts(this,i.appearance)),o.setDotColor(i.flow.dotColor),o.setDotRadius(5),o.setDotScale(gn(this._plotScale,i.flow).dot),o}_exit(e,t,o,i){const s=e.getBoundingClientRect(),n={x:s.left+s.width/2-o.left,y:s.top+s.height/2-o.top},r=t.length>0?1===i?Math.min(...t.map(e=>e.x)):Math.max(...t.map(e=>e.x)):void 0,a=function(e,t,o,i=e.x+200*o){if(0===t.length)return{x:o,y:0};const s=t.reduce((e,t)=>e+t,0)/t.length,n=Math.max(1,o*(i-e.x)),r=80*Math.PI/180,a=Math.max(-r,Math.min(r,Math.atan2(s-e.y,n)));return Math.abs(a)<1e-9?{x:o,y:0}:{x:o*Math.cos(a),y:Math.sin(a)}}(n,t.map(e=>e.y),i,r),l=s.width/2,c={x:n.x+a.x*l,y:n.y+a.y*l},d=Number.parseFloat(getComputedStyle(e).borderTopWidth)||0,h=s.width/(e.offsetWidth||s.width);return{centre:n,dir:a,start:c,hole:this._seeThrough?{x:n.x,y:n.y,r:l-d*h}:void 0,lead:10*gn(this._plotScale,this._config.flow).line,radius:l}}_drawConsumerFan(){const e=this.renderRoot?.querySelector("svg.fan:not(.pv-fan)");if(!e||!this._config)return;this._fan=this._layer(this._fan,e);const t=this.renderRoot.querySelector(".body"),o=this.renderRoot.querySelector(".node.house"),i=this.renderRoot.querySelector(".rows"),s=[...this.renderRoot.querySelectorAll(".rows .row")];if(!t||!o||!i||0===s.length)return void this._fan.destroy();const n=t.getBoundingClientRect(),r=this._fanRows(s,this._lastEntries,n),a={width:n.width,height:n.height};if(this._stacked){const e=i.getBoundingClientRect();return this._fan.route=void 0,void this._fan.update(r,{x:e.left-n.left,y:e.top+e.height/2-n.top},a,this._animationsWanted)}const l=this._exit(o,r,n,1);this._fan.route=0!==l.dir.y?(e,t)=>Js(e,l.dir,t,l.lead):void 0,this._fan.update(r,l.start,a,this._animationsWanted,l.hole)}_drawSolarFan(){const e=this.renderRoot?.querySelector("svg.pv-fan");if(!e||!this._config)return;this._solarFan=this._layer(this._solarFan,e),this._solarFan.reverse=!0;const t=this.renderRoot.querySelector(".body"),o=this.renderRoot.querySelector(".node.solar"),i=this.renderRoot.querySelector(".node.house"),s=this.renderRoot.querySelector(".pv-rows"),n=[...this.renderRoot.querySelectorAll(".pv-rows .row")];if(!(t&&o&&i&&s&&0!==n.length))return void this._solarFan.destroy();const r=t.getBoundingClientRect(),a=s.parentElement?.classList.contains("pv-side")??!1,l=this._fanRows(n,this._lastSolar,r,a?-1:1),c={width:r.width,height:r.height};if(this._stacked){const e=s.getBoundingClientRect();return this._solarFan.route=void 0,void this._solarFan.update(l,{x:e.left-r.left,y:e.top+e.height/2-r.top},c,this._animationsWanted)}const d=s.parentElement?.classList.contains("pv-side")?-1:1,h=this._exit(o,l,r,d),u=[...this.renderRoot.querySelectorAll(".node:not(.solar)")].map(e=>{const t=e.getBoundingClientRect();return{x:t.left+t.width/2-r.left,y:t.top+t.height/2-r.top,r:t.width/2+14}}),p=i.getBoundingClientRect(),m=p.top+p.height/2-r.top,g=p.right-r.left+16,f=1===d?Math.min(...l.map(e=>e.x)):Math.max(...l.map(e=>e.x)),_=Xs(h.start,l.map(e=>e.y),f,d,u,1===d?(e,t)=>e<g&&t>m-6:void 0,h.dir,h.lead);this._solarFan.route=(e,t)=>en(e,h.dir,_,t,h.lead),this._solarFan.update(l,h.start,c,this._animationsWanted,h.hole)}_pickUpLiveDesigns(){this._designsPickedUp||(this._designsPickedUp=!0,Promise.resolve().then(()=>this.requestUpdate()))}_warnUnknownDesign(e){const t=this._config?.flow.design;!e&&t&&"none"!==t&&this._warnedDesign!==t&&(this._warnedDesign=t,console.warn(`${oo}: flow design "${t}" is not in this build - drawing plain dots.`))}_syncPlayState(){const e="undefined"!=typeof document&&document.hidden;this._visible&&!e?(this._dots?.resume(),this._fan?.resume(),this._solarFan?.resume()):(this._dots?.pause(),this._fan?.pause(),this._solarFan?.pause(),this._ring.stop(),this._solarRing.stop())}willUpdate(){this._rememberPending&&this.isConnected&&(this._rememberPending=!1,this._applyRemembered()),this._rows.capture(this.renderRoot?.querySelector(".body")??null)}updated(){this._ensureHistory(),this._ensureLookups(),this._ensureEnergy(),this._rows.play(this.renderRoot.querySelector(".body"),this._animationsWanted&&this._settled);const e=this._animationsWanted&&"jump"!==this._config?.ring.animation&&this._visible&&!("undefined"!=typeof document&&document.hidden),t=e=>this.renderRoot.querySelector(`.node.${e}`);this._ring.update(t("house")??this.renderRoot,e,this._nodePx);const o=t("solar");if(o&&this._solarRing.update(o,e,this._nodePx),!this._hass||!this._config)return;const i=this.renderRoot.querySelector("g.dots");if(!i)return;const s=this.renderRoot.querySelector(".plot"),n=s?.getBoundingClientRect().width??0,r=wo(this._config.flow.design);this._warnUnknownDesign(void 0!==r);const a=Ts(this,this._config.appearance);"auto"===this._config.appearance?this.removeAttribute("data-appearance"):this.setAttribute("data-appearance",this._config.appearance),n>0&&(this._plotScale=n/Ei);const l=gn(this._plotScale,this._config.flow);this.style.setProperty("--el-line-k",l.line.toFixed(4)),this._dots||(this._dots=new Ks(i,this._technique),n>0&&this._dots.setScale(n/Ei),this._dots.setPathZoom(this._pathZoom),this._measurePathZoom()),this._dots.setDesign(r,a),this._dots.setDotScale(l.dot);const c=this._tickModel??this._model??pi(this._hass,this._config,this._chargeOf,this._solarMemory.values),d=this._dotsMove?co(this._flowsOf(c),this._shownConfig()):[];this._dots.setPaths(this._geometry().paths),this._dots.update(d,this._config,this._animationsWanted);const h=a?r?.dark:r?.light;h?this.style.setProperty("--el-link-opacity",String(h.line/100)):this.style.removeProperty("--el-link-opacity"),this._updateFan(),this._syncPlayState(),this._measure()||(this._settled=!0)}disconnectedCallback(){super.disconnectedCallback(),zn.delete(this),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._intersectionObserver?.disconnect(),this._intersectionObserver=void 0,document.removeEventListener("visibilitychange",this._onVisibility),this.renderRoot.removeEventListener("transitionend",this._onTransitionEnd),this._pause(Date.now()),window.removeEventListener("resize",this._onWindowResize),this._motionQuery?.removeEventListener?.("change",this._onMotionChange),this._motionQuery=void 0,this._dots?.destroy(),this._dots=void 0,this._fanFollow&&cancelAnimationFrame(this._fanFollow),this._fanFollow=void 0,this._fan?.destroy(),this._fan=void 0,this._solarFan?.destroy(),this._solarFan=void 0,this._ring.stop(),this._solarRing.stop(),this._tickTimer&&clearInterval(this._tickTimer),this._tickTimer=void 0}getCardSize(){return 7}getGridOptions(){return{columns:12,min_columns:12,rows:"auto"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Xr}),document.createElement(to)}static getStubConfig(){return{memory_id:Yt(),entities:{...io},icons:{rest:"mdi:cloud-question"}}}render(){if(!this._hass||!this._config)return K;const e=this._modelForMode(this._hass,this._config),t=this._tickModel??e,o=this._shownConfig(),i=function(e,t,o){const i=new Map,s=new Map;for(const e of t.consumers)e.reading.available&&i.set(e.key,e.reading.w),e.charge&&s.set(e.key,ho(e));const n=e.entries.map(e=>e.isRest?e:{...e,w:i.get(e.key)??(e.powerUnknown?0:e.w),powerUnknown:i.has(e.key)?void 0:e.powerUnknown,charge:s.has(e.key)?s.get(e.key):e.charge}),r=n.filter(e=>!e.isRest).reduce((e,t)=>e+t.w,0),a=n.findIndex(e=>e.isRest);if(a>=0){const e=t.house.available?t.house.w-r:n[a].w;n[a]={...n[a],w:Math.max(0,e)}}return{entries:n,segments:po(n,o)}}(mo(t,o,this._showAll),e,o),s=co(this._flowsOf(t),o),n=new Map(s.map(e=>[e.connection,this._config?.colors[e.colorKey]??""]));this._lastEntries=new Map(i.entries.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const r=o.list.solar?function(e,t){const o=new Map;for(const e of t.solarSources)e.reading.available&&o.set(e.key,e.reading.w);return e.map(e=>({...e,w:o.get(e.key)??e.w}))}(fn(t,o,this._showAll),e):[];this._lastSolar=new Map(r.map(e=>[e.key,{w:e.w,color:e.color,threshold:e.threshold}]));const a=this._splitsLists()&&!this._stacked,l=o.view.pvScales.length>0?{segments:_n(e,o,this._pvScale,fn(t,o,!0).map(e=>e.key)),layout:this._pvScale}:void 0,c=(e,t)=>ms(t.currentTarget,e);return H`
      <ha-card translate="no" @hass-more-info=${this._onMoreInfo}>
        ${nn(this._config,this._hass,this._rawConfig?.title,this._mode,this._since,e=>this._setMode(e),this._showAll,()=>this._toggleShowAll(),this._energyChip(this._hass,this._config),this._pvScaleChip(this._hass,this._config))}
        ${!0===this._outage?(d=this._hass,H`<div class="outage-banner" role="status">
    <ha-icon icon="mdi:flash-off"></ha-icon>
    <span>${qe("outage.banner",d)}</span>
  </div>`):K}
        ${this._example?function(e){return H`<div class="example-banner" role="status">
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <span>${qe("example.banner",e)}</span>
  </div>`}(this._hass):K}
        <div
          class="body layout-${this._config.layout.replace("_","-")} ${this._stacked?"stacked":""} ${this._config.list.alwaysBelow||this._stacked&&this._splitsLists()?"force-below":""} ${a?"split":""} ${this._config.list.enabled||r.length>0?"":"no-list"}"
          style=${function(e,t){const o=Ii(e.layout,e.flow.lines,t),i=Object.keys(o.nodePos).filter(e=>"battery"!==e||t),s=e=>"grid"===e||"battery"===e,n=o.viewH/2,r=i.filter(e=>o.labelAbove[e]&&o.nodePos[e].y<n),a=i.filter(e=>!o.labelAbove[e]&&o.nodePos[e].y>n+1),l=Math.max(8,...r.map(t=>26+ks(e,t,s(t))-15)),c=a.length>0?Math.max(8,...a.map(t=>28+ks(e,t,s(t))-30)):28,d=l-26-(c-28);return`--el-pad-top:${l}px;--el-pad-bottom:${c}px;--el-list-mt:${Math.max(0,d)}px;--el-list-mb:${Math.max(0,-d)}px`}(this._config,null!==e.battery)}
        >
          <svg class="fan" aria-hidden="true"></svg>
          <svg class="fan pv-fan" aria-hidden="true"></svg>
          ${a?function(e,t,o,i,s){return 0===s.length?K:H`
    <div class="list pv-side" style="--el-row-h:${ln(dn(e,t,s))}px">
      ${hn(s,t,o,i,!1)}
    </div>
  `}(i,o,this._hass,c,r):K}
          ${Ps(e,o,this._hass,n,this._config.ring.enabled?i.segments:[],this._nodePx,!0===this._outage,this._animationsWanted,this._holeR,this._seeThrough,l)}
          ${cn(i,o,this._hass,c,this._stacked,r,a)}
        </div>
      </ha-card>
    `;var d}}Rn.styles=yn,Rn.properties={hass:{attribute:!1,noAccessor:!0},_model:{state:!0},_showAll:{state:!0},_pvScale:{state:!0},_outage:{state:!0},_scale:{state:!0},_seeThrough:{state:!0}},customElements.get(eo)||customElements.define(eo,Rn);const Ln=window;Ln.customCards=Ln.customCards||[],Ln.customCards.some(e=>e.type===eo)||Ln.customCards.push({type:eo,name:oo,description:"Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",preview:!0,documentationURL:"https://github.com/wawersich/enerlens-card"}),console.info(`%c ${eo.toUpperCase()} %c 1.0.0 · f04d463+ `,"color:#fff;background:#03a9f4;font-weight:700","color:#03a9f4;background:#fff;font-weight:700");const qn=Ki(class extends Ui{constructor(){super(...arguments),this.key=K}render(e,t){return this.key=e,t}update(e,[t,o]){return t!==this.key&&(es(e),this.key=t),o}}),Dn=[{domain:"sensor",device_class:"power"},{domain:"sensor",unit_of_measurement:["W","kW","mW","MW"]}],Tn=[{domain:"sensor",device_class:"battery"},{domain:"sensor",unit_of_measurement:"%"}],On=["solar","grid","house","battery"],In="consumers_slot",Bn="solar_slot";function Hn(e){const t=e.split(".")[0];return"binary_sensor"===t||"input_boolean"===t}const Vn=[{domain:"binary_sensor"},{domain:"input_boolean"},{domain:"sensor"},{domain:"input_select"}];const jn=[...On,"rest"],Kn={solar:["entity","sources","derived"],grid:["entity","split","derived"],house:["entity","derived"],battery:["none","entity","split","derived"]},Un={grid:["grid_import","grid_export"],battery:["battery_discharge","battery_charge"]},Zn={grid:["import","export"],battery:["discharge","charge"]},Qn=["solar","house","grid_import","grid_export","battery_charge","battery_discharge","rest"],Gn="var(--primary-text-color)";function Yn(e,t){if("derived"===t)return"derived";if("solar"===e&&Array.isArray(t))return"sources";if("string"==typeof t&&!(e=>null==e||"string"==typeof e&&""===e.trim())(t))return"entity";if(gr(t)&&"entity"in t)return"entity";const o=Zn[e];return gr(t)&&o&&(o[0]in t||o[1]in t)?"split":"house"===e?"derived":"battery"===e?"none":"entity"}function Jn(e,t,o){const i=Yn(e,t);if(o[`${e}_source`]=i,"sources"===i)return void(o[`${e}_sources`]=t.map(e=>function(e){if("string"==typeof e)return{entity:e,excluded:!1};const{house:t,...o}=e;return{...o,excluded:"excluded"===t}}("string"==typeof e||gr(e)?e:"")));if("string"==typeof t)return void("entity"===i&&(o[e]=t));const s=t;if(!gr(s))return;const n=e=>"string"==typeof e?e:void 0;if("entity"===i)return o[e]=n(s.entity),void(o[`${e}_invert`]=!0===s.invert);const r=Un[e],a=Zn[e];"split"===i&&r&&a&&(o[r[0]]=n(s[a[0]]),o[r[1]]=n(s[a[1]]))}const Xn=["inside","label"],er=(e,t)=>"label"===t||"battery"!==e,tr=e=>"grid"===e||"battery"===e;function or(e,t){return gr(e)?Object.fromEntries(Object.entries(e).filter(([e])=>!t.includes(e))):{}}const ir={inside:["entity","position","decimals","size","weight"],label:["entity","prefix","decimals","size","weight"]},sr=["show_name","show_state","inside","label"];function nr(e,t,o,i){const s=`node_${t}_${o}_`,n=e[`${s}entity`];if(!lr(n))return;const r=e[`${s}decimals`],a=e[`${s}prefix`],l=e[`${s}weight`];return fr({...or(i,ir[o]),entity:n,..."inside"===o?{position:"below"===e[`${s}position`]?"below":void 0}:{prefix:lr(a)?a:void 0},decimals:lr(r)&&"ha"!==r?/^\d$/.test(r)?Number(r):r:void 0,size:ur(e[`${s}size`]),weight:lr(l)&&"normal"!==l?l:void 0})}function rr(e,t){const o={};for(const i of On)for(const s of Xn){if(!er(i,s))continue;const n=("battery"!==i||t)&&lr(e[`node_${i}_${s}_entity`]);o[`${i}_${s}`]=n?e[`color_${i}_${s}`]:void 0}return o.battery_inside=void 0,o}function ar(e){const t=e.entities??{},o=t.grid_status,i="object"==typeof o&&null!==o?o:void 0,s={title:e.title,layout:e.layout,flow_lines:e.flow?.lines,battery_soc:t.battery_soc,grid_status:"string"==typeof o?o:i?.entity,grid_status_outage:i?.outage,grid_status_ok:i?.ok,consumers:e.consumers,max_consumers:e.max_consumers,min_consumer_w:e.min_consumer_w,update_interval_s:e.update_interval_s,rest_label:e.list?.rest_label,appearance:e.appearance,list_enabled:e.list?.enabled,list_always_below:e.list?.always_below,ring_enabled:e.ring?.enabled,ring_animation:e.ring?.animation,power_unit:e.power?.unit,power_decimals:e.power?.decimals,power_digits:e.power?.digits,modes:_r(e.view?.modes),default_mode:e.view?.default_mode,avg_short_minutes:e.view?.avg_short_minutes,avg_long_minutes:e.view?.avg_long_minutes,energy_periods:_r(e.view?.energy_periods),default_energy:e.view?.default_energy,scope:_r(e.list?.scope),default_scope:e.list?.default_scope,inactive_lines:e.flow?.inactive_lines,animation:e.flow?.animation,design:e.flow?.design,dot_color:e.flow?.dot_color,dot_size:e.flow?.dot_size??100,line_width:e.flow?.line_width??100,min_w:e.flow?.min_w,peak_w:e.flow?.peak_w,slow_below_w:e.flow?.slow_below_w,full_speed_w:e.flow?.full_speed_w,more_dots_above_w:e.flow?.more_dots_above_w,max_dots_at_w:e.flow?.max_dots_at_w,max_dots:e.flow?.max_dots,slow_s:e.flow?.slow_s,fast_s:e.flow?.fast_s};for(const e of On)Jn(e,t[e],s);s.pv_scales=_r(e.view?.pv_scales),s.quick_style=e.view?.quick_style;const n=Sr(e.view?.expanded);for(const e of kr)s[`expanded_${e}`]=!!n.includes(e)||void 0;s.default_pv_scale=e.view?.default_pv_scale,s.list_solar=e.list?.solar,s.ring_solar=e.ring?.solar;const r=e.colors??{};for(const e of Qn)s[`color_${e}`]=r[e];s.soc_stops=r.soc_stops,function(e,t){const o=e.colors??{};for(const i of On){const s=e.nodes?.[i]??{},n=`node_${i}_`;t[`${n}show_name`]=!1!==s.show_name,tr(i)&&(t[`${n}show_state`]=!1!==s.show_state);for(const e of Xn){if(!er(i,e))continue;const r=gr(s[e])?s[e]:{},a=`${n}${e}_`;t[`${a}entity`]=r.entity,"inside"===e?t[`${a}position`]=r.position??"above":t[`${a}prefix`]=r.prefix,t[`${a}decimals`]=void 0===r.decimals||null===r.decimals||""===r.decimals?"ha":String(r.decimals),t[`${a}size`]=r.size??100,t[`${a}weight`]=r.weight??"normal",t[`color_${i}_${e}`]=o[`${i}_${e}`]}}}(e,s);const a=e.icons??{};for(const e of jn)s[`icon_${e}`]=a[e];return s}const lr=e=>"string"==typeof e&&""!==e.trim();function cr(e,t){switch(t[`${e}_source`]??Yn(e,void 0)){case"none":return;case"derived":return"house"===e?void 0:"derived";case"entity":{const o=t[e];if(!lr(o))return;return!0===t[`${e}_invert`]?{entity:o,invert:!0}:o}case"sources":return function(e){if(!Array.isArray(e))return;const t=e.flatMap(e=>{const t="string"==typeof e?{entity:e}:gr(e)?e:{};if(!lr(t.entity))return[];const{excluded:o,...i}=t;return[fr({...i,kwp:hr(i.kwp),invert:!0===i.invert||void 0,house:!0===o?"excluded":void 0})]});return 0!==t.length?1===t.length&&1===Object.keys(t[0]).length?t[0].entity:t:void 0}(t[`${e}_sources`]);case"split":{const o=Un[e],i=Zn[e];if(!o||!i)return;const s=t[o[0]],n=t[o[1]];if(!lr(s)||!lr(n))return;return{[i[0]]:s,[i[1]]:n}}}}const dr=e=>null===e||""===e?void 0:e;function hr(e){return"number"==typeof e&&Number.isFinite(e)?e:void 0}function ur(e){const t=hr(e);return 100===t?void 0:t}function pr(e){if(!Array.isArray(e))return;const t=e.filter(e=>"string"==typeof e&&""!==e.trim());return t.length?t:void 0}function mr(e){if(!gr(e))return;const t=e=>lr(e)?e:void 0,o="plugged"===e.show?t(e.plugged):void 0,i=fr({...or(e,["soc","show","plugged","unplugged"]),soc:t(e.soc),show:t(e.show),plugged:o,unplugged:o&&!Hn(o)?pr(e.unplugged):void 0});return i&&lr(i.soc)?i:void 0}const gr=e=>"object"==typeof e&&null!==e&&!Array.isArray(e);function fr(e){const t={};for(const[o,i]of Object.entries(e))null!=i&&""!==i&&(t[o]=i);return Object.keys(t).length?t:void 0}function _r(e){return Array.isArray(e)?e.filter(e=>"string"==typeof e):void 0}function wr(e,t){if(!Array.isArray(e))return;const o=t.filter(t=>e.includes(t));return o.length>0?o:void 0}function yr(e,t,o){if("string"!=typeof e)return;const i=wr(t,o);return void 0===i||i.includes(e)?e:void 0}function vr(e){return"derived"!==e.grid_source&&"derived"!==e.battery_source}const br=["flow_lines","inactive_lines","animation","design","dot_color","dot_size","line_width","min_w","peak_w","slow_below_w","full_speed_w","more_dots_above_w","max_dots_at_w","max_dots","slow_s","fast_s"],xr=["quick_style","expanded_modes","expanded_energy_periods","expanded_pv_scales","expanded_scope","modes","default_mode","avg_short_minutes","avg_long_minutes","energy_periods","default_energy","pv_scales","default_pv_scale"],kr=["modes","energy_periods","pv_scales","scope"],$r=["segment","segment_compact","single"];function Sr(e){return Array.isArray(e)?e:null==e||""===e?[]:[e]}function Ar(e,t){const o=new Set(kr),i=[...kr.filter(t=>!0===e[`expanded_${t}`]),...Sr(t).filter(e=>!o.has(e))];return i.length>0?i:void 0}const Mr=["current","avg_short","avg_long"],Er=["power","today","24h","week","7d","month","30d"],Cr=["filtered","full"],zr=["share","peak"],Pr={modes:Mr,energy_periods:Er,scope:Cr},Wr=["power","today","24h","week"],Nr=["title","layout","max_consumers","min_consumer_w","update_interval_s","appearance"];function Fr(e){if(Nr.includes(e)||"consumers"===e)return e;if("battery_soc"===e)return"entities.battery_soc";if(e.startsWith("grid_status"))return"entities.grid_status";for(const t of On){if(e===t||e===`${t}_source`||e===`${t}_sources`||e===`${t}_invert`||(Un[t]??[]).includes(e))return`entities.${t}`}return"rest_label"===e||e.startsWith("list_")||"scope"===e||"default_scope"===e?"list":e.startsWith("ring_")?"ring":e.startsWith("power_")?"power":xr.includes(e)?"view":br.includes(e)?"flow":e.startsWith("color_")||"soc_stops"===e?"colors":e.startsWith("node_")?"nodes":e.startsWith("icon_")?"icons":void 0}const Rr={"entities.battery_soc":["entities.battery"],nodes:["entities.battery"],colors:["entities.battery","nodes"]};function Lr(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,o)=>Lr(e,t[o]));if(gr(e)&&gr(t)){return[...new Set([...Object.keys(e),...Object.keys(t)])].every(o=>Lr(e[o],t[o]))}return!1}function qr(e){if(null!==e&&("string"!=typeof e||""!==e.trim())){if(Array.isArray(e)){const t=e.map(qr).filter(e=>void 0!==e);return t.length?t:void 0}if(gr(e)){const t={};for(const[o,i]of Object.entries(e)){const e=qr(i);void 0!==e&&(t[o]=e)}return Object.keys(t).length?t:void 0}return e}}const Dr=e=>gr(e)?e:{};function Tr(e,t){const o=e,i=function(e,t){const o=new Set;for(const i of new Set([...Object.keys(e),...Object.keys(t)])){const s=Fr(i);s&&!Lr(e[i],t[i])&&o.add(s)}for(const[e,t]of Object.entries(Rr))t.some(e=>o.has(e))&&o.add(e);return o}(o,ar(t)),s=t,n=Dr(t.entities),r=(e,t,o)=>i.has(e)?t():qr(o),a={...n};for(const e of On)a[e]=r(`entities.${e}`,()=>cr(e,o),n[e]);const l=void 0!==a.battery;a.battery_soc=r("entities.battery_soc",()=>l?dr(e.battery_soc):void 0,n.battery_soc),a.grid_status=r("entities.grid_status",()=>{const t=dr(e.grid_status);return t?fr({...or(n.grid_status,["entity","outage","ok"]),entity:t,outage:pr(e.grid_status_outage),ok:pr(e.grid_status_ok)}):void 0},n.grid_status);const c=[...On,"battery_soc","grid_status"].map(e=>`entities.${e}`),d=gr(t.entities)||c.some(e=>i.has(e))?fr(a):qr(t.entities);return{...t,type:t.type,title:r("title",()=>dr(e.title),s.title),entities:d,consumers:r("consumers",()=>function(e){if(!Array.isArray(e))return;const t=new Set,o=[];for(const i of e){if(!gr(i))continue;const e=fr({...i,charge:mr(i.charge)}),s=e?.entity;e&&"string"==typeof s&&!t.has(s)&&(t.add(s),o.push(e))}return o.length?o:void 0}(e.consumers),s.consumers),max_consumers:r("max_consumers",()=>hr(e.max_consumers),s.max_consumers),min_consumer_w:r("min_consumer_w",()=>hr(e.min_consumer_w),s.min_consumer_w),update_interval_s:r("update_interval_s",()=>hr(e.update_interval_s),s.update_interval_s),appearance:r("appearance",()=>dr(e.appearance),s.appearance),layout:r("layout",()=>dr(e.layout),s.layout),list:r("list",()=>fr({...or(s.list,["enabled","rest_label","always_below","scope","default_scope","solar"]),enabled:e.list_enabled,solar:e.list_solar,rest_label:e.rest_label,always_below:e.list_always_below,scope:wr(e.scope,Cr),default_scope:yr(e.default_scope,e.scope,Cr)}),s.list),ring:r("ring",()=>fr({...or(s.ring,["enabled","animation","solar"]),enabled:e.ring_enabled,solar:e.ring_solar,animation:dr(e.ring_animation)}),s.ring),power:r("power",()=>fr({...or(s.power,["unit","decimals","digits"]),unit:dr(e.power_unit),decimals:hr(e.power_decimals),digits:hr(e.power_digits)}),s.power),view:r("view",()=>fr({...or(s.view,["modes","default_mode","avg_short_minutes","avg_long_minutes","show_selector","energy_periods","default_energy","pv_scales","default_pv_scale","quick_style","expanded"]),quick_style:dr(e.quick_style),expanded:Ar(e,gr(s.view)?s.view.expanded:void 0),modes:wr(e.modes,Mr),default_mode:yr(e.default_mode,e.modes,Mr),avg_short_minutes:hr(e.avg_short_minutes),avg_long_minutes:hr(e.avg_long_minutes),energy_periods:wr(e.energy_periods,Er),default_energy:yr(e.default_energy,e.energy_periods,Er),pv_scales:wr(e.pv_scales,zr),default_pv_scale:yr(e.default_pv_scale,e.pv_scales,zr)}),s.view),flow:r("flow",()=>fr({...Dr(t.flow),lines:e.flow_lines,inactive_lines:e.inactive_lines,animation:e.animation,design:e.design,dot_color:dr(e.dot_color),dot_size:ur(e.dot_size),line_width:ur(e.line_width),min_w:hr(e.min_w),peak_w:hr(e.peak_w),slow_below_w:hr(e.slow_below_w),full_speed_w:hr(e.full_speed_w),more_dots_above_w:hr(e.more_dots_above_w),max_dots_at_w:hr(e.max_dots_at_w),max_dots:hr(e.max_dots),slow_s:hr(e.slow_s),fast_s:hr(e.fast_s)}),s.flow),colors:r("colors",()=>fr({...Dr(t.colors),...Object.fromEntries(Qn.map(e=>[e,o[`color_${e}`]])),...void 0!==o.soc_stops?{soc_stops:o.soc_stops}:{},...rr(o,l)}),s.colors),nodes:r("nodes",()=>function(e,t,o){const i=or(o,On);for(const s of On){if("battery"===s&&!t)continue;const n=`node_${s}_`,r=gr(o)?o[s]:void 0,a=gr(r)?r:{},l=fr({...or(a,sr),show_name:!1!==e[`${n}show_name`]&&void 0,show_state:(!tr(s)||!1!==e[`${n}show_state`])&&void 0,inside:er(s,"inside")?nr(e,s,"inside",a.inside):void 0,label:nr(e,s,"label",a.label)});l&&(i[s]=l)}return fr(i)}(o,l,t.nodes),s.nodes),icons:r("icons",()=>fr({...or(s.icons,jn),...Object.fromEntries(jn.map(e=>[e,o[`icon_${e}`]]))}),s.icons)}}function Or(e){return{select:{mode:"dropdown",options:["ha","0","1","2","3","sig2","sig3","sig4"].map(t=>({value:t,label:e(`decimals_${t}`)}))}}}function Ir(e){return{select:{mode:"dropdown",options:["normal","medium","bold"].map(t=>({value:t,label:e(`weight_${t}`)}))}}}const Br={name:"colors_hint",type:"constant"};function Hr(e){const{min:t,max:o}=ft[e];return void 0===o?{min:t}:{min:t,max:o}}const Vr=new Set(Object.keys(ft).map(e=>jr(e)).filter(e=>void 0!==e));function jr(e){return e.startsWith("view.")||e.startsWith("flow.")?e.slice(5):e.startsWith("power.")?e.replace(".","_"):e.includes(".")||e.includes("[")?void 0:e}function Kr(e){const t=e.schema;return t?t.flatMap(Kr):"string"==typeof e.name?[e.name]:[]}const Ur={current:"mode_current",avg_short:"mode_short",avg_long:"mode_long"};function Zr(e){const t=vr(e)?wr(e.energy_periods,Er)??Wr:["power"];return{modes:wr(e.modes,Mr)??Mr,energy_periods:t,scope:wr(e.scope,Cr)??Cr}}function Qr(e){const t=Array.isArray(e.consumers)&&e.consumers.some(e=>gr(e)&&lr(e.entity)),o=(e,t)=>null==e||""===e?t:e,i=o(e.layout,"cross");return{list_enabled:o(e.list_enabled,t),ring_enabled:o(e.ring_enabled,t),ring_solar:o(e.ring_solar,!0),quick_style:o(e.quick_style,"segment"),layout:i,flow_lines:o(e.flow_lines,"cross"===i?"curved":"straight"),appearance:o(e.appearance,"auto"),ring_animation:o(e.ring_animation,"overtake"),power_unit:o(e.power_unit,"kW"),power_decimals:o(e.power_decimals,2),power_digits:o(e.power_digits,3),inactive_lines:o(e.inactive_lines,"show"),animation:o(e.animation,"auto"),design:o(e.design,fo)}}function Gr(e,t,o){return t.map(t=>({value:t,label:o(t),...1===e.length&&e[0]===t?{disabled:!0}:{}}))}function Yr(e,t){const o=t=>qe(`editor.${t}`,e),i=Zr(t),s=i.energy_periods.includes("power"),n=Array.isArray(t.consumers)&&t.consumers.length>0,r=On.filter(e=>"derived"===t[`${e}_source`]),a="sources"===t.solar_source,l=(Array.isArray(t.solar_sources)?t.solar_sources:[]).filter(e=>gr(e)&&lr(e.entity)),c=l.length>1,d=l.length>0&&l.every(e=>void 0!==hr(e.kwp)),h=(wr(t.pv_scales,zr)??zr).filter(e=>"share"===e?c:d),u=On.map(i=>{const s=function(e,t,o,i){const s=t[`${e}_source`]??Yn(e,void 0),n=Kn[e].filter(e=>"derived"!==e||!o||"derived"===s).map(t=>({value:t,label:i("split"===t?`source_split_${e}`:`source_${t}`)})),r=[{name:`${e}_source`,selector:{select:{mode:"dropdown",options:n}}}];if("entity"===s)r.push({type:"grid",name:"",schema:[{name:e,selector:{entity:{filter:Dn}}},{name:`${e}_invert`,selector:{boolean:{}}}]});else if("split"===s)for(const t of Un[e]??[])r.push({name:t,selector:{entity:{filter:Dn}}});return r}(i,t,r.some(e=>e!==i),o);return"battery"===i&&"none"!==t.battery_source&&s.push({name:"battery_soc",selector:{entity:{filter:Tn}}}),{name:`entities_${i}`,type:"expandable",flatten:!0,title:qe(`node.${i}`,e),schema:s}}),p="string"==typeof t.grid_status?t.grid_status:void 0,m=p?e.states?.[p]?.attributes.options:void 0,g={select:{multiple:!0,custom_value:!0,mode:"list",options:(Array.isArray(m)?m:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e}))}};return[{name:"title",selector:{text:{}}},{name:"entities",type:"expandable",flatten:!0,title:o("entities"),schema:[...u,Br]},...a?[{name:Bn,type:"constant"}]:[],{name:"nodes",type:"expandable",flatten:!0,title:o("nodes"),schema:[...On.filter(e=>"battery"!==e||"none"!==t.battery_source).map(i=>function(e,t,o,i){const s=`node_${e}_`,n=[{name:`${s}show_name`,selector:{boolean:{}}}];tr(e)&&n.push({name:`${s}show_state`,selector:{boolean:{}}});for(const o of Xn){if(!er(e,o))continue;const r=`${s}${o}_`;n.push({name:`${r}entity`,selector:{entity:{}}}),lr(t[`${r}entity`])&&("inside"===o?n.push({name:`${r}position`,selector:{select:{mode:"dropdown",options:[{value:"above",label:i("position_above")},{value:"below",label:i("position_below")}]}}}):n.push({name:`${r}prefix`,selector:{text:{}}}),n.push({name:`${r}decimals`,selector:Or(i)},{name:`${r}size`,selector:{number:{min:60,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:`${r}weight`,selector:Ir(i)}))}return{name:`node_${e}`,type:"expandable",flatten:!0,title:qe(`node.${e}`,o),schema:n}}(i,t,e,o)),Br]},{name:In,type:"constant"},{name:"grid_status",type:"expandable",flatten:!0,title:o("grid_status_section"),schema:[{name:"grid_status",selector:{entity:{}}},{name:"grid_status_outage",selector:g},{name:"grid_status_ok",selector:g}]},{name:"display",type:"expandable",flatten:!0,title:o("display"),schema:[{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"cross",label:o("layout_cross")},{value:"square_right",label:o("layout_square_right")},{value:"square_left",label:o("layout_square_left")},{value:"triangle",label:o("layout_triangle")}]}}},{name:"flow_lines",selector:{select:{mode:"dropdown",options:[{value:"curved",label:o("lines_curved")},{value:"straight",label:o("lines_straight")}]}}},{name:"appearance",selector:{select:{mode:"dropdown",options:[{value:"auto",label:o("appearance_auto")},{value:"light",label:o("appearance_light")},{value:"dark",label:o("appearance_dark")}]}}},{name:"list_enabled",selector:{boolean:{}}},...a?[{name:"list_solar",selector:{boolean:{}}}]:[],{name:"list_always_below",selector:{boolean:{}}},{name:"ring_enabled",selector:{boolean:{}}},...a?[{name:"ring_solar",selector:{boolean:{}}}]:[],{name:"ring_animation",selector:{select:{mode:"dropdown",options:[{value:"overtake",label:o("ring_overtake")},{value:"fade",label:o("ring_fade")},{value:"jump",label:o("ring_jump")}]}}},{name:"max_consumers",selector:{number:{...Hr("max_consumers"),mode:"box"}}},{name:"min_consumer_w",selector:{number:{...Hr("min_consumer_w"),mode:"box"}}},{name:"rest_label",selector:{text:{}}},{name:"power_unit",selector:{select:{mode:"dropdown",options:[{value:"auto",label:o("power_auto")},{value:"kW",label:o("power_kw")},{value:"W",label:o("power_w")}]}}},..."auto"===t.power_unit?[{name:"power_digits",selector:{select:{mode:"dropdown",options:[{value:2,label:"2"},{value:3,label:"3"},{value:4,label:"4"}]}}}]:[],..."W"===t.power_unit||"auto"===t.power_unit?[]:[{name:"power_decimals",selector:{select:{mode:"dropdown",options:[{value:1,label:"1"},{value:2,label:"2"},{value:3,label:"3"}]}}}],{name:"update_interval_s",selector:{number:{...Hr("update_interval_s"),mode:"box"}}}]},(()=>{const r=(e,t,o=!1)=>t.length>1?[{name:`expanded_${e}`,disabled:o,selector:{boolean:{}}}]:[],l=[{name:"quick_style",selector:{select:{mode:"dropdown",options:$r.map(e=>({value:e,label:o(`quick_style_${e}`)}))}}}],u=[{name:"modes",disabled:!s,selector:{select:{multiple:!0,mode:"list",options:Gr(i.modes,Mr,e=>o(Ur[e]))}}},{name:"avg_short_minutes",disabled:!s,selector:{number:{...Hr("view.avg_short_minutes"),mode:"box"}}},{name:"avg_long_minutes",disabled:!s,selector:{number:{...Hr("view.avg_long_minutes"),mode:"box"}}},...r("modes",i.modes,!s)],p=[{name:"energy_periods",disabled:!vr(t),selector:{select:{multiple:!0,mode:"list",options:Gr(i.energy_periods,Er,e=>o(`energy_${e}`))}}},...r("energy_periods",i.energy_periods,!vr(t))],m=n?[{name:"scope",selector:{select:{multiple:!0,mode:"list",options:Gr(i.scope,Cr,e=>o(`scope_${e}`))}}},...r("scope",i.scope)]:[],g=!1!==t.ring_solar,f=a&&g&&(c||d),_=f?[{name:"pv_scales",selector:{select:{multiple:!0,mode:"list",options:Gr(h,zr,e=>o(`pv_scale_${e}`)).map(e=>"share"===e.value&&!c||"peak"===e.value&&!d?{...e,disabled:!0}:e)}}},...r("pv_scales",h.filter(e=>"share"===e?c:d))]:[],w=f?d?c?void 0:qe("editor_help.pv_scale_share_locked",e):qe("editor_help.pv_scale_peak_locked",e):void 0;return{name:"quick_buttons",type:"expandable",flatten:!0,title:o("quick_buttons"),schema:[...l,...u,...p,..._,...m],parts:[{title:o("group_quick_style"),schema:l},{title:o("group_smoothing"),notice:s?void 0:qe("editor_help.modes_locked",e),schema:u},{title:o("group_energy"),schema:p},...f?[{title:o("group_pv_scale"),notice:w,schema:_}]:[],...n?[{title:o("group_scope"),schema:m}]:[]]}})(),{name:"flow",type:"expandable",flatten:!0,title:o("flow"),schema:[{name:"min_w",selector:{number:{...Hr("flow.min_w"),mode:"box"}}},{name:"peak_w",selector:{number:{...Hr("flow.peak_w"),mode:"box"}}},{name:"inactive_lines",selector:{select:{mode:"dropdown",options:[{value:"show",label:o("lines_show")},{value:"dim",label:o("lines_dim")},{value:"hide",label:o("lines_hide")}]}}},{name:"animation",selector:{select:{mode:"dropdown",options:[{value:"auto",label:o("anim_auto")},{value:"on",label:o("anim_on")},{value:"off",label:o("anim_off")}]}}},{name:"design",selector:{select:{mode:"dropdown",options:[{value:fo,label:o("design_none")},..._o.map(t=>({value:t.id,label:yo(t,e)}))]}}},{name:"dot_size",selector:{number:{...Hr("flow.dot_size"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"line_width",selector:{number:{...Hr("flow.line_width"),step:1,mode:"slider",unit_of_measurement:"%"}}},{name:"flow_fine",type:"expandable",flatten:!0,title:o("flow_fine"),schema:[{name:"slow_below_w",selector:{number:{...Hr("flow.slow_below_w"),mode:"box"}}},{name:"full_speed_w",selector:{number:{...Hr("flow.full_speed_w"),mode:"box"}}},{name:"more_dots_above_w",selector:{number:{...Hr("flow.more_dots_above_w"),mode:"box"}}},{name:"max_dots_at_w",selector:{number:{...Hr("flow.max_dots_at_w"),mode:"box"}}},{name:"max_dots",selector:{number:{...Hr("flow.max_dots"),mode:"box"}}},{name:"slow_s",selector:{number:{...Hr("flow.slow_s"),step:.1,mode:"box"}}},{name:"fast_s",selector:{number:{...Hr("flow.fast_s"),step:.1,mode:"box"}}}]}]},{name:"icons",type:"expandable",flatten:!0,title:o("icons"),schema:jn.map(e=>({name:`icon_${e}`,selector:{icon:{}}}))}]}class Jr extends ce{constructor(){super(...arguments),this._openColors=new Set,this._pickerMode="hex",this._consumerKeys=[],this._nextConsumerKey=0,this._openConsumers=new Set,this._builtSections=new Set,this._builtConsumers=new Set,this._label=e=>{const t=e.name,o=/^node_(?:solar|grid|house|battery)_(.+)$/.exec(t);return o?qe(`editor.node_${o[1]}`,this.hass):"grid_status"===t?qe("editor.grid_status",this.hass):t.endsWith("_source")?qe(`editor.${t.replace(/_source$/,"")}`,this.hass):t.endsWith("_invert")?qe("editor.invert",this.hass):t.startsWith("icon_")?qe(`editor.${t.slice(5)}`,this.hass):On.includes(t)?qe("editor.entity",this.hass):qe(`editor.${t}`,this.hass)},this._helper=e=>{if("grid_status"===e.name)return"";const t=this._flat??{};if("energy_periods"===e.name&&!vr(t))return qe("editor_help.energy_periods_locked",this.hass);let o=`editor_help.${e.name.replace(/^node_(?:solar|grid|house|battery)_/,"node_")}`;if(e.name.startsWith("color_")&&(o="editor_help.color"),e.name.endsWith("_source")){if("derived"!==(this._flat??{})[e.name])return"";o="editor_help.derived"}const i=qe(o,this.hass);return i===o?"":i},this._probe=e=>{const t=this.shadowRoot;if(!t||"undefined"==typeof getComputedStyle)return"";const o=document.createElement("span");if(o.style.display="none",o.style.color=e,""===o.style.color)return"";t.appendChild(o);const i=getComputedStyle(o).color;return o.remove(),i},this._hexTyped=e=>{const t=e.target,o=Ce(t.value);o&&this._picker?(this._picker={id:this._picker.id,hsv:ze(o,this._picker.hsv.h)},this._applyColor(this._picker.id,o)):this._picker&&(t.value=Pe(this._picker.hsv))},this._addStop=()=>{const e=this._socStops();if(!e)return;const t=e.length-1;let o=50,i=t,s=-1;for(let n=1;n<=t;n++){const t=e[n].at-e[n-1].at;t>s&&(s=t,i=n,o=Math.round((e[n].at+e[n-1].at)/2))}const n=[...e];n.splice(i,0,{at:o,color:e[i].color}),this._writeStops(n)},this._notes=new Map,this._sourceLabel=e=>qe(`editor.pv_source_${e.name}`,this.hass),this._sourceHelper=e=>{const t=`editor_help.pv_source_${e.name}`,o=qe(t,this.hass);return o===t?"":o},this._consumerLabel=e=>{const t=`editor.consumer_${e.name}`,o=qe(t,this.hass);return o===t?qe(`editor.${e.name}`,this.hass):o},this._consumerHelper=e=>{const t=`editor_help.consumer_${e.name}`,o=qe(t,this.hass);return o===t?"":o},this._addConsumer=()=>{const e=[...this._consumerRows(),{}],t=[...this._keysFor(e.length-1),this._nextConsumerKey++];this._openConsumers=new Set([...this._openConsumers,t[t.length-1]]),this._builtConsumers=new Set([...this._builtConsumers,t[t.length-1]]),this._writeConsumers(e,t)},this._moveConsumer=e=>{e.stopPropagation(),this._moveTo(e.detail.oldIndex,e.detail.newIndex)}}setConfig(e){this._config=e,void 0!==this._flat&&JSON.stringify(e)===this._emitted||(this._flat=ar(e),this._consumerKeys=[],this._openConsumers=new Set),queueMicrotask(()=>this._fixOnOpen(e))}connectedCallback(){super.connectedCallback();const e=this._config;e&&queueMicrotask(()=>this._fixOnOpen(e))}_fixOnOpen(e){if(this._config!==e||this._fixedFor===e||!this.isConnected)return;this._fixedFor=e;let t=function(e){const t=e.view;if(!gr(t)||!1!==t.show_selector)return;let o;try{o=Gt(e)}catch{return}const{show_selector:i,...s}=t,n={...e,view:{...s,modes:o.view.modes,energy_periods:wr(s.energy_periods,Er)??(o.view.power?["power"]:o.view.energyPeriods)}};return o.consumers.length>0&&(n.list={...e.list??{},scope:o.list.scope}),o.view.pvScales.length>0&&(n.view.pv_scales=o.view.pvScales),n}(e);const o=Xt(e.memory_id);if((void 0===o||this._twiceInDashboard(o))&&(t={...t??e,memory_id:Yt()}),!t)return;const i=t;this._config=i,this._fixedFor=i,this._flat=ar(i),this._emitted=JSON.stringify(i),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0})),this.requestUpdate()}_twiceInDashboard(e){let t=this;for(;t;){const o=t.lovelace?.config;if(o){return Jt(o.views).filter(t=>Xt(t.memory_id)===e).length>1}t=t.parentNode??(t instanceof ShadowRoot?t.host:null)}return!1}_shownFlat(){const e=this._flat??{};return this._shown?.from!==e&&(this._shown={from:e,data:{...e,...Zr(e),...Qr(e)}}),this._shown.data}_valueChanged(e){const t={...e.detail.value},o=this._flat??{},i=Zr(o);for(const e of["modes","energy_periods","scope"]){!(void 0!==wr(o[e],Pr[e]))&&Lr(t[e],i[e])&&(t[e]=void 0)}const s=Qr(o);for(const[e,i]of Object.entries(s)){(void 0===o[e]||null===o[e]||""===o[e])&&Lr(t[e],i)&&(t[e]=void 0)}this._emit(t)}_emit(e){if(!this._config)return;this._flat=e;const t=Tr(e,this._config);this._emitted=JSON.stringify(t),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_setColor(e,t){if(!this._flat)return;const o=""===t.trim()?void 0:t;this._emit({...this._flat,[`color_${e}`]:o})}_renderColors(){return H`
      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">${(e=>qe(`editor.${e}`,this.hass))("colors")}</div>
        <div class="colors">
          ${this._picker?H`<div
                  class="scrim"
                  @pointerdown=${e=>{e.stopPropagation(),this._picker=void 0}}
                ></div>`:""}
          <p class="hint">${qe("editor_help.color",this.hass)}</p>
          ${Qn.map(e=>this._renderNodeColor(e))}
          ${this._renderExtraColors()}
          ${this._renderDotColor()} ${this._renderConsumerColors()} ${this._renderSocStops()}
        </div>
      </ha-expansion-panel>
    `}_renderExtraColors(){const e=this._flat??{},t=[];for(const o of On)if("battery"!==o||"none"!==e.battery_source)for(const i of Xn){if(!er(o,i)||!lr(e[`node_${o}_${i}_entity`]))continue;const s=`color_${o}_${i}`,n=e[s],r=qe(`editor.color_extra_${i}`,this.hass,{node:qe(`node.${o}`,this.hass)});t.push(this._colorRow({id:`flat:${s}`,label:r,name:r,value:"string"==typeof n?n:"",preset:"var(--secondary-text-color)"}))}return t.length?H`${this._group(qe("editor.colors_extras",this.hass))}${t}`:""}_group(e){return H`<p class="group">${e}</p>`}_renderNodeColor(e){const t=this._flat?.[`color_${e}`],o=qe(`editor.color_${e}`,this.hass);return this._colorRow({id:`node:${e}`,label:o,name:o,value:"string"==typeof t?t:"",preset:ve[e]})}_renderDotColor(){const e=this._flat?.dot_color,t="string"==typeof e&&""!==e.trim(),o=qe("editor.dot_color",this.hass);return H`
      ${this._group(qe("editor.colors_dots",this.hass))}
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!t}
          @change=${o=>{const i=o.target.checked;i&&t&&(this._lastDotColor=e),this._setFlat("dot_color",i?"":this._lastDotColor??Gn)}}
        />
        <span>${qe("editor.dot_color_follow",this.hass)}</span>
      </label>
      ${t?this._colorRow({id:"flat:dot_color",label:o,name:o,value:e,preset:Gn}):K}
    `}_renderConsumerColors(){const e=this._flat?.consumers,t=(Array.isArray(e)?e:[]).map((e,t)=>({entry:e,index:t})).filter(e=>gr(e.entry));if(0===t.length)return H``;const o=xe;return H`
      ${this._group(qe("editor.colors_consumers",this.hass))}
      ${t.map(({entry:e,index:t})=>{const i="string"==typeof e.name&&e.name.trim()||("string"==typeof e.entity?e.entity:`#${t+1}`);return this._colorRow({id:`consumer:${t}`,label:i,name:i,value:"string"==typeof e.color?e.color:"",preset:o[t%o.length]})})}
    `}_renderSocStops(){const e=this._socStops();if(!e)return H`
        ${this._group(qe("editor.colors_soc",this.hass))}
        <p class="hint">${qe("editor.yaml_only",this.hass)}</p>
      `;const t=e.length-1;return H`
      ${this._group(qe("editor.colors_soc",this.hass))}
      ${e.map((e,o)=>{const i=0===o||o===t;return this._colorRow({id:`stop:${o}`,label:`${e.at} %`,name:H`
            <span class="at">
              ${i?H`<span class="fixed">${e.at}</span>`:H`<input
                      class="percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      .value=${String(e.at)}
                      aria-label=${qe("editor.color_at",this.hass)}
                      @change=${e=>this._setStopAt(o,Number(e.target.value))}
                    />`}
              <span class="unit">%</span>
            </span>
          `,value:e.color,preset:e.color,trail:i?void 0:H`<button
                class="reset"
                title=${qe("editor.color_remove",this.hass)}
                aria-label=${qe("editor.color_remove",this.hass)}
                @click=${()=>this._removeStop(o)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>`})})}
      <button class="add" @click=${this._addStop}>
        <ha-icon icon="mdi:plus"></ha-icon>${qe("editor.color_add_stop",this.hass)}
      </button>
    `}_colorRow(e){const{id:t,label:o,name:i,value:s,preset:n,trail:r}=e,a=this._openColors.has(t),l=this._picker?.id===t,c=`color-field-${t.replace(":","-")}`,d=l?Pe(this._picker.hsv):Ce(s||n,this._probe)??"#888888";return H`
      <div class="color ${a?"open":""} ${l?"picking":""}">
        <div class="head">
          <button
            class="swatch"
            data-key=${t}
            style="background:${d}"
            aria-label=${`${o} - ${qe("editor.color_pick",this.hass)}`}
            aria-haspopup="dialog"
            aria-expanded=${l?"true":"false"}
            @click=${()=>this._togglePicker(t,d)}
          ></button>
          <span class="name">${i}</span>
          <span class="css">${s||qe("editor.color_default",this.hass)}</span>
          <button
            class="more"
            aria-expanded=${a?"true":"false"}
            aria-controls=${c}
            @click=${()=>this._toggleColor(t)}
          >
            ${qe("editor.color_css",this.hass)} ${a?"▴":"▾"}
          </button>
          ${r??""}
        </div>
        ${l?this._renderPicker(d):""}
        <div class="body" id=${c} ?hidden=${!a}>
          <ha-textfield
            .label=${o}
            .value=${s}
            .placeholder=${n}
            @input=${e=>this._applyColor(t,e.target.value)}
          ></ha-textfield>
          <button
            class="reset"
            ?disabled=${""===s}
            title=${qe("editor.color_reset",this.hass)}
            aria-label=${qe("editor.color_reset",this.hass)}
            @click=${()=>this._applyColor(t,"")}
          >
            <ha-icon icon="mdi:backup-restore"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPicker(e){const{h:t,s:o,v:i}=this._picker.hsv;return H`
      <div
        class="picker"
        role="dialog"
        aria-label=${qe("editor.color_pick",this.hass)}
        @keydown=${this._pickerKeydown}
      >
        <div
          class="sv"
          tabindex="0"
          role="group"
          aria-label=${qe("editor.color_sv",this.hass)}
          style="--hue:${t}"
          @pointerdown=${e=>this._drag(e,"sv")}
        >
          <span class="knob" style="left:${100*o}%;top:${100*(1-i)}%"></span>
        </div>
        <div
          class="hue"
          tabindex="0"
          role="slider"
          aria-label=${qe("editor.color_hue",this.hass)}
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
                  aria-label=${qe("editor.color_hex",this.hass)}
                  @change=${this._hexTyped}
                />`:H`<code class="reading">${e}</code>`}
          <div class="modes" role="group" aria-label=${qe("editor.color_mode",this.hass)}>
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
    `}_renderChannels(){const e=this._picker.hsv,t="rgb"===this._pickerMode,o=We(e),i=t?(()=>{const t=/^#(..)(..)(..)$/.exec(Pe(e)),[o,i,s]=t?[1,2,3].map(e=>Number.parseInt(t[e],16)):[0,0,0];return[{key:"r",label:"R",value:o,max:255},{key:"g",label:"G",value:i,max:255},{key:"b",label:"B",value:s,max:255}]})():[{key:"h",label:"H",value:Math.round(o.h),max:360},{key:"s",label:"S",value:Math.round(100*o.s),max:100},{key:"l",label:"L",value:Math.round(100*o.l),max:100}];return H`
      <div class="channels">
        ${i.map(e=>H`
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
    `}_setChannel(e,t,o){if(!this._picker||!Number.isFinite(t))return;const i=this._picker.hsv;let s;if("r"===e||"g"===e||"b"===e){const o=/^#(..)(..)(..)$/.exec(Pe(i)),n=o?[1,2,3].map(e=>Number.parseInt(o[e],16)):[0,0,0];n["rgb".indexOf(e)]=Math.min(255,Math.max(0,Math.round(t)));const r=`#${n.map(e=>e.toString(16).padStart(2,"0")).join("")}`;s=ze(r,i.h)}else{const o=We(i),n=Math.max(0,t);"h"===e&&(o.h=Math.min(360,n)%360),"s"===e&&(o.s=Math.min(100,n)/100),"l"===e&&(o.l=Math.min(100,n)/100),s={...Ne(o),h:o.h}}this._picker={id:this._picker.id,hsv:s},o&&this._commitPicker()}_renderInUse(){const e=this._coloursInUse();return 0===e.length?H``:H`
      <div class="used">
        <span class="cap">${qe("editor.color_used",this.hass)}</span>
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
    `}_coloursInUse(){const e=this._flat??{},t=[],o=new Set,i=e=>{if("string"!=typeof e||""===e.trim())return;const i=Ce(e,this._probe);i&&!o.has(i)&&(o.add(i),t.push({value:e,hex:i}))};for(const t of Qn)i(e[`color_${t}`]??ve[t]);(Array.isArray(e.consumers)?e.consumers:[]).forEach((e,t)=>{gr(e)&&i(e.color??xe[t%xe.length])});for(const e of this._socStops()??[])i(e.color);return t}_takeColour(e,t){this._picker&&(this._picker={id:this._picker.id,hsv:ze(t,this._picker.hsv.h)},this._applyColor(this._picker.id,e))}_applyColor(e,t){const o=e.indexOf(":"),i=e.slice(0,o),s=e.slice(o+1);"flat"===i?this._setFlat(s,t):"node"===i?this._setColor(s,t):"consumer"===i?this._setConsumerColor(Number(s),t):"stop"===i&&this._setStopColor(Number(s),t)}_setFlat(e,t){if(!this._flat)return;const o=""===t.trim()?void 0:t;this._emit({...this._flat,[e]:o})}_setConsumerColor(e,t){if(!this._flat)return;const o=this._flat,i=Array.isArray(o.consumers)?[...o.consumers]:[];if(!gr(i[e]))return;const{color:s,...n}=i[e];i[e]=""===t.trim()?n:{...n,color:t},this._emit({...o,consumers:i})}_socStops(){const e=this._flat?.soc_stops;if(null==e||""===e)return be.map(e=>({...e}));return Array.isArray(e)&&e.length>=2&&e.every(e=>gr(e)&&"number"==typeof e.at&&Number.isFinite(e.at)&&lr(e.color))?e:void 0}_writeStops(e){this._flat&&this._emit({...this._flat,soc_stops:e})}_setStopColor(e,t){const o=this._socStops();""!==t.trim()&&o&&this._writeStops(o.map((o,i)=>i===e?{...o,color:t}:o))}_setStopAt(e,t){const o=this._socStops();if(!o||!Number.isFinite(t)||e<=0||e>=o.length-1)return;const i=o[e-1].at,s=o[e+1].at,n=Math.min(s,Math.max(i,Math.round(t)));this._writeStops(o.map((t,o)=>o===e?{...t,at:n}:t))}_removeStop(e){const t=this._socStops();!t||t.length<=2||0===e||e===t.length-1||this._writeStops(t.filter((t,o)=>o!==e))}_togglePicker(e,t){this._picker?.id!==e?this._picker={id:e,hsv:ze(t,this._picker?.hsv.h??0)}:this._picker=void 0}_drag(e,t){const o=e.currentTarget;e.preventDefault(),e.stopPropagation(),o.setPointerCapture?.(e.pointerId);const i=e=>{if(!this._picker)return;const i=o.getBoundingClientRect(),s=i.width?Math.min(1,Math.max(0,(e.clientX-i.left)/i.width)):0,n=i.height?Math.min(1,Math.max(0,(e.clientY-i.top)/i.height)):0,r=this._picker.hsv;this._picker={id:this._picker.id,hsv:"hue"===t?{h:360*s,s:r.s||1,v:r.v||1}:{...r,s:s,v:1-n}}},s=()=>{o.removeEventListener("pointermove",i),o.removeEventListener("pointerup",s),o.removeEventListener("pointercancel",s),this._commitPicker()};o.addEventListener("pointermove",i),o.addEventListener("pointerup",s),o.addEventListener("pointercancel",s),i(e)}_pickerKeydown(e){if("Escape"===e.key)return this._picker=void 0,void e.stopPropagation();if(!this._picker)return;const t=e.target.classList.contains("hue"),o=e.shiftKey?10:1,i={...this._picker.hsv};switch(e.key){case"ArrowLeft":t?i.h-=o:i.s-=o/100;break;case"ArrowRight":t?i.h+=o:i.s+=o/100;break;case"ArrowUp":if(t)return;i.v+=o/100;break;case"ArrowDown":if(t)return;i.v-=o/100;break;default:return}e.preventDefault(),e.stopPropagation(),this._picker={id:this._picker.id,hsv:{h:(i.h%360+360)%360,s:Math.min(1,Math.max(0,t?i.s||1:i.s)),v:Math.min(1,Math.max(0,t?i.v||1:i.v))}},this._commitPicker()}_commitPicker(){this._picker&&this._applyColor(this._picker.id,Pe(this._picker.hsv))}_toggleColor(e){const t=new Set(this._openColors);t.delete(e)||t.add(e),this._openColors=t}render(){if(!this.hass||!this._config||!this._flat)return K;this._notesFor!==this._config&&(this._notesFor=this._config,this._notes=this._notesOf(this._config));const e=Yr(this.hass,this._flat),t=e.findIndex(e=>e.name===Bn),o=e.findIndex(e=>e.name===In),i=-1===o?e:e.slice(0,o);if(-1!==t){const s=i.slice(0,t),n=i.slice(t+1),r=-1===o?[]:e.slice(o+1),a=r.findIndex(e=>"icons"===e.name),l=-1===a?r.length:a;return H`${this._renderPieces(s)}${this._renderSources()}${this._renderPieces(n)}${this._renderConsumers()}${this._renderPieces(r.slice(0,l))}${this._renderColors()}${this._renderPieces(r.slice(l))}`}const s=-1===o?[]:e.slice(o+1),n=s.findIndex(e=>"icons"===e.name),r=-1===n?s.length:n;return H`${this._renderPieces(i)}${this._renderConsumers()}${this._renderPieces(s.slice(0,r))}${this._renderColors()}${this._renderPieces(s.slice(r))}`}_notesOf(e){const t=[];try{Gt(e,this.hass,t)}catch{}const o=t.filter((e,o)=>t.findIndex(t=>t.field===e.field)===o);return new Map(o.flatMap(e=>{const t=jr(e.field);if(!t)return[];const{min:o,max:i}=ft[e.field.replace(/\[\d+\]/,"")]??{min:0},s="order"===e.reason?`editor.note_order_${t}`:`editor.note_${e.reason}`,n=qe(s,this.hass,{min:o,max:i??""});return[[t,n===s?qe("editor.note_order",this.hass):n]]}))}_form(e){const t=[];let o=[];for(const i of e){o.push(i);const e=Kr(i);if(!e.some(e=>Vr.has(e)))continue;const s=e.filter(e=>this._notes.has(e));t.push(this._haForm(o));for(const e of s)t.push(H`<p class="field-note" role="note">${this._notes.get(e)}</p>`);o=[]}return(o.length>0||0===t.length)&&t.push(this._haForm(o)),H`${t}`}_haForm(e){return H`
      <ha-form
        .hass=${this.hass}
        .data=${this._shownFlat()}
        .schema=${e}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_renderPieces(e){const t=[];let o=[];for(const i of e)"expandable"===i.type?(o.length&&t.push(this._form(o)),o=[],t.push(this._renderSection(i))):o.push(i);return o.length&&t.push(this._form(o)),t}_renderParts(e){const t=e.parts??[e],o=e=>H`
      ${e.notice?H`<p class="section-notice" role="note">${e.notice}</p>`:K}
      ${qn(function(e){const t=[],o=e=>{if(Array.isArray(e))for(const i of e){i.disabled&&t.push(String(i.name));const e=i.selector?.select;for(const o of e?.options??[])o.disabled&&t.push(`${i.name}=${o.value}`);o(i.schema)}};return o(e),t.join(",")}(e.schema),this._form(e.schema))}
    `;return t[0]===e?[o(e)]:t.map(e=>H`<fieldset class="part">
        <legend class="part-title">${e.title}</legend>
        ${o(e)}
      </fieldset>`)}_renderSection(e){const t=String(e.name),o=this._builtSections.has(t),i=qe(`editor_help.${t}`,this.hass),s=i===`editor_help.${t}`?"":i;return H`
      <ha-expansion-panel
        outlined
        class="section"
        data-section=${t}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&!o&&(this._builtSections=new Set([...this._builtSections,t]))}}
      >
        <div slot="header" role="heading" aria-level="3">${e.title}</div>
        <div class="section-content">
          ${s?H`<p class="section-description">${s}</p>`:K}
          ${o?this._renderParts(e):K}
        </div>
      </ha-expansion-panel>
    `}_sourceRows(){const e=this._flat?.solar_sources;return Array.isArray(e)?e:[]}_writeSources(e){this._flat&&this._emit({...this._flat,solar_sources:e})}_renderSources(){const e=e=>qe(`editor.${e}`,this.hass),t=this._sourceRows();return H`
      <ha-expansion-panel outlined expanded class="consumers-panel sources-panel">
        <div slot="header" role="heading" aria-level="3">${e("solar_sources")}</div>
        <div class="consumers">
          <p class="hint">${qe("editor_help.solar_sources",this.hass)}</p>
          ${t.map((t,o)=>H`<div class="source">
              <ha-form
                .hass=${this.hass}
                .data=${t}
                .schema=${[{name:"entity",required:!0,selector:{entity:{filter:Dn}}},{name:"name",selector:{text:{}}},{name:"kwp",selector:{number:{...Hr("entities.solar.kwp"),step:.01,mode:"box"}}},{name:"icon",selector:{icon:{}}},{name:"excluded",selector:{boolean:{}}}]}
                .computeLabel=${this._sourceLabel}
                .computeHelper=${this._sourceHelper}
                @value-changed=${e=>{e.stopPropagation();const t=[...this._sourceRows()];t[o]=e.detail.value,this._writeSources(t)}}
              ></ha-form>
              <button
                class="remove"
                type="button"
                aria-label=${e("source_remove")}
                title=${e("source_remove")}
                @click=${()=>{const e=[...this._sourceRows()];e.splice(o,1),this._writeSources(e)}}
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
    `}_consumerRows(){const e=this._flat?.consumers;return Array.isArray(e)?e:[]}_keysFor(e){for(;this._consumerKeys.length<e;)this._consumerKeys.push(this._nextConsumerKey++);return this._consumerKeys.length>e&&(this._consumerKeys.length=e),this._consumerKeys}_writeConsumers(e,t){this._flat&&(this._consumerKeys=t,this._emit({...this._flat,consumers:e}))}_renderConsumers(){const e=e=>qe(`editor.${e}`,this.hass),t=this._consumerRows(),o=this._keysFor(t.length),i=t.map((e,t)=>({row:e,index:t,key:o[t]}));return H`
      <ha-expansion-panel outlined class="consumers-panel">
        <div slot="header" role="heading" aria-level="3">${e("consumers")}</div>
        <div class="consumers">
          <p class="hint">${qe("editor_help.consumers_list",this.hass)}</p>
          <ha-sortable handle-selector=".handle" @item-moved=${this._moveConsumer}>
            <div class="consumer-list">
              ${is(i,e=>e.key,e=>this._renderConsumer(e.row,e.index,e.key))}
            </div>
          </ha-sortable>
          <button class="add-consumer" type="button" @click=${this._addConsumer}>
            <ha-icon icon="mdi:plus"></ha-icon>${e("consumer_add")}
          </button>
          <p class="hint">${e("colors_hint")}</p>
        </div>
      </ha-expansion-panel>
    `}_renderConsumer(e,t,o){const i=e=>qe(`editor.${e}`,this.hass),s=gr(e)?e:{},n="string"==typeof s.entity?s.entity:"",r=this.hass?.states?.[n]?.attributes?.friendly_name,a="string"==typeof s.name&&s.name.trim()||"string"==typeof r&&r||n||i("consumer_new"),l=gr(s.charge)?s.charge:void 0,c=lr(l?.soc),d=xe,h="string"==typeof s.color&&""!==s.color.trim()?s.color:d[t%d.length];return H`
      <ha-expansion-panel
        outlined
        class="consumer"
        .expanded=${this._openConsumers.has(o)}
        @expanded-will-change=${e=>{e.target===e.currentTarget&&e.detail.expanded&&(this._builtConsumers.has(o)||(this._builtConsumers=new Set([...this._builtConsumers,o])))}}
        @expanded-changed=${e=>{if(e.target!==e.currentTarget)return;const t=new Set(this._openConsumers);e.detail.expanded?t.add(o):t.delete(o),this._openConsumers=t}}
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
                      aria-label=${i(e<0?"consumer_up":"consumer_down")}
                      ?disabled=${t+e<0||t+e>=this._consumerRows().length}
                      @click=${o=>{o.stopPropagation(),this._moveTo(t,t+e)}}
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
            ${n?H`<small>${n}</small>`:K}
          </span>
          ${c?H`<span class="badge"><ha-icon icon="mdi:battery-charging-70"></ha-icon>${i("charge")}</span>`:K}
          <button
            class="remove"
            type="button"
            aria-label=${i("consumer_remove")}
            title=${i("consumer_remove")}
            @click=${e=>{e.stopPropagation(),this._removeConsumer(t)}}
            @keydown=${e=>{e.stopPropagation()}}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${this._builtConsumers.has(o)?H`<ha-form
                .hass=${this.hass}
                .data=${s}
                .schema=${function(e,t){const o=t=>qe(`editor.${t}`,e),i=gr(t.charge)?t.charge:{},s="string"==typeof i.plugged?i.plugged:"",n=Hn(s),r=e.states?.[s]?.attributes?.options,a=(Array.isArray(r)?r:[]).filter(e=>"string"==typeof e).map(e=>({value:e,label:e})),l=[{name:"soc",selector:{entity:{filter:Tn}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"charging",label:o("charge_show_charging")},{value:"plugged",label:o("charge_show_plugged")},{value:"always",label:o("charge_show_always")}]}}}];return"plugged"===i.show&&(l.push({name:"plugged",selector:{entity:{filter:Vn}}}),s&&!n&&l.push({name:"unplugged",selector:{select:{multiple:!0,custom_value:!0,mode:"list",options:a}}})),[{name:"entity",required:!0,selector:{entity:{filter:Dn}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"min_w",selector:{number:{...Hr("consumers.min_w"),mode:"box"}}},{name:"charge",type:"expandable",title:o("charge"),schema:l}]}(this.hass,s)}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._consumerHelper}
                @value-changed=${e=>{e.stopPropagation(),this._setConsumer(t,e.detail.value)}}
              ></ha-form>`:K}
      </ha-expansion-panel>
    `}_setConsumer(e,t){const o=[...this._consumerRows()];o[e]=t,this._writeConsumers(o,[...this._consumerKeys])}_removeConsumer(e){const t=[...this._consumerRows()],o=[...this._consumerKeys];t.splice(e,1),o.splice(e,1),this._writeConsumers(t,o)}_moveTo(e,t){const o=[...this._consumerRows()],i=[...this._consumerKeys];e===t||e>=o.length||(o.splice(t,0,...o.splice(e,1)),i.splice(t,0,...i.splice(e,1)),this._writeConsumers(o,i))}}Jr.properties={hass:{attribute:!1},_config:{state:!0},_flat:{state:!0},_openColors:{state:!0},_picker:{state:!0},_pickerMode:{state:!0},_openConsumers:{state:!0},_builtSections:{state:!0},_builtConsumers:{state:!0}},Jr.styles=n`
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
  `,customElements.get(to)||customElements.define(to,Jr);var Xr=Object.freeze({__proto__:null,fieldOwner:Fr});export{He as ConfigError};
