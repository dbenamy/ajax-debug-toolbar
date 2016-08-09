# Ajax Debug Toolbar

Ajax debug toolbar is a chrome extension to enable a debug toolbar that makes sense for sites with lots of ajax calls.

It's based on the tradition of https://github.com/jazzband/django-debug-toolbar, but the main toolbar rolls up key performance metrics from all requests into top-level summaries and allows you to drill into the details of any request since the page loaded.


## Alpha software

This is an alpha version. It'll only work for dev sites on a specific port, and has some known bugs and missing features.


## Usage

1. Install https://chrome.google.com/webstore/detail/ajax-debug-toolbar/ofdlgimnfjfacgcjkafmmjigpgjnjjpn.
1. Set up your site or webapp to include an `X-Debug-Data` header in responses with a stringified json object like:

```
{
    panels: [
        {
            name: 'SQL',
            kpi1: {
                val: 3,
                unit: 'queries'
            },
            kpi2: {
                val: 125,
                unit: 'ms'
            },
            detailsUrl: '/foo/bar'
        },
        ...
    ]
}
```


## Hacking

Disable the extension installed from the chrome store, clone the repo, and load it as an unpacked extension. You may want to install https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc to inspect the background script.


## Thanks

This was inspired by https://github.com/recamshak/django-debug-panel and includes some code and images from an old version of pylons_debugtoolbar which in turn used stuff from https://github.com/jazzband/django-debug-toolbar.
