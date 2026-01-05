import * as vega from 'vega';
import * as vl from 'vega-lite';
import { VlContourUnitSpec } from './types';
import cloneDeep from 'lodash.clonedeep';

const compileUnitVlContour = (vlSpec: VlContourUnitSpec): vega.Spec => {
  const markType = typeof vlSpec.mark === 'string' ? vlSpec.mark : vlSpec.mark.type;

  if (markType !== 'contour') {
    return vl.compile(vlSpec as vl.TopLevelSpec).spec;
  } else {
    const vlSpecCopy = cloneDeep(vlSpec);
    vlSpecCopy.mark = 'point';
    const vgSpecCompiled = vl.compile(vlSpecCopy as vl.TopLevelSpec).spec;

    // Extract contour mark properties
    const contourMark = typeof vlSpec.mark === 'string' ? {} : vlSpec.mark;
    const smooth = contourMark.smooth;
    const thresholds = contourMark.thresholds;

    console.log(vgSpecCompiled);

    const vgSpec: vega.Spec = {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      width: 650,
      autosize: 'none',

      signals: [
        ...(vgSpecCompiled.signals || []),
        {
          name: 'grid',
          init: "data('contours')[0]",
        },
        {
          name: 'height',
          update: 'round(grid.height * width / grid.width)',
        },
      ],

      data: [
        ...vgSpecCompiled.data.filter((d) => d.name !== 'source_0'),
        {
          ...vgSpecCompiled.data.find((d) => d.name === 'source_0'),
          name: 'originalData',
        },
        {
          name: 'hi',
          source: 'originalData',
          transform: [
            {
              type: 'pivot',
              field: 'depth',
              value: 'value',
              op: 'values',
            },
          ],
        },
        {
          name: 'contours',
          source: 'originalData',
          transform: [
            {
              type: 'isocontour',
              scale: { expr: 'width / datum.width' },
            },
            {
              type: 'formula',
              expr: 'datum.contour.value',
              as: 'contourValue',
            },
            {
              type: 'formula',
              expr: 'datum.contour.coordinates.length',
              as: 'numDisjointPolygons',
            },
          ],
        },
        // {
        //   name: 'geodata',
        //   source: 'contours',
        //   transform: [
        //     {
        //       type: 'geojson',
        //       geojson: 'contour',
        //       signal: 'geojson_contours',
        //     },
        //   ],
        // },
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
            update: {},
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

    // if ('projection' in vlSpec && !(vlSpec.projection.type as vega.ExprRef).expr) {
    //   const projections: vega.Projection[] = [
    //     {
    //       name: 'projection',
    //       size: { signal: '[width, height]' },
    //       fit: { signal: 'geojson_contours' },
    //       type: vlSpec.projection.type as vega.ProjectionType,
    //     },
    //   ];

    //   vgSpec.projections = projections;

    //   (vgSpec.marks[0].transform[0] as vega.GeoPathTransform).projection = 'projection';
    // }

    // Apply contour mark properties
    if (smooth !== undefined) {
      (vgSpec.data.find((d) => d.name === 'contours').transform[0] as vega.IsocontourTransform).smooth = Boolean(smooth);
    }
    if (thresholds !== undefined) {
      if (typeof thresholds === 'object' && 'expr' in thresholds) {
        ((vgSpec.data.find((d) => d.name === 'contours').transform[0] as vega.IsocontourTransform).thresholds as vega.SignalRef) = {
          signal: thresholds.expr,
        };
      } else {
        (vgSpec.data.find((d) => d.name === 'contours').transform[0] as vega.IsocontourTransform).thresholds = thresholds;
      }
    }

    if (vlSpec.encoding) {
      if ('color' in vlSpec.encoding) {
        if ('scale' in vlSpec.encoding.color && 'scheme' in vlSpec.encoding.color.scale) {
          ((vgSpec.scales[0] as vega.LinearScale).range as any) = {
            scheme: vlSpec.encoding.color.scale.scheme,
          };
        }
      }
      if ('stroke' in vlSpec.encoding) {
        (vgSpec.marks[0].encode as any).enter.stroke = vgSpecCompiled.marks[0].encode.update.stroke;
      }
      // conditional encodes
      ['opacity', 'color', 'strokeWidth'].forEach((channel) => {
        if ((vlSpec.encoding as any)[channel] && 'condition' in (vlSpec.encoding as any)[channel]) {
          if ('param' in (vlSpec.encoding as any)[channel].condition) {
            const { param, scale, empty, ...rest } = (vlSpec.encoding as any)[channel].condition;
            const test = [
              {
                test: empty === false ? `length(data("${param}_store")) && vlSelectionTest("${param}_store", datum)` : `!length(data("${param}_store")) || vlSelectionTest("${param}_store", datum)`,
                ...rest,
                scale: scale ? 'color' : undefined,
              },
              Object.fromEntries(Object.entries((vlSpec.encoding as any)[channel]).filter(([key]) => ['field', 'value'].includes(key))),
            ];

            const vgChannel = channel === 'color' ? 'fill' : channel;

            (vgSpec.marks[0].encode as any).update[vgChannel] = test;
          } else if ('test' in (vlSpec.encoding as any)[channel].condition) {
            const { test, scale, ...rest } = (vlSpec.encoding as any)[channel].condition;
            const test2 = [
              {
                test,
                ...rest,
                scale: scale ? 'color' : undefined,
              },
              Object.fromEntries(Object.entries((vlSpec.encoding as any)[channel]).filter(([key]) => ['field', 'value'].includes(key))),
            ];

            const vgChannel = channel === 'color' ? 'fill' : channel;

            (vgSpec.marks[0].encode as any).update[vgChannel] = test2;
          }
        }
      });
    }
    console.log('final', vgSpec);
    return vgSpec;
  }
};

const compile = (vlSpec: VlContourUnitSpec): vega.Spec => {
  return compileUnitVlContour(vlSpec);
};

export default compile;
