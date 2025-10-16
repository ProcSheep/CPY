let store = require('app-store-scraper');

// store.app({ id: 553834731 }).then(console.log).catch(console.log);
store.developer({ devId: 284882218, country: 'us' }).then(console.log).catch(console.log);