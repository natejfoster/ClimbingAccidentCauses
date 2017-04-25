/* Create a treemap of country level measures. Inspiration drawn from https://bl.ocks.org/mbostock/4063582.
 */
$(function() {
    // Read in your data. On success, run the rest of your code
    d3.csv('data/formatted.csv', function(error, data) {
        // Setting defaults
        var margin = {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = 960,
            height = 1000,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            region = 'USA',
            timePeriod = '2015'

        // Append a wrapper div for the chart
        var div = d3.select('#vis')
            .append("div")
            .attr('height', height)
            .attr('width', width)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        /* ********************************** Create hierarchical data structure & treemap function  ********************************** */
        var nestedData, root, types, colorScale;
        var filterData() = function() {
          var curData = data.filter(function(d) {
            return d.Region == region && d.Period == timePeriod;
          });
          nestedData = d3.nest()
            .key((d) => d.Type)
            .entries(curData);
        }
        // Nest your data *by region* using d3.nest()
        var nestedData = d3.nest()
            .key((d) => d.Type)
            .key((d) => d.Period)
            .key((d) => d.Region)
            .entries(data);

        // Define a hierarchy for your data
        var root = d3.hierarchy({
          values: nestedData
        }, function(d) {
          return d.values;
        });

        // Create a *treemap function* that will compute your layout given your data structure
        var treemap = d3.treemap() // function that returns a function!
            .size([width, height]) // set size: scaling will be done internally
            .round(true)
            .tile(d3.treemapResquarify)
            .padding(0);

        /* ********************************** Create an ordinal color scale  ********************************** */

        // Get list of regions for colors
        var types = nestedData.map(function(d) {
            return d.key;
        });

        // Set an ordinal scale for colors
        var colorScale = d3.scaleOrdinal().domain(types).range(d3.schemeCategory10);

        /* ********************************** Write a function to perform the data-join  ********************************** */

        // Write your `draw` function to bind data, and position elements
        var draw = function() {
            root.sum(function(d) {
              return +d["Count"];
            });
            treemap(root);
            var nodes = div.selectAll(".node").data(root.leaves());
            nodes.enter()
                .append("div")
                .text(function(d) {
                    return d.data.Cause;
                })
                .merge(nodes)
                .attr('class', 'node')
                .transition().duration(1500)
                .style("left", function(d, i) {
                    return d.x0 + "px";
                })
                .style("top", function(d) {
                    return d.y0 + "px";
                })
                .style('width', function(d) {
                    return d.x1 - d.x0 + 'px';
                })
                .style("height", function(d) {
                    return d.y1 - d.y0 + "px";
                })
                .style("background", function(d, i) {
                    return colorScale(d.data.Type);
                });
        };

        // Perform the initial draw
        draw();

        // On a change of an input, update the data with the selected filters
        // and then redraw the visualization.
        $("input").on('change', function() {
            var curVal = $(this).val();
            if ($(this).hasClass('option1')) {
              region = curVal;
            } else {
              timePeriod = curVal;
            }
            filterData();
            draw();
        });
    });
});
