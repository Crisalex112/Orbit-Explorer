const SVG_NS = 'http://www.w3.org/2000/svg';

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function extent(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
}

export function renderScatter(container, bodies, options) {
  container.innerHTML = '';
  const width = 900;
  const height = 480;
  const margin = { top: 36, right: 38, bottom: 64, left: 76 };
  const xValues = bodies.map((body) => Number(body[options.xKey]));
  const yValues = bodies.map((body) => Number(body[options.yKey]));
  const [xMin, xMax] = extent(xValues);
  const [yMin, yMax] = extent(yValues);
  const x = (value) => margin.left + (value - xMin) / (xMax - xMin) * (width - margin.left - margin.right);
  const y = (value) => height - margin.bottom - (value - yMin) / (yMax - yMin) * (height - margin.top - margin.bottom);

  const svg = svgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': `${options.xLabel} versus ${options.yLabel}`
  });
  svg.classList.add('scatter-svg');

  for (let tick = 0; tick <= 5; tick += 1) {
    const xValue = xMin + (xMax - xMin) * tick / 5;
    const yValue = yMin + (yMax - yMin) * tick / 5;
    const xPosition = x(xValue);
    const yPosition = y(yValue);

    svg.append(svgElement('line', {
      x1: xPosition, y1: margin.top, x2: xPosition, y2: height - margin.bottom,
      class: 'chart-grid'
    }));
    svg.append(svgElement('line', {
      x1: margin.left, y1: yPosition, x2: width - margin.right, y2: yPosition,
      class: 'chart-grid'
    }));

    const xText = svgElement('text', {
      x: xPosition, y: height - margin.bottom + 28,
      'text-anchor': 'middle', class: 'chart-label'
    });
    xText.textContent = options.formatX ? options.formatX(xValue) : xValue.toFixed(1);
    svg.append(xText);

    const yText = svgElement('text', {
      x: margin.left - 16, y: yPosition + 5,
      'text-anchor': 'end', class: 'chart-label'
    });
    yText.textContent = options.formatY ? options.formatY(yValue) : yValue.toFixed(1);
    svg.append(yText);
  }

  svg.append(svgElement('line', {
    x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom,
    class: 'chart-axis'
  }));
  svg.append(svgElement('line', {
    x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom,
    class: 'chart-axis'
  }));

  const xTitle = svgElement('text', {
    x: (margin.left + width - margin.right) / 2,
    y: height - 16,
    'text-anchor': 'middle', class: 'chart-title'
  });
  xTitle.textContent = options.xLabel;
  svg.append(xTitle);

  const yTitle = svgElement('text', {
    x: 20,
    y: (margin.top + height - margin.bottom) / 2,
    transform: `rotate(-90 20 ${(margin.top + height - margin.bottom) / 2})`,
    'text-anchor': 'middle', class: 'chart-title'
  });
  yTitle.textContent = options.yLabel;
  svg.append(yTitle);

  for (const body of bodies) {
    const group = svgElement('g', { class: 'chart-point-group' });
    const circle = svgElement('circle', {
      cx: x(body[options.xKey]),
      cy: y(body[options.yKey]),
      r: body.name === 'Tierra' ? 10 : 7,
      fill: body.color || '#7ed6ff',
      class: body.name === 'Tierra' ? 'chart-point earth-point' : 'chart-point'
    });
    const title = svgElement('title');
    title.textContent = `${body.name}: ${options.xLabel} ${body[options.xKey]}, ${options.yLabel} ${body[options.yKey]}`;
    circle.append(title);
    group.append(circle);

    const label = svgElement('text', {
      x: x(body[options.xKey]) + 11,
      y: y(body[options.yKey]) - 10,
      class: 'point-label'
    });
    label.textContent = body.name;
    group.append(label);
    svg.append(group);
  }

  container.append(svg);
}
