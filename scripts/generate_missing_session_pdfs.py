#!/usr/bin/env python3

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SESSIONS_TS = os.path.join(ROOT, "src", "data", "sessions.ts")
OUT_DIR = os.path.join(ROOT, "public", "resources")


@dataclass
class Resource:
  title: str
  url: str
  description: Optional[str] = None


@dataclass
class Session:
  session_number: int
  title: str
  subtitle: Optional[str]
  date_str: Optional[str]
  block_number: Optional[int]
  block_title: Optional[str]
  objectives: List[str]
  grammar_title: Optional[str]
  grammar_rules: List[str]
  vocab_title: Optional[str]
  vocab_terms: List[str]
  resources: List[Resource]


def _strip_quotes(s: str) -> str:
  s = s.strip()
  if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
    return s[1:-1]
  return s


def _extract_string_field(obj: str, field: str) -> Optional[str]:
  # single-quoted first, then double-quoted
  m = re.search(rf"{re.escape(field)}\s*:\s*'([^']*)'", obj)
  if m:
    return m.group(1)
  m = re.search(rf'{re.escape(field)}\s*:\s*"([^"]*)"', obj)
  if m:
    return m.group(1)
  return None


def _extract_int_field(obj: str, field: str) -> Optional[int]:
  m = re.search(rf"{re.escape(field)}\s*:\s*(\d+)", obj)
  return int(m.group(1)) if m else None


def _extract_date_field(obj: str) -> Optional[str]:
  m = re.search(r"date\s*:\s*new\s+Date\(\s*'(\d{4}-\d{2}-\d{2})'\s*\)", obj)
  return m.group(1) if m else None


def _extract_list_block(obj: str, field: str) -> Optional[str]:
  # Find `field: [` then return the bracket-matched content (inside brackets)
  idx = obj.find(field)
  if idx == -1:
    return None
  idx = obj.find("[", idx)
  if idx == -1:
    return None

  # Start just after the opening '[' and return once we close it.
  i = idx + 1
  depth = 1
  in_str: Optional[str] = None
  esc = False
  in_line_comment = False
  in_block_comment = False
  start = idx + 1
  while i < len(obj):
    ch = obj[i]
    nxt = obj[i + 1] if i + 1 < len(obj) else ""

    if in_line_comment:
      if ch == "\n":
        in_line_comment = False
      i += 1
      continue
    if in_block_comment:
      if ch == "*" and nxt == "/":
        in_block_comment = False
        i += 2
        continue
      i += 1
      continue

    if in_str:
      if esc:
        esc = False
      elif ch == "\\":
        esc = True
      elif ch == in_str:
        in_str = None
      i += 1
      continue

    # comments
    if ch == "/" and nxt == "/":
      in_line_comment = True
      i += 2
      continue
    if ch == "/" and nxt == "*":
      in_block_comment = True
      i += 2
      continue

    if ch in ("'", '"', "`"):
      in_str = ch
      i += 1
      continue

    if ch == "[":
      depth += 1
    elif ch == "]":
      depth -= 1
      if depth == 0:
        return obj[start:i]
    i += 1
  return None


def _parse_resources(block: str) -> List[Resource]:
  if not block:
    return []
  resources: List[Resource] = []
  # naive object matcher for resources list entries
  for m in re.finditer(r"\{[^{}]*?title\s*:\s*(['\"])(.*?)\1[^{}]*?url\s*:\s*(['\"])(/resources/.*?\.pdf)\3[^{}]*?\}", block, re.DOTALL):
    title = m.group(2).strip()
    url = m.group(4).strip()
    desc = None
    md = re.search(r"description\s*:\s*(['\"])(.*?)\1", m.group(0), re.DOTALL)
    if md:
      desc = md.group(2).strip()
    resources.append(Resource(title=title, url=url, description=desc))
  return resources


