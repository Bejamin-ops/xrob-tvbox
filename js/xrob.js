// Xrob spider for FongMi TVBox (JS) — 仅收录"直连可播"的源
// 依赖宿主 req(url, options) -> {code, content}

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

/* ================= 黄果短剧 ================= */
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

/* ================= 91 短视频 ================= */
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

/* ================= 每日大赛 ================= */
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

/* ---- 适配 FongMi TVBox 的 JS 接口命名 ---- */
function xrobAdapt(s) {
    s.homeContent = function (filter) { return s.home(filter || {}); };
    s.homeVod = function () { return J({ list: [] }); };
    s.categoryContent = function (tid, pg, filter, extend) { return s.category(tid, pg, filter, extend); };
    s.detailContent = function (ids) {
        var id = "";
        if (typeof ids === "string") id = ids;
        else if (ids && ids.length) id = String(ids[0]);
        return s.detail(id);
    };
    s.playerContent = function (flag, id, flags) { return s.play(flag, id, flags); };
    s.searchContent = function (wd, quick) { return s.search(wd, quick); };
    if (!s.init) s.init = function (cfg) { };
    return s;
}
xrobAdapt(csp_XrobHuangguo);
xrobAdapt(csp_Xrob91);
xrobAdapt(csp_XrobMrds);
