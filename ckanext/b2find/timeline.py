import pandas as pd
from bokeh.plotting import figure
from bokeh.models import ColumnDataSource
from bokeh.embed import components
import time

import ckan.lib.search

years = year = 60 * 60 * 24 * 365
year1epochsec = 62135600400
now = year1epochsec + int(time.time())

facet = "extras_TempCoverageBegin"
# facet = "extras_TempCoverageEnd"
min = now-100*years
max = now+10*years
num_intervals = 10
interval = int((max-min)/num_intervals)


def get_data(search_params):
    solr = ckan.lib.search.make_connection()
    solr_params = {
        # 'echoParams': 'none',
        'rows': 0,
        # 'wt': 'json',
        'q': search_params.get('q', '*'),
        'fq': search_params.get('fq', []),
        'facet': 'false',
        # 'indent': 'false',
        'fl': 'id',
        'group': 'true',
        'group.limit': 1,
        'group.query': []
    }
    query = 'extras_TempCoverageBegin:[* TO {end}] AND extras_TempCoverageEnd:[{start} TO *]'
    x = []
    y = []

    for i in range(num_intervals):
        start = int(min + i * interval)
        end = int(min + (i+1) * interval)
        group_query = query.format(start=start, end=end)
        solr_params["group.query"].append(group_query)
        x.append(start-year1epochsec)
        results = solr.search(**solr_params)

    for val in results.grouped.values():
        num_found = val['doclist']['numFound']
        y.append(num_found)

    df = pd.DataFrame(list(zip(x, y)), columns=['date', 'counts'])
    df["date"] = pd.to_datetime(df["date"], unit="s")
    return df


def plot(search_params):
    source = ColumnDataSource(get_data(search_params))

    p = figure(plot_height=250,
               title=None,
               x_axis_type="datetime",
               y_axis_type=None,
               sizing_mode="stretch_width",
               max_width=280,
               toolbar_location=None,
               tools="",)

    p.line(
        x="date", y="counts", source=source,
        line_width=1,
        color="blue", alpha=0.5)

    p.xaxis.visible = True
    p.yaxis.visible = False
    p.xgrid.grid_line_color = None
    p.y_range.start = 0
    return p


def html_components(search_params):
    return components(plot(search_params))
