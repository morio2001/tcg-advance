-- Flatten table cells that contain multiple Para/Plain blocks into a
-- single Plain block with LineBreaks between them. This lets pandoc's
-- GFM writer fit them into pipe tables (otherwise it falls back to the
-- `[TABLE]` placeholder for any cell with >1 block).

function Cell(cell)
  if #cell.contents <= 1 then
    return cell
  end

  local inlines = {}
  for i, blk in ipairs(cell.contents) do
    if i > 1 then
      table.insert(inlines, pandoc.LineBreak())
    end
    if blk.t == 'Para' or blk.t == 'Plain' then
      for _, inl in ipairs(blk.content) do
        table.insert(inlines, inl)
      end
    elseif blk.t == 'BulletList' or blk.t == 'OrderedList' then
      -- Render list items as inline text separated by line breaks.
      for j, item in ipairs(blk.content) do
        if j > 1 or i > 1 then
          table.insert(inlines, pandoc.LineBreak())
        end
        table.insert(inlines, pandoc.Str('• '))
        for _, sub in ipairs(item) do
          if sub.t == 'Para' or sub.t == 'Plain' then
            for _, inl in ipairs(sub.content) do
              table.insert(inlines, inl)
            end
          end
        end
      end
    end
  end

  cell.contents = { pandoc.Plain(inlines) }
  return cell
end
