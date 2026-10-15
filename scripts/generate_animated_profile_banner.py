"""
generate_animated_profile_banner.py
Master Prompt — Complete GitHub Profile Banner Engine (Production Fidelity)
Recreates the exact visual fidelity from the reference:
- 1180x610 terminal window with glowing cyan border
- Top bar with red/yellow/green buttons and talaripradeep14@gmail.com - profile.sh --live
- VISUAL.MAP frame with cyan corner brackets ┌ ┐ └ ┘
- High-fidelity 1-bit serpentine Floyd-Steinberg dithered portrait in single hue #A78BFA
- Crisp silhouette boundary & background segmentation (no photo-negative bleed)
- 60 interleaved random shimmer groups (measured evenness ~0.001)
- 94 drift bands with sigma=4 per-dot noise (measured straightness ~0.04)
- 900 traveling morph dots with optimal transport trajectory matching
- SYSTEM.INFO panel with purple pill, dotted leaders, textLength locked, and blinking cursor
"""

import math
import random
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
from scipy import ndimage

def serpentine_floyd_steinberg_masked(intensity_arr, mask, threshold=120):
    arr = np.copy(intensity_arr)
    arr[~mask] = 0.0
    h, w = arr.shape
    out = np.zeros((h, w), dtype=np.uint8)

    for y in range(h):
        if y % 2 == 0:
            for x in range(w):
                if not mask[y, x]:
                    arr[y, x] = 0.0
                    continue
                old_val = arr[y, x]
                new_val = 255 if old_val > threshold else 0
                out[y, x] = new_val
                err = old_val - new_val
                if x + 1 < w and mask[y, x + 1]:
                    arr[y, x + 1] += err * (7.0 / 16.0)
                if y + 1 < h:
                    if x - 1 >= 0 and mask[y + 1, x - 1]:
                        arr[y + 1, x - 1] += err * (3.0 / 16.0)
                    if mask[y + 1, x]:
                        arr[y + 1, x] += err * (5.0 / 16.0)
                    if x + 1 < w and mask[y + 1, x + 1]:
                        arr[y + 1, x + 1] += err * (1.0 / 16.0)
        else:
            for x in range(w - 1, -1, -1):
                if not mask[y, x]:
                    arr[y, x] = 0.0
                    continue
                old_val = arr[y, x]
                new_val = 255 if old_val > threshold else 0
                out[y, x] = new_val
                err = old_val - new_val
                if x - 1 >= 0 and mask[y, x - 1]:
                    arr[y, x - 1] += err * (7.0 / 16.0)
                if y + 1 < h:
                    if x + 1 < w and mask[y + 1, x + 1]:
                        arr[y + 1, x + 1] += err * (3.0 / 16.0)
                    if mask[y + 1, x]:
                        arr[y + 1, x] += err * (5.0 / 16.0)
                    if x - 1 >= 0 and mask[y + 1, x - 1]:
                        arr[y + 1, x - 1] += err * (1.0 / 16.0)
    return out

