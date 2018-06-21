import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import * as d3 from 'd3';

export class LossAccuracyChart extends PolymerElement {

    static get template() { return html`
      <div id="loss-chart"></div>
    `;
    }

    static get properties() {
      return {
          width: {
              type: Number,
              value: 900,
              notify: true
          },
          height: {
              type: Number,
              value: 300,
              notify: true
          },
          datasource: {
              type: Array,
              value: () => [[0,0.9],[1,0.5],[5,0.7]],
              notify: true
          }
      };
    }

    ready(){
        super.ready();

        this.chart = d3.select(this.root.getElementById("loss-chart"));

        const svg = this.chart
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        const plotMargins = {
            top: 30,
            bottom: 30,
            left: 30,
            right: 30
        };

        const plotGroup = svg.append('g')
            .classed('plot', true)
            .attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);

        const plotWidth = this.width - plotMargins.left - plotMargins.right;
        const plotHeight = this.height - plotMargins.top - plotMargins.bottom;

        const xScale = d3.scaleLinear()
            .range([0, plotWidth])
            .domain([0,10]);
        const xAxis = d3.axisBottom(xScale);
        const xAxisGroup = plotGroup.append('g')
            .classed('x', true)
            .classed('axis', true)
            .attr('transform', `translate(${0},${plotHeight})`)
            .call(xAxis);

        const yScale = d3.scaleLinear()
            .range([plotHeight, 0])
            .domain([0,1]);
        const yAxis = d3.axisLeft(yScale);
        const yAxisGroup = plotGroup.append('g')
            .classed('y', true)
            .classed('axis', true)
            .call(yAxis);

        plotGroup.selectAll("circle")
            .data(this.datasource)
            .enter()
            .append("circle")
            .style("fill", "orange")
            .attr("cx", function(d) { return xScale(d[0]); })
            .attr("cy", function(d) { return yScale(d[1]); })
            .attr("r", 5);

        /*const line = d3.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); });*/

        /*xScale.domain(d3.extent(this.datasource, d => d[0]));*/

        /*plotGroup.append("path")
            .datum(this.datasource)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line)*/

        this.datasource.push([6,0.25]);

    }

    next(){
        this.datasource.push([8,0.35]);
    }
}