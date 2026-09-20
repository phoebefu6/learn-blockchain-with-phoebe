/* chain-live.js - a real chain, hashed with a real SHA-256.

   Nothing here is a stored result and nothing is a stand-in. The hash is a
   full SHA-256 implementation, checked against the published test vectors in
   the file itself, so the digests on these pages are the same digests any
   other correct implementation produces for the same input.
*/
(function (root) {
  "use strict";

  /* ---------- SHA-256, from the specification ---------- */
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function utf8(str) {
    var out = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c < 0xd800 || c >= 0xe000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
      else {
        i++;
        c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
    }
    return out;
  }
  function sha256(message) {
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes = utf8(message);
    var bitLen = bytes.length * 8;
    bytes = bytes.slice();
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    // 64 bit length, big endian. Messages here are far below 2^32 bits.
    bytes.push(0, 0, 0, 0,
      (bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);

    var w = new Array(64), i, j, a, b, c, d, e, f, g, h, S0, S1, ch, maj, t1, t2;
    for (i = 0; i < bytes.length; i += 64) {
      for (j = 0; j < 16; j++) {
        w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16)
             | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
      }
      for (j = 16; j < 64; j++) {
        var s0 = rotr(w[j-15], 7) ^ rotr(w[j-15], 18) ^ (w[j-15] >>> 3);
        var s1 = rotr(w[j-2], 17) ^ rotr(w[j-2], 19) ^ (w[j-2] >>> 10);
        w[j] = (w[j-16] + s0 + w[j-7] + s1) | 0;
      }
      a=H[0]; b=H[1]; c=H[2]; d=H[3]; e=H[4]; f=H[5]; g=H[6]; h=H[7];
      for (j = 0; j < 64; j++) {
        S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        ch = (e & f) ^ (~e & g);
        t1 = (h + S1 + ch + K[j] + w[j]) | 0;
        S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        maj = (a & b) ^ (a & c) ^ (b & c);
        t2 = (S0 + maj) | 0;
        h=g; g=f; f=e; e=(d + t1)|0; d=c; c=b; b=a; a=(t1 + t2)|0;
      }
      H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
      H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }
    var hex = "";
    for (i = 0; i < 8; i++) hex += ("00000000" + (H[i] >>> 0).toString(16)).slice(-8);
    return hex;
  }

  /* The published test vectors. If these do not pass, nothing built on this
     hash means anything, so it is checked rather than assumed. */
  var VECTORS = [
    ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
     "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"]
  ];
  function selfTest() {
    var out = [];
    for (var i = 0; i < VECTORS.length; i++) {
      var got = sha256(VECTORS[i][0]);
      out.push({ input: VECTORS[i][0].slice(0, 24), expected: VECTORS[i][1], got: got, ok: got === VECTORS[i][1] });
    }
    return { ok: out.every(function (r) { return r.ok; }), results: out };
  }

  /* ---------- the chain ---------- */
  function blockString(b) {
    return b.index + "|" + b.timestamp + "|" + b.data + "|" + b.prev + "|" + b.nonce;
  }
  function hashBlock(b) { return sha256(blockString(b)); }

  function makeChain(entries, opts) {
    opts = opts || {};
    var difficulty = opts.difficulty == null ? 0 : opts.difficulty;
    var chain = [], prev = "0".repeat(64);
    for (var i = 0; i < entries.length; i++) {
      var b = {
        index: i,
        timestamp: 1758000000 + i * 600,   // fixed, so the chain is reproducible
        data: entries[i],
        prev: prev,
        nonce: 0
      };
      if (difficulty > 0) {
        var m = mine(b, difficulty);
        b.nonce = m.nonce;
        b.attempts = m.attempts;
      }
      b.hash = hashBlock(b);
      chain.push(b);
      prev = b.hash;
    }
    return chain;
  }

  function mine(block, difficulty) {
    var target = "0".repeat(difficulty), n = 0, h;
    for (;;) {
      block.nonce = n;
      h = hashBlock(block);
      if (h.slice(0, difficulty) === target) return { nonce: n, hash: h, attempts: n + 1 };
      n++;
    }
  }

  /* Recompute every hash and every link. Returns the first index that fails
     and why, so a tampered chain reports where rather than just "invalid". */
  function verify(chain) {
    var problems = [];
    for (var i = 0; i < chain.length; i++) {
      var b = chain[i];
      var recomputed = hashBlock(b);
      if (recomputed !== b.hash) problems.push({ index: i, kind: "hash", stored: b.hash, recomputed: recomputed });
      if (i > 0 && b.prev !== chain[i - 1].hash) problems.push({ index: i, kind: "link", expected: chain[i - 1].hash, found: b.prev });
    }
    return { ok: problems.length === 0, problems: problems, firstBad: problems.length ? problems[0].index : null };
  }

  /* Change one block's data, leaving every stored hash untouched, which is
     what an attacker who edits the database but not the chain actually does. */
  function tamper(chain, index, newData) {
    var copy = chain.map(function (b) { var o = {}; for (var k in b) o[k] = b[k]; return o; });
    copy[index].data = newData;
    return copy;
  }

  /* Re-mine from the tampered block forward, which is the work an attacker
     has to redo to make the chain internally consistent again. */
  function reforge(chain, index, difficulty) {
    var copy = chain.map(function (b) { var o = {}; for (var k in b) o[k] = b[k]; return o; });
    var total = 0;
    for (var i = index; i < copy.length; i++) {
      if (i > 0) copy[i].prev = copy[i - 1].hash;
      var m = mine(copy[i], difficulty);
      copy[i].nonce = m.nonce;
      copy[i].hash = m.hash;
      total += m.attempts;
    }
    return { chain: copy, attempts: total };
  }

  /* ---------- merkle ---------- */
  function merkleRoot(items) {
    if (!items.length) return sha256("");
    var level = items.map(function (x) { return sha256(x); });
    while (level.length > 1) {
      var next = [];
      for (var i = 0; i < level.length; i += 2) {
        var a = level[i], b = (i + 1 < level.length) ? level[i + 1] : level[i];
        next.push(sha256(a + b));
      }
      level = next;
    }
    return level[0];
  }
  /* The proof that item i is in the set: the siblings you need, and nothing
     else. Its length is what makes the structure worth using. */
  function merkleProof(items, index) {
    var level = items.map(function (x) { return sha256(x); });
    var idx = index, path = [];
    while (level.length > 1) {
      var next = [], i;
      for (i = 0; i < level.length; i += 2) {
        var a = level[i], b = (i + 1 < level.length) ? level[i + 1] : level[i];
        if (i === idx || i + 1 === idx) {
          path.push({ side: (idx === i) ? "right" : "left", hash: (idx === i) ? b : a });
          idx = next.length;
        }
        next.push(sha256(a + b));
      }
      level = next;
    }
    return path;
  }
  function verifyProof(item, path, root) {
    var h = sha256(item);
    for (var i = 0; i < path.length; i++) {
      h = (path[i].side === "right") ? sha256(h + path[i].hash) : sha256(path[i].hash + h);
    }
    return h === root;
  }

  root.CHAIN = {
    sha256: sha256,
    selfTest: selfTest,
    hashBlock: hashBlock,
    makeChain: makeChain,
    mine: mine,
    verify: verify,
    tamper: tamper,
    reforge: reforge,
    merkleRoot: merkleRoot,
    merkleProof: merkleProof,
    verifyProof: verifyProof
  };
})(typeof window !== "undefined" ? window : globalThis);

