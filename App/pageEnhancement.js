import { URL } from './constants'


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
`

const specificScript = ``

export const injectedJavaScript = [
    linkScript,
    mailsScript,
    specificScript
].join("\n")