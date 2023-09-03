import { URL } from './constants'

const extraStyles = `
.super-style-example {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 9999;
}
`

const extraStylesInsert = `
var styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = \`\n${extraStyles}\n\`;
document.head.appendChild(styleSheet);
`

const linkScript = `
var links = document.getElementsByTagName('a');
for (var i = 0; i < links.length; i++) {
  var link = links[i];
  var href = link.getAttribute('href');
  if (href && (href.startsWith('/') || href.startsWith('${URL}') )) {
    link.setAttribute('target', '_self');
  }
}
`;

const mailsScript = `
var mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
    mailtoLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        window.ReactNativeWebView.postMessage(link.href);
      });
    });
`;

const target_blank_to_self = `
(function() {
    var originalOpen = window.open;
    window.open = function(url, target, features) {
      if (target === '_blank') {
        target = '_self';
      }
      originalOpen.call(window, url, target, features);
    };
  })();
`;

const specificScript = ``

export const injectedJavaScript = [
  extraStylesInsert,
  linkScript,
  mailsScript,
  target_blank_to_self,
  specificScript
].join("\n")