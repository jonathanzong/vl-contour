import { SceneGroup, Spec, View, parse } from 'vega';
import { compile } from 'vega-lite';

export async function getVegaScene(spec: Spec): Promise<SceneGroup> {
  const runtime = parse(spec);
  let view = await new View(runtime).renderer('svg').hover().runAsync();

  return (view.scenegraph() as any).root.items[0] as SceneGroup;
}

export async function getData(spec) {
  const data = structuredClone(spec.data) as any;

  // if (data.url) {
  //   if (data.url.startsWith('data/')) {
  //     data.url = 'https://raw.githubusercontent.com/vega/vega-datasets/master/' + data.url;
  //   }
  // }

  const vlSpec = {
    data: data,
    mark: 'point',
  };

  const scene = await getVegaScene(compile(vlSpec as any).spec);

  try {
    const datasets = (scene as any).context.data;
    const names = Object.keys(datasets).filter((name) => {
      return name.match(/(source)|(data)_\d/);
    });
    const name = names.reverse()[0]; // TODO do we know this is the right one?
    const dataset = datasets[name].values.value;

    return dataset;
  } catch (error) {
    throw new Error(`No data found in the Vega scenegraph \n ${error}`);
  }
}
