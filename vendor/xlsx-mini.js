/* xlsx-mini — bikin file .xlsx asli tanpa library besar / tanpa internet.
 * Caranya: rangkai XML standar Office + bungkus jadi ZIP (mode "stored"/tanpa kompresi).
 * Expose: window.makeXlsxBlob(aoa, sheetName) -> Blob
 *   aoa = array of array, baris pertama dianggap header. Sel boleh string atau angka.
 */
(function () {
  "use strict";
  const enc = new TextEncoder();

  // ---- CRC32 ----
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function concat(arrays) {
    let len = 0;
    arrays.forEach((a) => (len += a.length));
    const out = new Uint8Array(len);
    let off = 0;
    arrays.forEach((a) => {
      out.set(a, off);
      off += a.length;
    });
    return out;
  }
  const u16 = (v) => new Uint8Array([v & 255, (v >> 8) & 255]);
  const u32 = (v) => new Uint8Array([v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255]);

  // ZIP "stored" (tanpa kompresi)
  function zip(files) {
    const chunks = [];
    const central = [];
    let offset = 0;
    const MODDATE = 33; // 1980-01-01, biar valid
    for (const f of files) {
      const name = enc.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const local = concat([
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(MODDATE),
        u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0), name, data,
      ]);
      chunks.push(local);
      central.push(
        concat([
          u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(MODDATE),
          u32(crc), u32(data.length), u32(data.length),
          u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
        ])
      );
      offset += local.length;
    }
    let centralSize = 0;
    central.forEach((c) => (centralSize += c.length));
    const end = concat([
      u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
      u32(centralSize), u32(offset), u16(0),
    ]);
    return concat([...chunks, ...central, end]);
  }

  function escXml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c])
    );
  }
  function colLetter(n) {
    let s = "";
    n++;
    while (n > 0) {
      const r = (n - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  function sheetXml(aoa) {
    let rows = "";
    aoa.forEach((row, ri) => {
      let cells = "";
      row.forEach((val, ci) => {
        const ref = colLetter(ci) + (ri + 1);
        if (val == null || val === "") {
          // sel kosong BENERAN (bukan string "") → sort & SUM di Excel tetap valid utk kolom angka
          cells += `<c r="${ref}"/>`;
        } else if (typeof val === "number" && isFinite(val)) {
          cells += `<c r="${ref}"><v>${val}</v></c>`;
        } else {
          // guard formula-injection: teks yang diawali = + - @ dikasih spasi di depan
          let s = String(val);
          if (/^[=+\-@]/.test(s)) s = " " + s;
          const txt = escXml(s);
          cells += `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${txt}</t></is></c>`;
        }
      });
      rows += `<row r="${ri + 1}">${cells}</row>`;
    });
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      `<sheetData>${rows}</sheetData></worksheet>`
    );
  }

  window.makeXlsxBlob = function (aoa, sheetName) {
    const name = escXml(sheetName || "Sheet1").slice(0, 28);
    const files = [
      {
        name: "[Content_Types].xml",
        data: enc.encode(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
            "</Types>"
        ),
      },
      {
        name: "_rels/.rels",
        data: enc.encode(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
            "</Relationships>"
        ),
      },
      {
        name: "xl/workbook.xml",
        data: enc.encode(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            `<sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets></workbook>`
        ),
      },
      {
        name: "xl/_rels/workbook.xml.rels",
        data: enc.encode(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
            "</Relationships>"
        ),
      },
      { name: "xl/worksheets/sheet1.xml", data: enc.encode(sheetXml(aoa)) },
    ];
    return new Blob([zip(files)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };
})();