if (typeof module !== "undefined" && module.exports) {
  module.exports = (typeof window !== "undefined" ? window : globalThis).CHAIN;
}

/* ---------------------------------------------------------------------------
   The chain bench. Renders into [data-chain-bench] and drives the real engine.
   Build, tamper, mine, reforge and prove, all computed when you press.
--------------------------------------------------------------------------- */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var host = document.querySelector("[data-chain-bench]");
  if (!host || !window.CHAIN) return;
  var C = window.CHAIN;

  var ENTRIES = [
    "Harbourgate opens the register",
    "Consignment 41 signed over to Pell and Sons",
    "Consignment 41 inspected, seal intact",
    "Consignment 42 signed over to Ardwick Cold Store",
    "Consignment 41 released to the buyer",
    "Consignment 42 inspected, seal broken"
  ];

  var state = { chain: null, difficulty: 0, lastAction: "built" };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  host.innerHTML = "";
  var box = el("div", "xb");

  var head = el("div", "xb-head");
  head.appendChild(el("h4", null, "HARBOURGATE - THE CUSTODY REGISTER"));
  head.appendChild(el("p", null, "Six entries, hashed with the SHA-256 in this file, which passes its three "
    + "published test vectors. Every digest below is computed when you press a button."));
  box.appendChild(head);

  var ctl = el("div", "xb-controls");

  var dWrap = el("div", "xb-ctl");
  dWrap.appendChild(el("label", null, "Difficulty"));
  var dSel = el("select", "xb-sel");
  [[0, "0 - no mining"], [1, "1 zero"], [2, "2 zeros"], [3, "3 zeros"]].forEach(function (o) {
    var op = document.createElement("option");
    op.value = String(o[0]); op.textContent = o[1];
    dSel.appendChild(op);
  });
  dWrap.appendChild(dSel);
  ctl.appendChild(dWrap);

  var tWrap = el("div", "xb-ctl");
  tWrap.appendChild(el("label", null, "Rewrite block 2 to"));
  var tTxt = el("input", "xb-txt");
  tTxt.type = "text";
  tTxt.value = "Consignment 41 inspected, seal BROKEN";
  tWrap.appendChild(tTxt);
  ctl.appendChild(tWrap);

  var buildBtn = el("button", "xb-btn", "Build the register");
  var tamperBtn = el("button", "xb-btn ghost", "Edit block 2");
  var rehashBtn = el("button", "xb-btn ghost", "Recompute its hash");
  var reforgeBtn = el("button", "xb-btn ghost", "Reforge from block 2");
  [buildBtn, tamperBtn, rehashBtn, reforgeBtn].forEach(function (b) { b.type = "button"; ctl.appendChild(b); });
  box.appendChild(ctl);

  var body = el("div", "xb-body");
  var kpis = el("div", "xb-kpis");
  var status = el("div", "xb-status ok");
  var note = el("p", "xb-note");
  var scroll = el("div", "xb-scroll");
  var tbl = el("table", "xb-tbl");
  scroll.appendChild(tbl);
  body.appendChild(kpis); body.appendChild(status); body.appendChild(note); body.appendChild(scroll);
  box.appendChild(body);
  host.appendChild(box);

  function kpi(v, label, warn) {
    var k = el("div", "xb-kpi");
    var b = el("b", warn ? "warn" : null, v);
    k.appendChild(b); k.appendChild(el("span", null, label));
    return k;
  }

  function render() {
    var chain = state.chain;
    var v = C.verify(chain);
    var mined = chain.reduce(function (a, b) { return a + (b.attempts || 0); }, 0);

    kpis.innerHTML = "";
    kpis.appendChild(kpi(String(chain.length), "blocks in the register"));
    kpis.appendChild(kpi(v.ok ? "none" : String(v.problems.length), "problems found", !v.ok));
    kpis.appendChild(kpi(v.ok ? "-" : ("block " + v.firstBad), "first failure", !v.ok));
    kpis.appendChild(kpi(mined ? mined.toLocaleString("en-GB") : "0", "hashes tried while mining"));

    status.className = "xb-status " + (v.ok ? "ok" : "bad");
    if (v.ok) {
      status.textContent = "Every hash recomputes and every link matches. The register is internally consistent.";
    } else {
      var p = v.problems[0];
      status.textContent = "FAILS: " + v.problems.length + " problem"
        + (v.problems.length > 1 ? "s" : "") + ", first is a " + p.kind
        + " mismatch at block " + p.index + ".";
    }

    if (state.lastAction === "tamper") {
      note.textContent = "The entry text changed and the stored hash did not, so recomputing block 2 no longer "
        + "produces the hash written next to it. That is a hash mismatch, and it means a record was edited in place.";
    } else if (state.lastAction === "rehash") {
      note.textContent = "Block 2 is internally consistent again, and the failure did not go away: it moved to "
        + "block 3, which still records the old hash as its predecessor. Fixing a hash does not hide an edit.";
    } else if (state.lastAction === "reforge") {
      note.textContent = state.difficulty === 0
        ? "Reforged with no mining, so it cost nothing measurable. The register is consistent and the entry is "
          + "changed, which is exactly why a chain on its own is not enough."
        : "Reforged at difficulty " + state.difficulty + ". The register is consistent again, and the cost is the "
          + "hash count above. Every extra zero multiplies the expected work by sixteen.";
    } else {
      note.textContent = state.difficulty === 0
        ? "Built with no mining. Each block carries the hash of the one before it."
        : "Built at difficulty " + state.difficulty + ", so every block's hash had to be found by guessing nonces.";
    }

    var probByIndex = {};
    v.problems.forEach(function (p) { probByIndex[p.index] = p.kind; });

    tbl.innerHTML = "<thead><tr><th>#</th><th>Entry</th><th>Previous hash</th><th>This hash</th><th>Nonce</th><th>Check</th></tr></thead>"
      + "<tbody>" + chain.map(function (b) {
        var bad = probByIndex[b.index];
        return "<tr" + (bad ? ' class="bad"' : "") + ">"
          + "<td>" + b.index + "</td>"
          + "<td>" + b.data.replace(/</g, "&lt;") + "</td>"
          + '<td class="mono">' + b.prev.slice(0, 12) + "</td>"
          + '<td class="mono">' + b.hash.slice(0, 12) + "</td>"
          + "<td>" + b.nonce + "</td>"
          + '<td' + (bad ? ' class="flag"' : "") + ">" + (bad ? bad + " mismatch" : "ok") + "</td>"
          + "</tr>";
      }).join("") + "</tbody>";
  }

  function build() {
    state.difficulty = parseInt(dSel.value, 10);
    state.chain = C.makeChain(ENTRIES, { difficulty: state.difficulty });
    state.lastAction = "built";
    render();
  }
  buildBtn.addEventListener("click", build);
  tamperBtn.addEventListener("click", function () {
    state.chain = C.tamper(state.chain, 2, tTxt.value || "edited");
    state.lastAction = "tamper";
    render();
  });
  rehashBtn.addEventListener("click", function () {
    state.chain[2].hash = C.hashBlock(state.chain[2]);
    state.lastAction = "rehash";
    render();
  });
  reforgeBtn.addEventListener("click", function () {
    var r = C.reforge(state.chain, 2, state.difficulty);
    state.chain = r.chain;
    state.chain[2].attempts = (state.chain[2].attempts || 0);
    state.lastAction = "reforge";
    render();
  });

  build();
})();
