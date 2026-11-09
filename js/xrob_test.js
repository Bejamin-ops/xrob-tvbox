// 诊断用：不联网，直接返回固定数据，用来判断 spider 是否被正确加载
var csp_XrobTest = {
    init: function (cfg) { },
    homeContent: function (filter) {
        return JSON.stringify({
            class: [{ type_id: "t", type_name: "诊断分类" }],
            list: []
        });
    },
    homeVod: function () { return JSON.stringify({ list: [] }); },
    categoryContent: function (tid, pg) {
        return JSON.stringify({
            page: 1, pagecount: 1, limit: 10, total: 3,
            list: [
                { vod_id: "1", vod_name: "诊断条目一", vod_pic: "", vod_remarks: "static" },
                { vod_id: "2", vod_name: "诊断条目二", vod_pic: "", vod_remarks: "static" },
                { vod_id: "3", vod_name: "诊断条目三", vod_pic: "", vod_remarks: "static" }
            ]
        });
    },
    detailContent: function (ids) {
        return JSON.stringify({ list: [{ vod_id: "1", vod_name: "诊断条目一", vod_play_from: "测试", vod_play_url: "第1集$http://example.com/a.m3u8" }] });
    },
    playerContent: function (flag, id) { return JSON.stringify({ parse: 0, url: "http://example.com/a.m3u8" }); },
    searchContent: function (wd) { return JSON.stringify({ list: [] }); }
};
