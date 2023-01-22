var store = localforage.createInstance(
{
    driver      : localforage.INDEXEDDB,
    name        : 'GetRssFeedUrlExtensionForSlickRss',
    version     : 1.0,
    storeName   : 'keyvaluepairs',
    description : 'Store options setup'
});
