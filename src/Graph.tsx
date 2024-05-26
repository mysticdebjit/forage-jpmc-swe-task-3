import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

interface IProps {
  data: ServerRespond[];
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      timestamp: 'string',
      ratio: 'float',
      lower_bound: 'float',
      upper_bound: 'float',
      trigger_alert: 'float',
    };

    const table = window.perspective.worker().table(schema);
    elem.load(table);

    elem.setAttribute('view', 'y_line');
    elem.setAttribute('row-pivots', '["timestamp"]');
    elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
    elem.setAttribute('aggregates', JSON.stringify({
      stock: 'distinct count',
      top_ask_price: 'avg',
      timestamp: 'distinct count',
      ratio: 'avg',
      lower_bound: 'avg',
      upper_bound: 'avg',
      trigger_alert: 'avg',
    }));

    this.table = table;
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        this.props.data.map((el: any) => {
          const priceABC = (el[0].top_ask.price + el[0].top_bid.price) / 2;
          const priceDEF = (el[1].top_ask.price + el[1].top_bid.price) / 2;
          const ratio = priceABC / priceDEF;
          const upperBound = 1.05;
          const lowerBound = 0.95;
          const triggerAlert = (ratio > upperBound || ratio < lowerBound) ? ratio : undefined;

          return {
            stock: el.stock,
            top_ask_price: el.top_ask && el.top_ask.price,
            timestamp: el.timestamp,
            ratio,
            lower_bound: lowerBound,
            upper_bound: upperBound,
            trigger_alert: triggerAlert,
          };
        }),
      ]);
    }
  }
}

export default Graph;
