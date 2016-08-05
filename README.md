# Ajax Debug Toolbar

Ajax debug toolbar is a chrome extension to enable a debug toolbar that makes sense for sites with lots of ajax calls.

It's based on the tradition of https://github.com/jazzband/django-debug-toolbar, but the main toolbar rolls up key performance metrics from all requests into top-level summaries and allows you to drill into the details of any request since the page loaded.


## Not ready for general use

This is a proof-of-concept version. It's hardcoded for a specific port, may stomp on your page, and has some known bugs and missing features.


## Usage

1. Install the chrome extension. It's not in the extension store yet so you'll need to clone the repo and load it as an unpacked extension.
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


## Thanks

This was inspired by https://github.com/recamshak/django-debug-panel and includes some code and images from an old version of pylons_debugtoolbar which in turn used stuff from https://github.com/jazzband/django-debug-toolbar.
