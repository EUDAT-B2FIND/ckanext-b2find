import pandas as pd
from bokeh.plotting import figure
from bokeh.layouts import column
from bokeh.models import ColumnDataSource, RangeTool
from bokeh.models import CustomJS, RangeSlider, Button
from bokeh.embed import components

import ckan.lib.search
from ckan.common import c

import logging

LOGGER = logging.getLogger(__name__)


def start_date(search_params):
    facet = "extras_TemporalCoverageBeginDate"
    start, end = parse_params(search_params)
    if start:
        start = f"{start}-01-01T00:00:00Z"
    else:
        start = "*"
    if end:
        end = f"{end}-12-31T23:59:59Z"
    else:
        end = "*"
    fq = search_params.get('fq', [])
    fq.append(f"+{facet}:[{start} TO {end}]")
    LOGGER.debug(f"fq={fq}")
    solr = ckan.lib.search.make_connection()
    solr_params = {
        'echoParams': 'none',
        'rows': 1,
        'wt': 'json',
        'q': search_params.get('q', '*'),
        'fq': fq,
        'fl': facet,
        'sort': f"{facet} asc",
        'indent': 'false',
    }
    results = solr.search(**solr_params)
    new_start = results.docs[0][facet].isoformat()+'Z'
    return new_start


def end_date(search_params):
    facet = "extras_TemporalCoverageEndDate"
    start, end = parse_params(search_params)
    if start:
        start = f"{start}-01-01T00:00:00Z"
    else:
        start = "*"
    if end:
        end = f"{end}-12-31T23:59:59Z"
    else:
        end = "*"
    fq = search_params.get('fq', [])
    fq.append(f"+{facet}:[{start} TO {end}]")
    LOGGER.debug(f"fq={fq}")
    solr = ckan.lib.search.make_connection()
    solr_params = {
        'echoParams': 'none',
        'rows': 1,
        'wt': 'json',
        'q': search_params.get('q', '*'),
        'fq': fq,
        'fl': facet,
        'sort': f"{facet} desc",
        'indent': 'false',
    }
    results = solr.search(**solr_params)
    new_end = results.docs[0][facet].isoformat()+'Z'
    return new_end


def get_data(search_params):
    search_facet = "extras_TempCoverage"
    start = start_date(search_params)
    end = end_date(search_params)
    solr = ckan.lib.search.make_connection()
    solr_params = {
        'echoParams': 'none',
        'rows': 0,
        'wt': 'json',
        'q': search_params.get('q', '*'),
        'fq': search_params.get('fq', []),
        'facet': 'true',
        'facet.range': [
            search_facet,
        ],
        'facet.range.start': f'{start}/YEAR',
        'facet.range.end': f'{end}/YEAR',
        'facet.range.gap': '+1YEARS',
    }
    results = solr.search(**solr_params)
    result_counts = results.facets["facet_ranges"][search_facet]["counts"]
    # x values, even
    x = result_counts[0::2]
    # y values, odd
    y = result_counts[1::2]

    # skip zero counts at the start and end
    start = list(map(lambda val: val > 0, y)).index(True)
    end = list(map(lambda val: val > 0, reversed(y))).index(True)
    end = len(y) - end

    x = x[start:end]
    y = y[start:end]

    # build dataframe
    df = pd.DataFrame(list(zip(x, y)), columns=['date', 'counts'])
    # only keep year as string (signed)
    df["years"] = df["date"].str[:-16]
    df["years"] = pd.to_numeric(df["years"], downcast="signed")
    return df


def plot_preview(df):
    source = ColumnDataSource(df)

    p = figure(plot_height=200,
               title=None,
               y_axis_type=None,
               sizing_mode="stretch_width",
               max_width=280,
               toolbar_location=None,
               tools="",)

    p.line(
        x="years", y="counts", source=source,
        line_width=1,
        color="blue", alpha=0.5)

    p.xaxis.visible = True
    p.yaxis.visible = False
    p.xgrid.grid_line_color = None
    p.y_range.start = 0

    # apply button
    apply_button = Button(
        label="Apply",
        button_type="success",
        sizing_mode="stretch_width",
        max_width=260,
        disabled=True,
    )
    # events
    apply_button.js_on_click(CustomJS(code="""
        // console.log('button: click!', this.toString());
        var form = $(".search-form");
        form.submit();
    """))

    # select range slider
    start = df.years.loc[0]
    end = df.years.loc[len(df)-1]

    callback = CustomJS(args=dict(xr=p.x_range, button=apply_button), code="""
        console.log("update "+this.value);
        // update form for ext_tstart and ext_tend
        var form = $(".search-form");
        $(['ext_tstart', 'ext_tend']).each(function(index, item){
            if ($("#" + item).length === 0) {
                $('<input type="hidden" />').attr({'id': item, 'name': item}).appendTo(form);
            }
        });
        var start = parseInt(this.value[0]);
        var end = parseInt(this.value[1]);
        $('#ext_tstart').val(start);
        $('#ext_tend').val(end);
        // update plot
        xr.start = start;
        xr.end = end;
        // enable apply button
        button.disabled = false;
    """)

    select = RangeSlider(
            title="Selected years",
            value=(start, end),
            start=start,
            end=end,
            step=1,
            # format="0",
            sizing_mode="stretch_width",
            max_width=260)
    select.js_on_change("value", callback)

    layout = column(select, p, apply_button)

    return layout


def plot(df):
    source = ColumnDataSource(df)

    p = figure(
        plot_height=300, plot_width=800,
        tools="xpan",
        toolbar_location=None,
        # x_axis_type="datetime",
        x_axis_location="above",
        background_fill_color="#efefef",
        x_range=(df.years.loc[1], df.years.loc[len(df)-1]))

    p.line('years', 'counts', source=source)
    p.yaxis.axis_label = 'Number of Datasets per Year'

    select = figure(
        title="Drag the middle and edges of the selection box to change the range above",
        plot_height=130, plot_width=800,
        y_range=p.y_range,
        # x_axis_type="datetime",
        y_axis_type=None,
        tools="",
        toolbar_location=None,
        background_fill_color="#efefef")

    range_tool = RangeTool(x_range=p.x_range)
    range_tool.overlay.fill_color = "navy"
    range_tool.overlay.fill_alpha = 0.2

    select.line('years', 'counts', source=source)
    select.ygrid.grid_line_color = None
    select.add_tools(range_tool)
    select.toolbar.active_multi = range_tool
    return column(p, select)


def html_components(search_params):
    df = get_data(search_params)
    comps = {}
    # comps["plot"] = components(plot(df))
    comps["preview"] = components(plot_preview(df))
    return comps


def parse_params(search_params):
    extras = search_params.get('extras')
    if extras:
        start = extras.get('ext_tstart')
        end = extras.get('ext_tend')
    else:
        start = end = None
    return start, end


def before_search(search_params):
    start, end = parse_params(search_params)

    if not start and not end:
        # The user didn't select either a start and/or end date, so do nothing.
        return search_params
    start = start or '*'
    end = end or '*'

    # Add a date-range query with the selected start and/or end dates into the Solr facet queries.
    fq = search_params.get('fq', '')
    fq = f"{fq}+extras_TempCoverage:[{start}-01-01T00:00:00Z TO {end}-12-31T23:59:59Z]"

    search_params['fq'] = fq

    return search_params


def after_search(search_params):
    comps = html_components(search_params)
    # c.timeline_script = comps["plot"][0]
    # c.timeline_plot = comps["plot"][1]
    c.timeline_preview_script = comps["preview"][0]
    c.timeline_preview_plot = comps["preview"][1]
    return search_params
