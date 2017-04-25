$(function() {
    // load page with USA and 2015 buttons classified as active.
    $('#USA').addClass('active');
    $('#1959-2014').addClass('active');

    // d3 code
    d3.csv('data/formatted.csv', function(error, data) {
        // Setting defaults
        var margin = {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = 960,
            height = 500,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            region = 'USA',
            timePeriod = '1959-2014'

        var div = d3.select('#vis')
            .append('div')
            .attr('height', height)
            .attr('width', width)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        // variables used in creating the viz
        var nestedData, root, types, colorScale;

        // filter the initial data set by the selected parameters.
        // The initial filter uses 'USA' and '2015'
        var filterData = function() {
          var curData = data.filter(function(d) {
            return d.Region == region && d.Period == timePeriod;
          });

          // Create a nested version of the data. Nesting by cause classification
          nestedData = d3.nest()
            .key((d) => d.Type)
            .entries(curData);

          // Create the root node for the nested data structure
          root = d3.hierarchy({
            values: nestedData
          }, function(d) {
            return d.values;
          });

          // get a list of the classification of the casues.
          types = nestedData.map((d) => d.key);

          // create a color scale for using the different types established above.
          colorScale = d3.scaleOrdinal().domain(types).range(d3.schemeCategory10);
        }

        // Treemap layout function
        var treemap = d3.treemap()
            .size([width, height])
            .round(true)
            .tile(d3.treemapResquarify)
            .padding(2);

        // draws the viz. Can be reused with different versions of the data.
        var draw = function() {

            // update the root
            root.sum(function(d) {
              return +d["Count"];
            });

            // update the layout given the updated root
            treemap(root);

            // Add the individual divs that will make up the treemap. Divs
            // are used to make adding text more simplistic
            var nodes = div.selectAll(".node").data(root.leaves());
            nodes.enter()
              .append("div")
              .merge(nodes)
              .html(function(d) {
                  return d.data.Cause + "<br> Total: " + d.data.Count;
              })
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

            // remove any nodes that are leaving.
            nodes.exit().remove();
        };

        // Perform initial filter and draw
        filterData();
        draw();

        // listen for changes to the inputs. Update the viz on change
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
