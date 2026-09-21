(function () {
  var PANEL = 384;
  var MIN = 240;
  var MAX = 720;
  var CARD_MAX_ATTRS = 3;

  var FIELD_LABELS = {
    sku: "SKU",
    brand: "Brand",
    color: "Color",
    status: "Status",
    category: "Category",
    gender: "Gender",
    price: "List price",
    completeness: "Completeness",
    sizeRun: "Size run",
    fileType: "File type",
    format: "Format",
    usage: "Usage",
    filename: "Filename",
    dimensions: "Dimensions",
    colorProfile: "Color profile",
    linkedTo: "Linked product",
    code: "ID",
    parent: "Parent",
    level: "Level",
    children: "Children",
    objectCount: "Objects",
    entityType: "Entity type",
    legalName: "Legal name",
    hq: "Headquarters",
    parentOrg: "Parent",
    name: "Name",
    type: "Type",
    path: "Path",
    identity: "Identity",
    colorFamily: "Color family",
    description: "Description",
    season: "Season",
    collection: "Collection",
    owner: "Owner",
  };
  var ALL_FIELDS = {
    product: ["name", "sku", "brand", "color", "colorFamily", "status", "category", "gender", "price", "completeness", "sizeRun", "description", "season", "collection", "owner"],
    asset: ["name", "fileType", "format", "usage", "filename", "dimensions", "colorProfile", "linkedTo", "status", "brand", "completeness"],
    classification: ["name", "code", "parent", "level", "children", "objectCount", "status"],
    entity: ["name", "entityType", "code", "legalName", "hq", "parentOrg", "status"],
  };

  function unionFields() {
    var seen = {};
    var out = [];
    ["product", "asset", "classification", "entity"].forEach(function (t) {
      ALL_FIELDS[t].forEach(function (k) {
        if (!seen[k]) {
          seen[k] = true;
          out.push(k);
        }
      });
    });
    return out;
  }

  ALL_FIELDS.all = ["name", "type", "path", "identity"].concat(unionFields().filter(function (k) { return k !== "name"; }));

  var FIELD_GROUPS = {
    product: [
      { id: "ident", name: "Identification", fields: ["name", "sku", "brand"] },
      { id: "merch", name: "Merchandising", fields: ["color", "colorFamily", "category", "gender", "price", "sizeRun", "season", "collection"] },
      { id: "quality", name: "Quality", fields: ["status", "completeness", "owner"] },
      { id: "content", name: "Content", fields: ["description"] },
    ],
    asset: [
      { id: "file", name: "File", fields: ["name", "fileType", "format", "filename", "dimensions", "colorProfile"] },
      { id: "usage", name: "Usage", fields: ["usage", "linkedTo", "status", "brand", "completeness"] },
    ],
    classification: [
      { id: "structure", name: "Structure", fields: ["name", "code", "parent", "level", "children", "objectCount", "status"] },
    ],
    entity: [
      { id: "profile", name: "Profile", fields: ["name", "entityType", "code", "legalName", "hq", "parentOrg", "status"] },
    ],
    all: [
      { id: "search", name: "Search", fields: ["name", "type", "path", "identity"] },
      { id: "product", name: "Product", fields: ALL_FIELDS.product.filter(function (k) { return k !== "name"; }) },
      { id: "asset", name: "Asset", fields: ALL_FIELDS.asset.filter(function (k) { return k !== "name"; }) },
      { id: "classification", name: "Classification", fields: ALL_FIELDS.classification.filter(function (k) { return k !== "name"; }) },
      { id: "entity", name: "Entity", fields: ALL_FIELDS.entity.filter(function (k) { return k !== "name"; }) },
    ],
  };

  var DEFAULT_VIEW_CONFIG = {
    all: { fields: ["name", "sku", "brand", "color", "status", "category", "price", "fileType", "filename", "code", "parent", "level", "entityType", "legalName"] },
    product: { fields: ["name", "sku", "brand", "color", "status", "category", "price"] },
    asset: { fields: ["name", "fileType", "filename"] },
    classification: { fields: ["name", "code", "parent", "level"] },
    entity: { fields: ["name", "entityType", "legalName"] },
  };

  function cloneConfig(cfg) {
    var out = {};
    Object.keys(cfg).forEach(function (k) {
      out[k] = { fields: cfg[k].fields.slice() };
    });
    return out;
  }

  function configFromTypes(types) {
    var cfg = {};
    ["product", "asset", "classification", "entity"].forEach(function (t) {
      cfg[t] = { fields: types[t].slice() };
    });
    var seen = { name: true, type: true, path: true, identity: true };
    var all = ["name", "type", "path", "identity"];
    ["product", "asset", "classification", "entity"].forEach(function (t) {
      types[t].forEach(function (k) {
        if (!seen[k]) {
          seen[k] = true;
          all.push(k);
        }
      });
    });
    cfg.all = { fields: all };
    return cfg;
  }

  function configsEqual(a, b) {
    if (!a || !b) return false;
    return ["all", "product", "asset", "classification", "entity"].every(function (k) {
      return ((a[k] && a[k].fields) || []).join("\0") === ((b[k] && b[k].fields) || []).join("\0");
    });
  }

  function fieldsEqual(a, b) {
    return (a || []).join("\0") === (b || []).join("\0");
  }

  var MATCHING_NAMED_VIEWS = [
    { id: "view-default", name: "Default view", type: "all" },
    { id: "view-product", name: "Product", type: "product" },
    { id: "view-asset", name: "Asset", type: "asset" },
    { id: "view-classification", name: "Classification", type: "classification" },
    { id: "view-entity", name: "Entity", type: "entity" },
  ];

  function fieldsForMatchingView(type, config) {
    var cfg = config || DEFAULT_VIEW_CONFIG;
    return ((cfg[type] && cfg[type].fields) || []).slice();
  }

  var DEFAULT_NAMED_VIEWS = MATCHING_NAMED_VIEWS.map(function (v) {
    return { id: v.id, name: v.name, fields: fieldsForMatchingView(v.type) };
  });

  function cloneFacets(facets) {
    var out = {};
    Object.keys(facets || {}).forEach(function (k) {
      out[k] = (facets[k] || []).slice();
    });
    return out;
  }

  function cloneSort(sort) {
    return { key: sort.key, dir: sort.dir || "asc", key2: sort.key2 || "" };
  }

  function cloneFacetConfig(keys) {
    return (keys || []).slice();
  }

  function viewCfg(type) {
    return state.viewConfig[type] || state.viewConfig.product;
  }

  function tableFields(type) {
    if (isNamedViews()) return (state.viewFields || ALL_FIELDS.all).slice();
    return viewCfg(type).fields.slice();
  }

  function cardFields(type) {
    var list;
    if (isNamedViews()) list = state.viewFields || ALL_FIELDS.all;
    else if (state.tab === "all") list = viewCfg("all").fields;
    else list = viewCfg(type).fields;
    var skip = { name: true, path: true, identity: true, type: true };
    var allowed = ALL_FIELDS[type] || [];
    var fields = (list || []).filter(function (k) {
      if (skip[k]) return false;
      return allowed.indexOf(k) !== -1;
    });
    if (isNamedViews()) return fields;
    return fields.slice(0, CARD_MAX_ATTRS);
  }

  function identField(type) {
    var source = isNamedViews() ? (ALL_FIELDS[type] || ALL_FIELDS.product) : tableFields(type);
    var fields = source.filter(function (k) { return k !== "name"; });
    return fields[0] || "status";
  }
  var TYPE_LABELS = { all: "All", product: "Product", asset: "Asset", classification: "Classification", entity: "Entity" };

  function fieldValue(item, key) {
    if (!item.fields) return "—";
    var v = item.fields[key];
    return v == null || v === "" ? "—" : v;
  }

  function shoe(p) {
    var sizes = p.sizes || [];
    var sizeLabel = sizes.length
      ? (/^\d+$/.test(String(sizes[0])) ? "EU " + sizes[0] + "–" + sizes[sizes.length - 1] : sizes[0] + "–" + sizes[sizes.length - 1])
      : "—";
    p.superType = "product";
    p.kind = p.kind || "shoe";
    p.relatedTo = p.relatedTo || "";
    p.fields = {
      sku: p.sku,
      brand: p.brand,
      color: p.color,
      colorFamily: p.colorFamily || "—",
      status: p.status,
      category: p.category,
      gender: p.gender || "—",
      price: p.price || "—",
      completeness: p.completeness + "%",
      sizeRun: sizeLabel,
      description: p.description || (p.brand + " " + (p.category || "product")),
      season: p.season || "SS26",
      collection: p.collection || p.category || "—",
      owner: p.owner || "Merchandising",
    };
    p.groups = [
      {
        name: "Identification",
        rows: [
          { label: "Name", value: p.name },
          { label: "SKU", value: p.sku },
          { label: "Brand", value: p.brand },
        ],
      },
      {
        name: "Merchandising",
        rows: [
          { label: "Category", value: p.category },
          { label: "Color", value: p.color },
          { label: "Gender", value: p.gender || "—" },
          { label: "Size run", value: sizes.map(function (s) { return "EU " + s; }).join(", ") },
          { label: "List price", value: p.price || "—" },
        ],
      },
    ];
    p.bars = [
      { label: "Product details", value: Math.min(100, p.completeness + 4) },
      { label: "Web bullets", value: Math.max(20, p.completeness - 12) },
      { label: "Content", value: Math.max(15, p.completeness - 8) },
    ];
    p.workflows = [
      { name: "Internal review", state: p.completeness >= 85 ? "Complete" : "In progress" },
      { name: "Channel publish", state: p.status === "Approved" ? "Ready" : "Blocked" },
    ];
    return p;
  }

  function asset(p) {
    p.superType = "asset";
    p.kind = "asset";
    p.relatedTo = p.relatedTo || "";
    p.fields = {
      fileType: p.fileType,
      format: p.format,
      usage: p.usage,
      filename: p.filename,
      dimensions: p.dimensions,
      colorProfile: p.colorProfile,
      linkedTo: p.linkedTo,
      status: p.status,
      brand: p.brand || "—",
      completeness: p.completeness + "%",
    };
    p.groups = [{ name: "Asset", rows: [
      { label: "Filename", value: p.filename },
      { label: "File type", value: p.fileType },
      { label: "Format", value: p.format },
      { label: "Usage", value: p.usage },
      { label: "Dimensions", value: p.dimensions },
      { label: "Linked product", value: p.linkedTo || "—" },
    ] }];
    p.bars = [{ label: "Metadata", value: p.completeness }];
    p.workflows = [];
    return p;
  }

  function classification(p) {
    p.superType = "classification";
    p.kind = "folder";
    p.fields = {
      code: p.code,
      parent: p.parent,
      level: String(p.level),
      children: p.children,
      objectCount: String(p.objectCount),
      status: p.status,
    };
    p.groups = [{ name: "Classification", rows: [
      { label: "ID", value: p.code },
      { label: "Parent", value: p.parent },
      { label: "Level", value: String(p.level) },
      { label: "Children", value: p.children },
      { label: "Objects", value: String(p.objectCount) },
    ] }];
    p.bars = [{ label: "Structure", value: 100 }];
    p.workflows = [];
    return p;
  }

  function entity(p) {
    p.superType = "entity";
    p.kind = "org";
    p.fields = {
      entityType: p.entityType,
      code: p.code,
      legalName: p.legalName,
      hq: p.hq,
      parentOrg: p.parentOrg,
      status: p.status,
    };
    p.groups = [{ name: "Entity", rows: [
      { label: "Type", value: p.entityType },
      { label: "Code", value: p.code },
      { label: "Legal name", value: p.legalName },
      { label: "Headquarters", value: p.hq },
      { label: "Parent", value: p.parentOrg },
    ] }];
    p.bars = [{ label: "Profile", value: 100 }];
    p.workflows = [];
    return p;
  }

  var CATALOG = [
    shoe({ id: "p-pegasus-41", name: "Nike Air Zoom Pegasus 41", path: "Home / Footwear / Running / Road", sku: "FD2722-600", brand: "Nike", color: "University Red / White", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 92, price: "€139.99", swatch: "#c8102e", description: "Daily trainer with Zoom Air and React foam." }),
    shoe({ id: "p-structure-26", name: "Nike Structure 26", path: "Home / Footwear / Running / Stability", sku: "DJ7884-103", brand: "Nike", color: "White / University Red", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 88, price: "€144.99", swatch: "#d94a4a" }),
    shoe({ id: "p-boston-12", name: "Adidas Adizero Boston 12", path: "Home / Footwear / Running / Tempo", sku: "IG3321", brand: "Adidas", color: "Solar Red / Core Black", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45", "46"], category: "Running shoes", gender: "Unisex", status: "Approved", completeness: 85, price: "€149.95", swatch: "#e31c23" }),
    shoe({ id: "p-ultraboost-5", name: "Adidas Ultraboost 5", path: "Home / Footwear / Running / Road", sku: "ID8843", brand: "Adidas", color: "Lucid Red / Night Met.", colorFamily: "Red", sizes: ["39", "40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Unisex", status: "Approved", completeness: 90, price: "€189.95", swatch: "#c62828" }),
    shoe({ id: "p-clifton-9", name: "Hoka Clifton 9", path: "Home / Footwear / Running / Road", sku: "1127896-FFCR", brand: "Hoka", color: "Fiesta / Amber Yellow", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 94, price: "€150.00", swatch: "#e85d04" }),
    shoe({ id: "p-bondi-8", name: "Hoka Bondi 8", path: "Home / Footwear / Running / Cushion", sku: "1123202-ECRD", brand: "Hoka", color: "Electric Red / Black", colorFamily: "Red", sizes: ["41", "42", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "In progress", completeness: 78, price: "€175.00", swatch: "#ff1e00" }),
    shoe({ id: "p-ghost-16", name: "Brooks Ghost 16", path: "Home / Footwear / Running / Road", sku: "110393-1D-637", brand: "Brooks", color: "Red / Black / White", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45", "46"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 91, price: "€150.00", swatch: "#b71c1c" }),
    shoe({ id: "p-glycerin-21", name: "Brooks Glycerin 21", path: "Home / Footwear / Running / Cushion", sku: "110391-1D-611", brand: "Brooks", color: "Bittersweet / Firecracker", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44"], category: "Running shoes", gender: "Women", status: "In progress", completeness: 70, price: "€160.00", swatch: "#e53935" }),
    shoe({ id: "p-cloudmonster-2", name: "On Cloudmonster 2", path: "Home / Footwear / Running / Road", sku: "3MD3002-6005", brand: "On", color: "Flame / Frost", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Unisex", status: "Approved", completeness: 86, price: "€189.90", swatch: "#ff4d00" }),
    shoe({ id: "p-1080v14", name: "New Balance Fresh Foam X 1080v14", path: "Home / Footwear / Running / Road", sku: "M1080D14-RED", brand: "New Balance", color: "Red / White", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 81, price: "€165.00", swatch: "#c41e3a" }),
    shoe({ id: "p-kayano-31", name: "ASICS Gel-Kayano 31", path: "Home / Footwear / Running / Stability", sku: "1011B867-600", brand: "ASICS", color: "Spice Latte / Electric Red", colorFamily: "Red", sizes: ["40", "41", "42", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "Approved", completeness: 89, price: "€190.00", swatch: "#d32f2f" }),
    shoe({ id: "p-ride-17", name: "Saucony Ride 17", path: "Home / Footwear / Running / Road", sku: "S20830-40", brand: "Saucony", color: "Red Quartz / Black", colorFamily: "Red", sizes: ["41", "42", "43", "44"], category: "Running shoes", gender: "Unisex", status: "Draft", completeness: 76, price: "€140.00", swatch: "#ad1457" }),
    shoe({ id: "p-velocity-3", name: "Puma Velocity Nitro 3", path: "Home / Footwear / Running / Road", sku: "379084-01", brand: "Puma", color: "For All Time Red", colorFamily: "Red", sizes: ["40", "41", "43", "44"], category: "Running shoes", gender: "Men", status: "In progress", completeness: 65, price: "€130.00", swatch: "#9b1b30" }),
    shoe({ id: "p-rider-28", name: "Mizuno Wave Rider 28", path: "Home / Footwear / Running / Road", sku: "J1GC2403-03", brand: "Mizuno", color: "High Risk Red / White", colorFamily: "Red", sizes: ["40", "41", "43", "44", "45"], category: "Running shoes", gender: "Men", status: "Draft", completeness: 72, price: "€150.00", swatch: "#e10600" }),
    shoe({ id: "p-aero-glide", name: "Salomon Aero Glide 2", path: "Home / Footwear / Running / Road", sku: "L47313400", brand: "Salomon", color: "Black / White", colorFamily: "Black", sizes: ["40", "41", "42", "43", "44"], category: "Running shoes", gender: "Unisex", status: "Approved", completeness: 84, price: "€140.00", swatch: "#1f1f1f" }),
    shoe({ id: "p-miler-tee", name: "Nike Dri-FIT Miler Tee", path: "Home / Apparel / Tops / Running", sku: "DV9316-657", brand: "Nike", color: "University Red", colorFamily: "Red", sizes: ["S", "M", "L", "XL"], category: "Apparel", gender: "Men", status: "Approved", completeness: 83, price: "€34.99", swatch: "#c8102e", kind: "apparel" }),
    shoe({ id: "p-pegasus-laces", name: "Pegasus 41 replacement laces", path: "Home / Footwear / Running / Accessories", sku: "FD2722-LACE", brand: "Nike", color: "University Red", colorFamily: "Red", sizes: [], category: "Accessories", gender: "Unisex", status: "Approved", completeness: 80, price: "€8.99", swatch: "#c8102e", relatedTo: "p-pegasus-41", kind: "apparel" }),
    shoe({ id: "p-clifton-laces", name: "Clifton 9 replacement laces", path: "Home / Footwear / Running / Accessories", sku: "1127896-LACE", brand: "Hoka", color: "Fiesta", colorFamily: "Red", sizes: [], category: "Accessories", gender: "Unisex", status: "Approved", completeness: 74, price: "€9.50", swatch: "#e85d04", relatedTo: "p-clifton-9", kind: "apparel" }),
    asset({ id: "a-pegasus-packshot", name: "Pegasus 41 — packshot, three-quarter", path: "Home / Assets / Product photography", fileType: "TIFF", format: "TIFF · 4000×4000", usage: "Packshot", filename: "FD2722-600_packshot_01.tif", dimensions: "4000 × 4000 px", colorProfile: "Adobe RGB", linkedTo: "Nike Air Zoom Pegasus 41", relatedTo: "p-pegasus-41", status: "Approved", completeness: 100, brand: "Nike", colorFamily: "Red", category: "Packshot", swatch: "#c8102e" }),
    asset({ id: "a-pegasus-lifestyle", name: "Pegasus 41 — lifestyle, city path", path: "Home / Assets / Lifestyle", fileType: "JPEG", format: "JPEG · 6000×4000", usage: "Lifestyle", filename: "FD2722-600_lifestyle_city.jpg", dimensions: "6000 × 4000 px", colorProfile: "sRGB", linkedTo: "Nike Air Zoom Pegasus 41", relatedTo: "p-pegasus-41", status: "Approved", completeness: 88, brand: "Nike", colorFamily: "Red", category: "Lifestyle", swatch: "#a30b24" }),
    asset({ id: "a-clifton-packshot", name: "Clifton 9 — packshot, lateral", path: "Home / Assets / Product photography", fileType: "TIFF", format: "TIFF · 4000×4000", usage: "Packshot", filename: "1127896-FFCR_lat.tif", dimensions: "4000 × 4000 px", colorProfile: "Adobe RGB", linkedTo: "Hoka Clifton 9", relatedTo: "p-clifton-9", status: "Approved", completeness: 96, brand: "Hoka", colorFamily: "Red", category: "Packshot", swatch: "#e85d04" }),
    asset({ id: "a-size-chart", name: "Running footwear — EU size chart", path: "Home / Assets / Documents", fileType: "PDF", format: "PDF · 2 pages", usage: "Size chart", filename: "running-eu-size-chart-ss26.pdf", dimensions: "A4", colorProfile: "—", linkedTo: "—", status: "Approved", completeness: 100, category: "Document", swatch: "#5c6b73" }),
    classification({ id: "c-footwear", name: "Footwear", path: "Home / Classification / Product hierarchy", code: "CLS-FOOT", parent: "Product hierarchy", level: 1, children: "Running, Lifestyle", objectCount: 16, status: "Approved", category: "Hierarchy", swatch: "#5a6e78" }),
    classification({ id: "c-running", name: "Running", path: "Home / Classification / Product hierarchy / Footwear", code: "CLS-RUN", parent: "Footwear", level: 2, children: "Road, Stability, Cushion, Tempo", objectCount: 15, status: "Approved", category: "Hierarchy", swatch: "#5a6e78" }),
    classification({ id: "c-road", name: "Road running", path: "Home / Classification / Footwear / Running", code: "CLS-ROAD", parent: "Running", level: 3, children: "—", objectCount: 11, status: "Approved", category: "Hierarchy", swatch: "#5a6e78" }),
    classification({ id: "c-apparel", name: "Apparel", path: "Home / Classification / Product hierarchy", code: "CLS-APP", parent: "Product hierarchy", level: 1, children: "Tops, Bottoms", objectCount: 1, status: "Approved", category: "Hierarchy", swatch: "#5a6e78" }),
    entity({ id: "e-nike", name: "Nike", path: "Home / Entities / Brands", entityType: "Brand", code: "NIKE", legalName: "Nike, Inc.", hq: "Beaverton, OR", parentOrg: "—", status: "Approved", brand: "Nike", category: "Brand", swatch: "#111" }),
    entity({ id: "e-adidas", name: "Adidas", path: "Home / Entities / Brands", entityType: "Brand", code: "ADIDAS", legalName: "adidas AG", hq: "Herzogenaurach", parentOrg: "—", status: "Approved", brand: "Adidas", category: "Brand", swatch: "#000" }),
    entity({ id: "e-hoka", name: "Hoka", path: "Home / Entities / Brands", entityType: "Brand", code: "HOKA", legalName: "HOKA One One", hq: "Goleta, CA", parentOrg: "Deckers Brands", status: "Approved", brand: "Hoka", category: "Brand", swatch: "#e85d04" }),
  ];

  var TABS = [
    { id: "all", label: "All" },
    { id: "product", label: "Products" },
    { id: "classification", label: "Classifications" },
    { id: "asset", label: "Assets" },
    { id: "entity", label: "Entities" },
  ];
  var FACET_DEFS = [
    { key: "brand", label: "Brand", types: ["product", "asset", "entity"] },
    { key: "color", label: "Color family", types: ["product", "asset"] },
    { key: "size", label: "EU size", types: ["product"] },
    { key: "category", label: "Category", types: ["product", "asset", "classification", "entity"] },
    { key: "status", label: "Status", types: ["product", "asset", "classification", "entity"] },
    { key: "type", label: "Type", types: [] },
    { key: "fileType", label: "File type", types: ["asset"] },
    { key: "level", label: "Level", types: ["classification"] },
    { key: "entityType", label: "Entity type", types: ["entity"] },
  ];
  var DEFAULT_FACETS = ["brand", "color", "size", "category", "status"];

  function defaultFacetConfig() {
    var keys = DEFAULT_FACETS.slice();
    if (isTypeFilters() && keys.indexOf("type") === -1) keys.unshift("type");
    return keys;
  }

  function syncFacetConfigForMode() {
    state.facetConfig = canonicalizeFacetConfig(state.facetConfig);
  }

  function canonicalizeFacetConfig(keys) {
    keys = cloneFacetConfig(keys).filter(function (k) { return k !== "type"; });
    if (isTypeFilters()) keys.unshift("type");
    return keys;
  }

  function facetConfigEqual(a, b) {
    a = canonicalizeFacetConfig(a);
    b = canonicalizeFacetConfig(b);
    if (a.length !== b.length) return false;
    return a.every(function (k, i) { return k === b[i]; });
  }
  var savedSearches = [];
  var recentSearches = ["shirt", "red", "black"];
  var namedViews = DEFAULT_NAMED_VIEWS.map(function (v) {
    return { id: v.id, name: v.name, fields: v.fields.slice() };
  });

  var state = {
    query: "",
    tab: "all",
    facets: {},
    activeId: null,
    detailsOpen: false,
    chatOpen: false,
    widths: { filters: PANEL, list: PANEL, chat: PANEL },
    messages: [],
    suggested: [],
    checked: {},
    viewMode: "table",
    sort: { key: "", dir: "asc", key2: "" },
    savedId: null,
    savedLayout: "tabs",
    typePlacement: "filters",
    startMode: "empty",
    customizeMode: "session",
    viewId: "view-default",
    workingSearch: null,
    sessionDrafts: {},
    facetConfig: ["type"].concat(DEFAULT_FACETS),
    viewConfig: cloneConfig(DEFAULT_VIEW_CONFIG),
    viewFields: DEFAULT_NAMED_VIEWS[0].fields.slice(),
    queryGhost: "",
    related: null,
    chatScope: "current",
  };

  var customize = {
    open: false,
    type: "product",
    draft: null,
    folder: "system",
    groupsOpen: false,
    pane: "browse",
    query: "",
  };

  var sortUi = {
    open: false,
    draft: null,
  };

  var savedUi = {
    open: false,
    name: "",
    anchor: "toolbar",
    pane: "form",
  };

  var leaveUi = {
    open: false,
    nextId: null,
    pendingChat: null,
    pendingQuery: null,
  };

  var suggestUi = {
    open: false,
  };

  var tabUi = {
    menu: false,
    infoId: null,
    renameId: null,
    renameValue: "",
  };

  var viewUi = {
    open: false,
    pane: "menu",
    name: "",
  };

  var facetUi = {
    open: false,
    draft: null,
    query: "",
  };

  function byId(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  function matchesQuery(item, query) {
    var q = query.trim().toLowerCase();
    if (!q) return true;
    var blob = [
      item.name, item.path, item.sku, item.brand, item.color, item.category, item.description, item.status,
      item.filename, item.fileType, item.code, item.legalName, item.entityType, item.linkedTo,
    ].join(" ").toLowerCase();
    return q.split(/\s+/).every(function (t) { return blob.indexOf(t) !== -1; });
  }

  function tabLabel(id) {
    for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) return TABS[i].label;
    return id;
  }

  function facetDef(key) {
    for (var i = 0; i < FACET_DEFS.length; i++) if (FACET_DEFS[i].key === key) return FACET_DEFS[i];
    return null;
  }

  function facetScope(def) {
    if (!def.types.length) return "All";
    if (def.types.length === 4) return "All types";
    return def.types.map(tabLabel).join(" · ");
  }

  function facetApplies(def, tab) {
    if (tab === "all") return true;
    if (!def.types.length) return false;
    return def.types.indexOf(tab) !== -1;
  }

  function itemFacetValues(item, key) {
    if (key === "brand" && item.brand) return [item.brand];
    if (key === "color" && item.colorFamily) return [item.colorFamily];
    if (key === "size") return (item.sizes || []).filter(function (s) { return /^\d+$/.test(s); });
    if (key === "category" && item.category) return [item.category];
    if (key === "status" && item.status) return [item.status];
    if (key === "type") return [item.superType];
    if (key === "fileType" && item.fileType) return [item.fileType];
    if (key === "level" && item.level != null && item.level !== "") return [String(item.level)];
    if (key === "entityType" && item.entityType) return [item.entityType];
    return [];
  }

  function facetValueLabel(key, value) {
    if (key === "type") {
      for (var i = 0; i < TABS.length; i++) if (TABS[i].id === value) return TABS[i].label;
      return TYPE_LABELS[value] || value;
    }
    return value;
  }

  function matchesFacets(item, facets, ignore) {
    return FACET_DEFS.every(function (def) {
      if (ignore === def.key) return true;
      var selected = facets[def.key];
      if (!selected || !selected.length) return true;
      var vals = itemFacetValues(item, def.key);
      return selected.some(function (s) { return vals.indexOf(s) !== -1; });
    });
  }

  function cloneRelated(rel) {
    return rel && rel.id ? { id: rel.id, name: rel.name } : null;
  }

  function relatedEqual(a, b) {
    if (!a && !b) return true;
    return !!(a && b && a.id === b.id);
  }

  function matchesRelated(item) {
    if (!state.related) return true;
    if (item.id === state.related.id) return false;
    if (item.relatedTo && item.relatedTo === state.related.id) return true;
    if (item.linkedTo && item.linkedTo === state.related.name) return true;
    return false;
  }

  function hasSelectedFacets() {
    return Object.keys(state.facets).some(function (k) {
      return (state.facets[k] || []).length;
    });
  }

  function isIdleSearch() {
    if (state.savedId) return false;
    if (state.related) return false;
    if ((state.query || "").trim()) return false;
    if ((state.queryGhost || "").trim()) return false;
    return !hasSelectedFacets();
  }

  function isUnmatchedAsk() {
    return !!(state.queryGhost || "").trim() && !(state.query || "").trim() && !hasSelectedFacets() && !state.related;
  }

  function isEmptyIdle() {
    return isIdleSearch() && state.startMode !== "all";
  }

  function filterAll(ignoreFacet) {
    return CATALOG.filter(function (item) {
      if (state.tab !== "all" && item.superType !== state.tab) return false;
      if (!matchesRelated(item)) return false;
      if (!matchesQuery(item, state.query)) return false;
      return matchesFacets(item, state.facets, ignoreFacet);
    });
  }

  function filterIgnoringTab() {
    return CATALOG.filter(function (item) {
      return matchesRelated(item) && matchesQuery(item, state.query) && matchesFacets(item, state.facets);
    });
  }

  function selectedId(results) {
    if (state.activeId && results.some(function (r) { return r.id === state.activeId; })) return state.activeId;
    return results[0] ? results[0].id : null;
  }

  function thumbGlyph(item) {
    if (item.kind === "asset") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="14" width="28" height="20" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.85)"/><circle cx="18" cy="22" r="3" fill="rgba(255,255,255,0.85)"/><path d="M14 32 22 24l6 5 8-9 4 12H14Z" fill="rgba(255,255,255,0.75)"/></svg>';
    }
    if (item.kind === "folder") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 18h10l3 3h15v13H10V18Z" fill="rgba(255,255,255,0.88)"/><path d="M10 21h28v13H10Z" fill="rgba(255,255,255,0.7)"/></svg>';
    }
    if (item.kind === "org") {
      return "<span>" + escapeHtml(item.name.charAt(0)) + "</span>";
    }
    if (item.kind === "apparel") {
      return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 14 24 17l8-3 5 4-5 3v14H16V21l-5-3 5-4Z" fill="rgba(255,255,255,0.82)"/></svg>';
    }
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30c6-10 12-14 22-14 9 0 14 3 18 10v6H10l-2-2Z" fill="rgba(255,255,255,0.88)"/><path d="M10 32h30v3H12l-2-3Z" fill="rgba(0,0,0,0.18)"/></svg>';
  }

  function thumb(item, size) {
    var dim = size
      ? "width:" + size + "px;height:" + size + "px;background:" + item.swatch
      : "background:" + item.swatch;
    return '<div class="thumb thumb-' + (item.kind || item.superType) + '" style="' + dim + '">' + thumbGlyph(item) + "</div>";
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    if (isTypeFilters() && state.tab !== "all") applyScopeToMode(state.tab, state.facets);
    ensureSort();
    persistOpenSavedSearch();
    var emptyIdle = isEmptyIdle();
    if (emptyIdle) {
      if (sortUi.open) {
        sortUi.open = false;
        sortUi.draft = null;
        document.getElementById("sort-popover").classList.remove("is-open");
      }
      if (savedUi.open && savedUi.anchor === "toolbar") {
        savedUi.open = false;
        document.getElementById("saved-popover").classList.remove("is-open");
      }
    }
    var results = emptyIdle || isUnmatchedAsk() ? [] : sortResults(filterAll());
    if (!results.length) state.detailsOpen = false;
    var sid = selectedId(results);
    state.activeId = sid;
    var item = sid ? byId(sid) : null;
    var pool = filterIgnoringTab();
    var counts = {
      all: pool.length,
      product: pool.filter(function (i) { return i.superType === "product"; }).length,
      classification: pool.filter(function (i) { return i.superType === "classification"; }).length,
      asset: pool.filter(function (i) { return i.superType === "asset"; }).length,
      entity: pool.filter(function (i) { return i.superType === "entity"; }).length,
    };

    var ws = document.getElementById("workspace");
    var shell = document.getElementById("shell");
    document.querySelector(".app").classList.toggle("chat-on", state.chatOpen);
    ws.className = "workspace " + (state.detailsOpen ? "page-details" : "page-list");
    ws.style.setProperty("--filters-width", state.widths.filters + "px");
    ws.style.setProperty("--list-width", state.widths.list + "px");
    shell.style.setProperty("--chat-width", state.widths.chat + "px");

    document.getElementById("btn-details").classList.toggle("pressed", state.detailsOpen);
    document.getElementById("btn-details").setAttribute("aria-pressed", String(state.detailsOpen));
    document.getElementById("btn-details").disabled = !results.length;
    if (state.detailsOpen) {
      if (customize.open) {
        customize.open = false;
        customize.draft = null;
        document.getElementById("customize-modal").classList.remove("is-open");
      }
      if (viewUi.open) {
        viewUi.open = false;
        viewUi.pane = "menu";
        document.getElementById("view-popover").classList.remove("is-open");
      }
    }
    document.getElementById("btn-customize").classList.toggle("pressed", customize.open);
    document.getElementById("btn-customize").setAttribute("aria-pressed", String(customize.open));
    document.getElementById("btn-assistant").classList.toggle("pressed", state.chatOpen);
    document.getElementById("btn-assistant").setAttribute("aria-pressed", String(state.chatOpen));
    document.getElementById("btn-view-cards").classList.toggle("on", state.viewMode === "cards");
    document.getElementById("btn-view-gallery").classList.toggle("on", state.viewMode === "gallery");
    document.getElementById("btn-view-table").classList.toggle("on", state.viewMode === "table");
    var viewLocked = state.detailsOpen || !results.length;
    document.getElementById("btn-view-cards").disabled = viewLocked;
    document.getElementById("btn-view-gallery").disabled = viewLocked;
    document.getElementById("btn-view-table").disabled = viewLocked;
    document.querySelector(".view-mode").classList.toggle("is-disabled", viewLocked);
    var canAct = (state.detailsOpen && !!item) || (!state.detailsOpen && checkedCount(results) > 0);
    Array.prototype.forEach.call(document.querySelectorAll(".item-action"), function (btn) {
      btn.disabled = !canAct;
    });
    syncSortButton();
    syncSavedButton();
    syncViewButton();
    syncSearchField();
    renderSessionTabs();

    var tabs = TABS.map(function (t) {
      return '<button type="button" class="' + (state.tab === t.id ? "on" : "") + '" data-tab="' + t.id + '">' + t.label + (emptyIdle ? "" : "<em>" + counts[t.id] + "</em>") + "</button>";
    }).join("");
    document.getElementById("type-tabs").innerHTML = "<span>Search in:</span>" + tabs;
    document.getElementById("type-tabs").hidden = isTypeFilters();

    renderFacets(results);
    renderList(results, sid);
    renderDetails(item, results.length);
    renderChat(item);
    if (sortUi.open) {
      sortUi.draft = currentSort();
      renderSortPopover();
    }
    if (savedUi.open) renderSavedPopover();
    if (suggestUi.open) renderSearchSuggest();
    if (viewUi.open) renderViewPopover();
  }

  function renderFacets(results) {
    var chips = [];
    var seen = {};
    state.facetConfig.concat(Object.keys(state.facets)).forEach(function (key) {
      if (seen[key]) return;
      seen[key] = true;
      (state.facets[key] || []).forEach(function (v) {
        chips.push({ key: key, value: v });
      });
    });
    var html = '<header class="facets-head"><strong>Filters</strong>' +
      '<button type="button" class="icon-quiet" id="btn-facets-config" aria-label="Add filters" aria-pressed="' + String(facetUi.open) + '">' +
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="2.1" stroke="currentColor" stroke-width="1.3"/><path d="M8 2.4v1.4M8 12.2v1.4M2.4 8h1.4M12.2 8h1.4M4.1 4.1l1 1M10.9 10.9l1 1M11.9 4.1l-1 1M5.1 10.9l-1 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' +
      "</button></header>";
    if (chips.length) {
      html += '<div class="chip-block"><button type="button" class="linkish" id="clear-all">Clear all</button><div class="chips">';
      chips.forEach(function (c) {
        html += '<button type="button" class="chip" data-facet="' + c.key + '" data-value="' + escapeHtml(c.value) + '">' + escapeHtml(facetValueLabel(c.key, c.value)) + " ×</button>";
      });
      html += "</div></div>";
    }
    var keys = visibleFacetKeys();
    keys.forEach(function (key) {
      var def = facetDef(key);
      var values = facetValues(key);
      html += '<section class="facet-group"><div class="facet-label"><span class="facet-label-toggle">' + escapeHtml(def.label) + "</span></div><div class=\"facet-body\">";
      values.forEach(function (v) {
        var checked = (state.facets[key] || []).indexOf(v.value) !== -1;
        html += '<label class="facet-option"><input type="checkbox" data-facet="' + key + '" data-value="' + escapeHtml(v.value) + '"' + (checked ? " checked" : "") + '><span class="facet-option-name">' + escapeHtml(facetValueLabel(key, v.value)) + '</span><span class="facet-count">' + v.count + "</span></label>";
      });
      html += "</div></section>";
    });
    if (!keys.length && !chips.length) {
      var noHits = !isEmptyIdle() && !(results && results.length);
      html += '<div class="facets-empty">' +
        (noHits
          ? "<p>No filters to show</p><span>There are no matching items, so there is nothing to refine. Change or clear the search.</span>"
          : "<p>No filters to show</p><span>Use the gear to add filters, or search for items that have attributes to refine.</span>") +
        "</div>";
    }
    document.getElementById("facets").innerHTML = html;
  }

  function visibleFacetKeys() {
    return state.facetConfig.filter(function (key) {
      var def = facetDef(key);
      if (!def || !facetApplies(def, isTypeFilters() ? "all" : state.tab)) return false;
      if ((state.facets[key] || []).length) return true;
      return facetValues(key).length > 0;
    });
  }

  function facetValues(key) {
    var pool = filterAll(key);
    var counts = {};
    pool.forEach(function (item) {
      itemFacetValues(item, key).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
    });
    var keys = Object.keys(counts);
    if (key === "type") {
      var order = { product: 0, classification: 1, asset: 2, entity: 3 };
      keys.sort(function (a, b) { return (order[a] != null ? order[a] : 9) - (order[b] != null ? order[b] : 9); });
    } else {
      keys.sort();
    }
    return keys.map(function (value) { return { value: value, count: counts[value] }; });
  }

  function tableColumns() {
    return tableFields(isNamedViews() ? "all" : state.tab);
  }

  function cellValue(item, key) {
    if (key === "name") return item.name;
    if (key === "type") return TYPE_LABELS[item.superType];
    if (key === "path") return item.path;
    if (key === "identity") return fieldValue(item, identField(item.superType));
    return fieldValue(item, key);
  }

  function formatCell(item, key) {
    var value = cellValue(item, key);
    if (key === "type") return '<span class="badge type-' + item.superType + '">' + escapeHtml(value) + "</span>";
    if (key === "status") {
      var cls = String(value).toLowerCase().replace(/\s+/g, "-");
      return '<span class="status-pill ' + cls + '">' + escapeHtml(value) + "</span>";
    }
    return escapeHtml(value);
  }

  function columnLabel(key) {
    if (key === "name") return "Name";
    if (key === "type") return "Type";
    if (key === "path") return "Path";
    if (key === "identity") return "Identity";
    return FIELD_LABELS[key] || key;
  }

  function sortableKeys() {
    var seen = { name: true };
    var keys = ["name"];
    function add(k) {
      if (!k || seen[k]) return;
      seen[k] = true;
      keys.push(k);
    }
    tableColumns().forEach(add);
    add(currentSort().key);
    add(currentSort().key2);
    return keys;
  }

  function currentSort() {
    var s = state.sort || { key: "", dir: "asc", key2: "" };
    return { key: s.key || "", dir: s.dir || "asc", key2: s.key2 || "" };
  }

  function syncSortButton() {
    var emptyIdle = isEmptyIdle();
    var on = !emptyIdle && !!currentSort().key;
    var btn = document.getElementById("btn-sort");
    btn.disabled = emptyIdle;
    btn.classList.toggle("pressed", on);
    btn.setAttribute("aria-pressed", String(on));
  }

  function ensureSort() {
    var sort = currentSort();
    if (!sort.key || sort.key2 === sort.key) sort.key2 = "";
    state.sort = sort;
  }

  function toggleSort(key) {
    var sort = currentSort();
    if (sort.key === key) {
      sort.dir = sort.dir === "asc" ? "desc" : "asc";
    } else {
      sort.key = key;
      sort.dir = "asc";
      if (sort.key2 === key) sort.key2 = "";
    }
    state.sort = sort;
  }

  function cmpSort(a, b, key, dir) {
    var av = String(cellValue(a, key) || "").toLowerCase();
    var bv = String(cellValue(b, key) || "").toLowerCase();
    var mul = dir === "desc" ? -1 : 1;
    if (av < bv) return -1 * mul;
    if (av > bv) return 1 * mul;
    return 0;
  }

  function sortResults(results) {
    var sort = currentSort();
    if (!sort.key) return results.slice();
    return results.slice().sort(function (a, b) {
      var c = cmpSort(a, b, sort.key, sort.dir);
      if (c !== 0 || !sort.key2) return c;
      return cmpSort(a, b, sort.key2, "asc");
    });
  }

  function sortOptionsHtml(selected, includeBlank, exclude, blankLabel) {
    var html = includeBlank ? '<option value="">' + (blankLabel || "Pick a field to sort by") + "</option>" : "";
    sortableKeys().forEach(function (k) {
      if (exclude && k === exclude) return;
      html += '<option value="' + k + '"' + (selected === k ? " selected" : "") + ">" + escapeHtml(columnLabel(k)) + "</option>";
    });
    return html;
  }

  function pinBelow(el, anchor, gap, widthHint) {
    if (!el || !anchor) return;
    var br = anchor.getBoundingClientRect();
    var width = el.offsetWidth || widthHint || 220;
    var left = Math.max(8, Math.min(br.left, window.innerWidth - width - 8));
    el.style.top = Math.round(br.bottom + (gap || 2)) + "px";
    el.style.left = Math.round(left) + "px";
  }

  function positionSortPopover() {
    pinBelow(document.getElementById("sort-popover"), document.getElementById("btn-sort"), 4, 520);
  }

  function renderSortPopover() {
    if (!sortUi.draft) return;
    var draft = sortUi.draft;
    document.getElementById("sort-key").innerHTML = sortOptionsHtml(draft.key, true, "", "No sort");
    document.getElementById("sort-key-2").innerHTML = sortOptionsHtml(draft.key2, true, draft.key);
    Array.prototype.forEach.call(document.querySelectorAll(".sort-az [data-dir]"), function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-dir") === draft.dir);
    });
    document.getElementById("sort-popover").classList.toggle("is-open", sortUi.open);
    if (sortUi.open) positionSortPopover();
  }

  function openSortPopover() {
    if (isEmptyIdle()) return;
    if (savedUi.open) closeSavedPopover();
    ensureSort();
    sortUi.open = true;
    sortUi.draft = currentSort();
    renderSortPopover();
    syncSortButton();
  }

  function closeSortPopover(apply) {
    if (apply && sortUi.draft) {
      var draft = sortUi.draft;
      if (draft.key2 === draft.key) draft.key2 = "";
      state.sort = { key: draft.key || "", dir: draft.dir || "asc", key2: draft.key ? (draft.key2 || "") : "" };
    }
    sortUi.open = false;
    sortUi.draft = null;
    document.getElementById("sort-popover").classList.remove("is-open");
    render();
  }

  function cloneSearchSort() {
    return cloneSort(currentSort());
  }

  function facetsEqual(a, b) {
    var ak = Object.keys(a || {}).sort();
    var bk = Object.keys(b || {}).sort();
    if (ak.length !== bk.length) return false;
    return ak.every(function (k, i) {
      if (k !== bk[i]) return false;
      return (a[k] || []).slice().sort().join("\0") === (b[k] || []).slice().sort().join("\0");
    });
  }

  function canonicalizeScope(tab, facets) {
    facets = cloneFacets(facets);
    if (tab && tab !== "all") {
      var types = (facets.type || []).slice();
      if (types.indexOf(tab) === -1) types.push(tab);
      facets.type = types;
      tab = "all";
    }
    if (facets.type && !facets.type.length) delete facets.type;
    return { tab: tab || "all", facets: facets };
  }

  function applyScopeToMode(tab, facets) {
    facets = cloneFacets(facets);
    if (isTypeFilters()) {
      if (tab && tab !== "all") {
        var types = (facets.type || []).slice();
        if (types.indexOf(tab) === -1) types.push(tab);
        facets.type = types;
      }
      state.tab = "all";
      state.facets = facets;
      return;
    }
    var selected = (facets.type || []).slice();
    delete facets.type;
    if (tab && tab !== "all") {
      state.tab = tab;
    } else if (selected.length === 1) {
      state.tab = selected[0];
    } else {
      state.tab = "all";
    }
    state.facets = facets;
  }

  function matchesSaved(s) {
    var sort = currentSort();
    var cur = canonicalizeScope(state.tab, state.facets);
    var sav = canonicalizeScope(s.tab, s.facets);
    return s.query === state.query &&
      cur.tab === sav.tab &&
      (s.sort.key || "") === (sort.key || "") &&
      (!(sort.key || s.sort.key) || s.sort.dir === sort.dir) &&
      (s.sort.key2 || "") === (sort.key2 || "") &&
      facetsEqual(cur.facets, sav.facets) &&
      relatedEqual(s.related, state.related) &&
      facetConfigEqual(s.facetConfig || defaultFacetConfig(), state.facetConfig) &&
      viewLinkEqual(s.viewId);
  }

  function loadedSavedSearch() {
    if (!state.savedId) return null;
    for (var i = 0; i < savedSearches.length; i++) {
      if (savedSearches[i].id === state.savedId) return savedSearches[i];
    }
    return null;
  }

  function savedIsDirty() {
    var s = loadedSavedSearch();
    return !!(s && !matchesSaved(s));
  }

  function snapshotSearch() {
    return {
      query: state.query,
      tab: state.tab,
      facets: cloneFacets(state.facets),
      related: cloneRelated(state.related),
      sort: cloneSearchSort(),
      facetConfig: cloneFacetConfig(state.facetConfig),
      viewId: state.viewId,
    };
  }

  function isTabsLayout() {
    return state.savedLayout === "tabs";
  }

  function isNamedViews() {
    return state.customizeMode === "views";
  }

  function isTypeFilters() {
    return state.typePlacement === "filters";
  }

  function loadedNamedView() {
    return namedViewById(state.viewId) || namedViews[0] || null;
  }

  function namedViewById(id) {
    var v = null;
    namedViews.forEach(function (item) { if (item.id === id) v = item; });
    return v;
  }

  function namedViewName(id) {
    var v = namedViewById(id);
    return v ? v.name : "";
  }

  function viewLinkEqual(id) {
    if (!id || !namedViewById(id)) return true;
    return id === state.viewId;
  }

  function applyViewLink(id) {
    var v = namedViewById(id) || namedViews[0];
    if (!v) return;
    if (state.viewId === v.id) return;
    state.viewId = v.id;
    state.viewFields = v.fields.slice();
  }

  function namedViewDirty() {
    var v = loadedNamedView();
    return !!(v && !fieldsEqual(state.viewFields, v.fields));
  }

  function uniqueViewName(base) {
    var names = {};
    namedViews.forEach(function (v) { names[v.name.toLowerCase()] = true; });
    if (!names[base.toLowerCase()]) return base;
    var n = 2;
    while (names[(base + " (" + n + ")").toLowerCase()]) n += 1;
    return base + " (" + n + ")";
  }

  function applyNamedView(id) {
    var v = namedViewById(id);
    if (!v) return;
    if (state.viewId === id) {
      closeViewPopover();
      return;
    }
    applyViewLink(v.id);
    closeViewPopover();
  }

  function saveCurrentNamedView() {
    var v = loadedNamedView();
    if (!v) return;
    v.fields = state.viewFields.slice();
    closeViewPopover();
  }

  function saveNamedViewAs() {
    var name = (document.getElementById("view-name").value || "").trim();
    if (!name) return;
    name = uniqueViewName(name);
    var rec = { id: "view-" + Date.now(), name: name, fields: state.viewFields.slice() };
    namedViews.push(rec);
    state.viewId = rec.id;
    closeViewPopover();
  }

  function syncMatchingNamedViews() {
    var byId = {};
    MATCHING_NAMED_VIEWS.forEach(function (meta) { byId[meta.id] = meta; });
    var seen = {};
    namedViews = namedViews.map(function (v) {
      var meta = byId[v.id];
      if (!meta) return v;
      seen[v.id] = true;
      return { id: v.id, name: meta.name, fields: fieldsForMatchingView(meta.type, state.viewConfig) };
    });
    MATCHING_NAMED_VIEWS.forEach(function (meta) {
      if (seen[meta.id]) return;
      namedViews.push({ id: meta.id, name: meta.name, fields: fieldsForMatchingView(meta.type, state.viewConfig) });
    });
    var current = namedViewById(state.viewId);
    if (current) state.viewFields = current.fields.slice();
  }

  function setTypePlacement(placement) {
    if (state.typePlacement === placement) return;
    var tab = state.tab;
    var facets = cloneFacets(state.facets);
    state.typePlacement = placement;
    applyScopeToMode(tab, facets);
    syncFacetConfigForMode();
    render();
  }

  function setCustomizeMode(mode) {
    if (state.customizeMode === mode) return;
    state.customizeMode = mode;
    if (mode === "views") syncMatchingNamedViews();
    if (viewUi.open) {
      viewUi.open = false;
      document.getElementById("view-popover").classList.remove("is-open");
    }
    render();
  }

  function syncViewButton() {
    var named = isNamedViews();
    var v = loadedNamedView();
    var dirty = named && namedViewDirty();
    var btn = document.getElementById("btn-view");
    var open = customize.open || (named && viewUi.open);
    document.querySelector(".app").classList.toggle("named-views", named);
    document.querySelector(".app").classList.toggle("type-as-filters", isTypeFilters());
    document.getElementById("btn-customize").hidden = named;
    document.getElementById("btn-customize").disabled = state.detailsOpen;
    btn.hidden = !named;
    btn.disabled = state.detailsOpen;
    document.getElementById("btn-view-label").textContent = v ? v.name : "View";
    document.getElementById("btn-view-dot").hidden = !dirty;
    btn.classList.toggle("pressed", open);
    btn.setAttribute("aria-pressed", String(open));
    if (!named && viewUi.open) {
      viewUi.open = false;
      document.getElementById("view-popover").classList.remove("is-open");
    }
  }

  function renderViewPopover() {
    var pop = document.getElementById("view-popover");
    var form = viewUi.pane === "form";
    var dirty = namedViewDirty();
    var check = '<svg class="view-check" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.4 7.2 5.7 10.4 11.6 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.getElementById("view-list").innerHTML = namedViews.map(function (v) {
      var on = v.id === state.viewId;
      return '<button type="button" class="saved-menu-btn view-item' + (on ? " on" : "") + '" data-view="' + v.id + '">' +
        escapeHtml(v.name) + (on ? check : "") + "</button>";
    }).join("");
    document.getElementById("btn-view-save").disabled = !dirty;
    document.getElementById("view-name").value = viewUi.name;
    document.getElementById("view-as-panel").hidden = !form;
    pop.classList.toggle("is-open", viewUi.open);
    pop.classList.toggle("is-form", form);
    if (viewUi.open) pinBelow(pop, document.getElementById("btn-view"), 2, form ? 280 : 240);
  }

  function openViewPopover() {
    if (state.detailsOpen) return;
    if (savedUi.open) closeSavedPopover();
    if (sortUi.open) closeSortPopover(false);
    viewUi.open = true;
    viewUi.pane = "menu";
    var v = loadedNamedView();
    viewUi.name = v ? uniqueViewName(v.name) : "";
    renderViewPopover();
    syncViewButton();
  }

  function closeViewPopover() {
    viewUi.open = false;
    viewUi.pane = "menu";
    document.getElementById("view-popover").classList.remove("is-open");
    render();
  }

  function applySearchSnapshot(snap) {
    if (!snap) return;
    state.query = snap.query;
    state.queryGhost = "";
    state.related = cloneRelated(snap.related);
    applyScopeToMode(snap.tab, snap.facets);
    state.sort = cloneSort(snap.sort);
    state.facetConfig = Array.isArray(snap.facetConfig)
      ? cloneFacetConfig(snap.facetConfig)
      : defaultFacetConfig();
    syncFacetConfigForMode();
    if (snap.viewId) applyViewLink(snap.viewId);
  }

  function emptySearchSnapshot(facetConfig) {
    return {
      query: "",
      tab: "all",
      facets: {},
      related: null,
      sort: { key: "", dir: "asc", key2: "" },
      facetConfig: cloneFacetConfig(facetConfig != null ? facetConfig : defaultFacetConfig()),
      viewId: state.viewId,
    };
  }

  function stashWorkingSearch() {
    state.workingSearch = snapshotSearch();
  }

  function captureSession() {
    if (state.savedId) state.sessionDrafts[state.savedId] = snapshotSearch();
    else stashWorkingSearch();
  }

  function restoreWorkingSearch() {
    if (state.workingSearch) applySearchSnapshot(state.workingSearch);
    state.savedId = null;
  }

  function iconSearchTab() {
    return '<svg class="work-tab-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.2" stroke="currentColor" stroke-width="1.2"/><path d="M10.2 10.2 13 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  }

  function iconDocTab() {
    return '<svg class="work-tab-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.5h5.2L12.5 6v7.5H4V2.5Z" stroke="currentColor" stroke-width="1.2"/><path d="M9.2 2.5V6H12.5" stroke="currentColor" stroke-width="1.2"/></svg>';
  }

  function iconTabCaret() {
    return '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.8 4.4 6 8l3.2-3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function workTabHtml(id, name, on, dirty, renaming) {
    var label = renaming
      ? '<input class="work-tab-rename" data-tab-rename value="' + escapeHtml(tabUi.renameValue) + '" aria-label="Rename">'
      : '<span class="work-tab-name">' + escapeHtml(name) + "</span>";
    var info = id !== "search" && !renaming
      ? '<button type="button" class="work-tab-info" data-tab-info="' + id + '" title="Saved search definition" aria-label="Saved search definition" aria-expanded="' + String(tabUi.infoId === id) + '" aria-controls="tab-info">' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.2"/><path d="M8 7.2v3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="5.3" r="0.8" fill="currentColor"/></svg></button>'
      : "";
    var caret = on && id !== "search"
      ? '<button type="button" class="work-tab-caret" data-tab-menu="' + id + '" aria-label="Tab menu" aria-expanded="' + String(tabUi.menu) + '">' + iconTabCaret() + "</button>"
      : "";
    return '<div class="work-tab' + (on ? " on" : "") + (on && dirty ? " is-dirty" : "") + '" data-session="' + id + '" role="tab" aria-selected="' + String(on) + '">' +
      (id === "search" ? iconSearchTab() : iconDocTab()) +
      label +
      (on && dirty && !renaming ? '<i class="tab-dot" aria-label="Unsaved changes"></i>' : "") +
      info +
      caret +
      "</div>";
  }

  function renderSessionTabs() {
    var el = document.getElementById("session-tabs");
    var tabs = isTabsLayout();
    document.querySelector(".app").classList.toggle("saved-as-tabs", tabs);
    document.getElementById("lab-saved-menu").classList.toggle("on", !tabs);
    document.getElementById("lab-saved-tabs").classList.toggle("on", tabs);
    document.getElementById("lab-start-empty").classList.toggle("on", state.startMode !== "all");
    document.getElementById("lab-start-all").classList.toggle("on", state.startMode === "all");
    document.getElementById("lab-custom-session").classList.toggle("on", !isNamedViews());
    document.getElementById("lab-custom-views").classList.toggle("on", isNamedViews());
    document.getElementById("lab-type-tabs").classList.toggle("on", !isTypeFilters());
    document.getElementById("lab-type-filters").classList.toggle("on", isTypeFilters());
    el.hidden = !tabs;
    if (!tabs) {
      tabUi.infoId = null;
      document.getElementById("tab-info").hidden = true;
      return;
    }
    var dirty = savedIsDirty();
    var html = workTabHtml("search", "Search", !state.savedId, false, false);
    savedSearches.forEach(function (s) {
      var on = state.savedId === s.id;
      html += workTabHtml(s.id, s.name, on, on && dirty, on && tabUi.renameId === s.id);
    });
    el.innerHTML = html;
    if (tabUi.renameId) {
      var input = el.querySelector(".work-tab-rename");
      if (input && document.activeElement !== input) {
        input.focus();
        input.select();
      }
    }
    renderTabMenu();
    renderTabInfo();
  }

  function renderTabMenu() {
    var menu = document.getElementById("tab-menu");
    var saved = loadedSavedSearch();
    var dirty = savedIsDirty();
    var searchDirty = !saved && !!(state.query || state.related || state.tab !== "all" || Object.keys(state.facets).length || currentSort().key);
    var saveBlock = "";
    if (!isTabsLayout() && saved) {
      saveBlock =
        '<button type="button" data-tab-act="save"' + (dirty ? "" : " disabled") + '>' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 3h8v11l-4-2.6L4 14V3Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>Save this search</button>' +
        '<button type="button" data-tab-act="save-as">' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.5h5.2L12.5 6v7.5H4V2.5Z" stroke="currentColor" stroke-width="1.2"/><path d="M9.2 2.5V6H12.5" stroke="currentColor" stroke-width="1.2"/><path d="M8 8v4M6 10h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>Save as new</button>' +
        '<div class="tab-menu-sep"></div>';
    }
    menu.innerHTML = saveBlock +
      '<button type="button" data-tab-act="rename"' + (saved ? "" : " disabled") + '>' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 12.5 12.2 3.8l1.5 1.5-8.7 8.7H3.5v-1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>Rename</button>' +
      '<button type="button" data-tab-act="duplicate">' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="4.5" width="7" height="9" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 11.5V2.5h7" stroke="currentColor" stroke-width="1.2"/></svg>' + (isTabsLayout() ? "Duplicate here" : "Duplicate") + "</button>" +
      (isTabsLayout() ? "" :
      '<div class="tab-menu-sep"></div>' +
      '<button type="button" data-tab-act="reset"' + (saved ? (dirty ? "" : " disabled") : (searchDirty ? "" : " disabled")) + '>' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.2 6.2A5 5 0 1 1 3.5 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4.2 3.6v2.8H7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset</button>') +
      '<div class="tab-menu-sep"></div>' +
      '<button type="button" class="is-danger" data-tab-act="delete"' + (saved ? "" : " disabled") + '>' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 5h8M6.4 5V3.8h3.2V5M5.5 5.5l.4 6.2h4.2l.4-6.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Delete</button>';
    menu.hidden = !tabUi.menu;
    if (tabUi.menu) positionTabMenu();
  }

  function positionTabMenu() {
    var menu = document.getElementById("tab-menu");
    var resultsBtn = document.getElementById("btn-results-saved");
    if (resultsBtn) {
      pinBelow(menu, resultsBtn, 2, 220);
      return;
    }
    var tab = document.querySelector(".work-tab.on");
    var caret = document.querySelector(".work-tab.on .work-tab-caret");
    if (!tab || !caret) {
      menu.hidden = true;
      return;
    }
    pinBelow(menu, tab, 2, 220);
  }

  function closeTabMenu() {
    if (!tabUi.menu) return;
    tabUi.menu = false;
    document.getElementById("tab-menu").hidden = true;
  }

  function savedDefinitionRows(s) {
    var filters = [];
    Object.keys(s.facets || {}).forEach(function (k) {
      var def = facetDef(k);
      var label = def ? def.label : k;
      (s.facets[k] || []).forEach(function (v) {
        filters.push(label + ": " + facetValueLabel(k, v));
      });
    });
    var sort = s.sort && s.sort.key
      ? columnLabel(s.sort.key) + (s.sort.dir === "desc" ? " Z→A" : " A→Z") + (s.sort.key2 ? ", then " + columnLabel(s.sort.key2) : "")
      : "No sort";
    var shown = (Array.isArray(s.facetConfig) ? s.facetConfig : defaultFacetConfig()).map(function (k) {
      var def = facetDef(k);
      return def ? def.label : k;
    }).filter(Boolean);
    return [
      ["Search in", tabLabel(s.tab)],
      ["Query", s.query || "—"],
      ["Related to", s.related ? s.related.name : "—"],
      ["Shown filters", shown.length ? shown.join(" · ") : "None"],
      ["Filters", filters.length ? filters.join(" · ") : "None"],
      ["View", namedViewName(s.viewId) || "Default view"],
      ["Sort", sort],
    ];
  }

  function renderTabInfo() {
    var pop = document.getElementById("tab-info");
    var s = null;
    if (tabUi.infoId) {
      savedSearches.forEach(function (item) { if (item.id === tabUi.infoId) s = item; });
    }
    if (!s) {
      tabUi.infoId = null;
      pop.hidden = true;
      document.querySelectorAll("[data-tab-info]").forEach(function (el) {
        el.setAttribute("aria-expanded", "false");
      });
      return;
    }
    var dirtyNote = state.savedId === s.id && savedIsDirty()
      ? '<p class="tab-info-note">This tab has unsaved changes. The definition below is what is saved.</p>'
      : "";
    pop.innerHTML = '<span class="tab-info-kicker">Saved search</span><strong>' + escapeHtml(s.name) + "</strong>" + dirtyNote +
      "<dl>" + savedDefinitionRows(s).map(function (row) {
        return "<div><dt>" + escapeHtml(row[0]) + "</dt><dd>" + escapeHtml(row[1]) + "</dd></div>";
      }).join("") + "</dl>";
    pop.hidden = false;
    document.querySelectorAll("[data-tab-info]").forEach(function (el) {
      el.setAttribute("aria-expanded", String(el.getAttribute("data-tab-info") === s.id));
    });
    var btn = document.querySelector('[data-tab-info="' + s.id + '"]');
    if (!btn) return;
    pinBelow(pop, btn, 4, 280);
  }

  function closeTabInfo() {
    if (!tabUi.infoId) return;
    tabUi.infoId = null;
    document.getElementById("tab-info").hidden = true;
    document.querySelectorAll("[data-tab-info]").forEach(function (el) {
      el.setAttribute("aria-expanded", "false");
    });
  }

  function uniqueSavedName(base) {
    var names = {};
    savedSearches.forEach(function (s) { names[s.name.toLowerCase()] = true; });
    if (!names[base.toLowerCase()]) return base;
    var n = 2;
    while (names[(base + " (" + n + ")").toLowerCase()]) n += 1;
    return base + " (" + n + ")";
  }

  function renameSavedSearch(id, name) {
    name = (name || "").trim();
    tabUi.renameId = null;
    if (!name) {
      render();
      return;
    }
    var current = null;
    savedSearches.forEach(function (s) { if (s.id === id) current = s; });
    if (!current) {
      render();
      return;
    }
    if (name.toLowerCase() !== current.name.toLowerCase()) name = uniqueSavedName(name);
    savedSearches = savedSearches.map(function (s) {
      if (s.id !== id) return s;
      return Object.assign({}, s, { name: name });
    });
    render();
  }

  function startRename() {
    var s = loadedSavedSearch();
    if (!s) return;
    closeTabMenu();
    tabUi.renameId = s.id;
    tabUi.renameValue = s.name;
    render();
  }

  function duplicateSession() {
    closeTabMenu();
    if (!state.savedId) {
      openSavedPopover("toolbar");
      return;
    }
    var s = loadedSavedSearch();
    var id = "ss-" + Date.now();
    var rec = Object.assign({ id: id, name: uniqueSavedName((s && s.name) || "Search") }, snapshotSearch());
    savedSearches.push(rec);
    state.savedId = id;
    delete state.sessionDrafts[id];
    render();
  }

  function resetSession() {
    closeTabMenu();
    var s = loadedSavedSearch();
    if (s) {
      delete state.sessionDrafts[s.id];
      applySearchSnapshot(s);
      state.savedId = s.id;
      render();
      return;
    }
    state.query = "";
    state.queryGhost = "";
    state.related = null;
    state.tab = "all";
    state.facets = {};
    state.sort = { key: "", dir: "asc", key2: "" };
    stashWorkingSearch();
    render();
  }

  function setSavedLayout(layout) {
    if (state.savedLayout === layout) return;
    state.savedLayout = layout;
    if (layout === "tabs" && state.savedId && !state.workingSearch) {
      state.workingSearch = emptySearchSnapshot();
    }
    if (savedUi.open && isSavedListAnchor() && layout === "tabs") closeSavedPopover();
    else render();
  }

  function requestSession(id) {
    persistOpenSavedSearch();
    var current = state.savedId || "search";
    if (id === current) return;
    if (savedIsDirty() && state.savedId) {
      openLeaveModal(id);
      return;
    }
    selectSession(id);
  }

  function openLeaveModal(nextId) {
    closeTabMenu();
    closeTabInfo();
    if (savedUi.open) {
      savedUi.open = false;
      document.getElementById("saved-popover").classList.remove("is-open");
    }
    closeSearchSuggest();
    if (sortUi.open) {
      sortUi.open = false;
      sortUi.draft = null;
      document.getElementById("sort-popover").classList.remove("is-open");
    }
    leaveUi.open = true;
    leaveUi.nextId = nextId;
    renderLeaveModal();
  }

  function closeLeaveModal() {
    var pending = leaveUi.pendingChat;
    leaveUi.open = false;
    leaveUi.nextId = null;
    leaveUi.pendingChat = null;
    leaveUi.pendingQuery = null;
    document.getElementById("leave-modal").classList.remove("is-open");
    if (pending) {
      var saved = loadedSavedSearch();
      var name = saved ? "“" + saved.name + "”" : "your saved search";
      state.messages.push({
        role: "assistant",
        text: "I didn’t start a new search. " + name + " still has unsaved changes.",
        suggestions: STARTERS,
      });
      render();
    }
  }

  function renderLeaveModal() {
    var modal = document.getElementById("leave-modal");
    var saved = loadedSavedSearch();
    var title = saved
      ? "Do you want to save the changes that you made to “" + saved.name + "”?"
      : "Do you want to save the changes that you made to your saved search?";
    document.getElementById("leave-title").textContent = title;
    modal.classList.toggle("is-open", leaveUi.open);
  }

  function discardLoadedChanges() {
    var s = loadedSavedSearch();
    if (!s) return;
    delete state.sessionDrafts[s.id];
    applySearchSnapshot(s);
    state.savedId = s.id;
  }

  function finishLeave(save) {
    var nextId = leaveUi.nextId;
    var pendingChat = leaveUi.pendingChat;
    var pendingQuery = leaveUi.pendingQuery;
    leaveUi.pendingChat = null;
    leaveUi.pendingQuery = null;
    closeLeaveModal();
    if (save) updateLoadedSearch();
    else discardLoadedChanges();
    if (pendingChat) {
      beginNewFromAssistant();
      replyFromAssistant(pendingChat, "new");
      return;
    }
    if (pendingQuery != null) {
      applyNewQuerySearch(pendingQuery);
      return;
    }
    if (nextId) selectSession(nextId);
    else render();
  }

  function selectSession(id) {
    closeTabMenu();
    closeTabInfo();
    if (savedUi.open && isSavedListAnchor()) {
      savedUi.open = false;
      document.getElementById("saved-popover").classList.remove("is-open");
    }
    tabUi.renameId = null;
    if (id === "search") {
      if (!state.savedId) return;
      captureSession();
      restoreWorkingSearch();
      render();
      return;
    }
    if (state.savedId === id) return;
    captureSession();
    var draft = state.sessionDrafts[id];
    if (draft) {
      applySearchSnapshot(draft);
      state.savedId = id;
      render();
      return;
    }
    applySavedSearch(id);
  }

  function savedSummary(s) {
    var parts = [tabLabel(s.tab)];
    if (s.query) parts.push(s.query);
    Object.keys(s.facets || {}).forEach(function (k) {
      (s.facets[k] || []).forEach(function (v) {
        parts.push(facetValueLabel(k, v));
      });
    });
    return parts.join(" · ");
  }

  function isSavedListAnchor() {
    return savedUi.anchor === "results";
  }

  function syncSavedButton() {
    var emptyIdle = isEmptyIdle();
    var saving = !emptyIdle && savedUi.open && savedUi.anchor === "toolbar";
    var btn = document.getElementById("btn-saved");
    var loaded = loadedSavedSearch();
    document.getElementById("btn-saved-label").textContent = "Save search";
    document.getElementById("btn-saved-caret").hidden = !loaded;
    btn.disabled = emptyIdle;
    btn.classList.toggle("pressed", saving);
    btn.setAttribute("aria-pressed", String(saving));
    btn.setAttribute("aria-haspopup", loaded ? "menu" : "dialog");
    document.getElementById("btn-saved-open").setAttribute("aria-expanded", String(suggestUi.open));
    document.getElementById("btn-saved-open").hidden = isTabsLayout() || !savedSearches.length;
    document.querySelector(".app").classList.toggle("search-saved-menu", !isTabsLayout() && savedSearches.length > 0);
    document.getElementById("search-field").classList.toggle("is-open", suggestUi.open);
    document.querySelector(".app").classList.toggle("has-saved-search", !isTabsLayout() && !!loaded);
    var resultsBtn = document.getElementById("btn-results-saved");
    if (resultsBtn) resultsBtn.setAttribute("aria-expanded", String(tabUi.menu));
  }

  function positionSavedPopover() {
    var pop = document.getElementById("saved-popover");
    var el = savedUi.anchor === "title" || savedUi.anchor === "results"
      ? document.getElementById("btn-results-saved") || document.getElementById("btn-saved")
      : savedUi.anchor === "search"
        ? document.getElementById("search-field")
        : document.getElementById("btn-saved");
    if (!el) el = document.getElementById("search-field");
    var list = isSavedListAnchor();
    var toolbarWidth = savedUi.pane === "form" ? 280 : 240;
    var listMin = savedUi.anchor === "results" ? 280 : 360;
    pop.style.width = list ? Math.max(listMin, el.getBoundingClientRect().width) + "px" : toolbarWidth + "px";
    pinBelow(pop, el, 2, list ? listMin : toolbarWidth);
  }

  function renderSavedPopover() {
    var active = loadedSavedSearch();
    var list = document.getElementById("saved-list");
    if (!savedSearches.length) {
      list.innerHTML = '<li class="saved-empty">No saved searches. Use Save search in the toolbar to keep this query.</li>';
    } else {
      var emptyCheck = '<svg class="saved-check" viewBox="0 0 14 14" fill="none" aria-hidden="true"></svg>';
      var rows = savedSearches.map(function (s) {
        var on = active && active.id === s.id;
        var check = on
          ? '<svg class="saved-check" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.4 7.2 5.7 10.4 11.6 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : emptyCheck;
        return '<li class="saved-row' + (on ? " on" : "") + '">' +
          '<button type="button" class="saved-item" data-saved="' + s.id + '">' +
          check +
          '<span class="saved-item-body"><strong>' + escapeHtml(s.name) + "</strong><em>" + escapeHtml(savedSummary(s)) + "</em></span></button>" +
          '<button type="button" class="icon-quiet" data-saved-del="' + s.id + '" aria-label="Delete">' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 5h8M6.4 5V3.8h3.2V5M5.5 5.5l.4 6.2h4.2l.4-6.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "</button></li>";
      }).join("");
      if (savedUi.anchor === "results" && active) {
        rows = '<li class="saved-row saved-row-new"><button type="button" class="saved-item" data-saved="search">' +
          emptyCheck +
          '<span class="saved-item-body"><strong>New search</strong><em>Leave this saved search</em></span></button></li>' + rows;
      }
      list.innerHTML = rows;
    }
    document.getElementById("saved-name").value = savedUi.name;
    var loaded = loadedSavedSearch();
    var saveAnchor = savedUi.anchor === "toolbar" || savedUi.anchor === "title";
    var form = saveAnchor && savedUi.pane === "form";
    document.getElementById("btn-saved-update").disabled = !loaded || !savedIsDirty();
    document.getElementById("saved-as-title").textContent = loaded ? "Save as new" : "Save search";
    document.getElementById("saved-as-panel").hidden = !form;
    document.getElementById("saved-popover").classList.toggle("is-open", savedUi.open);
    document.getElementById("saved-popover").classList.toggle("is-list", isSavedListAnchor());
    document.getElementById("saved-popover").classList.toggle("is-save", saveAnchor);
    document.getElementById("saved-popover").classList.toggle("is-menu", saveAnchor && savedUi.pane === "menu");
    document.getElementById("saved-popover").classList.toggle("is-form", form);
    if (savedUi.open) positionSavedPopover();
  }

  function openSavedPopover(anchor) {
    if ((anchor || "search") === "toolbar" && isEmptyIdle()) return;
    if (sortUi.open) closeSortPopover(false);
    savedUi.open = true;
    savedUi.anchor = anchor || "search";
    var loaded = loadedSavedSearch();
    savedUi.pane = loaded ? "menu" : "form";
    savedUi.name = loaded ? uniqueSavedName(loaded.name) : "";
    renderSavedPopover();
    syncSavedButton();
    if (savedUi.anchor === "toolbar" && savedUi.pane === "form") {
      document.getElementById("saved-name").focus();
    }
  }

  function openSaveAsForm(anchor) {
    var loaded = loadedSavedSearch();
    if (sortUi.open) closeSortPopover(false);
    closeTabMenu();
    savedUi.open = true;
    savedUi.anchor = anchor || "toolbar";
    savedUi.pane = "form";
    savedUi.name = loaded ? uniqueSavedName(loaded.name) : "";
    renderSavedPopover();
    syncSavedButton();
    document.getElementById("saved-name").focus();
    document.getElementById("saved-name").select();
  }

  function closeSavedPopover() {
    savedUi.open = false;
    savedUi.anchor = "toolbar";
    document.getElementById("saved-popover").classList.remove("is-open");
    render();
  }

  function pushRecent(query) {
    query = (query || "").trim();
    if (!query) return;
    recentSearches = recentSearches.filter(function (q) { return q.toLowerCase() !== query.toLowerCase(); });
    recentSearches.unshift(query);
    if (recentSearches.length > 10) recentSearches.length = 10;
  }

  function positionSearchSuggest() {
    var pop = document.getElementById("search-suggest");
    var el = document.getElementById("search-field");
    if (!pop || !el) return;
    var width = Math.max(240, el.getBoundingClientRect().width);
    pop.style.width = width + "px";
    pinBelow(pop, el, 0, width);
  }

  function renderSearchSuggest() {
    var pop = document.getElementById("search-suggest");
    var recents = recentSearches.slice(0, 3);
    var saved = savedSearches.slice().reverse().slice(0, 5);
    var html = "";
    if (recents.length) {
      html += '<p class="search-suggest-label">Latest searches</p>';
      recents.forEach(function (q, i) {
        html += '<button type="button" class="search-suggest-item" data-recent-i="' + i + '">' + escapeHtml(q) + "</button>";
      });
    }
    if (saved.length && !isTabsLayout()) {
      html += '<p class="search-suggest-label">Saved searches</p>';
      saved.forEach(function (s) {
        html += '<button type="button" class="search-suggest-item" data-saved="' + s.id + '">' + escapeHtml(s.name) + "</button>";
      });
    }
    if (!html) html = '<p class="search-suggest-empty">No recent searches</p>';
    pop.innerHTML = html;
    pop.hidden = !suggestUi.open;
    pop.classList.toggle("is-open", suggestUi.open);
    if (suggestUi.open) positionSearchSuggest();
  }

  function openSearchSuggest() {
    if (sortUi.open) closeSortPopover(false);
    if (savedUi.open && savedUi.anchor !== "toolbar") closeSavedPopover();
    suggestUi.open = true;
    renderSearchSuggest();
    syncSavedButton();
  }

  function closeSearchSuggest() {
    if (!suggestUi.open) return;
    suggestUi.open = false;
    var pop = document.getElementById("search-suggest");
    pop.hidden = true;
    pop.classList.remove("is-open");
    var openBtn = document.getElementById("btn-saved-open");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
    document.getElementById("search-field").classList.remove("is-open");
  }

  function applyNewQuerySearch(query) {
    query = (query || "").trim();
    if (state.savedId) {
      if (savedIsDirty()) captureSession();
      else delete state.sessionDrafts[state.savedId];
      state.savedId = null;
    }
    applySearchSnapshot(emptySearchSnapshot());
    state.query = query;
    state.queryGhost = "";
    state.related = null;
    if (query) pushRecent(query);
    document.getElementById("search-input").value = query;
    closeSearchSuggest();
    render();
  }

  function startNewSearch(query) {
    query = (query || "").trim();
    persistOpenSavedSearch();
    closeSearchSuggest();
    if (state.savedId && savedIsDirty()) {
      leaveUi.pendingQuery = query;
      openLeaveModal(null);
      return;
    }
    applyNewQuerySearch(query);
  }

  function submitSearchInput() {
    var query = document.getElementById("search-input").value.trim();
    if (!query) {
      closeSearchSuggest();
      if (!state.savedId) {
        state.query = "";
        state.queryGhost = "";
        render();
      }
      return;
    }
    startNewSearch(query);
  }

  function applySavedSearch(id) {
    var s = null;
    savedSearches.forEach(function (item) { if (item.id === id) s = item; });
    if (!s) return;
    applySearchSnapshot(s);
    state.savedId = s.id;
    closeSavedPopover();
  }

  function writeSearchRecord(id, name) {
    var rec = Object.assign({ id: id, name: name }, snapshotSearch());
    var found = false;
    savedSearches = savedSearches.map(function (s) {
      if (s.id !== id) return s;
      found = true;
      return rec;
    });
    if (!found) savedSearches.push(rec);
    state.savedId = id;
    return rec;
  }

  function updateLoadedSearch() {
    var s = loadedSavedSearch();
    if (!s) return;
    writeSearchRecord(s.id, s.name);
    delete state.sessionDrafts[s.id];
    render();
  }

  function persistOpenSavedSearch() {
    if (!isTabsLayout() || !state.savedId) return;
    var s = loadedSavedSearch();
    if (!s || matchesSaved(s)) return;
    writeSearchRecord(s.id, s.name);
    delete state.sessionDrafts[s.id];
  }

  function saveCurrentSearch() {
    var name = (document.getElementById("saved-name").value || "").trim();
    if (!name) return;
    var loaded = loadedSavedSearch();
    var id;
    if (loaded) {
      id = "ss-" + Date.now();
      name = uniqueSavedName(name);
    } else {
      var existing = null;
      savedSearches.forEach(function (s) { if (s.name.toLowerCase() === name.toLowerCase()) existing = s; });
      id = existing ? existing.id : "ss-" + Date.now();
      state.workingSearch = emptySearchSnapshot(state.facetConfig);
    }
    writeSearchRecord(id, name);
    delete state.sessionDrafts[id];
    savedUi.name = name;
    closeSavedPopover();
  }

  function deleteSavedSearch(id) {
    savedSearches = savedSearches.filter(function (s) { return s.id !== id; });
    delete state.sessionDrafts[id];
    if (state.savedId === id) {
      state.savedId = null;
      stashWorkingSearch();
    }
    renderSavedPopover();
    syncSavedButton();
    render();
  }

  function isChecked(id) {
    return !!state.checked[id];
  }

  function checkedCount(results) {
    var n = 0;
    results.forEach(function (item) {
      if (state.checked[item.id]) n += 1;
    });
    return n;
  }

  function checkHtml(id) {
    return '<input type="checkbox" data-check="' + id + '"' + (isChecked(id) ? " checked" : "") + ">";
  }

  function colClass(key, index, sort) {
    var cls = [];
    if (index === 0) cls.push("frozen");
    if (key === "name") cls.push("name");
    if (sort.key === key) cls.push("sorted");
    return cls.length ? ' class="' + cls.join(" ") + '"' : "";
  }

  function renderTable(results, sid) {
    var cols = tableColumns();
    var sort = currentSort();
    var mark = sort.dir === "desc" ? " ↓" : " ↑";
    var head = '<th class="lead"></th>';
    cols.forEach(function (key, i) {
      head += '<th' + colClass(key, i, sort) + ' data-sort="' + key + '">' + escapeHtml(columnLabel(key)) + (sort.key === key ? mark : "") + "</th>";
    });
    var rows = results.map(function (item) {
      var cells = '<td class="lead"><div class="lead-inner">' + checkHtml(item.id) + thumb(item, 32) + "</div></td>";
      cols.forEach(function (key, i) {
        cells += "<td" + colClass(key, i, sort) + ">" + formatCell(item, key) + "</td>";
      });
      return '<tr class="' + (item.id === sid ? "active" : "") + (state.suggested.indexOf(item.id) !== -1 ? " suggested" : "") + '" data-id="' + item.id + '">' + cells + "</tr>";
    }).join("");
    return '<div class="grid-wrap"><table class="grid-table"><thead><tr>' + head + "</tr></thead><tbody>" + (rows || "") + "</tbody></table></div>";
  }

  function isMixedResults(results) {
    var mixed = isTypeFilters() || state.tab === "all";
    if (mixed && results.length) {
      mixed = results.some(function (item) { return item.superType !== results[0].superType; });
    }
    return mixed;
  }

  function renderCards(results, sid) {
    var nav = state.detailsOpen;
    var mixed = isMixedResults(results);
    return results.map(function (item) {
      var extra = "";
      if (!nav) {
        extra = '<dl class="card-attrs">';
        cardFields(item.superType).forEach(function (key) {
          extra += "<div><dt>" + escapeHtml(FIELD_LABELS[key] || key) + "</dt><dd>" + escapeHtml(fieldValue(item, key)) + "</dd></div>";
        });
        extra += "</dl>";
      }
      var badge = mixed ? '<span class="badge type-' + item.superType + '">' + TYPE_LABELS[item.superType] + "</span>" : "";
      var check = nav ? "" : '<label class="card-check">' + checkHtml(item.id) + "</label>";
      return (
        '<article class="card card-' + item.superType + (item.id === sid ? " active" : "") + (state.suggested.indexOf(item.id) !== -1 ? " suggested" : "") + '" data-id="' + item.id + '">' +
        check +
        thumb(item, nav ? 40 : 48) +
        '<div class="card-body"><div class="card-title-row"><h3>' + escapeHtml(item.name) + "</h3>" + badge + "</div>" +
        '<p class="card-path">' + escapeHtml(item.path) + "</p>" + extra + "</div></article>"
      );
    }).join("");
  }

  function renderGallery(results, sid) {
    var mixed = isMixedResults(results);
    return '<div class="gallery">' + results.map(function (item) {
      var badge = mixed ? '<span class="badge type-' + item.superType + '">' + TYPE_LABELS[item.superType] + "</span>" : "";
      return (
        '<article class="gallery-tile' + (item.id === sid ? " active" : "") + (state.suggested.indexOf(item.id) !== -1 ? " suggested" : "") + '" data-id="' + item.id + '">' +
          '<div class="gallery-media"><label class="gallery-check">' + checkHtml(item.id) + "</label>" + thumb(item) + "</div>" +
          '<div class="gallery-meta"><h3>' + escapeHtml(item.name) + "</h3>" + badge + "</div>" +
        "</article>"
      );
    }).join("") + "</div>";
  }

  function emptyStartHtml(title, copy) {
    return '<div class="empty-start">' +
      '<svg class="empty-start-ico" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="28" cy="28" r="16.5" stroke="currentColor" stroke-width="3"/><path d="M40.5 40.5 52 52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' +
      "<h2>" + escapeHtml(title) + "</h2>" +
      "<p>" + escapeHtml(copy) + "</p>" +
      "</div>";
  }

  function renderList(results, sid) {
    var nav = state.detailsOpen;
    var mode = nav ? "cards" : state.viewMode;
    var table = mode === "table";
    var gallery = mode === "gallery";
    if (isEmptyIdle()) {
      document.getElementById("results").innerHTML = '<div class="result-scroll empty-start-wrap">' + emptyStartHtml("No search criteria", "Type a query or choose a filter to view results") + "</div>";
      document.getElementById("results").className = "results" + (nav ? " results-nav" : "");
      return;
    }
    var nSel = checkedCount(results);
    var allOn = results.length > 0 && nSel === results.length;
    var selectAll = nav ? "" : '<label class="select-all"><input type="checkbox" data-select-all' + (allOn ? " checked" : "") + "> Select All</label>";
    var saved = loadedSavedSearch();
    var dirty = savedIsDirty();
    var title;
    if (saved && !isTabsLayout()) {
      if (tabUi.renameId === saved.id) {
        title = '<div class="results-saved">' +
          '<input class="results-saved-rename" data-results-rename value="' + escapeHtml(tabUi.renameValue) + '" aria-label="Rename saved search">' +
          "</div>" +
          '<p class="results-count">' + results.length + " results</p>";
      } else {
        title = '<div class="results-saved">' +
          '<button type="button" class="results-saved-btn" id="btn-results-saved" aria-haspopup="menu" aria-expanded="' + String(tabUi.menu) + '">' +
            "<h2>" + escapeHtml(saved.name) + "</h2>" +
            (dirty ? '<i class="tab-dot" title="Unsaved changes"></i>' : "") +
            '<svg class="results-saved-caret" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "</button>" +
          "</div>" +
          '<p class="results-count">' + results.length + " results</p>";
      }
    } else {
      title = "<h2>" + results.length + " results</h2>" + (saved && dirty ? '<p class="results-count"><span class="results-dirty">Unsaved changes</span></p>' : "");
    }
    var body = results.length
      ? (table ? renderTable(results, sid) : gallery ? renderGallery(results, sid) : renderCards(results, sid))
      : emptyStartHtml("No results", "No items match the current query and filters");
    document.getElementById("results").innerHTML =
      '<header class="results-head' + (saved && !isTabsLayout() ? " has-saved" : "") + '"><div>' + title + selectAll + "</div></header>" +
      '<div class="result-scroll' + (results.length ? "" : " empty-start-wrap") + '">' + body + "</div>" +
      '<footer class="results-foot">' + results.length + " items" + (nav ? "" : ", " + nSel + " selected") + "</footer>";
    document.getElementById("results").className = "results" + (nav ? " results-nav" : "") + (table ? " results-table" : "") + (gallery ? " results-gallery" : "");
    var selectAllInput = document.querySelector("#results [data-select-all]");
    if (selectAllInput) selectAllInput.indeterminate = nSel > 0 && nSel < results.length;
    if (!isTabsLayout()) {
      if (tabUi.menu) renderTabMenu();
      var renameInput = document.querySelector("#results [data-results-rename]");
      if (renameInput && document.activeElement !== renameInput) {
        renameInput.focus();
        renameInput.select();
      }
    }
  }

  function renderDetails(item, resultCount) {
    var el = document.getElementById("details");
    if (!item) {
      if (isEmptyIdle()) {
        el.innerHTML = '<div class="details-empty"><h2>No search criteria</h2><p>Type a query or choose a filter to view results.</p></div>';
      } else if (!resultCount) {
        el.innerHTML = '<div class="details-empty"><h2>No results</h2><p>No items match the current query and filters.</p></div>';
      } else {
        el.innerHTML = '<div class="details-empty"><h2>Select an item</h2><p>Choose a result in the list to see its content here.</p></div>';
      }
      return;
    }
    var bars = (item.bars || []).map(function (b) {
      return '<div class="bar-row"><span>' + escapeHtml(b.label) + '</span><div class="bar"><i style="width:' + b.value + '%"></i></div><em>' + b.value + "%</em></div>";
    }).join("");
    var groups = (item.groups || []).map(function (g) {
      var rows = g.rows.map(function (r) {
        return '<div class="attr-row"><span>' + escapeHtml(r.label) + "</span><span>" + escapeHtml(r.value) + "</span></div>";
      }).join("");
      return '<section class="attr-group"><h3>' + escapeHtml(g.name) + "</h3>" + rows + "</section>";
    }).join("");
    var deg = Math.round((item.completeness / 100) * 360);
    el.innerHTML =
      '<header class="details-head">' + thumb(item, 56) + '<div class="details-ident"><p class="card-path">' + escapeHtml(item.path) + "</p><h2>" + escapeHtml(item.name) + '</h2><p class="more-info">' + escapeHtml(TYPE_LABELS[item.superType] + " · " + fieldValue(item, identField(item.superType))) + "</p></div></header>" +
      '<div class="details-widgets"><div class="widget completeness"><div class="donut" style="background:conic-gradient(var(--accent) ' + deg + 'deg, #d8dee2 0deg)"><div class="donut-hole"><strong>' + item.completeness + '%</strong><span>Complete</span></div></div><div><h3>Completeness</h3>' + bars + "</div></div></div>" +
      '<nav class="details-tabs"><button type="button" class="on">Attributes</button><button type="button">Compare</button><button type="button">Assets</button><button type="button">PDX</button></nav>' +
      '<div class="details-body">' + groups + "</div>";
  }

  var STARTERS = ["Find red running shoes in size 42", "Find the laces of Pegasus 41", "Show approved Nike footwear"];

  function renderChat(item) {
    var ctx = document.getElementById("chat-context");
    var saved = loadedSavedSearch();
    var currentOn = state.chatScope !== "new";
    var dirty = !!saved && savedIsDirty();
    var currentLabel = saved ? saved.name : "Current search";
    var hint = currentOn
      ? (saved ? "Narrows “" + saved.name + "” and keeps it open." : "Adds to the filters that are open now.")
      : (saved && dirty ? "Starts a new Search. You’ll be asked about unsaved changes." : "Leaves this search and starts a new one.");
    ctx.innerHTML =
      '<div class="chat-scope"><em>Apply to</em>' +
        '<div class="chat-scope-opts" role="radiogroup" aria-label="Where to apply this search">' +
          '<button type="button" class="chat-scope-btn' + (currentOn ? " on" : "") + '" data-chat-scope="current" role="radio" aria-checked="' + String(currentOn) + '">' +
            '<span class="chat-scope-name">' + escapeHtml(currentLabel) + "</span>" +
            (dirty ? '<i class="tab-dot" title="Unsaved changes"></i>' : "") +
          "</button>" +
          '<button type="button" class="chat-scope-btn' + (currentOn ? "" : " on") + '" data-chat-scope="new" role="radio" aria-checked="' + String(!currentOn) + '">New search</button>' +
        "</div>" +
        '<p class="chat-scope-hint">' + escapeHtml(hint) + "</p></div>" +
      (item ? '<div class="chat-viewing">' + thumb(item, 28) + "<span><em>Viewing</em>" + escapeHtml(item.name) + "</span></div>" : "");
    var input = document.getElementById("chat-input");
    if (document.activeElement !== input) {
      input.placeholder = currentOn && saved
        ? "Narrow “" + saved.name + "”…"
        : currentOn
          ? "Narrow this search…"
          : "Find red running shoes in size 42";
    }
    var log = document.getElementById("chat-log");
    if (!state.messages.length) {
      log.innerHTML = '<div class="chat-empty"><p>Choose whether to continue in this search or start a new one. Attributes become filters. Relationships like “laces of product X” stay in the search field.</p></div>';
    } else {
      log.innerHTML = state.messages.map(function (m) {
        var applied = "";
        if (m.applied) {
          applied = '<div class="applied"><span>' + escapeHtml(m.applied.target || "Applied to Search") + "</span><em>Query · " + escapeHtml(m.applied.query || "—") + "</em>" +
            (m.applied.related ? "<em>Related to · " + escapeHtml(m.applied.related) + "</em>" : "") +
            "<em>Hits · " + m.applied.count + "</em></div>";
        }
        var mentions = (m.mentions || []).map(function (id) {
          var it = byId(id);
          return it ? '<button type="button" data-mention="' + id + '">' + escapeHtml(it.name) + "</button>" : "";
        }).join("");
        return '<article class="bubble ' + m.role + '">' + m.text.split("\n").map(function (line) { return "<p>" + escapeHtml(line) + "</p>"; }).join("") + applied + (mentions ? '<div class="mentions">' + mentions + "</div>" : "") + "</article>";
      }).join("");
    }
    var suggestions = (state.messages.length && state.messages[state.messages.length - 1].suggestions) || STARTERS;
    document.getElementById("chat-suggestions").innerHTML = suggestions.map(function (s) {
      return '<button type="button" data-suggest="' + escapeHtml(s) + '">' + escapeHtml(s) + "</button>";
    }).join("");
  }

  function toggleFacet(key, value) {
    var cur = (state.facets[key] || []).slice();
    var i = cur.indexOf(value);
    if (i === -1) cur.push(value);
    else cur.splice(i, 1);
    if (cur.length) state.facets[key] = cur;
    else delete state.facets[key];
    render();
  }

  function leftoverMatches(leftover, facets, tab) {
    if (!(leftover || "").trim()) return false;
    return CATALOG.some(function (item) {
      if (tab && tab !== "all" && item.superType !== tab) return false;
      if (!matchesRelated(item)) return false;
      if (!matchesQuery(item, leftover)) return false;
      return matchesFacets(item, facets);
    });
  }

  function findMentionedProduct(raw) {
    var best = null;
    var bestScore = 0;
    var skip = { zoom: 1, air: 1, fresh: 1, foam: 1, wave: 1, gel: 1, one: 1, dri: 1, fit: 1 };
    CATALOG.forEach(function (item) {
      if (item.superType !== "product" || item.relatedTo) return;
      var name = item.name.toLowerCase();
      if (raw.indexOf(name) !== -1 && name.length > bestScore) {
        best = item;
        bestScore = name.length;
        return;
      }
      name.replace(/^(nike|adidas|hoka|brooks|on|new balance|asics|saucony|puma|mizuno|salomon)\s+/, "")
        .split(/[\s/—-]+/)
        .forEach(function (t) {
          if (t.length < 4 || /^\d+$/.test(t) || skip[t]) return;
          if (new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(raw) && t.length > bestScore) {
            best = item;
            bestScore = t.length;
          }
        });
    });
    return best;
  }

  function isRelatedAsk(raw) {
    return /\b(laces?|accessor(?:y|ies)|linked(?:\s+to)?|related(?:\s+to)?|references?|packshots?|assets?\s+of|of\s+(the\s+)?product)\b/.test(raw);
  }

  function stripRelatedWords(text, product) {
    var out = " " + (text || "").toLowerCase() + " ";
    ["linked", "related", "reference", "references"].forEach(function (w) {
      out = out.replace(new RegExp("\\b" + w + "\\b", "g"), " ");
    });
    if (product) {
      product.name.toLowerCase().split(/[\s/—-]+/).forEach(function (w) {
        if (w.length > 2) out = out.replace(new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), " ");
      });
    }
    return out.replace(/\s+/g, " ").trim();
  }

  function syncSearchField() {
    var input = document.getElementById("search-input");
    var ghost = (state.queryGhost || "").trim();
    var query = (state.query || "").trim();
    var shown = query || ghost;
    if (document.activeElement !== input) input.value = shown;
    document.getElementById("search-clauses").innerHTML = state.related
      ? '<span class="search-clause"><em>Related to</em> <span class="search-clause-name">' + escapeHtml(state.related.name) + "</span>" +
        '<button type="button" data-clear-related aria-label="Remove related to">✕</button></span>'
      : "";
    var field = document.getElementById("search-field");
    field.classList.toggle("is-unmatched", !query && !!ghost);
    field.classList.toggle("has-clause", !!state.related);
    field.classList.toggle("has-clear", !!(shown || state.related));
    document.getElementById("btn-search-clear").hidden = !(shown || state.related);
    document.getElementById("btn-saved-open").setAttribute("aria-label", "Recent and saved searches");
    if (document.activeElement !== input) input.placeholder = "Search";
  }

  function mergeFacets(base, incoming) {
    var out = cloneFacets(base);
    Object.keys(incoming || {}).forEach(function (k) {
      if ((incoming[k] || []).length) out[k] = incoming[k].slice();
      else delete out[k];
    });
    return out;
  }

  function beginNewFromAssistant() {
    var layout = state.savedId ? null : state.facetConfig;
    if (state.savedId) captureSession();
    state.savedId = null;
    applySearchSnapshot(emptySearchSnapshot(layout));
  }

  function replyFromAssistant(text, mode) {
    var reply = applyAssistantSearch(text, mode);
    state.messages.push({ role: "assistant", text: reply.text, applied: reply.applied, mentions: reply.mentions, suggestions: reply.suggestions });
    render();
  }

  function applyAssistantSearch(text, mode) {
    mode = mode || state.chatScope || "current";
    var startNew = mode === "new";
    var raw = text.toLowerCase().trim();
    var saved = loadedSavedSearch();
    if (/^(clear|reset)\b/.test(raw)) {
      state.query = "";
      state.queryGhost = "";
      state.related = null;
      state.facets = {};
      state.suggested = [];
      if (startNew) {
        state.tab = "all";
        state.savedId = null;
      }
      applyScopeToMode(state.tab, state.facets);
      var clearedName = startNew ? "a new Search" : (saved ? "“" + saved.name + "”" : "this search");
      return { text: "Search is cleared on " + clearedName + ". Add a query or a filter to see results.", suggestions: STARTERS };
    }
    var incoming = {};
    var stop = {
      find: 1, show: 1, me: 1, search: 1, for: 1, get: 1, list: 1, the: 1, a: 1, an: 1, in: 1, with: 1,
      and: 1, or: 1, please: 1, all: 1, only: 1, just: 1, of: 1, to: 1, view: 1, results: 1, items: 1,
      products: 1, product: 1, footwear: 1, shoes: 1, shoe: 1,
    };
    function take(word) { stop[word] = 1; }
    if (/\bred\b/.test(raw)) { incoming.color = ["Red"]; take("red"); }
    if (/\bblack\b/.test(raw)) { incoming.color = ["Black"]; take("black"); }
    var size = raw.match(/\b(?:size|eu)\s*(\d{2})\b/);
    if (size) { incoming.size = [size[1]]; take("size"); take("eu"); take(size[1]); }
    ["Nike", "Adidas", "Hoka", "Brooks", "On", "New Balance", "ASICS", "Saucony", "Puma", "Mizuno", "Salomon"].forEach(function (b) {
      var re = new RegExp("\\b" + b.toLowerCase().replace(/\s+/g, "\\s+") + "\\b");
      if (re.test(raw)) {
        incoming.brand = [b];
        b.toLowerCase().split(/\s+/).forEach(take);
      }
    });
    if (/running/.test(raw)) { incoming.category = ["Running shoes"]; take("running"); }
    if (/\bapproved\b/.test(raw)) { incoming.status = ["Approved"]; take("approved"); }
    var tokens = raw.split(/\s+/).filter(function (w) { return w && !stop[w]; });
    var leftover = tokens.join(" ");
    var mentioned = findMentionedProduct(raw);
    var relatedAsk = mentioned && isRelatedAsk(raw) ? { id: mentioned.id, name: mentioned.name } : null;
    if (relatedAsk) leftover = stripRelatedWords(leftover, mentioned);
    var facets = startNew ? incoming : mergeFacets(state.facets, incoming);
    var related = relatedAsk || (startNew ? null : cloneRelated(state.related));
    var tab = relatedAsk ? "all" : (startNew ? "product" : state.tab);
    var hasFacets = Object.keys(facets).some(function (k) { return (facets[k] || []).length; });
    if (!leftover && !startNew) leftover = state.query || state.queryGhost;
    state.related = related;
    applyScopeToMode(tab, facets);
    if (leftover && !leftoverMatches(leftover, state.facets, state.tab)) {
      state.query = "";
      state.queryGhost = leftover;
      if (startNew && !hasFacets && !related) applyScopeToMode("all", state.facets);
    } else if (leftover) {
      state.query = leftover;
      state.queryGhost = "";
    } else if (startNew) {
      state.query = "";
      state.queryGhost = "";
    }
    if (startNew) {
      state.savedId = null;
      state.chatScope = "current";
    }
    var results = isUnmatchedAsk() ? [] : filterAll();
    var shownQuery = state.query || state.queryGhost;
    var top = results.slice().sort(function (a, b) { return b.completeness - a.completeness; }).slice(0, 3);
    state.suggested = top.map(function (r) { return r.id; });
    var relatedLine = related ? "\nRelated to: " + related.name : "";
    var target = startNew ? "Started a new search" : (saved ? "Applied to “" + saved.name + "”" : "Applied to this search");
    if (!results.length) {
      return {
        text: "No results match that search.",
        applied: { target: target, query: shownQuery, related: related && related.name, count: 0 },
        mentions: [],
        suggestions: ["Clear filters", "Find the laces of Pegasus 41", "Show approved Nike footwear"],
      };
    }
    return {
      text: "I mapped that onto " + (saved && !startNew ? "“" + saved.name + "”" : "Search") + ".\nQuery: " + (shownQuery || "—") + relatedLine + "\nSearch in: " + tabLabel(state.tab) + "\n" + results.length + " results.",
      applied: { target: target, query: shownQuery, related: related && related.name, count: results.length },
      mentions: state.suggested,
      suggestions: ["Find the laces of Pegasus 41", "Only Nike", "Clear filters"],
    };
  }

  function sendChat(text) {
    text = (text || "").trim();
    if (!text) return;
    state.messages.push({ role: "user", text: text });
    render();
    window.setTimeout(function () {
      var mode = state.chatScope || "current";
      if (mode === "new" && state.savedId && savedIsDirty()) {
        leaveUi.pendingChat = text;
        openLeaveModal("search");
        return;
      }
      if (mode === "new") beginNewFromAssistant();
      replyFromAssistant(text, mode);
    }, 400);
  }

  function closeCustomize(apply) {
    if (apply && customize.draft) {
      if (isNamedViews()) state.viewFields = (customize.draft.fields || []).slice();
      else state.viewConfig = cloneConfig(customize.draft);
      ensureSort();
    }
    customize.open = false;
    customize.draft = null;
    document.getElementById("customize-modal").classList.remove("is-open");
    document.getElementById("btn-view").classList.remove("pressed");
    render();
  }

  function openCustomize() {
    if (state.detailsOpen) return;
    if (facetUi.open) closeFacetPicker(false);
    customize.open = true;
    customize.type = state.tab !== "all" ? state.tab : "all";
    customize.folder = "system";
    customize.groupsOpen = false;
    customize.pane = "browse";
    customize.query = "";
    if (isNamedViews()) {
      customize.type = "all";
      customize.draft = { fields: (state.viewFields || ALL_FIELDS.all).slice() };
    } else {
      if (isTypeFilters()) {
        var selectedTypes = state.facets.type || [];
        customize.type = selectedTypes.length === 1 ? selectedTypes[0] : "all";
      }
      customize.draft = cloneConfig(state.viewConfig);
    }
    renderCustomize();
    document.getElementById("customize-modal").classList.add("is-open");
    document.getElementById("btn-customize").classList.add("pressed");
    document.getElementById("btn-view").classList.add("pressed");
  }

  function iconFolder() {
    return '<svg class="pic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h4.2l.8 1.2H14V12.5H2V5Z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  }
  function iconAttr() {
    return '<svg class="pic" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="4.8" r="1.7"/><circle cx="4.8" cy="11" r="1.7"/><circle cx="11.2" cy="11" r="1.7"/></svg>';
  }
  function iconCheck() {
    return '<svg class="pic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8.2 6.7 11.3 12.6 4.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function browseFolderName() {
    if (customize.folder === "system") return "System aspects";
    var groups = FIELD_GROUPS[customize.type] || [];
    for (var i = 0; i < groups.length; i++) if (groups[i].id === customize.folder) return groups[i].name;
    return "System aspects";
  }

  function browseFields() {
    if (customize.folder === "system") return (ALL_FIELDS[customize.type] || []).slice();
    var groups = FIELD_GROUPS[customize.type] || [];
    for (var i = 0; i < groups.length; i++) if (groups[i].id === customize.folder) return groups[i].fields.slice();
    return [];
  }

  function fieldRow(k, selected) {
    return '<button type="button" class="pick-row' + (selected ? " is-in" : "") + '" data-add="' + k + '"' + (selected ? " disabled" : "") + ">" +
      iconAttr() + "<span>" + escapeHtml(FIELD_LABELS[k] || k) + "</span>" +
      (selected ? iconCheck() : "") + "</button>";
  }

  function draftCfg() {
    if (!customize.draft) return { fields: [] };
    if (isNamedViews()) return customize.draft;
    return customize.draft[customize.type] || { fields: [] };
  }

  function selectedPanelHtml(fields, allMode) {
    var selectedRows = fields.map(function (k, i) {
      var onCard = k !== "name" && k !== "path" && k !== "identity" && k !== "type";
      return '<li class="pick-row selected-row' + (onCard ? " on-card" : "") + '" data-field="' + k + '">' +
        iconAttr() + "<span>" + escapeHtml(FIELD_LABELS[k] || k) + "</span>" +
        '<button type="button" data-move="up" ' + (i === 0 ? "disabled" : "") + " aria-label=\"Move up\">↑</button>" +
        '<button type="button" data-move="down" ' + (i === fields.length - 1 ? "disabled" : "") + " aria-label=\"Move down\">↓</button>" +
        '<button type="button" data-remove="' + k + '" aria-label="Remove">✕</button></li>';
    }).join("");
    var warn = allMode
      ? "These columns appear in the All table. Matching attributes also appear on cards for each type (up to " + CARD_MAX_ATTRS + ")."
      : "Name is the card title. The first " + CARD_MAX_ATTRS + " other selected fields appear on search cards. Extra fields still appear in the table.";
    if (isNamedViews()) {
      warn = "Name is the card title. Other selected fields appear as table columns and, when they apply to a type, on cards.";
    }
    return '<aside class="picker-selected">' +
      "<header><h3>Selected items</h3></header>" +
      '<p class="picker-warn"><span>⚠</span> ' + warn + "</p>" +
      '<p class="picker-caption">All selected items</p>' +
      '<ul class="pick-list selected-list">' + (selectedRows || '<li class="empty">No attributes selected.</li>') + "</ul>" +
      '<footer class="pick-count">' + fields.length + " items</footer>" +
      "</aside>";
  }

  function searchMatches() {
    var q = (customize.query || "").trim().toLowerCase();
    if (q.length < 3) return null;
    return (ALL_FIELDS[customize.type] || []).filter(function (k) {
      var label = (FIELD_LABELS[k] || k).toLowerCase();
      return label.indexOf(q) !== -1 || k.toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) {
      return (FIELD_LABELS[a] || a).localeCompare(FIELD_LABELS[b] || b);
    });
  }

  function searchHitsHtml(fields) {
    var matches = searchMatches();
    if (!matches) {
      return '<div class="search-empty"><span class="info-dot">i</span><p>Type at least 3 characters in order<br>to search</p></div>';
    }
    if (!matches.length) {
      return '<p class="empty">No attributes match this search.</p>';
    }
    return matches.map(function (k) { return fieldRow(k, fields.indexOf(k) !== -1); }).join("");
  }

  var CUSTOMIZE_TYPES = ["all", "product", "asset", "classification", "entity"];

  function setCustomizeType(type) {
    customize.type = type;
    customize.folder = "system";
    customize.groupsOpen = false;
    renderCustomize();
    if (customize.pane === "search") {
      var input = document.getElementById("picker-search");
      if (input) input.focus();
    }
  }

  function typeButtonsHtml() {
    return CUSTOMIZE_TYPES.map(function (t) {
      return '<button type="button" class="' + (customize.type === t ? "on" : "") + '" data-ctype="' + t + '">' + TYPE_LABELS[t] + "</button>";
    }).join("");
  }

  function renderCustomize() {
    var title = document.getElementById("customize-title");
    if (isNamedViews()) {
      title.textContent = "Add columns to this view";
    } else {
      title.innerHTML = 'Add columns to Search for <span id="customize-type-label">' + TYPE_LABELS[customize.type].toUpperCase() + "</span>";
    }
    Array.prototype.forEach.call(document.querySelectorAll("#picker-tabs [data-pane]"), function (btn) {
      btn.classList.toggle("on", btn.getAttribute("data-pane") === customize.pane);
    });
    var allMode = customize.type === "all" && !isNamedViews();
    var fields = draftCfg().fields;
    var selected = selectedPanelHtml(fields, allMode);
    var main;
    if (customize.pane === "search") {
      var matches = searchMatches();
      var count = matches ? matches.length : 0;
      main = '<section class="picker-search">' +
        '<p class="search-heading">Search and select items</p>' +
        '<p class="picker-caption">All items</p>' +
        '<div class="pick-list search-box">' +
          '<label class="picker-search-field"><input id="picker-search" placeholder="Search" value="' + escapeHtml(customize.query) + '" /><svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></label>' +
          '<div id="search-hits">' + searchHitsHtml(fields) + "</div>" +
        "</div>" +
        '<footer class="pick-count" id="search-count">' + count + " items</footer>" +
      "</section>";
    } else {
      var folderName = browseFolderName();
      var available = browseFields().sort(function (a, b) {
        return (FIELD_LABELS[a] || a).localeCompare(FIELD_LABELS[b] || b);
      });
      var groups = FIELD_GROUPS[customize.type] || [];
      var tree = '<button type="button" class="tree-item' + (customize.folder === "system" ? " on" : "") + '" data-folder="system">' + iconFolder() + " System aspects</button>";
      tree += '<button type="button" class="tree-item tree-toggle" data-toggle-groups><span class="chevron">' + (customize.groupsOpen ? "▾" : "▸") + "</span>" + iconFolder() + " Attribute Groups</button>";
      if (customize.groupsOpen) {
        groups.forEach(function (g) {
          tree += '<button type="button" class="tree-item nested' + (customize.folder === g.id ? " on" : "") + '" data-folder="' + g.id + '">' + iconFolder() + " " + escapeHtml(g.name) + "</button>";
        });
      }
      var browseRows = available.map(function (k) {
        return fieldRow(k, fields.indexOf(k) !== -1);
      }).join("");
      main = '<nav class="picker-tree">' + tree + "</nav>" +
        '<section class="picker-browse">' +
          '<div class="picker-current"><span>Current item</span><div class="current-item">' + iconFolder() + "<strong>" + escapeHtml(folderName) + "</strong></div></div>" +
          '<p class="picker-caption">All items in ' + escapeHtml(folderName) + "</p>" +
          '<div class="pick-list">' + (browseRows || '<p class="empty">No attributes in this folder.</p>') + "</div>" +
          '<footer class="pick-count">' + available.length + " items</footer>" +
        "</section>";
    }
    var rail = isNamedViews() ? "" : '<nav class="type-switcher-rail" aria-label="Object type"><span>Object type</span>' + typeButtonsHtml() + "</nav>";
    var unified = isNamedViews() ? " is-unified" : "";
    document.getElementById("customize-body").innerHTML =
      '<div class="picker-layout is-column' + unified + (customize.pane === "search" ? " is-search" : "") + '">' + rail + main + selected + "</div>";
  }

  function redrawCustomize() {
    var input = document.getElementById("picker-search");
    var caret = input && document.activeElement === input ? input.selectionStart : null;
    renderCustomize();
    if (customize.pane !== "search") return;
    input = document.getElementById("picker-search");
    if (!input) return;
    input.focus();
    if (caret != null) input.setSelectionRange(caret, caret);
  }

  function facetRow(def, selected) {
    return '<button type="button" class="pick-row' + (selected ? " is-in" : "") + '" data-fadd="' + def.key + '"' + (selected ? " disabled" : "") + ">" +
      '<span class="pick-copy"><strong>' + escapeHtml(def.label) + "</strong><em>" + escapeHtml(facetScope(def)) + "</em></span>" +
      (selected ? iconCheck() : "") + "</button>";
  }

  function facetBucket(def) {
    if (!def.types.length || def.types.length > 1) return "shared";
    return def.types[0];
  }

  function availableFacetList(fields) {
    var q = (facetUi.query || "").trim().toLowerCase();
    var defs = FACET_DEFS.filter(function (def) {
      if (!q) return true;
      return def.label.toLowerCase().indexOf(q) !== -1 || def.key.toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });
    if (!defs.length) return '<p class="empty">No filters match.</p>';
    var buckets = [
      { id: "shared", label: "All types" },
      { id: "product", label: "Products" },
      { id: "asset", label: "Assets" },
      { id: "classification", label: "Classifications" },
      { id: "entity", label: "Entities" },
    ];
    var html = "";
    buckets.forEach(function (bucket) {
      var items = defs.filter(function (def) { return facetBucket(def) === bucket.id; });
      if (!items.length) return;
      html += '<p class="facet-pick-group">' + bucket.label + "</p>";
      html += items.map(function (def) { return facetRow(def, fields.indexOf(def.key) !== -1); }).join("");
    });
    return html;
  }

  function renderFacetPicker() {
    var fields = facetUi.draft || [];
    var selectedRows = fields.map(function (key, i) {
      var def = facetDef(key);
      return '<li class="pick-row selected-row" data-ffield="' + key + '">' +
        '<span class="pick-copy"><strong>' + escapeHtml(def.label) + "</strong><em>" + escapeHtml(facetScope(def)) + "</em></span>" +
        '<button type="button" data-fmove="up" ' + (i === 0 ? "disabled" : "") + ' aria-label="Move up">↑</button>' +
        '<button type="button" data-fmove="down" ' + (i === fields.length - 1 ? "disabled" : "") + ' aria-label="Move down">↓</button>' +
        '<button type="button" data-fremove="' + key + '" aria-label="Remove">✕</button></li>';
    }).join("");
    var q = (facetUi.query || "").trim().toLowerCase();
    var availableCount = FACET_DEFS.filter(function (def) {
      if (!q) return true;
      return def.label.toLowerCase().indexOf(q) !== -1 || def.key.toLowerCase().indexOf(q) !== -1;
    }).length;
    var main = '<section class="facet-available">' +
      "<header><h3>Available filters</h3></header>" +
      '<label class="picker-search-field facet-pick-search"><input id="facet-search" placeholder="Find a filter" value="' + escapeHtml(facetUi.query) + '" /><svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></label>' +
      '<div class="pick-list" id="facet-hits">' + availableFacetList(fields) + "</div>" +
      '<footer class="pick-count">' + availableCount + " items</footer></section>";
    var selected = '<aside class="picker-selected">' +
      "<header><h3>Selected filters</h3></header>" +
      '<p class="picker-caption">A filter only appears on a type when that attribute exists there.</p>' +
      '<ul class="pick-list selected-list">' + (selectedRows || '<li class="empty">No filters selected.</li>') + "</ul>" +
      '<footer class="pick-count">' + fields.length + " selected</footer></aside>";
    document.getElementById("facet-body").innerHTML =
      '<div class="picker-layout is-facets">' + main + selected + "</div>";
  }

  function redrawFacetPicker() {
    var input = document.getElementById("facet-search");
    var caret = input && document.activeElement === input ? input.selectionStart : null;
    renderFacetPicker();
    input = document.getElementById("facet-search");
    if (!input) return;
    if (caret != null) {
      input.focus();
      input.setSelectionRange(caret, caret);
    }
  }

  function openFacetPicker() {
    if (customize.open) closeCustomize(false);
    facetUi.open = true;
    facetUi.draft = state.facetConfig.slice();
    facetUi.query = "";
    renderFacetPicker();
    document.getElementById("facet-modal").classList.add("is-open");
    render();
    var input = document.getElementById("facet-search");
    if (input) input.focus();
  }

  function closeFacetPicker(apply) {
    if (apply && facetUi.draft) {
      state.facetConfig = facetUi.draft.slice();
      Object.keys(state.facets).forEach(function (key) {
        if (state.facetConfig.indexOf(key) === -1) delete state.facets[key];
      });
    }
    facetUi.open = false;
    facetUi.draft = null;
    document.getElementById("facet-modal").classList.remove("is-open");
    render();
  }

  document.getElementById("btn-details").addEventListener("click", function () {
    state.detailsOpen = !state.detailsOpen;
    render();
  });
  document.getElementById("btn-view-cards").addEventListener("click", function () {
    if (state.detailsOpen) return;
    state.viewMode = "cards";
    render();
  });
  document.getElementById("btn-view-gallery").addEventListener("click", function () {
    if (state.detailsOpen) return;
    state.viewMode = "gallery";
    render();
  });
  document.getElementById("btn-view-table").addEventListener("click", function () {
    if (state.detailsOpen) return;
    state.viewMode = "table";
    render();
  });
  document.getElementById("btn-customize").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (state.detailsOpen) return;
    if (customize.open) closeCustomize(false);
    else openCustomize();
  });
  document.getElementById("btn-customize-close").addEventListener("click", function () { closeCustomize(false); });
  document.getElementById("btn-customize-cancel").addEventListener("click", function () { closeCustomize(false); });
  document.getElementById("btn-customize-apply").addEventListener("click", function () { closeCustomize(true); });
  document.getElementById("btn-customize-reset").addEventListener("click", function () {
    if (isNamedViews()) {
      var v = loadedNamedView();
      customize.draft = { fields: (v ? v.fields : ALL_FIELDS.all).slice() };
    } else {
      customize.draft = cloneConfig(DEFAULT_VIEW_CONFIG);
    }
    renderCustomize();
  });
  document.getElementById("btn-facet-close").addEventListener("click", function () { closeFacetPicker(false); });
  document.getElementById("btn-facet-cancel").addEventListener("click", function () { closeFacetPicker(false); });
  document.getElementById("btn-facet-apply").addEventListener("click", function () { closeFacetPicker(true); });
  document.getElementById("btn-facet-reset").addEventListener("click", function () {
    facetUi.draft = defaultFacetConfig();
    redrawFacetPicker();
  });
  document.getElementById("facet-modal").addEventListener("click", function (e) {
    if (e.target.id === "facet-modal") closeFacetPicker(false);
  });
  document.getElementById("facet-body").addEventListener("input", function (e) {
    if (e.target.id !== "facet-search") return;
    facetUi.query = e.target.value;
    redrawFacetPicker();
  });
  document.getElementById("facet-body").addEventListener("click", function (e) {
    var fields = facetUi.draft;
    if (!fields) return;
    var addBtn = e.target.closest("[data-fadd]");
    if (addBtn) {
      var add = addBtn.getAttribute("data-fadd");
      if (add && fields.indexOf(add) === -1) fields.push(add);
      redrawFacetPicker();
      return;
    }
    var removeBtn = e.target.closest("[data-fremove]");
    if (removeBtn) {
      var remove = removeBtn.getAttribute("data-fremove");
      facetUi.draft = fields.filter(function (k) { return k !== remove; });
      redrawFacetPicker();
      return;
    }
    var moveBtn = e.target.closest("[data-fmove]");
    if (moveBtn) {
      var li = moveBtn.closest("[data-ffield]");
      if (!li) return;
      var key = li.getAttribute("data-ffield");
      var i = fields.indexOf(key);
      if (i === -1) return;
      var j = moveBtn.getAttribute("data-fmove") === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= fields.length) return;
      fields[i] = fields[j];
      fields[j] = key;
      redrawFacetPicker();
    }
  });
  document.getElementById("customize-modal").addEventListener("click", function (e) {
    if (e.target.id === "customize-modal") closeCustomize(false);
    var typeBtn = e.target.closest("[data-ctype]");
    if (typeBtn) {
      setCustomizeType(typeBtn.getAttribute("data-ctype"));
    }
  });
  document.getElementById("picker-tabs").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-pane]");
    if (!btn) return;
    customize.pane = btn.getAttribute("data-pane");
    renderCustomize();
    if (customize.pane === "search") {
      var input = document.getElementById("picker-search");
      if (input) input.focus();
    }
  });
  document.getElementById("customize-body").addEventListener("input", function (e) {
    if (e.target.id !== "picker-search") return;
    customize.query = e.target.value;
    var fields = draftCfg().fields;
    var matches = searchMatches();
    document.getElementById("search-hits").innerHTML = searchHitsHtml(fields);
    document.getElementById("search-count").textContent = (matches ? matches.length : 0) + " items";
  });
  document.getElementById("customize-body").addEventListener("click", function (e) {
    var cfg = draftCfg();
    var toggle = e.target.closest("[data-toggle-groups]");
    if (toggle) {
      customize.groupsOpen = !customize.groupsOpen;
      redrawCustomize();
      return;
    }
    var folderBtn = e.target.closest("[data-folder]");
    if (folderBtn) {
      customize.folder = folderBtn.getAttribute("data-folder");
      if (customize.folder !== "system") customize.groupsOpen = true;
      redrawCustomize();
      return;
    }
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      var add = addBtn.getAttribute("data-add");
      if (add && cfg.fields.indexOf(add) === -1) cfg.fields.push(add);
      redrawCustomize();
      return;
    }
    var removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) {
      var remove = removeBtn.getAttribute("data-remove");
      cfg.fields = cfg.fields.filter(function (k) { return k !== remove; });
      redrawCustomize();
      return;
    }
    var moveBtn = e.target.closest("[data-move]");
    if (moveBtn) {
      var li = moveBtn.closest("[data-field]");
      if (!li) return;
      var key = li.getAttribute("data-field");
      var i = cfg.fields.indexOf(key);
      if (i === -1) return;
      var j = moveBtn.getAttribute("data-move") === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= cfg.fields.length) return;
      cfg.fields[i] = cfg.fields[j];
      cfg.fields[j] = key;
      redrawCustomize();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (leaveUi.open) {
      closeLeaveModal();
      return;
    }
    if (tabUi.renameId) {
      tabUi.renameId = null;
      render();
      return;
    }
    if (tabUi.menu) {
      closeTabMenu();
      return;
    }
    if (tabUi.infoId) {
      closeTabInfo();
      return;
    }
    if (suggestUi.open) {
      closeSearchSuggest();
      return;
    }
    if (sortUi.open) {
      closeSortPopover(false);
      return;
    }
    if (savedUi.open) {
      if (savedUi.pane === "form" && loadedSavedSearch() && savedUi.anchor === "toolbar") {
        savedUi.pane = "menu";
        renderSavedPopover();
        return;
      }
      closeSavedPopover();
      return;
    }
    if (viewUi.open) {
      if (viewUi.pane === "form") {
        viewUi.pane = "menu";
        renderViewPopover();
        return;
      }
      closeViewPopover();
      return;
    }
    if (facetUi.open) {
      closeFacetPicker(false);
      return;
    }
    if (customize.open) closeCustomize(false);
  });
  document.getElementById("btn-assistant").addEventListener("click", function () {
    state.chatOpen = !state.chatOpen;
    render();
  });
  document.getElementById("btn-chat-close").addEventListener("click", function () {
    state.chatOpen = false;
    render();
  });
  document.getElementById("search-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      submitSearchInput();
    }
  });
  document.getElementById("search-input").addEventListener("focus", function () {
    openSearchSuggest();
  });
  document.getElementById("search-input").addEventListener("input", function () {
    document.getElementById("search-field").classList.remove("is-unmatched");
    if (!suggestUi.open) openSearchSuggest();
  });
  document.getElementById("search-suggest").addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
  document.getElementById("search-suggest").addEventListener("click", function (e) {
    e.stopPropagation();
    var recent = e.target.closest("[data-recent-i]");
    if (recent) {
      startNewSearch(recentSearches[Number(recent.getAttribute("data-recent-i"))] || "");
      return;
    }
    var saved = e.target.closest("[data-saved]");
    if (saved) {
      closeSearchSuggest();
      requestSession(saved.getAttribute("data-saved"));
    }
  });
  document.getElementById("btn-search-clear").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    startNewSearch("");
  });
  document.getElementById("search-clauses").addEventListener("click", function (e) {
    var related = e.target.closest("[data-clear-related]");
    if (!related) return;
    e.preventDefault();
    e.stopPropagation();
    state.related = null;
    render();
  });
  document.getElementById("lab-saved-menu").addEventListener("click", function () {
    setSavedLayout("menu");
  });
  document.getElementById("lab-saved-tabs").addEventListener("click", function () {
    setSavedLayout("tabs");
  });
  document.getElementById("lab-start-empty").addEventListener("click", function () {
    if (state.startMode === "empty") return;
    state.startMode = "empty";
    render();
  });
  document.getElementById("lab-start-all").addEventListener("click", function () {
    if (state.startMode === "all") return;
    state.startMode = "all";
    render();
  });
  document.getElementById("lab-custom-session").addEventListener("click", function () {
    setCustomizeMode("session");
  });
  document.getElementById("lab-custom-views").addEventListener("click", function () {
    setCustomizeMode("views");
  });
  document.getElementById("lab-type-tabs").addEventListener("click", function () {
    setTypePlacement("tabs");
  });
  document.getElementById("lab-type-filters").addEventListener("click", function () {
    setTypePlacement("filters");
  });
  document.getElementById("session-tabs").addEventListener("click", function (e) {
    if (e.target.closest("[data-tab-rename]")) return;
    var info = e.target.closest("[data-tab-info]");
    if (info) {
      e.stopPropagation();
      closeTabMenu();
      var id = info.getAttribute("data-tab-info");
      tabUi.infoId = tabUi.infoId === id ? null : id;
      renderTabInfo();
      return;
    }
    var caret = e.target.closest("[data-tab-menu]");
    if (caret) {
      e.stopPropagation();
      closeTabInfo();
      tabUi.menu = !tabUi.menu;
      renderTabMenu();
      return;
    }
    var btn = e.target.closest("[data-session]");
    if (!btn) return;
    requestSession(btn.getAttribute("data-session"));
  });
  document.getElementById("session-tabs").addEventListener("input", function (e) {
    if (!e.target.matches("[data-tab-rename]")) return;
    tabUi.renameValue = e.target.value;
  });
  document.getElementById("session-tabs").addEventListener("keydown", function (e) {
    if (!e.target.matches("[data-tab-rename]")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      renameSavedSearch(tabUi.renameId, e.target.value);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      tabUi.renameId = null;
      renderSessionTabs();
    }
  });
  document.getElementById("session-tabs").addEventListener("focusout", function (e) {
    if (!tabUi.renameId) return;
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    renameSavedSearch(tabUi.renameId, tabUi.renameValue);
  });
  document.getElementById("tab-menu").addEventListener("click", function (e) {
    e.stopPropagation();
    var act = e.target.closest("[data-tab-act]");
    if (!act || act.disabled) return;
    var action = act.getAttribute("data-tab-act");
    if (action === "save") {
      if (!savedIsDirty()) return;
      closeTabMenu();
      updateLoadedSearch();
    } else if (action === "save-as") openSaveAsForm("title");
    else if (action === "rename") startRename();
    else if (action === "duplicate") duplicateSession();
    else if (action === "reset") resetSession();
    else if (action === "delete") {
      var id = state.savedId;
      closeTabMenu();
      if (id) deleteSavedSearch(id);
    }
  });
  document.getElementById("type-tabs").addEventListener("click", function (e) {
    if (isTypeFilters()) return;
    var btn = e.target.closest("[data-tab]");
    if (!btn) return;
    state.tab = btn.getAttribute("data-tab");
    render();
  });
  document.getElementById("facets").addEventListener("click", function (e) {
    if (e.target.closest("#btn-facets-config")) {
      if (facetUi.open) closeFacetPicker(false);
      else openFacetPicker();
      return;
    }
    if (e.target.id === "clear-all") {
      state.facets = {};
      render();
      return;
    }
    var chip = e.target.closest(".chip");
    if (chip) {
      toggleFacet(chip.getAttribute("data-facet"), chip.getAttribute("data-value"));
    }
  });
  document.getElementById("facets").addEventListener("change", function (e) {
    if (e.target.matches("input[type=checkbox][data-facet]")) {
      toggleFacet(e.target.getAttribute("data-facet"), e.target.getAttribute("data-value"));
    }
  });
  document.getElementById("btn-sort").addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.currentTarget.disabled) return;
    if (sortUi.open) closeSortPopover(false);
    else openSortPopover();
  });
  document.getElementById("btn-saved-open").addEventListener("click", function (e) {
    e.stopPropagation();
    if (suggestUi.open) closeSearchSuggest();
    else {
      document.getElementById("search-input").focus();
      openSearchSuggest();
    }
  });
  document.getElementById("btn-saved").addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.currentTarget.disabled) return;
    if (savedUi.open && savedUi.anchor === "toolbar") closeSavedPopover();
    else openSavedPopover("toolbar");
  });
  document.getElementById("btn-saved-close").addEventListener("click", function () { closeSavedPopover(); });
  document.getElementById("btn-saved-update").addEventListener("click", function () {
    if (!savedIsDirty()) return;
    updateLoadedSearch();
    closeSavedPopover();
  });
  document.getElementById("btn-saved-as").addEventListener("click", function (e) {
    e.stopPropagation();
    var loaded = loadedSavedSearch();
    savedUi.pane = "form";
    savedUi.name = loaded ? uniqueSavedName(loaded.name) : "";
    renderSavedPopover();
    document.getElementById("saved-name").focus();
    document.getElementById("saved-name").select();
  });
  document.getElementById("btn-saved-cancel").addEventListener("click", function () {
    if (loadedSavedSearch() && savedUi.pane === "form" && savedUi.anchor === "toolbar") {
      savedUi.pane = "menu";
      renderSavedPopover();
      return;
    }
    closeSavedPopover();
  });
  document.getElementById("btn-saved-save").addEventListener("click", function () { saveCurrentSearch(); });
  document.getElementById("saved-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveCurrentSearch();
    }
  });
  document.getElementById("saved-name").addEventListener("input", function (e) {
    savedUi.name = e.target.value;
  });
  document.getElementById("saved-popover").addEventListener("click", function (e) {
    e.stopPropagation();
    var del = e.target.closest("[data-saved-del]");
    if (del) {
      deleteSavedSearch(del.getAttribute("data-saved-del"));
      return;
    }
    var item = e.target.closest("[data-saved]");
    if (item) {
      var id = item.getAttribute("data-saved");
      if (id === (state.savedId || "search")) closeSavedPopover();
      else requestSession(id);
    }
  });
  document.getElementById("btn-leave-discard").addEventListener("click", function () { finishLeave(false); });
  document.getElementById("btn-leave-save").addEventListener("click", function () { finishLeave(true); });
  document.getElementById("leave-modal").addEventListener("click", function (e) {
    if (e.target.id === "leave-modal") closeLeaveModal();
  });
  document.getElementById("btn-sort-close").addEventListener("click", function () { closeSortPopover(false); });
  document.getElementById("btn-sort-cancel").addEventListener("click", function () { closeSortPopover(false); });
  document.getElementById("btn-sort-apply").addEventListener("click", function () { closeSortPopover(true); });
  document.getElementById("sort-popover").addEventListener("click", function (e) { e.stopPropagation(); });
  document.getElementById("sort-key").addEventListener("change", function (e) {
    if (!sortUi.draft) return;
    sortUi.draft.key = e.target.value;
    if (!sortUi.draft.key || sortUi.draft.key2 === sortUi.draft.key) sortUi.draft.key2 = "";
    renderSortPopover();
  });
  document.getElementById("sort-key-2").addEventListener("change", function (e) {
    if (!sortUi.draft) return;
    sortUi.draft.key2 = e.target.value;
  });
  document.querySelector(".sort-az").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-dir]");
    if (!btn || !sortUi.draft) return;
    sortUi.draft.dir = btn.getAttribute("data-dir");
    renderSortPopover();
  });
  document.addEventListener("click", function (e) {
    if (sortUi.open && !e.target.closest("#sort-popover") && !e.target.closest("#btn-sort")) closeSortPopover(false);
    if (savedUi.open && !e.target.closest("#saved-popover") && !e.target.closest("#btn-saved")) closeSavedPopover();
    if (suggestUi.open && !e.target.closest("#search-suggest") && !e.target.closest("#search-field")) closeSearchSuggest();
    if (tabUi.menu && !e.target.closest("#tab-menu") && !e.target.closest("[data-tab-menu]") && !e.target.closest("#btn-results-saved")) closeTabMenu();
    if (tabUi.infoId && !e.target.closest("#tab-info") && !e.target.closest("[data-tab-info]")) closeTabInfo();
    if (viewUi.open && !e.target.closest("#view-popover") && !e.target.closest("#btn-view")) closeViewPopover();
  });
  document.getElementById("view-popover").addEventListener("click", function (e) {
    e.stopPropagation();
    var item = e.target.closest("[data-view]");
    if (item) applyNamedView(item.getAttribute("data-view"));
  });
  document.getElementById("btn-view").addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.currentTarget.hidden || state.detailsOpen) return;
    if (customize.open) {
      closeCustomize(false);
      return;
    }
    if (viewUi.open) closeViewPopover();
    else openViewPopover();
  });
  document.getElementById("btn-view-save").addEventListener("click", function () {
    if (!namedViewDirty()) return;
    saveCurrentNamedView();
  });
  document.getElementById("btn-view-as").addEventListener("click", function (e) {
    e.stopPropagation();
    var v = loadedNamedView();
    viewUi.pane = "form";
    viewUi.name = v ? uniqueViewName(v.name) : "";
    renderViewPopover();
    document.getElementById("view-name").focus();
    document.getElementById("view-name").select();
  });
  document.getElementById("btn-view-edit").addEventListener("click", function () {
    viewUi.open = false;
    document.getElementById("view-popover").classList.remove("is-open");
    openCustomize();
  });
  document.getElementById("btn-view-cancel").addEventListener("click", function () {
    viewUi.pane = "menu";
    renderViewPopover();
  });
  document.getElementById("btn-view-create").addEventListener("click", function () { saveNamedViewAs(); });
  document.getElementById("view-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveNamedViewAs();
    }
  });
  document.getElementById("view-name").addEventListener("input", function (e) {
    viewUi.name = e.target.value;
  });
  document.getElementById("tab-info").addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.getElementById("results").addEventListener("click", function (e) {
    if (e.target.closest("[data-results-rename]")) return;
    if (e.target.closest("#btn-results-saved")) {
      e.stopPropagation();
      closeSearchSuggest();
      if (savedUi.open) closeSavedPopover();
      tabUi.menu = !tabUi.menu;
      renderTabMenu();
      var resultsBtn = document.getElementById("btn-results-saved");
      if (resultsBtn) resultsBtn.setAttribute("aria-expanded", String(tabUi.menu));
      return;
    }
    if (e.target.closest("input[type=checkbox]") || e.target.closest(".card-check") || e.target.closest(".gallery-check") || e.target.closest(".select-all")) return;
    var sort = e.target.closest("[data-sort]");
    if (sort) {
      toggleSort(sort.getAttribute("data-sort"));
      render();
      return;
    }
    var row = e.target.closest("[data-id]");
    if (!row) return;
    state.activeId = row.getAttribute("data-id");
    render();
  });
  document.getElementById("results").addEventListener("input", function (e) {
    if (!e.target.matches("[data-results-rename]")) return;
    tabUi.renameValue = e.target.value;
  });
  document.getElementById("results").addEventListener("keydown", function (e) {
    if (!e.target.matches("[data-results-rename]")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      renameSavedSearch(tabUi.renameId, e.target.value);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      tabUi.renameId = null;
      render();
    }
  });
  document.getElementById("results").addEventListener("focusout", function (e) {
    if (!tabUi.renameId || !e.target.matches("[data-results-rename]")) return;
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    renameSavedSearch(tabUi.renameId, tabUi.renameValue);
  });
  document.getElementById("results").addEventListener("change", function (e) {
    var results = sortResults(filterAll());
    if (e.target.matches("[data-select-all]")) {
      results.forEach(function (item) {
        if (e.target.checked) state.checked[item.id] = true;
        else delete state.checked[item.id];
      });
      render();
      return;
    }
    if (e.target.matches("[data-check]")) {
      var id = e.target.getAttribute("data-check");
      if (e.target.checked) state.checked[id] = true;
      else delete state.checked[id];
      render();
    }
  });
  document.getElementById("chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("chat-input");
    sendChat(input.value);
    input.value = "";
  });
  document.getElementById("chat-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat(e.target.value);
      e.target.value = "";
    }
  });
  document.getElementById("chat").addEventListener("click", function (e) {
    var scope = e.target.closest("[data-chat-scope]");
    if (scope) {
      state.chatScope = scope.getAttribute("data-chat-scope") === "new" ? "new" : "current";
      render();
      return;
    }
    var s = e.target.closest("[data-suggest]");
    if (s) sendChat(s.getAttribute("data-suggest"));
    var m = e.target.closest("[data-mention]");
    if (m) {
      state.activeId = m.getAttribute("data-mention");
      render();
    }
  });

  document.querySelectorAll(".resize-handle").forEach(function (handle) {
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      var panel = handle.getAttribute("data-panel");
      var invert = handle.getAttribute("data-invert") === "true";
      var startX = e.clientX;
      var startW = state.widths[panel];
      handle.setPointerCapture(e.pointerId);
      document.body.classList.add("is-resizing");
      function move(ev) {
        var dx = ev.clientX - startX;
        var next = startW + (invert ? -dx : dx);
        state.widths[panel] = Math.round(Math.min(MAX, Math.max(MIN, next)));
        var ws = document.getElementById("workspace");
        var shell = document.getElementById("shell");
        ws.style.setProperty("--filters-width", state.widths.filters + "px");
        ws.style.setProperty("--list-width", state.widths.list + "px");
        shell.style.setProperty("--chat-width", state.widths.chat + "px");
      }
      function up() {
        document.body.classList.remove("is-resizing");
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
      }
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
    });
    handle.addEventListener("dblclick", function () {
      state.widths[handle.getAttribute("data-panel")] = PANEL;
      render();
    });
  });

  render();
})();
