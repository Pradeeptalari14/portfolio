#!/usr/bin/env python3
"""
3Blue1Brown / Manim Programmatic Video Animation
Knowledge Graph & Entity Extraction Studio (GraphRAG)
Render with: manim -pqh manim_flow.py KnowledgeGraphArchitectureScene
"""
from manim import *

class KnowledgeGraphArchitectureScene(Scene):
    def construct(self):
        self.camera.background_color = "#0B0F19"

        # Colors
        CYAN_NEON = "#00F0FF"
        EMERALD_NEON = "#10B981"
        AMBER_NEON = "#F59E0B"
        PURPLE_NEON = "#A855F7"
        SLATE_CARD = "#131C31"

        # Title Header
        title = Text("Knowledge Graph & Entity Extraction (GraphRAG)", font_size=24, weight=BOLD, color=WHITE)
        title.to_edge(UP, buff=0.4)
        subtitle = Text("Zero-Shot GLiNER Extraction  ·  NetworkX Graph  ·  Neo4j Cypher Constraints", font_size=12, color=CYAN_NEON)
        subtitle.next_to(title, DOWN, buff=0.15)
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)

        # 4 Blocks
        box_ingest = RoundedRectangle(corner_radius=0.15, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.8 + DOWN * 0.4)
        t_ingest = Text("1. Ingestion Queue\n\nSRE Incidents\nTech Docs\nSystem Logs", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_ingest)
        g_ingest = VGroup(box_ingest, t_ingest)

        box_extractor = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(LEFT * 1.6 + DOWN * 0.4)
        t_extractor = Text("2. Zero-Shot NLP\n\nGLiNER / spaCy\nThreshold >= 0.85\nSERVICE / DB\nCONFIG / OUTAGE", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_extractor)
        g_extractor = VGroup(box_extractor, t_extractor)

        box_graph = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=AMBER_NEON, stroke_width=2.5).shift(RIGHT * 1.6 + DOWN * 0.4)
        t_graph = Text("3. Graph Engine\n\nNetworkX DiGraph\nCONNECTS_TO\nUSES_CONFIG\nIMPACTS", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_graph)
        g_graph = VGroup(box_graph, t_graph)

        box_neo4j = RoundedRectangle(corner_radius=0.15, width=2.6, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=PURPLE_NEON, stroke_width=2.5).shift(RIGHT * 4.8 + DOWN * 0.4)
        t_neo4j = Text("4. Graph Storage\n\nNeo4j Constraints\nCypher Merges\nVector + Graph\nHybrid Retrieval", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_neo4j)
        g_neo4j = VGroup(box_neo4j, t_neo4j)

        # Arrows
        a1 = Arrow(box_ingest.get_right(), box_extractor.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=3)
        a2 = Arrow(box_extractor.get_right(), box_graph.get_left(), color=EMERALD_NEON, buff=0.1, stroke_width=3)
        a3 = Arrow(box_graph.get_right(), box_neo4j.get_left(), color=AMBER_NEON, buff=0.1, stroke_width=3)

        self.play(FadeIn(g_ingest), GrowArrow(a1), FadeIn(g_extractor), GrowArrow(a2), FadeIn(g_graph), GrowArrow(a3), FadeIn(g_neo4j), run_time=1.8)

        # Particle Traversal
        dot = Dot(color=CYAN_NEON, radius=0.12).move_to(box_ingest.get_center())
        self.play(FadeIn(dot), dot.animate.move_to(box_extractor.get_center()), run_time=0.6)
        self.play(Flash(box_extractor, color=EMERALD_NEON), dot.animate.move_to(box_graph.get_center()), run_time=0.6)
        self.play(Flash(box_graph, color=AMBER_NEON), dot.animate.move_to(box_neo4j.get_center()), run_time=0.6)
        self.play(Flash(box_neo4j, color=PURPLE_NEON, flash_radius=1.5), FadeOut(dot), run_time=0.5)

        # Telemetry HUD
        hud = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=CYAN_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)
        hud_text = Text("Extraction Accuracy: 98.4%   |   Graph Traversal Latency: 12ms   |   GraphRAG Precision: 96.2%", font_size=11, weight=BOLD, color=WHITE).move_to(hud)
        self.play(FadeIn(hud), FadeIn(hud_text), run_time=0.8)
        self.wait(2.0)
