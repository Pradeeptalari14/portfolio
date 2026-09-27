#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
DeepSeek-R1 Speculative Decoding & Reasoning Studio
Render with: manim -pqh manim_flow.py DeepSeekSpeculativeDecodingScene
"""
from manim import *

class DeepSeekSpeculativeDecodingScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        # High-Tech Cyberpunk Color Palette
        CYAN_NEON = "#00F0FF"
        PURPLE_NEON = "#A855F7"
        EMERALD_NEON = "#10B981"
        AMBER_NEON = "#F59E0B"
        SLATE_CARD = "#131C31"
        WHITE_TEXT = "#F8FAFC"

        # ── 1. Header ──
        title = Text("DeepSeek-R1 Speculative Decoding Architecture", font_size=24, weight=BOLD, color=WHITE_TEXT).to_edge(UP, buff=0.4)
        subtitle = Text("Draft: Qwen2.5-Coder-1.5B (K=4)  ·  Target: DeepSeek-R1 671B MoE", font_size=12, color=CYAN_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)

        # ── 2. Functional Architecture Blocks ──
        input_box = RoundedRectangle(corner_radius=0.15, width=2.5, height=3.2, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.9 + DOWN * 0.4)
        input_title = Text("Prompt & KV Cache", font_size=11, weight=BOLD, color=CYAN_NEON).move_to(input_box.get_top() + DOWN * 0.4)
        input_desc = Text("Context Manager\nPrefix Caching\nStreaming Pipeline", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(input_title, DOWN, buff=0.2)
        input_group = VGroup(input_box, input_title, input_desc)

        draft_box = RoundedRectangle(corner_radius=0.15, width=3.2, height=1.5, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=PURPLE_NEON, stroke_width=2.5).shift(LEFT * 1.2 + UP * 0.5)
        draft_title = Text("⚡ Small Draft Model", font_size=11, weight=BOLD, color=PURPLE_NEON).move_to(draft_box.get_top() + DOWN * 0.3)
        draft_desc = Text("Drafts K=4 Tokens\n~18ms per token", font_size=9, color=WHITE_TEXT).next_to(draft_title, DOWN, buff=0.15)
        draft_group = VGroup(draft_box, draft_title, draft_desc)

        target_box = RoundedRectangle(corner_radius=0.15, width=3.2, height=1.5, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(LEFT * 1.2 + DOWN * 1.3)
        target_title = Text("🧠 DeepSeek-R1 Target", font_size=11, weight=BOLD, color=EMERALD_NEON).move_to(target_box.get_top() + DOWN * 0.3)
        target_desc = Text("Parallel Batch Verify\nSingle Forward Pass (75ms)", font_size=9, color=WHITE_TEXT).next_to(target_title, DOWN, buff=0.15)
        target_group = VGroup(target_box, target_title, target_desc)

        verify_gate = Polygon(UP * 0.9, RIGHT * 1.1, DOWN * 0.9, LEFT * 1.1, fill_color=SLATE_CARD, fill_opacity=0.95, stroke_color=AMBER_NEON, stroke_width=2.5).shift(RIGHT * 1.9 + DOWN * 0.4)
        verify_text = Text("Acceptance Gate\nα >= 82%?", font_size=10, weight=BOLD, color=WHITE_TEXT, line_spacing=0.8).move_to(verify_gate)
        verify_group = VGroup(verify_gate, verify_text)

        output_box = RoundedRectangle(corner_radius=0.15, width=2.7, height=3.2, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(RIGHT * 4.9 + DOWN * 0.4)
        output_title = Text("🚀 Stream Output", font_size=11, weight=BOLD, color=EMERALD_NEON).move_to(output_box.get_top() + DOWN * 0.4)
        output_desc = Text("3.2x Latency Speedup\n68 Tokens / Sec\nZero Quality Loss", font_size=9, color=WHITE_TEXT, line_spacing=0.8).next_to(output_title, DOWN, buff=0.2)
        output_group = VGroup(output_box, output_title, output_desc)

        # ── 3. Connectors & Directed Arrows ──
        arr_to_draft = Arrow(input_box.get_right() + UP * 0.5, draft_box.get_left(), color=PURPLE_NEON, buff=0.1, stroke_width=2.5)
        arr_to_target = Arrow(input_box.get_right() + DOWN * 0.5, target_box.get_left(), color=EMERALD_NEON, buff=0.1, stroke_width=2.5)
        arr_draft_to_gate = Arrow(draft_box.get_right(), verify_gate.get_top(), color=PURPLE_NEON, path_arc=-0.3, buff=0.1, stroke_width=2.5)
        arr_target_to_gate = Arrow(target_box.get_right(), verify_gate.get_bottom(), color=EMERALD_NEON, path_arc=0.3, buff=0.1, stroke_width=2.5)
        arr_gate_to_out = Arrow(verify_gate.get_right(), output_box.get_left(), color=AMBER_NEON, buff=0.1, stroke_width=3)

        self.play(FadeIn(input_group), GrowArrow(arr_to_draft), FadeIn(draft_group), GrowArrow(arr_to_target), FadeIn(target_group), run_time=1.5)
        self.play(GrowArrow(arr_draft_to_gate), GrowArrow(arr_target_to_gate), FadeIn(verify_group), GrowArrow(arr_gate_to_out), FadeIn(output_group), run_time=1.2)

        # ── 4. Particle Animation: Speculative Draft & Verify ──
        packet = Dot(color=PURPLE_NEON, radius=0.12).move_to(draft_box.get_center())
        self.play(FadeIn(packet), Flash(draft_box, color=PURPLE_NEON), run_time=0.4)
        self.play(MoveAlongPath(packet, arr_draft_to_gate), run_time=0.6)
        self.play(Flash(verify_gate, color=AMBER_NEON), packet.animate.move_to(output_box.get_center()), run_time=0.6)
        self.play(Flash(output_box, color=EMERALD_NEON, flash_radius=1.5), FadeOut(packet), run_time=0.4)

        # ── 5. Telemetry ROI Banner ──
        banner = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=CYAN_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)
        banner_text = Text("⚡ 3.2x Latency Speedup (68 tokens/s)   |   🎯 84.6% Draft Acceptance   |   💰 Zero Token Degradation", font_size=11, weight=BOLD, color=WHITE_TEXT).move_to(banner)
        self.play(FadeIn(banner), FadeIn(banner_text), run_time=0.8)
        self.wait(2.0)
