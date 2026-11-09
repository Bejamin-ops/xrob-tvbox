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


var csp_XrobHuangguo = {
    init: function () { },
    home: function () {
        return J({ class: [{ type_id: "hot", type_name: "热门" }, { type_id: "new", type_name: "最新" }] });
    },
    category: function (tid, pg) {
        var sort = tid === "new" ? "latest" : "hot";
        var txt = R("https://huangguoai.com/api/videos?page=" + pg + "&page_size=24&sort=" + sort,
            { "User-Agent": XU, "Referer": "https://huangguoai.com/" });
        var list = [];
        try {
            var items = (JSON.parse(txt).data || {}).items || [];
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                list.push({
                    vod_id: String(it.id), vod_name: it.title || it.name || "",
                    vod_pic: it.cover || "",
                    vod_remarks: it.episode_count ? ("全" + it.episode_count + "集") : ""
                });
            }
        } catch (e) { }
        return J({ page: pg, pagecount: list.length ? 9999 : 1, limit: 24, total: 9999, list: list });
    },
    detail: function (id) {
        var txt = R("https://huangguoai.com/api/videos/" + id,
            { "User-Agent": XU, "Referer": "https://huangguoai.com/" });
        var name = id, cover = "", eps = [];
        try {
            var v = JSON.parse(txt).data || {};
            name = v.title || v.name || id;
            cover = v.cover || "";
            var es = v.episodes || [];
            for (var i = 0; i < es.length; i++) {
                var n = es[i].ep_num || es[i].episode || (i + 1);
                eps.push("第" + n + "集$" + id + "@" + n);
            }
        } catch (e) { }
        if (!eps.length) eps.push("第1集$" + id + "@1");
        return J({ list: [{ vod_id: id, vod_name: name, vod_pic: cover, vod_play_from: "黄果", vod_play_url: eps.join("#") }] });
    },
    play: function (flag, id) {
        var p = String(id).split("@"), did = p[0], ep = p[1] || "1";
        var txt = R("https://huangguoai.com/api/videos/" + did + "/play?ep=" + ep,
            { "User-Agent": XU, "Referer": "https://huangguoai.com/" });
        var url = "";
        try {
            var d = JSON.parse(txt).data || {};
            url = d.video_url || d.play_url || d.url || "";
        } catch (e) { }
        return J({ parse: 0, url: url, header: { "User-Agent": XU, "Referer": "https://huangguoai.com/" } });
    },
    search: function (wd) {
        var txt = R("https://huangguoai.com/api/search?q=" + encodeURIComponent(wd) + "&page=1",
            { "User-Agent": XU, "Referer": "https://huangguoai.com/" });
        var list = [];
        try {
            var items = (JSON.parse(txt).data || {}).items || [];
            for (var i = 0; i < items.length; i++) {
                list.push({ vod_id: String(items[i].id), vod_name: items[i].title || "", vod_pic: items[i].cover || "", vod_remarks: "" });
            }
        } catch (e) { }
        return J({ list: list });
    }
};

var obj = csp_XrobHuangguo;

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
