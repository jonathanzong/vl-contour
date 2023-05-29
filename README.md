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

```
{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 650,
  "autosize": "none",
  "signals": [
    {"name": "grid", "init": "data('originalData')[0]"},
    {"name": "height", "update": "round(grid.height * width / grid.width)"}
  ],
  "data": [
    {"name": "originalData", "url": "data/volcano.json"},
    {
      "name": "contours",
      "source": "originalData",
      "transform": [
        {
          "type": "isocontour",
          "scale": {"expr": "width / datum.width"},
          "smooth": true,
          "thresholds": {"signal": "sequence(90, 195, 5)"}
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "color",
      "type": "linear",
      "domain": {"data": "contours", "field": "contour.value"},
      "range": {"scheme": "blueorange"}
    }
  ],
  "marks": [
    {
      "type": "path",
      "from": {"data": "contours"},
      "encode": {
        "enter": {
          "fill": {"scale": "color", "field": "contour.value"},
          "stroke": {"value": "#ddd"}
        }
      },
      "transform": [{"type": "geopath", "field": "datum.contour"}]
    }
  ],
  "description": "A contour plot of the Maungawhau volcano in New Zealand."
}
```
