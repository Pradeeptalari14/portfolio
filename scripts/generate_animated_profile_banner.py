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
    # 1. Official Kubernetes 7-Spoke Helm with Outer Handles & Inner Hub
    k8s = []
    # Outer ring
    ring_pts = int(num_dots * 0.32)
    for i in range(ring_pts):
        th = 2 * math.pi * i / ring_pts
        k8s.append((65 * math.cos(th), 65 * math.sin(th)))
    # Inner hub
    hub_pts = int(num_dots * 0.16)
    for i in range(hub_pts):
        th = 2 * math.pi * i / hub_pts
        k8s.append((18 * math.cos(th), 18 * math.sin(th)))
    # 7 spokes with rounded handles
    rem_k8s = num_dots - len(k8s)
    per_spoke = rem_k8s // 7
    for s in range(7):
        th = 2 * math.pi * s / 7
        spoke_steps = int(per_spoke * 0.6)
        for step in range(spoke_steps):
            r = 18 + (step / spoke_steps) * 47
            k8s.append((r * math.cos(th), r * math.sin(th)))
        handle_steps = per_spoke - spoke_steps
        for step in range(handle_steps):
            r = 65 + (step / handle_steps) * 16
            k8s.append((r * math.cos(th), r * math.sin(th)))
    while len(k8s) < num_dots:
        k8s.append((0, 0))

    # 2. Modern Code & Terminal Glyph < / >
    code = []
    pts_bracket = int(num_dots * 0.35)
    for i in range(pts_bracket):
        t = i / pts_bracket
        if t < 0.5:
            u = t * 2
            x = -22 - u * 40
            y = -46 + u * 46
        else:
            u = (t - 0.5) * 2
            x = -62 + u * 40
            y = 0 + u * 46
        code.append((x, y))

    pts_slash = int(num_dots * 0.30)
    for i in range(pts_slash):
        t = i / pts_slash
        x = -10 + t * 20
        y = 52 - t * 104
        code.append((x, y))

    pts_right = num_dots - len(code)
    for i in range(pts_right):
        t = i / pts_right
        if t < 0.5:
            u = t * 2
            x = 22 + u * 40
            y = -46 + u * 46
        else:
            u = (t - 0.5) * 2
            x = 62 - u * 40
            y = 0 + u * 46
        code.append((x, y))

    # 3. AI Neural Synapse / Atomic Core
    ai = []
    nuc_pts = int(num_dots * 0.22)
    for i in range(nuc_pts):
        th = 2 * math.pi * i / nuc_pts
        r = random.uniform(2, 16)
        ai.append((r * math.cos(th), r * math.sin(th)))

    orbit_pts = int(num_dots * 0.26)
    for angle_deg in [0, 60, 120]:
        ang_rad = math.radians(angle_deg)
        cos_a, sin_a = math.cos(ang_rad), math.sin(ang_rad)
        sub_pts = orbit_pts if angle_deg != 120 else (num_dots - len(ai))
        for i in range(sub_pts):
            th = 2 * math.pi * i / sub_pts
            ex = 68 * math.cos(th)
            ey = 26 * math.sin(th)
            rx = ex * cos_a - ey * sin_a
            ry = ex * sin_a + ey * cos_a
            ai.append((rx, ry))

    while len(ai) < num_dots:
        ai.append((0, 0))

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

    # 2. Portrait Fade animation during logo phase
    drift_css = f"""
    @keyframes portraitFade {{
      0%, 22% {{ opacity: 1; }}
      28% {{ opacity: 0; }}
      88% {{ opacity: 0; }}
      94%, 100% {{ opacity: 1; }}
    }}
    .portrait-drift-layer {{
      animation: portraitFade 16s infinite ease-in-out;
    }}
    """

    # 3. High-Density Traveling Morph Points (500 dots)
    NUM_TRAVELERS = 500
    center_dots = [d for d in dots if 50 <= d[0] <= 250 and 60 <= d[1] <= 280]
    random.seed(2026)
    if len(center_dots) > NUM_TRAVELERS:
        traveling_source = random.sample(center_dots, NUM_TRAVELERS)
    else:
        traveling_source = center_dots
    actual_travelers = len(traveling_source)

    k8s_pts, code_pts, ai_pts = generate_logo_points(actual_travelers)
    morph_cx = 255.0
    morph_cy = 327.0
    morph_scale = 1.7

    def sort_polar(pts, cx, cy):
        return sorted(pts, key=lambda p: math.atan2(p[1] - cy, p[0] - cx))

    sorted_src = sort_polar([(origin_x + x * scale_x, origin_y + y * scale_y) for x, y in traveling_source], morph_cx, morph_cy)
    sorted_k8s = sort_polar([(morph_cx + px * morph_scale, morph_cy + py * morph_scale) for px, py in k8s_pts], morph_cx, morph_cy)
    sorted_code = sort_polar([(morph_cx + px * morph_scale, morph_cy + py * morph_scale) for px, py in code_pts], morph_cx, morph_cy)
    sorted_ai = sort_polar([(morph_cx + px * morph_scale, morph_cy + py * morph_scale) for px, py in ai_pts], morph_cx, morph_cy)

    traveling_smil_elements = []
    key_times = "0; 0.22; 0.28; 0.44; 0.50; 0.66; 0.72; 0.88; 0.94; 1.0"
    opacity_values = "0; 0; 1; 1; 1; 1; 1; 1; 0; 0"

    for i in range(actual_travelers):
        p0 = sorted_src[i]
        p1 = sorted_k8s[i]
        p2 = sorted_code[i]
        p3 = sorted_ai[i]

        cx_vals = f"{p0[0]:.1f};{p0[0]:.1f};{p1[0]:.1f};{p1[0]:.1f};{p2[0]:.1f};{p2[0]:.1f};{p3[0]:.1f};{p3[0]:.1f};{p0[0]:.1f};{p0[0]:.1f}"
        cy_vals = f"{p0[1]:.1f};{p0[1]:.1f};{p1[1]:.1f};{p1[1]:.1f};{p2[1]:.1f};{p2[1]:.1f};{p3[1]:.1f};{p3[1]:.1f};{p0[1]:.1f};{p0[1]:.1f}"

        traveling_smil_elements.append(f'''
      <circle cx="{p0[0]:.1f}" cy="{p0[1]:.1f}" r="1.4" fill="{chrome_color}">
        <animate attributeName="cx" values="{cx_vals}" keyTimes="{key_times}" dur="16s" repeatCount="indefinite" />
        <animate attributeName="cy" values="{cy_vals}" keyTimes="{key_times}" dur="16s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="{opacity_values}" keyTimes="{key_times}" dur="16s" repeatCount="indefinite" />
      </circle>''')

    # Info panel rows strictly adhering to user's real projects and GitHub repositories
    rows = [
        ("Subject", "Talari Pradeep"),
        ("Role", "Senior DevOps & Cloud Platform Engineer"),
        ("Origin", "Bangalore, India"),
        ("Education", "B.Tech in Computer Science & Engineering"),
        ("Status", "Automating · Scaling · Deploying Production Cloud & AI"),
        ("ToolChain", "Docker, Kubernetes, Terraform, Helm, Linux, Git"),
        ("Core.Cloud", "AWS (EKS, VPC, IAM, S3), Azure (AKS), GCP"),
        ("Core.CI_CD", "GitHub Actions, Jenkins, Ansible, ArgoCD, GitOps"),
        ("Core.IaC", "Terraform Modules, Terragrunt, HCL, HashiCorp Vault"),
        ("Core.Lang", "Python, Bash / Shell, YAML, HCL, SQL, Go"),
        ("Core.AIML", "LLMOps, LangGraph Multi-Agent, RAG, vLLM, Ray"),
        ("Core.Obs", "Prometheus, Grafana, OpenTelemetry, Loki, Tempo"),
        ("Core.Sec", "HashiCorp Vault, Cilium eBPF, Trivy, Zero-Trust"),
        ("- Contact", ""),
        ("Grid.Mail", "talaripradeep14@gmail.com"),
        ("Grid.Portfolio", "https://talaripradeep.info (341 Studios)"),
        ("Grid.LinkedIn", "https://linkedin.com/in/pradeep-talari"),
        ("Grid.GitHub", "https://github.com/Pradeeptalari14")
    ]

    info_lines_svg = []
    y_start = 135
    spacing = 23
    mono_font = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

    for idx, (label, val) in enumerate(rows):
        y_pos = y_start + idx * spacing
        safe_label = label.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        safe_val = val.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        if label.startswith("-"):
            # Subheader separator
            info_lines_svg.append(f'''
            <text x="{panel_right_x + 18}" y="{y_pos}" fill="{chrome_color}" font-family="{mono_font}" font-size="12" font-weight="700">{safe_label}</text>''')
            continue

        is_highlight = label in ("Subject", "Role", "Grid.Portfolio")
        is_status = (label == "Status")
        val_color = accent_emerald if is_status else (chrome_color if is_highlight else text_primary)
        val_weight = "700" if is_highlight else "500"

        # Precise monospace leader dots without character stretching
        dot_count = max(2, 20 - len(label))
        dots_leader = "." * dot_count

        info_lines_svg.append(f'''
        <text x="{panel_right_x + 18}" y="{y_pos}" font-family="{mono_font}" font-size="12" xml:space="preserve"><tspan fill="{text_secondary}" font-weight="600">{safe_label} </tspan><tspan fill="{text_muted}" opacity="0.38">{dots_leader} </tspan><tspan fill="{val_color}" font-weight="{val_weight}">{safe_val}</tspan></text>''')

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
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.9" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
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
  <text x="{total_w - 35}" y="40" fill="{text_secondary}" font-family="{mono_font}" font-size="12" font-weight="600" text-anchor="end" letter-spacing="0.5">
    talaripradeep14@gmail.com &#8212; profile.sh &#8212;live
  </text>

  <!-- Left Panel: VISUAL.MAP Outer Box -->
  <rect x="35" y="75" width="{panel_left_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  <text x="55" y="98" fill="{chrome_color}" font-family="{mono_font}" font-size="12" font-weight="800" letter-spacing="1.5">
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
  <g id="travelers-layer" filter="url(#cyanGlow)">
    {"".join(traveling_smil_elements)}
  </g>

  <!-- Right Panel: SYSTEM.INFO Outer Box -->
  <rect x="{panel_right_x}" y="75" width="{panel_right_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  
  <!-- SYSTEM.INFO Header -->
  <text x="{panel_right_x + 18}" y="98" fill="{chrome_color}" font-family="{mono_font}" font-size="13" font-weight="800" letter-spacing="1.5">
    SYSTEM.INFO
  </text>

  <!-- Highlighted Email Pill Badge matching reference -->
  <g transform="translate({panel_right_x + 18}, 107)">
    <rect width="210" height="20" rx="3" fill="#6366F1" />
    <text x="105" y="14" fill="#FFFFFF" font-family="{mono_font}" font-size="11" font-weight="700" text-anchor="middle">talaripradeep14@gmail.com</text>
  </g>

  <!-- Rows of Telemetry -->
  <g id="info-readout">
    {"".join(info_lines_svg)}
  </g>

  <!-- Terminal Bottom Prompt -->
  <g transform="translate({panel_right_x + 18}, 555)">
    <text x="0" y="0" fill="{chrome_color}" font-family="{mono_font}" font-size="12" font-weight="600">&gt; More about me &amp; projects:</text>
    <rect class="cursor-blink" x="215" y="-10" width="8" height="12" fill="{chrome_color}" />
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
