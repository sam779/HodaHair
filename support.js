// Support file for Hoda Hair website
// Contains utility functions and polyfills if needed

// Polyfill for older browsers if needed
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = Math.floor(targetLength) || 0;
    if (targetLength >= this.length) {
      return this.toString();
    } else {
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (padString.length === 0) {
        return this.toString();
      }
      let pad = Math.ceil((targetLength - this.length) / padString.length);
      return new Array(pad + 1).join(padString).slice(0, targetLength - this.length) + this.toString();
    }
  };
}

// Utility: Smooth scroll fallback
if (!('behavior' in window.ScrollToOptions.prototype || {}).behavior) {
  Window.prototype.scrollTo = (function(original) {
    return function(x, y) {
      if ((typeof x) === 'object') {
        y = x.top;
        x = x.left;
      }
      original.call(this, x, y);
    };
  })(Window.prototype.scrollTo);
}

console.log('Hoda Hair website ready');
