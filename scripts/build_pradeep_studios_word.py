import json
import os
import shutil
import html
import urllib.parse
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT_DIR, 'studios', 'learn', 'studios-learning.json')
TOOLS_DIR = os.path.join(ROOT_DIR, 'tools')
PRADEEP_DIR = os.path.join(ROOT_DIR, 'pradeep')
ALL_STUDIOS_DIR = os.path.join(PRADEEP_DIR, 'all_studios')

os.makedirs(PRADEEP_DIR, exist_ok=True)
os.makedirs(ALL_STUDIOS_DIR, exist_ok=True)

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    studios = json.load(f)

print(f"Loaded {len(studios)} studios for pradeep/ Word documents compilation.")

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''<w:tcMar {nsdecls("w")}>
        <w:top w:w="{top}" w:type="dxa"/>
        <w:bottom w:w="{bottom}" w:type="dxa"/>
        <w:left w:w="{left}" w:type="dxa"/>
        <w:right w:w="{right}" w:type="dxa"/>
    </w:tcMar>''')
    tcPr.append(tcMar)

def synthesize_snippet(studio):
    tag = studio.get('tag', 'config.yaml')
    title = studio.get('title', 'Studio')
    repo = studio.get('repository', 'Pradeeptalari14/portfolio')
    domain = studio.get('domain', 'Infrastructure')
    metric = studio.get('sreMetric', 'SLO Target')

    if tag.endswith('.py'):
        return f'''# {tag} - {title}
# Domain: {domain} | Target: {metric}
import os, sys, logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SERVICE_NAME = "{title.lower().replace(' ', '-')}"
SLO_TARGET = "{metric}"

def bootstrap_service():
    logging.info("Initializing %s in production mode...", SERVICE_NAME)
    # Enforce zero-drift state verification before processing requests
    return {{"status": "healthy", "service": SERVICE_NAME, "metric": SLO_TARGET}}

if __name__ == "__main__":
    print(bootstrap_service())
'''
    elif tag.endswith('.yaml') or tag.endswith('.yml'):
        return f'''# {tag} - {title}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {title.lower().replace(' ', '-').replace(':', '')}
  namespace: production
  labels:
    app.kubernetes.io/name: {title.lower().replace(' ', '-').replace(':', '')}
    sre.slo/compliance: "{metric}"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {title.lower().replace(' ', '-').replace(':', '')}
  template:
    metadata:
      labels:
        app: {title.lower().replace(' ', '-').replace(':', '')}
    spec:
      containers:
        - name: app
          image: ghcr.io/{repo.lower()}:v1.0.0
          resources:
            requests: {{ cpu: "500m", memory: "1Gi" }}
            limits: {{ cpu: "2000m", memory: "4Gi" }}
'''
    elif tag.endswith('.sh') or tag.endswith('.bash'):
        return f'''#!/usr/bin/env bash
# {tag} - {title} Automation
set -euo pipefail
echo "==> Running {title} production drill..."
echo "==> Target SLO: {metric}"
docker compose up -d --wait || {{ echo "Deployment failed"; exit 1; }}
echo "==> Verifying telemetry health..."
curl -sSf http://localhost:8080/healthz && echo "OK"
'''
    else:
        return f'''# {tag} - {title}
