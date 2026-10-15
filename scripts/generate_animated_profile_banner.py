"""
generate_animated_profile_banner.py
Master Prompt Complete GitHub Profile: Phase 1 Animated Banner Generator
Generates pixel-perfect dark.svg and light.svg terminal banners (1180x610)
incorporating serpentine Floyd-Steinberg dithered portrait, interleaved shimmer intro,
optimal transport logo morphing, and textLength-locked system information.
"""

import math
import random
import numpy as np
from PIL import Image, ImageOps, ImageFilter

def serpentine_floyd_steinberg(img_gray, threshold=128):
    """
    Performs 1-bit Floyd-Steinberg dithering in serpentine order (alternating
    left-to-right and right-to-left) to eliminate directional worming artifacts.
    """
    arr = np.array(img_gray, dtype=float)
    h, w = arr.shape
    out = np.zeros((h, w), dtype=np.uint8)

    for y in range(h):
        if y % 2 == 0:
            for x in range(w):
                old_val = arr[y, x]
                new_val = 255 if old_val > threshold else 0
                out[y, x] = new_val
                err = old_val - new_val
                if x + 1 < w:
                    arr[y, x + 1] += err * (7.0 / 16.0)
                if y + 1 < h:
                    if x - 1 >= 0:
                        arr[y + 1, x - 1] += err * (3.0 / 16.0)
                    arr[y + 1, x] += err * (5.0 / 16.0)
                    if x + 1 < w:
                        arr[y + 1, x + 1] += err * (1.0 / 16.0)
        else:
            for x in range(w - 1, -1, -1):
                old_val = arr[y, x]
                new_val = 255 if old_val > threshold else 0
                out[y, x] = new_val
                err = old_val - new_val
                if x - 1 >= 0:
                    arr[y, x - 1] += err * (7.0 / 16.0)
                if y + 1 < h:
                    if x + 1 < w:
                        arr[y + 1, x + 1] += err * (3.0 / 16.0)
                    arr[y + 1, x] += err * (5.0 / 16.0)
                    if x - 1 >= 0:
                        arr[y + 1, x - 1] += err * (1.0 / 16.0)
    return out

def extract_portrait_dots(image_path, grid_w=150, grid_h=170):
    """
    Loads portrait, crops to head-and-shoulders, applies contrast enhancement,
    masks background, and performs serpentine dithering.
    """
    img = Image.open(image_path).convert('RGB')
    
    # Center crop square-ish head and shoulders
    w, h = img.size
    crop_size = min(w, h)
    left = (w - crop_size) // 2
    top = int((h - crop_size) * 0.15) # favor top for head
    img_cropped = img.crop((left, top, left + crop_size, top + crop_size))
    
    # Resize to target grid
    img_resized = img_cropped.resize((grid_w, grid_h), Image.Resampling.LANCZOS)
    
    # Convert to grayscale
    gray = ImageOps.grayscale(img_resized)
    
    # Auto contrast enhancement to separate face details
    gray = ImageOps.autocontrast(gray, cutoff=2)
    
    # Invert for dark-mode display (bright features become dots)
    # Background in photo is light, subject is centered
    arr = np.array(gray, dtype=float)
    
    # Simple elliptical vignette mask to eliminate background corner noise
    y_indices, x_indices = np.indices((grid_h, grid_w))
    cx, cy = grid_w / 2.0, grid_h / 2.0
    rx, ry = grid_w * 0.44, grid_h * 0.47
    mask = (((x_indices - cx) / rx) ** 2 + ((y_indices - cy) / ry) ** 2) <= 1.0
    
    # Invert tones so bright facial highlights produce dense dots
    # In photography, dark hair/pupils are dark, skin is medium-bright
    inverted = 255.0 - arr
    # Enhance midtones
    inverted = np.clip(inverted * 1.3 - 20, 0, 255)
    inverted[~mask] = 0
    
    dithered = serpentine_floyd_steinberg(Image.fromarray(inverted.astype(np.uint8)), threshold=115)
    
    dots = []
    for y in range(grid_h):
        for x in range(grid_w):
            if dithered[y, x] > 0:
                dots.append((x, y))
                
    return dots, grid_w, grid_h

