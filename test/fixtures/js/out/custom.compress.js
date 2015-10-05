/**
 * test custom inline method in javascript file
 */

var tpl = ''
    + '<div class="warning"><style scoped>h3 {color: red;}</style><style>body{width:1200px;margin:0 auto;background:#ccc}.icon{height:50px;width:50px;border:0}</style><h3>Warning!</h3><p>This page is under construction</p></div><div class="outdated"><h3 class=\'title\'>Heads up!</h3><p>This content may be out of date</p></div>';

var css = ''
    + 'body{width:1200px;margin:0 auto;background:#ccc}'
    + '.icon{height:50px;width:50px;border:0}';

// inline image
var img = ''
    + 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACDElEQVR4nLVSPWhTURg9992bF5M0kiGUUh2KpkoFUWs6qINDIw46dvMvWlALVUEnuwlKhyA6iNpF8XdRoUMXcSgOsSKxghmtOmloTO3PS9/Lu/fd+zmIJWlMwcG7ne+c73DPuRf4n+fQxPzpwxOVk2tpxFok935eITIawP1WGqsVkRkvH4wY2RGlYMOBF6XMPxvw5fmco8hxFDnMW8y10rF6sP9ZKQmilKwu7G23g+tz0rpMAJK2Gf0h+QURT7xjjH96PdAxt2Kw5+HMvrCRLwV0zCLzuxRm4BkBadmcYBA2gY6wAICFAIBhFgLwZR+hjDV1PJX3NF21tIIvNb67KjvrsZ4lp2rns1vNm2yPWaxW7VmfbSu56oQvNSyt4Cl9bSrb/XYlQnqsOBRH7banqOyLcOrD2R1Ofbxdd4sRW3szUcE6l0zo3PuhnbcaSiyc2X5nTvEjHKadG/m5qW2tvgoynRUfg3+Wm17h43DvU1ebivblt9UGRtbKrtKl4vm+e/Xzho/UncsLpnXSVcGDzaOTuyO2eM4A1FQw4Er/VUTwi003a0B2NE1aA0SD8RArQAddpIOumGAFRnSKjMGWm9O9LQ0CJdMGBA4kHIlHHo/GPBFrq0r2hAMJgKCV39cyAjO631E0iXXrj325lK7v4eimG9Mj8BYeQ5h+AGOrowAANo6Mx/9KNGra6vEvz6L1ybL0deIAAAAASUVORK5CYII=';


!function(){var o="jack",l="USA";console.log("Hello %s, country: %s",o,l);for(var n=[1,2,10],c=0,r=0,a=n.length;a>r;r++)c+=n[r]}();;
