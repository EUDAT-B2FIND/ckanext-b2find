import pandas as pd
from bokeh.models import CustomJS, RangeSlider
from bokeh.embed import components

import ckan.lib.search
from ckan.common import c


def get_data(search_params):
    search_facet = "extras_PublicationYear"
    solr_params = {
        'echoParams': 'none',
        'rows': 0,
        'wt': 'json',
        'q': search_params.get('q', '*'),
        'fq': search_params.get('fq', []),
        'facet': 'true',
        'facet.sort': 'index',
        'facet.limit': -1,
        'facet.field': [search_facet],
    }
    solr = ckan.lib.search.make_connection()
    results = solr.search(**solr_params)
    result_counts = results.facets["facet_fields"][search_facet]
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
    df = pd.DataFrame(list(zip(x, y)), columns=['years', 'counts'])
    # only keep year as string (signed)
    df["years"] = pd.to_numeric(df["years"], downcast="signed")
    return df


def plot(df):
    callback = CustomJS(code="""
        // console.log('date_range_slider: value=' + this.value, this.toString());
        var form = $(".search-form");
        $(['ext_startdate', 'ext_enddate']).each(function(index, item){
            if ($("#" + item).length === 0) {
                $('<input type="hidden" />').attr({'id': item, 'name': item}).appendTo(form);
            }
        });
        $('#ext_startdate').val(this.value[0]);
        $('#ext_enddate').val(this.value[1]);
        form.submit();
    """)
    start = df.years[0]
    end = df.years[len(df)-1]
    if start == end:
        end = start + 1
    slider = RangeSlider(
        title="Selected Years",
        value=(start, end),
        start=start,
        end=end,
        sizing_mode="stretch_width",
        max_width=260,
    )
    slider.js_on_change("value_throttled", callback)
    return slider


def html_components(search_params):
    df = get_data(search_params)
    return components(plot(df))


def before_search(search_params):
    extras = search_params.get('extras')
    if not extras:
        # There are no extras in the search params, so do nothing.
        return search_params

    start_date = extras.get('ext_startdate')
    end_date = extras.get('ext_enddate')

    if not start_date and not end_date:
        # The user didn't select either a start and/or end date, so do nothing.
        return search_params
    if not start_date:
        start_date = '*'
    if not end_date:
        end_date = '*'

    # Add a date-range query with the selected start and/or end dates into the Solr facet queries.
    fq = search_params.get('fq', '')
    fq = f"{fq}+extras_PublicationYear:[{start_date} TO {end_date}]"

    search_params['fq'] = fq

    return search_params


def after_search(search_params):
    c.pubyear_script, c.pubyear_plot = html_components(search_params)
