import * as vega from 'vega';
import * as vl from 'vega-lite';
import { VlContourUnitSpec } from './types';
import cloneDeep from 'lodash.clonedeep';

const compileUnitVlContour = (vlSpec: VlContourUnitSpec): vega.Spec => {
  if (vlSpec.mark !== 'contour') {
    return vl.compile(vlSpec as vl.TopLevelSpec).spec;
  } else {
    const vlSpecCopy = cloneDeep(vlSpec);
    vlSpecCopy.mark = 'point';
    const vgSpecCompiled = vl.compile(vlSpecCopy as vl.TopLevelSpec).spec;
    console.log(vgSpecCompiled);

    const vgSpec: vega.Spec = {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      width: 650,
      autosize: 'none',

      signals: [
        {
          name: 'grid',
          init: "data('originalData')[0]",
        },
        {
          name: 'height',
          update: 'round(grid.height * width / grid.width)',
        },
      ],

      data: [
        {
          name: 'originalData',
        },
        {
          name: 'contours',
          source: 'originalData',
          transform: [
            {
              type: 'isocontour',
              scale: { expr: 'width / datum.width' },
            },
          ],
        },
      ],

      scales: [
        {
          name: 'color',
          type: 'linear',
          domain: { data: 'contours', field: 'contour.value' },
          range: { scheme: 'blueorange' },
        },
      ],

      marks: [
        {
          type: 'path',
          from: { data: 'contours' },
          encode: {
            enter: {
              fill: { scale: 'color', field: 'contour.value' },
            },
          },
          transform: [
            {
              type: 'geopath',
              field: 'datum.contour',
            },
          ],
        },
      ],
    };

    if (vlSpec.description) {
      vgSpec.description = vlSpec.description;
    }

    if ('url' in vlSpec.data) {
      vgSpec.data[0] = {
        name: 'originalData',
        url: vlSpec.data.url,
      };
    }

    if ('values' in vlSpec.data) {
      vgSpec.data[0] = {
        name: 'originalData',
        values: [vlSpec.data.values].flat(),
      };
    }

    if (vlSpec.encoding) {
      if ('smooth' in vlSpec.encoding) {
        (vgSpec.data[1].transform[0] as vega.IsocontourTransform).smooth =
          Boolean(vlSpec.encoding.smooth.value);
      }
      if (
        'thresholds' in vlSpec.encoding &&
        'value' in vlSpec.encoding.thresholds
      ) {
        if ('expr' in vlSpec.encoding.thresholds.value) {
          ((vgSpec.data[1].transform[0] as vega.IsocontourTransform)
            .thresholds as vega.SignalRef) = {
            signal: vlSpec.encoding.thresholds.value.expr,
          };
        } else {
          (vgSpec.data[1].transform[0] as vega.IsocontourTransform).thresholds =
            vlSpec.encoding.thresholds.value;
        }
      }
      if ('color' in vlSpec.encoding) {
        if (
          'scale' in vlSpec.encoding.color &&
          'scheme' in vlSpec.encoding.color.scale
        ) {
          ((vgSpec.scales[0] as vega.LinearScale).range as any) = {
            scheme: vlSpec.encoding.color.scale.scheme,
          };
        }
      }
      if ('stroke' in vlSpec.encoding) {
        (vgSpec.marks[0].encode as any).enter.stroke =
          vgSpecCompiled.marks[0].encode.update.stroke;
      }
    }
    return vgSpec;
  }
};

const compile = (vlSpec: VlContourUnitSpec): vega.Spec => {
  return compileUnitVlContour(vlSpec);
};

export default compile;