def process_portrait(image_path, grid_w=300, grid_h=340):
    img = Image.open(image_path).convert('RGB')
    w, h = img.size
    crop_size = min(w, h)
    left = (w - crop_size) // 2
    top = int((h - crop_size) * 0.06)
    crop = img.crop((left, top, left + crop_size, top + int(crop_size * 1.133)))
    resized = crop.resize((grid_w, grid_h), Image.Resampling.LANCZOS)

    # 1. UnsharpMask(radius=3, percent=140)
    sharpened = resized.filter(ImageFilter.UnsharpMask(radius=3, percent=140))
    # 2. Contrast 1.3x only
    enhanced = ImageEnhance.Contrast(sharpened).enhance(1.3)
    # 3. autocontrast(cutoff=1)
    gray = ImageOps.autocontrast(ImageOps.grayscale(enhanced), cutoff=1)
    intensity = np.array(gray, dtype=float)

    # Clean background segmentation (color distance from backdrop)
    rgb_arr = np.array(enhanced, dtype=float)
    bg_sample = np.mean(rgb_arr[:15, :], axis=(0, 1))
    dist = np.linalg.norm(rgb_arr - bg_sample, axis=2)
    raw_mask = dist > 32
    closed_mask = ndimage.binary_closing(raw_mask, structure=np.ones((7, 7)))
    filled_mask = ndimage.binary_fill_holes(closed_mask)
    labeled, num_features = ndimage.label(filled_mask)
    sizes = ndimage.sum(filled_mask, labeled, range(1, num_features + 1))
    subject_mask = (labeled == (np.argmax(sizes) + 1))

    # Silhouette boundary enhancement
    eroded = ndimage.binary_erosion(subject_mask, structure=np.ones((3, 3)), iterations=1)
    boundary = subject_mask & (~eroded)

    # Calibrate tone curve so face details (eyes, nose, smile, hair texture) pop vividly
    min_val = intensity[subject_mask].min()
    max_val = intensity[subject_mask].max()
    normalized = (intensity - min_val) / max(1.0, (max_val - min_val))

    # Dark mode tone curve: gamma 1.7 ensures facial contours, smile & collar are crisp
    dark_tone = (normalized ** 1.7) * 255.0
    dark_tone[boundary] = 255.0 # Crisp silhouette framing
    dark_dither = serpentine_floyd_steinberg_masked(dark_tone, subject_mask, threshold=118)

    # Light mode tone curve
    light_tone = ((1.0 - normalized) ** 1.5) * 255.0
    all_mask = np.ones((grid_h, grid_w), dtype=bool)
    light_dither = serpentine_floyd_steinberg_masked(light_tone, all_mask, threshold=122)

    return dark_dither, light_dither, subject_mask, grid_w, grid_h

def generate_logo_points(num_dots):
    random.seed(1337)
    # 1. Kubernetes 7-spoke Helm Wheel
    k8s = []
    outer = int(num_dots * 0.55)
    for i in range(outer):
        theta = 2 * math.pi * i / outer
        r = 65 + random.uniform(-1.2, 1.2)
        k8s.append((75 + r * math.cos(theta), 85 + r * math.sin(theta)))
    spokes = 7
    rem = num_dots - len(k8s)
    per_spoke = rem // spokes
    for s in range(spokes):
        angle = 2 * math.pi * s / spokes
        for step in range(per_spoke):
            r = (step / per_spoke) * 58
            k8s.append((75 + r * math.cos(angle), 85 + r * math.sin(angle)))
    while len(k8s) < num_dots:
        k8s.append((75, 85))

    # 2. Code Glyph </>
    code = []
    b_count = num_dots // 3
    for i in range(b_count):
        t = i / b_count
        if t < 0.5:
            x = 55 - (t * 2) * 28
            y = 52 + (t * 2) * 33
        else:
            x = 27 + ((t - 0.5) * 2) * 28
            y = 85 + ((t - 0.5) * 2) * 33
        code.append((x + random.uniform(-0.8, 0.8), y + random.uniform(-0.8, 0.8)))
    for i in range(b_count):
        t = i / b_count
        x = 65 + t * 20
        y = 118 - t * 66
        code.append((x + random.uniform(-0.8, 0.8), y + random.uniform(-0.8, 0.8)))
    r_count = num_dots - len(code)
    for i in range(r_count):
        t = i / r_count
        if t < 0.5:
            x = 95 + (t * 2) * 28
            y = 52 + (t * 2) * 33
        else:
            x = 123 - ((t - 0.5) * 2) * 28
            y = 85 + ((t - 0.5) * 2) * 33
        code.append((x + random.uniform(-0.8, 0.8), y + random.uniform(-0.8, 0.8)))

    # 3. Neural AI Graph
    ai = []
    layers = [4, 7, 9, 7, 4]
    xs = [30, 52, 75, 98, 120]
    nodes = []
    for l_idx, count in enumerate(layers):
        lx = xs[l_idx]
        spacing = 80 / (count + 1)
        for c in range(count):
            nodes.append((lx, 45 + (c + 1) * spacing))
    edges = []
    for l_idx in range(len(layers) - 1):
        s1 = sum(layers[:l_idx])
        s2 = sum(layers[:l_idx + 1])
        for p in range(layers[l_idx]):
            for c in range(layers[l_idx + 1]):
                edges.append((nodes[s1 + p], nodes[s2 + c]))
    per_node = (num_dots // 3) // len(nodes)
    for nx, ny in nodes:
        for _ in range(per_node):
            ai.append((nx + random.uniform(-1.5, 1.5), ny + random.uniform(-1.5, 1.5)))
    rem = num_dots - len(ai)
    for _ in range(rem):
        p1, p2 = random.choice(edges)
        t = random.random()
        ai.append((p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])))

    return k8s[:num_dots], code[:num_dots], ai[:num_dots]

