import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import * as d3 from 'd3';

export class LossAccuracyChart extends PolymerElement {

    static get template() { return html`
      <svg id="loss" width="900" height="300"></svg>
    `;
    }

    static get properties() {
      return {
          width: {
              type: Number,
              value: 900,
              readOnly: true
          },
          height: {
              type: Number,
              value: 300,
              readOnly: true
          }
      };
    }

    ready(){
        super.ready();

        const svg = d3.select(this.root.getElementById("loss")),
            margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const parseTime = d3.timeParse("%d-%b-%y");

        const x = d3.scaleTime()
            .rangeRound([0, width]);

        const y = d3.scaleLinear()
            .rangeRound([height, 0]);

        const line = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.close); });

        d3.tsv("static/data.tsv", function(d) {
                d.date = parseTime(d.date);
                d.close = +d.close;
                return d;
            })
            .then(function(data) {

                data = data.filter(d => d.date!=null);

                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain(d3.extent(data, function(d) { return d.close; }));

                g.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x))
                    .select(".domain")
                    .remove();

                g.append("g")
                    .call(d3.axisLeft(y))
                    .append("text")
                    .attr("fill", "#000")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "0.71em")
                    .attr("text-anchor", "end")
                    .text("Price ($)");

                g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);
            });

    }
}