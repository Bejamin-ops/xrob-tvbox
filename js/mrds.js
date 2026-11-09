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


var csp_XrobMrds = {
    init: function () { },
    home: function () {
        return J({
            class: [
                { type_id: "", type_name: "最新" },
                { type_id: "/category/mrds", type_name: "每日大赛" },
                { type_id: "/category/rstt", type_name: "热搜吃瓜" }
            ]
        });
    },
    category: function (tid, pg) {
        var path = tid || "";
        var url = "https://abandon.tfqwtrch.cc" + path + (pg > 1 ? ("/" + pg + "/") : (path ? "/" : ""));
        var html = R(url, { "User-Agent": XU, "Referer": "https://abandon.tfqwtrch.cc/" });
        var list = [], seen = {}, parts = html.split(/<article[\s>]/i);
        for (var i = 1; i < parts.length; i++) {
            var b = parts[i];
            var im = b.match(/\/archives\/(\d+)\//);
            if (!im) continue;
            var id = im[1];
            if (seen[id]) continue;
            var tm = b.match(/post-card-title[^>]*>([\s\S]*?)<\/h2>/i);
            if (!tm) continue;
            var title = strip(tm[1].replace(/<div[^>]*wrap[\s\S]*?<\/div>/i, " "));
            if (!title) continue;
            var cm = b.match(/loadBannerDirect\(\s*'([^']+)'/i);
            seen[id] = 1;
            list.push({ vod_id: id, vod_name: title, vod_pic: cm ? cm[1] : "", vod_remarks: "" });
        }
        return J({ page: pg, pagecount: list.length ? 9999 : 1, limit: 30, total: 9999, list: list });
    },
    detail: function (id) {
        var html = R("https://abandon.tfqwtrch.cc/archives/" + id + "/",
            { "User-Agent": XU, "Referer": "https://abandon.tfqwtrch.cc/" });
        var name = "每日大赛 " + id, urls = [], seen = {};
        var m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (m) name = strip(m[1]);
        var re = /"video"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/g, x;
        while ((x = re.exec(html))) {
            var u = x[1].replace(/\\\//g, "/");
            if (u.indexOf("https://") === 0) u = "http://" + u.slice(8);
            if (!seen[u]) { seen[u] = 1; urls.push(u); }
        }
        if (!urls.length) return J({ list: [] });
        var eps = [];
        for (var i = 0; i < urls.length; i++) eps.push("视频" + (i + 1) + "$" + urls[i]);
        return J({ list: [{ vod_id: id, vod_name: name, vod_pic: "", vod_play_from: "每日大赛", vod_play_url: eps.join("#") }] });
    },
    play: function (flag, id) {
        return J({ parse: 0, url: String(id), header: { "User-Agent": XU, "Referer": "https://abandon.tfqwtrch.cc/" } });
    },
    search: function (wd) {
        var html = R("https://abandon.tfqwtrch.cc/search/" + encodeURIComponent(wd) + "/",
            { "User-Agent": XU, "Referer": "https://abandon.tfqwtrch.cc/" });
        var list = [], seen = {}, parts = html.split(/<article[\s>]/i);
        for (var i = 1; i < parts.length; i++) {
            var b = parts[i];
            var im = b.match(/\/archives\/(\d+)\//);
            if (!im) continue;
            var id = im[1];
            if (seen[id]) continue;
            var tm = b.match(/post-card-title[^>]*>([\s\S]*?)<\/h2>/i);
            if (!tm) continue;
            seen[id] = 1;
            list.push({ vod_id: id, vod_name: strip(tm[1]), vod_pic: "", vod_remarks: "" });
        }
        return J({ list: list });
    }
};

var obj = csp_XrobMrds;

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
