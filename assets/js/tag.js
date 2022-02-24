$("[data-tag]").click((e) => {
    currentTag = e.target.dataset.tag;
    filterByTagName(currentTag);
})

function updateQueryString(tagName) {
    const path = '${location.protocol}//${location.host}${location.pathname}?tag=${tagName}';
    window.history.replaceState({path}, '', path);
}

function getQuery() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (str, key, value) {
            params[key] = value;
        }
    );
    return params;
}

$(document).ready(function () {
    let currentTag = "";
    const queryTag = getQuery().tag;
    if (queryTag) {
        currentTag = queryTag;
        filterByTagName(currentTag)
    }
});


function filterByTagName(tagName) {
    $('.hidden').removeClass('d-none');
    $('.post-wrapper').each((index, elem) => {
        if (!elem.hasAttribute(`data-${tagName}`)) {
            $(elem).addClass('d-none');
        }
    });
    $(`.tag`).removeClass('selected');
    $(`.tag[data-tag=${tagName}]`).addClass('selected');
}
