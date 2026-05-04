"""Post-process pandoc-converted Markdown for Claude readability.

Transforms applied:
1. Grid tables -> GFM pipe tables. Multi-line cell content is joined with
   `<br>`. The first row becomes the header (Word docs put labels there).
2. Word's "bold-as-heading" patterns are promoted to real headings:
   - `> **N. xxx**`              -> `## N. xxx`
   - `> **N.M xxx**` / `> **■**` -> `### xxx`
   - Standalone `**N. xxx**`     -> `## ...`
   - Standalone `**■ xxx**`      -> `### ...`
3. Leading run of bold-only paragraphs -> `# H1` plus plain subtitle text.
4. Bold inside table cells is stripped (the header row already conveys it).
5. Italic-only metadata lines (`*xxx*` standalone) are left as is when
   they look like meta (date / source); otherwise normalised.
6. Excess blank lines collapsed to a single one.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

BOLD_LINE = re.compile(r"^\*\*(.+)\*\*$")
QUOTED_BOLD_LINE = re.compile(r"^>\s*\*\*(.+?)\*\*\s*$")
QUOTED_EMPTY = re.compile(r"^>\s*$")
NUMBERED_HEADING = re.compile(r"^(\d+(?:\.\d+)*\.?)\s*(.+)$")
SUB_MARKER = re.compile(r"^[■◆●▼□◇▽]\s*(.+)$")
PIPE_ROW = re.compile(r"^\s*\|")
GRID_BORDER = re.compile(r"^\s*\+[-=+]+\+\s*$")
GRID_CONTENT = re.compile(r"^\s*\|")
BOLD_INLINE = re.compile(r"\*\*(.+?)\*\*")


# ---------------------------------------------------------------------------
# Grid table parsing


def split_pipe_row(content_line: str) -> list[str]:
    """Split a `| a | b | c |` content row into trimmed cell strings."""
    s = content_line.strip()
    parts = s.split("|")
    # leading and trailing parts are empty (chars before first/after last |)
    if parts and parts[0] == "":
        parts = parts[1:]
    if parts and parts[-1] == "":
        parts = parts[:-1]
    return [p.strip() for p in parts]


def grid_table_to_pipe(lines: list[str], start: int) -> tuple[list[str], int]:
    """Parse a grid table starting at lines[start]; return (pipe_table_lines, end_idx)."""
    rows: list[list[str]] = []  # each row is a list of cell strings
    header_row_count = 0
    n_cols: int | None = None
    current_row_buffers: list[list[str]] | None = None

    i = start
    # Skip the opening border
    if i < len(lines) and GRID_BORDER.match(lines[i]):
        i += 1

    while i < len(lines):
        ln = lines[i]
        if GRID_BORDER.match(ln):
            if current_row_buffers is not None:
                rows.append([_join_cell(buf) for buf in current_row_buffers])
                current_row_buffers = None
            if "=" in ln:
                header_row_count = len(rows)
            if i + 1 >= len(lines) or not GRID_CONTENT.match(lines[i + 1]):
                i += 1
                break
            i += 1
            continue
        if GRID_CONTENT.match(ln):
            cells = split_pipe_row(ln)
            if n_cols is None:
                n_cols = len(cells)
            if current_row_buffers is None:
                current_row_buffers = [[] for _ in range(n_cols)]
            # pad/truncate
            while len(cells) < n_cols:
                cells.append("")
            cells = cells[:n_cols]
            for j, c in enumerate(cells):
                current_row_buffers[j].append(c)
            i += 1
            continue
        break

    if n_cols is None:
        return [], i

    if not rows:
        return lines[start:i], i

    # Decide header
    if header_row_count == 0:
        header_row_count = 1  # default: first row is header

    header_cells = _merge_rows(rows[:header_row_count])
    body_rows = rows[header_row_count:]

    # If the would-be header row is entirely empty, treat the first body
    # row as the header (this matches how Claude/GitHub render tables — the
    # first row is presented as the header even when blank).
    if all(not h.strip() for h in header_cells) and body_rows:
        header_cells = body_rows[0]
        body_rows = body_rows[1:]

    # Strip bold from cells (table cells don't need emphasis since the
    # column itself is the label).
    header_cells = [_strip_bold(c) for c in header_cells]
    body_rows = [[_strip_bold(c) for c in row] for row in body_rows]

    out: list[str] = []
    out.append("| " + " | ".join(header_cells) + " |")
    out.append("|" + "|".join(["---"] * n_cols) + "|")
    for row in body_rows:
        # Pad row to n_cols
        row = row + [""] * (n_cols - len(row))
        out.append("| " + " | ".join(row[:n_cols]) + " |")
    return out, i


def _join_cell(buf: list[str]) -> str:
    """Join multi-line cell pieces with <br>, dropping empty lines."""
    pieces = [p.strip() for p in buf if p.strip()]
    return "<br>".join(pieces)


def _merge_rows(rows: list[list[str]]) -> list[str]:
    if not rows:
        return []
    if len(rows) == 1:
        return rows[0]
    n_cols = len(rows[0])
    merged = []
    for j in range(n_cols):
        parts = [r[j] for r in rows if j < len(r) and r[j].strip()]
        merged.append("<br>".join(parts))
    return merged


def _strip_bold(text: str) -> str:
    return BOLD_INLINE.sub(r"\1", text).strip()


# ---------------------------------------------------------------------------
# Bold-to-heading promotion


def classify_heading(text: str) -> str:
    text = text.strip()
    m = SUB_MARKER.match(text)
    if m:
        return f"### {m.group(1).strip()}"
    m = NUMBERED_HEADING.match(text)
    if m:
        prefix = m.group(1)
        # Sub-numbered (e.g. 1.1, 2.3) -> H3, top-level -> H2
        dots = prefix.rstrip(".").count(".")
        body = m.group(2).strip()
        if dots >= 1:
            return f"### {prefix} {body}"
        return f"## {prefix} {body}"
    return f"## {text}"


def promote_quoted_bold(lines: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(lines):
        m = QUOTED_BOLD_LINE.match(lines[i])
        if m:
            out.append(classify_heading(m.group(1)))
            i += 1
            while i < len(lines):
                m2 = QUOTED_BOLD_LINE.match(lines[i])
                if m2:
                    out.append(classify_heading(m2.group(1)))
                    i += 1
                    continue
                if QUOTED_EMPTY.match(lines[i]):
                    i += 1
                    continue
                break
            continue
        out.append(lines[i])
        i += 1
    return out


def promote_standalone_bold(lines: list[str], skip_until: int) -> list[str]:
    out: list[str] = []
    for idx, ln in enumerate(lines):
        if idx < skip_until:
            out.append(ln)
            continue
        s = ln.strip()
        m = BOLD_LINE.match(s)
        if m and not PIPE_ROW.match(ln):
            text = m.group(1).strip()
            if NUMBERED_HEADING.match(text) or SUB_MARKER.match(text):
                out.append(classify_heading(text))
                continue
        out.append(ln)
    return out


def join_multiline_bold(lines: list[str]) -> list[str]:
    """Join paragraphs whose bold span continues across hard line breaks
    (`...\\\n...`) — pandoc emits these for Word's soft line break inside
    a bold run. Result: a single `**xxx / yyy**` paragraph on one line."""
    out: list[str] = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("**") and ln.rstrip().endswith("\\") and not ln.rstrip(" \\").endswith("**"):
            # collect continuation lines
            buf = [ln.rstrip().rstrip("\\").rstrip()]
            j = i + 1
            while j < len(lines):
                nxt = lines[j]
                if nxt.rstrip().endswith("**"):
                    buf.append(nxt.rstrip())
                    out.append(" / ".join(buf))
                    i = j + 1
                    break
                if nxt.rstrip().endswith("\\"):
                    buf.append(nxt.rstrip().rstrip("\\").rstrip())
                    j += 1
                    continue
                # unexpected — bail out without joining
                out.append(ln)
                i += 1
                break
            else:
                out.append(ln)
                i += 1
            continue
        out.append(ln)
        i += 1
    return out


def handle_title_block(lines: list[str]) -> tuple[list[str], int]:
    bold_indices: list[int] = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue
        if BOLD_LINE.match(s):
            bold_indices.append(i)
            i += 1
            j = i
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j < len(lines) and BOLD_LINE.match(lines[j].strip()):
                i = j
                continue
            break
        break
    if not bold_indices:
        return lines, 0
    new_lines = list(lines)
    for n, idx in enumerate(bold_indices):
        text = BOLD_LINE.match(new_lines[idx].strip()).group(1).strip()
        new_lines[idx] = f"# {text}" if n == 0 else text
    return new_lines, bold_indices[-1] + 1


def collapse_blank_lines(lines: list[str]) -> list[str]:
    out: list[str] = []
    blank = 0
    for ln in lines:
        if ln.strip() == "":
            blank += 1
            if blank <= 1:
                out.append("")
        else:
            blank = 0
            out.append(ln)
    while out and out[-1] == "":
        out.pop()
    out.append("")
    return out


def convert_all_grid_tables(lines: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(lines):
        if GRID_BORDER.match(lines[i]):
            converted, end = grid_table_to_pipe(lines, i)
            if converted:
                out.extend(converted)
            i = end
            continue
        out.append(lines[i])
        i += 1
    return out


PIPE_SEP = re.compile(r"^\s*\|(\s*-+\s*\|)+\s*$")


def merge_consecutive_pipe_tables(lines: list[str]) -> list[str]:
    """Merge consecutive pipe tables with the same column count — pandoc
    sometimes splits a logical table into many single-row tables when the
    Word source had each row as a separate table object."""
    out: list[str] = []
    i = 0
    while i < len(lines):
        if PIPE_ROW.match(lines[i]) and i + 1 < len(lines) and PIPE_SEP.match(lines[i + 1]):
            # found a pipe table; collect it and look for a successor
            table: list[str] = []
            n_cols = lines[i].count("|") - 1
            # consume current table
            j = i
            while j < len(lines) and PIPE_ROW.match(lines[j]):
                table.append(lines[j])
                j += 1
            # peek for following tables of same shape
            while True:
                k = j
                while k < len(lines) and lines[k].strip() == "":
                    k += 1
                if (
                    k < len(lines)
                    and PIPE_ROW.match(lines[k])
                    and k + 1 < len(lines)
                    and PIPE_SEP.match(lines[k + 1])
                    and lines[k].count("|") - 1 == n_cols
                ):
                    # absorb this table's body rows (skip its header + separator)
                    table.append(lines[k])  # this is its single data row
                    j = k + 2  # skip past the separator
                    while j < len(lines) and PIPE_ROW.match(lines[j]):
                        table.append(lines[j])
                        j += 1
                else:
                    break
            out.extend(table)
            i = j
            continue
        out.append(lines[i])
        i += 1
    return out


def insert_blank_after_headings(lines: list[str]) -> list[str]:
    out: list[str] = []
    for i, ln in enumerate(lines):
        out.append(ln)
        if ln.startswith("#") and i + 1 < len(lines) and lines[i + 1].strip() != "":
            # Don't insert if next line is also a heading we just emitted in
            # an adjacent pair — that's intentional.
            if not lines[i + 1].startswith("#"):
                out.append("")
    return out


HEADING_LINE = re.compile(r"^(#+)\s+(.*)$")


def normalize_existing_headings(lines: list[str]) -> list[str]:
    """Strip bold wrappers inside heading lines and ensure each doc has
    exactly one H1. If multiple H1s exist (typical when Word's heading 1
    style was applied to every section), demote all body headings by one
    level so the hierarchy is preserved."""
    # Count H1s after the first.
    h1_count = 0
    for ln in lines:
        m = HEADING_LINE.match(ln)
        if m and len(m.group(1)) == 1:
            h1_count += 1
    demote_all = h1_count > 1

    seen_h1 = False
    out: list[str] = []
    for ln in lines:
        m = HEADING_LINE.match(ln)
        if not m:
            out.append(ln)
            continue
        level = len(m.group(1))
        body = m.group(2).strip()
        whole = BOLD_LINE.match(body)
        if whole:
            body = whole.group(1).strip()
        body = BOLD_INLINE.sub(r"\1", body)
        if demote_all:
            if level == 1 and not seen_h1:
                seen_h1 = True
                # keep first H1 as the title
            else:
                level = min(level + 1, 6)
        out.append(f"{'#' * level} {body}")
    return out


def process(text: str) -> str:
    lines = text.splitlines()
    lines = convert_all_grid_tables(lines)
    lines = merge_consecutive_pipe_tables(lines)
    lines = join_multiline_bold(lines)
    lines, title_end = handle_title_block(lines)
    lines = promote_quoted_bold(lines)
    lines = promote_standalone_bold(lines, skip_until=title_end)
    lines = normalize_existing_headings(lines)
    lines = insert_blank_after_headings(lines)
    lines = collapse_blank_lines(lines)
    return "\n".join(lines)


def main(paths: list[str]) -> None:
    for p in paths:
        path = Path(p)
        original = path.read_text(encoding="utf-8")
        cleaned = process(original)
        path.write_text(cleaned, encoding="utf-8")
        print(f"cleaned: {path}")


if __name__ == "__main__":
    main(sys.argv[1:])
