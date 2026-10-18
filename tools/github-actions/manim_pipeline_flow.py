#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
Enterprise CI/CD & GitOps Progressive Delivery Flow
Render with: manim -pqh manim_pipeline_flow.py CICDPipelineFlowScene
Or execute via Manim MCP server for real-time visual playback.
"""
from manim import *

class CICDPipelineFlowScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        # Curated High-Tech Cyberpunk & DevOps Color Palette
        CYAN_NEON = "#00F0FF"
        PURPLE_NEON = "#A855F7"
        EMERALD_NEON = "#10B981"
        AMBER_NEON = "#F59E0B"
        ROSE_NEON = "#F43F5E"
        SLATE_CARD = "#131C31"
        WHITE_TEXT = "#F8FAFC"
        MUTED_TEXT = "#94A3B8"

        # ── 1. Header & Title ──
        title = Text("Enterprise CI/CD Pipeline & Automated Promotion Flow", font_size=22, weight=BOLD, color=WHITE_TEXT).to_edge(UP, buff=0.35)
        subtitle = Text("Learn → Lab → WorkFlow Automation  ·  SLSA Level 3 Provenance & Zero-Secret CI", font_size=11, color=CYAN_NEON)
        subtitle.next_to(title, DOWN, buff=0.12)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=0.8)

        # ── 2. Stage Architecture Blocks ──
        # Stage 1: Commit & Webhook
        stage1_box = RoundedRectangle(corner_radius=0.12, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.0).shift(LEFT * 5.0 + DOWN * 0.3)
        s1_title = Text("01. Git Trigger", font_size=11, weight=BOLD, color=CYAN_NEON).move_to(stage1_box.get_top() + DOWN * 0.35)
        s1_desc = Text("Signed Commit\nBranch Protection\nWebhook Dispatch", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(s1_title, DOWN, buff=0.2)
        s1_group = VGroup(stage1_box, s1_title, s1_desc)

        # Stage 2: Test & Cache
        stage2_box = RoundedRectangle(corner_radius=0.12, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=PURPLE_NEON, stroke_width=2.0).shift(LEFT * 2.5 + DOWN * 0.3)
        s2_title = Text("02. Test & Build", font_size=11, weight=BOLD, color=PURPLE_NEON).move_to(stage2_box.get_top() + DOWN * 0.35)
        s2_desc = Text("Lockfile Cache\nParallel pytest\nCoverage Gate", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(s2_title, DOWN, buff=0.2)
        s2_group = VGroup(stage2_box, s2_title, s2_desc)

        # Stage 3: Security & SCA
        stage3_box = RoundedRectangle(corner_radius=0.12, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=AMBER_NEON, stroke_width=2.0).shift(DOWN * 0.3)
        s3_title = Text("03. Scan & SAST", font_size=11, weight=BOLD, color=AMBER_NEON).move_to(stage3_box.get_top() + DOWN * 0.35)
        s3_desc = Text("Trivy Vulnerabilities\nSecret Detection\nCycloneDX SBOM", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(s3_title, DOWN, buff=0.2)
        s3_group = VGroup(stage3_box, s3_title, s3_desc)

        # Stage 4: Package & Provenance
        stage4_box = RoundedRectangle(corner_radius=0.12, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.0).shift(RIGHT * 2.5 + DOWN * 0.3)
        s4_title = Text("04. Sign & Package", font_size=11, weight=BOLD, color=EMERALD_NEON).move_to(stage4_box.get_top() + DOWN * 0.35)
        s4_desc = Text("OCI Multi-Arch\nCosign Signature\nSLSA Attestation", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(s4_title, DOWN, buff=0.2)
        s4_group = VGroup(stage4_box, s4_title, s4_desc)

        # Stage 5: Progressive Rollout Gate
        stage5_box = RoundedRectangle(corner_radius=0.12, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.0).shift(RIGHT * 5.0 + DOWN * 0.3)
        s5_title = Text("05. Canary Deploy", font_size=11, weight=BOLD, color=CYAN_NEON).move_to(stage5_box.get_top() + DOWN * 0.35)
        s5_desc = Text("ArgoCD Sync\nSLO Error Gate\n10% → 100% Traffic", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(s5_title, DOWN, buff=0.2)
        s5_group = VGroup(stage5_box, s5_title, s5_desc)

        # Directed Flow Connectors
        arr12 = Arrow(stage1_box.get_right(), stage2_box.get_left(), color=CYAN_NEON, buff=0.08, stroke_width=2.5)
        arr23 = Arrow(stage2_box.get_right(), stage3_box.get_left(), color=PURPLE_NEON, buff=0.08, stroke_width=2.5)
        arr34 = Arrow(stage3_box.get_right(), stage4_box.get_left(), color=AMBER_NEON, buff=0.08, stroke_width=2.5)
        arr45 = Arrow(stage4_box.get_right(), stage5_box.get_left(), color=EMERALD_NEON, buff=0.08, stroke_width=2.5)

        self.play(
            FadeIn(s1_group), GrowArrow(arr12),
            FadeIn(s2_group), GrowArrow(arr23),
            FadeIn(s3_group), GrowArrow(arr34),
            FadeIn(s4_group), GrowArrow(arr45),
            FadeIn(s5_group),
            run_time=1.8
        )

        # ── 3. Dynamic Artifact Transit Particle ──
        # Commit packet travels from Stage 1 through Stage 5
        artifact_dot = Dot(color=CYAN_NEON, radius=0.14).move_to(stage1_box.get_center())
        self.play(FadeIn(artifact_dot), Flash(stage1_box, color=CYAN_NEON, flash_radius=1.2), run_time=0.4)

        # Move to Stage 2: Tests pass
        self.play(MoveAlongPath(artifact_dot, arr12), run_time=0.5)
        self.play(Flash(stage2_box, color=PURPLE_NEON, flash_radius=1.2), artifact_dot.animate.set_color(PURPLE_NEON), run_time=0.4)

        # Move to Stage 3: Scan passes zero-CVE check
        self.play(MoveAlongPath(artifact_dot, arr23), run_time=0.5)
        self.play(Flash(stage3_box, color=AMBER_NEON, flash_radius=1.2), artifact_dot.animate.set_color(AMBER_NEON), run_time=0.4)

        # Move to Stage 4: Signed digest minted
        self.play(MoveAlongPath(artifact_dot, arr34), run_time=0.5)
        self.play(Flash(stage4_box, color=EMERALD_NEON, flash_radius=1.2), artifact_dot.animate.set_color(EMERALD_NEON), run_time=0.4)

        # Move to Stage 5: Canary verified & promoted
        self.play(MoveAlongPath(artifact_dot, arr45), run_time=0.5)
        self.play(Flash(stage5_box, color=CYAN_NEON, flash_radius=1.5), FadeOut(artifact_dot), run_time=0.5)

        # ── 4. Telemetry ROI & DORA Banner ──
        banner = RoundedRectangle(corner_radius=0.12, width=12.2, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=CYAN_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)
        banner_text = Text("🚀 DORA Telemetry: Deployment Frequency: 14/day  |  Lead Time: 11m  |  CFR: 0.2%  |  MTTR: 4m", font_size=10.5, weight=BOLD, color=WHITE_TEXT).move_to(banner)
        self.play(FadeIn(banner), FadeIn(banner_text), run_time=0.8)
        self.wait(2.0)
