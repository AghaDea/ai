(function (g) {
  var PATHS = ['Config/config.cfg', '../Config/config.cfg', '/Config/config.cfg'];
  function parseCfg(text) {
    var out = {};
    String(text || '').split(/\r?\n/).forEach(function (line) {
      line = line.replace(/#.*$/, '').trim();
      if (!line) return;
      var i = line.indexOf('=');
      if (i < 1) return;
      var k = line.slice(0, i).trim();
      var v = line.slice(i + 1).trim();
      if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) v = v.slice(1, -1);
      out[k] = v;
    });
    return out;
  }
  function apply(cfg) {
    g.CH_CONFIG = cfg || {};
    if (cfg.SUPABASE_URL) g.SUPABASE_URL = cfg.SUPABASE_URL;
    if (cfg.SUPABASE_ANON_KEY) g.SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;
    return cfg;
  }
  g.loadChConfig = function () {
    if (g.__chConfigPromise) return g.__chConfigPromise;
    g.__chConfigPromise = (async function () {
      var lastErr = null;
      for (var i = 0; i < PATHS.length; i++) {
        try {
          var res = await fetch(PATHS[i], { cache: 'no-store' });
          if (!res.ok) continue;
          var cfg = parseCfg(await res.text());
          if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) return apply(cfg);
        } catch (e) { lastErr = e; }
      }
      if (g.SUPABASE_URL && g.SUPABASE_ANON_KEY) return apply({ SUPABASE_URL: g.SUPABASE_URL, SUPABASE_ANON_KEY: g.SUPABASE_ANON_KEY });
      throw lastErr || new Error('Config not found');
    })();
    return g.__chConfigPromise;
  };
})(typeof window !== 'undefined' ? window : globalThis);
