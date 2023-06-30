# vl-contour

install `parcel-bundler` and `typescript` globally

`yarn add global parcel-bundler typescript`

install files with `yarn`

run with `yarn start`

### testing

`yarn link` in `vl-contour`

`yarn link vl-contour` in `editor`

replace `vegaLite.compile` with `compile` imported from `vl-contour`

### example

```
{
  "description": "A contour plot of the Maungawhau volcano in New Zealand.",
  "data": {"url": "data/volcano.json"},
  "mark": "contour",
  "encoding": {
    "stroke": {"value": "#ccc"},
    "color": {"field": "value", "type": "quantitative", "scale": {"scheme": "blueorange"}},
    "smooth": {"value": true},
    "thresholds": {"value": {"expr": "sequence(90, 195, 5)"}}
  }
}
```
