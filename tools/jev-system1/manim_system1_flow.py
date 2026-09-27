#!/usr/bin/env python3
"""
🎬 3Blue1Brown / Manim Programmatic Video Animation
TypeSafe AI Jev: Dual-Process Cognitive Architecture & System 1 Reflex Engine

Render Commands:
  - Fast 480p preview:    manim -pql manim_system1_flow.py JevDualProcessArchitectureScene
  - Full HD 1080p 60fps:  manim -pqh manim_system1_flow.py JevDualProcessArchitectureScene
  - Ultra HD 4K 60fps:    manim -pqk manim_system1_flow.py JevDualProcessArchitectureScene
  - Transparent GIF:      manim -s -o preview.png manim_system1_flow.py JevDualProcessArchitectureScene
"""

from manim import *

class JevDualProcessArchitectureScene(Scene):
    def construct(self):
        # ── 1. Color Palette & Canvas Setup ──
        BG_COLOR = "#0B0F19"
        ORANGE_NEON = "#EA580C"
        AMBER_NEON = "#F59E0B"
        GREEN_NEON = "#10B981"
        PURPLE_NEON = "#8B5CF6"
        CYAN_NEON = "#0EA5E9"
        SLATE_CARD = "#1E293B"
        BORDER_COLOR = "#334155"

        self.camera.background_color = BG_COLOR

        # ── 2. Title Header ──
        title = Text("TypeSafe AI Jev: System 1 Dual-Process Architecture", font_size=28, weight=BOLD, color=WHITE)
        title.to_edge(UP, buff=0.4)
        subtitle = Text("Sub-100ms Non-Autoregressive Decision Engine (RLCD)", font_size=15, color=CYAN_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)

        self.play(FadeIn(title, shift=DOWN*0.3), FadeIn(subtitle, shift=UP*0.2), run_time=1.0)
        self.wait(0.5)

        # ── 3. High-Velocity Input Stream (Left) ──
        input_box = RoundedRectangle(corner_radius=0.15, width=2.4, height=3.8, fill_color=SLATE_CARD, fill_opacity=0.85, stroke_color=CYAN_NEON, stroke_width=2)
        input_box.shift(LEFT * 4.8 + DOWN * 0.4)
        input_title = Text("High-Velocity\nInput Stream", font_size=14, weight=BOLD, color=CYAN_NEON, line_spacing=0.8).move_to(input_box.get_top() + DOWN * 0.5)
        
        events = VGroup(
            Text("• K8s OOM Events", font_size=11, color=LIGHT_GRAY),
            Text("• User Prompts", font_size=11, color=LIGHT_GRAY),
            Text("• Kafka Lag Spikes", font_size=11, color=LIGHT_GRAY),
            Text("• REST Webhooks", font_size=11, color=LIGHT_GRAY)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.25).next_to(input_title, DOWN, buff=0.35)

        input_group = VGroup(input_box, input_title, events)

        # ── 4. TypeSafe AI Jev System 1 Core (Center-Left) ──
        jev_box = RoundedRectangle(corner_radius=0.2, width=3.0, height=4.2, fill_color=SLATE_CARD, fill_opacity=0.95, stroke_color=ORANGE_NEON, stroke_width=3)
        jev_box.shift(LEFT * 1.5 + DOWN * 0.4)
        
        jev_title = Text("TypeSafe AI Jev", font_size=17, weight=BOLD, color=ORANGE_NEON).move_to(jev_box.get_top() + DOWN * 0.45)
        jev_sub = Text("System 1 Non-Autoregressive", font_size=10, color=AMBER_NEON).next_to(jev_title, DOWN, buff=0.08)

        jev_pills = VGroup(
            RoundedRectangle(corner_radius=0.1, width=2.6, height=0.45, fill_color="#2D150B", fill_opacity=0.8, stroke_color=ORANGE_NEON, stroke_width=1),
            RoundedRectangle(corner_radius=0.1, width=2.6, height=0.45, fill_color="#2D150B", fill_opacity=0.8, stroke_color=AMBER_NEON, stroke_width=1),
            RoundedRectangle(corner_radius=0.1, width=2.6, height=0.45, fill_color="#2D150B", fill_opacity=0.8, stroke_color=GREEN_NEON, stroke_width=1),
            RoundedRectangle(corner_radius=0.1, width=2.6, height=0.45, fill_color="#2D150B", fill_opacity=0.8, stroke_color=CYAN_NEON, stroke_width=1),
        ).arrange(DOWN, buff=0.15).next_to(jev_sub, DOWN, buff=0.2)

        pill_text = VGroup(
            Text("⚡ 70ms - 150ms P99", font_size=10, weight=BOLD, color=WHITE).move_to(jev_pills[0]),
            Text("🎯 RLCD Calibrated", font_size=10, weight=BOLD, color=WHITE).move_to(jev_pills[1]),
            Text("📜 Pydantic & Zod Strict", font_size=10, weight=BOLD, color=WHITE).move_to(jev_pills[2]),
            Text("💵 $0.000078 / decision", font_size=10, weight=BOLD, color=CYAN_NEON).move_to(jev_pills[3])
        )

        jev_group = VGroup(jev_box, jev_title, jev_sub, jev_pills, pill_text)

        # ── 5. Confidence Decision Gate (Diamond) ──
        gate = Polygon(
            [-0.7, 0, 0], [0, 0.7, 0], [0.7, 0, 0], [0, -0.7, 0],
            fill_color=SLATE_CARD, fill_opacity=0.95, stroke_color=AMBER_NEON, stroke_width=2.5
        ).shift(RIGHT * 1.5 + DOWN * 0.4)

        gate_text = Text("Calibrated\nScore\n>= 0.85?", font_size=10, weight=BOLD, color=WHITE, line_spacing=0.7).move_to(gate)
        gate_group = VGroup(gate, gate_text)

        # ── 6. Execution Branches ──
        # Top: Fast Reflex Path (Green)
        fast_box = RoundedRectangle(corner_radius=0.15, width=2.9, height=1.9, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=GREEN_NEON, stroke_width=2.5)
        fast_box.shift(RIGHT * 4.6 + UP * 0.8)
        fast_title = Text("⚡ Fast Deterministic Path", font_size=12, weight=BOLD, color=GREEN_NEON).move_to(fast_box.get_top() + DOWN * 0.35)
        fast_desc = Text("Microservices, APIs, SRE Runbooks\nZero LLM Tokens · 78ms Latency", font_size=9, color=LIGHT_GRAY, line_spacing=0.8).next_to(fast_title, DOWN, buff=0.15)
        fast_group = VGroup(fast_box, fast_title, fast_desc)

        # Bottom: System 2 Deliberative Reasoning (Purple)
        sys2_box = RoundedRectangle(corner_radius=0.15, width=2.9, height=1.9, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=PURPLE_NEON, stroke_width=2.5)
        sys2_box.shift(RIGHT * 4.6 + DOWN * 1.6)
        sys2_title = Text("🧠 System 2 Deliberation", font_size=12, weight=BOLD, color=PURPLE_NEON).move_to(sys2_box.get_top() + DOWN * 0.35)
        sys2_desc = Text("Claude 3.7 Sonnet / GPT-4o\nMulti-Step Reasoning · ~2,500ms", font_size=9, color=LIGHT_GRAY, line_spacing=0.8).next_to(sys2_title, DOWN, buff=0.15)
        sys2_group = VGroup(sys2_box, sys2_title, sys2_desc)

        # ── 7. Connectors & Arrows ──
        arrow1 = Arrow(input_box.get_right(), jev_box.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=3, max_tip_length_to_length_ratio=0.2)
        arrow2 = Arrow(jev_box.get_right(), gate.get_left(), color=ORANGE_NEON, buff=0.1, stroke_width=3, max_tip_length_to_length_ratio=0.2)

        # Branch lines
        arrow_yes = Arrow(gate.get_top(), fast_box.get_left(), color=GREEN_NEON, path_arc=-0.4, buff=0.1, stroke_width=3)
        yes_label = Text("YES (>= 0.85)", font_size=10, weight=BOLD, color=GREEN_NEON).next_to(arrow_yes, UP, buff=0.05).shift(LEFT*0.3)

        arrow_no = Arrow(gate.get_bottom(), sys2_box.get_left(), color=PURPLE_NEON, path_arc=0.4, buff=0.1, stroke_width=3)
        no_label = Text("NO (< 0.85)", font_size=10, weight=BOLD, color=PURPLE_NEON).next_to(arrow_no, DOWN, buff=0.05).shift(LEFT*0.3)

        # ── 8. Draw Architecture Components ──
        self.play(
            FadeIn(input_group, shift=RIGHT*0.3),
            FadeIn(jev_group, shift=UP*0.3),
            GrowArrow(arrow1),
            run_time=1.2
        )
        self.play(
            GrowArrow(arrow2),
            FadeIn(gate_group, scale=0.8),
            run_time=0.8
        )
        self.play(
            GrowArrow(arrow_yes),
            FadeIn(yes_label),
            FadeIn(fast_group, shift=LEFT*0.3),
            GrowArrow(arrow_no),
            FadeIn(no_label),
            FadeIn(sys2_group, shift=LEFT*0.3),
            run_time=1.2
        )
        self.wait(0.5)

        # ── 9. Interactive Particle Simulation 1: Fast Reflex (YES) ──
        packet1 = Dot(radius=0.12, color=GREEN_NEON)
        packet1.move_to(input_box.get_center())
        p1_label = Text("Reflex Event", font_size=9, weight=BOLD, color=GREEN_NEON).next_to(packet1, UP, buff=0.1)

        self.play(FadeIn(packet1), FadeIn(p1_label), run_time=0.4)
        self.play(
            packet1.animate.move_to(jev_box.get_center()),
            p1_label.animate.move_to(jev_box.get_center() + UP*0.6),
            run_time=0.8,
            rate_func=linear
        )
        
        # Jev processing pulse
        glow = jev_box.copy().set_stroke(color=WHITE, width=5)
        self.play(Transform(jev_box, glow), Flash(jev_box, color=ORANGE_NEON, flash_radius=1.8), run_time=0.5)
        self.play(jev_box.animate.set_stroke(color=ORANGE_NEON, width=3), run_time=0.3)

        # Travel to gate & route to fast path
        self.play(
            packet1.animate.move_to(gate.get_center()),
            p1_label.animate.move_to(gate.get_center() + UP*0.8),
            run_time=0.6,
            rate_func=linear
        )
        
        conf_badge = Text("Confidence: 0.965", font_size=11, weight=BOLD, color=GREEN_NEON).next_to(gate, UP, buff=0.3)
        self.play(FadeIn(conf_badge, scale=1.2), Flash(gate, color=GREEN_NEON), run_time=0.5)
        
        self.play(
            MoveAlongPath(packet1, arrow_yes),
            FadeOut(p1_label),
            run_time=0.7,
            rate_func=linear
        )
        self.play(Flash(fast_box, color=GREEN_NEON, flash_radius=1.5), FadeOut(packet1), FadeOut(conf_badge), run_time=0.6)
        self.wait(0.4)

        # ── 10. Interactive Particle Simulation 2: Ambiguous Escalation (NO) ──
        packet2 = Dot(radius=0.12, color=PURPLE_NEON)
        packet2.move_to(input_box.get_center())
        p2_label = Text("Ambiguous Event", font_size=9, weight=BOLD, color=PURPLE_NEON).next_to(packet2, UP, buff=0.1)

        self.play(FadeIn(packet2), FadeIn(p2_label), run_time=0.4)
        self.play(
            packet2.animate.move_to(jev_box.get_center()),
            p2_label.animate.move_to(jev_box.get_center() + UP*0.6),
            run_time=0.8,
            rate_func=linear
        )
        self.play(Flash(jev_box, color=AMBER_NEON, flash_radius=1.5), run_time=0.4)
        
        self.play(
            packet2.animate.move_to(gate.get_center()),
            p2_label.animate.move_to(gate.get_center() + DOWN*0.8),
            run_time=0.6,
            rate_func=linear
        )
        
        conf_badge2 = Text("Confidence: 0.542", font_size=11, weight=BOLD, color=PURPLE_NEON).next_to(gate, DOWN, buff=0.3)
        self.play(FadeIn(conf_badge2, scale=1.2), Flash(gate, color=PURPLE_NEON), run_time=0.5)
        
        self.play(
            MoveAlongPath(packet2, arrow_no),
            FadeOut(p2_label),
            run_time=0.7,
            rate_func=linear
        )
        self.play(Flash(sys2_box, color=PURPLE_NEON, flash_radius=1.5), FadeOut(packet2), FadeOut(conf_badge2), run_time=0.6)
        self.wait(0.5)

        # ── 11. FinOps & Latency ROI Banner ──
        roi_banner = RoundedRectangle(corner_radius=0.15, width=9.6, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=AMBER_NEON, stroke_width=1.5)
        roi_banner.to_edge(DOWN, buff=0.25)
        roi_text = Text("⚡ 36x Latency Reduction (78ms vs 2,840ms)   |   💰 99.38% FinOps Cost Savings ($0.000078 vs $0.0125)", font_size=11, weight=BOLD, color=WHITE).move_to(roi_banner)

        self.play(FadeIn(roi_banner, shift=UP*0.3), FadeIn(roi_text, shift=UP*0.3), run_time=0.8)
        self.wait(2.0)