[service]
name = "{title.lower().replace(' ', '-')}"
domain = "{domain}"
slo_compliance = "{metric}"
telemetry_enabled = true
'''

# 1. GENERATE THE MASTER 308-STUDIO WORD COMPENDIUM
def build_master_word_document():
    doc = docx.Document()

    # Set 0.75 in margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.8)
        sec.right_margin = Inches(0.8)

    # Document Header / Title
    p_pre = doc.add_paragraph()
    r_pre = p_pre.add_run("TALARI PRADEEP · CLOUD INFRASTRUCTURE, SRE & AI PLATFORM")
    r_pre.font.name = 'Calibri'
    r_pre.font.size = Pt(10)
    r_pre.font.bold = True
    r_pre.font.color.rgb = RGBColor(14, 116, 144)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("308+ Engineering Studios: Complete Learning Guide & Real-Time Incident Drills")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Enterprise Production Use Cases, Concrete Examples, Understand Best How to Treat & Real-Time 'Do to Learn' Hands-On Drills")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph()

    # Summary Stats Table
    cat_counts = {}
    for s in studios:
        cat_counts[s['category']] = cat_counts.get(s['category'], 0) + 1

    stats_table = doc.add_table(rows=6, cols=2)
    stats_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    stats_data = [
        ("Total Production Developer Studios", f"{len(studios)} Interactive Studios"),
        ("AI & LLMOps Runtimes & Pipelines", f"{cat_counts.get('ai', 0)} Studios"),
        ("Configuration, IaC & Runbooks", f"{cat_counts.get('automation', 0)} Studios"),
        ("Observability, Telemetry & eBPF", f"{cat_counts.get('observability', 0)} Studios"),
        ("Cloud Infrastructure & Kubernetes", f"{cat_counts.get('cloud', 0)} Studios"),
        ("CI/CD Delivery & GitOps Workflows", f"{cat_counts.get('cicd', 0)} Studios")
    ]

    for idx, (k, v) in enumerate(stats_data):
        row = stats_table.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(3.2)
        c1.width = Inches(3.6)
        set_cell_background(c0, "F1F5F9" if idx % 2 == 0 else "FFFFFF")
        set_cell_background(c1, "F8FAFC" if idx % 2 == 0 else "FFFFFF")
        set_cell_margins(c0, 60, 60, 100, 100)
        set_cell_margins(c1, 60, 60, 100, 100)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)

    doc.add_paragraph()
    doc.add_page_break()

    # SECTION: DETAILED PER-STUDIO CURRICULUM
    h_sec = doc.add_heading("Detailed Learning Curriculum for All 308 Studios", level=1)
    h_sec.style.font.color.rgb = RGBColor(15, 23, 42)

    for i, s in enumerate(studios, 1):
        title = s.get('title', 'Studio')
        desc = s.get('desc', '')
        category = s.get('category', '').upper()
        domain = s.get('domain', '')
        skill = s.get('skillLevel', '')
        tag = s.get('tag', 'config.yaml')
        repo = s.get('repository', '')
        use_case = s.get('useCase', '')
        best_treatment = s.get('bestTreatment', '')
        anti_pattern = s.get('antiPattern', '')
        drill = s.get('realTimeDrill', '')
        metric = s.get('sreMetric', '')
        snippet = synthesize_snippet(s)

        # Studio Title Heading
        h_st = doc.add_heading(f"Studio {i}: {title}", level=2)
        h_st.style.font.color.rgb = RGBColor(14, 116, 144)

        # Metadata Table
        m_table = doc.add_table(rows=3, cols=2)
        m_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        m_rows = [
            ("Category & Level", f"{category} • {skill}"),
            ("Architecture Domain & Artifact", f"{domain} • [{tag}]"),
            ("Production Target SRE Standard", metric)
        ]
        for mi, (mk, mv) in enumerate(m_rows):
            crow = m_table.rows[mi]
            mc0, mc1 = crow.cells[0], crow.cells[1]
            mc0.width = Inches(2.4)
            mc1.width = Inches(4.4)
            set_cell_background(mc0, "F8FAFC")
            set_cell_background(mc1, "FFFFFF")
            set_cell_margins(mc0, 50, 50, 80, 80)
            set_cell_margins(mc1, 50, 50, 80, 80)
            rp0 = mc0.paragraphs[0].add_run(mk)
            rp0.font.bold = True
            rp0.font.size = Pt(8.5)
            rp0.font.color.rgb = RGBColor(71, 85, 105)
            rp1 = mc1.paragraphs[0].add_run(mv)
            rp1.font.size = Pt(8.5)
            rp1.font.color.rgb = RGBColor(15, 23, 42)

        doc.add_paragraph()

        # 1. Overview & Use Case
        p_uc = doc.add_paragraph()
        r_uc_h = p_uc.add_run("■ Real-World Enterprise Production Use Case:\n")
        r_uc_h.font.bold = True
        r_uc_h.font.size = Pt(9.5)
        r_uc_t = p_uc.add_run(use_case)
        r_uc_t.font.size = Pt(9.5)

        # 2. Implementation Snippet
        p_sn = doc.add_paragraph()
        r_sn_h = p_sn.add_run(f"■ Concrete Production Implementation ({tag}):\n")
        r_sn_h.font.bold = True
        r_sn_h.font.size = Pt(9.5)

        c_table = doc.add_table(rows=1, cols=1)
        c_cell = c_table.rows[0].cells[0]
        c_cell.width = Inches(6.8)
        set_cell_background(c_cell, "0F172A")
        set_cell_margins(c_cell, 80, 80, 100, 100)
        c_para = c_cell.paragraphs[0]
        r_code = c_para.add_run(snippet.strip())
        r_code.font.name = 'Consolas'
        r_code.font.size = Pt(8)
        r_code.font.color.rgb = RGBColor(226, 232, 240)

        doc.add_paragraph()

        # 3. Treatment Callout Table
        tr_table = doc.add_table(rows=2, cols=1)
        tr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Best treatment row
        cb = tr_table.rows[0].cells[0]
        cb.width = Inches(6.8)
        set_cell_background(cb, "ECFDF5")
        set_cell_margins(cb, 70, 70, 100, 100)
        pb = cb.paragraphs[0]
        rb_t = pb.add_run("✅ THE ARCHITECTURAL BEST TREATMENT:\n")
        rb_t.font.bold = True
        rb_t.font.size = Pt(8.5)
        rb_t.font.color.rgb = RGBColor(4, 120, 87)
        rb_b = pb.add_run(best_treatment)
        rb_b.font.size = Pt(8.5)
        rb_b.font.color.rgb = RGBColor(6, 78, 59)

        # Anti-pattern row
        ca = tr_table.rows[1].cells[0]
        ca.width = Inches(6.8)
        set_cell_background(ca, "FEF2F2")
        set_cell_margins(ca, 70, 70, 100, 100)
        pa = ca.paragraphs[0]
        ra_t = pa.add_run("❌ THE DANGEROUS ANTI-PATTERN TO AVOID:\n")
        ra_t.font.bold = True
        ra_t.font.size = Pt(8.5)
        ra_t.font.color.rgb = RGBColor(185, 28, 28)
        ra_b = pa.add_run(anti_pattern)
        ra_b.font.size = Pt(8.5)
        ra_b.font.color.rgb = RGBColor(127, 29, 29)

        doc.add_paragraph()

        # 4. Real-Time Drill
        p_dr = doc.add_paragraph()
        r_dr_h = p_dr.add_run("■ Real-Time 'Do to Learn' Practice Drill:\n")
        r_dr_h.font.bold = True
        r_dr_h.font.size = Pt(9.5)
        r_dr_b = p_dr.add_run(f"  $ {drill}\n")
        r_dr_b.font.name = 'Consolas'
        r_dr_b.font.size = Pt(8.5)
        r_dr_b.font.color.rgb = RGBColor(2, 132, 199)
        r_dr_r = p_dr.add_run(f"  GitHub Repo: https://github.com/{repo}")
        r_dr_r.font.size = Pt(8.5)
        r_dr_r.font.italic = True

        # YouTube Learning Links
        yt_q = urllib.parse.quote_plus(title + ' tutorial deep dive architecture production')
        yt_c = urllib.parse.quote_plus(title + ' KubeCon SREcon conference talk')
        p_yt = doc.add_paragraph()
        r_yt_h = p_yt.add_run("■ Video Learning & YouTube Tutorials:\n")
        r_yt_h.font.bold = True
        r_yt_h.font.size = Pt(9.5)
        r_yt_u1 = p_yt.add_run(f"  Tutorial Deep Dive: https://www.youtube.com/results?search_query={yt_q}\n")
        r_yt_u1.font.size = Pt(8.5)
        r_yt_u1.font.color.rgb = RGBColor(2, 132, 199)
        r_yt_u2 = p_yt.add_run(f"  Conference Talks: https://www.youtube.com/results?search_query={yt_c}")
        r_yt_u2.font.size = Pt(8.5)
        r_yt_u2.font.color.rgb = RGBColor(2, 132, 199)

        doc.add_paragraph("─" * 45) # Divider

        if i % 50 == 0 or i == len(studios):
            print(f"[Master Word Compendium] Compiled {i}/{len(studios)} studios...")

    master_docx_path = os.path.join(PRADEEP_DIR, '308_Studios_Complete_Learning_Guide.docx')
    master_word_path = os.path.join(PRADEEP_DIR, '308_Studios_Complete_Learning_Guide.word')

    doc.save(master_docx_path)
    shutil.copyfile(master_docx_path, master_word_path)
    print(f"[OK] Master Word Document saved: {master_docx_path} ({os.path.getsize(master_docx_path)} bytes)")

# 2. GENERATE SUMMARY CATALOG DIRECTORY TABLE WORD DOC
def build_catalog_word_document():
    doc = docx.Document()
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)

    p_title = doc.add_paragraph()
    r = p_title.add_run("Master Directory: All 308+ Engineering Studios")
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    table = doc.add_table(rows=len(studios) + 1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["#", "Studio Title", "Category", "Target Artifact", "Target SRE Standard"]

    hdr_row = table.rows[0]
    for ci, h in enumerate(headers):
        cell = hdr_row.cells[ci]
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, 80, 80, 100, 100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(248, 250, 252)

    for i, s in enumerate(studios, 1):
        row = table.rows[i]
        vals = [
            str(i),
            s.get('title', ''),
            s.get('category', '').upper(),
            s.get('tag', ''),
            s.get('sreMetric', '')
        ]
        for ci, v in enumerate(vals):
            cell = row.cells[ci]
            set_cell_background(cell, "F8FAFC" if i % 2 == 0 else "FFFFFF")
            set_cell_margins(cell, 40, 40, 60, 60)
            p = cell.paragraphs[0]
            r = p.add_run(v)
            r.font.size = Pt(8)

    cat_docx_path = os.path.join(PRADEEP_DIR, '308_Studios_Master_Catalog.docx')
    cat_word_path = os.path.join(PRADEEP_DIR, '308_Studios_Master_Catalog.word')
    doc.save(cat_docx_path)
    shutil.copyfile(cat_docx_path, cat_word_path)
    print(f"[OK] Catalog Word Document saved: {cat_docx_path}")

# 3. GENERATE COMPLETE HTML BROWSER COMPENDIUM FOR pradeep/
def build_pradeep_html():
    html_items = []
    for i, s in enumerate(studios, 1):
        title = html.escape(s.get('title', ''))
        category = html.escape(s.get('category', '').upper())
        domain = html.escape(s.get('domain', ''))
        skill = html.escape(s.get('skillLevel', ''))
        tag = html.escape(s.get('tag', ''))
        repo = html.escape(s.get('repository', ''))
        use_case = html.escape(s.get('useCase', ''))
        best_treatment = html.escape(s.get('bestTreatment', ''))
        anti_pattern = html.escape(s.get('antiPattern', ''))
        drill = html.escape(s.get('realTimeDrill', ''))
        metric = html.escape(s.get('sreMetric', ''))
        link = s.get('link', '')

        html_items.append(f'''
        <article class="studio-card" id="studio-{i}">
          <div class="card-meta">
            <span class="badge badge-num">Studio #{i}</span>
            <span class="badge badge-cat">{category}</span>
            <span class="badge badge-domain">{domain}</span>
            <span class="badge badge-skill">{skill}</span>
          </div>
          <h2 class="card-title">{title}</h2>
          <div class="card-artifact">Target Configuration Artifact: <code>{tag}</code></div>

          <div class="card-section">
            <div class="section-label">🏢 Enterprise Production Use Case:</div>
            <p class="section-text">{use_case}</p>
          </div>

          <div class="treatment-box best-treatment">
            <div class="treatment-title">✅ The Architectural Best Treatment:</div>
            <p class="treatment-text">{best_treatment}</p>
          </div>

          <div class="treatment-box anti-pattern">
            <div class="treatment-title">❌ The Dangerous Anti-Pattern to Avoid:</div>
            <p class="treatment-text">{anti_pattern}</p>
          </div>

          <div class="drill-box">
            <div class="drill-label">⚡ Real-Time "Do to Learn" Hands-On Drill:</div>
            <div class="drill-code"><code>$ {drill}</code></div>
          </div>

          <div class="card-footer">
            <span class="sre-tag">SRE Target: {metric}</span>
            <div class="card-links">
              <a href="../tools/{link}learn.html" class="link-btn">Single Studio Page →</a>
              <a href="../tools/{link}learn.docx" class="link-btn">Download Word (.docx)</a>
              <a href="../tools/{link}" class="link-btn primary">Launch Studio ⚡</a>
            </div>
          </div>
        </article>
        ''')

    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>All 308+ Engineering Studios Learning Guide &amp; Incident Drills | Talari Pradeep</title>
  <meta name="description" content="Unified production learning guide and real-time incident drills for all 308+ developer studios created by Talari Pradeep. Features complete use cases, architectural treatments, and hands-on terminal drills." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --bg-base: #060911;
      --bg-surface: #0c1220;
      --bg-card: rgba(15, 23, 42, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.35);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-cyan: #38bdf8;
      --accent-green: #34d399;
      --accent-red: #f87171;
      --font-display: 'Space Grotesk', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-body);
      line-height: 1.6;
      padding-bottom: 5rem;
    }}
    a {{ color: inherit; text-decoration: none; }}

    .navbar {{
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(6, 9, 17, 0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 0.85rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }}
    .nav-brand {{
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.1rem;
      color: #fff;
    }}
    .nav-actions {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}
    .nav-btn {{
      padding: 0.45rem 0.95rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }}
    .nav-btn-doc {{
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #93c5fd;
    }}
    .nav-btn-doc:hover {{ background: #3b82f6; color: #fff; }}
    .nav-btn-home {{
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }}
    .nav-btn-home:hover {{ color: #fff; }}

    .container {{
      max-width: 1120px;
      margin: 2.5rem auto 0;
      padding: 0 1.5rem;
    }}

    .hero-banner {{
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      margin-bottom: 2.5rem;
    }}
    .hero-title {{
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 0.75rem;
      color: #fff;
    }}
    .hero-desc {{
      font-size: 1.1rem;
      color: var(--text-secondary);
      max-width: 860px;
      margin-bottom: 1.5rem;
    }}
    .hero-download-bar {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
    }}

    .search-input {{
      width: 100%;
      padding: 0.9rem 1.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: #fff;
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      margin-bottom: 2rem;
    }}
    .search-input:focus {{
      border-color: var(--accent-cyan);
    }}

    .studios-list {{
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }}
    .studio-card {{
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.75rem;
      transition: all 0.2s ease;
    }}
    .studio-card:hover {{
      border-color: var(--border-accent);
    }}
    .card-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 0.75rem;
    }}
    .badge {{
      font-family: var(--font-mono);
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }}
    .badge-num {{ background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }}
    .badge-cat {{ background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }}
    .badge-domain {{ background: rgba(129, 140, 248, 0.12); color: #a5b4fc; }}
    .badge-skill {{ background: rgba(52, 211, 153, 0.12); color: var(--accent-green); }}

    .card-title {{
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.35rem;
    }}
    .card-artifact {{
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }}
    .card-artifact code {{
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }}

    .card-section {{
      margin-bottom: 1rem;
    }}
    .section-label {{
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent-cyan);
      margin-bottom: 0.25rem;
    }}
    .section-text {{
      font-size: 0.92rem;
      color: #e2e8f0;
      line-height: 1.5;
    }}

    .treatment-box {{
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }}
    .best-treatment {{
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }}
    .anti-pattern {{
      background: rgba(239, 68, 68, 0.07);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }}
    .treatment-title {{
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }}
    .best-treatment .treatment-title {{ color: var(--accent-green); }}
    .anti-pattern .treatment-title {{ color: var(--accent-red); }}
    .treatment-text {{
      font-size: 0.88rem;
      color: #f1f5f9;
      line-height: 1.45;
    }}

    .drill-box {{
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
    }}
    .drill-label {{
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 0.35rem;
    }}
    .drill-code {{
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: #38bdf8;
      word-break: break-all;
    }}

    .card-footer {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      margin-top: 0.75rem;
    }}
    .sre-tag {{
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--accent-green);
    }}
    .card-links {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}
    .link-btn {{
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: #cbd5e1;
      transition: all 0.15s;
    }}
    .link-btn:hover {{
      color: #fff;
      border-color: var(--border-accent);
    }}
    .link-btn.primary {{
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.35);
      color: var(--accent-cyan);
    }}
    .link-btn.primary:hover {{
      background: var(--accent-cyan);
      color: #030712;
    }}
  </style>
</head>
<body>

  <nav class="navbar">
    <div class="nav-brand">TALARI PRADEEP &bull; STUDIOS KNOWLEDGE REPOSITORY</div>
    <div class="nav-actions">
      <a href="308_Studios_Complete_Learning_Guide.docx" download class="nav-btn nav-btn-doc">📥 Complete Word (.docx)</a>
      <a href="308_Studios_Complete_Learning_Guide.word" download class="nav-btn nav-btn-doc">📥 Complete Word (.word)</a>
      <a href="../studios/" class="nav-btn nav-btn-home">← Studios Catalog</a>
      <a href="../" class="nav-btn nav-btn-home">Home</a>
    </div>
  </nav>

  <main class="container">
    <div class="hero-banner">
      <h1 class="hero-title">All 308+ Engineering Studios Compendium</h1>
      <p class="hero-desc">
        Complete reference and operational runbooks for 308 developer studios. Includes enterprise production use cases, concrete configuration examples, failure diagnostics (Best Treatments vs Anti-Patterns), and executable real-time drills.
      </p>
      <div class="hero-download-bar">
        <a href="308_Studios_Complete_Learning_Guide.docx" download class="nav-btn nav-btn-doc">📥 Download 308 Studios Guide (.docx)</a>
        <a href="308_Studios_Complete_Learning_Guide.word" download class="nav-btn nav-btn-doc">📥 Download 308 Studios Guide (.word)</a>
        <a href="308_Studios_Master_Catalog.docx" download class="nav-btn nav-btn-doc">📋 Download Master Directory Table (.docx)</a>
      </div>
    </div>

    <input type="text" id="liveSearch" class="search-input" placeholder="Live search across all 308 studios by name, technology (e.g. vLLM, eBPF, Vault, KEDA), use case, or drill..." oninput="filterStudios()" />

    <div class="studios-list" id="studiosList">
      {"".join(html_items)}
    </div>
  </main>

  <script>
    function filterStudios() {{
      const query = document.getElementById('liveSearch').value.toLowerCase();
      const cards = document.querySelectorAll('.studio-card');
      cards.forEach(card => {{
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      }});
    }}
  </script>
</body>
</html>
'''

    comp_html_path = os.path.join(PRADEEP_DIR, '308_Studios_Complete_Learning_Guide.html')
    idx_html_path = os.path.join(PRADEEP_DIR, 'index.html')

    with open(comp_html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    shutil.copyfile(comp_html_path, idx_html_path)
    print(f"[OK] Pradeep HTML Compendium saved: {comp_html_path}")

# 4. COPY INDIVIDUAL .DOCX AND .WORD FILES TO pradeep/all_studios/
def copy_individual_word_files():
    copied = 0
    for s in studios:
        link = s.get('link', '').strip('/\\')
        src_docx = os.path.join(TOOLS_DIR, link, 'learn.docx')
        src_word = os.path.join(TOOLS_DIR, link, 'learn.word')

        if os.path.exists(src_docx):
            dest_docx = os.path.join(ALL_STUDIOS_DIR, f"{link}.docx")
            dest_word = os.path.join(ALL_STUDIOS_DIR, f"{link}.word")
            shutil.copyfile(src_docx, dest_docx)
            shutil.copyfile(src_word, dest_word)
            copied += 1

    print(f"[OK] Copied {copied} individual .docx and .word files to pradeep/all_studios/")

if __name__ == '__main__':
    print("==================================================")
    print("STEP 1: Building Master 308 Studios Word Compendium")
    print("==================================================")
    build_master_word_document()

    print("\n==================================================")
    print("STEP 2: Building 308 Studios Master Catalog Word Document")
    print("==================================================")
    build_catalog_word_document()

    print("\n==================================================")
    print("STEP 3: Building Unified HTML Compendium in pradeep/")
    print("==================================================")
    build_pradeep_html()

    print("\n==================================================")
    print("STEP 4: Copying Individual Studio Word Files to pradeep/all_studios/")
    print("==================================================")
    copy_individual_word_files()

    print("\n[OK] All tasks completed successfully for pradeep/ folder!")