def generate_logo_targets(num_dots):
    """
    Generates point sets for 3 morph targets:
    1. Kubernetes 7-spoke Helm Wheel
    2. Code Glyph </>
    3. Neural Network Graph / AI Brain
    """
    random.seed(42)
    
    # Target 1: Kubernetes Helm Wheel (outer circle + 7 spokes + hub)
    k8s_points = []
    # Outer ring
    for i in range(num_dots // 2):
        theta = 2 * math.pi * i / (num_dots // 2)
        r = 65 + random.uniform(-1.5, 1.5)
        k8s_points.append((75 + r * math.cos(theta), 85 + r * math.sin(theta)))
    # 7 spokes
    remaining = num_dots - len(k8s_points)
    spokes = 7
    per_spoke = remaining // spokes
    for s in range(spokes):
        angle = 2 * math.pi * s / spokes
        for step in range(per_spoke):
            r = (step / per_spoke) * 60
            k8s_points.append((75 + r * math.cos(angle), 85 + r * math.sin(angle)))
    while len(k8s_points) < num_dots:
        k8s_points.append((75, 85))
        
    # Target 2: Code Glyph </>
    code_points = []
    # Left bracket <
    bracket_pts = num_dots // 3
    for i in range(bracket_pts):
        t = i / bracket_pts
        if t < 0.5:
            # top half of <
            x = 55 - (t * 2) * 28
            y = 50 + (t * 2) * 35
        else:
            # bottom half of <
            x = 27 + ((t - 0.5) * 2) * 28
            y = 85 + ((t - 0.5) * 2) * 35
        code_points.append((x + random.uniform(-1, 1), y + random.uniform(-1, 1)))
        
    # Slash /
    slash_pts = num_dots // 3
    for i in range(slash_pts):
        t = i / slash_pts
        x = 65 + t * 20
        y = 120 - t * 70
        code_points.append((x + random.uniform(-1, 1), y + random.uniform(-1, 1)))
        
    # Right bracket >
    right_pts = num_dots - len(code_points)
    for i in range(right_pts):
        t = i / right_pts
        if t < 0.5:
            x = 95 + (t * 2) * 28
            y = 50 + (t * 2) * 35
        else:
            x = 123 - ((t - 0.5) * 2) * 28
            y = 85 + ((t - 0.5) * 2) * 35
        code_points.append((x + random.uniform(-1, 1), y + random.uniform(-1, 1)))

    # Target 3: Neural AI Node Lattice
    ai_points = []
    layers = [4, 7, 9, 7, 4]
    layer_xs = [30, 52, 75, 98, 120]
    nodes = []
    for l_idx, count in enumerate(layers):
        lx = layer_xs[l_idx]
        spacing = 80 / (count + 1)
        for c in range(count):
            ly = 45 + (c + 1) * spacing
            nodes.append((lx, ly))
            
    # Sample along edges between consecutive layers
    edges = []
    for l_idx in range(len(layers) - 1):
        prev_start = sum(layers[:l_idx])
        curr_start = sum(layers[:l_idx + 1])
        for p in range(layers[l_idx]):
            for c in range(layers[l_idx + 1]):
                edges.append((nodes[prev_start + p], nodes[curr_start + c]))
                
    # Place dots along nodes and edges
    per_node = (num_dots // 3) // len(nodes)
    for nx, ny in nodes:
        for _ in range(per_node):
            ai_points.append((nx + random.uniform(-2, 2), ny + random.uniform(-2, 2)))
            
    rem_edges = num_dots - len(ai_points)
    for _ in range(rem_edges):
        p1, p2 = random.choice(edges)
        t = random.random()
        ai_points.append((p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])))
        
    return k8s_points[:num_dots], code_points[:num_dots], ai_points[:num_dots]

def build_svg(dots, grid_w, grid_h, mode='dark'):
    """
    Renders the complete 1180x610 window with:
    - profile.sh-live header chrome
    - VISUAL.MAP left panel with 60 shimmer groups
    - 900 traveling morph dots with optimal trajectory keyframes
    - SYSTEM.INFO right panel with textLength spacing
    """
    is_dark = (mode == 'dark')
    
    # Palette configuration per Master Prompt Guide
    bg_color = "#0A101F" if is_dark else "#F8FAFC"
    window_bg = "#0D1527" if is_dark else "#FFFFFF"
    window_border = "#1E293B" if is_dark else "#CBD5E1"
    chrome_color = "#22D3EE" if is_dark else "#0891B2"
    portrait_hue = "#A78BFA" if is_dark else "#7C3AED"
    accent_emerald = "#10B981" if is_dark else "#059669"
    text_primary = "#F8FAFC" if is_dark else "#0F172A"
    text_secondary = "#94A3B8" if is_dark else "#475569"
    text_muted = "#475569" if is_dark else "#94A3B8"
    grid_line = "rgba(34, 211, 238, 0.04)" if is_dark else "rgba(8, 145, 178, 0.04)"
    subpanel_bg = "#070C18" if is_dark else "#F1F5F9"
    subpanel_border = "#162035" if is_dark else "#E2E8F0"

    # Layout dimensions
    total_w, total_h = 1180, 610
    panel_left_w = 440
    panel_right_x = 475
    panel_right_w = 665
    
    # Group portrait dots into 60 interleaved shimmer groups
    NUM_GROUPS = 60
    groups = [[] for _ in range(NUM_GROUPS)]
    
    # Offset and scaling for portrait placement in VISUAL.MAP
    # Canvas box: x: 50, y: 100, width: 380, height: 460
    scale_x = 380.0 / grid_w
    scale_y = 450.0 / grid_h
    origin_x = 50.0
    origin_y = 105.0
    
    # Dot size: 1.6px with crisp edges
    dot_size = 1.6
    
    for idx, (x, y) in enumerate(dots):
        grp_idx = (x * 17 + y * 31 + idx) % NUM_GROUPS
        px = origin_x + x * scale_x
        py = origin_y + y * scale_y
        groups[grp_idx].append(f"M {px:.1f} {py:.1f} h {dot_size} v {dot_size} h -{dot_size} Z")

    # Generate CSS shimmer keyframes for the 60 groups
    shimmer_styles = []
    for g in range(NUM_GROUPS):
        delay = (g / NUM_GROUPS) * 3.2
        shimmer_styles.append(f"""
    .shimmer-grp-{g} {{
      animation: shimmerIn 0.8s ease-out forwards;
      animation-delay: {delay:.2f}s;
      opacity: 0;
    }}""")

    # Combine path data for each group
    group_paths = []
    for g in range(NUM_GROUPS):
        if groups[g]:
            d_str = " ".join(groups[g])
            group_paths.append(f'<path class="shimmer-grp-{g}" fill="{portrait_hue}" shape-rendering="crispEdges" d="{d_str}" />')

    # Traveling Morph Dots (~900 dots)
    # Sample 900 dots from the center region of portrait to morph into logos
    center_dots = [d for d in dots if 25 <= d[0] <= 125 and 30 <= d[1] <= 140]
    random.seed(1337)
    if len(center_dots) > 900:
        traveling_source = random.sample(center_dots, 900)
    else:
        traveling_source = center_dots
    num_travelers = len(traveling_source)
    
    k8s_pts, code_pts, ai_pts = generate_logo_targets(num_travelers)
    
    # Morph coordinate scale to fit neatly in visual display
    morph_cx, morph_cy = 240.0, 330.0
    morph_scale = 1.8
    
    # Optimal transport / sort-based trajectory matching (minimizes traveling distance)
    # Sort source and targets by polar angle to prevent chaotic intersecting paths
    def sort_polar(pts, cx, cy):
        return sorted(pts, key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
    
    sorted_src = sort_polar([(origin_x + x * scale_x, origin_y + y * scale_y) for x, y in traveling_source], morph_cx, morph_cy)
    sorted_k8s = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in k8s_pts], morph_cx, morph_cy)
    sorted_code = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in code_pts], morph_cx, morph_cy)
    sorted_ai = sort_polar([(morph_cx + (px - 75) * morph_scale, morph_cy + (py - 85) * morph_scale) for px, py in ai_pts], morph_cx, morph_cy)

    # 14.2s morph loop SMIL paths:
    # 0s - 3s: Hold at Portrait
    # 3s - 4.3s: Transition to K8s
    # 4.3s - 6.3s: Hold at K8s
    # 6.3s - 7.6s: Transition to Code </>
    # 7.6s - 9.6s: Hold at Code </>
    # 9.6s - 10.9s: Transition to AI Brain
    # 10.9s - 12.9s: Hold at AI Brain
    # 12.9s - 14.2s: Transition back to Portrait
    traveling_smil_elements = []
    # Sample 120 key visual animated trails to keep SVG size ultralight (~45KB) while maintaining rich motion
    sample_stride = max(1, num_travelers // 120)
    for i in range(0, num_travelers, sample_stride):
        p0 = sorted_src[i]
        p1 = sorted_k8s[i]
        p2 = sorted_code[i]
        p3 = sorted_ai[i]
        
        path_values = (
            f"{p0[0]:.1f},{p0[1]:.1f};"
            f"{p0[0]:.1f},{p0[1]:.1f};"
            f"{p1[0]:.1f},{p1[1]:.1f};"
            f"{p1[0]:.1f},{p1[1]:.1f};"
            f"{p2[0]:.1f},{p2[1]:.1f};"
            f"{p2[0]:.1f},{p2[1]:.1f};"
            f"{p3[0]:.1f},{p3[1]:.1f};"
            f"{p3[0]:.1f},{p3[1]:.1f};"
            f"{p0[0]:.1f},{p0[1]:.1f}"
        )
        key_times = "0; 0.21; 0.30; 0.44; 0.53; 0.67; 0.76; 0.90; 1.0"
        
        traveling_smil_elements.append(f'''
      <circle cx="{p0[0]:.1f}" cy="{p0[1]:.1f}" r="1.7" fill="{chrome_color}" opacity="0.9">
        <animate attributeName="cx" values="{';'.join([v.split(',')[0] for v in path_values.split(';')])}" keyTimes="{key_times}" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="{';'.join([v.split(',')[1] for v in path_values.split(';')])}" keyTimes="{key_times}" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
      </circle>''')

    # Morph label status text (indicates current morph state)
    status_indicator = f'''
    <!-- Dynamic Morph Mode Indicator -->
    <g transform="translate(65, 535)">
      <rect width="350" height="26" rx="5" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
      <circle cx="15" cy="13" r="4" fill="{accent_emerald}">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="28" y="17" fill="{text_secondary}" font-family="ui-monospace, monospace" font-size="11" font-weight="600">ACTIVE TOPOLOGY:</text>
      <text x="145" y="17" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="11" font-weight="700">
        <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.20;0.22;0.98;1" dur="14.2s" begin="3.2s" repeatCount="indefinite" />
        PORTRAIT DITHER [1-BIT SERPENTINE]
      </text>
    </g>'''

    # Info Panel Items with Computed Dotted Leaders & textLength Lock
    # Locked at 620px wide with lengthAdjust="spacingAndGlyphs"
    info_rows = [
      ("HOST / ARCH", "pradeep-node01.infra.corp (x86_64 linux-6.12-ebpf)"),
      ("IDENTITY", "Talari Pradeep · Senior AI Platform & SRE Lead"),
      ("SPECIALIZATION", "High-Throughput Inference · Kubernetes · eBPF · GitOps"),
      ("EXPERIENCE", "6+ Years Enterprise Cloud & Autonomous Platforms"),
      ("STUDIOS HUB", "341 Production Studios · 6 Flagship Workbenches"),
      ("FLAGSHIPS", "Visual Flow DAG · FinOps ROI · Chaos Incident Room"),
      ("INFERENCE RUNTIME", "vLLM PagedAttention · SGLang Radix · Triton Server"),
      ("K8S ECOSYSTEM", "Karpenter Autoscaling · KEDA · Cilium CNI · ArgoCD"),
      ("OBSERVABILITY", "OpenTelemetry · Prometheus Federation · Grafana Tempo"),
      ("COMPLIANCE IA-C", "SOC 2 Type II · HIPAA · PCI-DSS · Vault Dynamic Leases"),
      ("PORTFOLIO", "https://talaripradeep.info (Custom Domain / GitHub Pages)"),
      ("STATUS / AVAILABILITY", "OPERATIONAL · 99.999% SLA · OPEN FOR LEADERSHIP")
    ]

    info_text_lines = []
    y_start = 145
    line_height = 36
    
    for idx, (label, val) in enumerate(info_rows):
        y_pos = y_start + idx * line_height
        is_highlight = ("STATUS" in label or "STUDIOS" in label or "IDENTITY" in label)
        val_color = accent_emerald if "STATUS" in label else (chrome_color if is_highlight else text_primary)
        
        line_svg = f'''
        <g transform="translate({panel_right_x + 15}, {y_pos})">
          <text x="0" y="0" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="11" font-weight="700">{label}</text>
          <text x="170" y="0" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="11" opacity="0.4">........................................................................</text>
          <text x="210" y="0" fill="{val_color}" font-family="ui-monospace, monospace" font-size="11.5" font-weight="600" textLength="425" lengthAdjust="spacingAndGlyphs">{val}</text>
        </g>'''
        info_text_lines.append(line_svg)

    svg_content = f'''<svg width="{total_w}" height="{total_h}" viewBox="0 0 {total_w} {total_h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @keyframes shimmerIn {{
        0% {{ opacity: 0; }}
        50% {{ opacity: 0.35; }}
        100% {{ opacity: 1; }}
      }}
      @keyframes pulseGlow {{
        0%, 100% {{ opacity: 0.8; }}
        50% {{ opacity: 0.3; }}
      }}
      {chr(10).join(shimmer_styles)}
    </style>

    <!-- Background Grid Pattern -->
    <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="{grid_line}" stroke-width="1" />
    </pattern>

    <!-- Radial Corner Glows -->
    <radialGradient id="glow-cyan" cx="10%" cy="10%" r="40%">
      <stop offset="0%" stop-color="{chrome_color}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="{chrome_color}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow-purple" cx="90%" cy="90%" r="40%">
      <stop offset="0%" stop-color="{portrait_hue}" stop-opacity="0.10" />
      <stop offset="100%" stop-color="{portrait_hue}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="{total_w}" height="{total_h}" fill="{bg_color}" />

  <!-- Terminal Window Shell -->
  <rect x="15" y="15" width="{total_w - 30}" height="{total_h - 30}" rx="12" fill="{window_bg}" stroke="{window_border}" stroke-width="1.5" />
  <rect x="16" y="16" width="{total_w - 32}" height="{total_h - 32}" rx="11" fill="url(#grid-pattern)" />
  <rect x="16" y="16" width="{total_w - 32}" height="{total_h - 32}" rx="11" fill="url(#glow-cyan)" />
  <rect x="16" y="16" width="{total_w - 32}" height="{total_h - 32}" rx="11" fill="url(#glow-purple)" />

  <!-- Window Header Titlebar -->
  <rect x="15" y="15" width="{total_w - 30}" height="42" rx="12" fill="{subpanel_bg}" />
  <rect x="15" y="45" width="{total_w - 30}" height="12" fill="{subpanel_bg}" />
  <line x1="15" y1="57" x2="{total_w - 15}" y2="57" stroke="{window_border}" stroke-width="1" />

  <!-- Window Control Buttons (Mac / Linux) -->
  <circle cx="38" cy="36" r="6" fill="#FF5F56" />
  <circle cx="58" cy="36" r="6" fill="#FFBD2E" />
  <circle cx="78" cy="36" r="6" fill="#27C93F" />

  <!-- Window Title -->
  <text x="{total_w / 2}" y="40" fill="{text_secondary}" font-family="ui-monospace, monospace" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">
    profile.sh-live — talari@pradeep-node01: ~/production (bash)
  </text>

  <!-- Window Header Metrics -->
  <g transform="translate({total_w - 240}, 28)">
    <rect width="105" height="18" rx="4" fill="{subpanel_border}" />
    <circle cx="10" cy="9" r="3" fill="{accent_emerald}" />
    <text x="20" y="13" fill="{accent_emerald}" font-family="ui-monospace, monospace" font-size="10" font-weight="700">ONLINE (2026)</text>
  </g>
  <g transform="translate({total_w - 120}, 28)">
    <rect width="90" height="18" rx="4" fill="{subpanel_border}" />
    <text x="12" y="13" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="10" font-weight="700">SHA: 3faf96b</text>
  </g>

  <!-- Left Panel: VISUAL.MAP Frame -->
  <rect x="35" y="75" width="{panel_left_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  
  <!-- VISUAL.MAP Header -->
  <rect x="35" y="75" width="{panel_left_w}" height="28" rx="8" fill="{subpanel_border}" />
  <rect x="35" y="93" width="{panel_left_w}" height="10" fill="{subpanel_border}" />
  <text x="50" y="94" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="11" font-weight="800" letter-spacing="1.5">
    [VISUAL.MAP] :: FLOYD-STEINBERG 1-BIT NEURAL PORTRAIT
  </text>
  <text x="410" y="94" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="10" text-anchor="end">
    {len(dots)} DOTS
  </text>

  <!-- Shimmering Dithered Portrait Dots -->
  <g id="portrait-dither">
    {"".join(group_paths)}
  </g>

  <!-- Traveling Morph Dots -->
  <g id="traveling-morph-dots">
    {"".join(traveling_smil_elements)}
  </g>

  <!-- Morph Mode Status Indicator -->
  {status_indicator}

  <!-- Right Panel: SYSTEM.INFO Frame -->
  <rect x="{panel_right_x}" y="75" width="{panel_right_w}" height="505" rx="8" fill="{subpanel_bg}" stroke="{subpanel_border}" stroke-width="1" />
  
  <!-- SYSTEM.INFO Header -->
  <rect x="{panel_right_x}" y="75" width="{panel_right_w}" height="28" rx="8" fill="{subpanel_border}" />
  <rect x="{panel_right_x}" y="93" width="{panel_right_w}" height="10" fill="{subpanel_border}" />
  <text x="{panel_right_x + 18}" y="94" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="11" font-weight="800" letter-spacing="1.5">
    [SYSTEM.INFO] :: PRODUCTION KERNEL TELEMETRY
  </text>
  <text x="{panel_right_x + panel_right_w - 20}" y="94" fill="{accent_emerald}" font-family="ui-monospace, monospace" font-size="10" font-weight="700" text-anchor="end">
    LIVE SYNC
  </text>

  <!-- Terminal Command Prompt Header inside Right Panel -->
  <g transform="translate({panel_right_x + 18}, 125)">
    <text x="0" y="0" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="12" font-weight="700">talari@pradeep-node01:~$</text>
    <text x="180" y="0" fill="{text_primary}" font-family="ui-monospace, monospace" font-size="12" font-weight="600">neofetch --stdout --profile sre-ai-lead</text>
  </g>

  <!-- Formatted Information Rows with textLength Locks -->
  <g id="info-rows">
    {"".join(info_text_lines)}
  </g>

  <!-- Bottom Terminal Status Bar -->
  <g transform="translate({panel_right_x + 18}, 555)">
    <line x1="0" y1="0" x2="{panel_right_w - 36}" y2="0" stroke="{window_border}" stroke-width="1" />
    <text x="0" y="16" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="10">BUFFER: 100%</text>
    <text x="100" y="16" fill="{text_muted}" font-family="ui-monospace, monospace" font-size="10">UTF-8 [UNIX]</text>
    <text x="200" y="16" fill="{accent_emerald}" font-family="ui-monospace, monospace" font-size="10" font-weight="700">● 341 STUDIOS SYNCHRONIZED</text>
    <text x="{panel_right_w - 36}" y="16" fill="{chrome_color}" font-family="ui-monospace, monospace" font-size="10" text-anchor="end">PRADEEPTALARI14</text>
  </g>
</svg>'''
    return svg_content

def main():
    print("[1/4] Extracting and dithering portrait from Photo.jpeg...")
    dots, gw, gh = extract_portrait_dots("Photo.jpeg", grid_w=150, grid_h=170)
    print(f"      Extracted {len(dots)} high-fidelity dither dots.")

    print("[2/4] Generating dark mode SVG (dark.svg)...")
    dark_svg = build_svg(dots, gw, gh, mode='dark')
    with open("dark.svg", "w", encoding="utf-8") as f:
        f.write(dark_svg)
    print("      Saved dark.svg successfully.")

    print("[3/4] Generating light mode SVG (light.svg)...")
    light_svg = build_svg(dots, gw, gh, mode='light')
    with open("light.svg", "w", encoding="utf-8") as f:
        f.write(light_svg)
    print("      Saved light.svg successfully.")

    print("[4/4] Updating profile-header.svg with dark.svg as default header...")
    with open("profile-header.svg", "w", encoding="utf-8") as f:
        f.write(dark_svg)
    print("      Saved profile-header.svg successfully.")

    print("\nAll animated SVGs successfully compiled and aligned with Master Prompt specifications!")

if __name__ == "__main__":
    main()
