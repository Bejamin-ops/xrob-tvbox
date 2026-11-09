var XU = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function J(o) { return JSON.stringify(o); }
function R(url, headers, method, body) {
    var opt = { method: method || "GET", headers: headers || {} };
    if (body !== null && body !== undefined) opt.body = body;
    var r = req(url, opt);
    if (!r) return "";
    return r.content !== undefined ? r.content : String(r);
}
function strip(s) { return String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""); }


var csp_Xrob91 = {
    init: function () { },
    home: function () {
        return J({ class: [{ type_id: "melonshort", type_name: "推荐" }, { type_id: "hot", type_name: "热门" }] });
    },
    category: function (tid, pg) {
        var cat = tid || "melonshort";
        var html = R("https://91porna.com/comic/index/video?category=" + encodeURIComponent(cat) + (pg > 1 ? "&page=" + pg : ""),
            { "User-Agent": XU, "Referer": "https://91porna.com/" });
        var list = [], seen = {};
        var re = /video_key=(\d+)[\s\S]{0,1500}?data-src="([^"]+)"[\s\S]{0,800}?alt="([^"]*)"/g, m;
        while ((m = re.exec(html)) && list.length < 40) {
            if (seen[m[1]]) continue;
            seen[m[1]] = 1;
            list.push({ vod_id: m[1], vod_name: m[3] || ("视频 " + m[1]), vod_pic: m[2] || "", vod_remarks: "" });
        }
        return J({ page: pg, pagecount: list.length ? 9999 : 1, limit: 40, total: 9999, list: list });
    },
    detail: function (id) {
        var txt = R("https://91porna.com/api/videos/" + id + "/playback",
            { "User-Agent": XU, "Referer": "https://91porna.com/", "Content-Type": "application/json" }, "POST", "{}");
        var url = "";
        try {
            var d = JSON.parse(txt);
            var s = (d.data && d.data.streams) || d.streams || {};
            url = s.main || s.hevc || "";
        } catch (e) { }
        var eps = url ? ("正片$" + url) : ("正片$" + id);
        return J({ list: [{ vod_id: id, vod_name: "91短视频 " + id, vod_pic: "", vod_play_from: "91", vod_play_url: eps }] });
    },
    play: function (flag, id) {
        if (/^https?:/i.test(String(id))) return J({ parse: 0, url: String(id), header: { "User-Agent": XU, "Referer": "https://91porna.com/" } });
        var txt = R("https://91porna.com/api/videos/" + id + "/playback",
            { "User-Agent": XU, "Referer": "https://91porna.com/", "Content-Type": "application/json" }, "POST", "{}");
        var url = "";
        try {
            var d = JSON.parse(txt);
            var s = (d.data && d.data.streams) || d.streams || {};
            url = s.main || s.hevc || "";
        } catch (e) { }
        return J({ parse: 0, url: url, header: { "User-Agent": XU, "Referer": "https://91porna.com/" } });
    },
    search: function (wd) {
        var html = R("https://91porna.com/comic/index/search?keyword=" + encodeURIComponent(wd),
            { "User-Agent": XU, "Referer": "https://91porna.com/" });
        var list = [], seen = {}, re = /video_key=(\d+)[\s\S]{0,1500}?data-src="([^"]+)"[\s\S]{0,800}?alt="([^"]*)"/g, m;
        while ((m = re.exec(html)) && list.length < 40) {
            if (seen[m[1]]) continue;
            seen[m[1]] = 1;
            list.push({ vod_id: m[1], vod_name: m[3] || ("视频 " + m[1]), vod_pic: m[2] || "", vod_remarks: "" });
        }
        return J({ list: list });
    }
};

var obj = csp_Xrob91;

obj.homeContent = function (f) { return obj.home(f || {}); };
obj.homeVod = function () { return J({ list: [] }); };
obj.categoryContent = function (t, p, fl, ex) { return obj.category(t, p, fl, ex); };
obj.detailContent = function (ids) {
    var id = typeof ids === "string" ? ids : (ids && ids.length ? String(ids[0]) : "");
    return obj.detail(id);
};
obj.playerContent = function (flag, id, flags) { return obj.play(flag, id, flags); };
obj.searchContent = function (wd, q) { return obj.search(wd, q); };
obj.init = obj.init || function (cfg) { };
export default obj;