def _parse_session(obj: str) -> Optional[Session]:
  sn = _extract_int_field(obj, "sessionNumber")
  if sn is None:
    return None

  title = _extract_string_field(obj, "title") or f"Sesión {sn}"
  subtitle = _extract_string_field(obj, "subtitle")
  date_str = _extract_date_field(obj)
  block_number = _extract_int_field(obj, "blockNumber")
  block_title = _extract_string_field(obj, "blockTitle")

  objectives_block = _extract_list_block(obj, "objectives")
  objectives = []
  if objectives_block:
    objectives = [t.strip() for t in re.findall(r"text\s*:\s*'([^']+)'", objectives_block)]
    if not objectives:
      objectives = [t.strip() for t in re.findall(r'text\s*:\s*"([^"]+)"', objectives_block)]

  grammar_block = obj[obj.find("grammarContent"):] if "grammarContent" in obj else ""
  grammar_title = _extract_string_field(grammar_block, "title") if grammar_block else None
  rules_block = _extract_list_block(grammar_block, "rules") if grammar_block else None
  grammar_rules: List[str] = []
  if rules_block:
    grammar_rules = [t.strip() for t in re.findall(r"'([^']+)'", rules_block)]

  vocab_block = obj[obj.find("vocabularyContent"):] if "vocabularyContent" in obj else ""
  vocab_title = _extract_string_field(vocab_block, "title") if vocab_block else None
  vocab_items_block = _extract_list_block(vocab_block, "items") if vocab_block else None
  vocab_terms: List[str] = []
  if vocab_items_block:
    vocab_terms = [t.strip() for t in re.findall(r"term\s*:\s*'([^']+)'", vocab_items_block)]
    if not vocab_terms:
      vocab_terms = [t.strip() for t in re.findall(r'term\s*:\s*"([^"]+)"', vocab_items_block)]

  resources_block = _extract_list_block(obj, "resources")
  resources = _parse_resources(resources_block or "")

  return Session(
    session_number=sn,
    title=title,
    subtitle=subtitle,
    date_str=date_str,
    block_number=block_number,
    block_title=block_title,
    objectives=objectives,
    grammar_title=grammar_title,
    grammar_rules=grammar_rules,
    vocab_title=vocab_title,
    vocab_terms=vocab_terms,
    resources=resources,
  )


def parse_sessions_ts(path: str) -> List[Session]:
  text = open(path, "r", encoding="utf-8").read()

  # Extract top-level objects inside the sessionsData array via brace matching.
  anchor = text.find("sessionsData")
  if anchor == -1:
    raise RuntimeError("No se encontro sessionsData en sessions.ts")
  # Beware: `SessionData[]` contains `[]` before the actual array literal.
  eq = text.find("=", anchor)
  if eq == -1:
    raise RuntimeError("No se encontro '=' al declarar sessionsData")
  arr_start = text.find("[", eq)
  if arr_start == -1:
    raise RuntimeError("No se encontro el inicio del array literal de sessionsData")

  sessions: List[Session] = []
  i = arr_start + 1
  in_str: Optional[str] = None
  esc = False
  in_line_comment = False
  in_block_comment = False
  depth = 0
  obj_start = -1

  while i < len(text):
    ch = text[i]
    nxt = text[i + 1] if i + 1 < len(text) else ""

    if in_line_comment:
      if ch == "\n":
        in_line_comment = False
      i += 1
      continue
    if in_block_comment:
      if ch == "*" and nxt == "/":
        in_block_comment = False
        i += 2
        continue
      i += 1
      continue

    if in_str:
      if esc:
        esc = False
      elif ch == "\\":
        esc = True
      elif ch == in_str:
        in_str = None
      i += 1
      continue

    if ch == "/" and nxt == "/":
      in_line_comment = True
      i += 2
      continue
    if ch == "/" and nxt == "*":
      in_block_comment = True
      i += 2
      continue

    if ch in ("'", '"', "`"):
      in_str = ch
      i += 1
      continue

    if ch == "{":
      if depth == 0:
        obj_start = i
      depth += 1
    elif ch == "}":
      depth -= 1
      if depth == 0 and obj_start != -1:
        obj_txt = text[obj_start : i + 1]
        s = _parse_session(obj_txt)
        if s:
          sessions.append(s)
        obj_start = -1
    elif ch == "]" and depth == 0:
      break

    i += 1

  return sessions


