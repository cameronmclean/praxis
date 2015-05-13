var patternSelector = window.document.getElementById("pattern-selector");
patternSelector.addEventListener("change", patternChanged);

function patternChanged() {
  window.parent.postMessage(patternSelector.value, "*");
}