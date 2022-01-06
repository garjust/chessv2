(()=>{"use strict";var e,t,i,a;(a=e||(e={})).White="WHITE",a.Black="BLACK",(i=t||(t={})).Bishop="BISHOP",i.King="KING",i.Knight="KNIGHT",i.Pawn="PAWN",i.Queen="QUEEN",i.Rook="ROOK";const n=Object.freeze({[e.White]:{queenside:0,kingside:7},[e.Black]:{queenside:56,kingside:63}}),o=Object.freeze({[e.White]:{kingside:!1,queenside:!1},[e.Black]:{kingside:!1,queenside:!1}}),s=[["a8","b8","c8","d8","e8","f8","g8","h8"],["a7","b7","c7","d7","e7","f7","g7","h7"],["a6","b6","c6","d6","e6","f6","g6","h6"],["a5","b5","c5","d5","e5","f5","g5","h5"],["a4","b4","c4","d4","e4","f4","g4","h4"],["a3","b3","c3","d3","e3","f3","g3","h3"],["a2","b2","c2","d2","e2","f2","g2","h2"],["a1","b1","c1","d1","e1","f1","g1","h1"]].reverse().flat(),r=({rank:e,file:t})=>8*e+t,c=e=>s[e],l=t=>t===e.White?e.Black:e.White,p=(e,i="->")=>e.promotion?`${c(e.from)}${i}${c(e.to)}${(e=>{switch(e){case t.Bishop:return"b";case t.Knight:return"n";case t.Queen:return"q";case t.Rook:return"r"}})(e.promotion)}`:`${c(e.from)}${i}${c(e.to)}`,u=(t,i)=>t===e.White?i>=8&&i<16:i>=48&&i<56,g=(e,i)=>{for(const[a,n]of e.pieces)if(n.type===t.King&&n.color===i)return a},k=t=>{const i=new Map;for(const[e,a]of t.pieces)i.set(e,a);const a={[e.White]:{kingside:t.castlingAvailability[e.White].kingside,queenside:t.castlingAvailability[e.White].queenside},[e.Black]:{kingside:t.castlingAvailability[e.Black].kingside,queenside:t.castlingAvailability[e.Black].queenside}};return{pieces:i,turn:t.turn,castlingAvailability:a,enPassantSquare:t.enPassantSquare,halfMoveCount:t.halfMoveCount,fullMoveCount:t.fullMoveCount}},f=Object.freeze({b:t.Bishop,B:t.Bishop,k:t.King,K:t.King,n:t.Knight,N:t.Knight,p:t.Pawn,P:t.Pawn,q:t.Queen,Q:t.Queen,r:t.Rook,R:t.Rook}),h=(Object.freeze({[t.Bishop]:"b",[t.King]:"k",[t.Knight]:"n",[t.Pawn]:"p",[t.Queen]:"q",[t.Rook]:"R"}),t=>{const i=new Map;let a=7,n=0;for(const s of t)switch(s){case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":n+=Number(s);break;case"/":a-=1,n=0;break;case"b":case"B":case"k":case"K":case"n":case"N":case"p":case"P":case"q":case"Q":case"r":case"R":i.set(r({rank:a,file:n}),{color:(o=s,"PNBRQK".includes(o)?e.White:e.Black),type:f[s]}),n+=1}var o;return i}),d=(BigInt(0),BigInt(1)),B=BigInt(2),y=BigInt(4),v=BigInt(8),q=BigInt(16),b=BigInt(32),m=BigInt(64),I=BigInt(128),S=BigInt(256),P=BigInt(512),A=BigInt(1024),W=BigInt(2048),K=BigInt(4096),M=BigInt(8192),w=BigInt(16384),_=BigInt(32768),O=BigInt(65536),R=BigInt(131072),C=BigInt(262144),Q=BigInt(524288),x=BigInt(1048576),E=BigInt(2097152),N=BigInt(4194304),T=BigInt(8388608),$=BigInt(16777216),j=BigInt(33554432),z=BigInt(67108864),L=BigInt(134217728),H=BigInt(268435456),G=BigInt(536870912),F=BigInt(1073741824),U=BigInt(2147483648),D=BigInt(4294967296),J=BigInt(8589934592),V=BigInt(17179869184),X=BigInt(34359738368),Y=BigInt(68719476736),Z=BigInt(137438953472),ee=BigInt(274877906944),te=BigInt(549755813888),ie=BigInt(1099511627776),ae=BigInt(2199023255552),ne=BigInt(4398046511104),oe=BigInt(8796093022208),se=BigInt(17592186044416),re=BigInt(35184372088832),ce=BigInt(70368744177664),le=BigInt(0x800000000000),pe=BigInt(281474976710656),ue=BigInt(562949953421312),ge=BigInt(0x4000000000000),ke=BigInt(0x8000000000000),fe=BigInt(4503599627370496),he=BigInt(9007199254740992),de=BigInt(0x40000000000000),Be=BigInt(0x80000000000000),ye=BigInt(72057594037927940),ve=BigInt(0x200000000000000),qe=BigInt(0x400000000000000),be=BigInt(0x800000000000000),me=BigInt(0x1000000000000000),Ie=BigInt(0x2000000000000000),Se=BigInt(0x4000000000000000),Pe=BigInt(0x8000000000000000),Ae=[d,S,O,$,D,ie,pe,ye,B,P,R,j,J,ae,ue,ve,y,A,C,z,V,ne,ge,qe,v,W,Q,L,X,oe,ke,be,q,K,x,H,Y,se,fe,me,b,M,E,G,Z,re,he,Ie,m,w,N,F,ee,ce,de,Se,I,_,T,U,te,le,Be,Pe],We=(Object.freeze({a1:d,a2:S,a3:O,a4:$,a5:D,a6:ie,a7:pe,a8:ye,b1:B,b2:P,b3:R,b4:j,b5:J,b6:ae,b7:ue,b8:ve,c1:y,c2:A,c3:C,c4:z,c5:V,c6:ne,c7:ge,c8:qe,d1:v,d2:W,d3:Q,d4:L,d5:X,d6:oe,d7:ke,d8:be,e1:q,e2:K,e3:x,e4:H,e5:Y,e6:se,e7:fe,e8:me,f1:b,f2:M,f3:E,f4:G,f5:Z,f6:re,f7:he,f8:Ie,g1:m,g2:w,g3:N,g4:F,g5:ee,g6:ce,g7:de,g8:Se,h1:I,h2:_,h3:T,h4:U,h5:te,h6:le,h7:Be,h8:Pe}),({rank:e,file:t})=>e>=0&&e<8&&t>=0&&t<8),Ke=(e,t=1)=>({rank:e.rank+t,file:e.file}),Me=(e,t=1)=>({rank:e.rank-t,file:e.file}),we=(e,t=1)=>({rank:e.rank,file:e.file-t}),_e=(e,t=1)=>({rank:e.rank,file:e.file+t}),Oe=(e,t=1)=>Ke(we(e,t),t),Re=(e,t=1)=>Ke(_e(e,t),t),Ce=(e,t=1)=>Me(we(e,t),t),Qe=(e,t=1)=>Me(_e(e,t),t),xe=(e,t)=>{const i=[];for(const a of function*(e,t){for(;We(e);)yield e,e=t(e)}(t(e),t))i.push(a);return i},Ee=e=>[Ke(we(e),2),Ke(_e(e),2),we(Ke(e),2),we(Me(e),2),Me(we(e),2),Me(_e(e),2),_e(Ke(e),2),_e(Me(e),2)].filter((e=>We(e))).map((e=>r(e))),Ne=e=>[Oe,Re,Ce,Qe].map((t=>xe(e,t))).map((e=>e.map((e=>r(e))))),Te=e=>[Ke,_e,we,Me].map((t=>xe(e,t))).map((e=>e.map((e=>r(e))))),$e=[],je=[],ze=[],Le=[],He=[],Ge=[],Fe=[];for(const{rank:e,file:i}of function*(){for(let e=0;e<8;e++)for(let t=0;t<8;t++)yield{rank:e,file:t}}()){const a=r({rank:e,file:i});$e[a]=Ne({rank:e,file:i}),ze[a]=[Ke(Ue={rank:e,file:i}),we(Ue),_e(Ue),Me(Ue),Oe(Ue),Re(Ue),Ce(Ue),Qe(Ue)].filter((e=>We(e))).map((e=>r(e))),je[a]=Ee({rank:e,file:i}),Le[a]=Te({rank:e,file:i}),He[a]=[...Ne({rank:e,file:i}),...Te({rank:e,file:i})],Ge[a]=[...$e[a].map((e=>({type:t.Bishop,ray:e}))),...Le[a].map((e=>({type:t.Rook,ray:e})))],Fe[a]=[...$e[a].flat(),...Le[a].flat(),...je[a],...ze[a]]}var Ue;const De=$e.map((e=>e.flat())),Je=Le.map((e=>e.flat())),Ve=He.map((e=>e.flat())),Xe=(De.map((e=>{const t=Array(64);return e.forEach((e=>t[e]=!0)),t})),Je.map((e=>{const t=Array(64);return e.forEach((e=>t[e]=!0)),t})),Ve.map((e=>{const t=Array(64);return e.forEach((e=>t[e]=!0)),t}))),Ye=(Fe.map((e=>{const t=Array(64);return e.forEach((e=>t[e]=!0)),t})),Ve.map((e=>e.reduce(((e,t)=>e|Ae[t]),BigInt(0)))),(e,t=1)=>e+8*t),Ze=(e,t=1)=>e-8*t,et=(e,t=1)=>e-1*t,tt=(e,t=1)=>e+1*t,it=(e,t,i,{skip:a=[]})=>{const n=[],o=t.square;let s;for(const r of i){if(a.includes(r)){n.push({from:o,to:r,piece:t.piece});continue}const i=e.get(r);if(i){if(i.color===t.piece.color)break;s={attacked:{square:r,type:i.type},attacker:{square:o,type:t.piece.type},slideSquares:n.map((({to:e})=>e))},n.push({from:o,to:r,piece:t.piece,attack:s});break}n.push({from:o,to:r,piece:t.piece})}return n},at=(i,a,n,{attacksOnly:o,advanceOnly:s,enPassantSquare:r})=>{let c=[];const p=l(a),g=a===e.White?Ye:Ze,k=a===e.White?Ze:Ye;var f;if(!o&&(f=g(n))>=0&&f<64&&!i.get(g(n))&&(c.push({from:n,to:g(n),piece:{type:t.Pawn,color:a}}),!i.get(g(n,2))&&u(a,n)&&c.push({from:n,to:g(n,2),piece:{type:t.Pawn,color:a}})),!s){const e=g(et(n)),o=g(tt(n)),s=e===r?i.get(k(r)):i.get(e),l=o===r?i.get(k(r)):i.get(o);e%8!=7&&s?.color===p&&c.push({from:n,to:e,piece:{type:t.Pawn,color:a},attack:{attacker:{square:n,type:t.Pawn},attacked:{square:e,type:s.type},slideSquares:[]}}),o%8!=0&&l?.color===p&&c.push({from:n,to:o,piece:{type:t.Pawn,color:a},attack:{attacker:{square:n,type:t.Pawn},attacked:{square:o,type:l.type},slideSquares:[]}})}return((e,t)=>u(l(e),t))(a,n)&&(c=c.flatMap((e=>[t.Bishop,t.Knight,t.Queen,t.Rook].map((t=>({...e,promotion:t})))))),c},nt=(e,i,a)=>je[a].filter((t=>e.get(t)?.color!==i)).map((n=>{let o;const s=e.get(n);return s&&(o={attacker:{square:a,type:t.Knight},attacked:{square:n,type:s.type},slideSquares:[]}),{from:a,to:n,piece:{type:t.Knight,color:i},attack:o}})),ot=(e,i,a,{castlingOnly:n,castlingAvailability:o,pieceAttacks:s})=>{const r=n?[]:ze[a].filter((t=>e.get(t)?.color!==i));return!o[i].kingside||e.get(tt(a))||0!==ct(e,l(i),tt(a),{enPassantSquare:null,skip:[a]}).length||e.get(tt(a,2))||r.push(tt(a,2)),!o[i].queenside||e.get(et(a))||0!==ct(e,l(i),et(a),{enPassantSquare:null,skip:[a]}).length||e.get(et(a,2))||e.get(et(a,3))||r.push(et(a,2)),r.map((n=>{let o;const s=e.get(n);return s&&(o={attacker:{square:a,type:t.King},attacked:{square:n,type:s.type},slideSquares:[]}),{from:a,to:n,piece:{type:t.King,color:i},attack:o}}))},st=(e,i,a,{skip:n=[]})=>$e[a].flatMap((o=>it(e,{square:a,piece:{color:i,type:t.Bishop}},o,{skip:n}))),rt=(e,i,a,{skip:n=[]})=>Le[a].flatMap((o=>it(e,{square:a,piece:{color:i,type:t.Rook}},o,{skip:n}))),ct=(i,a,n,{enPassantSquare:s,skip:r})=>{const c=[],p=l(a),u=[ot(i,p,n,{castlingOnly:!1,castlingAvailability:o,pieceAttacks:{[e.White]:new Map,[e.Black]:new Map}}),st(i,p,n,{skip:r}),rt(i,p,n,{skip:r}),nt(i,p,n),at(i,p,n,{advanceOnly:!1,attacksOnly:!0,enPassantSquare:s})];for(const e of u)for(const a of e)if(a.attack){const e=i.get(a.to);a.attack.attacker.type===t.Bishop||a.attack.attacker.type===t.Rook?!e||e.type!==a.attack.attacker.type&&e.type!==t.Queen||c.push({attacked:a.attack.attacker,attacker:a.attack.attacked,slideSquares:a.attack.slideSquares}):e&&e.type===a.attack.attacker.type&&c.push({attacked:a.attack.attacker,attacker:a.attack.attacked,slideSquares:a.attack.slideSquares})}return c},lt=(e,t)=>{const i=new Map;for(let e=0;e<64;e++)i.set(e,[]);for(let a=0;a<64;a++){const n=ct(e,t,a,{enPassantSquare:null,skip:[]});for(const e of n){const t=i.get(e.attacker.square);if(!t)throw Error("cant be possible");t.push({square:a,attacker:e.attacker,slideSquares:e.slideSquares})}}return i},pt=(e,t)=>{const i=new Map;for(let a=0;a<64;a++){i.set(a,0);const n=ct(e,t,a,{enPassantSquare:null,skip:[]});i.set(a,n.length)}return i},ut=(t,i,a)=>{const n=i[e.White],o=i[e.Black];let s;return n&&(s=ct(t,e.Black,n,{...a,skip:[n]})),o&&(s=ct(t,e.White,o,{...a,skip:[o]})),{[e.White]:s||[],[e.Black]:[]}},gt=[[-5,-2,0,0,0,0,-2,-5],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,5,1,1,1,1,5,1],[1,1,6,1,1,6,1,1],[1,1,1,6,6,1,1,1],[2,8,-1,8,8,-1,8,2],[4,2,-2,-5,-5,-2,2,4]],kt=[[-10,-10,-10,-10,-10,-10,-10,-10],[-10,-10,-10,-10,-10,-10,-10,-10],[-10,-10,-10,-10,-10,-10,-10,-10],[0,-2,-5,-10,-10,-5,-2,0],[0,-2,-5,-10,-10,-5,-2,0],[0,0,-2,-10,-10,-2,0,0],[1,1,1,-10,-10,1,1,1],[5,5,10,-8,-8,5,10,5]],ft=[[-10,0,0,0,0,0,0,-10],[1,1,1,1,1,1,1,1],[-1,1,2,1,1,2,1,-1],[0,4,4,4,4,4,4,0],[0,1,2,4,4,2,1,0],[-1,1,10,1,1,10,1,-1],[-5,-1,1,6,6,1,-1,-5],[-10,-5,-1,0,0,-1,-5,-10]],ht=[[0,0,0,0,0,0,0,0],[10,10,10,10,10,10,10,10],[6,1,5,7,7,5,1,6],[5,1,4,6,6,4,1,5],[4,1,1,5,5,1,1,4],[1,1,1,1,1,-3,1,1],[1,5,5,-10,-10,5,5,1],[0,0,0,0,0,0,0,0]],dt=[[-5,-2,0,0,0,0,-2,-5],[1,1,1,2,2,1,1,1],[1,1,2,6,6,2,1,1],[1,2,6,5,5,6,2,1],[1,2,6,8,8,6,2,1],[1,5,2,6,6,5,1,1],[2,1,5,2,5,-1,1,1],[-5,-2,-2,-1,-1,-2,-2,-5]],Bt=[[5,5,5,5,5,5,5,5],[10,10,10,10,10,10,10,10],[0,0,0,0,0,0,0,0],[1,0,-2,-1,-1,-2,0,1],[1,0,-2,-1,-1,-2,0,1],[4,0,0,4,0,4,0,4],[0,0,0,1,1,0,0,0],[2,4,6,10,10,8,4,2]],yt={[t.Bishop]:{[e.White]:[...gt].reverse().flat(),[e.Black]:[...gt].flat()},[t.Knight]:{[e.White]:[...ft].reverse().flat(),[e.Black]:[...ft].flat()},[t.King]:{[e.White]:[...kt].reverse().flat(),[e.Black]:[...kt].flat()},[t.Pawn]:{[e.White]:[...ht].reverse().flat(),[e.Black]:[...ht].flat()},[t.Queen]:{[e.White]:[...dt].reverse().flat(),[e.Black]:[...dt].flat()},[t.Rook]:{[e.White]:[...Bt].reverse().flat(),[e.Black]:[...Bt].flat()}},vt=Object.freeze({[t.Bishop]:300,[t.King]:1/0,[t.Knight]:300,[t.Pawn]:100,[t.Queen]:900,[t.Rook]:500}),qt=t=>t===e.White?1:-1,bt=(e,t)=>yt[t.type][t.color][e],mt=(e,i,a)=>{const n=new Map,o=Ge[i];for(const{type:i,ray:s}of o){const o=[],r=[];let c;for(const t of s){const i=e.get(t);if(i){if(i.color!==a){c={square:t,piece:i};break}o.push(t)}else r.push(t)}!c||c.piece.type!==i&&c.piece.type!==t.Queen||1===o.length&&n.set(o[0],{pinned:o[0],attacker:c.square,legalMoveSquares:[...r,...o]})}return n},It=(e,i,a,{enPassantSquare:n,castlingAvailability:o,pieceAttacks:s})=>{const r=[];switch(i.type){case t.Bishop:r.push(...st(e,i.color,a,{skip:[]}));break;case t.King:r.push(...ot(e,i.color,a,{castlingOnly:!1,castlingAvailability:o,pieceAttacks:s}));break;case t.Knight:r.push(...nt(e,i.color,a));break;case t.Pawn:r.push(...at(e,i.color,a,{attacksOnly:!1,advanceOnly:!1,enPassantSquare:n}));break;case t.Queen:r.push(...((e,t,i,a)=>[...st(e,t,i,a),...rt(e,t,i,a)])(e,i.color,a,{skip:[]}));break;case t.Rook:r.push(...rt(e,i.color,a,{skip:[]}))}return r},St=(e,i,{ignoreKing:a})=>{if(a&&i.piece.type===t.King)return!0;if(1===e.length){const t=e[0];return n=t.slideSquares,o=i.to,n.includes(o)||t.attacker.square===i.to}if(2===e.length)return!1;throw Error(`called with ${e.length} not exactly 1 or 2 checks`);var n,o},Pt=(e,t,i,a,n,o)=>{if(o){if(a.from===i)return 0===o.get(a.to);{const e=n.get(a.from);return!e||e.legalMoveSquares.includes(a.to)||a.to===e.attacker}}if(a.from===i)return 0===ct(e,l(t),a.to,{enPassantSquare:null,skip:[i]}).length;{const e=n.get(a.from);return!e||e.legalMoveSquares.includes(a.to)||a.to===e.attacker}},At=t=>(t=>{const i=g(t,e.White),a=g(t,e.Black),n={[e.White]:i,[e.Black]:a},o={[e.White]:lt(t.pieces,e.White),[e.Black]:lt(t.pieces,e.Black)},s={[e.White]:pt(t.pieces,e.White),[e.Black]:pt(t.pieces,e.Black)},r=((t,i)=>{const a=i[e.White],n=i[e.Black];let o,s;return a&&(o=mt(t,a,e.White)),n&&(s=mt(t,n,e.Black)),{[e.White]:o||new Map,[e.Black]:s||new Map}})(t.pieces,n),c=ut(t.pieces,n,{enPassantSquare:t.enPassantSquare,castlingAvailability:t.castlingAvailability});return{...t,kings:n,pieceAttacks:o,attackedSquares:s,checks:c,pinsToKing:r}})(k(t)),Wt=(e,t)=>{const i=e.generateMoves();if(0===t)return 1;if(1===t)return i.length;let a=0;for(const n of i)e.applyMove(n),a+=Wt(e,t-1),e.undoLastMove();return a},Kt=(new Intl.NumberFormat,require("process")),[,,Mt,wt,_t]=Kt.argv,Ot=(t=>{const[i,a,n,o,r,c]=t.split(" ");return Object.freeze({pieces:h(i),turn:"w"===a?e.White:e.Black,castlingAvailability:Object.freeze({[e.White]:{kingside:n.includes("K"),queenside:n.includes("Q")},[e.Black]:{kingside:n.includes("k"),queenside:n.includes("q")}}),enPassantSquare:"-"!==o?(l=o,s.indexOf(l)):null,halfMoveCount:Number(r),fullMoveCount:Number(c)});var l})(wt),Rt=new class{constructor(e){this._moveStack=[],this._position=At(e)}applyMove(i){const a=((i,a)=>{const{pieces:o}=i;let s=i.pieces.get(a.from);if(!s)throw Error("no piece to move");if(s.color!==i.turn)throw Error("cannot move piece for other color");const r={move:a,previousState:{castlingAvailability:{[e.White]:{kingside:i.castlingAvailability[e.White].kingside,queenside:i.castlingAvailability[e.White].queenside},[e.Black]:{kingside:i.castlingAvailability[e.Black].kingside,queenside:i.castlingAvailability[e.Black].queenside}},enPassantSquare:i.enPassantSquare,halfMoveCount:i.halfMoveCount,pinsToKing:{...i.pinsToKing},checks:{...i.checks}}};a.promotion&&(s={...s,type:a.promotion});let c=o.get(a.to);if(c&&(r.captured={square:a.to,piece:c}),o.delete(a.from),o.set(a.to,s),c&&c.type===t.Rook&&(a.to===n[c.color].queenside?i.castlingAvailability[c.color].queenside=!1:a.to===n[c.color].kingside&&(i.castlingAvailability[c.color].kingside=!1)),s.type===t.Pawn&&i.enPassantSquare===a.to){const t=s.color===e.White?Ze(a.to):Ye(a.to);if(c=o.get(t),!c)throw Error("no piece captured with en passant capture");r.captured={square:t,piece:c},o.delete(t)}if(((i,a)=>!(i.type!==t.Pawn||!u(i.color,a.from))&&(i.color===e.White?a.to>=24&&a.to<32:a.to>=32&&a.to<40))(s,a)?i.enPassantSquare=s.color===e.White?Ye(a.from):Ze(a.from):i.enPassantSquare=null,s.type===t.King)if(i.kings[s.color]=a.to,i.castlingAvailability[s.color].queenside=!1,i.castlingAvailability[s.color].kingside=!1,a.from-a.to==2){const a=n[s.color].queenside,o=s.color===e.White?3:59;i.pieces.delete(a),i.pieces.set(o,{color:s.color,type:t.Rook})}else if(a.from-a.to==-2){const a=n[s.color].kingside,o=s.color===e.White?5:61;i.pieces.delete(a),i.pieces.set(o,{color:s.color,type:t.Rook})}return s.type===t.Rook&&(a.from===n[s.color].queenside?i.castlingAvailability[s.color].queenside=!1:a.from===n[s.color].kingside&&(i.castlingAvailability[s.color].kingside=!1)),((e,i,a,n,o,s)=>{const r=a[n],c=a[l(n)];r&&(s.type===t.King||Xe[r][o.from]||Xe[r][o.to])&&(e[n]=mt(i,r,n)),c&&(Xe[c][o.from]||Xe[c][o.to])&&(e[l(n)]=mt(i,c,l(n)))})(i.pinsToKing,i.pieces,i.kings,i.turn,a,s),i.turn===e.Black&&i.fullMoveCount++,s.type===t.Pawn||c?i.halfMoveCount=0:i.halfMoveCount++,i.turn=l(i.turn),r})(this._position,i);return this._moveStack.push(a),a.captured?.piece}undoLastMove(){const i=this._moveStack.pop();if(!i)throw Error("no last move to undo");((i,a)=>{const{move:o}=a;let s=i.pieces.get(o.to);if(!s)throw Error("no piece to unmove");if(o.promotion&&(s={type:t.Pawn,color:s.color}),i.pieces.set(o.from,s),i.pieces.delete(o.to),a.captured&&i.pieces.set(a.captured.square,a.captured.piece),s.type===t.King)if(i.kings[s.color]=o.from,o.from-o.to==2){const a=n[s.color].queenside,o=s.color===e.White?3:59;i.pieces.delete(o),i.pieces.set(a,{color:s.color,type:t.Rook})}else if(o.from-o.to==-2){const a=n[s.color].kingside,o=s.color===e.White?5:61;i.pieces.delete(o),i.pieces.set(a,{color:s.color,type:t.Rook})}i.turn===e.White&&i.fullMoveCount--,i.turn=l(i.turn),i.castlingAvailability=a.previousState.castlingAvailability,i.enPassantSquare=a.previousState.enPassantSquare,i.halfMoveCount=a.previousState.halfMoveCount,i.pinsToKing=a.previousState.pinsToKing,i.checks=a.previousState.checks})(this._position,i)}evaluate(){return(e=>{let i=0;for(const[a,n]of e.pieces)n.type!==t.King&&(i+=(vt[n.type]+bt(a,n))*qt(n.color));return i+=20*qt(e.turn),i/100})(this._position)}evaluateNormalized(){return this._position.turn===e.White?this.evaluate():-1*this.evaluate()}generateMoves(){return((e,t,{attackedSquares:i,pieceAttacks:a,pinsToKing:n,kings:s,enPassantSquare:r,castlingAvailability:c})=>{let p=[];const u=s[t];u&&(p=ct(e,l(t),u,{enPassantSquare:r,skip:[u]}));const g=((e,t)=>{const i=[],{color:a,enPassantSquare:n,castlingAvailability:o,pieceAttacks:s}=t;for(const[t,r]of e.entries())a&&r.color!==a||i.push(...It(e,r,t,{enPassantSquare:n,castlingAvailability:o,pieceAttacks:s}));return i})(e,{color:t,enPassantSquare:r,castlingAvailability:p.length>0?o:c,pieceAttacks:a});if(u)for(let i=g.length-1;i>=0;i--){const a=g[i];p.length>0&&(St(p,a,{ignoreKing:!0})||g.splice(i,1)),Pt(e,t,u,a,n[t])||g.splice(i,1)}return g})(this._position.pieces,this._position.turn,{attackedSquares:this._position.attackedSquares,pieceAttacks:this._position.pieceAttacks,pinsToKing:this._position.pinsToKing,checks:this._position.checks,kings:this._position.kings,enPassantSquare:this._position.enPassantSquare,castlingAvailability:this._position.castlingAvailability})}get position(){return(e=>k((e=>{const{pieces:t,turn:i,castlingAvailability:a,enPassantSquare:n,halfMoveCount:o,fullMoveCount:s}=e;return{pieces:t,turn:i,castlingAvailability:a,enPassantSquare:n,halfMoveCount:o,fullMoveCount:s}})(e)))(this._position)}set position(e){this._position=At(e),this._moveStack=[]}get checks(){return ut(this._position.pieces,this._position.kings,{enPassantSquare:this._position.enPassantSquare,castlingAvailability:this._position.castlingAvailability})}get attacks(){return{[e.White]:pt(this._position.pieces,e.White),[e.Black]:pt(this._position.pieces,e.Black)}}get pins(){return[...Array.from(this._position.pinsToKing[e.White].values()),...Array.from(this._position.pinsToKing[e.Black].values())]}}(Ot),Ct=((e,t)=>{if(0===t)return{counter:1,counts:{}};const i={},a=e.generateMoves();for(const n of a)e.applyMove(n),i[p(n,"")]=Wt(e,t-1),e.undoLastMove();return{counter:Object.values(i).reduce(((e,t)=>e+t),0),counts:i}})(Rt,Number(Mt));for(const[e,t]of Object.entries(Ct.counts))console.log(`${e} ${t}`);console.log(`\n${Ct.counter}`)})();