def build_pdf(out_path: str, resource_title: str, session: Session, used_in: List[int]) -> None:
  styles = getSampleStyleSheet()

  h1 = ParagraphStyle(
    "H1",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#111827"),
    spaceAfter=8,
  )
  h2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12.5,
    leading=15,
    textColor=colors.HexColor("#111827"),
    spaceBefore=10,
    spaceAfter=6,
  )
  p = ParagraphStyle(
    "P",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=14,
    textColor=colors.HexColor("#111827"),
  )
  small = ParagraphStyle(
    "Small",
    parent=p,
    fontSize=9.5,
    leading=12,
    textColor=colors.HexColor("#374151"),
  )

  doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=1.6 * cm,
    rightMargin=1.6 * cm,
    topMargin=1.5 * cm,
    bottomMargin=1.5 * cm,
    title=resource_title,
    author="oral7",
  )

  story: List[object] = []
  story.append(Paragraph(resource_title, h1))

  meta_bits = [f"Sesión {session.session_number}: {session.title}"]
  if session.date_str:
    meta_bits.append(f"Fecha: {session.date_str}")
  if session.block_number and session.block_title:
    meta_bits.append(f"Bloque {session.block_number}: {session.block_title}")
  if len(used_in) > 1:
    meta_bits.append("Usado en sesiones: " + ", ".join(map(str, used_in)))
  meta_bits.append(f"Actualizado: {date.today().isoformat()}")
  story.append(Paragraph(" · ".join(meta_bits), small))
  story.append(Spacer(1, 10))

  if session.subtitle:
    story.append(Paragraph(f"<b>Subtítulo:</b> {session.subtitle}", p))

  if session.objectives:
    story.append(Paragraph("Objetivos", h2))
    bullets = "<br/>".join([f"• {o}" for o in session.objectives[:8]])
    story.append(Paragraph(bullets, p))

  # Grammar quick notes
  if session.grammar_title or session.grammar_rules:
    story.append(Paragraph("Gramática (resumen)", h2))
    if session.grammar_title:
      story.append(Paragraph(f"<b>{session.grammar_title}</b>", p))
    if session.grammar_rules:
      rules = "<br/>".join([f"• {r}" for r in session.grammar_rules[:6]])
      story.append(Paragraph(rules, p))

  # Vocab quick list
  if session.vocab_title or session.vocab_terms:
    story.append(Paragraph("Vocabulario (selección)", h2))
    if session.vocab_title:
      story.append(Paragraph(f"<b>{session.vocab_title}</b>", p))
    if session.vocab_terms:
      terms = ", ".join(session.vocab_terms[:18])
      story.append(Paragraph(terms, p))

  # Footer box: how to use
  story.append(Spacer(1, 12))
  tip = (
    "Sugerencia de uso: imprime este PDF o tenlo abierto durante la sesión. "
    "Marca 3 expresiones/ideas que quieras usar hoy y úsalas al menos una vez."
  )
  box = Table([[Paragraph(tip, small)]], colWidths=[16.8 * cm])
  box.setStyle(
    TableStyle(
      [
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#d1d5db")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f9fafb")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
      ]
    )
  )
  story.append(box)

  doc.build(story)


def main() -> int:
  os.makedirs(OUT_DIR, exist_ok=True)
  sessions = parse_sessions_ts(SESSIONS_TS)

  # Map resource url -> (title, sessions referencing)
  url_to_title: Dict[str, str] = {}
  url_to_sessions: Dict[str, List[int]] = {}
  url_to_primary_session: Dict[str, Session] = {}

  for s in sessions:
    for r in s.resources:
      if not r.url.startswith("/resources/") or not r.url.endswith(".pdf"):
        continue
      url_to_title.setdefault(r.url, r.title)
      url_to_sessions.setdefault(r.url, []).append(s.session_number)
      # keep the earliest session as the primary metadata source
      if r.url not in url_to_primary_session or s.session_number < url_to_primary_session[r.url].session_number:
        url_to_primary_session[r.url] = s

  created = 0
  skipped = 0
  for url, title in sorted(url_to_title.items(), key=lambda kv: kv[0]):
    fname = url.removeprefix("/resources/")
    out_path = os.path.join(OUT_DIR, fname)
    if os.path.exists(out_path):
      skipped += 1
      continue
    primary = url_to_primary_session[url]
    used_in = sorted(set(url_to_sessions.get(url, [])))
    build_pdf(out_path, title, primary, used_in)
    created += 1

  print(f"Created: {created}, skipped(existing): {skipped}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
