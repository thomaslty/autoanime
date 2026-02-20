import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Recursive XML tree explorer node.
 *
 * Props:
 *  nodeKey      - key name displayed (e.g. "title", "enclosure")
 *  data         - value at this node (string, number, object, array, null)
 *  path         - dot-notation path from item root
 *  depth        - indentation level (starts at 0)
 *  onSelect     - (path) => void  called when leaf node is clicked
 *  selectedPaths - Map of path -> fieldName for showing assignment badges
 *  isItemRoot   - whether this node is the root of the item (auto-expanded)
 */
export function XmlTreeNode({ nodeKey, data, path, depth, onSelect, selectedPaths, isItemRoot }) {
  const [expanded, setExpanded] = useState(depth === 0 || isItemRoot)

  // Normalise missing maps
  const safeSelectedPaths = selectedPaths || new Map()

  // ---- Classify the node ------------------------------------------------

  const isNull = data === null || data === undefined

  // CDATA node: fast-xml-parser produces { '#cdata': '...' }
  const isCdata = !isNull && typeof data === 'object' && !Array.isArray(data) && '#cdata' in data

  // Text node: fast-xml-parser produces { '#text': '...' }
  const isTextNode = !isNull && typeof data === 'object' && !Array.isArray(data) && '#text' in data

  const isLeaf = isNull || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || isCdata || isTextNode
  const isArray = Array.isArray(data)
  const isObject = !isNull && !isLeaf && !isArray && typeof data === 'object'

  // Attribute keys start with "@_"
  const isAttr = nodeKey && nodeKey.startsWith('@_')

  // ---- Derived display values -------------------------------------------

  const getLeafDisplay = () => {
    if (isNull) return 'null'
    if (isCdata) return String(data['#cdata'])
    if (isTextNode) return String(data['#text'])
    return String(data)
  }

  const truncate = (str, max = 60) => str.length > max ? str.slice(0, max) + '…' : str

  // ---- Render helpers ---------------------------------------------------

  const indent = { paddingLeft: depth * 16 }

  const assignedFieldName = safeSelectedPaths.get(path)

  // ---- Array node -------------------------------------------------------
  if (isArray) {
    const firstItem = data[0]
    return (
      <div>
        <div
          className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-muted/50 rounded text-sm"
          style={indent}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded
            ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
          <span className="font-medium text-foreground">{nodeKey}</span>
          <span className="text-xs text-muted-foreground ml-1">[array: {data.length} items]</span>
          {assignedFieldName && (
            <Badge variant="secondary" className="ml-1 text-xs py-0 h-4">{assignedFieldName}</Badge>
          )}
        </div>
        {expanded && firstItem !== undefined && (
          <div>
            <div
              className="flex items-center gap-1 py-0.5 text-xs text-muted-foreground italic"
              style={{ paddingLeft: (depth + 1) * 16 }}
            >
              [sample item]
            </div>
            <XmlTreeNode
              nodeKey="[0]"
              data={firstItem}
              path={path}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPaths={safeSelectedPaths}
              isItemRoot={false}
            />
          </div>
        )}
      </div>
    )
  }

  // ---- Object node ------------------------------------------------------
  if (isObject) {
    const keys = Object.keys(data)
    return (
      <div>
        <div
          className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-muted/50 rounded text-sm"
          style={indent}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded
            ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
          <span className="font-medium text-foreground">{nodeKey}</span>
          <span className="text-xs text-muted-foreground ml-1">[object]</span>
          {assignedFieldName && (
            <Badge variant="secondary" className="ml-1 text-xs py-0 h-4">{assignedFieldName}</Badge>
          )}
        </div>
        {expanded && (
          <div>
            {keys.map(k => {
              const childPath = path ? `${path}.${k}` : k
              return (
                <XmlTreeNode
                  key={k}
                  nodeKey={k}
                  data={data[k]}
                  path={childPath}
                  depth={depth + 1}
                  onSelect={onSelect}
                  selectedPaths={safeSelectedPaths}
                  isItemRoot={false}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ---- Leaf node --------------------------------------------------------
  const displayValue = getLeafDisplay()
  const isClickable = !!onSelect

  return (
    <div
      className={[
        "flex items-center gap-1 py-0.5 rounded text-sm",
        isClickable ? "cursor-pointer hover:bg-accent/60" : "",
      ].join(' ')}
      style={indent}
      onClick={isClickable ? () => onSelect(path) : undefined}
    >
      {/* Spacer to align with expandable nodes' chevron */}
      <span className="size-3.5 shrink-0" />
      <span className="font-medium text-foreground">{nodeKey}</span>
      {isAttr && (
        <Badge variant="outline" className="text-xs py-0 h-4 ml-0.5">attr</Badge>
      )}
      <span className="text-xs text-muted-foreground truncate ml-1 max-w-xs">{truncate(displayValue)}</span>
      {assignedFieldName && (
        <Badge variant="default" className="ml-1 text-xs py-0 h-4 shrink-0">{assignedFieldName}</Badge>
      )}
    </div>
  )
}