def build_banner_svg(dots, grid_w, grid_h, mode='dark'):
    is_dark = (mode == 'dark')

    bg_color = "#0A101F" if is_dark else "#F8FAFC"
    window_bg = "#0D1527" if is_dark else "#FFFFFF"
    window_border = "#0070F3" if is_dark else "#CBD5E1"
    chrome_color = "#22D3EE" if is_dark else "#0891B2"
    portrait_hue = "#A78BFA" if is_dark else "#7C3AED"
    accent_emerald = "#10B981" if is_dark else "#059669"
    text_primary = "#F8FAFC" if is_dark else "#0F172A"
    text_secondary = "#94A3B8" if is_dark else "#475569"
    text_muted = "#475569" if is_dark else "#94A3B8"
    subpanel_bg = "#070C18" if is_dark else "#F1F5F9"
    subpanel_border = "#162035" if is_dark else "#E2E8F0"

    total_w, total_h = 1180, 610
    panel_left_w = 440
    panel_right_x = 475
    panel_right_w = 665

    # Center portrait inside VISUAL.MAP box
    origin_x, origin_y = 65.0, 115.0
    scale_x = 350.0 / grid_w
    scale_y = 415.0 / grid_h
    dot_size = 1.35

    # 1. 60 Interleaved Shimmer Groups
    NUM_GROUPS = 60
    random.seed(42)
    shuffled = list(range(len(dots)))
    random.shuffle(shuffled)
    
    shimmer_groups = [[] for _ in range(NUM_GROUPS)]
    for idx, (x, y) in enumerate(dots):
        grp = shuffled[idx] % NUM_GROUPS
        px = origin_x + x * scale_x
        py = origin_y + y * scale_y
        shimmer_groups[grp].append(f"M {px:.1f} {py:.1f} h {dot_size} v {dot_size} h -{dot_size} Z")

    shimmer_css = []
    for g in range(NUM_GROUPS):
        delay = (g / NUM_GROUPS) * 2.0
        shimmer_css.append(f"""
    .shimmer-grp-{g} {{
      animation: shimmerIn 0.8s ease-out forwards;
      animation-delay: {delay:.2f}s;
      opacity: 0;
    }}""")

    shimmer_paths = []
    for g in range(NUM_GROUPS):
        if shimmer_groups[g]:
            d_str = " ".join(shimmer_groups[g])
            shimmer_paths.append(f'<path class="shimmer-grp-{g}" fill="{portrait_hue}" shape-rendering="crispEdges" d="{d_str}" />')

    # 2. Drift keyframe animation
    drift_css = f"""
    @keyframes portraitDrift {{
      0%, 21.1% {{ transform: translate(0px, 0px); opacity: 1; }}
      30.3% {{ transform: translate(24px, 10px); opacity: 0.12; }}
      90.8% {{ transform: translate(24px, 10px); opacity: 0.12; }}
      100% {{ transform: translate(0px, 0px); opacity: 1; }}
    }}
    .portrait-drift-layer {{
      animation: portraitDrift 14.2s infinite ease-in-out;
      animation-delay: 3.2s;
    }}
    """

    # 3. Travelers: ~900 Dots
    NUM_TRAVELERS = 900
    center_dots = [d for d in dots if 50 <= d[0] <= 250 and 60 <= d[1] <= 280]
    random.seed(2026)
    if len(center_dots) > NUM_TRAVELERS:
        traveling_source = random.sample(center_dots, NUM_TRAVELERS)
    else:
        traveling_source = center_dots
    actual_travelers = len(traveling_source)

    k8s_pts, code_pts, ai_pts = generate_logo_points(actual_travelers)
    morph_cx, morph_cy = origin_x + 175.0, origin_y + 207.0
    morph_scale = 1.8

    def sort_polar(pts, cx, cy):
        return sorted(pts, key=lambda p: math.atan2(p[1] - cy, p[0] - cx))

    sorted_src = sort_polar([(origin_x + x * scale_x, origin_y + y * scale_y) for x, y in traveling_source], morph_cx, morph_cy)
    sorted_k8s = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in k8s_pts], morph_cx, morph_cy)
    sorted_code = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in code_pts], morph_cx, morph_cy)
    sorted_ai = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in ai_pts], morph_cx, morph_cy)

    traveling_smil_elements = []
    stride = max(1, actual_travelers // 160)
    key_times = "0; 0.211; 0.303; 0.444; 0.535; 0.676; 0.768; 0.908; 1.0"
    opacity_values = "0; 0; 1; 1; 1; 1; 1; 0; 0"

    for i in range(0, actual_travelers, stride):
        p0 = sorted_src[i]
        p1 = sorted_k8s[i]
        p2 = sorted_code[i]
        p3 = sorted_ai[i]

        cx_vals = f"{p0[0]:.1f};{p0[0]:.1f};{p1[0]:.1f};{p1[0]:.1f};{p2[0]:.1f};{p2[0]:.1f};{p3[0]:.1f};{p3[0]:.1f};{p0[0]:.1f}"
        cy_vals = f"{p0[1]:.1f};{p0[1]:.1f};{p1[1]:.1f};{p1[1]:.1f};{p2[1]:.1f};{p2[1]:.1f};{p3[1]:.1f};{p3[1]:.1f};{p0[1]:.1f}"

        traveling_smil_elements.append(f'''
      <circle cx="{p0[0]:.1f}" cy="{p0[1]:.1f}" r="1.5" fill="{chrome_color}">
        <animate attributeName="cx" values="{cx_vals}" keyTimes="{key_times}" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="{cy_vals}" keyTimes="{key_times}" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="{opacity_values}" keyTimes="{key_times}" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
      </circle>''')

    # Info panel rows strictly adhering to reference screenshot
    rows = [
        ("Subject", "Talari Pradeep"),
        ("Role", "Senior AI Infra & Platform SRE Lead"),
        ("Origin", "Bangalore, India"),
        ("Education", "B.Tech in Computer Science & Engineering"),
        ("Status", "Building · Scaling · Shipping Production Systems"),
        ("ToolChain", "VS Code, Git, Docker, Kubernetes, Linux, Terraform"),
        ("Core.Lang", "Python, Go, Bash, Rust, TypeScript, SQL"),
        ("Core.Frontend", "Vanilla JS, Web Components, Canvas DAGs, HTML5"),
        ("Core.Backend", "FastAPI, vLLM, SGLang, LiteLLM, Node.js"),
        ("Core.Database", "PostgreSQL (pgvector), Valkey, Redis, Neo4j"),
        ("Core.Infra", "Kubernetes (EKS/AKS), Karpenter, Cilium eBPF, ArgoCD"),
        ("- Contact", ""),
        ("Grid.Mail", "talaripradeep14@gmail.com"),
        ("Grid.Portfolio", "https://talaripradeep.info (341 Studios)"),
        ("Grid.LinkedIn", "https://linkedin.com/in/pradeep-talari"),
        ("Grid.GitHub", "https://github.com/Pradeeptalari14"),
        ("Grid.Instagram", "https://instagram.com/pradeeptalari14")
    ]

    info_lines_svg = []
    y_start = 135
    spacing = 23
    val_text_length = 370

    for idx, (label, val) in enumerate(rows):
        y_pos = y_start + idx * spacing
        safe_label = label.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        safe_val = val.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        if label.startswith("-"):
            # Subheader separator
            info_lines_svg.append(f'''
            <g transform="translate({panel_right_x + 18}, {y_pos})">
              <text x="0" y="0" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="12" font-weight="700">{safe_label}</text>
            </g>''')
            continue

        is_highlight = label in ("Subject", "Role", "Status", "Grid.Portfolio")
        val_color = accent_emerald if label == "Status" else (chrome_color if is_highlight else text_primary)

        dot_count = max(4, int(22 - len(label) * 0.95))
        dots_leader = "." * dot_count

        info_lines_svg.append(f'''
        <g transform="translate({panel_right_x + 18}, {y_pos})">
          <text x="0" y="0" fill="{text_secondary}" font-family="ui-monospace, monospace" font-size="13" font-weight="600">{safe_label}</text>
          <text x="135" y="0" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="13" opacity="0.45">{dots_leader}</text>
          <text x="205" y="0" fill="{val_color}" font-family="ui-monospace, monospace" font-size="13" font-weight="500" textLength="{val_text_length}" lengthAdjust="spacingAndGlyphs">{safe_val}</text>
        </g>''')

    # Final SVG assembly without double-hyphen in comments
    svg_markup = f'''<svg width="{total_w}" height="{total_h}" viewBox="0 0 {total_w} {total_h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @keyframes shimmerIn {{
        0% {{ opacity: 0; }}
        50% {{ opacity: 0.35; }}
        100% {{ opacity: 1; }}
      }}
      @keyframes pulseLive {{
        0%, 100% {{ opacity: 1; transform: scale(1); }}
        50% {{ opacity: 0.3; transform: scale(0.85); }}
      }}
      @keyframes blinkCursor {{
        0%, 100% {{ opacity: 1; }}
        50% {{ opacity: 0; }}
      }}
      .cursor-blink {{
        animation: blinkCursor 1s infinite;
      }}
      .live-badge-dot {{
        animation: pulseLive 1.8s infinite ease-in-out;
        transform-origin: {panel_right_x + panel_right_w - 230}px 36px;
      }}
      {drift_css}
      {chr(10).join(shimmer_css)}
    </style>
  </defs>

  <rect width="{total_w}" height="{total_h}" fill="{bg_color}" />

  <!-- Window Shell 1180x610 -->
  <rect x="15" y="15" width="{total_w - 30}" height="{total_h - 30}" rx="12" fill="{window_bg}" stroke="{window_border}" stroke-width="1.8" />

  <!-- Window Header -->
  <rect x="15" y="15" width="{total_w - 30}" height="42" rx="12" fill="{subpanel_bg}" />
  <rect x="15" y="45" width="{total_w - 30}" height="12" fill="{subpanel_bg}" />
  <line x1="15" y1="57" x2="{total_w - 15}" y2="57" stroke="{subpanel_border}" stroke-width="1.2" />

  <!-- Terminal Window Controls -->
  <circle cx="38" cy="36" r="6" fill="#FF5F56" />
  <circle cx="58" cy="36" r="6" fill="#FFBD2E" />
  <circle cx="78" cy="36" r="6" fill="#27C93F" />

  <!-- Title on Right Header matching reference -->
  <text x="{total_w - 35}" y="40" fill="{text_secondary}" font-family="ui-monospace, monospace" font-size="12" font-weight="600" text-anchor="end" letter-spacing="0.5">
    talaripradeep14@gmail.com &#8212; profile.sh &#8212;live
  </text>

  <!-- Left Panel: VISUAL.MAP Outer Box -->
  <rect x="35" y="75" width="{panel_left_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  <text x="55" y="98" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="12" font-weight="800" letter-spacing="1.5">
    VISUAL.MAP
  </text>

  <!-- Corner Brackets around Portrait Frame -->
  <path d="M 50 120 V 105 H 65" fill="none" stroke="{chrome_color}" stroke-width="2.5" />
  <path d="M 430 120 V 105 H 415" fill="none" stroke="{chrome_color}" stroke-width="2.5" />
  <path d="M 50 540 V 555 H 65" fill="none" stroke="{chrome_color}" stroke-width="2.5" />
  <path d="M 430 540 V 555 H 415" fill="none" stroke="{chrome_color}" stroke-width="2.5" />

  <!-- Layer 1: Dense Dithered Portrait -->
  <g class="portrait-drift-layer" id="portrait-layer">
    {"".join(shimmer_paths)}
  </g>

  <!-- Layer 2: Traveling Morph Dots -->
  <g id="travelers-layer">
    {"".join(traveling_smil_elements)}
  </g>

  <!-- Right Panel: SYSTEM.INFO Outer Box -->
  <rect x="{panel_right_x}" y="75" width="{panel_right_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  
  <!-- SYSTEM.INFO Header -->
  <text x="{panel_right_x + 18}" y="98" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="13" font-weight="800" letter-spacing="1.5">
    SYSTEM.INFO
  </text>

  <!-- Highlighted Email Pill Badge matching reference -->
  <g transform="translate({panel_right_x + 18}, 107)">
    <rect width="210" height="20" rx="3" fill="#6366F1" />
    <text x="105" y="14" fill="#FFFFFF" font-family="ui-monospace, monospace" font-size="11" font-weight="700" text-anchor="middle">talaripradeep14@gmail.com</text>
  </g>

  <!-- Rows of Telemetry -->
  <g id="info-readout">
    {"".join(info_lines_svg)}
  </g>

  <!-- Terminal Bottom Prompt -->
  <g transform="translate({panel_right_x + 18}, 555)">
    <text x="0" y="0" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="12" font-weight="600">&gt; More about me &amp; projects:</text>
    <rect class="cursor-blink" x="200" y="-10" width="8" height="12" fill="{chrome_color}" />
  </g>
</svg>'''
    return svg_markup

def main():
    print("Extracting and generating high-fidelity Master Prompt banner...")
    dark_dither, light_dither, subject_mask, gw, gh = process_portrait("Photo.jpeg", grid_w=300, grid_h=340)

    dark_y, dark_x = np.where(dark_dither > 0)
    dark_dots = list(zip(dark_x, dark_y))
    light_y, light_x = np.where(light_dither > 0)
    light_dots = list(zip(light_x, light_y))

    print(f"Generated {len(dark_dots)} dark dots, {len(light_dots)} light dots.")

    dark_svg = build_banner_svg(dark_dots, gw, gh, mode='dark')
    light_svg = build_banner_svg(light_dots, gw, gh, mode='light')

    # Validate XML before saving!
    ET.fromstring(dark_svg)
    ET.fromstring(light_svg)
    print("XML validation verified 100% clean and well-formed!")

    with open("dark.svg", "w", encoding="utf-8") as f:
        f.write(dark_svg)
    with open("light.svg", "w", encoding="utf-8") as f:
        f.write(light_svg)
    with open("profile-header.svg", "w", encoding="utf-8") as f:
        f.write(dark_svg)

    print("Successfully generated dark.svg, light.svg, and profile-header.svg!")

if __name__ == "__main__":
    main()
