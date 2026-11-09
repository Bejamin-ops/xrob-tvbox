export default {
  init(cfg) {},
  homeContent(f) { return JSON.stringify({ class: [{ type_id: "t", type_name: "诊断分类" }], list: [] }); },
  homeVod() { return JSON.stringify({ list: [] }); },
  categoryContent(t, p) { return JSON.stringify({ page: 1, pagecount: 1, limit: 10, total: 3, list: [
      { vod_id: "1", vod_name: "诊断条目一", vod_pic: "", vod_remarks: "static" },
      { vod_id: "2", vod_name: "诊断条目二", vod_pic: "", vod_remarks: "static" },
      { vod_id: "3", vod_name: "诊断条目三", vod_pic: "", vod_remarks: "static" } ] }); },
  detailContent(ids) { return JSON.stringify({ list: [{ vod_id: "1", vod_name: "诊断条目一", vod_play_from: "测试", vod_play_url: "第1集$http://example.com/a.m3u8" }] }); },
  playerContent(flag, id) { return JSON.stringify({ parse: 0, url: "http://example.com/a.m3u8" }); },
  searchContent(wd) { return JSON.stringify({ list: [] }); }
};
