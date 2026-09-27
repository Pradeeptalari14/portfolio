#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
Vectorless RAG & Sparse Search Studio
Render with: manim -pqh manim_flow.py VectorlessRagArchitectureScene
"""
from manim import *

class VectorlessRagArchitectureScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        # Colors
        CYAN_NEON = "#00F0FF"
        AMBER_NEON = "#F59E0B"
        EMERALD_NEON = "#10B981"
        BLUE_NEON = "#3B82F6"
        SLATE_CARD = "#131C31"

        # Title Header
        title = Text("Vectorless RAG & Sparse Hybrid Search", font_size=24, weight=BOLD, color=WHITE)
        title.to_edge(UP, buff=0.4)
        subtitle = Text("BM25 Tokenizer  ·  PostgreSQL GIN FTS  ·  Reciprocal Rank Fusion (RRF)", font_size=12, color=CYAN_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)

        # 4 Blocks
        box1 = RoundedRectangle(corner_radius=0.15, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.8 + DOWN * 0.4)
        t1 = Text("1. Multi-Source\n\nEnterprise Docs\nSQL Records\nKnowledge Wiki", font_size=11, color=WHITE, line_spacing=0.8).move_to(box1)
        g1 = VGroup(box1, t1)

        box2 = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=AMBER_NEON, stroke_width=2.5).shift(LEFT * 1.6 + DOWN * 0.4)
        t2 = Text("2. Tokenizer & BM25\n\nStopwords Filter\nTerm Frequency Sat\nk1=1.5, b=0.75", font_size=11, color=WHITE, line_spacing=0.8).move_to(box2)
        g2 = VGroup(box2, t2)

        box3 = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=BLUE_NEON, stroke_width=2.5).shift(RIGHT * 1.6 + DOWN * 0.4)
        t3 = Text("3. Relational FTS\n\nPostgres tsvector\nGIN Indexing\nts_rank scoring", font_size=11, color=WHITE, line_spacing=0.8).move_to(box3)
        g3 = VGroup(box3, t3)

        box4 = RoundedRectangle(corner_radius=0.15, width=2.6, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(RIGHT * 4.8 + DOWN * 0.4)
        t4 = Text("4. RRF Ranker\n\nZero Embedding Cost\n< 5ms Latency\nExact Lexical Match", font_size=11, color=WHITE, line_spacing=0.8).move_to(box4)
        g4 = VGroup(box4, t4)

        # Arrows
        a1 = Arrow(box1.get_right(), box2.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=3)
        a2 = Arrow(box2.get_right(), box3.get_left(), color=AMBER_NEON, buff=0.1, stroke_width=3)
        a3 = Arrow(box3.get_right(), box4.get_left(), color=BLUE_NEON, buff=0.1, stroke_width=3)

        self.play(FadeIn(g1), GrowArrow(a1), FadeIn(g2), GrowArrow(a2), FadeIn(g3), GrowArrow(a3), FadeIn(g4), run_time=1.8)

        # Particle Animation
        packet = Dot(color=CYAN_NEON, radius=0.12).move_to(box1.get_center())
        self.play(FadeIn(packet), packet.animate.move_to(box2.get_center()), run_time=0.6)
        self.play(Flash(box2, color=AMBER_NEON), packet.animate.move_to(box3.get_center()), run_time=0.6)
        self.play(Flash(box3, color=BLUE_NEON), packet.animate.move_to(box4.get_center()), run_time=0.6)
        self.play(Flash(box4, color=EMERALD_NEON, flash_radius=1.5), FadeOut(packet), run_time=0.5)

        # ROI Banner
        hud = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=EMERALD_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)
        hud_text = Text("Keyword Recall: 99.1%   |   Search Latency: 4.8ms   |   Embedding Cost: $0.00", font_size=11, weight=BOLD, color=WHITE).move_to(hud)
        self.play(FadeIn(hud), FadeIn(hud_text), run_time=0.8)
        self.wait(2.0)
